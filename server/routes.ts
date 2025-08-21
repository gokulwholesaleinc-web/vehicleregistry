import type { Express, RequestHandler } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { googleAuthRouter } from "./auth/google";
import { requireAuth, optionalAuth } from "./auth/middleware";
import localAuthRouter from "./auth/localAuth";
import { showcaseRouter } from "./routes/showcase";
import { mileageVerificationRouter } from "./routes/mileageVerification";
import { pdfReportsRouter } from "./routes/pdfReports";
import { csvImportExportRouter } from "./routes/csvImportExport";
import { 
  insertVehicleSchema,
  insertModificationSchema,
  insertMaintenanceRecordSchema,
  insertUpcomingMaintenanceSchema,
  insertVehicleTransferSchema
} from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import { vehicleTransfers } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Admin middleware for JWT auth
export const isAdminJWT: RequestHandler = async (req: any, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Admin verification failed" });
  }
};

// Admin middleware for Replit auth (legacy)
export const isAdmin: RequestHandler = async (req: any, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    res.status(500).json({ message: "Admin verification failed" });
  }
};
import { 
  decodeVIN, 
  generateMaintenanceRecommendations, 
  analyzeModificationPhoto, 
  smartCategorizeEntry 
} from "./services/openai";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.fieldname === 'photos') {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Photos must be image files'), false);
      }
    } else if (file.fieldname === 'documents') {
      const allowedTypes = ['application/pdf', 'image/', 'text/'];
      if (allowedTypes.some(type => file.mimetype.startsWith(type))) {
        cb(null, true);
      } else {
        cb(new Error('Documents must be PDF, image, or text files'), false);
      }
    } else {
      cb(null, true);
    }
  }
});

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Google OAuth routes
  app.use(googleAuthRouter);
  
  // Local auth routes
  app.use("/api/auth", localAuthRouter);
  
  // Community showcase routes
  app.use("/api/v1/showcase", showcaseRouter);
  
  // Mileage verification routes
  app.use("/api/v1/mileage", mileageVerificationRouter);
  
  // PDF report generation routes
  app.use("/api/v1/reports", pdfReportsRouter);
  
  // CSV import/export routes
  app.use("/api/v1/csv", csvImportExportRouter);

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  }, express.static(uploadsDir));

  // Auth routes - supports both JWT and Replit auth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      let userId: string | undefined;
      
      // Try JWT first (local auth)
      const authHeader = req.headers.authorization;
      console.log("Auth header:", authHeader ? "present" : "missing");
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        console.log("Extracted token:", token.substring(0, 50) + "...");
        try {
          const jwt = require('jsonwebtoken');
          const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET!;
          console.log("Using JWT secret:", secret ? "present" : "missing");
          const claims = jwt.verify(token, secret) as any;
          userId = claims.id;
          console.log("JWT auth successful for user:", userId);
          console.log("JWT claims:", claims);
        } catch (err) {
          console.log("JWT verification failed:", err.message);
          console.log("Error details:", err);
        }
      }
      
      // Fallback to Replit auth
      if (!userId && req.isAuthenticated && req.isAuthenticated()) {
        userId = req.user.claims?.sub;
        console.log("Replit auth successful for user:", userId);
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log("Returning user:", { id: user.id, email: user.email, role: user.role });
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile update - supports both JWT and Replit auth  
  app.patch('/api/auth/user', async (req: any, res) => {
    try {
      let userId: string | undefined;
      
      // Try JWT first (local auth)
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
          const jwt = require('jsonwebtoken');
          const claims = jwt.verify(token, process.env.JWT_SECRET || process.env.SESSION_SECRET!) as any;
          userId = claims.id;
        } catch (err) {
          // JWT verification failed, try Replit auth
        }
      }
      
      // Fallback to Replit auth
      if (!userId && req.isAuthenticated && req.isAuthenticated()) {
        userId = req.user.claims?.sub;
      }
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const updateData = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        location: z.string().optional(),
        isPublic: z.boolean().optional()
      }).parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // User lookup by email or username
  app.get('/api/users/search', isAuthenticated, async (req, res) => {
    try {
      const { email } = z.object({
        email: z.string().email()
      }).parse(req.query);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return limited user info for privacy
      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
    } catch (error) {
      console.error("Error searching for user:", error);
      res.status(500).json({ message: "Failed to search for user" });
    }
  });

  // Search functionality
  app.get('/api/search', isAuthenticated, async (req: any, res) => {
    try {
      const { q, type = 'all' } = z.object({
        q: z.string().min(1),
        type: z.enum(['all', 'vehicles', 'modifications', 'maintenance']).default('all')
      }).parse(req.query);
      
      const userId = req.user.claims.sub;
      const results: any = {};
      
      if (type === 'all' || type === 'vehicles') {
        const vehicles = await storage.getVehiclesByOwner(userId);
        results.vehicles = vehicles.filter(vehicle => 
          vehicle.make.toLowerCase().includes(q.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(q.toLowerCase()) ||
          vehicle.year.toString().includes(q) ||
          vehicle.vin.toLowerCase().includes(q.toLowerCase())
        );
      }
      
      if (type === 'all' || type === 'modifications') {
        // Search modifications across all user's vehicles
        const userVehicles = await storage.getVehiclesByOwner(userId);
        const allModifications = [];
        for (const vehicle of userVehicles) {
          const mods = await storage.getModifications(vehicle.id);
          allModifications.push(...mods.map(mod => ({ ...mod, vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}` })));
        }
        results.modifications = allModifications.filter(mod =>
          mod.title.toLowerCase().includes(q.toLowerCase()) ||
          mod.description?.toLowerCase().includes(q.toLowerCase()) ||
          mod.category?.toLowerCase().includes(q.toLowerCase())
        );
      }
      
      if (type === 'all' || type === 'maintenance') {
        // Search maintenance records across all user's vehicles
        const userVehicles = await storage.getVehiclesByOwner(userId);
        const allRecords = [];
        for (const vehicle of userVehicles) {
          const records = await storage.getMaintenanceRecords(vehicle.id);
          allRecords.push(...records.map(record => ({ ...record, vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}` })));
        }
        results.maintenance = allRecords.filter(record =>
          record.title.toLowerCase().includes(q.toLowerCase()) ||
          record.description?.toLowerCase().includes(q.toLowerCase()) ||
          record.category?.toLowerCase().includes(q.toLowerCase())
        );
      }
      
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Notifications
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const unreadOnly = req.query.unread === 'true';
      const notifications = await storage.getNotifications(userId, unreadOnly);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const success = await storage.markNotificationRead(req.params.id);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ message: "Notification not found" });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.patch('/api/notifications/read-all', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const success = await storage.markAllNotificationsRead(userId);
      res.json({ success });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });

  // Community routes (public)
  app.get('/api/community/vehicles', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const vehicles = await storage.getPublicVehicles(limit, offset);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch public vehicles' });
    }
  });

  // Vehicles (protected)
  app.get('/api/vehicles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vehicles = await storage.getVehiclesByOwner(userId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch vehicles' });
    }
  });

  app.get('/api/vehicles/:id', async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch vehicle' });
    }
  });

  app.get('/api/vehicles/:id/history', async (req, res) => {
    try {
      const history = await storage.getVehicleHistory(req.params.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch vehicle history' });
    }
  });

  // Enhanced VIN-based vehicle creation
  app.post('/api/vehicles/create-from-vin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { vin, currentMileage } = z.object({ 
        vin: z.string().min(17).max(17),
        currentMileage: z.number().optional()
      }).parse(req.body);

      // Check if vehicle already exists
      const existingVehicle = await storage.getVehicleByVin(vin);
      if (existingVehicle) {
        return res.status(400).json({ message: 'Vehicle with this VIN already exists in the system' });
      }

      // Decode VIN using AI
      const vinData = await decodeVIN(vin);
      
      if (vinData.confidence < 0.5) {
        return res.status(400).json({ message: 'Unable to decode VIN with sufficient confidence. Please enter vehicle details manually.' });
      }

      // Create vehicle with AI-decoded data
      const vehicleData = {
        vin,
        year: vinData.year,
        make: vinData.make,
        model: vinData.model,
        trim: vinData.trim || null,
        currentMileage: currentMileage || 0,
        currentOwnerId: userId,
        autoFilled: true,
        isDraft: false
      };

      const vehicle = await storage.createVehicle(vehicleData as any, userId);

      res.json({ 
        vehicle, 
        vinData,
        message: 'Vehicle created successfully using AI VIN decoding'
      });
    } catch (error) {
      console.error('VIN vehicle creation error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to create vehicle from VIN' });
    }
  });

  // Create draft vehicle (without VIN)
  app.post('/api/vehicles/create-draft', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vehicleData = insertVehicleSchema.parse({
        ...req.body,
        currentOwnerId: userId,
        isDraft: true,
        autoFilled: false
      });

      const vehicle = await storage.createVehicle(vehicleData, userId);

      res.json({ vehicle, message: 'Draft vehicle created successfully' });
    } catch (error) {
      console.error('Draft vehicle creation error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to create draft vehicle' });
    }
  });

  // Convert draft to full vehicle (add VIN later)
  app.post('/api/vehicles/:id/add-vin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { vin } = z.object({ vin: z.string().min(17).max(17) }).parse(req.body);

      // Check if VIN already exists
      const existingVehicle = await storage.getVehicleByVin(vin);
      if (existingVehicle) {
        return res.status(400).json({ message: 'Vehicle with this VIN already exists in the system' });
      }

      // Get current vehicle
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle || vehicle.currentOwnerId !== userId) {
        return res.status(403).json({ message: 'Not authorized to modify this vehicle' });
      }

      if (!vehicle.isDraft) {
        return res.status(400).json({ message: 'Vehicle is not a draft' });
      }

      // Decode VIN and update vehicle
      const vinData = await decodeVIN(vin);
      
      const updatedVehicle = await storage.updateVehicle(req.params.id, {
        vin,
        year: vinData.confidence > 0.7 ? vinData.year : vehicle.year,
        make: vinData.confidence > 0.7 ? vinData.make : vehicle.make,
        model: vinData.confidence > 0.7 ? vinData.model : vehicle.model,
        trim: vinData.confidence > 0.7 ? vinData.trim : vehicle.trim,
        isDraft: false,
        autoFilled: vinData.confidence > 0.7
      });

      res.json({ 
        vehicle: updatedVehicle, 
        vinData,
        message: 'VIN added successfully and vehicle updated'
      });
    } catch (error) {
      console.error('Add VIN error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to add VIN to vehicle' });
    }
  });

  app.post('/api/vehicles', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vehicleData = insertVehicleSchema.parse(req.body);
      
      // Check if VIN already exists
      const existingVehicle = await storage.getVehicleByVin(vehicleData.vin);
      if (existingVehicle) {
        return res.status(400).json({ message: 'Vehicle with this VIN already exists' });
      }
      
      const vehicle = await storage.createVehicle(vehicleData, userId);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid vehicle data' });
    }
  });

  app.patch('/api/vehicles/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const vehicle = await storage.getVehicle(req.params.id);
      
      if (!vehicle || vehicle.currentOwnerId !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this vehicle' });
      }
      
      const updateData = insertVehicleSchema.partial().parse(req.body);
      const updatedVehicle = await storage.updateVehicle(req.params.id, updateData);
      res.json(updatedVehicle);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid update data' });
    }
  });

  // Vehicle Transfer routes
  app.post('/api/vehicles/:id/transfer', isAuthenticated, async (req: any, res) => {
    try {
      const fromUserId = req.user.claims.sub;
      const { toUserId, message } = req.body;
      
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle || vehicle.currentOwnerId !== fromUserId) {
        return res.status(403).json({ message: 'Not authorized to transfer this vehicle' });
      }
      
      const transferCode = randomUUID().slice(0, 8).toUpperCase();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const transfer = await storage.createTransferRequest({
        vehicleId: req.params.id,
        fromUserId,
        toUserId,
        message,
        expiresAt,
      } as any);

      // Create notification for recipient
      const vehicleData = await storage.getVehicle(req.params.id);
      await storage.createNotification({
        userId: toUserId,
        title: "Vehicle Transfer Request",
        message: `You have received a vehicle transfer request for ${vehicleData?.year} ${vehicleData?.make} ${vehicleData?.model}`,
        type: "info",
        relatedEntityId: transfer.id,
        relatedEntityType: "transfer"
      });
      
      res.json(transfer);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create transfer request' });
    }
  });

  app.get('/api/transfers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transfers = await storage.getTransfersByUser(userId);
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch transfers' });
    }
  });

  app.post('/api/transfers/:id/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [transfer] = await db.select().from(vehicleTransfers).where(eq(vehicleTransfers.id, req.params.id));
      const success = await storage.processTransfer(req.params.id, true);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to accept transfer' });
      }

      // Create notification for the sender
      const vehicleInfo = await storage.getVehicle(transfer.vehicleId);
      await storage.createNotification({
        userId: transfer.fromUserId,
        title: "Transfer Accepted",
        message: `Your transfer request for ${vehicleInfo?.year} ${vehicleInfo?.make} ${vehicleInfo?.model} has been accepted`,
        type: "success",
        relatedEntityId: req.params.id,
        relatedEntityType: "transfer"
      });
      
      res.json({ message: 'Transfer accepted successfully' });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to accept transfer' });
    }
  });

  app.post('/api/transfers/:id/reject', isAuthenticated, async (req: any, res) => {
    try {
      const [transfer] = await db.select().from(vehicleTransfers).where(eq(vehicleTransfers.id, req.params.id));
      const success = await storage.processTransfer(req.params.id, false);
      
      if (!success) {
        return res.status(400).json({ message: 'Failed to reject transfer' });
      }

      // Create notification for the sender
      const vehicleDetails = await storage.getVehicle(transfer.vehicleId);
      await storage.createNotification({
        userId: transfer.fromUserId,
        title: "Transfer Rejected",
        message: `Your transfer request for ${vehicleDetails?.year} ${vehicleDetails?.make} ${vehicleDetails?.model} has been rejected`,
        type: "warning",
        relatedEntityId: req.params.id,
        relatedEntityType: "transfer"
      });
      
      res.json({ message: 'Transfer rejected' });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to reject transfer' });
    }
  });

  // Modifications
  app.get('/api/vehicles/:vehicleId/modifications', async (req, res) => {
    try {
      const modifications = await storage.getModifications(req.params.vehicleId);
      res.json(modifications);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch modifications' });
    }
  });

  app.post('/api/vehicles/:vehicleId/modifications', isAuthenticated, upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'documents', maxCount: 5 }
  ]), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const modificationData = insertModificationSchema.parse({
        ...req.body,
        vehicleId: req.params.vehicleId,
        userId: userId
      });

      const files = req.files as any;
      const photoUrls: string[] = [];
      const documentUrls: string[] = [];

      // Process uploaded photos
      if (files?.photos) {
        for (const file of files.photos) {
          const filename = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;
          const filepath = path.join(uploadsDir, filename);
          
          // Compress and convert to WebP
          await sharp(file.buffer)
            .resize(1200, 1200, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .webp({ quality: 85 })
            .toFile(filepath);
          
          photoUrls.push(`/uploads/${filename}`);
        }
      }

      // Process uploaded documents
      if (files?.documents) {
        for (const file of files.documents) {
          const extension = path.extname(file.originalname);
          const filename = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
          const filepath = path.join(uploadsDir, filename);
          
          fs.writeFileSync(filepath, file.buffer);
          documentUrls.push(`/uploads/${filename}`);
        }
      }

      const modificationWithFiles = {
        ...modificationData,
        photos: photoUrls,
        documents: documentUrls
      };

      const modification = await storage.createModification(modificationWithFiles);
      res.json(modification);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid modification data' });
    }
  });

  // Maintenance Records
  app.get('/api/vehicles/:vehicleId/maintenance', async (req, res) => {
    try {
      const records = await storage.getMaintenanceRecords(req.params.vehicleId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch maintenance records' });
    }
  });

  app.post('/api/vehicles/:vehicleId/maintenance', isAuthenticated, upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'documents', maxCount: 5 }
  ]), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recordData = insertMaintenanceRecordSchema.parse({
        ...req.body,
        vehicleId: req.params.vehicleId,
        userId: userId
      });

      const files = req.files as any;
      const photoUrls: string[] = [];
      const documentUrls: string[] = [];

      // Process uploaded photos
      if (files?.photos) {
        for (const file of files.photos) {
          const filename = `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.webp`;
          const filepath = path.join(uploadsDir, filename);
          
          await sharp(file.buffer)
            .resize(1200, 1200, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .webp({ quality: 85 })
            .toFile(filepath);
          
          photoUrls.push(`/uploads/${filename}`);
        }
      }

      // Process uploaded documents
      if (files?.documents) {
        for (const file of files.documents) {
          const extension = path.extname(file.originalname);
          const filename = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
          const filepath = path.join(uploadsDir, filename);
          
          fs.writeFileSync(filepath, file.buffer);
          documentUrls.push(`/uploads/${filename}`);
        }
      }

      const recordWithFiles = {
        ...recordData,
        photos: photoUrls,
        documents: documentUrls
      };

      const record = await storage.createMaintenanceRecord(recordWithFiles);
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid maintenance record data' });
    }
  });

  // Upcoming Maintenance
  app.get('/api/vehicles/:vehicleId/upcoming-maintenance', async (req, res) => {
    try {
      const upcoming = await storage.getUpcomingMaintenance(req.params.vehicleId);
      res.json(upcoming);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch upcoming maintenance' });
    }
  });

  app.post('/api/vehicles/:vehicleId/upcoming-maintenance', async (req, res) => {
    try {
      const maintenanceData = insertUpcomingMaintenanceSchema.parse({
        ...req.body,
        vehicleId: req.params.vehicleId
      });
      const maintenance = await storage.createUpcomingMaintenance(maintenanceData);
      res.json(maintenance);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid upcoming maintenance data' });
    }
  });

  app.delete('/api/upcoming-maintenance/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteUpcomingMaintenance(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Upcoming maintenance not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to delete upcoming maintenance' });
    }
  });

  // Statistics endpoint
  app.get('/api/vehicles/:vehicleId/stats', async (req, res) => {
    try {
      const vehicleId = req.params.vehicleId;
      const [modifications, maintenanceRecords] = await Promise.all([
        storage.getModifications(vehicleId),
        storage.getMaintenanceRecords(vehicleId)
      ]);

      const totalSpent = [...modifications, ...maintenanceRecords]
        .reduce((sum, item) => sum + parseFloat(item.cost), 0);

      const photoCount = [...modifications, ...maintenanceRecords]
        .reduce((sum, item) => sum + (item.photos?.length || 0), 0);

      const stats = {
        totalSpent: totalSpent.toFixed(2),
        modificationsCount: modifications.length,
        serviceRecordsCount: maintenanceRecords.length,
        photosCount: photoCount,
        spending: {
          modifications: modifications.reduce((sum, mod) => sum + parseFloat(mod.cost), 0).toFixed(2),
          maintenance: maintenanceRecords.reduce((sum, record) => sum + parseFloat(record.cost), 0).toFixed(2),
          repairs: "0.00", // Could be calculated from maintenance records with specific categories
          totalYear: totalSpent.toFixed(2)
        }
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch statistics' });
    }
  });

  // AI-Powered Endpoints
  app.post('/api/ai/decode-vin', isAuthenticated, async (req, res) => {
    try {
      const { vin } = z.object({ vin: z.string().min(17).max(17) }).parse(req.body);
      const decoded = await decodeVIN(vin);
      res.json(decoded);
    } catch (error) {
      console.error('VIN decode error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to decode VIN' });
    }
  });

  app.post('/api/ai/maintenance-recommendations', isAuthenticated, async (req, res) => {
    try {
      const vehicleData = z.object({
        make: z.string(),
        model: z.string(),
        year: z.number(),
        mileage: z.number(),
        modifications: z.array(z.string()).optional(),
        lastMaintenance: z.array(z.string()).optional()
      }).parse(req.body);
      
      const recommendations = await generateMaintenanceRecommendations(vehicleData);
      res.json(recommendations);
    } catch (error) {
      console.error('Maintenance recommendations error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to generate recommendations' });
    }
  });

  app.post('/api/ai/analyze-photo', isAuthenticated, upload.single('photo'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Photo is required' });
      }

      // Convert image to base64
      const base64Image = req.file.buffer.toString('base64');
      const analysis = await analyzeModificationPhoto(base64Image);
      res.json(analysis);
    } catch (error) {
      console.error('Photo analysis error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to analyze photo' });
    }
  });

  app.post('/api/ai/categorize-entry', isAuthenticated, async (req, res) => {
    try {
      const { title, description, cost } = z.object({
        title: z.string(),
        description: z.string(),
        cost: z.number()
      }).parse(req.body);
      
      const categorization = await smartCategorizeEntry(title, description, cost);
      res.json(categorization);
    } catch (error) {
      console.error('Entry categorization error:', error);
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to categorize entry' });
    }
  });

  // Cache Management Endpoints
  app.post('/api/cache/invalidate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Simple cache invalidation by setting cache headers
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.json({ message: 'Cache invalidated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to invalidate cache' });
    }
  });

  // Duplicate Prevention Endpoint
  app.post('/api/registry/check-duplicate', isAuthenticated, async (req, res) => {
    try {
      const { type, identifier } = z.object({
        type: z.enum(['vin', 'modification', 'maintenance']),
        identifier: z.string()
      }).parse(req.body);

      let exists = false;
      let existingRecord = null;

      switch (type) {
        case 'vin':
          existingRecord = await storage.getVehicleByVin(identifier);
          exists = !!existingRecord;
          break;
        case 'modification':
          // Check for similar modification entries by title
          const vehicles = await storage.getVehiclesByOwner((req.user as any).claims.sub);
          for (const vehicle of vehicles) {
            const modifications = await storage.getModifications(vehicle.id);
            existingRecord = modifications.find(mod => 
              mod.title.toLowerCase().includes(identifier.toLowerCase()) ||
              identifier.toLowerCase().includes(mod.title.toLowerCase())
            );
            if (existingRecord) {
              exists = true;
              break;
            }
          }
          break;
        case 'maintenance':
          // Similar check for maintenance records
          const userVehicles = await storage.getVehiclesByOwner((req.user as any).claims.sub);
          for (const vehicle of userVehicles) {
            const records = await storage.getMaintenanceRecords(vehicle.id);
            existingRecord = records.find(record => 
              record.serviceType.toLowerCase().includes(identifier.toLowerCase()) ||
              identifier.toLowerCase().includes(record.serviceType.toLowerCase())
            );
            if (existingRecord) {
              exists = true;
              break;
            }
          }
          break;
      }

      res.json({ 
        exists, 
        existingRecord: exists ? existingRecord : null,
        suggestion: exists ? 'Similar record found. Consider updating the existing one instead.' : null
      });
    } catch (error) {
      console.error('Duplicate check error:', error);
      res.status(500).json({ message: 'Failed to check for duplicates' });
    }
  });

  // Admin Routes
  app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      const stats = await storage.getPlatformStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch platform statistics" });
    }
  });

  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const users = await storage.getAllUsers(limit, offset);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users/:id/suspend', isAdmin, async (req: any, res) => {
    try {
      const adminId = req.adminUser.id;
      const { reason } = req.body;
      const success = await storage.suspendUser(req.params.id, adminId, reason);
      
      if (success) {
        res.json({ message: "User suspended successfully" });
      } else {
        res.status(400).json({ message: "Failed to suspend user" });
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  app.post('/api/admin/users/:id/reactivate', isAdmin, async (req: any, res) => {
    try {
      const adminId = req.adminUser.id;
      const { reason } = req.body;
      const success = await storage.reactivateUser(req.params.id, adminId, reason);
      
      if (success) {
        res.json({ message: "User reactivated successfully" });
      } else {
        res.status(400).json({ message: "Failed to reactivate user" });
      }
    } catch (error) {
      console.error("Error reactivating user:", error);
      res.status(500).json({ message: "Failed to reactivate user" });
    }
  });

  app.post('/api/admin/users/:id/promote', isAdmin, async (req: any, res) => {
    try {
      const adminId = req.adminUser.id;
      const success = await storage.promoteUserToAdmin(req.params.id, adminId);
      
      if (success) {
        res.json({ message: "User promoted to admin successfully" });
      } else {
        res.status(400).json({ message: "Failed to promote user" });
      }
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  app.get('/api/admin/vehicles', isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const vehicles = await storage.getAllVehicles(limit, offset);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ message: "Failed to fetch vehicles" });
    }
  });

  app.delete('/api/admin/vehicles/:id', isAdmin, async (req: any, res) => {
    try {
      const adminId = req.adminUser.id;
      const { reason } = req.body;
      const success = await storage.deleteVehicle(req.params.id, adminId, reason);
      
      if (success) {
        res.json({ message: "Vehicle deleted successfully" });
      } else {
        res.status(400).json({ message: "Failed to delete vehicle" });
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ message: "Failed to delete vehicle" });
    }
  });

  app.get('/api/admin/action-logs', isAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const logs = await storage.getAdminActionLogs(limit, offset);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching action logs:", error);
      res.status(500).json({ message: "Failed to fetch action logs" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
