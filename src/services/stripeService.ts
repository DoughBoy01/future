import { supabase } from '../lib/supabase';

export interface CreateCheckoutSessionParams {
  campId: string;
  campName: string;
  childId: string;
  amount: number;
  currency: string;
  registrationId: string;
}

export interface StripeCheckoutResponse {
  sessionId: string;
  url: string;
}

export async function createStripeCheckoutSession(
  params: CreateCheckoutSessionParams,
  maxRetries = 3
): Promise<StripeCheckoutResponse> {
  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  if (!stripePublishableKey) {
    throw new Error('Stripe is not configured. Please set up your Stripe API keys.');
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: params,
      });

      if (error) {
        const status = (error as { status?: number }).status ?? 0;
        if (status >= 500 && attempt < maxRetries) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }
        throw new Error(error.message || 'Failed to create checkout session');
      }

      return data as StripeCheckoutResponse;
    } catch (error) {
      lastError = error as Error;
      const isRetryable =
        !(lastError.message?.includes('Failed to create')) &&
        !(lastError.message?.includes('not configured'));

      if (attempt < maxRetries && isRetryable) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
    }
  }

  throw lastError || new Error('Failed to create checkout session after retries');
}

export async function verifyPaymentStatus(sessionId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('payment_records')
      .select('status')
      .eq('stripe_checkout_session_id', sessionId)
      .maybeSingle();

    if (error) throw error;
    return data?.status === 'succeeded';
  } catch (error) {
    console.error('Error verifying payment status:', error);
    return false;
  }
}

export async function getPaymentRecord(registrationId: string) {
  try {
    const { data, error } = await supabase
      .from('payment_records')
      .select('*')
      .eq('registration_id', registrationId)
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching payment record:', error);
    return null;
  }
}

export function redirectToStripeCheckout(checkoutUrl: string) {
  const url = new URL(checkoutUrl);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error('Invalid checkout URL');
  }
  window.location.href = checkoutUrl;
}
