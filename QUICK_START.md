# Stripe Connect - Quick Start Guide

**5-Minute Setup for Testing**

---

## Prerequisites

- Stripe account (test mode)
- Supabase project running
- Frontend dev server running

---

## Step 1: Get Stripe Test Keys (2 minutes)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Toggle to **Test Mode** (top right)
3. Navigate to **Developers → API Keys**
4. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

---

## Step 2: Set Environment Variables (1 minute)

### Frontend (.env)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

### Supabase Secrets
```bash
cd /Users/stephenaris/Future_db/future

supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
supabase secrets set FRONTEND_URL=http://localhost:5176
```

---

## Step 3: Deploy Edge Functions (2 minutes)

```bash
# Deploy all Stripe Connect functions
supabase functions deploy create-connect-account
supabase functions deploy create-connect-account-link
supabase functions deploy stripe-connect-status
supabase functions deploy create-connect-login-link
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy process-payouts
```

---

## Step 4: Configure Webhook (Optional for testing)

For webhook testing, use Stripe CLI or skip this step.

**Quick webhook setup:**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local Supabase
stripe listen --forward-to https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
```

---

## Step 5: Test End-to-End (10 minutes)

### A. Create Test Data

```sql
-- 1. Create test organization
INSERT INTO organisations (id, name, contact_email, active)
VALUES ('org-test-123', 'Test Camp Organization', 'test@example.com', true);

-- 2. Create test camp organizer user
INSERT INTO auth.users (id, email)
VALUES ('user-organizer-123', 'organizer@test.com')
ON CONFLICT DO NOTHING;

INSERT INTO profiles (id, email, role, organisation_id)
VALUES ('user-organizer-123', 'organizer@test.com', 'camp_organizer', 'org-test-123')
ON CONFLICT (id) DO UPDATE SET role = 'camp_organizer', organisation_id = 'org-test-123';

-- 3. Create test camp
INSERT INTO camps (id, name, organisation_id, price, commission_rate, status, active)
VALUES (
  'camp-test-123',
  'Test Summer Camp',
  'org-test-123',
  100.00,
  0.15,
  'approved',
  true
);
```

### B. Onboard Camp Organizer

1. **Log in as organizer:**
   - Email: `organizer@test.com`
   - Create password if needed

2. **Navigate to:** `http://localhost:5176/organizer-dashboard`

3. **Click:** "Connect with Stripe"

4. **Fill test onboarding:**
   - Business name: Test Camp Co
   - Business type: Individual
   - Country: United States
   - Use test bank: Routing `110000000`, Account `000123456789`
   - Skip identity verification (test mode)

5. **Verify:** Stripe account connected
   ```sql
   SELECT stripe_account_id, payout_enabled FROM organisations WHERE id = 'org-test-123';
   ```

### C. Make Test Booking

1. **Create test parent account** (if needed)

2. **Navigate to:** `http://localhost:5176/camps/camp-test-123`

3. **Click:** "Register"

4. **Fill registration form**

5. **Checkout with test card:**
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits

6. **Complete payment**

### D. Verify Payment Split

```sql
-- Check payment record
SELECT * FROM payment_records ORDER BY created_at DESC LIMIT 1;

-- Check commission record (should be created by webhook)
SELECT * FROM commission_records ORDER BY created_at DESC LIMIT 1;
-- Expected: commission_amount = 15.00 (15% of 100.00)
```

### E. Process Payout

1. **Log in as super_admin**

2. **Navigate to:** `http://localhost:5176/admin/dashboard/payouts`

3. **Click:** "Process All Payouts"

4. **Verify payout record:**
   ```sql
   SELECT * FROM payouts ORDER BY created_at DESC LIMIT 1;
   ```

---

## ✅ Success!

If all steps completed successfully, you now have:

- ✅ Stripe Connect account linked to test organization
- ✅ Payment split automatically (85% to organizer, 15% to platform)
- ✅ Commission record created
- ✅ Payout processed

---

## 🎯 Next Steps

1. **Test with different scenarios:**
   - Different commission rates
   - Multiple organizations
   - Failed payments (test card: `4000 0000 0000 0002`)
   - Refunds

2. **Explore admin dashboards:**
   - `/admin/dashboard/payouts` - Payout management
   - `/admin/dashboard/payment-analytics` - Revenue analytics
   - `/admin/dashboard/commissions` - Commission tracking

3. **Review documentation:**
   - `STRIPE_CONNECT_IMPLEMENTATION.md` - Complete guide
   - `STRIPE_CONNECT_IMPLEMENTATION_SUMMARY.md` - Implementation summary
   - `DEPLOYMENT_CHECKLIST.md` - Production deployment steps

---

## 🐛 Troubleshooting

**Issue: Webhook events not received**
```bash
# Check webhook is listening
stripe listen --print-secret

# Set the webhook secret
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx

# Check logs
supabase functions logs stripe-webhook --tail
```

**Issue: Payment doesn't split**

Check:
1. Organization has `stripe_account_id`
2. Organization has `payout_enabled = true`
3. Camp has `commission_rate` set (e.g., 0.15)
4. Edge function logs for errors

**Issue: Can't connect Stripe account**

- Make sure you're in Stripe **Test Mode**
- Use test bank account details
- Check Edge Function logs: `supabase functions logs create-connect-account`

---

## 📞 Need Help?

- **Documentation:** See `STRIPE_CONNECT_IMPLEMENTATION.md`
- **Stripe Docs:** https://stripe.com/docs/connect
- **Supabase Docs:** https://supabase.com/docs

---

**Happy Testing! 🚀**
