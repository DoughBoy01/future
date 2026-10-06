import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import * as schema from '../db/schema';
import type { Bindings } from '../env';
import { getDb } from './db';
import { sendEmail } from './email';

export const createAuth = (env: Bindings, origin?: string) =>
  betterAuth({
    database: drizzleAdapter(getDb(env.DB), { provider: 'sqlite', schema }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL ?? origin,
    basePath: '/api/auth',
    trustedOrigins: env.TRUSTED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      sendResetPassword: async ({ user, url }) => {
        await sendEmail(env, { to: user.email, subject: 'Reset your FutureEdge password', text: `Reset your password: ${url}` });
      },
    },
    user: {
      additionalFields: {
        // `input: false` stops clients from choosing their own role at sign-up.
        role: { type: 'string', defaultValue: 'parent', input: false },
        organisationId: { type: 'string', required: false, input: false },
        phone: { type: 'string', required: false },
      },
    },
  });
