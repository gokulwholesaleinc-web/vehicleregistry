import type { Express } from 'express';
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
  const allowlist = buildAllowlist();
  
  app.use(cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // same-origin / curl
      return cb(null, allowlist.includes(origin));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 86400,
  }));
  
  // Preflight for all routes
  app.options('*', cors());
}