# Camp Registration Flow with Stripe Integration

This document explains the complete camp registration system with Stripe payment integration and comprehensive child information forms.

## Overview

The registration system follows a two-phase approach:
1. **Phase 1**: Simple registration with payment through Stripe
2. **Phase 2**: Comprehensive child information form for safety and health details

## User Flow

### 1. Browse and Select Camp
- Parents browse available camps on the homepage or camps page
- Click on a camp to view full details
- Click "Register Now" button on camp detail page

### 2. Registration Form (`/camps/:id/register`)
**Features:**
- Automatic parent profile creation if needed
- Select from existing children or add new child
- Apply discount codes (optional)
- Real-time price calculation with discounts and early bird pricing
- Age eligibility verification
- Payment summary display

**Form Fields:**
- Child selection (radio buttons)
- Discount code input (optional)

### 3. Stripe Payment
**Process:**
- System creates registration record in database
- Calls Supabase Edge Function to create Stripe Checkout Session
- Redirects to Stripe hosted checkout page
- User completes payment securely on Stripe
- On success: redirects to `/payment-success?session_id=xxx`
- On cancel: returns to registration page

### 4. Payment Success Page (`/payment-success`)
**Features:**
- Verifies payment status with database
- Displays registration summary
- Prominent call-to-action to complete child information form
- Lists next steps for parents

### 5. Child Information Form (`/registration/:registrationId/child-details`)
**Multi-step Form (4 steps):**

**Step 1 - Medical Information:**
- Medical conditions
- Allergies
- Current medications

**Step 2 - Dietary & Special Needs:**
- Dietary restrictions
- Special needs or accommodations

**Step 3 - Emergency Contact:**
- Emergency contact name (required)
- Emergency contact phone (required)
- Relationship to child

**Step 4 - Permissions & Additional Notes:**
- Photo/video permission checkbox
- Additional notes textarea

**Features:**
- Progress indicator
- Save draft functionality
- Form validation
- Auto-saves to database
- Updates child and parent records

### 6. Parent Dashboard
**Features:**
- Prominent alert banner for incomplete registrations
- Shows all registrations with status
- Direct links to complete pending forms
- View upcoming and past camps

## Database Tables

### `registrations`
Core registration record with payment tracking.

**New Fields Added:**
- `stripe_checkout_session_id`: Links to Stripe session
- `form_completed`: Boolean flag for form status
- `form_completed_at`: Timestamp when form completed

### `payment_records`
Tracks all payment transactions.

**Fields:**
- `registration_id`: Foreign key to registrations
- `stripe_payment_intent_id`: Stripe payment intent
- `stripe_checkout_session_id`: Stripe checkout session
- `amount`: Payment amount
- `currency`: Currency code
- `status`: pending, succeeded, failed, refunded
- `payment_method`: Payment method type
- `paid_at`: Payment success timestamp

### `registration_forms`
Stores comprehensive form submissions.

**Fields:**
- `registration_id`: Foreign key to registrations (unique)
- `child_id`: Foreign key to children
- `completed`: Form completion status
- `submitted_at`: Form submission timestamp
- `form_data`: JSONB field with all form responses

## Services

### `registrationService.ts`
Handles all registration-related database operations:
- `createRegistration()`: Creates new registration
- `getRegistration()`: Fetches registration with relations
- `createOrUpdateRegistrationForm()`: Saves form data
- `updateRegistrationFormStatus()`: Marks form as complete
- `getIncompleteRegistrations()`: Gets forms needing completion
- `validateDiscountCode()`: Validates and returns discount info

### `stripeService.ts`
Manages Stripe integration:
- `createStripeCheckoutSession()`: Creates checkout session via Edge Function
- `verifyPaymentStatus()`: Checks payment record status
- `getPaymentRecord()`: Fetches payment details
- `redirectToStripeCheckout()`: Redirects to Stripe URL

## Edge Functions

### `create-checkout-session`
**Purpose:** Creates Stripe Checkout Session

**Endpoint:** `/functions/v1/create-checkout-session`

**Authentication:** Required (JWT verification enabled)

