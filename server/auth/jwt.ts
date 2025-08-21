import jwt from "jsonwebtoken";

type Claims = { id: string; email: string };

export function signAccess(claims: Claims) {
  return jwt.sign(claims, process.env.JWT_SECRET!, { expiresIn: "1h" });
}

export function verifyAccess(token: string): Claims | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as Claims;
  } catch {
    return null;
  }
}