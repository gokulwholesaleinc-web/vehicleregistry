import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { signAccess } from "./jwt";
import { z } from "zod";
import { sendSuccess, sendError, sendValidationError, sendUnauthorized } from "../lib/response-helpers";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const scryptAsync = promisify(scrypt);

export const googleAuthRouter = Router();

// Password hashing utilities
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Username/password registration endpoint
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

googleAuthRouter.post("/auth/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = registerSchema.parse(req.body);
    
    const normalizedEmail = email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({ 
      where: (u, { eq }) => eq(u.email, normalizedEmail) 
    });
    
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate unique username
    const usernameBase = email.split("@")[0].replace(/[^a-z0-9_]/gi, "").slice(0, 20) || "user";
    const username = await ensureUniqueUsername(usernameBase);
    
    // Create user
    const inserted = await db.insert(users).values({ 
      email: normalizedEmail, 
      firstName,
      lastName,
      username,
      passwordHash: hashedPassword,
      isPublic: true,
      role: "user",
      isActive: true,
      lastLoginAt: new Date(),
    }).returning();
    
    const user = inserted[0];
    const token = signAccess({ id: user.id, email: user.email });
    
    return res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role
      } 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input data", details: error.errors });
    }
    console.error("/auth/register error", error);
    return res.status(500).json({ error: "Registration failed" });
  }
});

// Username/password login endpoint
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

googleAuthRouter.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    const normalizedEmail = email.toLowerCase();
    
    // Find user
    const user = await db.query.users.findFirst({ 
      where: (u, { eq }) => eq(u.email, normalizedEmail) 
    });
    
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Verify password
    const isValidPassword = await comparePasswords(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));
    
    const token = signAccess({ id: user.id, email: user.email });
    
    return res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role
      } 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid input data" });
    }
    console.error("/auth/login error", error);
    return res.status(500).json({ error: "Login failed" });
  }
});

// Client posts { idToken }
googleAuthRouter.post("/auth/google", async (req, res) => {
  const { idToken } = req.body as { idToken?: string };
  if (!idToken) return res.status(400).json({ error: "Missing idToken" });

  try {
    const ticket = await googleClient.verifyIdToken({ 
      idToken, 
      audience: process.env.GOOGLE_CLIENT_ID 
    });
    const payload = ticket.getPayload();
    if (!payload?.email) return res.status(401).json({ error: "Invalid Google token" });

    const email = payload.email.toLowerCase();
    const firstName = payload.given_name || "";
    const lastName = payload.family_name || "";
    const profileImageUrl = payload.picture || "";

    let user = await db.query.users.findFirst({ 
      where: (u, { eq }) => eq(u.email, email) 
    });

    if (!user) {
      const usernameBase = email.split("@")[0].replace(/[^a-z0-9_]/gi, "").slice(0, 20) || "user";
      const username = await ensureUniqueUsername(usernameBase);
      
      const inserted = await db.insert(users).values({ 
        email, 
        firstName,
        lastName,
        profileImageUrl,
        username,
        isPublic: true,
        role: "user",
        isActive: true,
        lastLoginAt: new Date(),
      }).returning();
      user = inserted[0];
    } else {
      // Update last login and profile info
      await db.update(users)
        .set({ 
          lastLoginAt: new Date(),
          profileImageUrl: profileImageUrl || user.profileImageUrl || null,
          firstName: firstName || user.firstName || null,
          lastName: lastName || user.lastName || null,
        })
        .where(eq(users.id, user.id));
    }

    const token = signAccess({ id: user.id, email: user.email });
    return res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role: user.role
      } 
    });
  } catch (e) {
    console.error("/auth/google error", e);
    return res.status(401).json({ error: "Google verification failed" });
  }
});

async function ensureUniqueUsername(base: string) {
  let username = base;
  for (let i = 0; i < 50; i++) {
    const found = await db.query.users.findFirst({ 
      where: (u, { eq }) => eq(u.username, username) 
    });
    if (!found) return username;
    username = `${base}${Math.floor(Math.random() * 1000)}`;
  }
  return `${base}${Date.now().toString().slice(-4)}`;
}

// Traditional username/password registration
googleAuthRouter.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = z.object({
      username: z.string().min(3).max(50),
      email: z.string().email(),
      password: z.string().min(6),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
    }).parse(req.body);

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (u, { or, eq }) => or(eq(u.email, email.toLowerCase()), eq(u.username, username))
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    const hashedPassword = await hashPassword(password);
    
    const inserted = await db.insert(users).values({
      email: email.toLowerCase(),
      username,
      firstName,
      lastName,
      password: hashedPassword,
      isPublic: true,
      role: "user",
      isActive: true,
      lastLoginAt: new Date(),
    }).returning();

    const user = inserted[0];
    const token = signAccess({ id: user.id, email: user.email });
    
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (e) {
    console.error("/auth/register error", e);
    return res.status(400).json({ error: "Registration failed" });
  }
});

// Traditional username/password login
googleAuthRouter.post("/auth/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = z.object({
      usernameOrEmail: z.string().min(1),
      password: z.string().min(1),
    }).parse(req.body);

    // Find user by username or email
    const user = await db.query.users.findFirst({
      where: (u, { or, eq }) => or(
        eq(u.email, usernameOrEmail.toLowerCase()),
        eq(u.username, usernameOrEmail)
      )
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await comparePasswords(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Update last login
    await db.update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    const token = signAccess({ id: user.id, email: user.email });
    
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (e) {
    console.error("/auth/login error", e);
    return res.status(400).json({ error: "Login failed" });
  }
});