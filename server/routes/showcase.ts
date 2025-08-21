import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { likes, follows, comments, vehicles, users } from "@shared/schema";
import { requireAuth } from "../auth/middleware";
import { and, eq, desc, count } from "drizzle-orm";

export const showcaseRouter = Router();

// Like a public car
showcaseRouter.post("/:vin/like", requireAuth, async (req, res) => {
  try {
    const { vin } = req.params;
    const userId = (req as any).user.id;
    
    const schema = z.object({
      vin: z.string().length(17),
    });
    
    schema.parse({ vin });

    // Check if already liked
    const existing = await db.query.likes.findFirst({
      where: (l, { and, eq }) => and(eq(l.vin, vin), eq(l.userId, userId))
    });

    if (!existing) {
      await db.insert(likes).values({ vin, userId });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Like error:", error);
    res.status(400).json({ error: "Failed to like vehicle" });
  }
});

// Unlike a public car
showcaseRouter.delete("/:vin/like", requireAuth, async (req, res) => {
  try {
    const { vin } = req.params;
    const userId = (req as any).user.id;
    
    await db.delete(likes).where(
      and(eq(likes.vin, vin), eq(likes.userId, userId))
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Unlike error:", error);
    res.status(400).json({ error: "Failed to unlike vehicle" });
  }
});

// Follow a car
showcaseRouter.post("/:vin/follow", requireAuth, async (req, res) => {
  try {
    const { vin } = req.params;
    const userId = (req as any).user.id;
    
    const schema = z.object({
      vin: z.string().length(17),
    });
    
    schema.parse({ vin });

    // Check if already following
    const existing = await db.query.follows.findFirst({
      where: (f, { and, eq }) => and(eq(f.vin, vin), eq(f.userId, userId))
    });

    if (!existing) {
      await db.insert(follows).values({ vin, userId });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(400).json({ error: "Failed to follow vehicle" });
  }
});

// Unfollow a car
showcaseRouter.delete("/:vin/follow", requireAuth, async (req, res) => {
  try {
    const { vin } = req.params;
    const userId = (req as any).user.id;
    
    await db.delete(follows).where(
      and(eq(follows.vin, vin), eq(follows.userId, userId))
    );

    res.json({ ok: true });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(400).json({ error: "Failed to unfollow vehicle" });
  }
});

// Get vehicle stats (likes, follows, comments count)
showcaseRouter.get("/:vin/stats", async (req, res) => {
  try {
    const { vin } = req.params;
    
    const [likesResult] = await db.select({ count: count() }).from(likes).where(eq(likes.vin, vin));
    const [followsResult] = await db.select({ count: count() }).from(follows).where(eq(follows.vin, vin));
    const [commentsResult] = await db.select({ count: count() }).from(comments).where(eq(comments.vin, vin));

    res.json({ 
      ok: true, 
      data: {
        likes: likesResult?.count || 0,
        follows: followsResult?.count || 0,
        comments: commentsResult?.count || 0
      }
    });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(400).json({ error: "Failed to get vehicle stats" });
  }
});

// Comments (optionally tied to a record)
showcaseRouter.post("/:vin/comments", requireAuth, async (req, res) => {
  try {
    const { vin } = req.params;
    const { body, recordId } = z.object({
      body: z.string().min(1).max(500),
      recordId: z.string().optional(),
    }).parse(req.body);
    
    const userId = (req as any).user.id;
    
    const [comment] = await db.insert(comments).values({ 
      vin, 
      userId, 
      body, 
      recordId: recordId || null 
    }).returning();
    
    // Get user info for response
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.id, userId)
    });
    
    res.json({ 
      ok: true, 
      data: {
        ...comment,
        user: {
          id: user?.id,
          username: user?.username,
          firstName: user?.firstName,
          lastName: user?.lastName,
          profileImageUrl: user?.profileImageUrl
        }
      }
    });
  } catch (error) {
    console.error("Comment error:", error);
    res.status(400).json({ error: "Failed to add comment" });
  }
});

// Get comments for a vehicle
showcaseRouter.get("/:vin/comments", async (req, res) => {
  try {
    const { vin } = req.params;
    
    const vehicleComments = await db.query.comments.findMany({
      where: (c, { eq }) => eq(c.vin, vin),
      orderBy: (c, { desc }) => desc(c.createdAt),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true
          }
        }
      }
    });
    
    res.json({ ok: true, data: vehicleComments });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(400).json({ error: "Failed to get comments" });
  }
});

// Get public vehicles showcase
showcaseRouter.get("/vehicles", async (req, res) => {
  try {
    const { page = "1", limit = "12" } = req.query as { page?: string; limit?: string };
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const publicVehicles = await db.query.vehicles.findMany({
      where: (v, { eq }) => eq(v.isPublic, true),
      limit: parseInt(limit),
      offset,
      orderBy: (v, { desc }) => desc(v.updatedAt),
      with: {
        currentOwner: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profileImageUrl: true
          }
        }
      }
    });

    // Get stats for each vehicle
    const vehiclesWithStats = await Promise.all(
      publicVehicles.map(async (vehicle) => {
        const [likesResult, followsResult, commentsResult] = await Promise.all([
          db.select({ count: count() }).from(likes).where(eq(likes.vin, vehicle.vin || "")),
          db.select({ count: count() }).from(follows).where(eq(follows.vin, vehicle.vin || "")),
          db.select({ count: count() }).from(comments).where(eq(comments.vin, vehicle.vin || ""))
        ]);

        return {
          ...vehicle,
          stats: {
            likes: likesResult[0]?.count || 0,
            follows: followsResult[0]?.count || 0,
            comments: commentsResult[0]?.count || 0
          }
        };
      })
    );

    res.json({ ok: true, data: vehiclesWithStats });
  } catch (error) {
    console.error("Showcase vehicles error:", error);
    res.status(400).json({ error: "Failed to get showcase vehicles" });
  }
});