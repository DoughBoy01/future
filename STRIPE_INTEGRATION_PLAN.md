# Stripe Integration Plan - FutureEdge Camp Platform

**Goal**: Create a fully data-driven Stripe integration that requires zero code changes when camps are added, modified, or pricing structures change.

**Date**: November 16, 2025
**Status**: Planning Phase
**Branch**: `claude/stripe-integration-plan-01J8EtjQhn9TCuYr3ktqYUSv`

---

## Executive Summary

Your application already has a solid Stripe Checkout integration. This plan enhances it to be **100% data-driven** and **infinitely flexible** for complex pricing scenarios without requiring code deployments.

### Current State ✅
- ✅ Stripe Checkout integration working
- ✅ One-time payments for camp registrations
- ✅ Database-driven camp pricing (price, early_bird_price, currency)
- ✅ Discount code system
- ✅ Webhook handling for payment events
- ✅ Payment records tracking
- ✅ Edge functions for secure payment processing

### Gaps & Limitations 🔍
- ❌ No support for add-ons (t-shirts, meals, transport, equipment)
- ❌ No multi-tier pricing (full day vs half day, with/without lunch)
- ❌ No sibling discounts or family packages
- ❌ No payment plans (deposit + installments)
- ❌ No Stripe Products/Prices sync (manual price management)
- ❌ Limited refund management (only via webhooks)
- ❌ No automated commission splits to organizations
- ❌ No subscription camps (weekly/monthly recurring)

---

## 🎯 Strategic Objectives

### Primary Goal
**Enable camp organizers to configure ANY pricing structure through the admin UI without developer intervention.**

### Key Principles
1. **Data-Driven**: All pricing logic configured in database
2. **Stripe-Native**: Leverage Stripe Products/Prices API
3. **Zero-Deployment**: New camps/pricing via admin UI only
4. **Audit-Ready**: Complete payment trail for compliance
5. **Scalable**: Support complex scenarios (bundles, subscriptions, add-ons)

---

## 🏗️ Proposed Architecture

### Phase 1: Enhanced Data Model (Week 1-2)

#### 1.1 Product Catalog System

**New Table: `stripe_products`**
```sql
CREATE TABLE stripe_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_product_id TEXT UNIQUE NOT NULL,  -- Stripe Product ID
  entity_type TEXT NOT NULL,  -- 'camp' | 'addon' | 'bundle'
  entity_id UUID,  -- FK to camps.id or addons.id
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB,  -- Store custom data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync Stripe Products for each camp automatically
CREATE INDEX idx_stripe_products_entity ON stripe_products(entity_type, entity_id);
```

**New Table: `stripe_prices`**
```sql
CREATE TABLE stripe_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_price_id TEXT UNIQUE NOT NULL,  -- Stripe Price ID
  stripe_product_id UUID REFERENCES stripe_products(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,  -- Amount in cents
  currency TEXT DEFAULT 'usd',
  type TEXT NOT NULL,  -- 'one_time' | 'recurring'
  billing_period TEXT,  -- 'day' | 'week' | 'month' for recurring
  price_tier TEXT,  -- 'standard' | 'early_bird' | 'family' | 'sibling'
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stripe_prices_product ON stripe_prices(stripe_product_id);
CREATE INDEX idx_stripe_prices_tier ON stripe_prices(price_tier);
```

**New Table: `camp_addons`**
```sql
CREATE TABLE camp_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id UUID REFERENCES camps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "Lunch Package", "Camp T-Shirt", "Transport"
  description TEXT,
  category TEXT,  -- 'meal' | 'merchandise' | 'transport' | 'equipment' | 'other'
  price INTEGER NOT NULL,  -- in cents
  currency TEXT DEFAULT 'usd',
  optional BOOLEAN DEFAULT true,  -- false = mandatory
  max_quantity INTEGER DEFAULT 1,  -- how many can be selected
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  image_url TEXT,
  metadata JSONB,  -- size charts, dietary options, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_camp_addons_camp ON camp_addons(camp_id);
```

**New Table: `pricing_tiers`**
```sql
CREATE TABLE pricing_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id UUID REFERENCES camps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "Full Day with Lunch", "Half Day", "Extended Care"
  description TEXT,
  price INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  capacity INTEGER,  -- optional capacity limit per tier
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB,  -- schedule times, included items
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pricing_tiers_camp ON pricing_tiers(camp_id);
```

