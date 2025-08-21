import { z } from 'zod';

export const CreateNotification = z.object({
  userId: z.string().min(1),
  kind: z.string().min(1),
  title: z.string().min(1).max(140),
  body: z.string().max(2000).optional(),
  link: z.string().url().optional(),
});

export const ListInput = z.object({ 
  cursor: z.string().optional(), 
  limit: z.number().int().min(1).max(50).default(20) 
});

export const MarkReadInput = z.object({ 
  ids: z.array(z.string().min(1)).min(1) 
});

export const CreateShowcaseItem = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  photoUrl: z.string().url(),
  credit: z.string().max(120).optional(),
  isActive: z.boolean().optional(),
  sortIndex: z.number().int().min(0).optional(),
});

export const UpdateShowcaseItem = CreateShowcaseItem.partial();