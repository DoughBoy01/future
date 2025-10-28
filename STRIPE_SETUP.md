# Stripe Setup Guide

This guide walks you through setting up Stripe for the camp registration payment system.

## Prerequisites

- A Stripe account (free to create at https://stripe.com)
- Access to your Supabase project dashboard
- Access to your project's `.env` file

## Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Start now" or "Sign in"
3. Complete the registration process
4. Verify your email address

## Step 2: Get Your Stripe API Keys

### Test Mode Keys (for development)

1. Log in to your Stripe Dashboard
2. Make sure you're in **Test Mode** (toggle in top right corner)
3. Navigate to **Developers** > **API keys**
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`) - click "Reveal test key"

### Live Mode Keys (for production)

1. Switch to **Live Mode** in Stripe Dashboard
2. Navigate to **Developers** > **API keys**
3. Complete business verification if required
4. Get your live keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

## Step 3: Configure Frontend

1. Open your project's `.env` file
2. Add your Stripe publishable key:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Important:** Use test key for development, live key for production.

## Step 4: Configure Supabase Edge Function Secrets

### Add Stripe Secret Key

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** > **Edge Functions**
3. Click on **Secrets** or **Environment Variables**
4. Add a new secret:
   - Name: `STRIPE_SECRET_KEY`
   - Value: Your Stripe secret key (starts with `sk_test_` or `sk_live_`)
5. Click **Save**

## Step 5: Set Up Stripe Webhooks

Webhooks allow Stripe to notify your application about payment events.

### 1. Get Your Webhook URL

Your webhook URL follows this pattern:
```
https://[your-project-id].supabase.co/functions/v1/stripe-webhook
```

Replace `[your-project-id]` with your actual Supabase project ID.

**Example:**
```
https://jkfbqimwhjukrmgjsxrj.supabase.co/functions/v1/stripe-webhook
```

### 2. Create Webhook in Stripe

1. Go to Stripe Dashboard > **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL
4. Click **Select events**
5. Select these events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
   - `charge.refunded`
6. Click **Add events**
7. Click **Add endpoint**

### 3. Get Webhook Signing Secret

1. After creating the webhook, you'll see the endpoint details
2. Click **Reveal** under "Signing secret"
3. Copy the webhook signing secret (starts with `whsec_`)

### 4. Add Webhook Secret to Supabase

1. Go back to Supabase Dashboard > **Edge Functions** > **Secrets**
2. Add a new secret:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: Your webhook signing secret
3. Click **Save**

## Step 6: Test the Integration

### Using Test Cards

Stripe provides test cards for development. Use these in test mode:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Payment Declined:**
- Card: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

**Requires Authentication:**
- Card: `4000 0025 0000 3155`
- Expiry: Any future date
- CVC: Any 3 digits

More test cards: https://stripe.com/docs/testing

### Test the Flow

1. Start your development server
2. Navigate to a camp page
3. Click "Register Now"
4. Select a child
5. Click "Proceed to Payment"
6. Use test card `4242 4242 4242 4242`
7. Complete the payment
8. Verify you're redirected to success page
9. Check Stripe Dashboard > **Payments** to see the test payment
10. Check your database for payment record

### Verify Webhook

1. Make a test payment
2. Go to Stripe Dashboard > **Developers** > **Webhooks**
3. Click on your webhook endpoint
4. Check the **Recent deliveries** section
5. You should see `checkout.session.completed` event
6. Status should be **Succeeded** (green checkmark)

If the webhook fails:
- Check Edge Function logs in Supabase
- Verify webhook URL is correct
- Verify webhook secret is correct
- Check that Edge Function is deployed

## Step 7: Going Live

When ready to accept real payments:

### 1. Complete Stripe Verification

1. Go to **Settings** in Stripe Dashboard
2. Complete business verification
3. Add bank account for payouts
4. Set up tax information

### 2. Switch to Live Keys

1. Update `.env` with live publishable key:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
```

2. Update Supabase secrets with live secret key:
   - `STRIPE_SECRET_KEY`: Use `sk_live_...` key

### 3. Create Live Webhook

1. Switch to **Live Mode** in Stripe Dashboard
2. Create a new webhook endpoint (same as Step 5)
3. Use the same webhook URL
4. Select the same events
5. Update Supabase secret `STRIPE_WEBHOOK_SECRET` with new signing secret

### 4. Test in Live Mode

1. Make a small real payment test (e.g., $1)
2. Use a real card
3. Verify the payment flow works
4. Verify webhook is triggered
5. Refund the test payment if needed

## Security Best Practices

### Protect Your Secret Keys

- **Never** commit secret keys to version control
- **Never** expose secret keys in frontend code
- Add `.env` to `.gitignore`
- Use environment variables for all keys
- Rotate keys if compromised

### Webhook Security

- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Monitor webhook deliveries
- Set up alerts for failed webhooks

### Payment Security

- Never store card details in your database
- Let Stripe handle all payment data
- Use Stripe's hosted checkout (no PCI compliance needed)
- Enable Stripe Radar for fraud detection

## Monitoring

### Stripe Dashboard

Monitor payments in real-time:
1. Go to **Payments** in Stripe Dashboard
2. View all transactions
3. Filter by status, date, amount
4. Export data for accounting

### Webhook Logs

Check webhook deliveries:
1. Go to **Developers** > **Webhooks**
2. Click your endpoint
3. View **Recent deliveries**
4. Check for failed deliveries

### Supabase Logs

Check Edge Function logs:
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Select the function
4. View logs for errors

## Troubleshooting

### "Stripe is not configured" Error

**Problem:** Frontend shows error about Stripe not configured

**Solution:**
1. Check `.env` file has `VITE_STRIPE_PUBLISHABLE_KEY`
2. Restart development server after adding key
3. Clear browser cache

### Payment Not Confirming

**Problem:** Payment succeeds in Stripe but not in app

**Solution:**
1. Check webhook is configured correctly
2. Verify webhook secret in Supabase
3. Check Edge Function logs for errors
4. Verify `payment_records` table has entry

### Webhook Signature Verification Failed

**Problem:** Webhook endpoint returns 400 error

**Solution:**
1. Verify webhook secret matches Stripe Dashboard
2. Check secret is not expired
3. Ensure no extra spaces in secret value
4. Re-copy secret from Stripe Dashboard

### Test Card Not Working

**Problem:** Test card fails in test mode

**Solution:**
1. Verify you're in test mode
2. Check you're using test keys (pk_test_ and sk_test_)
3. Use exact card number: 4242 4242 4242 4242
4. Use any future expiry date
5. Clear browser cache and try again

## Support Resources

### Stripe Documentation
- Main docs: https://stripe.com/docs
- Checkout docs: https://stripe.com/docs/payments/checkout
- Webhooks docs: https://stripe.com/docs/webhooks
- Testing guide: https://stripe.com/docs/testing

### Stripe Support
- Dashboard chat support (bottom right)
- Email: support@stripe.com
- Community: https://stripe.com/community

### Supabase Documentation
- Edge Functions: https://supabase.com/docs/guides/functions
- Secrets management: https://supabase.com/docs/guides/functions/secrets

## Quick Reference

### Required Environment Variables

**Frontend (.env):**
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Supabase Edge Functions (Secrets):**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Test Cards
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Auth required: 4000 0025 0000 3155

### Webhook Events
- checkout.session.completed
- checkout.session.expired
- payment_intent.payment_failed
- charge.refunded

### Important URLs
- Stripe Dashboard: https://dashboard.stripe.com
- API Keys: https://dashboard.stripe.com/apikeys
- Webhooks: https://dashboard.stripe.com/webhooks
- Test Cards: https://stripe.com/docs/testing