**Modified Table: `registrations`**
```sql
-- Add new columns to existing registrations table
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS pricing_tier_id UUID REFERENCES pricing_tiers(id);
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS selected_addons JSONB;
-- Format: [{"addon_id": "uuid", "quantity": 2, "price": 1500}]
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS total_amount INTEGER;  -- Total in cents
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS base_amount INTEGER;  -- Camp price only
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS addons_amount INTEGER;  -- Add-ons total
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS discount_applied JSONB;
-- Format: {"type": "sibling", "amount": 2000, "code": "SIBLING10"}
```

#### 1.2 Discount System Enhancement

**Modified Table: `discount_codes`**
```sql
-- Add new columns for advanced discounting
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS discount_scope TEXT DEFAULT 'registration';
-- 'registration' | 'addon' | 'both'
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS stackable BOOLEAN DEFAULT false;
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS auto_apply BOOLEAN DEFAULT false;
-- For sibling discounts
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS conditions JSONB;
-- Format: {"min_siblings": 2, "min_age": 5, "specific_addons": ["uuid1"]}
ALTER TABLE discount_codes ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
-- For stacking order
```

**New Table: `automatic_discounts`**
```sql
CREATE TABLE automatic_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES organisations(id),
  name TEXT NOT NULL,  -- "Sibling Discount", "Multi-Camp Bundle"
  discount_type TEXT NOT NULL,  -- 'percentage' | 'fixed_amount'
  discount_value NUMERIC NOT NULL,
  trigger_condition TEXT NOT NULL,  -- 'sibling_count' | 'camp_count' | 'total_amount'
  trigger_threshold INTEGER,  -- e.g., 2 for "2 siblings"
  applies_to TEXT DEFAULT 'all',  -- 'all' | 'second_child' | 'nth_registration'
  active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Phase 2: Stripe Product Sync (Week 2-3)

#### 2.1 Automatic Product Creation

**New Edge Function: `sync-stripe-products`**

**Purpose**: Automatically create/update Stripe Products when camps are created or updated.

**Trigger**:
- Database trigger on `camps` INSERT/UPDATE
- Manual sync from admin UI

**Logic**:
```typescript
// supabase/functions/sync-stripe-products/index.ts

import { serve } from "std/server";
import Stripe from "stripe";

serve(async (req) => {
  const { campId, action } = await req.json();

  // Action: 'create' | 'update' | 'sync_all'

  // 1. Fetch camp details from Supabase
  const camp = await supabase
    .from('camps')
    .select('*')
    .eq('id', campId)
    .single();

  // 2. Create or update Stripe Product
  const product = await stripe.products.create({
    name: camp.name,
    description: camp.description,
    metadata: {
      camp_id: campId,
      school_id: camp.school_id,
      category: camp.category,
    },
    active: camp.status === 'published',
  });

  // 3. Store Stripe Product ID in stripe_products table
  await supabase.from('stripe_products').upsert({
    stripe_product_id: product.id,
    entity_type: 'camp',
    entity_id: campId,
    name: camp.name,
    active: product.active,
  });

  // 4. Create Stripe Prices for all pricing scenarios
  await createCampPrices(product.id, camp);

  return new Response(JSON.stringify({ success: true }));
});

async function createCampPrices(stripeProductId, camp) {
  const prices = [];

  // Standard price
  const standardPrice = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: camp.price * 100,  // Convert to cents
    currency: camp.currency,
    metadata: { price_tier: 'standard', camp_id: camp.id },
  });
  prices.push({
    stripe_price_id: standardPrice.id,
    amount: camp.price * 100,
    price_tier: 'standard',
  });

  // Early bird price (if applicable)
  if (camp.early_bird_price && camp.early_bird_deadline) {
    const earlyBirdPrice = await stripe.prices.create({
      product: stripeProductId,
      unit_amount: camp.early_bird_price * 100,
      currency: camp.currency,
      metadata: {
        price_tier: 'early_bird',
        camp_id: camp.id,
        valid_until: camp.early_bird_deadline,
      },
    });
    prices.push({
      stripe_price_id: earlyBirdPrice.id,
      amount: camp.early_bird_price * 100,
      price_tier: 'early_bird',
      valid_until: camp.early_bird_deadline,
    });
  }

  // Store in stripe_prices table
  for (const price of prices) {
    await supabase.from('stripe_prices').insert({
      ...price,
      stripe_product_id: stripeProductId,
      type: 'one_time',
      currency: camp.currency,
    });
  }
}
```

**Database Trigger**:
```sql
-- Automatically sync Stripe product when camp is published
CREATE OR REPLACE FUNCTION trigger_stripe_product_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Call Edge Function asynchronously
  PERFORM net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/sync-stripe-products',
    headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.service_role_key')),
    body := jsonb_build_object('campId', NEW.id, 'action', 'create')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER camp_published_stripe_sync
  AFTER INSERT OR UPDATE OF status ON camps
  FOR EACH ROW
  WHEN (NEW.status = 'published')
  EXECUTE FUNCTION trigger_stripe_product_sync();
