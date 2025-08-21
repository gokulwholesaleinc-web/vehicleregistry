import jwt from "jsonwebtoken";

type Claims = { 
  id: string; 
  email: string; 
  username: string; 
  provider: string; 
  iat?: number; 
  exp?: number; 
};

export function signAccess(claims: Omit<Claims, 'iat' | 'exp'>) {
  return jwt.sign(claims, process.env.JWT_SECRET!, { expiresIn: "1h" });
}

export function verifyAccess(token: string): Claims | null {
  try {
    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET!;
    return jwt.verify(token, secret) as Claims;
  } catch (err) {
    console.log("JWT verification failed in verifyAccess:", err);
    return null;
  }
}