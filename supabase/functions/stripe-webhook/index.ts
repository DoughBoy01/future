import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.7.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

/**
 * Sends booking confirmation email to parent
 * Non-blocking - doesn't prevent webhook processing if email fails
 */
async function sendBookingConfirmationEmail(
  bookings: any[],
  totalAmount: number,
  supabase: any
) {
  try {
    // Get parent data
    const { data: parentData, error: parentError } = await supabase
      .from('parents')
      .select('*')
      .eq('id', bookings[0].parent_id)
      .single();

    if (parentError || !parentData) {
      console.error('Failed to fetch parent data for email:', parentError?.message);
      return;
    }

    // Get camp data
    const { data: campData, error: campError } = await supabase
      .from('camps')
      .select('name, start_date, end_date, location')
      .eq('id', bookings[0].camp_id)
      .single();

    if (campError || !campData) {
      console.error('Failed to fetch camp data for email:', campError?.message);
      return;
    }

    // Get children details
    const childIds = bookings.map((b: any) => b.child_id);
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select('first_name, last_name')
      .in('id', childIds);

    if (childrenError || !children || children.length === 0) {
      console.error('Failed to fetch children data for email:', childrenError?.message);
      return;
    }

    // Determine recipient email and name
    let recipientEmail: string;
    let recipientName: string;

    if (parentData.is_guest) {
      recipientEmail = parentData.guest_email;
      recipientName = parentData.guest_name;
    } else {
      // For authenticated users, fetch email from auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
        parentData.profile_id
      );

      if (userError || !userData?.user?.email) {
        console.error('Failed to fetch user email:', userError?.message);
        return;
      }

      recipientEmail = userData.user.email;
      recipientName = `${parentData.first_name || ''} ${parentData.last_name || ''}`.trim() || 'Parent';
    }

    if (!recipientEmail) {
      console.error('No recipient email found for parent:', parentData.id);
      return;
    }

    // Get app URL for child details link
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';

    // Send email via send-email Edge Function
    console.log(`📧 Sending booking confirmation email to ${recipientEmail}`);
    await supabase.functions.invoke('send-email', {
      body: {
        template: 'booking-confirmation',
        to: { email: recipientEmail, name: recipientName },
        data: {
          parentName: recipientName,
          campName: campData.name,
          campStartDate: campData.start_date,
          campEndDate: campData.end_date,
          campLocation: campData.location,
          children: children.map((c: any) => ({
            firstName: c.first_name,
            lastName: c.last_name,
          })),
          totalAmount: totalAmount / 100, // Stripe amount in cents
          bookingId: bookings[0].id,
          childDetailsUrl: `${appUrl}/registration/${bookings[0].id}/child-details`,
        },
        context: {
          type: 'booking',
          id: bookings[0].id,
          profile_id: parentData.profile_id,
        },
      },
    });

    console.log('✅ Booking confirmation email sent');
  } catch (error: any) {
    console.error('❌ Error sending booking confirmation email:', error.message);
    // Non-blocking - don't fail webhook processing if email fails
  }
}

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
    // Try SERVICE_ROLE_KEY first (custom secret), fallback to SUPABASE_SERVICE_ROLE_KEY (built-in)
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Debug logging for environment variables
    console.log('Environment check:');
    console.log('- SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('- SERVICE_ROLE_KEY:', Deno.env.get('SERVICE_ROLE_KEY') ? `Set (length: ${Deno.env.get('SERVICE_ROLE_KEY')?.length})` : 'Missing');
    console.log('- SUPABASE_SERVICE_ROLE_KEY (fallback):', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? `Set (length: ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.length})` : 'Missing');
    console.log('- Using key with length:', supabaseServiceKey ? supabaseServiceKey.length : 'Missing');
    console.log('- STRIPE_SECRET_KEY:', stripeSecretKey ? 'Set' : 'Missing');
    console.log('- STRIPE_WEBHOOK_SECRET:', webhookSecret ? 'Set' : 'Missing');

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
      // SECURITY: Reject unverified events - webhook secret is required
      console.error('Webhook secret not configured - rejecting unverified event');
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Webhook event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const registrationId = session.metadata?.registrationId;
        const campId = session.metadata?.campId;
        const organisationId = session.metadata?.organisationId;
        const chargeType = session.metadata?.chargeType;

        if (!registrationId) {
          console.error('Missing registrationId in session metadata');
          break;
        }

        const paymentIntentId = session.payment_intent as string;
        const amountTotal = session.amount_total ? session.amount_total / 100 : 0;

        // For direct charges, fetch the PaymentIntent to get application_fee_id
        let applicationFeeId = null;
        let applicationFeeAmount = null;

        if (chargeType === 'direct' && paymentIntentId) {
          try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            applicationFeeId = paymentIntent.application_fee as string | null;

            // If application fee exists, get the amount
            if (applicationFeeId) {
              const applicationFee = await stripe.applicationFees.retrieve(applicationFeeId);
              applicationFeeAmount = applicationFee.amount / 100; // Convert to dollars
              console.log(`Application fee captured: ${applicationFeeId} ($${applicationFeeAmount})`);
            }
          } catch (err) {
            console.error('Error retrieving application fee:', err);
          }
        }

        // Update payment record with application fee details
        console.log('Updating payment record for session:', session.id);
        const { error: paymentUpdateError } = await supabase
          .from('payment_records')
          .update({
            stripe_payment_intent_id: paymentIntentId,
            application_fee_id: applicationFeeId,
            status: 'succeeded',
            payment_method: session.payment_method_types?.[0] || 'card',
            paid_at: new Date().toISOString(),
            metadata: {
              customer_email: session.customer_email,
              customer_details: session.customer_details,
              application_fee_captured: applicationFeeId ? true : false,
            },
          })
          .eq('stripe_checkout_session_id', session.id);

        if (paymentUpdateError) {
          console.error('Payment record update error:', paymentUpdateError);
          console.error('Error details:', JSON.stringify(paymentUpdateError, null, 2));
        } else {
          console.log('Payment record updated successfully');
        }

        // Update bookings (formerly registrations)
        console.log('Fetching bookings for session:', session.id);
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, amount_due, camp_id')
          .eq('stripe_checkout_session_id', session.id);

        if (bookingsError) {
          console.error('Bookings query error:', bookingsError);
          console.error('Error details:', JSON.stringify(bookingsError, null, 2));
          return new Response(
            JSON.stringify({
              code: 401,
              message: 'Missing authorization header',
              details: bookingsError
            }),
            {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }

        console.log('Found bookings:', bookings?.length || 0);

        if (bookings && bookings.length > 0) {
          for (const booking of bookings) {
            console.log('Updating booking:', booking.id);

            // Stripe payment succeeded - set to paid and confirmed in one update
            const { error: bookingUpdateError } = await supabase
              .from('bookings')
              .update({
                payment_status: 'paid',
                amount_paid: booking.amount_due,
                status: 'confirmed',
                confirmation_date: new Date().toISOString(),
              })
              .eq('id', booking.id);

            if (bookingUpdateError) {
              console.error('Booking update error:', bookingUpdateError);
              console.error('Error details:', JSON.stringify(bookingUpdateError, null, 2));

              // Return error to help debug the database issue
              return new Response(
                JSON.stringify({
                  error: 'Failed to update booking',
                  details: bookingUpdateError,
                  booking_id: booking.id
                }),
                {
                  status: 500,
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
              );
            } else {
              console.log('Booking updated successfully:', booking.id);
            }

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
                stripe_application_fee_id: applicationFeeId,
                actual_fee_collected: applicationFeeAmount || commissionAmount,
                payment_status: chargeType === 'direct' ? 'collected' : 'pending',
                created_at: new Date().toISOString(),
              });

              console.log(`Commission record created: ${commissionAmount} (${commissionRate * 100}%) - Application fee: ${applicationFeeId || 'N/A'}`);
            }
          }
          console.log(`Payment successful for ${bookings.length} booking(s)`);

          // Send booking confirmation email (non-blocking)
          if (bookings && bookings.length > 0) {
            sendBookingConfirmationEmail(
              bookings,
              amountTotal,
              supabase
            ).catch(err => console.error('Email send error:', err));
          }
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
        const isFullRefund = charge.amount_refunded === charge.amount;
        const refundAmount = charge.amount_refunded / 100;

        // Calculate application fee refund amount
        let refundApplicationFeeAmount = 0;
        if (charge.application_fee_amount) {
          // Proportional refund of application fee
          const refundPercentage = charge.amount_refunded / charge.amount;
          refundApplicationFeeAmount = (charge.application_fee_amount / 100) * refundPercentage;
        }

        const { data: paymentRecord } = await supabase
          .from('payment_records')
          .select('registration_id, booking_id, amount, application_fee_id, charge_type')
          .eq('stripe_payment_intent_id', paymentIntent)
          .single();

        if (paymentRecord) {
          // Update payment record with refund details
          await supabase
            .from('payment_records')
            .update({
              status: isFullRefund ? 'refunded' : 'partially_refunded',
              refund_amount: refundAmount,
              refund_application_fee_amount: refundApplicationFeeAmount,
              metadata: {
                refund_amount: refundAmount,
                refund_application_fee_amount: refundApplicationFeeAmount,
                original_amount: charge.amount / 100,
                is_full_refund: isFullRefund
              },
            })
            .eq('stripe_payment_intent_id', paymentIntent);

          // Use booking_id (preferred) or fall back to registration_id
          const bookingId = paymentRecord.booking_id || paymentRecord.registration_id;

          if (bookingId) {
            // Only cancel booking if fully refunded
            if (isFullRefund) {
              await supabase
                .from('bookings')
                .update({
                  payment_status: 'refunded',
                  status: 'cancelled',
                })
                .eq('id', bookingId);

              console.log('Full refund processed, booking cancelled:', bookingId);
            } else {
              // Partial refund - update amount but keep booking active
              await supabase
                .from('bookings')
                .update({
                  payment_status: 'partially_refunded',
                  amount_paid: (paymentRecord.amount || 0) - refundAmount,
                })
                .eq('id', bookingId);

              console.log('Partial refund processed:', refundAmount, 'for booking:', bookingId);
            }

            // Update commission record if application fee was refunded
            if (refundApplicationFeeAmount > 0) {
              const { data: commissionRecord } = await supabase
                .from('commission_records')
                .select('id, actual_fee_collected')
                .eq('booking_id', bookingId)
                .single();

              if (commissionRecord) {
                const newFeeCollected = (commissionRecord.actual_fee_collected || 0) - refundApplicationFeeAmount;

                await supabase
                  .from('commission_records')
                  .update({
                    actual_fee_collected: newFeeCollected,
                    payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
                  })
                  .eq('id', commissionRecord.id);

                console.log(`Commission adjusted: -$${refundApplicationFeeAmount} (new total: $${newFeeCollected})`);
              }
            }
          }
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
