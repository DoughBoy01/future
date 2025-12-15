# Stripe Connect Payment Splitting Implementation

## Overview

This implementation enables **automatic payment splitting** between the platform and camp organizers using **Stripe Connect**. When a parent pays for a camp, the platform automatically deducts its commission and transfers the remainder to the camp organizer's Stripe account.

---

## Architecture

### Payment Flow

```
1. Parent initiates checkout
   ↓
2. Checkout session created with destination charge
   ↓
3. Payment processed by Stripe
   ↓
4. Platform commission automatically deducted (application fee)
   ↓
5. Remaining funds transferred to camp organizer's Stripe account
   ↓
6. Commission record created in database
   ↓
7. Payout recorded when funds reach organizer's bank
```

### Key Components

1. **Stripe Connect Onboarding** - Camp organizers link their Stripe accounts
2. **Destination Charges** - Automatic payment splitting at checkout
3. **Commission Tracking** - Database records of all platform fees
4. **Payout Management** - Admin dashboard for managing and viewing payouts
5. **Webhook Handlers** - Real-time updates for payment and transfer events

---

## Setup Instructions

### 1. Stripe Account Configuration

#### Create Stripe Connect Application

1. Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Navigate to **Settings → Connect**
3. Enable **Stripe Connect**
4. Choose account type: **Standard** (recommended for this implementation)
5. Configure branding and settings
6. Save your configuration

#### Get API Keys

1. Go to **Developers → API Keys**
2. Copy your **Publishable Key** and **Secret Key**
3. For test mode, use test keys (starting with `pk_test_` and `sk_test_`)
4. Store these securely

---

### 2. Environment Variables

Add the following to your `.env` file (frontend) and Supabase Edge Function secrets:

```bash
# Frontend (.env)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Supabase Edge Functions (via supabase secrets set)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=https://your-frontend-url.com
```

#### Set Supabase Secrets

```bash
# Navigate to your project directory
cd /path/to/your/project

# Set secrets for Edge Functions
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
supabase secrets set FRONTEND_URL=https://your-frontend-url.com
```

---

### 3. Deploy Edge Functions

Deploy the following Edge Functions to Supabase:

