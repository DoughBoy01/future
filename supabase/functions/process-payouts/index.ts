import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2024-11-20.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Verify user is super admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      throw new Error('Unauthorized - admin access required');
    }

    const { organisationId, manual } = await req.json();

    const processedPayouts = [];
    const errors = [];

    // Get organizations ready for payout
    let query = supabaseClient
      .from('upcoming_payouts_summary')
      .select('*')
      .gt('total_pending_amount', 0);

    if (organisationId) {
      query = query.eq('organisation_id', organisationId);
    }

    const { data: payoutSummaries, error: summaryError } = await query;

    if (summaryError) {
      throw summaryError;
    }

    if (!payoutSummaries || payoutSummaries.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No pending payouts to process',
          processed: [],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    for (const summary of payoutSummaries) {
      try {
        // Check if organization meets payout criteria
        const { data: org } = await supabaseClient
          .from('organisations')
          .select('id, name, stripe_account_id, minimum_payout_amount, payout_schedule, payout_enabled')
          .eq('id', summary.organisation_id)
          .single();

        if (!org || !org.stripe_account_id || !org.payout_enabled) {
          errors.push({
            organisationId: summary.organisation_id,
            error: 'Organisation not set up for payouts',
          });
          continue;
        }

        // Check minimum payout amount
        const minimumAmount = org.minimum_payout_amount || 0;
        if (summary.total_pending_amount < minimumAmount && !manual) {
          console.log(
            `Skipping ${org.name}: Amount ${summary.total_pending_amount} below minimum ${minimumAmount}`
          );
          continue;
        }

        // Get all pending commission records for this organization
        const { data: commissions } = await supabaseClient
          .from('commission_records')
          .select('id, commission_amount, booking_id, camp_id')
          .eq('organisation_id', summary.organisation_id)
          .eq('payment_status', 'pending')
          .order('created_at', { ascending: true });

        if (!commissions || commissions.length === 0) {
          continue;
        }

        const totalAmount = commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
        const commissionIds = commissions.map((c) => c.id);

        // Create payout record
        const { data: payoutRecord, error: payoutError } = await supabaseClient
          .from('payouts')
          .insert({
            organisation_id: summary.organisation_id,
            amount: totalAmount,
            commission_amount: totalAmount,
            platform_fee: 0, // Already deducted via Stripe Connect
            period_start: summary.earliest_commission_date,
            period_end: new Date().toISOString(),
            commission_record_ids: commissionIds,
            status: 'processing',
            created_by: user.id,
          })
          .select()
          .single();

        if (payoutError) {
          throw payoutError;
        }

        // Note: With Stripe Connect destination charges, funds are automatically
        // transferred to the connected account. We don't need to create a separate transfer.
        // The payout happens automatically based on the connected account's payout schedule.

        // Mark commissions as paid
        await supabaseClient
          .from('commission_records')
          .update({
            payment_status: 'paid',
            paid_date: new Date().toISOString(),
            payment_reference: payoutRecord.id,
          })
          .in('id', commissionIds);

        // Update payout status to paid (since funds already transferred via Connect)
        await supabaseClient
          .from('payouts')
          .update({
            status: 'paid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payoutRecord.id);

        processedPayouts.push({
          organisationId: summary.organisation_id,
          organisationName: org.name,
          amount: totalAmount,
          commissionCount: commissions.length,
          payoutId: payoutRecord.id,
        });

        console.log(
          `Payout processed for ${org.name}: ${totalAmount} (${commissions.length} commissions)`
        );
      } catch (err: any) {
        console.error(`Error processing payout for org ${summary.organisation_id}:`, err);
        errors.push({
          organisationId: summary.organisation_id,
          error: err.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: processedPayouts,
        errors,
        summary: {
          totalOrganisations: payoutSummaries.length,
          successfulPayouts: processedPayouts.length,
          failedPayouts: errors.length,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error processing payouts:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process payouts',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
