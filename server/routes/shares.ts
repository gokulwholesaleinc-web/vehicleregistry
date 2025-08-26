import { Router } from "express";
import { z } from "zod";
import { apiResponse, apiError } from "../utils/response";
import { randomUUID } from "crypto";

const router = Router();

// Public share data (in-memory for now, will connect to database later)
interface PublicVehicleShare {
  id: string;
  vehicleId: string;
  userId: string;
  token: string;
  isActive: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

const sharesStorage = new Map<string, PublicVehicleShare>();

// Validation schemas
const createShareSchema = z.object({
  expiresAt: z.string().datetime().optional(),
});

const updateShareSchema = z.object({
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

// GET /api/v1/shares/:vehicleId - List shares for a vehicle
router.get("/:vehicleId", (req, res) => {
  try {
    const { vehicleId } = req.params;
    const shares = Array.from(sharesStorage.values())
      .filter(share => share.vehicleId === vehicleId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    res.json(apiResponse(shares));
  } catch (error) {
    res.status(500).json(apiError("Failed to fetch shares", 500));
  }
});

// POST /api/v1/shares/:vehicleId - Create a new share
router.post("/:vehicleId", (req, res) => {
  try {
    const { vehicleId } = req.params;
    const validation = createShareSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json(apiError("Invalid share data", 400, validation.error.errors));
    }
    
    const shareData = validation.data;
    const id = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const token = randomUUID().replace(/-/g, '');
    const userId = "demo-user"; // For now, using demo user
    
    // Check if there's already an active share for this vehicle
    const existingActiveShare = Array.from(sharesStorage.values())
      .find(share => share.vehicleId === vehicleId && share.isActive);
    
    if (existingActiveShare) {
      return res.status(400).json(apiError("Vehicle already has an active share", 400));
    }
    
    const newShare: PublicVehicleShare = {
      id,
      vehicleId,
      userId,
      token,
      isActive: true,
      createdAt: new Date(),
      expiresAt: shareData.expiresAt ? new Date(shareData.expiresAt) : undefined,
    };
    
    sharesStorage.set(id, newShare);
    res.status(201).json(apiResponse(newShare));
  } catch (error) {
    res.status(500).json(apiError("Failed to create share", 500));
  }
});

// PATCH /api/v1/shares/:shareId - Update a share
router.patch("/:shareId", (req, res) => {
  try {
    const { shareId } = req.params;
    const share = sharesStorage.get(shareId);
    
    if (!share) {
      return res.status(404).json(apiError("Share not found", 404));
    }
    
    const validation = updateShareSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(apiError("Invalid share data", 400, validation.error.errors));
    }
    
    const updateData = validation.data;
    const updatedShare: PublicVehicleShare = {
      ...share,
      ...updateData,
      expiresAt: updateData.expiresAt ? new Date(updateData.expiresAt) : share.expiresAt,
    };
    
    sharesStorage.set(shareId, updatedShare);
    res.json(apiResponse(updatedShare));
  } catch (error) {
    res.status(500).json(apiError("Failed to update share", 500));
  }
});

// DELETE /api/v1/shares/:shareId - Delete a share
router.delete("/:shareId", (req, res) => {
  try {
    const { shareId } = req.params;
    const share = sharesStorage.get(shareId);
    
    if (!share) {
      return res.status(404).json(apiError("Share not found", 404));
    }
    
    sharesStorage.delete(shareId);
    res.json(apiResponse({ message: "Share deleted successfully" }));
  } catch (error) {
    res.status(500).json(apiError("Failed to delete share", 500));
  }
});

// GET /api/v1/public/vehicle/:token - Get public vehicle data by token
router.get("/public/vehicle/:token", (req, res) => {
  try {
    const { token } = req.params;
    
    // Find share by token
    const share = Array.from(sharesStorage.values())
      .find(share => share.token === token);
    
    if (!share) {
      return res.status(404).json(apiError("Share not found", 404));
    }
    
    if (!share.isActive) {
      return res.status(403).json(apiError("Share is inactive", 403));
    }
    
    if (share.expiresAt && new Date() > share.expiresAt) {
      return res.status(403).json(apiError("Share has expired", 403));
    }
    
    // TODO: Fetch actual vehicle data
    const vehicleData = {
      id: share.vehicleId,
      make: "Demo",
      model: "Vehicle",
      year: 2023,
      // Include only public information
    };
    
    res.json(apiResponse({
      vehicle: vehicleData,
      share: {
        id: share.id,
        createdAt: share.createdAt,
        expiresAt: share.expiresAt,
      }
    }));
  } catch (error) {
    res.status(500).json(apiError("Failed to fetch public vehicle data", 500));
  }
});

export default router;