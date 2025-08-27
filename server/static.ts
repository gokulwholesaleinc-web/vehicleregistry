import fs from "node:fs";
import path from "node:path";
import express from "express";
import type { Express, Request, Response } from "express";

function firstExisting(paths: string[]) {
  for (const p of paths) if (fs.existsSync(p)) return p;
  return null;
}

export function mountStatic(app: Express) {
  const candidates = [
    path.resolve(process.cwd(), "client", "dist"),
    path.resolve(import.meta.dirname, "../client/dist"),
    path.resolve(import.meta.dirname, "../../client/dist"),
    path.resolve(process.cwd(), "dist/public"), // our current build output
  ];
  const dist = firstExisting(candidates);

  // Debug endpoint either way
  app.get("/__debug/static", (_req: Request, res: Response) => {
    res.json({
      cwd: process.cwd(),
      dirname: import.meta.dirname,
      candidates,
      distExists: Boolean(dist),
      resolvedDist: dist,
      timestamp: new Date().toISOString(),
    });
  });

  if (!dist) {
    // Friendly JSON until the client is built
    app.get(["/", "/dashboard", "/vehicles", "/vehicles/:id", "/maintenance", "/modifications", "/community", "/showcase", "/profile", "/notifications", "/admin", "/signin", "/register"], (_req, res) => {
      res.status(500).json({
        ok: false,
        error: {
          message:
            "Client build not found. Run `npm run build` to build the client so dist/ exists on the server.",
        },
        debug: "Check /__debug/static for path resolution details",
      });
    });
    return;
  }

  console.log(`✅ Static files mounted from: ${dist}`);

  // Serve static files with long-term caching
  app.use(
    express.static(dist, {
      index: false,
      maxAge: "1y",
      setHeaders(res, filePath) {
        // Cache JS/CSS assets aggressively, HTML more conservatively  
        if (filePath.match(/\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else {
          res.setHeader("Cache-Control", "public, max-age=3600");
        }
      },
    })
  );

  // Optional: explicit favicon handling to silence warnings
  app.get("/favicon.ico", (_req, res) => {
    const faviconPath = path.join(dist, "favicon.ico");
    if (fs.existsSync(faviconPath)) {
      res.sendFile(faviconPath);
    } else {
      res.status(404).end();
    }
  });

  // SPA fallback for client-side routing - catch all non-API routes
  app.get([
    "/", 
    "/dashboard", 
    "/vehicles", 
    "/vehicles/:id", 
    "/maintenance", 
    "/modifications", 
    "/community", 
    "/showcase", 
    "/profile", 
    "/notifications", 
    "/admin", 
    "/admin/:path*",
    "/signin", 
    "/register", 
    "/privacy-policy",
    "/*"
  ], (req, res, next) => {
    // Skip API routes - let them 404 naturally
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    const indexPath = path.join(dist, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(500).json({
        ok: false,
        error: { message: "index.html not found in client build" },
      });
    }
  });
}