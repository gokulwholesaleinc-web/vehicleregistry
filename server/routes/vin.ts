import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { requireAuth } from "../auth/middleware";
import { decodeVIN } from "../services/openai";

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

router.post('/decode', requireAuth, limiter, async (req, res) => {
  try {
    const body = DecodeInput.safeParse(req.body);
    if (!body.success) {
      return res.status(400).json({ 
        ok: false, 
        error: { 
          message: "Invalid input", 
          details: body.error.flatten() 
        } 
      });
    }
    
    const vin = body.data.vin.toUpperCase();
    
    // Use existing OpenAI VIN decode service
    const decoded = await decodeVIN(vin);
    
    res.json({ 
      ok: true, 
      data: {
        vin,
        ...decoded,
        mileage: body.data.mileage
      }
    });
  } catch (error) {
    console.error('VIN decode error:', error);
    res.status(500).json({ 
      ok: false, 
      error: { 
        message: error instanceof Error ? error.message : 'VIN decode service unavailable' 
      } 
    });
  }
});

export default router;