```bash
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

---

### 4. Configure Stripe Webhooks

#### Create Webhook Endpoint

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://your-project.supabase.co/functions/v1/stripe-webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `account.updated` (Connect)
   - `transfer.created` (Connect)
   - `transfer.paid` (Connect)
   - `payout.paid` (Connect)
   - `payout.failed` (Connect)

5. Save the webhook
6. Copy the **Signing secret** (`whsec_...`)
7. Add it to your Edge Function secrets:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

### 5. Database Migrations

Ensure these migrations are applied (already in your codebase):

- `001_add_camp_organizer_role.sql` - Camp organizer role
- `002_create_organisation_members.sql` - Organization members
- `003_add_organisation_onboarding.sql` - Stripe Connect fields
- `006_create_payouts_table.sql` - Payout tracking
- `commission_records` table - Commission tracking

No additional migrations needed - your database is already set up!

---

## User Workflows

### Camp Organizer: Connect Stripe Account

1. **Navigate to Organizer Dashboard**
   - Camp organizer logs in
   - Goes to `/organizer-dashboard`

2. **Stripe Connect Onboarding Component Appears**
   - Component: `<StripeConnectOnboarding />`
   - Shows "Connect Your Stripe Account" if no account linked

3. **Click "Connect with Stripe"**
   - Edge Function `create-connect-account` is called
   - Creates Stripe Connect account
   - Redirects to Stripe onboarding form

4. **Complete Stripe Onboarding**
   - Provide business information
   - Add bank account details
   - Verify identity
   - Return to dashboard

5. **Account Status Updated**
   - `organisations.stripe_account_id` saved
   - `organisations.stripe_account_status` set to 'active'
   - `organisations.payout_enabled` set to true
   - Camp organizer can now receive payments

---

### Parent: Book a Camp

1. **Browse and Select Camp**
   - Parent visits `/camps`
   - Selects a camp

2. **Register for Camp**
   - Clicks "Register"
   - Fills out child details form

3. **Checkout Process**
   - Clicks "Proceed to Payment"
   - Edge Function `create-checkout-session` called with:
     - `campId`
     - `amount`
     - `registrationId`

4. **Automatic Payment Splitting**
   - Checkout session created with:
     ```javascript
     payment_intent_data: {
       application_fee_amount: platformCommission,
       transfer_data: {
         destination: organizerStripeAccountId
       }
     }
     ```
   - Platform fee: 15% (configurable per camp via `camps.commission_rate`)
   - Organizer receives: 85%

5. **Payment Successful**
   - Webhook `checkout.session.completed` triggered
   - Booking status updated to 'confirmed'
   - Commission record created
   - Funds automatically in organizer's Stripe account

---

### Admin: Manage Payouts

1. **View Payout Dashboard**
   - Navigate to `/admin/payouts`
   - See pending payouts per organization

2. **Process Payouts (Optional)**
   - Click "Process All Payouts"
   - Edge Function `process-payouts` called
   - Groups pending commissions
   - Creates payout records
   - Marks commissions as paid

   **Note:** With destination charges, funds are **already in the connected account**. The payout management is for record-keeping and can trigger actual bank transfers based on the organization's payout schedule.

3. **View Analytics**
   - Navigate to `/admin/payment-analytics`
   - See revenue breakdown by organization
   - View platform vs. organizer earnings
   - Filter by date range

---

## Technical Details

### Destination Charges vs. Separate Charges

This implementation uses **Destination Charges** for simplicity:

**Destination Charges (Implemented)**
- ✅ Automatic payment splitting
- ✅ Platform keeps application fee
- ✅ Funds go directly to connected account
- ✅ Dispute liability on platform
- ✅ Simpler implementation

**Alternative: Separate Charges and Transfers**
- Requires manual transfer creation
- More control over timing
- More complex implementation

### Commission Calculation

```javascript
const totalAmount = 100.00; // Booking price
const commissionRate = 0.15; // 15% platform fee
const applicationFeeAmount = totalAmount * commissionRate; // $15
const organizerReceives = totalAmount - applicationFeeAmount; // $85
```

Commission rates are configurable per camp via `camps.commission_rate`.

### Payout Schedules

Organizations can configure payout schedules:
- **Daily** - Funds transferred to bank daily
- **Weekly** - Funds transferred weekly
- **Monthly** - Funds transferred monthly
- **Manual** - On-demand transfers

Set via `organisations.payout_schedule`.

### Minimum Payout Amount

Organizations can set minimum payout thresholds via `organisations.minimum_payout_amount`. Payouts won't process until this threshold is met (prevents transaction fees from eating into small payouts).

---

## Testing

### Test Mode Setup

1. **Use Stripe Test Keys**
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   ```

2. **Test Card Numbers**
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

3. **Test Connect Accounts**
   - Use Stripe's test mode for Connect onboarding
   - Fill with test data (no real business required)

### Testing Workflow

1. **Create Test Organization**
   ```sql
   INSERT INTO organisations (name, contact_email, active)
   VALUES ('Test Camp Co', 'test@example.com', true);
   ```

2. **Assign User as Camp Organizer**
   ```sql
   UPDATE profiles
   SET role = 'camp_organizer', organisation_id = 'org-uuid'
   WHERE email = 'organizer@test.com';
   ```

3. **Connect Test Stripe Account**
   - Log in as organizer
   - Go to dashboard
   - Click "Connect with Stripe"
   - Complete test onboarding

4. **Create Test Camp**
   - Create camp with `commission_rate = 0.15`
   - Link to organization

5. **Make Test Booking**
   - Register as parent
   - Book the camp
   - Use test card `4242 4242 4242 4242`
   - Verify payment splits correctly

6. **Check Database Records**
   ```sql
   -- Check payment record
   SELECT * FROM payment_records WHERE status = 'succeeded';

   -- Check commission record
   SELECT * FROM commission_records WHERE booking_id = 'booking-uuid';

   -- Check Stripe account
   SELECT stripe_account_id, payout_enabled FROM organisations WHERE id = 'org-uuid';
   ```

---

## Monitoring & Logs

### View Edge Function Logs

```bash
# View real-time logs
supabase functions logs stripe-webhook --tail

# View specific function logs
supabase functions logs create-checkout-session
supabase functions logs process-payouts
```

### Stripe Dashboard Monitoring

1. **Payments** - View all processed payments
2. **Connect → Accounts** - View connected accounts
3. **Connect → Transfers** - View automatic transfers
4. **Events & Webhooks** - Debug webhook delivery
5. **Logs** - View API request logs

