import type { Express, RequestHandler } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { googleAuthRouter } from "./auth/google";
import { optionalAuth } from "./auth/middleware";
import localAuthRouter from "./auth/localAuth";
import { showcaseRouter } from "./routes/showcase";
import { mileageVerificationRouter } from "./routes/mileageVerification";
import { pdfReportsRouter } from "./routes/pdfReports";
import { csvImportExportRouter } from "./routes/csvImportExport";
import vinRouter from "./routes/vin";
import { applySecurity } from "./http/security";
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

// JWT middleware to process Bearer tokens
export function processJWT(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET!;
    
    try {
      const claims = jwt.verify(token, secret) as any;
      req.user = { id: claims.id };
    } catch (err) {
      // Token invalid, continue without setting user
    }
  }
  
  // Dev auth shim - auto-authenticate in development
  if (process.env.NODE_ENV !== 'production' && !req.user) {
    req.user = { id: 'demo-user' };
  }
  
  next();
}

// Consistent auth middleware for protected routes
export function requireAuth(req: any, res: any, next: any){
  if (!req.user) {
    return res.status(401).json({ ok: false, error: { message: 'Unauthorized' } });
  }
  next();
}

// Admin middleware for JWT auth
export const isAdminJWT: RequestHandler = async (req: any, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: { message: "Unauthorized" } });
    }

    const userId = req.user.id;
    const user = await storage.getUser(userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ ok: false, error: { message: "Admin access required" } });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    res.status(500).json({ ok: false, error: { message: "Admin verification failed" } });
  }
};

