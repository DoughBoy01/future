import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { organisation, user } from '../db/schema';
import { getDb } from '../lib/db';
import { requireUser } from '../lib/guards';
import { uniqueSlug } from '../lib/slug';
import type { AppEnv } from '../env';

const create = z.object({ name: z.string().trim().min(2).max(120) });

export const organisations = new Hono<AppEnv>().post('/', zValidator('json', create), async (c) => {
  const current = requireUser(c);
  if (current instanceof Response) return current;
  if (current.organisationId) return c.json({ error: 'You already belong to an organisation.' }, 409);
  if (current.role === 'admin') return c.json({ error: 'Admin accounts cannot own an organisation.' }, 403);

  const { name } = c.req.valid('json');
  const db = getDb(c.env.DB);
  const id = crypto.randomUUID();

  // One batch = one transaction: the organisation and the promotion to organizer land together.
  await db.batch([
    db.insert(organisation).values({ id, name, slug: uniqueSlug(name), contactEmail: current.email }),
    db.update(user).set({ role: 'organizer', organisationId: id }).where(eq(user.id, current.id)),
  ]);

  return c.json({ organisation: { id, name } }, 201);
});
