import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';

function buildAllowlist() {
  const list = new Set<string>();
  if (process.env.FRONTEND_BASE) list.add(process.env.FRONTEND_BASE);
  // Replit preview wildcard (http + https): allow same-origin subdomains if needed
  if (process.env.REPLIT_HOST) {
    list.add(`https://${process.env.REPLIT_HOST}`);
    list.add(`http://${process.env.REPLIT_HOST}`);
  }
  // Local dev
  list.add('http://localhost:5173');
  list.add('http://127.0.0.1:5173');
  list.add('http://localhost:5000');
  list.add('http://127.0.0.1:5000');
  return Array.from(list);
}

export function applySecurity(app: Express) {
  // Configure Helmet for development - more permissive CSP
  const isDev = process.env.NODE_ENV === 'development';
  
  app.use(helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: isDev ? {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com", "https://replit.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "wss:", "ws:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    } : true // Use default strict CSP in production
  }));
  const allowlist = buildAllowlist();
  
  app.use(cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // same-origin / curl
      return cb(null, allowlist.includes(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400,
  }));
  
  // Preflight for all routes
  app.options('*', cors());
}