```

#### 2.2 Add-on Product Creation

**Logic**: When add-ons are created in admin UI, automatically create Stripe Products for them.

```typescript
// Similar function for camp_addons table
async function syncAddonProduct(addonId) {
  const addon = await supabase
    .from('camp_addons')
    .select('*, camps(name)')
    .eq('id', addonId)
    .single();

  const product = await stripe.products.create({
    name: `${addon.camps.name} - ${addon.name}`,
    description: addon.description,
    metadata: {
      addon_id: addonId,
      camp_id: addon.camp_id,
      category: addon.category,
    },
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: addon.price,
    currency: addon.currency,
  });

  // Store in database
  await supabase.from('stripe_products').insert({
    stripe_product_id: product.id,
    entity_type: 'addon',
    entity_id: addonId,
  });

  await supabase.from('stripe_prices').insert({
    stripe_price_id: price.id,
    stripe_product_id: product.id,
    amount: addon.price,
    type: 'one_time',
  });
}
```

---

### Phase 3: Enhanced Checkout Flow (Week 3-4)

#### 3.1 Dynamic Line Items

**Modified: `create-checkout-session` Edge Function**

```typescript
// supabase/functions/create-checkout-session/index.ts

serve(async (req) => {
  const {
    campId,
    childId,
    pricingTierId,  // NEW
    selectedAddons,  // NEW: [{ addonId, quantity }]
    discountCode
  } = await req.json();

  // 1. Fetch camp and pricing tier
  const camp = await supabase
    .from('camps')
    .select('*, pricing_tiers(*), stripe_products(*)')
    .eq('id', campId)
    .single();

  // 2. Build line items dynamically
  const lineItems = [];

  // Base camp price (or selected tier)
  const selectedTier = pricingTierId
    ? camp.pricing_tiers.find(t => t.id === pricingTierId)
    : null;

  const campPrice = selectedTier?.price || camp.price;
  const stripePriceId = await getStripePriceId(campId, campPrice);

  lineItems.push({
    price: stripePriceId,
    quantity: 1,
    description: selectedTier ? `${camp.name} - ${selectedTier.name}` : camp.name,
  });

  // 3. Add-ons
  let addonsTotal = 0;
  if (selectedAddons?.length > 0) {
    for (const { addonId, quantity } of selectedAddons) {
      const addon = await supabase
        .from('camp_addons')
        .select('*, stripe_prices(*)')
        .eq('id', addonId)
        .single();

      const addonPriceId = addon.stripe_prices[0].stripe_price_id;

      lineItems.push({
        price: addonPriceId,
        quantity: quantity,
      });

      addonsTotal += addon.price * quantity;
    }
  }

  // 4. Apply discounts
  const discounts = [];
  if (discountCode) {
    const code = await validateDiscountCode(discountCode, campId);
    if (code) {
      // Create Stripe Coupon if doesn't exist
      const coupon = await getOrCreateStripeCoupon(code);
      discounts.push({ coupon: coupon.id });
    }
  }

  // 5. Check for automatic discounts (sibling, multi-camp)
  const autoDiscounts = await checkAutomaticDiscounts(childId, campId);
  if (autoDiscounts.length > 0) {
    for (const discount of autoDiscounts) {
      const coupon = await createAutomaticStripeCoupon(discount);
      discounts.push({ coupon: coupon.id });
    }
  }

  // 6. Create registration record
  const registration = await supabase
    .from('registrations')
    .insert({
      camp_id: campId,
      child_id: childId,
      pricing_tier_id: pricingTierId,
      selected_addons: selectedAddons,
      base_amount: campPrice * 100,
      addons_amount: addonsTotal,
      status: 'pending',
      payment_status: 'unpaid',
    })
    .select()
    .single();

  // 7. Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    discounts: discounts,
    mode: 'payment',
    success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${req.headers.get('origin')}/camps/${campId}/register`,
    metadata: {
      registration_id: registration.id,
      camp_id: campId,
      child_id: childId,
    },
    customer_email: user.email,
  });

  // 8. Update registration with session ID
  await supabase
    .from('registrations')
    .update({ stripe_checkout_session_id: session.id })
    .eq('id', registration.id);

  return new Response(JSON.stringify({ sessionId: session.id }));
});

// Helper: Get Stripe Price ID for a given amount
async function getStripePriceId(campId, amount) {
  const { data } = await supabase
    .from('stripe_prices')
    .select('stripe_price_id')
    .eq('entity_id', campId)
    .eq('amount', amount * 100)
    .single();

  return data.stripe_price_id;
}

// Helper: Check sibling discounts
async function checkAutomaticDiscounts(childId, campId) {
  // Get parent_id from child
  const { data: child } = await supabase
    .from('children')
    .select('parent_id')
    .eq('id', childId)
    .single();

  // Check if parent has other children registered for camps
  const { data: siblings } = await supabase
    .from('registrations')
    .select('child_id')
    .eq('parent_id', child.parent_id)
    .neq('child_id', childId)
    .in('status', ['confirmed', 'pending']);

  if (siblings.length >= 1) {
    // Fetch applicable automatic discounts
    const { data: discounts } = await supabase
      .from('automatic_discounts')
      .select('*')
      .eq('trigger_condition', 'sibling_count')
      .lte('trigger_threshold', siblings.length + 1)
      .eq('active', true);

    return discounts;
  }

  return [];
}
```

#### 3.2 Enhanced Registration UI

**Component: `CampRegistrationPage.tsx`**

Add UI sections for:
1. **Pricing Tier Selection** (if multiple tiers exist)
   - Radio buttons for "Full Day", "Half Day", "Extended Care"
   - Show price difference and included items

2. **Add-ons Selection**
   - Checkboxes for optional add-ons
   - Quantity selectors for merchandise
   - Image previews and size charts

3. **Automatic Discount Indicators**
   - "Sibling Discount Applied: -$50"
   - "Early Bird Pricing: Save 20%"

4. **Real-time Price Calculation**
   ```tsx
   const calculateTotal = () => {
     let total = selectedTier?.price || camp.price;

     // Add add-ons
     selectedAddons.forEach(addon => {
       total += addon.price * addon.quantity;
     });

     // Apply discounts
     if (discountCode) {
       total -= calculateDiscount(discountCode, total);
     }

     return total;
   };
   ```

---

### Phase 4: Payment Plans & Installments (Week 4-5)

#### 4.1 Payment Plan Configuration

**New Table: `payment_plans`**
```sql
CREATE TABLE payment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id UUID REFERENCES camps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,  -- "Full Upfront", "50% Deposit + 50% Later", "3 Installments"
  plan_type TEXT NOT NULL,  -- 'full' | 'deposit_balance' | 'installments'
  deposit_percentage NUMERIC,  -- e.g., 50 for 50%
  installment_count INTEGER,  -- Number of installments
  installment_schedule JSONB,
  -- Format: [{"due_days_before_start": 60, "percentage": 50}, {...}]
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**New Table: `payment_installments`**
```sql
CREATE TABLE payment_installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,  -- 1, 2, 3...
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending',  -- 'pending' | 'paid' | 'overdue' | 'waived'
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_installments_registration ON payment_installments(registration_id);
CREATE INDEX idx_installments_status ON payment_installments(status, due_date);
```

#### 4.2 Installment Payment Processing

**New Edge Function: `process-installment-payment`**

```typescript
// Triggered by:
// 1. User clicking "Pay Installment" in dashboard
// 2. Scheduled job for payment reminders

serve(async (req) => {
  const { installmentId } = await req.json();

  const installment = await supabase
    .from('payment_installments')
    .select('*, registrations(*)')
    .eq('id', installmentId)
    .single();

  // Create Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: installment.amount,
    currency: installment.currency,
    customer: installment.registrations.stripe_customer_id,
    metadata: {
      installment_id: installmentId,
      registration_id: installment.registration_id,
    },
  });

  return new Response(JSON.stringify({
    clientSecret: paymentIntent.client_secret
  }));
});
```

**Scheduled Job**: Send reminder emails 7 days before due date
```sql
-- Supabase pg_cron job
SELECT cron.schedule(
  'installment-reminders',
  '0 9 * * *',  -- Daily at 9 AM
  $$
    SELECT net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-installment-reminders',
      body := jsonb_build_object('date', CURRENT_DATE + INTERVAL '7 days')
    );
  $$
);
```

---

### Phase 5: Stripe Connect for Payouts (Week 5-6)

#### 5.1 Connected Accounts

**New Table: `stripe_connected_accounts`**
```sql
CREATE TABLE stripe_connected_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organisation_id UUID REFERENCES organisations(id) UNIQUE,
  stripe_account_id TEXT UNIQUE NOT NULL,  -- Stripe Connect Account ID
  account_status TEXT DEFAULT 'pending',  -- 'pending' | 'active' | 'restricted'
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5.2 Onboarding Flow

