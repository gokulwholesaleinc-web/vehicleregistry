import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite";
import { applySecurity } from "./http/security";
import { logMiddleware } from "./http/logging";
import { validateEnvironment } from "./security/environment";
import { auditRequestContext, auditAutoInstrumentation } from "./audit/auditLogger";

// Validate environment before starting
validateEnvironment();

const app = express();

// Apply security first (includes environment-validated settings)
applySecurity(app);

// Add audit context middleware (captures request metadata)
// Temporarily disabled until audit_events table is created
// app.use(auditRequestContext);

// Add request logging
app.use(logMiddleware);

// Add audit auto-instrumentation (logs mutating operations)
// Temporarily disabled until audit_events table is created
// app.use(auditAutoInstrumentation);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// Force JSON content type for all API responses
app.use("/api", (_req, res, next) => {
  res.type("application/json");
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Health check endpoint - shows API is working
  app.get("/", (_req, res) => {
    res.json({ 
      service: "vintagegarage-api", 
      status: "ok",
      message: "VINtage Garage Registry API Server" 
    });
  });

  // 404 handler for non-API routes
  app.use((req, res, next) => {
    if (!req.path.startsWith("/api") && req.path !== "/") {
      return res.status(404).json({ 
        error: "Not Found", 
        message: "API-only server - no static files served",
        hint: "Use /api/* endpoints for API calls"
      });
    }
    next();
  });

  // Global error handler - always return JSON
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
      error: status === 404 ? "Not Found" : "Internal Server Error",
      message: err.message || "An error occurred",
      details: process.env.NODE_ENV === "development" ? String(err) : undefined,
    });
  });

  // ALWAYS serve the API on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // This serves the API only - frontend deployed separately.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
