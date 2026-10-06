import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, asc, desc, eq } from 'drizzle-orm';
import { attendee, booking, camp, organisation } from '../db/schema';
import { getDb } from '../lib/db';
import { createStripe } from '../lib/stripe';
import { quote, platformFee } from '../../../shared/pricing';
import { findValidDiscount } from '../lib/discounts';
import { confirmBooking } from '../lib/bookings';
import { requireUser } from '../lib/guards';
import type { AppEnv } from '../env';

const MAX_ATTENDEES = 10;

const createBody = z.object({
  campId: z.string().min(1),
  attendees: z
    .array(
      z.object({
        firstName: z.string().trim().min(1).max(80),
        lastName: z.string().trim().min(1).max(80),
        age: z.number().int().min(0).max(30).optional(),
      }),
    )
    .min(1)
    .max(MAX_ATTENDEES),
  contact: z
    .object({
      name: z.string().trim().min(1).max(120),
      email: z.string().trim().email().max(200),
      phone: z.string().trim().max(40).optional(),
    })
    .optional(),
  discountCode: z.string().trim().max(40).optional(),
});

const optionalText = z.string().trim().max(2000).nullable().optional();
const detailsBody = z.object({
  attendees: z
    .array(
      z.object({
        id: z.string(),
        dateOfBirth: z.string().trim().max(10).nullable().optional(),
        gender: optionalText,
        allergies: optionalText,
        medicalConditions: optionalText,
        medications: optionalText,
        medicationInstructions: optionalText,
        dietaryRequirements: optionalText,
        specialNeeds: optionalText,
        emergencyName: optionalText,
        emergencyPhone: optionalText,
        emergencyRelationship: optionalText,
        doctorName: optionalText,
        doctorPhone: optionalText,
        tShirtSize: optionalText,
        pickupAuthorized: optionalText,
        notes: optionalText,
        photoPermission: z.boolean().optional(),
        mediaPermission: z.boolean().optional(),
        fieldTripPermission: z.boolean().optional(),
        waterPermission: z.boolean().optional(),
      }),
    )
    .min(1)
    .max(MAX_ATTENDEES),
});

const summary = {
  id: booking.id,
  status: booking.status,
  currency: booking.currency,
  subtotalCents: booking.subtotalCents,
  discountCents: booking.discountCents,
  totalCents: booking.totalCents,
  paidAt: booking.paidAt,
  detailsCompletedAt: booking.detailsCompletedAt,
  createdAt: booking.createdAt,
  contactName: booking.contactName,
  contactEmail: booking.contactEmail,
  camp: { id: camp.id, slug: camp.slug, name: camp.name, location: camp.location, startDate: camp.startDate, endDate: camp.endDate, image: camp.image },
};

/** Only the origin the request came from (or a configured dev origin) may be redirected back to. */
function returnOrigin(c: { req: { url: string; header: (n: string) => string | undefined }; env: AppEnv['Bindings'] }) {
  const own = new URL(c.req.url).origin;
  const allowed = new Set([own, ...(c.env.TRUSTED_ORIGINS?.split(',').map((o) => o.trim()) ?? [])]);
  const claimed = c.req.header('origin');
  return claimed && allowed.has(claimed) ? claimed : own;
}