**New Edge Function: `create-connect-account`**

```typescript
serve(async (req) => {
  const { organisationId } = await req.json();

  // Create Stripe Connect Express account
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'US',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { organisation_id: organisationId },
  });

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${req.headers.get('origin')}/admin/connect/reauth`,
    return_url: `${req.headers.get('origin')}/admin/connect/success`,
    type: 'account_onboarding',
  });

  // Store in database
  await supabase.from('stripe_connected_accounts').insert({
    organisation_id: organisationId,
    stripe_account_id: account.id,
  });

  return new Response(JSON.stringify({ url: accountLink.url }));
});
```

#### 5.3 Automatic Commission Splits

**Modified: `create-checkout-session`**

```typescript
// Add application_fee and transfer data
const session = await stripe.checkout.sessions.create({
  // ... existing config
  payment_intent_data: {
    application_fee_amount: calculateCommission(camp, totalAmount),
    transfer_data: {
      destination: camp.stripe_connected_account_id,
    },
  },
});

function calculateCommission(camp, totalAmount) {
  // Get commission rate from camp or school
  const commissionRate = camp.commission_rate || 0.15;  // Default 15%
  return Math.round(totalAmount * commissionRate);
}
```

**Benefits**:
- Platform automatically takes commission fee
- Remaining amount goes directly to camp organization
- No manual payouts needed
- Full transparency in Stripe Dashboard

---

### Phase 6: Advanced Features (Week 6-8)

#### 6.1 Subscription Camps (Recurring)

**Use Case**: Weekly art classes, monthly STEM clubs

**Table: `subscription_camps`**
```sql
CREATE TABLE subscription_camps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id UUID REFERENCES camps(id),
  stripe_product_id TEXT,
  billing_period TEXT NOT NULL,  -- 'week' | 'month' | 'quarter'
  price_per_period INTEGER NOT NULL,
  trial_period_days INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Checkout Session for Subscriptions**:
