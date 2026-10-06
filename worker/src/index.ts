import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import type { AppEnv } from './env';
import { createAuth } from './lib/auth';
import { bookings } from './routes/bookings';
import { camps } from './routes/camps';
import { enquiries } from './routes/enquiries';
import { me } from './routes/me';
import { media } from './routes/media';
import { organisations } from './routes/organisations';
import { stripeWebhook } from './routes/stripe-webhook';

const app = new Hono<AppEnv>();

app.use('*', logger(), secureHeaders());

// Resolve the session once; routes read `c.get('user')` and ask `can(...)`.
app.use('/api/*', async (c, next) => {
  const auth = createAuth(c.env, new URL(c.req.url).origin);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  c.set('user', (session?.user as AppEnv['Variables']['user']) ?? null);
  await next();
});

app.on(['GET', 'POST'], '/api/auth/*', (c) =>
  createAuth(c.env, new URL(c.req.url).origin).handler(c.req.raw),
);

export const routes = app
  .get('/api/health', (c) => c.json({ ok: true }))
  .get('/api/config', (c) => c.json({ paymentsEnabled: !!c.env.STRIPE_SECRET_KEY }))
  .route('/api/bookings', bookings)
  .route('/api/camps', camps)
  .route('/api/stripe/webhook', stripeWebhook)
  .route('/api/enquiries', enquiries)
  .route('/api/me', me)
  .route('/api/organisations', organisations)
  .route('/media', media);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Something went wrong. Please try again.' }, 500);
});

export type AppType = typeof routes;
export default app;
