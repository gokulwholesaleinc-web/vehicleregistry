import { Request, Response, NextFunction } from "express";
import { verifyAccess } from "./jwt";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  
  const claims = verifyAccess(token);
  if (!claims) return res.status(401).json({ error: "Invalid token" });
  
  (req as any).user = claims;
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : undefined;
  
  if (token) {
    const claims = verifyAccess(token);
    if (claims) {
      (req as any).user = claims;
    }
  }
  
  next();
}