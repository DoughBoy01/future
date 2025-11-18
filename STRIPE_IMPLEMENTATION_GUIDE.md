# Stripe Integration Implementation Guide

## Overview

This guide covers the implementation of Phase 1 of the enhanced Stripe integration for the FutureEdge camp platform. This phase establishes a **data-driven foundation** that eliminates the need for code changes when camps, pricing, or add-ons are modified.

**Implementation Date**: November 16, 2025
**Status**: Phase 1 Complete - Ready for Testing

---

## What Was Implemented

### ✅ Database Schema Enhancements

#### New Tables Created:

1. **`stripe_products`** - Maps camps/add-ons to Stripe Products
2. **`stripe_prices`** - Stores Stripe Price IDs for all pricing options
3. **`camp_addons`** - Optional add-ons (meals, transport, merchandise, equipment)
4. **`pricing_tiers`** - Multiple pricing options per camp (Full Day, Half Day, etc.)
5. **`automatic_discounts`** - Auto-applied discounts (sibling, multi-camp, volume)

#### Enhanced Existing Tables:

1. **`registrations`** - Added columns for:
   - `pricing_tier_id` - Selected pricing tier
   - `selected_addons` - JSONB array of add-ons
   - `total_amount`, `base_amount`, `addons_amount` - Detailed pricing breakdown
   - `discount_applied` - JSONB with discount details

2. **`discount_codes`** - Added columns for:
   - `discount_scope` - What it applies to (registration/addon/both)
   - `stackable` - Can combine with other discounts
   - `auto_apply` - Automatically apply if conditions met
   - `conditions` - JSONB with eligibility rules
   - `priority` - Order for stacking

### ✅ Edge Functions

1. **`sync-stripe-products`** (NEW)
   - Automatically syncs camps and add-ons to Stripe Products/Prices
   - Handles create, update, and bulk sync operations
   - Maintains bidirectional sync between database and Stripe

2. **`create-checkout-session`** (ENHANCED)
   - Now supports add-ons as separate line items
   - Uses Stripe Price IDs from database
   - Automatically applies sibling/volume discounts
   - Calculates all pricing server-side for security

### ✅ Database Functions

1. **`calculate_registration_total()`** - Complete pricing calculation
2. **`get_applicable_automatic_discounts()`** - Find eligible auto-discounts
3. **`validate_discount_code()`** - Validate and retrieve discount details
4. **`increment_discount_usage()`** - Track discount code usage
5. **`pricing_tier_has_capacity()`** - Check tier availability
6. **`calculate_addons_total()`** - Sum up add-ons pricing

### ✅ Automatic Triggers

Database triggers that automatically sync to Stripe when:
- Camp is published or updated
- Add-on is created or modified
- Pricing tier is added or changed

---

## Migration Files

All database changes are in timestamped migration files:

```
supabase/migrations/
├── 20251116000001_create_stripe_products_table.sql
├── 20251116000002_create_stripe_prices_table.sql
├── 20251116000003_create_camp_addons_table.sql
├── 20251116000004_create_pricing_tiers_table.sql
├── 20251116000005_create_automatic_discounts_table.sql
├── 20251116000006_enhance_registrations_for_stripe.sql
├── 20251116000007_enhance_discount_codes.sql
└── 20251116000008_create_stripe_sync_triggers.sql
```

---

## Deployment Steps

### Step 1: Run Database Migrations

**Option A: Using Supabase CLI (Recommended)**

```bash
# Make sure you're in the project directory
cd /home/user/future

# Run migrations
supabase db push

# Or migrate to specific version
supabase migration up
```

**Option B: Manual via Supabase Dashboard**

1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file in order (20251116000001 → 20251116000008)
3. Verify no errors in the output

### Step 2: Configure Environment Variables

**Set Supabase Secrets for Triggers** (Required for auto-sync)

```bash
# Using Supabase CLI
supabase secrets set app.supabase_url=https://your-project.supabase.co
supabase secrets set app.service_role_key=your-service-role-key

# Or via Supabase Dashboard:
# Settings → Database → Custom postgres config
# Add:
# app.supabase_url = 'https://your-project.supabase.co'
# app.service_role_key = 'your-service-role-key'
```

**Verify Stripe Keys** (Should already exist)

