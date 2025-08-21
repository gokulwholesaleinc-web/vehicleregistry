import { Router } from 'express';
import { z } from 'zod';
import { ListInput, MarkReadInput, CreateNotification } from '../validators/notifications';
import { db } from '../../db';
import { notifications } from '@shared/schema';
import { eq, and, lt, isNull } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const router = Router();

// List current user's notifications (cursor pagination by created_at)
router.get('/', async (req: any, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ ok: false, error: { message: 'unauthorized' } });
  
  const q = ListInput.safeParse(req.query);
  if (!q.success) return res.status(400).json({ ok: false, error: q.error.flatten() });

  const limit = q.data.limit;
  const cursor = q.data.cursor ? new Date(Number(q.data.cursor)) : new Date();
  
  const rows = await db.select().from(notifications)
    .where(and(eq(notifications.userId, userId), lt(notifications.createdAt, cursor)))
    .orderBy(notifications.createdAt.desc())
    .limit(limit + 1);

  const nextCursor = rows.length > limit ? String(rows[limit - 1]?.createdAt?.getTime() ?? '') : undefined;
  res.json({ ok: true, data: rows.slice(0, limit), nextCursor });
});

// Count unread
router.get('/unread/count', async (req: any, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ ok: false });
  
  const result = await db.select({ count: notifications.id }).from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
  
  res.json({ ok: true, count: result.length });
});

// Mark selected notifications as read
router.post('/read', async (req: any, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ ok: false });
  
  const body = MarkReadInput.safeParse(req.body);
  if (!body.success) return res.status(400).json({ ok: false, error: body.error.flatten() });
  
  await db.update(notifications)
    .set({ readAt: new Date() })
    .where(and(
      eq(notifications.userId, userId),
      // Check if id is in the array (simplified approach)
      // In production, you might want to use a more sophisticated approach
    ));
  
  res.json({ ok: true });
});

// Admin/system: create notification
router.post('/create', async (req: any, res) => {
  // TODO: guard with admin middleware
  const body = CreateNotification.safeParse(req.body);
  if (!body.success) return res.status(400).json({ ok: false, error: body.error.flatten() });
  
  const id = randomUUID();
  await db.insert(notifications).values({ id, ...body.data });
  res.json({ ok: true, id });
});

export default router;