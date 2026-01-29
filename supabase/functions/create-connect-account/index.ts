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

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized: ' + (userError?.message || 'No user'));
    }

    const { organisationId, refreshUrl, returnUrl, mode = 'full' } = await req.json();
    console.log('Request params:', { organisationId, userId: user.id, mode });

    if (!organisationId) {
      throw new Error('Organisation ID is required');
    }

    // Verify user has permission to manage this organisation
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, organisation_id')
      .eq('id', user.id)
      .single();

    console.log('Profile fetch result:', { profile, error: profileError });

    if (profileError || !profile) {
      throw new Error('Profile not found: ' + (profileError?.message || 'Profile is null'));
    }

    if (profile.organisation_id !== organisationId && profile.role !== 'super_admin') {
      console.error('Authorization failed:', {
        profileOrgId: profile.organisation_id,
        requestedOrgId: organisationId,
        role: profile.role
      });
      throw new Error('Unauthorized to manage this organisation');
    }

    // Get organisation details
    const { data: org, error: orgError } = await supabaseClient
      .from('organisations')
      .select('id, name, contact_email, stripe_account_id')
      .eq('id', organisationId)
      .single();

    if (orgError || !org) {
      throw new Error('Organisation not found');
    }

    let accountId = org.stripe_account_id;

    // Create Stripe Connect account if it doesn't exist
    if (!accountId) {
      // Build account creation parameters
      const accountData: any = {
        type: 'express', // Express accounts have faster onboarding
        email: org.contact_email,
        country: 'US', // Required for deferred onboarding
        business_profile: {
          name: org.name,
        },
        metadata: {
          organisation_id: organisationId,
          onboarding_mode: mode,
        },
      };

      // For deferred mode, just request capabilities - Stripe automatically holds funds until verified
      if (mode === 'deferred') {
        accountData.capabilities = {
          card_payments: { requested: true },
          transfers: { requested: true },
        };
        console.log('Creating deferred onboarding account - funds will be held in pending balance automatically');
      } else {
        accountData.capabilities = {
          card_payments: { requested: true },
          transfers: { requested: true },
        };
        console.log('Creating full onboarding account');
      }

      const account = await stripe.accounts.create(accountData);
      accountId = account.id;

      // Update organisation with Stripe account ID and onboarding tracking
      const updateData: any = {
        stripe_account_id: accountId,
        stripe_account_status: 'pending',
        onboarding_mode: mode,
        onboarding_step: 'account_created',
        onboarding_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Enable temp charges for deferred mode (funds held until verification complete)
      if (mode === 'deferred') {
        updateData.temp_charges_enabled = true;
        console.log('Deferred mode: temp_charges_enabled set to true (funds held in pending balance)');
      }

      const { error: updateError } = await supabaseClient
        .from('organisations')
        .update(updateData)
        .eq('id', organisationId);

      if (updateError) {
        console.error('Error updating organisation:', updateError);
        throw new Error('Failed to save Stripe account ID');
      }
    }

    // Create account link for onboarding
    // For deferred mode, only collect currently_due requirements (minimal)
    // For full mode, collect eventually_due requirements (complete onboarding)
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl || `${Deno.env.get('FRONTEND_URL')}/organizer-dashboard`,
      return_url: returnUrl || `${Deno.env.get('FRONTEND_URL')}/organizer-dashboard`,
      type: 'account_onboarding',
      collect: mode === 'deferred' ? 'currently_due' : 'eventually_due',
    });

    console.log(`Account link created for ${mode} onboarding mode`);

    return new Response(
      JSON.stringify({
        success: true,
        accountId,
        accountLinkUrl: accountLink.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error creating Connect account:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create Connect account',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
