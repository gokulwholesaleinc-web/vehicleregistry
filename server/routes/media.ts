import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { apiResponse, apiError } from "../utils/response";
import path from "path";
import fs from "fs/promises";

const router = Router();

// Media data (in-memory for now, will connect to database later)
interface VehiclePhoto {
  id: string;
  vehicleId: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  createdAt: Date;
}

const photosStorage = new Map<string, VehiclePhoto>();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1 
  },
  fileFilter: (req, file, cb) => {
    if (!/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) {
      return cb(new Error('Only PNG, JPG, JPEG, WEBP, and GIF images are allowed'));
    }
    cb(null, true);
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'photos');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

// POST /api/v1/media/photos/:vehicleId - Upload a photo
router.post("/photos/:vehicleId", upload.single('photo'), async (req, res) => {
  try {
    const { vehicleId } = req.params;
    
    if (!req.file) {
      return res.status(400).json(apiError("No file uploaded", 400));
    }
    
    const userId = "demo-user"; // For now, using demo user
    const id = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fileExtension = path.extname(req.file.originalname || '.jpg');
    const filename = `${id}${fileExtension}`;
    const filePath = path.join(uploadsDir, filename);
    
    // Save file to disk
    await fs.writeFile(filePath, req.file.buffer);
    
    const newPhoto: VehiclePhoto = {
      id,
      vehicleId,
      userId,
      filename,
      originalName: req.file.originalname || 'unknown',
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/photos/${filename}`,
      createdAt: new Date(),
    };
    
    photosStorage.set(id, newPhoto);
    
    res.status(201).json(apiResponse({
      ...newPhoto,
      urlCard: newPhoto.url, // For compatibility with frontend
      urlThumb: newPhoto.url,
    }));
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json(apiError("Failed to upload photo", 500));
  }
});

// GET /api/v1/media/photos/:vehicleId - List photos for a vehicle
router.get("/photos/:vehicleId", (req, res) => {
  try {
    const { vehicleId } = req.params;
    const photos = Array.from(photosStorage.values())
      .filter(photo => photo.vehicleId === vehicleId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(photo => ({
        ...photo,
        urlCard: photo.url,
        urlThumb: photo.url,
      }));
    
    res.json(apiResponse(photos));
  } catch (error) {
    res.status(500).json(apiError("Failed to fetch photos", 500));
  }
});

// DELETE /api/v1/media/photos/:photoId - Delete a photo
router.delete("/photos/:photoId", async (req, res) => {
  try {
    const { photoId } = req.params;
    const photo = photosStorage.get(photoId);
    
    if (!photo) {
      return res.status(404).json(apiError("Photo not found", 404));
    }
    
    // Delete file from disk
    const filePath = path.join(uploadsDir, photo.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.warn(`Failed to delete file: ${filePath}`, error);
    }
    
    photosStorage.delete(photoId);
    res.json(apiResponse({ message: "Photo deleted successfully" }));
  } catch (error) {
    res.status(500).json(apiError("Failed to delete photo", 500));
  }
});

export default router;