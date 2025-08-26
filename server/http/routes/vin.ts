import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { DecodeVINInput } from '../validators/schemas';
import { enhanceVehicleData } from '../../services/openai';

// Simple in-memory cache (swap with Redis if REDIS_URL present)
const cache = new Map<string, { data: any; exp: number }>();
const TTL = 24 * 60 * 60 * 1000; // 24h
const limiter = rateLimit({ windowMs: 60_000, max: 20 });
const Base = process.env.VIN_API_BASE || 'https://vpic.nhtsa.dot.gov/api/vehicles';

const router = Router();

router.post('/decode', limiter, async (req, res) => {
  const parsed = DecodeVINInput.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }
  
  const vin = parsed.data.vin.toUpperCase();

  // Check cache
  const hit = cache.get(vin);
  const now = Date.now();
  if (hit && hit.exp > now) {
    return res.json({ ok: true, data: hit.data });
  }

  try {
    // Step 1: Get accurate data from NHTSA
    const url = `${Base}/DecodeVinValues/${encodeURIComponent(vin)}?format=json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(502).json({ ok: false, error: { message: 'VIN service unavailable' } });
    }
    
    const json: any = await response.json();
    const row = json?.Results?.[0] || {};
    
    const baseVehicle = {
      vin,
      make: row.Make || null,
      model: row.Model || null,
      modelYear: row.ModelYear ? Number(row.ModelYear) : null,
      trim: row.Trim || null,
      bodyClass: row.BodyClass || null,
      engine: [row.EngineManufacturer, row.EngineModel].filter(Boolean).join(' '),
      cylinders: row.EngineCylinders ? Number(row.EngineCylinders) : null,
      displacement: row.DisplacementL ? Number(row.DisplacementL) : null,
      transmission: row.TransmissionStyle || null,
      driveType: row.DriveType || null,
      plantCountry: row.PlantCountry || null,
      fuelType: row.FuelTypePrimary || null,
      mileage: parsed.data.mileage || null
    };

    // Step 2: Enhance with AI insights (only if we have valid base data)
    let aiInsights = null;
    if (baseVehicle.make && baseVehicle.model && baseVehicle.modelYear) {
      try {
        aiInsights = await enhanceVehicleData({
          make: baseVehicle.make,
          model: baseVehicle.model,
          modelYear: baseVehicle.modelYear,
          trim: baseVehicle.trim || undefined,
          engine: baseVehicle.engine || undefined,
          mileage: baseVehicle.mileage || undefined
        });
      } catch (aiError) {
        console.warn('AI enhancement failed, continuing with base data:', aiError);
      }
    }
    
    const vehicle = {
      ...baseVehicle,
      aiInsights
    };
    
    cache.set(vin, { data: vehicle, exp: now + TTL });
    res.json({ ok: true, data: vehicle });
  } catch (error) {
    console.error('Hybrid VIN decode error:', error);
    res.status(500).json({ ok: false, error: { message: 'VIN decode failed' } });
  }
});

export default router;