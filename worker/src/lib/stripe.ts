import Stripe from 'stripe';
import type { Bindings } from '../env';

/** Null when no key is configured: callers answer "payments are not set up" instead of failing. */
export function createStripe(env: Bindings): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  const base = env.STRIPE_API_BASE ? new URL(env.STRIPE_API_BASE) : null;
  return new Stripe(env.STRIPE_SECRET_KEY, {
    httpClient: Stripe.createFetchHttpClient(),
    ...(base && {
      host: base.hostname,
      port: base.port || (base.protocol === 'https:' ? '443' : '80'),
      protocol: base.protocol.replace(':', '') as 'http' | 'https',
    }),
  });
}

export const cryptoProvider = Stripe.createSubtleCryptoProvider();
