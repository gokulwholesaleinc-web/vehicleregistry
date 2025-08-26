import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

// VIN validation utilities
export function normalizeVIN(vin: string): string {
  return vin.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isValidVIN(vin: string): boolean {
  if (vin.length !== 17) return false;
  
  // VIN character set (excludes I, O, Q)
  const validChars = /^[ABCDEFGHJKLMNPRSTUVWXYZ0-9]+$/;
  if (!validChars.test(vin)) return false;
  
  // Check digit validation (position 9)
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  const values: { [key: string]: number } = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
    'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
    '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
  };
  
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    if (i === 8) continue; // Skip check digit position
    sum += values[vin[i]] * weights[i];
  }
  
  const checkDigit = sum % 11;
  const expectedChar = checkDigit === 10 ? 'X' : checkDigit.toString();
  
  return vin[8] === expectedChar;
}

// VIN uniqueness middleware
export const enforceVINUniqueness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Only apply to VIN-related endpoints
    if (!req.path.includes('/vin') && !req.body?.vin) {
      return next();
    }
    
    const vinData = z.object({
      vin: z.string().length(17, 'VIN must be exactly 17 characters')
    }).safeParse(req.body);
    
    if (!vinData.success) {
      return next();
    }
    
    const vin = normalizeVIN(vinData.data.vin);
    
    if (!isValidVIN(vin)) {
      return res.status(400).json({
        ok: false,
        error: {
          code: 'INVALID_VIN',
          message: 'Invalid VIN format or check digit'
        }
      });
    }
    
    // Check for existing active (non-archived) vehicle
    const existingVehicle = await storage.getVehicleByVin(vin);
    
    if (existingVehicle && !existingVehicle.archived) {
      const userId = (req as any).user?.id;
      
      if (String(existingVehicle.currentOwnerId) === String(userId)) {
        return res.status(409).json({
          ok: false,
          error: {
            code: 'VIN_DUPLICATE_SELF',
            message: 'This VIN is already in your garage'
          }
        });
      }
      
      return res.status(409).json({
        ok: false,
        error: {
          code: 'VIN_CLAIMED_BY_OTHER',
          message: 'This VIN is already registered to another user'
        }
      });
    }
    
    // Store normalized VIN for downstream processing
    req.body.vin = vin;
    next();
    
  } catch (error) {
    console.error('VIN uniqueness check failed:', error);
    res.status(500).json({
      ok: false,
      error: { message: 'VIN validation service temporarily unavailable' }
    });
  }
};

// Transfer guard - prevents unauthorized VIN transfers
export const vinTransferGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.path.includes('/transfer')) {
      return next();
    }
    
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        error: { message: 'Authentication required for vehicle transfers' }
      });
    }
    
    // Additional transfer validation logic here
    next();
    
  } catch (error) {
    console.error('VIN transfer guard failed:', error);
    res.status(500).json({
      ok: false,
      error: { message: 'Transfer validation failed' }
    });
  }
};