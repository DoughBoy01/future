import type { Role } from './db/schema';

export interface Bindings {
  DB: D1Database;
  MEDIA: R2Bucket;
  ASSETS: Fetcher;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  /** Comma-separated extra origins allowed to call the auth API (local dev only). */
  TRUSTED_ORIGINS?: string;
  /** Stripe secret key (`wrangler secret put STRIPE_SECRET_KEY`). Payments are disabled without it. */
  STRIPE_SECRET_KEY?: string;
  /** Signing secret of the webhook endpoint for platform events. */
  STRIPE_WEBHOOK_SECRET?: string;
  /** Signing secret of the webhook endpoint for connected-account events (direct charges). */
  STRIPE_CONNECT_WEBHOOK_SECRET?: string;
  /** Local development only: point the Stripe client at a fake Stripe server, e.g. http://localhost:12111 */
  STRIPE_API_BASE?: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  organisationId: string | null;
}

export type AppEnv = { Bindings: Bindings; Variables: { user: SessionUser | null } };
