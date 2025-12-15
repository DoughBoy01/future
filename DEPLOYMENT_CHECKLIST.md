# Stripe Connect Deployment Checklist

Use this checklist to deploy your Stripe Connect payment splitting system to production.

---

## 📋 Pre-Deployment Checklist

### ✅ 1. Environment Variables

#### Frontend (.env)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...    # ⚠️ Use LIVE key for production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

#### Supabase Secrets
```bash
# Set these via: supabase secrets set KEY=value

STRIPE_SECRET_KEY=sk_live_...              # ⚠️ Use LIVE key for production
STRIPE_WEBHOOK_SECRET=whsec_...            # From Stripe webhook config
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
FRONTEND_URL=https://your-production-domain.com  # ⚠️ Update to production URL
```

---

### ✅ 2. Deploy Edge Functions

```bash
# Navigate to project directory
cd /path/to/your/project

# Deploy Stripe Connect functions
supabase functions deploy create-connect-account
supabase functions deploy create-connect-account-link
supabase functions deploy stripe-connect-status
supabase functions deploy create-connect-login-link

# Deploy payment functions
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook

# Deploy payout function
supabase functions deploy process-payouts
```

**Verify deployment:**
```bash
supabase functions list
```

---

### ✅ 3. Configure Production Stripe Webhook

1. **Go to Stripe Dashboard (Live Mode)**
   - Switch to Live mode (toggle in top right)
   - Navigate to: **Developers → Webhooks**

2. **Add Endpoint**
   - Click "Add endpoint"
   - URL: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
   - Description: "FutureEdge Production Webhook"

3. **Select Events**
   Select ALL of these events:
   - ✅ `checkout.session.completed`
   - ✅ `checkout.session.expired`
   - ✅ `payment_intent.payment_failed`
   - ✅ `charge.refunded`
   - ✅ `account.updated`
   - ✅ `transfer.created`
   - ✅ `transfer.paid`
   - ✅ `payout.paid`
   - ✅ `payout.failed`

4. **Save & Get Signing Secret**
   - Click "Add endpoint"
   - Click "Reveal" under "Signing secret"
   - Copy the secret (starts with `whsec_`)

5. **Update Supabase Secret**
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_SECRET
   ```

---

### ✅ 4. Test Webhook Delivery

1. **Send Test Event from Stripe**
   - In Stripe Dashboard → Webhooks
   - Click your webhook endpoint
   - Click "Send test webhook"
   - Select `checkout.session.completed`
   - Click "Send test webhook"

2. **Verify in Supabase Logs**
   ```bash
   supabase functions logs stripe-webhook --tail
   ```

   You should see:
   ```
   Webhook event type: checkout.session.completed
   ```

---

### ✅ 5. Database Migration Check

Ensure all migrations are applied in production:

```bash
# Check migration status
supabase migration list

# Apply any pending migrations
supabase db push
```

**Required tables:**
- ✅ `organisations` (with Stripe Connect fields)
- ✅ `camps` (with commission_rate)
- ✅ `bookings` (formerly registrations)
- ✅ `payment_records`
- ✅ `commission_records`
- ✅ `payouts`
- ✅ `upcoming_payouts_summary` (view)

---

### ✅ 6. Update Frontend Routes

Ensure these routes are accessible in production:

**Admin Routes:**
- `/admin/dashboard/payouts`
- `/admin/dashboard/payment-analytics`
- `/admin/dashboard/commissions`

**Organizer Routes:**
- `/organizer-dashboard`

---

### ✅ 7. Add Onboarding Component to Organizer Dashboard

Edit: `src/pages/organizer/OrganizerDashboardOverview.tsx`

```tsx
import { StripeConnectOnboarding } from '../../components/stripe/StripeConnectOnboarding';

export default function OrganizerDashboardOverview() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organizer Dashboard</h1>

      {/* Stripe Connect Onboarding */}
      <StripeConnectOnboarding />

      {/* Rest of your dashboard */}
    </div>
  );
}
```

---

## 🧪 Production Testing

### Test 1: Camp Organizer Onboarding

1. **Create Test Organization**
   - Use Supabase Dashboard or SQL:
     ```sql
     INSERT INTO organisations (name, contact_email, active)
     VALUES ('Test Production Org', 'your-email@example.com', true);
     ```

2. **Assign User as Organizer**
   ```sql
   UPDATE profiles
   SET role = 'camp_organizer',
       organisation_id = 'YOUR_ORG_ID'
   WHERE email = 'test-organizer@example.com';
   ```

3. **Complete Onboarding**
   - Log in as organizer
   - Go to `/organizer-dashboard`
   - Click "Connect with Stripe"
   - **Use REAL business information** (Stripe will verify)
   - Complete all verification steps
   - Return to dashboard

4. **Verify in Database**
   ```sql
   SELECT stripe_account_id, stripe_account_status, payout_enabled
   FROM organisations
   WHERE id = 'YOUR_ORG_ID';
   ```

   Should return:
   - `stripe_account_id`: `acct_...`
   - `stripe_account_status`: `active`
   - `payout_enabled`: `true`

---

### Test 2: End-to-End Payment Split

1. **Create Live Camp**
   - Create camp with `commission_rate = 0.15`
   - Link to organization with Stripe account

2. **Make Real Booking**
   - ⚠️ **Use REAL credit card** (will be charged)
   - Complete checkout
   - Verify payment success

3. **Check Payment Split**
   - **Stripe Dashboard → Payments**
     - Should show full payment amount
   - **Stripe Dashboard → Connect → Transfers**
     - Should show transfer to connected account
     - Amount = (Total - Application Fee)

4. **Verify Database Records**
   ```sql
   -- Check payment record
   SELECT * FROM payment_records
   WHERE status = 'succeeded'
   ORDER BY created_at DESC
   LIMIT 1;

   -- Check commission record
   SELECT * FROM commission_records
   WHERE payment_status = 'pending'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