```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',  // Changed from 'payment'
  line_items: [{
    price: subscriptionPriceId,  // Stripe Price with recurring billing
    quantity: 1,
  }],
  subscription_data: {
    metadata: {
      camp_id: campId,
      child_id: childId,
    },
  },
});
```

#### 6.2 Family Bundles

**New Table: `camp_bundles`**
```sql
CREATE TABLE camp_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES organisations(id),
  name TEXT NOT NULL,  -- "Summer Adventure Pass", "STEM 3-Pack"
  description TEXT,
  camp_ids UUID[] NOT NULL,  -- Array of camp IDs
  bundle_price INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  savings_amount INTEGER,  -- How much they save
  active BOOLEAN DEFAULT true,
  valid_from DATE,
  valid_until DATE,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Checkout Logic**:
```typescript
// Create multiple registrations in one transaction
const registrations = [];
for (const campId of bundle.camp_ids) {
  const reg = await supabase.from('registrations').insert({
    camp_id: campId,
    child_id: childId,
    bundle_id: bundle.id,
    status: 'pending',
  }).select().single();
  registrations.push(reg);
}

// Single Stripe payment for entire bundle
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      currency: bundle.currency,
      product_data: { name: bundle.name },
      unit_amount: bundle.bundle_price,
    },
    quantity: 1,
  }],
  metadata: {
    bundle_id: bundle.id,
    registration_ids: registrations.map(r => r.id).join(','),
  },
});
```

#### 6.3 Refund Management UI

**Admin Page: Refund Dashboard**

Features:
- View all refund requests
- Partial refund calculator (based on cancellation policy)
- One-click refund processing
- Automatic email notifications

**New Edge Function: `process-refund`**
```typescript
serve(async (req) => {
  const { registrationId, amount, reason } = await req.json();

  // Fetch payment intent
  const registration = await supabase
    .from('registrations')
    .select('*, payment_records(*)')
    .eq('id', registrationId)
    .single();

  const paymentIntentId = registration.payment_records[0].stripe_payment_intent_id;

  // Create refund
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount,  // Can be partial
    reason: reason,  // 'requested_by_customer' | 'duplicate' | 'fraudulent'
    metadata: { registration_id: registrationId },
  });

  // Update registration status
  await supabase.from('registrations').update({
    status: 'cancelled',
    payment_status: amount === registration.amount_paid ? 'refunded' : 'partial_refund',
  }).eq('id', registrationId);

  // Send email notification
  await sendRefundEmail(registration, refund);

  return new Response(JSON.stringify({ success: true, refund }));
});
```

#### 6.4 Waitlist with Automatic Charging

**Logic**: When spot opens up, automatically charge waitlisted users

**New Table: `waitlist_entries`**
```sql
CREATE TABLE waitlist_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id UUID REFERENCES camps(id),
  child_id UUID REFERENCES children(id),
  parent_id UUID REFERENCES auth.users(id),
  position INTEGER,
  stripe_setup_intent_id TEXT,  -- For saving payment method
  auto_charge_consent BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active',  -- 'active' | 'converted' | 'expired'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Flow**:
