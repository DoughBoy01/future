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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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

    const { organisationId } = await req.json();

    if (!organisationId) {
      throw new Error('Organisation ID is required');
    }

    // Get organisation with Stripe account ID
    const { data: org, error: orgError } = await supabaseClient
      .from('organisations')
      .select('stripe_account_id')
      .eq('id', organisationId)
      .single();

    if (orgError || !org || !org.stripe_account_id) {
      throw new Error('Stripe account not found for this organisation');
    }

    // Fetch account details from Stripe
    const account = await stripe.accounts.retrieve(org.stripe_account_id);

    // Determine if action is required
    const requiresAction = !account.details_submitted ||
                          (account.requirements?.currently_due?.length ?? 0) > 0 ||
                          (account.requirements?.eventually_due?.length ?? 0) > 0;

    let actionUrl = null;
    if (requiresAction) {
      // Create account link for required actions
      const accountLink = await stripe.accountLinks.create({
        account: org.stripe_account_id,
        refresh_url: `${Deno.env.get('FRONTEND_URL')}/organizer-dashboard`,
        return_url: `${Deno.env.get('FRONTEND_URL')}/organizer-dashboard`,
        type: 'account_onboarding',
      });
      actionUrl = accountLink.url;
    }

    // Update organisation with latest status
    const { error: updateError } = await supabaseClient
      .from('organisations')
      .update({
        stripe_account_status: account.details_submitted ? 'active' : 'pending',
        payout_enabled: account.payouts_enabled || false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', organisationId);

    if (updateError) {
      console.error('Error updating organisation status:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requiresAction,
        actionUrl,
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error fetching Connect account status:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to fetch account status',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
