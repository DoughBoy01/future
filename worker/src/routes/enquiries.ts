import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { camp, enquiry } from '../db/schema';
import { getDb } from '../lib/db';
import type { AppEnv } from '../env';

const body = z.object({
  campId: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(4000),
});

export const enquiries = new Hono<AppEnv>().post('/', zValidator('json', body), async (c) => {
  const input = c.req.valid('json');
  const db = getDb(c.env.DB);
  const [target] = await db
    .select({ id: camp.id })
    .from(camp)
    .where(and(eq(camp.id, input.campId), eq(camp.status, 'published')))
    .limit(1);
  if (!target) return c.json({ error: 'Camp not found' }, 404);

  await db.insert(enquiry).values({ ...input, userId: c.get('user')?.id ?? null });
  return c.json({ ok: true as const }, 201);
});