```bash
# Edge Function secrets
supabase secrets list

# Should show:
# STRIPE_SECRET_KEY
# STRIPE_WEBHOOK_SECRET
```

### Step 3: Deploy Edge Functions

```bash
# Deploy sync-stripe-products function
supabase functions deploy sync-stripe-products

# Redeploy enhanced create-checkout-session
supabase functions deploy create-checkout-session

# Verify deployment
supabase functions list
```

### Step 4: Initial Stripe Product Sync

Sync all existing published camps to Stripe:

**Option A: Using SQL Function**

```sql
-- Run in Supabase SQL Editor
SELECT sync_all_camps_to_stripe();
```

**Option B: Using Edge Function Directly**

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/sync-stripe-products \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "sync_all"}'
```

**Option C: Test with Single Camp First**

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/sync-stripe-products \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"campId": "your-camp-uuid", "action": "create"}'
```

### Step 5: Verify Stripe Products

1. Go to Stripe Dashboard → Products
2. You should see products for each published camp
3. Each product should have 1-2 prices (standard + early bird if applicable)
4. Check metadata contains `camp_id`, `school_id`, `category`

---

## Testing the Implementation

### Test 1: Create a Camp Add-on

```sql
-- Via SQL (or build admin UI for this)
INSERT INTO camp_addons (camp_id, name, description, category, price, currency)
VALUES (
  'your-camp-id',
  'Lunch Package',
  'Daily healthy lunch with vegetarian option',
  'meal',
  2500,  -- $25.00 in cents
  'usd'
);

-- Check if Stripe product was created
SELECT * FROM stripe_products WHERE entity_type = 'addon';

-- Check Stripe Dashboard → Products for new addon product
```

### Test 2: Create Pricing Tiers

```sql
-- Full Day option
INSERT INTO pricing_tiers (camp_id, name, description, price, currency, metadata)
VALUES (
  'your-camp-id',
  'Full Day',
  '9am - 5pm with all activities',
  50000,  -- $500.00
  'usd',
  '{"hours": "9am-5pm", "includes": ["all activities", "snacks"]}'
);

-- Half Day option
INSERT INTO pricing_tiers (camp_id, name, description, price, currency, metadata)
VALUES (
  'your-camp-id',
  'Half Day',
  '9am - 1pm',
  35000,  -- $350.00
  'usd',
  '{"hours": "9am-1pm", "includes": ["morning activities"]}'
);

-- Trigger should auto-sync to Stripe
-- Check: SELECT * FROM stripe_prices WHERE price_tier = 'custom';
```

### Test 3: Create Automatic Sibling Discount

```sql
INSERT INTO automatic_discounts (
  school_id,
  name,
  description,
  discount_type,
  discount_value,
  trigger_condition,
  trigger_threshold,
  applies_to,
  active
)
VALUES (
  'your-school-id',
  'Sibling Discount',
  '10% off when 2 or more siblings register',
  'percentage',
  10,
  'sibling_count',
  2,
  'second_child',
  true
);
```

### Test 4: Complete Registration Flow

**Test Payload for create-checkout-session:**

```json
{
  "campId": "your-camp-uuid",
  "campName": "Summer Soccer Camp",
  "childId": "child-uuid",
  "parentId": "parent-uuid",
  "pricingTierId": "tier-uuid-or-null",
  "selectedAddons": [
    {
      "addonId": "addon-uuid",
      "quantity": 5
    }
  ],
  "discountCode": "SUMMER10",
  "currency": "usd"
}
```

**Expected Response:**

```json
{
  "sessionId": "cs_test_xxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxx",
  "pricing": {
    "baseAmount": 50000,
    "addonsAmount": 12500,
    "discountAmount": 6250,
    "totalAmount": 56250
  }
}
```

**Verify in Stripe Checkout:**
- Camp registration appears as line item
- Add-ons appear as separate line items
- Discounts are applied
- Total matches calculated amount

---

## Admin UI Integration (Next Steps)

To make this fully no-code, you'll need to build admin UI for:

### 1. Add-ons Management Page

**Location**: `src/pages/admin/CampAddonsManagement.tsx`

**Features**:
- List all add-ons for a camp
- Add new add-on form
- Edit/delete existing add-ons
- Upload images for merchandise
- Set max quantities
- Toggle availability