---

### Test 3: Payout Processing

1. **Access Admin Dashboard**
   - Log in as super_admin
   - Navigate to `/admin/dashboard/payouts`

2. **View Pending Payouts**
   - Should see organization with pending commission

3. **Process Payout**
   - Click "Process All Payouts"
   - Verify success message

4. **Check Results**
   - Commission status should change to `paid`
   - Payout record created in `payouts` table
   - Funds remain in connected account (already transferred via destination charge)

---

## 🔍 Monitoring

### Check Edge Function Logs

```bash
# Real-time webhook logs
supabase functions logs stripe-webhook --tail

# Checkout session logs
supabase functions logs create-checkout-session --tail

# Payout processing logs
supabase functions logs process-payouts --tail
```

---

### Monitor Stripe Dashboard

**Daily Checks:**
1. **Payments** - All successful payments logged
2. **Connect → Accounts** - All organizer accounts healthy
3. **Connect → Transfers** - All transfers successful
4. **Events & Webhooks** - No failed webhook deliveries

**Weekly Checks:**
1. **Payouts** - All scheduled payouts processed
2. **Disputes** - No unresolved chargebacks
3. **Balances** - Platform balance matches expected commission

---

## 🚨 Rollback Plan

If issues occur, you can rollback:

### Option 1: Disable Destination Charges

Temporarily revert checkout to standard charges:

1. Comment out `payment_intent_data` in `create-checkout-session/index.ts`
2. Redeploy: `supabase functions deploy create-checkout-session`
3. Payments will process without splitting (100% to platform)
4. Manually transfer funds to organizers later

### Option 2: Rollback Edge Functions

```bash
# List function versions
supabase functions list --show-all

# Rollback specific function
supabase functions deploy create-checkout-session --version PREVIOUS_VERSION
```

### Option 3: Database Rollback

```bash
# Rollback last migration
supabase migration down

# Or restore from backup
supabase db restore BACKUP_ID
```

---

## 📊 Success Criteria

Before marking deployment as successful, verify:

- [ ] ✅ All Edge Functions deployed and responding
- [ ] ✅ Webhook endpoint configured and receiving events
- [ ] ✅ At least one camp organizer successfully onboarded
- [ ] ✅ At least one successful payment split
- [ ] ✅ Commission records created automatically
- [ ] ✅ Admin can view payment analytics
- [ ] ✅ Payout processing works end-to-end
- [ ] ✅ No errors in Edge Function logs
- [ ] ✅ All webhook events delivered successfully
- [ ] ✅ Database records accurate and consistent

---

## 🎯 Post-Deployment Tasks

### Week 1
- [ ] Monitor all transactions daily
- [ ] Check webhook delivery success rate
- [ ] Review Edge Function error rates
- [ ] Ensure organizers can access their earnings
- [ ] Verify commission calculations are correct

### Week 2-4
- [ ] Process first batch of payouts
- [ ] Gather feedback from camp organizers
- [ ] Monitor dispute/chargeback rates
- [ ] Review financial reports for accuracy
- [ ] Optimize payout schedules if needed

### Month 2+
- [ ] Implement automated payout scheduling
- [ ] Add email notifications for payouts
- [ ] Build organizer earnings dashboard
- [ ] Consider multi-currency support
- [ ] Evaluate commission rate optimization

---

## 📞 Emergency Contacts

**Stripe Support:**
- Live mode issues: [Stripe Support](https://support.stripe.com/)
- Critical payment failures: Contact via Dashboard → Help

**Supabase Support:**
- Edge Function issues: [Supabase Discord](https://discord.supabase.com/)
- Database issues: Check [Supabase Status](https://status.supabase.com/)

**Internal Team:**
- Payment System Owner: [Your email]
- Database Admin: [DBA email]
- DevOps Lead: [DevOps email]

---

## 🎉 Deployment Complete!

Once all checklist items are complete, your Stripe Connect payment splitting system is **live in production**!

**Key Metrics to Track:**
- Total Revenue
- Platform Commission Revenue
- Organizer Payouts
- Payment Success Rate
- Webhook Delivery Rate
- Average Payout Time

**Access dashboards at:**
- `/admin/dashboard/payouts`
- `/admin/dashboard/payment-analytics`

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Verification Completed By:** _______________
**Production URL:** _______________

---

🚀 **Ready for Production!**