---

## Troubleshooting

### Issue: "Camp organizer has not connected their Stripe account"

**Cause:** Organization doesn't have `stripe_account_id`

**Fix:**
```sql
SELECT stripe_account_id, payout_enabled FROM organisations WHERE id = 'org-uuid';
```
If null, organizer needs to complete Stripe Connect onboarding.

---

### Issue: "Stripe account is not fully set up"

**Cause:** Account exists but `payout_enabled = false`

**Fix:**
1. Check Stripe Dashboard → Connect → Accounts
2. Look for "Action required" notifications
3. Organizer may need to complete verification
4. Create account link for them to continue:
   ```javascript
   await supabase.functions.invoke('create-connect-account-link', {
     body: { organisationId: 'org-uuid' }
   });
   ```

---

### Issue: Webhook not receiving events

**Cause:** Webhook endpoint not configured or signing secret incorrect

**Fix:**
1. Verify webhook URL in Stripe Dashboard
2. Check webhook signing secret matches `STRIPE_WEBHOOK_SECRET`
3. Test webhook delivery in Stripe Dashboard
4. Check Edge Function logs:
   ```bash
   supabase functions logs stripe-webhook --tail
   ```

---

### Issue: Commission not created after payment

**Cause:** Webhook handler error or booking not found

**Fix:**
1. Check Edge Function logs for errors
2. Verify `bookings` table has matching `stripe_checkout_session_id`
3. Verify `camps` table has `commission_rate` set
4. Manually create commission if needed:
   ```sql
   INSERT INTO commission_records (
     booking_id, camp_id, organisation_id,
     commission_rate, registration_amount, commission_amount,
     payment_status
   ) VALUES (
     'booking-uuid', 'camp-uuid', 'org-uuid',
     0.15, 100.00, 15.00,
     'pending'
   );
   ```

---

## Security Considerations

1. **PCI-DSS Compliance**
   - Never store card details
   - Use Stripe Checkout (PCI-compliant)
   - All payment data handled by Stripe

2. **Webhook Signature Verification**
   - Always verify webhook signatures
   - Prevents fake webhook events
   - Implemented in `stripe-webhook` function

3. **RLS Policies**
   - Organizations can only see their own payouts
   - Parents can only see their own payments
   - Admins have full access

4. **API Key Security**
   - Never commit API keys to git
   - Use environment variables
   - Rotate keys regularly
   - Use test keys in development

---

## Production Deployment Checklist

- [ ] Replace test Stripe keys with live keys
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Configure production webhook endpoint
- [ ] Test complete booking flow in production
- [ ] Verify payouts reach real bank accounts
- [ ] Set up monitoring alerts
- [ ] Document team processes for handling failed payouts
- [ ] Train customer support on refund procedures
- [ ] Review and test dispute handling workflow

---

## Support & Resources

### Stripe Documentation
- [Stripe Connect Overview](https://stripe.com/docs/connect)
- [Destination Charges](https://stripe.com/docs/connect/destination-charges)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Connect](https://stripe.com/docs/connect/testing)

### Internal Documentation
- Commission Service: `src/services/commissionService.ts`
- Payout Service: `src/services/payoutService.ts`
- Stripe Connect Onboarding: `src/components/stripe/StripeConnectOnboarding.tsx`

### Database Schema
- `organisations` - Stripe account details
- `commission_records` - Platform fees
- `payouts` - Payout history
- `payment_records` - Transaction logs

---

## Future Enhancements

1. **Automated Payout Scheduling**
   - Cron job to process payouts daily/weekly
   - Respect organization `payout_schedule` preferences

2. **Payout Notifications**
   - Email notifications when payout processed
   - Webhook to notify organizations

3. **Dispute Management UI**
   - Handle chargebacks
   - Split dispute liability

4. **Multi-Currency Support**
   - Support camps in different currencies
   - Automatic currency conversion

5. **Advanced Analytics**
   - Revenue forecasting
   - Commission optimization
   - Payout predictions

---

## License & Credits

**Implementation:** FutureEdge Platform
**Payment Processing:** Stripe
**Database:** Supabase (PostgreSQL)
**Edge Functions:** Deno Runtime

For questions or support, contact your development team or refer to the Stripe documentation links above.