1. User joins waitlist and provides payment method via Setup Intent
2. When capacity opens (cancellation), trigger Edge Function
3. Automatically charge saved payment method
4. Create registration and send confirmation

---

## 🗓️ Implementation Timeline

### Week 1-2: Foundation
- [ ] Create new database tables (products, prices, add-ons, tiers)
- [ ] Migrate existing camps to new structure
- [ ] Write database triggers
- [ ] Build `sync-stripe-products` Edge Function

### Week 3-4: Enhanced Checkout
- [ ] Update `create-checkout-session` for dynamic line items
- [ ] Build add-ons management UI (admin)
- [ ] Build enhanced registration UI (public)
- [ ] Test multi-tier pricing and add-ons

### Week 4-5: Payment Plans
- [ ] Create payment plans tables
- [ ] Build installment payment processor
- [ ] Create scheduled job for reminders
- [ ] Build payment plan selector UI

### Week 5-6: Stripe Connect
- [ ] Set up connected accounts table
- [ ] Build onboarding flow for organizations
- [ ] Implement automatic commission splits
- [ ] Test payout flows in Stripe test mode

### Week 6-8: Advanced Features
- [ ] Subscription camps (if needed)
- [ ] Bundle pricing
- [ ] Refund management UI
- [ ] Waitlist auto-charging
- [ ] Analytics dashboard

---

## 🧪 Testing Strategy

### 1. Test Mode Configuration
- Use Stripe test keys for all development
- Test webhook events with Stripe CLI
- Create test scenarios for each pricing model

### 2. Test Scenarios

| Scenario | Expected Outcome |
|----------|------------------|
| Register for camp with standard price | Single line item checkout |
| Register with early bird pricing | Discounted price applied |
| Add 2 add-ons (lunch + t-shirt) | 3 line items in checkout |
| Apply discount code | Coupon applied to total |
| Sibling discount auto-applied | Automatic coupon created |
| Select payment plan (50% deposit) | Installment records created |
| Pay second installment | Payment intent processed, installment marked paid |
| Organization receives payout | Transfer to connected account |
| Refund full amount | Registration cancelled, payment refunded |
| Webhook processes payment | Registration confirmed, email sent |

### 3. Edge Cases
- [ ] User abandons checkout (session expires)
- [ ] Payment fails after multiple attempts
- [ ] Refund requested after camp starts
- [ ] Capacity fills up during checkout
- [ ] Discount code expires during checkout
- [ ] Multiple siblings registered simultaneously

---

## 📊 Admin UI Enhancements

### Camp Creation Flow

**Step 1: Basic Info**
- Name, description, dates, capacity (existing)

