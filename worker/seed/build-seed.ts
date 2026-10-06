/**
 * One-off: turns the raw Supabase export in worker/seed/raw into
 *   worker/seed/seed.sql     (INSERTs for D1)
 *   worker/seed/media/       (files to push to R2, keyed bucket/path)
 * Only content is carried over; no Supabase schema, ids of users, or Stripe accounts.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const raw = (n: string) => JSON.parse(readFileSync(join(import.meta.dirname, 'raw', `${n}.json`), 'utf8'));
const orgs = raw('organisations') as any[];
const camps = raw('camps') as any[];
const categorySlug = new Map((raw('camp_categories') as any[]).map((c) => [c.id, c.slug]));
const primaryCategory = new Map<string, string>();
for (const a of raw('camp_category_assignments') as any[]) {
  if (!primaryCategory.has(a.camp_id)) primaryCategory.set(a.camp_id, categorySlug.get(a.category_id));
}

const SB = /https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/(.+)$/;
const mediaToFetch = new Map<string, string>();
const rewrite = (url?: string | null) => {
  if (!url) return null;
  const m = url.match(SB);
  if (!m) return url;
  const key = decodeURIComponent(m[1]);
  mediaToFetch.set(key, url);
  return `/media/${key}`;
};

const q = (v: unknown): string => {
  if (v === null || v === undefined || v === '') return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? '1' : '0';
  return `'${String(v).replace(/'/g, "''")}'`;
};
const json = (v: unknown[]) => q(JSON.stringify(v));
const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const urlOf = (x: any) => (typeof x === 'string' ? x : x?.url);
const faqs = (v: any): { question: string; answer: string }[] =>
  (Array.isArray(v) ? v : []).flatMap((x) => (x?.faqs ? x.faqs : x)).filter((x: any) => x?.question && x?.answer);
const epoch = (iso?: string) => (iso ? Math.floor(new Date(iso).getTime() / 1000) : Math.floor(Date.now() / 1000));

// Seed content is dated in the past; roll each camp forward by whole years so it is bookable.
const shiftYears = (c: any) => {
  const today = new Date().toISOString().slice(0, 10);
  let years = 0;
  while (new Date(c.start_date).getTime() + years * 365.25 * 864e5 < Date.parse(today)) years++;
  return years;
};
const shiftDate = (d: string | null | undefined, years: number) =>
  d ? d.replace(/^\d{4}/, (y) => String(Number(y) + years)) : null;

const used = new Set(camps.map((c) => c.organisation_id));
const sql: string[] = [];

for (const o of orgs.filter((o) => used.has(o.id))) {
  sql.push(
    `INSERT INTO organisation (id,slug,name,about,logo_url,website,contact_email,contact_phone,address,verified,active,commission_rate,created_at,updated_at) VALUES (${[
      q(o.id), q(o.slug), q(o.name), q(o.about), q(rewrite(o.logo_url)), q(o.website), q(o.contact_email),
      q(o.contact_phone), q(o.address), q(!!o.verified), q(o.active !== false),
      q(Number(o.default_commission_rate) || 0.1), epoch(o.created_at), epoch(o.updated_at),
    ].join(',')});`,
  );
}

for (const c of camps.filter((c) => c.status === 'published')) {
  const years = shiftYears(c);
  const gallery = [...list(c.gallery_urls), ...(c.image_metadata ?? []).map(urlOf)].filter(Boolean).map(rewrite);
  const videos = [...list(c.video_urls), ...(c.video_metadata ?? []).map(urlOf), c.video_url].filter(Boolean);
  sql.push(
    `INSERT INTO camp (id,organisation_id,slug,name,description,category,location,address,age_min,age_max,start_date,end_date,price_cents,early_bird_cents,early_bird_deadline,currency,capacity,enrolled,status,featured,image,gallery,videos,highlights,amenities,faqs,included,not_included,what_to_bring,requirements,safety,cancellation_policy,published_at,created_at,updated_at) VALUES (${[
      q(c.id), q(c.organisation_id), q(c.slug), q(c.name), q(c.description), q(primaryCategory.get(c.id) ?? 'leadership'), q(c.location),
      q(c.address), q(c.age_min), q(c.age_max), q(shiftDate(c.start_date, years)), q(shiftDate(c.end_date, years)),
      q(Math.round(Number(c.price) * 100)),
      c.early_bird_price ? q(Math.round(Number(c.early_bird_price) * 100)) : 'NULL', q(shiftDate(c.early_bird_deadline, years)),
      q(c.currency ?? 'USD'), q(c.capacity), q(c.enrolled_count ?? 0), q('published'), q(!!c.featured),
      q(rewrite(c.featured_image_url)), json([...new Set(gallery)]), json([...new Set(videos.map(rewrite))]),
      json(list(c.highlights)), json(Array.isArray(c.amenities) ? c.amenities.filter((a: any) => a?.category && Array.isArray(a.items)) : []), json(faqs(c.faqs)),
      q(c.included_in_price), q(c.not_included_in_price), q(c.what_to_bring), q(c.requirements),
      q(c.safety_protocols), q(c.cancellation_policy), epoch(c.published_at), epoch(c.created_at), epoch(c.updated_at),
    ].join(',')});`,
  );
}

writeFileSync(join(import.meta.dirname, 'seed.sql'), sql.join('\n') + '\n');

let fetched = 0;
for (const [key, url] of mediaToFetch) {
  const dest = join(import.meta.dirname, 'media', key);
  if (existsSync(dest)) continue;
  const res = await fetch(url);
  if (!res.ok) { console.warn(`skip ${key}: ${res.status}`); continue; }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  fetched++;
}
console.log(`${sql.length} rows → seed.sql, ${fetched}/${mediaToFetch.size} media files downloaded`);