**Example Form Fields**:
```tsx
- Name (text)
- Description (textarea)
- Category (dropdown: meal, merchandise, transport, equipment, other)
- Price (number, displayed as $XX.XX)
- Currency (dropdown, default USD)
- Optional (checkbox)
- Max Quantity (number)
- Image URL (file upload)
- Metadata (JSON editor for size charts, dietary options, etc.)
```

### 2. Pricing Tiers Page

**Location**: `src/pages/admin/CampPricingTiers.tsx`

**Features**:
- Add multiple pricing options
- Set capacity limits per tier
- Define included items
- Reorder tiers by drag-drop

**Example**:
```tsx
Pricing Tier: Full Day
Price: $500
Capacity: 30 kids
Hours: 9am - 5pm
Includes: All activities, lunch, snacks
```

### 3. Automatic Discounts Dashboard

**Location**: `src/pages/admin/AutomaticDiscounts.tsx`

**Features**:
- Create sibling discounts
- Multi-camp bundle discounts
- Volume discounts
- Set trigger conditions
- Preview discount calculations

### 4. Enhanced Camp Creation Wizard

Add steps to existing camp creation flow:

**Step 4: Pricing (Enhanced)**
```
Base Pricing
├─ Standard Price: $500
└─ Early Bird: $400 (until Jun 1)

Pricing Tiers (Optional)
├─ Add Tier: Full Day - $500
├─ Add Tier: Half Day - $350
└─ Add Tier: Extended Care - $600

Add-ons (Optional)
├─ Lunch Package - $25
├─ Camp T-Shirt - $20
└─ Daily Transport - $100
```

**Step 5: Discounts**
```
Discount Codes
├─ SUMMER10 - 10% off
└─ EARLYBIRD - $50 off

Automatic Discounts
├─ ☑ Sibling Discount (10% for 2+ siblings)
└─ ☐ Multi-camp Bundle (15% for 3+ camps)
```

---

## How It Works: Data Flow

### Camp Creation Flow

```
1. Admin creates camp in UI
   ↓
2. Camp saved to database (status: draft)
   ↓
3. Admin publishes camp
   ↓
4. Database trigger fires
   ↓
5. sync-stripe-products Edge Function called
   ↓
6. Stripe Product created
   ↓
7. Stripe Prices created (standard, early bird, tiers)
   ↓
8. stripe_products and stripe_prices tables updated
   ↓
9. Camp is now available for registration
```

### Registration + Payment Flow

```
1. Parent visits camp page
   ↓
2. Selects pricing tier (if available)
   ↓
3. Adds optional add-ons
   ↓
4. Enters discount code
   ↓
5. Frontend calls calculate_registration_total() to show preview
   ↓
6. Parent clicks "Register & Pay"
   ↓
7. create-checkout-session Edge Function called
   ↓
8. Server recalculates pricing (security)
   ↓
9. Checks for automatic discounts (sibling, volume)
   ↓
10. Creates registration record
   ↓
11. Builds Stripe line items from stripe_prices table
   ↓
12. Creates Stripe Checkout Session with discounts
   ↓
13. Redirects to Stripe Checkout
   ↓
14. Parent completes payment
   ↓
15. Webhook updates registration status
   ↓
16. Confirmation email sent
```

---

## API Reference

### Edge Function: sync-stripe-products

**Endpoint**: `POST /functions/v1/sync-stripe-products`

**Authentication**: Requires Service Role Key

**Request Body**:

```json
{
  "action": "create" | "update" | "delete" | "sync_all",
  "campId": "uuid",  // Required for camp operations
  "addonId": "uuid"  // Required for addon operations
}
```

**Response**:

```json
{
  "success": true,
  "product": {
    "id": "prod_xxxxx",
    "name": "Summer Soccer Camp",
    "active": true
  },
  "prices": [
    {
      "stripe_price_id": "price_xxxxx",
      "amount": 50000,
      "tier": "standard"
    },
    {
      "stripe_price_id": "price_yyyyy",
      "amount": 40000,
      "tier": "early_bird"
    }
  ]
}
```

### Database Function: calculate_registration_total()

**Usage**:

```sql
SELECT * FROM calculate_registration_total(
  p_camp_id := 'camp-uuid',
  p_pricing_tier_id := 'tier-uuid',  -- NULL for base price
  p_selected_addons := '[
    {"addon_id": "uuid1", "quantity": 2},
    {"addon_id": "uuid2", "quantity": 1}
  ]'::jsonb,
  p_discount_code := 'SUMMER10',
  p_parent_id := 'parent-uuid'
);
```

**Returns**:

| Column | Type | Description |
|--------|------|-------------|
| base_amount | INTEGER | Camp price in cents |
| addons_amount | INTEGER | Total add-ons cost |
| discount_amount | INTEGER | Total discounts applied |
| total_amount | INTEGER | Final amount to charge |
| discount_details | JSONB | Breakdown of discounts |

---

## Troubleshooting

### Issue: Stripe Products Not Syncing

**Symptoms**: Camp published but no product in Stripe Dashboard

**Solutions**:

1. **Check if pg_net extension is enabled**:
   ```sql
   SELECT * FROM pg_extension WHERE extname = 'pg_net';
   ```
   If not found:
   ```sql
   CREATE EXTENSION pg_net;
   ```

2. **Verify Supabase secrets are set**:
   ```sql
   SELECT current_setting('app.supabase_url', true);
   SELECT current_setting('app.service_role_key', true);
   ```
   Should return your URL and key, not NULL

3. **Check trigger logs**:
   ```sql
   -- In Supabase Dashboard → Logs → Postgres Logs
   -- Look for: "Triggered Stripe sync for camp..."
   ```

4. **Manually trigger sync**:
   ```sql
   SELECT sync_all_camps_to_stripe();
   ```

### Issue: Pricing Calculation Incorrect

**Symptoms**: Total amount doesn't match expected

**Debug Steps**:

1. **Test calculation function directly**:
   ```sql
   SELECT * FROM calculate_registration_total(
     'camp-id', NULL, '[]'::jsonb, NULL, NULL
   );
   ```

2. **Check early bird pricing**:
   ```sql
   SELECT
     price,
     early_bird_price,
     early_bird_deadline,
     early_bird_deadline > NOW() as is_active
   FROM camps WHERE id = 'camp-id';
   ```

3. **Verify add-on prices**:
   ```sql
   SELECT id, name, price, available
   FROM camp_addons WHERE camp_id = 'camp-id';
   ```

### Issue: Discount Not Applied

**Symptoms**: Discount code accepted but not reflected in total

**Solutions**:

1. **Validate discount code**:
   ```sql
   SELECT * FROM validate_discount_code(
     'SUMMER10',
     'camp-id',
     'parent-id'
   );
   ```

2. **Check discount expiration**:
   ```sql
   SELECT
     code,
     active,
     valid_from,
     valid_until,
     max_uses,
     uses_count
   FROM discount_codes WHERE code = 'SUMMER10';
   ```

3. **Check applicable camps**:
   ```sql
   SELECT applicable_camps FROM discount_codes WHERE code = 'SUMMER10';
   -- Should be NULL (all camps) or contain your camp_id
   ```

### Issue: Automatic Sibling Discount Not Triggering

**Symptoms**: Parent has multiple kids registered but discount not applied

**Debug**:

```sql
-- Check automatic discounts
SELECT * FROM get_applicable_automatic_discounts(
  'parent-id',
  'camp-id',
  50000  -- amount in cents
);

-- Verify sibling count
SELECT
  c.parent_id,
  COUNT(DISTINCT r.child_id) as sibling_count
FROM children c
INNER JOIN registrations r ON r.child_id = c.id
WHERE c.parent_id = 'parent-id'
AND r.status IN ('confirmed', 'pending')
GROUP BY c.parent_id;
```

---

## Security Considerations

### ✅ Already Implemented

1. **Server-side pricing calculation** - Never trust client amounts
2. **Row Level Security (RLS)** - All tables have proper policies
3. **Webhook signature verification** - Existing in stripe-webhook function
4. **Service role key** - Securely stored in Supabase secrets
5. **Amount validation** - Recalculated server-side before charging

### 🔒 Best Practices

1. **Never expose service role key** to frontend
2. **Always recalculate amounts** server-side
3. **Validate user permissions** before allowing admin operations
4. **Use RLS policies** for all user data access
5. **Log all payment operations** for audit trail

---

## Monitoring & Analytics

### Key Metrics to Track

