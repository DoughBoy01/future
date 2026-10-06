import { Hono } from 'hono';
import type Stripe from 'stripe';
import { and, eq, inArray } from 'drizzle-orm';
import { booking } from '../db/schema';
import { getDb } from '../lib/db';
import { confirmBooking } from '../lib/bookings';
import { createStripe, cryptoProvider } from '../lib/stripe';
import type { AppEnv } from '../env';

export const stripeWebhook = new Hono<AppEnv>().post('/', async (c) => {
  const stripe = createStripe(c.env);
  const secrets = [c.env.STRIPE_WEBHOOK_SECRET, c.env.STRIPE_CONNECT_WEBHOOK_SECRET].filter((s): s is string => !!s);
  const signature = c.req.header('stripe-signature');
  // Never process an event we cannot verify.
  if (!stripe || !secrets.length) return c.json({ error: 'Webhook not configured' }, 503);
  if (!signature) return c.json({ error: 'Missing signature' }, 400);

  const body = await c.req.text();
  let event: Stripe.Event | null = null;
  for (const secret of secrets) {
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, secret, undefined, cryptoProvider);
      break;
    } catch {
      /* try the next secret */
    }
  }
  if (!event) return c.json({ error: 'Invalid signature' }, 400);

  const db = getDb(c.env.DB);

  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;
      if (bookingId && session.payment_status === 'paid') {
        const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? null);
        await confirmBooking(db, bookingId, { sessionId: session.id, paymentIntentId: paymentIntent });
      }
      break;
    }
    case 'checkout.session.expired':
    case 'checkout.session.async_payment_failed': {
      const bookingId = (event.data.object as Stripe.Checkout.Session).metadata?.bookingId;
      if (bookingId) {
        await db.update(booking).set({ status: 'expired' }).where(and(eq(booking.id, bookingId), eq(booking.status, 'pending')));
      }
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const pi = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
      if (pi && charge.refunded) {
        await db.update(booking).set({ status: 'refunded' }).where(and(eq(booking.stripePaymentIntentId, pi), inArray(booking.status, ['confirmed'])));
      }
      break;
    }
  }

  return c.json({ received: true });
});
