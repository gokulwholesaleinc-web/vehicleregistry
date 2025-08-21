import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import { storage } from "./storage";
import { 
  insertVehicleSchema,
  insertModificationSchema,
  insertMaintenanceRecordSchema,
  insertUpcomingMaintenanceSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";
import path from "path";
import fs from "fs";

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
  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  }, express.static(uploadsDir));

  // Users
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid user data' });
    }
  });

  // Vehicles
  app.get('/api/vehicles', async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      const vehicles = await storage.getVehicles(userId);
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

  app.post('/api/vehicles', async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid vehicle data' });
    }
  });

  app.patch('/api/vehicles/:id', async (req, res) => {
    try {
      const updateData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(req.params.id, updateData);
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid update data' });
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

  app.post('/api/vehicles/:vehicleId/modifications', upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'documents', maxCount: 5 }
  ]), async (req, res) => {
    try {
      const modificationData = insertModificationSchema.parse({
        ...req.body,
        vehicleId: req.params.vehicleId
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

  app.post('/api/vehicles/:vehicleId/maintenance', upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'documents', maxCount: 5 }
  ]), async (req, res) => {
    try {
      const recordData = insertMaintenanceRecordSchema.parse({
        ...req.body,
        vehicleId: req.params.vehicleId
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

  const httpServer = createServer(app);
  return httpServer;
}
