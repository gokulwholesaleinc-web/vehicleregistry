import { Router } from 'express';
import { normalizeVIN, isValidVIN } from '../lib/vin';
import { storage } from '../storage';

const router = Router();

/**
 * GET /api/v1/vin/availability?vin=17chars
 * Returns whether a VIN is available for registration
 * { ok: true, data: { available: boolean, reason?: string } }
 */
router.get('/availability', async (req, res) => {
  try {
    const rawVin = String(req.query.vin || '');
    const vin = normalizeVIN(rawVin);
    
    if (!isValidVIN(vin)) {
      return res.status(400).json({ 
        ok: false, 
        error: { message: 'VIN must be 17 characters' } 
      });
    }

    // Check if VIN is already claimed by an active (non-archived) vehicle
    const existingVehicle = await storage.getVehicleByVin(vin);
    
    if (existingVehicle && !existingVehicle.archived) {
      return res.json({ 
        ok: true, 
        data: { 
          available: false,
          reason: 'VIN is already registered to another user'
        } 
      });
    }

    return res.json({ 
      ok: true, 
      data: { available: true } 
    });
  } catch (error) {
    console.error('[VIN availability] error:', error);
    return res.status(500).json({ 
      ok: false, 
      error: { message: 'VIN availability check failed' } 
    });
  }
});

export default router;