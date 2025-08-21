import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/middleware";
import { storage } from "../storage";
import * as Papa from "papaparse";
import multer from "multer";
import { Response } from "express";

export const csvImportExportRouter = Router();

// Configure multer for CSV uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed') as any, false);
    }
  }
});

// Export vehicle data to CSV
csvImportExportRouter.get("/:vehicleId/export", requireAuth, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = (req as any).user.id;
    const { type = 'all' } = req.query as { type?: string };

    // Verify vehicle ownership
    const vehicle = await storage.getVehicle(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    if (vehicle.currentOwnerId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    let csvData: any[] = [];
    let filename = `vehicle-${vehicle.vin}`;

    if (type === 'modifications' || type === 'all') {
      const modifications = await storage.getModifications(vehicleId);
      const modData = modifications.map(mod => ({
        Type: 'Modification',
        Title: mod.title,
        Category: mod.category || '',
        Description: mod.description || '',
        Cost: mod.cost || 0,
        Date: mod.dateInstalled ? new Date(mod.dateInstalled).toISOString().split('T')[0] : '',
        Mileage: '',
        Notes: mod.notes || ''
      }));
      csvData.push(...modData);
    }

    if (type === 'maintenance' || type === 'all') {
      const maintenanceRecords = await storage.getMaintenanceRecords(vehicleId);
      const maintenanceData = maintenanceRecords.map(record => ({
        Type: 'Maintenance',
        Title: record.title,
        Category: record.category || '',
        Description: record.description || '',
        Cost: record.cost || 0,
        Date: record.datePerformed ? new Date(record.datePerformed).toISOString().split('T')[0] : '',
        Mileage: record.mileage || '',
        Notes: record.notes || ''
      }));
      csvData.push(...maintenanceData);
    }

    if (type === 'upcoming' || type === 'all') {
      const upcomingMaintenance = await storage.getUpcomingMaintenance(vehicleId);
      const upcomingData = upcomingMaintenance.map(item => ({
        Type: 'Upcoming Maintenance',
        Title: item.title,
        Category: item.category || '',
        Description: item.description || '',
        Cost: item.estimatedCost || 0,
        Date: item.dueDate ? new Date(item.dueDate).toISOString().split('T')[0] : '',
        Mileage: item.dueMileage || '',
        Notes: item.notes || ''
      }));
      csvData.push(...upcomingData);
    }

    // Generate CSV
    const csv = Papa.unparse(csvData);
    
    // Set response headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}-${type}.csv"`);
    
    res.send(csv);
    
  } catch (error) {
    console.error("CSV export error:", error);
    res.status(500).json({ error: "Failed to export CSV" });
  }
});

// Import vehicle data from CSV
csvImportExportRouter.post("/:vehicleId/import", requireAuth, upload.single('csv'), async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = (req as any).user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    // Verify vehicle ownership
    const vehicle = await storage.getVehicle(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    if (vehicle.currentOwnerId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Parse CSV
    const csvText = req.file.buffer.toString('utf-8');
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim()
    });

    if (parseResult.errors.length > 0) {
      return res.status(400).json({ 
        error: "CSV parsing failed", 
        details: parseResult.errors 
      });
    }

    const rows = parseResult.data as any[];
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        const type = row.Type?.toLowerCase();
        
        if (type === 'modification') {
          await storage.createModification({
            vehicleId,
            title: row.Title || `Imported Modification ${i + 1}`,
            category: row.Category || '',
            description: row.Description || '',
            cost: parseFloat(row.Cost) || 0,
            dateInstalled: row.Date ? new Date(row.Date) : new Date(),
            notes: row.Notes || '',
            userId
          });
          results.imported++;
          
        } else if (type === 'maintenance') {
          await storage.createMaintenanceRecord({
            vehicleId,
            title: row.Title || `Imported Maintenance ${i + 1}`,
            category: row.Category || '',
            description: row.Description || '',
            cost: parseFloat(row.Cost) || 0,
            datePerformed: row.Date ? new Date(row.Date) : new Date(),
            mileage: parseInt(row.Mileage) || undefined,
            notes: row.Notes || '',
            userId
          });
          results.imported++;
          
        } else if (type === 'upcoming maintenance') {
          await storage.createUpcomingMaintenance({
            vehicleId,
            title: row.Title || `Imported Upcoming ${i + 1}`,
            category: row.Category || '',
            description: row.Description || '',
            estimatedCost: parseFloat(row.Cost) || 0,
            dueDate: row.Date ? new Date(row.Date) : undefined,
            dueMileage: parseInt(row.Mileage) || undefined,
            notes: row.Notes || '',
            userId
          });
          results.imported++;
          
        } else {
          results.skipped++;
          results.errors.push(`Row ${i + 1}: Unknown type "${row.Type}"`);
        }
        
      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Import failed'}`);
      }
    }

    res.json({ 
      ok: true, 
      data: results
    });
    
  } catch (error) {
    console.error("CSV import error:", error);
    res.status(500).json({ error: "Failed to import CSV" });
  }
});

// Get import template CSV
csvImportExportRouter.get("/template", (req, res) => {
  const templateData = [
    {
      Type: 'Modification',
      Title: 'Cold Air Intake',
      Category: 'Engine',
      Description: 'High-flow cold air intake system',
      Cost: 299.99,
      Date: '2024-01-15',
      Mileage: '',
      Notes: 'Installed by local shop'
    },
    {
      Type: 'Maintenance',
      Title: 'Oil Change',
      Category: 'Engine',
      Description: 'Full synthetic oil change',
      Cost: 75.00,
      Date: '2024-01-20',
      Mileage: 25000,
      Notes: 'Used Mobil 1 5W-30'
    },
    {
      Type: 'Upcoming Maintenance',
      Title: 'Brake Pad Replacement',
      Category: 'Brakes',
      Description: 'Replace front brake pads',
      Cost: 150.00,
      Date: '2024-06-15',
      Mileage: 30000,
      Notes: 'Check rotors for wear'
    }
  ];

  const csv = Papa.unparse(templateData);
  
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="import-template.csv"');
  
  res.send(csv);
});