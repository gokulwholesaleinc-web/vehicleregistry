import { Router } from 'express';
import { CreateShowcaseItem, UpdateShowcaseItem } from '../validators/notifications';
import { db } from '../../db';
import { showcaseItems } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

// Public feed
router.get('/', async (_req, res) => {
  const rows = await db.select().from(showcaseItems)
    .where(eq(showcaseItems.isActive, true))
    .orderBy(showcaseItems.sortIndex);
  res.json({ ok: true, data: rows });
});

// Admin list (all)
router.get('/admin', async (_req, res) => {
  // TODO: admin check
  const rows = await db.select().from(showcaseItems)
    .orderBy(showcaseItems.sortIndex);
  res.json({ ok: true, data: rows });
});

router.post('/', async (req: any, res) => {
  // TODO: admin check
  const b = CreateShowcaseItem.safeParse(req.body);
  if (!b.success) return res.status(400).json({ ok: false, error: b.error.flatten() });
  
  const id = randomUUID();
  const by = req.user?.id || 'admin';
  await db.insert(showcaseItems).values({ 
    id, 
    createdBy: by, 
    ...b.data 
  });
  res.json({ ok: true, id });
});

router.patch('/:id', async (req: any, res) => {
  const { id } = req.params;
  const b = UpdateShowcaseItem.safeParse(req.body);
  if (!b.success) return res.status(400).json({ ok: false, error: b.error.flatten() });
  
  await db.update(showcaseItems)
    .set({ ...b.data, updatedAt: new Date() })
    .where(eq(showcaseItems.id, id));
  res.json({ ok: true });
});

router.delete('/:id', async (req: any, res) => {
  const { id } = req.params;
  await db.delete(showcaseItems).where(eq(showcaseItems.id, id));
  res.json({ ok: true });
});

export default router;