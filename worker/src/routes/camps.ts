import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, asc, eq, gte, lte, like, or, sql } from 'drizzle-orm';
import { camp, organisation } from '../db/schema';
import { getDb } from '../lib/db';
import type { AppEnv } from '../env';

const listQuery = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  age: z.coerce.number().int().min(0).max(30).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(), // minor units
  q: z.string().trim().min(1).max(80).optional(),
  featured: z.enum(['true']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// Public projection: never leaks review notes or other internal columns.
const publicCamp = {
  id: camp.id,
  slug: camp.slug,
  name: camp.name,
  description: camp.description,
  category: camp.category,
  location: camp.location,
  address: camp.address,
  ageMin: camp.ageMin,
  ageMax: camp.ageMax,
  startDate: camp.startDate,
  endDate: camp.endDate,
  priceCents: camp.priceCents,
  earlyBirdCents: camp.earlyBirdCents,
  earlyBirdDeadline: camp.earlyBirdDeadline,
  currency: camp.currency,
  capacity: camp.capacity,
  enrolled: camp.enrolled,
  featured: camp.featured,
  image: camp.image,
  gallery: camp.gallery,
  videos: camp.videos,
  highlights: camp.highlights,
  amenities: camp.amenities,
  faqs: camp.faqs,
  included: camp.included,
  notIncluded: camp.notIncluded,
  whatToBring: camp.whatToBring,
  requirements: camp.requirements,
  safety: camp.safety,
  cancellationPolicy: camp.cancellationPolicy,
  organisation: {
    id: organisation.id,
    slug: organisation.slug,
    name: organisation.name,
    logoUrl: organisation.logoUrl,
    verified: organisation.verified,
  },
};

export const camps = new Hono<AppEnv>()
  .get('/', zValidator('query', listQuery), async (c) => {
    const f = c.req.valid('query');
    const db = getDb(c.env.DB);
    const where = and(
      eq(camp.status, 'published'),
      f.category ? eq(camp.category, f.category) : undefined,
      f.location ? eq(camp.location, f.location) : undefined,
      f.age !== undefined ? and(lte(camp.ageMin, f.age), gte(camp.ageMax, f.age)) : undefined,
      f.maxPrice !== undefined ? lte(camp.priceCents, f.maxPrice) : undefined,
      f.featured ? eq(camp.featured, true) : undefined,
      f.q ? or(like(camp.name, `%${f.q}%`), like(camp.description, `%${f.q}%`)) : undefined,
    );
    const rows = await db
      .select(publicCamp)
      .from(camp)
      .innerJoin(organisation, eq(camp.organisationId, organisation.id))
      .where(where)
      .orderBy(sql`${camp.featured} desc`, asc(camp.startDate))
      .limit(f.limit);
    return c.json({ camps: rows });
  })
  .get('/:idOrSlug', async (c) => {
    const key = c.req.param('idOrSlug');
    const [row] = await getDb(c.env.DB)
      .select(publicCamp)
      .from(camp)
      .innerJoin(organisation, eq(camp.organisationId, organisation.id))
      .where(and(eq(camp.status, 'published'), or(eq(camp.id, key), eq(camp.slug, key))))
      .limit(1);
    return row ? c.json({ camp: row }) : c.json({ error: 'Camp not found' }, 404);
  });
