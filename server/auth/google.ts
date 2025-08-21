import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { signAccess } from "./jwt";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthRouter = Router();

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