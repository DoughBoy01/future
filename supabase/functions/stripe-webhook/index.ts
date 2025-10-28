import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.7.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(
          JSON.stringify({ error: 'Webhook signature verification failed' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      event = JSON.parse(body);
    }

    console.log('Webhook event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const registrationId = session.metadata?.registrationId;

        if (!registrationId) {
          console.error('Missing registrationId in session metadata');
          break;
        }

        const paymentIntent = session.payment_intent as string;
        const amountTotal = session.amount_total ? session.amount_total / 100 : 0;

        await supabase
          .from('payment_records')
          .update({
            stripe_payment_intent_id: paymentIntent,
            status: 'succeeded',
            payment_method: session.payment_method_types?.[0] || 'card',
            paid_at: new Date().toISOString(),
            metadata: {
              customer_email: session.customer_email,
              customer_details: session.customer_details,
            },
          })
          .eq('stripe_checkout_session_id', session.id);

        const { data: registrations } = await supabase
          .from('registrations')
          .select('id, amount_due')
          .eq('stripe_checkout_session_id', session.id);

        if (registrations && registrations.length > 0) {
          for (const reg of registrations) {
            await supabase
              .from('registrations')
              .update({
                payment_status: 'paid',
                amount_paid: reg.amount_due,
                status: 'confirmed',
                confirmation_date: new Date().toISOString(),
              })
              .eq('id', reg.id);
          }
          console.log(`Payment successful for ${registrations.length} registration(s)`);
        }

        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;

        await supabase
          .from('payment_records')
          .update({
            status: 'failed',
            metadata: { reason: 'Session expired' },
          })
          .eq('stripe_checkout_session_id', session.id);

        console.log('Checkout session expired:', session.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await supabase
          .from('payment_records')
          .update({
            status: 'failed',
            metadata: {
              failure_code: paymentIntent.last_payment_error?.code,
              failure_message: paymentIntent.last_payment_error?.message,
            },
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        console.log('Payment failed:', paymentIntent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntent = charge.payment_intent as string;

        const { data: paymentRecord } = await supabase
          .from('payment_records')
          .select('registration_id')
          .eq('stripe_payment_intent_id', paymentIntent)
          .single();

        if (paymentRecord) {
          await supabase
            .from('payment_records')
            .update({
              status: 'refunded',
              metadata: { refund_amount: charge.amount_refunded / 100 },
            })
            .eq('stripe_payment_intent_id', paymentIntent);

          await supabase
            .from('registrations')
            .update({
              payment_status: 'refunded',
              status: 'cancelled',
            })
            .eq('id', paymentRecord.registration_id);

          console.log('Charge refunded for registration:', paymentRecord.registration_id);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Webhook processing failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
