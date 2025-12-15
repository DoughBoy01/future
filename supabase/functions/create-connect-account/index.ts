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
      throw new Error('Unauthorized');
    }

    const { organisationId, refreshUrl, returnUrl } = await req.json();

    if (!organisationId) {
      throw new Error('Organisation ID is required');
    }

    // Verify user has permission to manage this organisation
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role, organisation_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('Profile not found');
    }

    if (profile.organisation_id !== organisationId && profile.role !== 'super_admin') {
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
      const account = await stripe.accounts.create({
        type: 'standard',
        email: org.contact_email,
        business_profile: {
          name: org.name,
        },
        metadata: {
          organisation_id: organisationId,
        },
      });

      accountId = account.id;

      // Update organisation with Stripe account ID
      const { error: updateError } = await supabaseClient
        .from('organisations')
        .update({
          stripe_account_id: accountId,
          stripe_account_status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', organisationId);

      if (updateError) {
        console.error('Error updating organisation:', updateError);
        throw new Error('Failed to save Stripe account ID');
      }
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl || `${Deno.env.get('FRONTEND_URL')}/organizer-dashboard`,
      return_url: returnUrl || `${Deno.env.get('FRONTEND_URL')}/organizer-dashboard`,
      type: 'account_onboarding',
    });

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