**Request Body:**
```json
{
  "campId": "uuid",
  "campName": "string",
  "childId": "uuid",
  "amount": 199.99,
  "currency": "USD",
  "registrationId": "uuid"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**Process:**
1. Validates request parameters
2. Creates Stripe Checkout Session
3. Saves payment record to database
4. Returns session ID and checkout URL

### `stripe-webhook`
**Purpose:** Handles Stripe webhook events

**Endpoint:** `/functions/v1/stripe-webhook`

**Authentication:** Webhook signature verification (JWT disabled for webhooks)

**Supported Events:**
- `checkout.session.completed`: Updates payment status, confirms registration
- `checkout.session.expired`: Marks payment as failed
- `payment_intent.payment_failed`: Records payment failure
- `charge.refunded`: Processes refunds, cancels registration

**Process:**
1. Verifies webhook signature
2. Processes event based on type
3. Updates database records
4. Returns 200 status

## Stripe Configuration

### Required Environment Variables

**Frontend (.env):**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Edge Functions (Supabase Secrets):**
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Setup Instructions

1. **Get Stripe Keys:**
   - Sign up at https://stripe.com
   - Get publishable key from Dashboard > Developers > API keys
   - Get secret key from same location

2. **Configure Frontend:**
   - Add `VITE_STRIPE_PUBLISHABLE_KEY` to `.env` file

3. **Configure Edge Functions:**
   - Supabase automatically configures `STRIPE_SECRET_KEY`
   - Set up webhook endpoint in Stripe Dashboard
   - Add webhook URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
   - Select events: checkout.session.completed, checkout.session.expired, payment_intent.payment_failed, charge.refunded
   - Copy webhook signing secret
   - Add `STRIPE_WEBHOOK_SECRET` to Supabase Edge Function secrets

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:

**payment_records:**
- Parents can view their own payments
- Admins can view all payments
- System can create/update payment records

**registration_forms:**
- Parents can create/view/update their own forms
- Admins can view all forms

### Data Protection
- Sensitive health information stored encrypted
- Payment details handled by Stripe (PCI compliant)
- Webhook signature verification prevents tampering
- JWT authentication on checkout creation

## Testing the Flow

### Test Mode Setup
1. Use Stripe test keys (starts with `pk_test_` and `sk_test_`)
2. Use test card: 4242 4242 4242 4242
3. Use any future expiry date and any CVC

### Testing Checklist
- [ ] Parent can register for camp
- [ ] Child selection works correctly
- [ ] Discount codes apply correctly
- [ ] Stripe checkout loads
- [ ] Payment succeeds with test card
- [ ] Redirects to success page
- [ ] Payment record created in database
- [ ] Registration status updated to confirmed
- [ ] Child information form loads
- [ ] Multi-step form navigation works
- [ ] Save draft functionality works
- [ ] Form submission completes registration
- [ ] Dashboard shows incomplete forms
- [ ] Banner appears for pending forms
- [ ] Completed forms don't show banner

## Future Enhancements

Potential improvements for the registration system:

1. **Email Notifications:**
   - Payment confirmation
   - Form completion reminder
   - Camp start date reminder

2. **Payment Plans:**
   - Installment payment options
   - Deposit with balance due

3. **Waitlist Management:**
   - Auto-registration when spot opens
   - Waitlist position tracking

4. **Bulk Registration:**
   - Register multiple children at once
   - Family discounts

5. **Mobile App:**
   - Native mobile experience
   - Push notifications

6. **Admin Features:**
   - Manual payment recording
   - Refund processing UI
   - Form completion tracking dashboard

## Troubleshooting

### Payment Not Confirming
1. Check Edge Function logs
2. Verify webhook is configured in Stripe
3. Check webhook signing secret
4. Verify payment_records table has entry

### Form Not Saving
1. Check browser console for errors
2. Verify RLS policies allow updates
3. Check user authentication status

### Discount Code Not Working
1. Verify code is active in database
2. Check date range validity
3. Confirm applicable camps setting

## Support

For technical issues:
1. Check browser console for frontend errors
2. Review Supabase Edge Function logs
3. Check Stripe webhook logs in Dashboard
4. Verify database policies with Supabase SQL editor
