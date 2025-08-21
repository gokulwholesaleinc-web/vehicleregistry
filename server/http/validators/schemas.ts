import { z } from 'zod';

export const VIN = z.string().trim().regex(/^[A-HJ-NPR-Z0-9]{11,17}$/i,'Invalid VIN');
export const RecordKind = z.enum(['mod','maint','photo','receipt']);

export const CreateRecord = z.object({
  vin: VIN, 
  kind: RecordKind,
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  mileage: z.number().int().min(0).nullable().optional(),
  costCents: z.number().int().min(0).nullable().optional(),
  occurredAt: z.string().datetime().optional(),
  photos: z.array(z.string().url()).max(12).optional(),
});

export const UpdateRecord = CreateRecord.partial().extend({ id: z.string().min(1) });
export const DecodeVINInput = z.object({ vin: VIN, mileage: z.number().int().min(0).optional() });