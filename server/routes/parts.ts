import { Router } from "express";
import { z } from "zod";
import { apiResponse, apiError } from "../utils/response";

const router = Router();

// Parts data (in-memory for now, will connect to database later)
interface VehiclePart {
  id: string;
  vehicleId: string;
  userId: string;
  title: string;
  vendor?: string;
  partNo?: string;
  costCents?: number;
  installedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const partsStorage = new Map<string, VehiclePart>();

// Validation schemas
const createPartSchema = z.object({
  title: z.string().min(1),
  vendor: z.string().optional(),
  partNo: z.string().optional(),
  costCents: z.number().int().optional(),
  installedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const updatePartSchema = createPartSchema.partial();

// GET /api/v1/parts/:vehicleId - List parts for a vehicle
router.get("/:vehicleId", (req, res) => {
  try {
    const { vehicleId } = req.params;
    const parts = Array.from(partsStorage.values())
      .filter(part => part.vehicleId === vehicleId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    res.json(apiResponse(parts));
  } catch (error) {
    res.status(500).json(apiError("Failed to fetch parts", 500));
  }
});

// POST /api/v1/parts/:vehicleId - Create a new part
router.post("/:vehicleId", (req, res) => {
  try {
    const { vehicleId } = req.params;
    const validation = createPartSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json(apiError("Invalid part data", 400, validation.error.errors));
    }
    
    const partData = validation.data;
    const id = `part_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = "demo-user"; // For now, using demo user
    
    const newPart: VehiclePart = {
      id,
      vehicleId,
      userId,
      title: partData.title,
      vendor: partData.vendor,
      partNo: partData.partNo,
      costCents: partData.costCents,
      installedAt: partData.installedAt ? new Date(partData.installedAt) : undefined,
      notes: partData.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    partsStorage.set(id, newPart);
    res.status(201).json(apiResponse(newPart));
  } catch (error) {
    res.status(500).json(apiError("Failed to create part", 500));
  }
});

// PATCH /api/v1/parts/:partId - Update a part
router.patch("/:partId", (req, res) => {
  try {
    const { partId } = req.params;
    const part = partsStorage.get(partId);
    
    if (!part) {
      return res.status(404).json(apiError("Part not found", 404));
    }
    
    const validation = updatePartSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json(apiError("Invalid part data", 400, validation.error.errors));
    }
    
    const updateData = validation.data;
    const updatedPart: VehiclePart = {
      ...part,
      ...updateData,
      installedAt: updateData.installedAt ? new Date(updateData.installedAt) : part.installedAt,
      updatedAt: new Date(),
    };
    
    partsStorage.set(partId, updatedPart);
    res.json(apiResponse(updatedPart));
  } catch (error) {
    res.status(500).json(apiError("Failed to update part", 500));
  }
});

// DELETE /api/v1/parts/:partId - Delete a part
router.delete("/:partId", (req, res) => {
  try {
    const { partId } = req.params;
    const part = partsStorage.get(partId);
    
    if (!part) {
      return res.status(404).json(apiError("Part not found", 404));
    }
    
    partsStorage.delete(partId);
    res.json(apiResponse({ message: "Part deleted successfully" }));
  } catch (error) {
    res.status(500).json(apiError("Failed to delete part", 500));
  }
});

export default router;