**Step 2: Pricing Configuration** (NEW)
```
┌─────────────────────────────────────────┐
│ Base Pricing                            │
├─────────────────────────────────────────┤
│ Standard Price: $500                    │
│ Currency: USD                           │
│                                         │
│ ☑️ Enable Early Bird Pricing            │
│   Early Bird Price: $400                │
│   Deadline: 2025-06-01                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Pricing Tiers (Optional)                │
├─────────────────────────────────────────┤
│ ➕ Add Pricing Tier                     │
│                                         │
│ Tier 1: Full Day with Lunch             │
│   Price: $500                           │
│   Capacity: 30                          │
│   [Edit] [Delete]                       │
│                                         │
│ Tier 2: Half Day                        │
│   Price: $350                           │
│   Capacity: 20                          │
│   [Edit] [Delete]                       │
└─────────────────────────────────────────┘
```

**Step 3: Add-ons** (NEW)
```
┌─────────────────────────────────────────┐
│ Optional Add-ons                        │
├─────────────────────────────────────────┤
│ ➕ Add New Add-on                       │
│                                         │
│ 🍽️ Lunch Package                        │
│   Price: $50 | Category: Meal           │
│   Max Quantity: 5                       │
│   [Edit] [Delete]                       │
│                                         │
│ 👕 Camp T-Shirt                         │
│   Price: $25 | Category: Merchandise    │
│   [Size Chart] [Edit] [Delete]          │
│                                         │
│ 🚌 Daily Transport                      │
│   Price: $100 | Category: Transport     │
│   [Edit] [Delete]                       │
└─────────────────────────────────────────┘
```

**Step 4: Payment Options** (NEW)
```
┌─────────────────────────────────────────┐
│ Payment Plans                           │
├─────────────────────────────────────────┤
│ ☑️ Full Payment (required)               │
│                                         │
│ ☑️ Enable Payment Plans                 │
│   ☐ 50% Deposit + 50% Later            │
│      Due 30 days before camp start      │
│                                         │
│   ☐ 3 Monthly Installments              │
│      33% each, due monthly              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Automatic Discounts                     │
├─────────────────────────────────────────┤
│ ☑️ Sibling Discount                      │
│   2+ siblings: 10% off                  │
│                                         │
│ ☐ Multi-camp Discount                   │
│   Register for 3+ camps: 15% off        │
└─────────────────────────────────────────┘
```

**Step 5: Review & Publish**
- Preview Stripe products that will be created
- "Sync to Stripe" button
- Status indicator (✅ Synced | ⚠️ Not Synced)

---

## 🔒 Security Considerations

### 1. Webhook Signature Verification
```typescript
// Always verify Stripe webhook signatures
const sig = req.headers.get('stripe-signature');
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
```

### 2. Row Level Security (RLS)
```sql
-- Only parents can see their own payment records
CREATE POLICY "Parents view own payments"
ON payment_records FOR SELECT
USING (auth.uid() = (
  SELECT parent_id FROM registrations WHERE id = payment_records.registration_id
));

-- Only organization admins can view their payouts
CREATE POLICY "Orgs view own payouts"
ON stripe_connected_accounts FOR SELECT
USING (organisation_id IN (
  SELECT organisation_id FROM organisation_members WHERE user_id = auth.uid()
));
```

### 3. Amount Validation
```typescript
// Always recalculate amounts server-side, never trust client
const calculatedTotal = calculateTotal(campId, addons, discounts);
if (clientProvidedTotal !== calculatedTotal) {
  throw new Error('Price mismatch');
}
```

### 4. Idempotency Keys
```typescript
// Prevent duplicate charges
const idempotencyKey = `reg_${registrationId}_${Date.now()}`;
const paymentIntent = await stripe.paymentIntents.create({
  amount,
  currency,
}, {
  idempotencyKey,
});
```

---

## 📈 Monitoring & Analytics

### 1. Stripe Dashboard Metrics
- Track conversion rate (sessions created → payments completed)
- Monitor failed payments
- View refund trends
- Analyze revenue by camp category

### 2. Custom Analytics

**New Table: `payment_analytics`**
```sql
CREATE TABLE payment_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  camp_id UUID REFERENCES camps(id),
  school_id UUID REFERENCES organisations(id),
  total_revenue INTEGER DEFAULT 0,
  total_registrations INTEGER DEFAULT 0,
  total_refunds INTEGER DEFAULT 0,
  addon_revenue INTEGER DEFAULT 0,
  discount_amount_total INTEGER DEFAULT 0,
  average_order_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily aggregation job
SELECT cron.schedule(
  'daily-analytics',
  '0 1 * * *',  -- 1 AM daily
  $$
    INSERT INTO payment_analytics (date, camp_id, ...)
    SELECT
      CURRENT_DATE - 1,
      camp_id,
      SUM(amount_paid) as total_revenue,
      COUNT(*) as total_registrations,
      ...
    FROM registrations
    WHERE DATE(created_at) = CURRENT_DATE - 1
    GROUP BY camp_id;
  $$
);
```

