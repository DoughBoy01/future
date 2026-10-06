import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { organisation, user } from '../db/schema';
import { getDb } from '../lib/db';
import { requireUser } from '../lib/guards';
import type { AppEnv } from '../env';

const profileUpdate = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  image: z.string().url().max(500).nullable().optional(),
});

export const me = new Hono<AppEnv>()
  .get('/', async (c) => {
    const current = c.get('user');
    if (!current) return c.json({ user: null, organisation: null });
    const db = getDb(c.env.DB);
    const [row] = await db.select().from(user).where(eq(user.id, current.id)).limit(1);
    const org = row?.organisationId
      ? (await db.select().from(organisation).where(eq(organisation.id, row.organisationId)).limit(1))[0]
      : null;
    if (!row) return c.json({ user: null, organisation: null });
    return c.json({
      user: {
        id: row.id,
        email: row.email,
        name: row.name,
        phone: row.phone,
        image: row.image,
        role: row.role,
        organisationId: row.organisationId,
        createdAt: row.createdAt,
      },
      organisation: org ?? null,
    });
  })
  .patch('/', zValidator('json', profileUpdate), async (c) => {
    const current = requireUser(c);
    if (current instanceof Response) return current;
    const patch = c.req.valid('json');
    if (Object.keys(patch).length) await getDb(c.env.DB).update(user).set(patch).where(eq(user.id, current.id));
    return c.json({ ok: true as const });
  });
