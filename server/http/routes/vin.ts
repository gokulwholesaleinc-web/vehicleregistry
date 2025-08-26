import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { DecodeVINInput } from '../validators/schemas';
import { decodeVIN } from '../../services/openai';

// Simple in-memory cache (swap with Redis if REDIS_URL present)
const cache = new Map<string, { data: any; exp: number }>();
const TTL = 24 * 60 * 60 * 1000; // 24h
const limiter = rateLimit({ windowMs: 60_000, max: 20 });

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
    // Use AI-powered OpenAI VIN decoder
    const decoded = await decodeVIN(vin);
    
    const vehicle = {
      vin,
      ...decoded,
      // Include mileage from request if provided
      mileage: parsed.data.mileage || null
    };
    
    cache.set(vin, { data: vehicle, exp: now + TTL });
    res.json({ ok: true, data: vehicle });
  } catch (error) {
    console.error('AI VIN decode error:', error);
    res.status(500).json({ ok: false, error: { message: 'AI VIN decode failed' } });
  }
});

export default router;