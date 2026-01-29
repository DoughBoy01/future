import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { campId, campName, childId, amount, currency, registrationId } = await req.json();

    if (!campId || !campName || !childId || !registrationId || amount === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get camp details including organisation and commission rate
    const { data: camp, error: campError } = await supabase
      .from('camps')
      .select('organisation_id, commission_rate, organisations(stripe_account_id, stripe_account_status, payout_enabled, default_commission_rate)')
      .eq('id', campId)
      .single();

    if (campError || !camp) {
      throw new Error('Camp not found');
    }

    const org = camp.organisations;
    const totalAmount = Math.round(amount * 100); // Amount in cents
    const baseUrl = req.headers.get('origin') || 'http://localhost:5173';

    // Validate organization exists
    if (!org) {
      console.error('Organization not found for camp:', campId);
      throw new Error('Camp organization not found');
    }

    // Check if organization can accept payments
    const hasFullStripe = org && org.stripe_account_id && org.stripe_account_status === 'active' && org.payout_enabled;
    const hasDeferredStripe = org && org.stripe_account_id && (org as any).temp_charges_enabled && !(org as any).restrictions_active;
    const hasStripeConnect = hasFullStripe || hasDeferredStripe;

    // Log mode being used
    if (hasStripeConnect) {
      console.log(`✓ Payment capability verified for organization ${org.id}`);
      console.log(`  - Account: ${org.stripe_account_id}`);
      console.log(`  - Status: ${org.stripe_account_status}`);
      console.log(`  - Payouts: ${org.payout_enabled ? 'Enabled' : 'Disabled'}`);

      if (hasDeferredStripe && !hasFullStripe) {
        console.warn(`⚠ Using deferred mode - funds will be held in pending balance`);
        console.warn(`  - Deadline: ${(org as any).onboarding_deadline || 'N/A'}`);
        console.warn(`  - Pending balance: $${(org as any).pending_balance_amount || 0}`);
      }
    } else {
      console.warn(`⚠ No Stripe Connect - using test mode for organization ${org?.id || 'unknown'}`);
      console.warn(`  - stripe_account_id: ${org?.stripe_account_id || 'NULL'}`);
      console.warn(`  - stripe_account_status: ${org?.stripe_account_status || 'NULL'}`);
      console.warn(`  - payout_enabled: ${org?.payout_enabled || 'NULL'}`);
      console.warn(`  - temp_charges_enabled: ${(org as any).temp_charges_enabled || 'NULL'}`);
      console.warn(`  - restrictions_active: ${(org as any).restrictions_active || 'NULL'}`);
    }

    let session;
    let commissionRate = 0;
    let applicationFeeAmount = 0;

    if (hasStripeConnect) {
      // PRODUCTION MODE: Full Stripe Connect with payment splitting
      console.log('Using Stripe Connect mode');

      // Get effective commission rate using database function
      const { data: effectiveRate, error: rateError } = await supabase
        .rpc('get_effective_commission_rate', { camp_id: campId });

      if (rateError) {
        console.error('Error getting commission rate:', rateError);
        throw new Error('Failed to get commission rate');
      }

      commissionRate = effectiveRate || 0.15;
      applicationFeeAmount = Math.round(totalAmount * commissionRate);

      console.log(`Commission rate for camp ${campId}: ${(commissionRate * 100).toFixed(2)}% (${camp.commission_rate !== null ? 'custom' : 'org default'})`);

      // Create checkout session with DIRECT CHARGE (charge connected account directly)
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency || 'usd',
              product_data: {
                name: campName,
                description: `Camp registration`,
              },
              unit_amount: totalAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/camps/${campId}/register`,
        metadata: {
          registrationId,
          campId,
          childId,
          organisationId: camp.organisation_id,
          commissionRate: commissionRate.toString(),
          chargeType: 'direct',
        },
        payment_intent_data: {
          application_fee_amount: applicationFeeAmount,
          on_behalf_of: org.stripe_account_id, // DIRECT CHARGE: Charge connected account
          metadata: {
            registrationId,
            campId,
            organisationId: camp.organisation_id,
            commissionRate: commissionRate.toString(),
          },
        },
      }, {
        stripeAccount: org.stripe_account_id, // Create session in connected account context
        idempotencyKey: `checkout_${registrationId}_${Date.now().toString().slice(0, -4)}`,
      });
    } else {
      // TEST MODE: Simple payment without Stripe Connect
      console.log('Using test mode (no Stripe Connect)');

      // Create simple checkout session (all money goes to platform account)
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency || 'usd',
              product_data: {
                name: campName,
                description: `Camp registration (Test Mode)`,
              },
              unit_amount: totalAmount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/camps/${campId}/register`,
        metadata: {
          registrationId,
          campId,
          childId,
          organisationId: camp.organisation_id || 'test',
          testMode: 'true',
        },
      }, {
        idempotencyKey: `checkout_${registrationId}_${Date.now().toString().slice(0, -4)}`,
      });
    }

    // Create payment record with commission details
    await supabase.from('payment_records').insert({
      registration_id: registrationId,
      stripe_checkout_session_id: session.id,
      amount: amount,
      currency: currency || 'USD',
      status: 'pending',
      charge_type: hasStripeConnect ? 'direct' : 'platform_only',
      connected_account_id: hasStripeConnect ? org.stripe_account_id : null,
      application_fee_amount: hasStripeConnect ? applicationFeeAmount / 100 : null,
      metadata: {
        application_fee_amount: applicationFeeAmount / 100,
        commission_rate: commissionRate,
        connected_account: org?.stripe_account_id || null,
        test_mode: !hasStripeConnect,
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        commissionRate,
        applicationFee: applicationFeeAmount / 100,
        organizationReceives: (totalAmount - applicationFeeAmount) / 100,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create checkout session',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
