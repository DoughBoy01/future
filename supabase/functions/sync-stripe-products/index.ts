import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.7.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SyncRequest {
  campId?: string;
  addonId?: string;
  action: 'create' | 'update' | 'delete' | 'sync_all';
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

    const { campId, addonId, action }: SyncRequest = await req.json();

    if (action === 'sync_all') {
      // Sync all published camps
      const { data: camps, error: campsError } = await supabase
        .from('camps')
        .select('*')
        .eq('status', 'published');

      if (campsError) throw campsError;

      const results = [];
      for (const camp of camps || []) {
        try {
          const result = await syncCampProduct(stripe, supabase, camp.id);
          results.push({ campId: camp.id, success: true, ...result });
        } catch (error) {
          console.error(`Error syncing camp ${camp.id}:`, error);
          results.push({ campId: camp.id, success: false, error: error.message });
        }
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (campId) {
      const result = await syncCampProduct(stripe, supabase, campId);
      return new Response(
        JSON.stringify({ success: true, ...result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (addonId) {
      const result = await syncAddonProduct(stripe, supabase, addonId);
      return new Response(
        JSON.stringify({ success: true, ...result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Missing campId or addonId' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing Stripe products:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to sync Stripe products' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function syncCampProduct(stripe: Stripe, supabase: any, campId: string) {
  // Fetch camp details
  const { data: camp, error: campError } = await supabase
    .from('camps')
    .select('*')
    .eq('id', campId)
    .single();

  if (campError) throw campError;

  // Check if Stripe product already exists
  const { data: existingProduct } = await supabase
    .from('stripe_products')
    .select('*')
    .eq('entity_type', 'camp')
    .eq('entity_id', campId)
    .single();

  let stripeProduct: Stripe.Product;

  if (existingProduct) {
    // Update existing product
    stripeProduct = await stripe.products.update(existingProduct.stripe_product_id, {
      name: camp.name,
      description: camp.description || undefined,
      active: camp.status === 'published',
      metadata: {
        camp_id: campId,
        school_id: camp.school_id,
        category: camp.category,
      },
    });

    // Update in database
    await supabase
      .from('stripe_products')
      .update({
        name: camp.name,
        description: camp.description,
        active: camp.status === 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingProduct.id);
  } else {
    // Create new product
    stripeProduct = await stripe.products.create({
      name: camp.name,
      description: camp.description || undefined,
      active: camp.status === 'published',
      metadata: {
        camp_id: campId,
        school_id: camp.school_id,
        category: camp.category,
      },
    });

    // Store in database
    const { data: productData } = await supabase
      .from('stripe_products')
      .insert({
        stripe_product_id: stripeProduct.id,
        entity_type: 'camp',
        entity_id: campId,
        name: camp.name,
        description: camp.description,
        active: stripeProduct.active,
      })
      .select()
      .single();

    existingProduct = productData;
  }

  // Now sync prices
  const prices = await syncCampPrices(stripe, supabase, stripeProduct.id, camp, existingProduct.id);

  return {
    product: stripeProduct,
    prices,
  };
}

async function syncCampPrices(
  stripe: Stripe,
  supabase: any,
  stripeProductId: string,
  camp: any,
  dbProductId: string
) {
  const prices = [];

  // Standard price
  const standardAmount = Math.round(camp.price * 100);
  const standardPrice = await createOrUpdatePrice(
    stripe,
    supabase,
    stripeProductId,
    dbProductId,
    {
      amount: standardAmount,
      currency: camp.currency || 'usd',
      type: 'one_time',
      price_tier: 'standard',
      metadata: {
        camp_id: camp.id,
        tier: 'standard',
      },
    }
  );
  prices.push(standardPrice);

  // Early bird price (if applicable)
  if (camp.early_bird_price && camp.early_bird_deadline) {
    const earlyBirdAmount = Math.round(camp.early_bird_price * 100);
    const earlyBirdPrice = await createOrUpdatePrice(
      stripe,
      supabase,
      stripeProductId,
      dbProductId,
      {
        amount: earlyBirdAmount,
        currency: camp.currency || 'usd',
        type: 'one_time',
        price_tier: 'early_bird',
        valid_until: camp.early_bird_deadline,
        metadata: {
          camp_id: camp.id,
          tier: 'early_bird',
          valid_until: camp.early_bird_deadline,
        },
      }
    );
    prices.push(earlyBirdPrice);
  }

  // Sync pricing tiers
  const { data: pricingTiers } = await supabase
    .from('pricing_tiers')
    .select('*')
    .eq('camp_id', camp.id)
    .eq('available', true);

  if (pricingTiers && pricingTiers.length > 0) {
    for (const tier of pricingTiers) {
      const tierPrice = await createOrUpdatePrice(
        stripe,
        supabase,
        stripeProductId,
        dbProductId,
        {
          amount: tier.price,
          currency: tier.currency || 'usd',
          type: 'one_time',
          price_tier: 'custom',
          metadata: {
            camp_id: camp.id,
            pricing_tier_id: tier.id,
            tier_name: tier.name,
          },
        }
      );
      prices.push(tierPrice);
    }
  }

  return prices;
}

async function createOrUpdatePrice(
  stripe: Stripe,
  supabase: any,
  stripeProductId: string,
  dbProductId: string,
  priceData: any
) {
  // Check if price already exists
  const { data: existingPrice } = await supabase
    .from('stripe_prices')
    .select('*')
    .eq('stripe_product_id', dbProductId)
    .eq('amount', priceData.amount)
    .eq('price_tier', priceData.price_tier)
    .single();

  if (existingPrice) {
    // Price already exists, just return it
    return {
      stripe_price_id: existingPrice.stripe_price_id,
      amount: existingPrice.amount,
      tier: existingPrice.price_tier,
    };
  }

  // Create new Stripe price
  const stripePrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: priceData.amount,
    currency: priceData.currency,
    metadata: priceData.metadata,
  });

  // Store in database
  await supabase.from('stripe_prices').insert({
    stripe_price_id: stripePrice.id,
    stripe_product_id: dbProductId,
    amount: priceData.amount,
    currency: priceData.currency,
    type: priceData.type,
    price_tier: priceData.price_tier,
    valid_until: priceData.valid_until || null,
    active: true,
  });

  return {
    stripe_price_id: stripePrice.id,
    amount: priceData.amount,
    tier: priceData.price_tier,
  };
}

async function syncAddonProduct(stripe: Stripe, supabase: any, addonId: string) {
  // Fetch addon details with camp information
  const { data: addon, error: addonError } = await supabase
    .from('camp_addons')
    .select('*, camps(name)')
    .eq('id', addonId)
    .single();

  if (addonError) throw addonError;

  // Check if Stripe product already exists
  const { data: existingProduct } = await supabase
    .from('stripe_products')
    .select('*')
    .eq('entity_type', 'addon')
    .eq('entity_id', addonId)
    .single();

  let stripeProduct: Stripe.Product;
  const productName = `${addon.camps.name} - ${addon.name}`;

  if (existingProduct) {
    // Update existing product
    stripeProduct = await stripe.products.update(existingProduct.stripe_product_id, {
      name: productName,
      description: addon.description || undefined,
      active: addon.available,
      metadata: {
        addon_id: addonId,
        camp_id: addon.camp_id,
        category: addon.category,
      },
    });

    await supabase
      .from('stripe_products')
      .update({
        name: productName,
        description: addon.description,
        active: addon.available,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingProduct.id);
  } else {
    // Create new product
    stripeProduct = await stripe.products.create({
      name: productName,
      description: addon.description || undefined,
      active: addon.available,
      metadata: {
        addon_id: addonId,
        camp_id: addon.camp_id,
        category: addon.category,
      },
    });

    const { data: productData } = await supabase
      .from('stripe_products')
      .insert({
        stripe_product_id: stripeProduct.id,
        entity_type: 'addon',
        entity_id: addonId,
        name: productName,
        description: addon.description,
        active: stripeProduct.active,
      })
      .select()
      .single();

    existingProduct = productData;
  }

  // Create price
  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: addon.price,
    currency: addon.currency || 'usd',
    metadata: {
      addon_id: addonId,
      camp_id: addon.camp_id,
    },
  });

  // Store price in database
  await supabase.from('stripe_prices').insert({
    stripe_price_id: stripePrice.id,
    stripe_product_id: existingProduct.id,
    amount: addon.price,
    currency: addon.currency || 'usd',
    type: 'one_time',
    active: true,
  });

  return {
    product: stripeProduct,
    price: stripePrice,
  };
}
