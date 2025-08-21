import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { requireAuth } from "../auth/middleware";
import PDFDocument from "pdfkit";
import { storage } from "../storage";
import { Response } from "express";
import path from "path";

export const pdfReportsRouter = Router();

// Generate vehicle build report PDF
pdfReportsRouter.post("/:vehicleId/build-report", requireAuth, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = (req as any).user.id;
    
    const { includeHistory, includeSpecs, includePhotos } = z.object({
      includeHistory: z.boolean().default(true),
      includeSpecs: z.boolean().default(true),
      includePhotos: z.boolean().default(false)
    }).parse(req.body);

    // Verify vehicle ownership
    const vehicle = await storage.getVehicle(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    if (vehicle.currentOwnerId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="vehicle-report-${vehicle.vin}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add title and header
    doc.fontSize(24).font('Helvetica-Bold');
    doc.text('VINtage Garage Registry', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(18).font('Helvetica-Bold');
    doc.text('Vehicle Build Report', { align: 'center' });
    doc.moveDown(1);

    // Vehicle info section
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text('Vehicle Information');
    doc.moveDown(0.5);
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`VIN: ${vehicle.vin}`);
    doc.text(`Year: ${vehicle.year}`);
    doc.text(`Make: ${vehicle.make}`);
    doc.text(`Model: ${vehicle.model}`);
    if (vehicle.trim) doc.text(`Trim: ${vehicle.trim}`);
    if (vehicle.mileage) doc.text(`Mileage: ${vehicle.mileage.toLocaleString()} miles`);
    if (vehicle.description) {
      doc.moveDown(0.5);
      doc.text('Description:');
      doc.text(vehicle.description, { width: 500 });
    }
    doc.moveDown(1);

    // Modifications section
    if (includeHistory) {
      const modifications = await storage.getModifications(vehicleId);
      if (modifications.length > 0) {
        addPageBreakIfNeeded(doc, 200);
        
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('Modifications');
        doc.moveDown(0.5);
        
        modifications.forEach((mod, index) => {
          addPageBreakIfNeeded(doc, 80);
          
          doc.fontSize(14).font('Helvetica-Bold');
          doc.text(`${index + 1}. ${mod.title}`);
          doc.fontSize(12).font('Helvetica');
          
          if (mod.category) doc.text(`Category: ${mod.category}`);
          if (mod.cost) doc.text(`Cost: $${mod.cost.toFixed(2)}`);
          if (mod.dateInstalled) doc.text(`Date: ${new Date(mod.dateInstalled).toLocaleDateString()}`);
          
          if (mod.description) {
            doc.text('Description:');
            doc.text(mod.description, { width: 500 });
          }
          
          doc.moveDown(0.5);
        });
      }
    }

    // Maintenance records section
    if (includeHistory) {
      const maintenanceRecords = await storage.getMaintenanceRecords(vehicleId);
      if (maintenanceRecords.length > 0) {
        addPageBreakIfNeeded(doc, 200);
        
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('Maintenance History');
        doc.moveDown(0.5);
        
        maintenanceRecords.forEach((record, index) => {
          addPageBreakIfNeeded(doc, 80);
          
          doc.fontSize(14).font('Helvetica-Bold');
          doc.text(`${index + 1}. ${record.title}`);
          doc.fontSize(12).font('Helvetica');
          
          if (record.category) doc.text(`Category: ${record.category}`);
          if (record.cost) doc.text(`Cost: $${record.cost.toFixed(2)}`);
          if (record.mileage) doc.text(`Mileage: ${record.mileage.toLocaleString()} miles`);
          if (record.datePerformed) doc.text(`Date: ${new Date(record.datePerformed).toLocaleDateString()}`);
          
          if (record.description) {
            doc.text('Description:');
            doc.text(record.description, { width: 500 });
          }
          
          doc.moveDown(0.5);
        });
      }
    }

    // Build specifications section
    if (includeSpecs) {
      try {
        const specs = await db.query.specs.findMany({
          where: (s, { eq }) => eq(s.vin, vehicle.vin)
        });

        if (specs.length > 0) {
          addPageBreakIfNeeded(doc, 200);
          
          doc.fontSize(16).font('Helvetica-Bold');
          doc.text('Build Specifications');
          doc.moveDown(0.5);
          
          specs.forEach((spec, index) => {
            addPageBreakIfNeeded(doc, 150);
            
            doc.fontSize(14).font('Helvetica-Bold');
            doc.text(`${index + 1}. ${spec.title}${spec.isStockBaseline ? ' (Stock Baseline)' : ''}`);
            doc.fontSize(12).font('Helvetica');
            
            const specFields = [
              { label: 'Wheels', value: spec.wheels },
              { label: 'Tires', value: spec.tires },
              { label: 'Suspension', value: spec.suspension },
              { label: 'Power', value: spec.power },
              { label: 'Brakes', value: spec.brakes },
              { label: 'Aero', value: spec.aero },
              { label: 'Weight', value: spec.weight },
            ];
            
            specFields.forEach(field => {
              if (field.value) {
                doc.text(`${field.label}: ${field.value}`);
              }
            });
            
            if (spec.notes) {
              doc.text('Notes:');
              doc.text(spec.notes, { width: 500 });
            }
            
            doc.moveDown(0.5);
          });
        }
      } catch (error) {
        console.error("Error fetching specs:", error);
      }
    }

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica');
    doc.text('Generated by VINtage Garage Registry', { align: 'center' });
    doc.text(`Report generated on ${new Date().toLocaleDateString()}`, { align: 'center' });

    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Generate vehicle sale/transfer report PDF
pdfReportsRouter.post("/:vehicleId/sale-report", requireAuth, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = (req as any).user.id;
    
    const { salePrice, buyerInfo, additionalNotes } = z.object({
      salePrice: z.number().optional(),
      buyerInfo: z.string().optional(),
      additionalNotes: z.string().optional()
    }).parse(req.body);

    // Verify vehicle ownership
    const vehicle = await storage.getVehicle(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    if (vehicle.currentOwnerId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="sale-report-${vehicle.vin}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add title and header
    doc.fontSize(24).font('Helvetica-Bold');
    doc.text('VINtage Garage Registry', { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(18).font('Helvetica-Bold');
    doc.text('Vehicle Sale/Transfer Report', { align: 'center' });
    doc.moveDown(1);

    // Vehicle info
    doc.fontSize(16).font('Helvetica-Bold');
    doc.text('Vehicle Information');
    doc.moveDown(0.5);
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`VIN: ${vehicle.vin}`);
    doc.text(`Year: ${vehicle.year}`);
    doc.text(`Make: ${vehicle.make}`);
    doc.text(`Model: ${vehicle.model}`);
    if (vehicle.trim) doc.text(`Trim: ${vehicle.trim}`);
    if (vehicle.mileage) doc.text(`Current Mileage: ${vehicle.mileage.toLocaleString()} miles`);
    doc.moveDown(1);

    // Sale info
    if (salePrice || buyerInfo) {
      doc.fontSize(16).font('Helvetica-Bold');
      doc.text('Sale Information');
      doc.moveDown(0.5);
      
      doc.fontSize(12).font('Helvetica');
      if (salePrice) doc.text(`Sale Price: $${salePrice.toLocaleString()}`);
      if (buyerInfo) doc.text(`Buyer Information: ${buyerInfo}`);
      if (additionalNotes) {
        doc.text('Additional Notes:');
        doc.text(additionalNotes, { width: 500 });
      }
      doc.moveDown(1);
    }

    // Complete modification and maintenance summary
    const [modifications, maintenanceRecords] = await Promise.all([
      storage.getModifications(vehicleId),
      storage.getMaintenanceRecords(vehicleId)
    ]);

    const totalModificationCost = modifications.reduce((sum, mod) => sum + (mod.cost || 0), 0);
    const totalMaintenanceCost = maintenanceRecords.reduce((sum, record) => sum + (record.cost || 0), 0);

    doc.fontSize(16).font('Helvetica-Bold');
    doc.text('Investment Summary');
    doc.moveDown(0.5);
    
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total Modifications: ${modifications.length} items - $${totalModificationCost.toFixed(2)}`);
    doc.text(`Total Maintenance: ${maintenanceRecords.length} items - $${totalMaintenanceCost.toFixed(2)}`);
    doc.text(`Total Investment: $${(totalModificationCost + totalMaintenanceCost).toFixed(2)}`);
    doc.moveDown(1);

    // Finalize PDF
    doc.end();
    
  } catch (error) {
    console.error("Sale report PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate sale report" });
  }
});

// Helper function to add page break if needed
function addPageBreakIfNeeded(doc: PDFKit.PDFDocument, requiredSpace: number) {
  if (doc.y + requiredSpace > doc.page.height - 50) {
    doc.addPage();
  }
}