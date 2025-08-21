import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { mileageProofs } from "@shared/schema";
import { requireAuth } from "../auth/middleware";
import { eq, desc } from "drizzle-orm";
import multer from "multer";
import sharp from "sharp";
import * as exifr from "exifr";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

export const mileageVerificationRouter = Router();

// Configure multer for EXIF photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any, false);
    }
  }
});

// Submit mileage proof with EXIF data
mileageVerificationRouter.post("/:vin/proof", requireAuth, upload.single('photo'), async (req, res) => {
  try {
    const { vin } = req.params;
    const { mileage } = z.object({
      mileage: z.coerce.number().min(0).max(9999999),
    }).parse(req.body);
    
    const userId = (req as any).user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: "Photo is required" });
    }

    // Extract EXIF data
    let exifDatetime = null;
    try {
      const exifData = await exifr.parse(req.file.buffer);
      if (exifData?.DateTime || exifData?.DateTimeOriginal || exifData?.CreateDate) {
        const dateString = exifData.DateTime || exifData.DateTimeOriginal || exifData.CreateDate;
        exifDatetime = new Date(dateString);
      }
    } catch (exifError) {
      console.warn("EXIF extraction failed:", exifError);
    }

    // Save the photo
    const fileName = `mileage_${vin}_${randomUUID()}.jpg`;
    const uploadsDir = path.join(process.cwd(), 'uploads', 'mileage');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    
    // Process and save image
    await sharp(req.file.buffer)
      .jpeg({ quality: 85 })
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .toFile(filePath);

    const storageKey = `mileage/${fileName}`;
    
    // Verify timestamp is recent (within 24 hours)
    const isVerified = exifDatetime && 
      exifDatetime.getTime() > (Date.now() - 24 * 60 * 60 * 1000) &&
      exifDatetime.getTime() <= Date.now();

    // Create mileage proof record
    const [proof] = await db.insert(mileageProofs).values({
      vin,
      userId,
      storageKey,
      mileage,
      exifDatetime,
      verified: isVerified || false
    }).returning();

    res.json({ 
      ok: true, 
      data: {
        ...proof,
        isVerified: isVerified || false,
        exifFound: !!exifDatetime
      }
    });
  } catch (error) {
    console.error("Mileage proof error:", error);
    res.status(400).json({ error: "Failed to submit mileage proof" });
  }
});

// Get mileage proofs for a vehicle
mileageVerificationRouter.get("/:vin/proofs", async (req, res) => {
  try {
    const { vin } = req.params;
    
    const proofs = await db.query.mileageProofs.findMany({
      where: (p, { eq }) => eq(p.vin, vin),
      orderBy: (p, { desc }) => desc(p.createdAt),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({ ok: true, data: proofs });
  } catch (error) {
    console.error("Get mileage proofs error:", error);
    res.status(400).json({ error: "Failed to get mileage proofs" });
  }
});

// Get latest verified mileage for a vehicle
mileageVerificationRouter.get("/:vin/latest", async (req, res) => {
  try {
    const { vin } = req.params;
    
    const latestProof = await db.query.mileageProofs.findFirst({
      where: (p, { and, eq }) => and(eq(p.vin, vin), eq(p.verified, true)),
      orderBy: (p, { desc }) => desc(p.createdAt),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({ ok: true, data: latestProof });
  } catch (error) {
    console.error("Get latest mileage error:", error);
    res.status(400).json({ error: "Failed to get latest mileage" });
  }
});

// Serve mileage proof photos
mileageVerificationRouter.get("/photo/:storageKey", async (req, res) => {
  try {
    const { storageKey } = req.params;
    
    // Validate storage key format
    if (!storageKey.startsWith('mileage/') || storageKey.includes('..')) {
      return res.status(400).json({ error: "Invalid storage key" });
    }
    
    const fileName = storageKey.replace('mileage/', '');
    const filePath = path.join(process.cwd(), 'uploads', 'mileage', fileName);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Photo not found" });
    }
    
    res.sendFile(filePath);
  } catch (error) {
    console.error("Serve mileage photo error:", error);
    res.status(500).json({ error: "Failed to serve photo" });
  }
});