export const bookings = new Hono<AppEnv>()
  // Price preview / discount check. Prices are always recomputed server-side at booking time.
  .post(
    '/quote',
    zValidator('json', z.object({ campId: z.string(), quantity: z.number().int().min(1).max(MAX_ATTENDEES), discountCode: z.string().trim().max(40).optional() })),
    async (c) => {
      const input = c.req.valid('json');
      const db = getDb(c.env.DB);
      const [target] = await db.select().from(camp).where(and(eq(camp.id, input.campId), eq(camp.status, 'published'))).limit(1);
      if (!target) return c.json({ error: 'Camp not found' }, 404);
      const discount = input.discountCode ? await findValidDiscount(db, input.discountCode, target.id) : null;
      if (input.discountCode && !discount) return c.json({ error: 'That discount code is not valid for this camp.' }, 422);
      return c.json({
        currency: target.currency,
        ...quote(target, input.quantity, discount),
        discount: discount ? { code: discount.code, kind: discount.kind, value: discount.value } : null,
      });
    },
  )

  .post('/', zValidator('json', createBody), async (c) => {
    const input = c.req.valid('json');
    const db = getDb(c.env.DB);
    const current = c.get('user');
    const contact = input.contact ?? (current ? { name: current.name, email: current.email, phone: undefined } : null);
    if (!contact) return c.json({ error: 'Please add your name and email to continue.' }, 400);

    const stripe = createStripe(c.env);
    if (!stripe) return c.json({ error: 'Online payments are not available yet. Please check back soon.' }, 503);

    const [row] = await db
      .select({ camp, org: organisation })
      .from(camp)
      .innerJoin(organisation, eq(camp.organisationId, organisation.id))
      .where(and(eq(camp.id, input.campId), eq(camp.status, 'published')))
      .limit(1);
    if (!row) return c.json({ error: 'This camp is no longer available.' }, 404);
    const { camp: target, org } = row;

    if (target.startDate < new Date().toISOString().slice(0, 10)) return c.json({ error: 'This camp has already started.' }, 409);
    const places = target.capacity - target.enrolled;
    if (input.attendees.length > places) {
      return c.json({ error: places > 0 ? `Only ${places} place${places === 1 ? '' : 's'} left.` : 'This camp is full.' }, 409);
    }

    const discount = input.discountCode ? await findValidDiscount(db, input.discountCode, target.id) : null;
    if (input.discountCode && !discount) return c.json({ error: 'That discount code is not valid for this camp.' }, 422);
    const price = quote(target, input.attendees.length, discount);

    const direct = !!org.stripeAccountId && org.stripeStatus === 'active';
    const feeCents = direct ? platformFee(price.totalCents, org.commissionRate) : 0;
    const id = crypto.randomUUID();

    await db.batch([
      db.insert(booking).values({
        id,
        campId: target.id,
        userId: current?.id ?? null,
        contactName: contact.name,
        contactEmail: contact.email,
        contactPhone: contact.phone ?? null,
        currency: target.currency,
        subtotalCents: price.subtotalCents,
        discountCents: price.discountCents,
        totalCents: price.totalCents,
        discountCode: discount?.code ?? null,
        chargeType: direct ? 'direct' : 'platform',
        applicationFeeCents: feeCents,
      }),
      ...input.attendees.map((a) => db.insert(attendee).values({ bookingId: id, firstName: a.firstName, lastName: a.lastName, age: a.age ?? null })),
    ]);

    // Nothing to charge (100% discount): confirm straight away.
    if (price.totalCents === 0) {
      await confirmBooking(db, id, { sessionId: `free_${id}`, paymentIntentId: null });
      return c.json({ bookingId: id, url: null, free: true }, 201);
    }

    const origin = returnOrigin(c);
    try {
      const session = await stripe.checkout.sessions.create(
        {
          mode: 'payment',
          customer_email: contact.email,
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: target.currency.toLowerCase(),
                unit_amount: price.totalCents,
                product_data: {
                  name: target.name,
                  description: `${input.attendees.length} place${input.attendees.length === 1 ? '' : 's'} · ${target.startDate} to ${target.endDate}`,
                },
              },
            },
          ],
          success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/camps/${target.slug}/register`,
          metadata: { bookingId: id, campId: target.id, organisationId: org.id },
          payment_intent_data: {
            metadata: { bookingId: id },
            ...(direct && { application_fee_amount: feeCents }),
          },
        },
        { idempotencyKey: `checkout_${id}`, ...(direct && { stripeAccount: org.stripeAccountId! }) },
      );
      await db.update(booking).set({ stripeSessionId: session.id }).where(eq(booking.id, id));
      return c.json({ bookingId: id, url: session.url }, 201);
    } catch (err) {
      console.error('Stripe checkout failed', err);
      await db.update(booking).set({ status: 'cancelled' }).where(eq(booking.id, id));
      return c.json({ error: 'We could not start the payment. Please try again.' }, 502);
    }
  })

  // The signed-in parent's bookings.
  .get('/', async (c) => {
    const current = requireUser(c);
    if (current instanceof Response) return current;
    const rows = await getDb(c.env.DB)
      .select(summary)
      .from(booking)
      .innerJoin(camp, eq(booking.campId, camp.id))
      .where(and(eq(booking.userId, current.id)))
      .orderBy(desc(booking.createdAt));
    return c.json({ bookings: rows });
  })

  // Where Stripe sends the parent after paying. The session id is the (unguessable) credential.
  .get('/by-session/:sessionId', async (c) => {
    const db = getDb(c.env.DB);
    const [row] = await db
      .select(summary)
      .from(booking)
      .innerJoin(camp, eq(booking.campId, camp.id))
      .where(eq(booking.stripeSessionId, c.req.param('sessionId')))
      .limit(1);
    return row ? c.json({ booking: row }) : c.json({ error: 'Booking not found' }, 404);
  })

  // A booking is readable by its owner, or, for guest bookings, by anyone holding its id (it is emailed to them).
  .get('/:id', async (c) => {
    const db = getDb(c.env.DB);
    const [row] = await db.select(summary).from(booking).innerJoin(camp, eq(booking.campId, camp.id)).where(eq(booking.id, c.req.param('id'))).limit(1);
    const owner = await ownerOf(db, c.req.param('id'));
    if (!row || !canAccess(c.get('user'), owner)) return c.json({ error: 'Booking not found' }, 404);
    const attendees = await db.select().from(attendee).where(eq(attendee.bookingId, row.id)).orderBy(asc(attendee.createdAt));
    return c.json({ booking: row, attendees });
  })

  .put('/:id/attendees', zValidator('json', detailsBody), async (c) => {
    const db = getDb(c.env.DB);
    const bookingId = c.req.param('id');
    const owner = await ownerOf(db, bookingId);
    if (!owner || !canAccess(c.get('user'), owner)) return c.json({ error: 'Booking not found' }, 404);
    if (owner.status !== 'confirmed') return c.json({ error: 'Details can be added once payment is complete.' }, 409);

    const known = new Set((await db.select({ id: attendee.id }).from(attendee).where(eq(attendee.bookingId, bookingId))).map((a) => a.id));
    const updates = c.req.valid('json').attendees;
    if (updates.some((a) => !known.has(a.id))) return c.json({ error: 'Unknown attendee' }, 400);

    await db.batch([
      db.update(booking).set({ updatedAt: new Date() }).where(eq(booking.id, bookingId)),
      ...updates.map(({ id, ...fields }) => db.update(attendee).set(fields).where(and(eq(attendee.id, id), eq(attendee.bookingId, bookingId)))),
    ]);

    // The booking's details are complete once every child has the essentials.
    const all = await db.select({ dob: attendee.dateOfBirth, name: attendee.emergencyName, phone: attendee.emergencyPhone }).from(attendee).where(eq(attendee.bookingId, bookingId));
    const complete = all.every((a) => a.dob && a.name && a.phone);
    await db.update(booking).set({ detailsCompletedAt: complete ? new Date() : null }).where(eq(booking.id, bookingId));
    return c.json({ ok: true as const, complete });
  });

async function ownerOf(db: ReturnType<typeof getDb>, id: string) {
  const [row] = await db.select({ userId: booking.userId, status: booking.status }).from(booking).where(eq(booking.id, id)).limit(1);
  return row ?? null;
}

function canAccess(user: AppEnv['Variables']['user'], owner: { userId: string | null } | null) {
  if (!owner) return false;
  if (owner.userId === null) return true; // guest booking: the id is the credential
  return !!user && (user.id === owner.userId || user.role === 'admin');
}