### 3. Admin Dashboard Widgets
- **Today's Revenue**: Real-time earnings
- **Pending Installments**: Upcoming payments due
- **Refund Requests**: Needs attention
- **Top-Selling Camps**: Leaderboard
- **Add-on Popularity**: Which add-ons sell best

---

## 🚀 Migration Plan

### Phase 1: Soft Launch (Test Mode)
1. Deploy new tables and Edge Functions
2. Enable for 1-2 test camps only
3. Run full checkout flow with test cards
4. Verify webhooks process correctly

### Phase 2: Pilot Program (Live Mode)
1. Switch to live Stripe keys
2. Enable for 5-10 camps
3. Monitor for 2 weeks
4. Gather feedback from organizations

### Phase 3: Full Rollout
1. Migrate all existing camps to new structure
2. Backfill Stripe products for published camps
3. Train admins on new features
4. Update documentation

### Data Migration Script
```sql
-- Migrate existing camps to stripe_products
DO $$
DECLARE
  camp_record RECORD;
BEGIN
  FOR camp_record IN SELECT * FROM camps WHERE status = 'published' LOOP
    -- Call Edge Function to create Stripe product
    PERFORM net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/sync-stripe-products',
      body := jsonb_build_object('campId', camp_record.id, 'action', 'create')
    );
  END LOOP;
END $$;
```

---

## 💡 Future Enhancements

### 1. Dynamic Pricing (Surge Pricing)
- Increase prices as capacity fills up
- Seasonal pricing adjustments
- Demand-based pricing

### 2. Gift Cards & Vouchers
- Purchase camp credits
- Gift to other families
- Corporate partnerships

### 3. Loyalty Program
- Points for registrations
- Referral rewards
- VIP early access

### 4. Multi-Currency Support
- Detect user location
- Display prices in local currency
- Settle in organization's currency

### 5. Tax Handling
- Stripe Tax integration
- Automatic tax calculation
- Tax-exempt organizations

### 6. Invoice Generation
- PDF invoices for payments
- Email automatically after payment
- Download from parent dashboard

---

## 📚 Documentation Updates Needed

1. **Stripe Setup Guide** - Update with new features
2. **Admin Manual** - Add-ons, pricing tiers, payment plans
3. **API Reference** - New Edge Functions
4. **Webhook Events** - Complete event list
5. **Troubleshooting** - Common issues and fixes

---

## ✅ Success Criteria

This integration will be considered successful when:

1. ✅ **Zero Code Deployments**: Adding/editing camps requires no code changes
2. ✅ **Flexible Pricing**: Support for any pricing structure via admin UI
3. ✅ **Automated Payments**: Installments and subscriptions work automatically
4. ✅ **Transparent Payouts**: Organizations receive funds via Stripe Connect
5. ✅ **Comprehensive Tracking**: Every payment/refund logged with audit trail
6. ✅ **User Satisfaction**: Parents find checkout simple and trustworthy
7. ✅ **Admin Efficiency**: Camp managers can self-serve all pricing changes

---

## 🤔 Questions for Review

1. **Payment Plan Priority**: Should we prioritize installments or go straight to full Stripe Connect?
2. **Subscription Camps**: Is recurring billing needed for your current camps, or is this future-proofing?
3. **Add-on Categories**: What add-on types are most important (meals, transport, merchandise)?
4. **Commission Model**: Should commission be % of total (including add-ons) or just base camp price?
5. **Refund Policy**: Should refunds be automated based on camp policies, or require manual admin approval?
6. **Multi-Currency**: Do you need to support international payments now, or later?

---

## 📞 Next Steps

1. **Review this plan** and provide feedback
2. **Prioritize phases** - which features are must-have vs. nice-to-have?
3. **Set timeline** - when do you need this live?
4. **Allocate resources** - who will test and provide feedback?
5. **Schedule kickoff** - let's start implementation!

---

**Plan Status**: ✅ Complete - Ready for Review
**Estimated Effort**: 6-8 weeks (phased approach)
**Risk Level**: Low (building on existing Stripe integration)