1. **Stripe Product Sync Success Rate**
   ```sql
   -- Count camps vs Stripe products
   SELECT
     (SELECT COUNT(*) FROM camps WHERE status = 'published') as published_camps,
     (SELECT COUNT(*) FROM stripe_products WHERE entity_type = 'camp') as synced_products;
   ```

2. **Add-on Adoption Rate**
   ```sql
   SELECT
     addon.name,
     COUNT(r.id) as registrations_with_addon,
     SUM(COALESCE((a->>'quantity')::int, 0)) as total_quantity
   FROM camp_addons addon
   CROSS JOIN LATERAL jsonb_array_elements(
     (SELECT selected_addons FROM registrations WHERE selected_addons @> jsonb_build_array(jsonb_build_object('addon_id', addon.id::text)))
   ) a
   INNER JOIN registrations r ON r.selected_addons @> jsonb_build_array(jsonb_build_object('addon_id', addon.id::text))
   GROUP BY addon.id, addon.name
   ORDER BY registrations_with_addon DESC;
   ```

3. **Discount Usage**
   ```sql
   SELECT
     code,
     uses_count,
     discount_type,
     discount_value,
     SUM(COALESCE((discount_applied->>'amount')::int, 0)) / 100.0 as total_discount_given
   FROM discount_codes dc
   LEFT JOIN registrations r ON r.discount_code = dc.code
   GROUP BY dc.id, dc.code, dc.uses_count, dc.discount_type, dc.discount_value
   ORDER BY total_discount_given DESC;
   ```

4. **Revenue Breakdown**
   ```sql
   SELECT
     c.name as camp_name,
     COUNT(r.id) as registrations,
     SUM(r.base_amount) / 100.0 as base_revenue,
     SUM(r.addons_amount) / 100.0 as addons_revenue,
     SUM(r.total_amount) / 100.0 as total_revenue
   FROM camps c
   INNER JOIN registrations r ON r.camp_id = c.id
   WHERE r.status = 'confirmed'
   GROUP BY c.id, c.name
   ORDER BY total_revenue DESC;
   ```

---

## Next Steps (Phase 2)

Now that Phase 1 is complete, here's what comes next:

### 1. Admin UI Development (Week 3-4)
- Add-ons management page
- Pricing tiers configuration
- Automatic discounts dashboard
- Enhanced camp creation wizard

### 2. Frontend Registration Enhancements (Week 3-4)
- Add-ons selector UI
- Pricing tier radio buttons
- Real-time price calculator
- Discount code input with validation

### 3. Payment Plans & Installments (Week 4-5)
- Payment plan configuration
- Installment scheduling
- Reminder emails for due payments

### 4. Stripe Connect for Payouts (Week 5-6)
- Organization onboarding flow
- Automatic commission splits
- Payout dashboard

### 5. Testing & QA (Week 6-7)
- End-to-end testing
- Load testing
- Security audit
- User acceptance testing

### 6. Production Deployment (Week 7-8)
- Gradual rollout
- Monitor error rates
- User training
- Documentation updates

---

## Support & Questions

For issues or questions during implementation:

1. **Check Supabase Logs**:
   - Dashboard → Logs → Postgres Logs
   - Dashboard → Logs → Edge Function Logs

2. **Stripe Dashboard**:
   - Verify products/prices created correctly
   - Check webhook events

3. **Database Inspection**:
   ```sql
   -- View recent Stripe products
   SELECT * FROM stripe_products ORDER BY created_at DESC LIMIT 10;

   -- View prices
   SELECT sp.name, pr.*
   FROM stripe_prices pr
   JOIN stripe_products sp ON sp.id = pr.stripe_product_id
   ORDER BY pr.created_at DESC LIMIT 10;
   ```

---

## Summary

Phase 1 establishes a solid, data-driven foundation for Stripe integration:

✅ **Zero code changes** needed for new camps
✅ **Automatic sync** to Stripe via database triggers
✅ **Flexible pricing** with tiers and add-ons
✅ **Smart discounting** (sibling, volume, codes)
✅ **Secure payment processing** with server-side validation
✅ **Complete audit trail** in database

The system is now ready for frontend UI development to make these features accessible to camp organizers through the admin dashboard.

**Status**: ✅ Phase 1 Complete - Ready for Testing & Admin UI Development
