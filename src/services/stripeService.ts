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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        // Retry on server errors (5xx), but not client errors (4xx)
        if (response.status >= 500 && attempt < maxRetries) {
          console.warn(`Checkout session creation failed (attempt ${attempt}/${maxRetries}), retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
          continue;
        }
        throw new Error(error.message || 'Failed to create checkout session');
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      // Only retry on network errors, not application errors
      if (attempt < maxRetries && !(error as Error).message?.includes('Failed to create')) {
        console.warn(`Network error (attempt ${attempt}/${maxRetries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
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
  window.location.href = checkoutUrl;
}