// Admin middleware for Replit auth (legacy)
export const isAdmin: RequestHandler = async (req: any, res, next) => {
  try {
    if (!req.isAuthenticated()) {
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
import { 
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
  // Single v1 auth endpoint - GET user profile
  app.get('/api/v1/auth/user', processJWT, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      console.log("Looking up user with ID:", userId);
      const user = await storage.getUser(userId);
      console.log("Storage returned user:", user ? "found" : "not found");
      
      if (!user) {
        return res.status(404).json({ ok: false, error: { message: "User not found" } });
      }
      
      res.json({ ok: true, data: user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to fetch user" } });
    }
  });

  // Mount enhanced VIN routes
  const vinRouter = (await import('./http/routes/vin')).default;
  app.use('/api/v1/vin', vinRouter);

  // Mount notifications and showcase routes
  const notificationsRouter = (await import('./http/routes/notifications')).default;
  const showcaseRouter = (await import('./http/routes/showcase')).default;
  app.use('/api/v1/notifications', notificationsRouter);
  app.use('/api/v1/showcase', showcaseRouter);
  
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


  // Single v1 auth endpoint - PATCH user profile
  app.patch('/api/v1/auth/user', processJWT, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const updateData = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        location: z.string().optional(),
        isPublic: z.boolean().optional()
      }).parse(req.body);
      
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json({ ok: true, data: updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ ok: false, error: { message: "Failed to update user profile" } });
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
      
      const userId = req.user.id;
      const results: any = {};
      
      if (type === 'all' || type === 'vehicles') {
        const vehicles = await storage.getVehiclesByOwner(userId);
        results.vehicles = vehicles.filter(vehicle => 
          vehicle.make.toLowerCase().includes(q.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(q.toLowerCase()) ||
          vehicle.year.toString().includes(q) ||
(vehicle.vin?.toLowerCase().includes(q.toLowerCase()) ?? false)
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
          (mod as any).title?.toLowerCase().includes(q.toLowerCase()) ||
          mod.description?.toLowerCase().includes(q.toLowerCase()) ||
          (mod as any).category?.toLowerCase().includes(q.toLowerCase())
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
          (record as any).title?.toLowerCase().includes(q.toLowerCase()) ||
          record.description?.toLowerCase().includes(q.toLowerCase()) ||
          (record as any).category?.toLowerCase().includes(q.toLowerCase())
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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

  // Vehicles (protected) - moved to /api/v1
  app.get('/api/v1/vehicles', processJWT, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const vehicles = await storage.getVehiclesByOwner(userId);
      res.json({ ok: true, data: vehicles });
    } catch (error) {
      res.status(500).json({ ok: false, error: { message: error instanceof Error ? error.message : 'Failed to fetch vehicles' } });
    }
  });

  app.get('/api/v1/vehicles/:id', async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ ok: false, error: { message: 'Vehicle not found' } });
      }
      res.json({ ok: true, data: vehicle });
    } catch (error) {
      res.status(500).json({ ok: false, error: { message: error instanceof Error ? error.message : 'Failed to fetch vehicle' } });
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
  app.post('/api/v1/vehicles/create-from-vin', processJWT, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { vin, currentMileage } = z.object({ 
        vin: z.string().min(17).max(17),
        currentMileage: z.number().optional()
      }).parse(req.body);

      // Check if vehicle already exists
      const existingVehicle = await storage.getVehicleByVin(vin);
      if (existingVehicle) {
        return res.status(400).json({ message: 'Vehicle with this VIN already exists in the system' });
      }

      // Decode VIN using hybrid decoder (use internal call)
      const vinResponse = await fetch(`${req.protocol}://${req.get('host')}/api/v1/vin/decode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin })
      });
      
      if (!vinResponse.ok) {
        return res.status(502).json({ ok: false, error: { message: 'VIN decode service unavailable' } });
      }
      
      const vinResult = await vinResponse.json();
      if (!vinResult.ok) {
        return res.status(400).json({ ok: false, error: { message: 'VIN decode failed' } });
      }
      
      const { vehicle: vinData } = vinResult.data;
      
      if (!vinData.make || !vinData.model || !vinData.modelYear) {
        return res.status(400).json({ ok: false, error: { message: 'Unable to decode VIN. Please enter vehicle details manually.' } });
      }

      // Create vehicle with hybrid-decoded data
      const vehicleData = {
        vin,
        year: vinData.modelYear,
        make: vinData.make,
        model: vinData.model,
        trim: vinData.trim || null,
        currentMileage: currentMileage || 0,
        currentOwnerId: userId,
        autoFilled: true,
        isDraft: false
      };

      const vehicle = await storage.createVehicle(vehicleData as any, userId);

      res.status(201).json({ 
        ok: true, 
        data: { 
          vehicle, 
          vinData,
          message: 'Vehicle created successfully using hybrid VIN decoding'
        }
      });
    } catch (error) {
      console.error('VIN vehicle creation error:', error);
      res.status(500).json({ ok: false, error: { message: error instanceof Error ? error.message : 'Failed to create vehicle from VIN' } });
    }
  });

  // Create draft vehicle (without VIN)
  app.post('/api/v1/vehicles/create-draft', processJWT, requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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

      // Decode VIN using hybrid decoder
      const vinResponse = await fetch(`http://localhost:5000/api/v1/vin/decode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vin })
      });
      
      if (!vinResponse.ok) {
        throw new Error('VIN decode service unavailable');
      }
      
      const vinResult = await vinResponse.json();
      if (!vinResult.ok) {
        throw new Error('VIN decode failed');
      }
      
      const vinData = vinResult.data;
      
      const updatedVehicle = await storage.updateVehicle(req.params.id, {
        vin,
        year: vinData.make && vinData.model ? vinData.modelYear : vehicle.year,
        make: vinData.make || vehicle.make,
        model: vinData.model || vehicle.model,
        trim: vinData.trim || vehicle.trim,
        isDraft: false,
        autoFilled: !!(vinData.make && vinData.model)
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
      const userId = req.user.id;
      const vehicleData = insertVehicleSchema.parse(req.body);
      
      // Check if VIN already exists
      const existingVehicle = await storage.getVehicleByVin(vehicleData.vin!);
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
      const userId = req.user.id;
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
      const fromUserId = req.user.id;
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
        body: `You have received a vehicle transfer request for ${vehicleData?.year} ${vehicleData?.make} ${vehicleData?.model}`,
        kind: "transfer",
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
      const userId = req.user.id;
      const transfers = await storage.getTransfersByUser(userId);
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch transfers' });
    }
  });

  app.post('/api/transfers/:id/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
        body: `Your transfer request for ${vehicleInfo?.year} ${vehicleInfo?.make} ${vehicleInfo?.model} has been accepted`,
        kind: "transfer",
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
        body: `Your transfer request for ${vehicleDetails?.year} ${vehicleDetails?.make} ${vehicleDetails?.model} has been rejected`,
        kind: "transfer",
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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

  // Mount VIN router
  app.use('/api/v1/vin', vinRouter);

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
      const userId = req.user.id;
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
          const vehicles = await storage.getVehiclesByOwner((req.user as any).id);
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
          const userVehicles = await storage.getVehiclesByOwner((req.user as any).id);
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

  // SPA fallback - only in production (development uses Vite dev server)
  if (process.env.NODE_ENV === 'production') {
    const clientDir = path.join(process.cwd(), 'client', 'dist');
    app.use(express.static(clientDir));
    
    app.get(/^(?!\/api\/).*/, (_req, res) => {
      res.sendFile(path.join(clientDir, 'index.html'));
    });
  }

  // Final error handler (after all routes) - ensures consistent JSON responses
  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err?.status || 500;
    const message = err?.message || 'Internal Server Error';
    res.status(status).json({ ok: false, error: { message } });
  });

  const httpServer = createServer(app);
  return httpServer;
}
