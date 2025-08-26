import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { requireAuth } from "../auth/middleware";
// Using hybrid decoder from http/routes/vin.ts

const router = Router();

// Rate limiting: 20 requests per minute
const limiter = rateLimit({ 
  windowMs: 60_000, 
  max: 20,
  message: { error: { message: "Too many VIN decode requests. Please try again later." } }
});

const DecodeInput = z.object({ 
  vin: z.string().trim().regex(/^[A-HJ-NPR-Z0-9]{11,17}$/i, "Invalid VIN format"), 
  mileage: z.number().int().nonnegative().optional() 
});

// Redirect to the main hybrid VIN decoder
router.post('/decode', requireAuth, limiter, async (req, res) => {
  try {
    // Forward the request to our hybrid decoder
    const response = await fetch(`http://localhost:5000/api/v1/vin/decode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ 
        ok: false, 
        error: { message: 'VIN decode service unavailable' } 
      });
    }
    
    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error('VIN decode forward error:', error);
    res.status(500).json({ 
      ok: false, 
      error: { 
        message: error instanceof Error ? error.message : 'VIN decode service unavailable' 
      } 
    });
  }
});

export default router;