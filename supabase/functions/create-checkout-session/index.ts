import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.7.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CheckoutRequest {
  campId: string;
  campName: string;
  childId: string;
  parentId?: string;
  pricingTierId?: string;
  selectedAddons?: Array<{ addonId: string; quantity: number }>;
  discountCode?: string;
  amount?: number; // Legacy support
  currency?: string;
  registrationId?: string; // Can be pre-created or created here
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

    const requestData: CheckoutRequest = await req.json();
    const {
      campId,
      campName,
      childId,
      parentId,
      pricingTierId,
      selectedAddons = [],
      discountCode,
      currency = 'usd',
      registrationId: existingRegistrationId,
    } = requestData;

    if (!campId || !campName || !childId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: campId, campName, childId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch camp details
    const { data: camp, error: campError } = await supabase
      .from('camps')
      .select('*, stripe_products(*)')
      .eq('id', campId)
      .single();

    if (campError || !camp) {
      throw new Error('Camp not found');
    }

    // Get parent_id if not provided
    let effectiveParentId = parentId;
    if (!effectiveParentId) {
      const { data: child } = await supabase
        .from('children')
        .select('parent_id')
        .eq('id', childId)
        .single();
      effectiveParentId = child?.parent_id;
    }

    // Calculate pricing using database function
    const { data: pricingData, error: pricingError } = await supabase
      .rpc('calculate_registration_total', {
        p_camp_id: campId,
        p_pricing_tier_id: pricingTierId || null,
        p_selected_addons: selectedAddons || [],
        p_discount_code: discountCode || null,
        p_parent_id: effectiveParentId || null,
      });

    if (pricingError) {
      console.error('Pricing calculation error:', pricingError);
      throw new Error('Failed to calculate pricing');
    }

    const pricing = pricingData[0];
    const totalAmount = pricing.total_amount;
    const baseAmount = pricing.base_amount;
    const addonsAmount = pricing.addons_amount;
    const discountAmount = pricing.discount_amount;

    // Build line items for Stripe Checkout
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Get the appropriate Stripe Price ID for the camp
    const { data: campPrice } = await supabase
      .from('stripe_prices')
      .select('stripe_price_id, stripe_product_id')
      .eq('amount', baseAmount)
      .eq('active', true)
      .limit(1)
      .single();

    if (campPrice) {
      // Use existing Stripe Price
      lineItems.push({
        price: campPrice.stripe_price_id,
        quantity: 1,
      });
    } else {
      // Fallback to creating price_data (for legacy support)
      lineItems.push({
        price_data: {
          currency: currency,
          product_data: {
            name: pricingTierId ? `${campName} - Custom Tier` : campName,
            description: 'Camp registration',
          },
          unit_amount: baseAmount,
        },
        quantity: 1,
      });
    }

    // Add add-ons as separate line items
    if (selectedAddons && selectedAddons.length > 0) {
      for (const addon of selectedAddons) {
        const { data: addonData } = await supabase
          .from('camp_addons')
          .select('*, stripe_prices(stripe_price_id)')
          .eq('id', addon.addonId)
          .single();

        if (addonData) {
          if (addonData.stripe_prices && addonData.stripe_prices.length > 0) {
            // Use existing Stripe Price
            lineItems.push({
              price: addonData.stripe_prices[0].stripe_price_id,
              quantity: addon.quantity || 1,
            });
          } else {
            // Fallback to price_data
            lineItems.push({
              price_data: {
                currency: currency,
                product_data: {
                  name: addonData.name,
                  description: addonData.description || '',
                },
                unit_amount: addonData.price,
              },
              quantity: addon.quantity || 1,
            });
          }
        }
      }
    }

    // Handle discounts
    const discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];

    if (discountCode) {
      // Validate discount code
      const { data: codeValidation } = await supabase
        .rpc('validate_discount_code', {
          p_code: discountCode,
          p_camp_id: campId,
          p_parent_id: effectiveParentId,
        });

      if (codeValidation && codeValidation[0]?.valid) {
        // Create Stripe coupon if it doesn't exist
        const couponId = `discount_${discountCode}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');

        try {
          // Try to retrieve existing coupon
          await stripe.coupons.retrieve(couponId);
          discounts.push({ coupon: couponId });
        } catch (error) {
          // Coupon doesn't exist, create it
          const discountValue = codeValidation[0].discount_value;
          const discountType = codeValidation[0].discount_type;

          const coupon = await stripe.coupons.create({
            id: couponId,
            name: discountCode,
            [discountType === 'percentage' ? 'percent_off' : 'amount_off']:
              discountType === 'percentage' ? discountValue : Math.round(discountValue * 100),
            currency: discountType === 'fixed_amount' ? currency : undefined,
            duration: 'once',
          });

          discounts.push({ coupon: coupon.id });
        }
      }
    }

    // Check for automatic discounts
    if (effectiveParentId) {
      const { data: autoDiscounts } = await supabase
        .rpc('get_applicable_automatic_discounts', {
          p_parent_id: effectiveParentId,
          p_camp_id: campId,
          p_total_amount: baseAmount + addonsAmount,
        });

      if (autoDiscounts && autoDiscounts.length > 0) {
        const bestDiscount = autoDiscounts[0];
        const autoCouponId = `auto_${bestDiscount.discount_id}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');

        try {
          await stripe.coupons.retrieve(autoCouponId);
          discounts.push({ coupon: autoCouponId });
        } catch (error) {
          const discountType = bestDiscount.discount_type;
          const discountValue = bestDiscount.discount_value;

          const coupon = await stripe.coupons.create({
            id: autoCouponId,
            name: bestDiscount.discount_name,
            [discountType === 'percentage' ? 'percent_off' : 'amount_off']:
              discountType === 'percentage' ? discountValue : Math.round(discountValue * 100),
            currency: discountType === 'fixed_amount' ? currency : undefined,
            duration: 'once',
          });

          discounts.push({ coupon: coupon.id });
        }
      }
    }

    // Create or update registration record
    let registrationId = existingRegistrationId;

    if (!registrationId) {
      const { data: registration, error: regError } = await supabase
        .from('registrations')
        .insert({
          camp_id: campId,
          child_id: childId,
          parent_id: effectiveParentId,
          pricing_tier_id: pricingTierId || null,
          selected_addons: selectedAddons,
          discount_code: discountCode || null,
          status: 'pending',
          payment_status: 'unpaid',
        })
        .select()
        .single();

      if (regError) {
        console.error('Registration creation error:', regError);
        throw new Error('Failed to create registration');
      }

      registrationId = registration.id;
    } else {
      // Update existing registration
      await supabase
        .from('registrations')
        .update({
          pricing_tier_id: pricingTierId || null,
          selected_addons: selectedAddons,
          discount_code: discountCode || null,
        })
        .eq('id', registrationId);
    }

    // Create Stripe Checkout Session
    const baseUrl = req.headers.get('origin') || 'http://localhost:5173';

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/camps/${campId}/register`,
      metadata: {
        registration_id: registrationId,
        camp_id: campId,
        child_id: childId,
        base_amount: baseAmount.toString(),
        addons_amount: addonsAmount.toString(),
        total_amount: totalAmount.toString(),
      },
    };

    // Add discounts if any
    if (discounts.length > 0) {
      sessionParams.discounts = discounts;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    // Update registration with session ID
    await supabase
      .from('registrations')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', registrationId);

    // Create payment record
    await supabase.from('payment_records').insert({
      registration_id: registrationId,
      stripe_checkout_session_id: session.id,
      amount: totalAmount / 100, // Convert cents to dollars for legacy field
      currency: currency.toUpperCase(),
      status: 'pending',
    });

    // Increment discount code usage if applicable
    if (discountCode) {
      await supabase.rpc('increment_discount_usage', { p_code: discountCode });
    }

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        pricing: {
          baseAmount,
          addonsAmount,
          discountAmount,
          totalAmount,
        },
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
