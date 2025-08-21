import { Router } from "express";
import argon2 from "argon2";
import { nanoid } from "nanoid";
import { db } from "../db";
import { users, passwordResets } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { RegisterInput, LoginInput, ResetStartInput, ResetFinishInput } from "../../shared/authSchemas";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

const router = Router();

// JWT token generation
function signAccess(user: any) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email,
      username: user.username,
      provider: 'local'
    }, 
    process.env.JWT_SECRET || process.env.SESSION_SECRET!, 
    { expiresIn: "24h" }
  );
}

// REGISTER - Creates new user with email/password
router.post("/register", async (req, res) => {
  try {
    const body = RegisterInput.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ 
        ok: false, 
        error: { message: "Invalid input", details: body.error.flatten() }
      });
    }

    const { email, password, username, firstName, lastName } = body.data;
    
    // Check if email already exists
    const existingEmail = await storage.getUserByEmail(email.toLowerCase());
    if (existingEmail) {
      return res.status(409).json({ 
        ok: false, 
        error: { message: "Email already registered" } 
      });
    }

    // Check if username already exists
    const existingUsername = await storage.getUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ 
        ok: false, 
        error: { message: "Username already taken" } 
      });
    }

    // Hash password
    const hash = await argon2.hash(password);
    
    // Create user
    const newUser = await storage.upsertUser({
      email: email.toLowerCase(),
      username,
      password: hash,
      firstName,
      lastName,
      isActive: true,
    });

    // Generate JWT token
    const token = signAccess(newUser);
    
    // Set user session for unified auth
    req.login(newUser, (err) => {
      if (err) {
        console.error("Session login error:", err);
      }
    });

    res.json({ 
      ok: true, 
      token, 
      user: { 
        id: newUser.id, 
        email: newUser.email, 
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role
      } 
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      ok: false, 
      error: { message: "Registration failed" } 
    });
  }
});

// LOGIN - Authenticates existing user
router.post("/login", async (req, res) => {
  try {
    const body = LoginInput.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ 
        ok: false, 
        error: { message: "Invalid input", details: body.error.flatten() }
      });
    }

    const { email, password } = body.data;
    
    // Find user by email or username (case-insensitive)
    let user = await storage.getUserByEmail(email.toLowerCase());
    if (!user) {
      // Try to find by username if email lookup failed (case-insensitive)
      user = await storage.getUserByUsername(email.toLowerCase());
    }
    if (!user || !user.password) {
      return res.status(401).json({ 
        ok: false, 
        error: { message: "Invalid credentials" } 
      });
    }

    // Verify password
    const isValidPassword = await argon2.verify(user.password, password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        ok: false, 
        error: { message: "Invalid credentials" } 
      });
    }

    // Update last login
    await storage.updateUserLastLogin(user.id);

    // Generate JWT token
    const token = signAccess(user);
    
    // Set user session for unified auth
    req.login(user, (err) => {
      if (err) {
        console.error("Session login error:", err);
      }
    });

    res.json({ 
      ok: true, 
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
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      ok: false, 
      error: { message: "Login failed" } 
    });
  }
});

// START RESET - Initiates password reset process
router.post("/reset/start", async (req, res) => {
  try {
    const body = ResetStartInput.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ 
        ok: false, 
        error: { message: "Invalid input", details: body.error.flatten() }
      });
    }

    const email = body.data.email.toLowerCase();
    const user = await storage.getUserByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ ok: true, message: "If email exists, reset link was sent" });
    }

    // Generate reset token
    const token = nanoid(40);
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutes

    // Save reset token
    await db.insert(passwordResets).values({
      userId: user.id,
      token,
      expiresAt: expires,
    });

    // TODO: Send email with reset link
    // For now, log the reset link
    const resetLink = `${process.env.FRONTEND_BASE || 'http://localhost:5173'}/reset?token=${token}`;
    console.log(`[RESET] Password reset link for ${email}: ${resetLink}`);

    res.json({ 
      ok: true, 
      message: "If email exists, reset link was sent",
      // Remove this in production - only for development
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
    });
    
  } catch (error) {
    console.error("Password reset start error:", error);
    res.status(500).json({ 
      ok: false, 
      error: { message: "Reset request failed" } 
    });
  }
});

// FINISH RESET - Completes password reset with token
router.post("/reset/finish", async (req, res) => {
  try {
    const body = ResetFinishInput.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ 
        ok: false, 
        error: { message: "Invalid input", details: body.error.flatten() }
      });
    }

    const { token, password } = body.data;

    // Find valid reset token
    const [resetRecord] = await db
      .select()
      .from(passwordResets)
      .where(eq(passwordResets.token, token));

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ 
        ok: false, 
        error: { message: "Invalid or expired token" } 
      });
    }

    // Hash new password
    const hash = await argon2.hash(password);

    // Update user password
    await db
      .update(users)
      .set({ password: hash, updatedAt: new Date() })
      .where(eq(users.id, resetRecord.userId));

    // Delete used token
    await db
      .delete(passwordResets)
      .where(eq(passwordResets.id, resetRecord.id));

    res.json({ 
      ok: true, 
      message: "Password updated successfully" 
    });
    
  } catch (error) {
    console.error("Password reset finish error:", error);
    res.status(500).json({ 
      ok: false, 
      error: { message: "Password reset failed" } 
    });
  }
});

export default router;