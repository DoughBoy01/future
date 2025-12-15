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
        const campId = session.metadata?.campId;
        const organisationId = session.metadata?.organisationId;

        if (!registrationId) {
          console.error('Missing registrationId in session metadata');
          break;
        }

        const paymentIntent = session.payment_intent as string;
        const amountTotal = session.amount_total ? session.amount_total / 100 : 0;

        // Update payment record
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

        // Update bookings (formerly registrations)
        const { data: bookings } = await supabase
          .from('bookings')
          .select('id, amount_due, camp_id')
          .eq('stripe_checkout_session_id', session.id);

        if (bookings && bookings.length > 0) {
          for (const booking of bookings) {
            await supabase
              .from('bookings')
              .update({
                payment_status: 'paid',
                amount_paid: booking.amount_due,
                status: 'confirmed',
                confirmation_date: new Date().toISOString(),
              })
              .eq('id', booking.id);

            // Create commission record for this booking
            const { data: camp } = await supabase
              .from('camps')
              .select('commission_rate, organisation_id')
              .eq('id', booking.camp_id)
              .single();

            if (camp) {
              const commissionRate = camp.commission_rate || 0.15;
              const commissionAmount = booking.amount_due * commissionRate;

              await supabase.from('commission_records').insert({
                booking_id: booking.id,
                camp_id: booking.camp_id,
                organisation_id: camp.organisation_id,
                commission_rate: commissionRate,
                registration_amount: booking.amount_due,
                commission_amount: commissionAmount,
                payment_status: 'pending',
                created_at: new Date().toISOString(),
              });

              console.log(`Commission record created: ${commissionAmount} (${commissionRate * 100}%)`);
            }
          }
          console.log(`Payment successful for ${bookings.length} booking(s)`);
        }

        break;
      }

      case 'account.updated': {
        // Stripe Connect account status changed
        const account = event.data.object as Stripe.Account;
        const organisationId = account.metadata?.organisation_id;

        if (organisationId) {
          await supabase
            .from('organisations')
            .update({
              stripe_account_status: account.details_submitted ? 'active' : 'pending',
              payout_enabled: account.payouts_enabled || false,
              updated_at: new Date().toISOString(),
            })
            .eq('id', organisationId);

          console.log('Account updated:', account.id, account.details_submitted);
        }
        break;
      }

      case 'transfer.created': {
        // Transfer to connected account created
        const transfer = event.data.object as Stripe.Transfer;
        console.log('Transfer created:', transfer.id, transfer.amount / 100);
        break;
      }

      case 'transfer.paid': {
        // Transfer successfully sent to connected account
        const transfer = event.data.object as Stripe.Transfer;
        console.log('Transfer paid:', transfer.id, transfer.amount / 100);
        break;
      }

      case 'payout.paid': {
        // Payout sent to connected account bank
        const payout = event.data.object as Stripe.Payout;

        // Update payout record if it exists
        await supabase
          .from('payouts')
          .update({
            status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payout_id', payout.id);

        console.log('Payout paid:', payout.id, payout.amount / 100);
        break;
      }

      case 'payout.failed': {
        // Payout failed
        const payout = event.data.object as Stripe.Payout;

        await supabase
          .from('payouts')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payout_id', payout.id);

        console.log('Payout failed:', payout.id);
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
