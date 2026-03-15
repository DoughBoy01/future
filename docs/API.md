# API & Edge Functions

All server-side logic runs in Supabase Edge Functions (Deno runtime). Functions are deployed to:
```
https://<project-ref>.supabase.co/functions/v1/<function-name>
```

Edge Functions are called from the frontend using the Supabase client:
```typescript
const { data, error } = await supabase.functions.invoke('function-name', {
  body: { ... }
});
```

Or directly via fetch:
```typescript
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/function-name`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ... }),
  }
);
```

All functions implement CORS headers and handle `OPTIONS` preflight requests.

---

## Payment Functions

### `create-checkout-session`

Creates a Stripe Checkout Session for camp registration.

**Method:** POST
**Auth:** Required (anon key)

**Request Body:**
```json
{
  "campId": "uuid",
  "registrationIds": ["uuid", "uuid"],
  "successUrl": "https://...",
  "cancelUrl": "https://...",
  "discountCode": "OPTIONAL_CODE"
}
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/pay/...",
  "sessionId": "cs_..."
}
```

**Logic:**
1. Validates camp exists and is published
2. Checks organizer has a connected Stripe account
3. Calculates commission (application fee) using org-specific or system default rate
4. Creates Stripe Checkout Session with direct charge to organizer's Stripe account
5. Sets application fee for platform commission
6. Returns hosted checkout URL

**Error Responses:**
- `400` — Missing required fields, camp not found, camp not published
- `402` — Organizer Stripe account not active (charges not enabled)
- `500` — Stripe API error

---

### `stripe-webhook`

Receives and processes Stripe webhook events.

**Method:** POST
**Auth:** None (verified via Stripe signature header)
**Verify JWT:** false (public webhook endpoint)

**Handled Events:**

| Event | Action |
|---|---|
| `checkout.session.completed` | Updates booking status to `confirmed`, creates `payment_record`, creates `commission_record`, queues booking confirmation email |
| `charge.succeeded` | Updates payment record status |
| `charge.refunded` | Updates booking status to `cancelled`, updates payment record to `refunded` |
| `account.updated` | Updates organization's Stripe account status in database |

**Security:** Verifies `Stripe-Signature` header using `STRIPE_WEBHOOK_SECRET`. Rejects requests with invalid signatures.

---

### `create-connect-account`

Creates a new Stripe Connect Express account for an organizer.

**Method:** POST
**Auth:** Required

**Request Body:**
```json
{
  "organisationId": "uuid",
  "email": "organizer@example.com",
  "businessName": "Camp Organization Name"
}
```

**Response:**
```json
{
  "accountId": "acct_...",
  "onboardingUrl": "https://connect.stripe.com/setup/..."
}
```

**Logic:**
1. Creates Stripe Connect Express account
2. Saves `stripe_account_id` to `organisations` table
3. Creates account link for onboarding
4. Returns onboarding URL

---

### `create-connect-account-link`

Generates a new Stripe Connect onboarding link for an existing account.

**Method:** POST
**Auth:** Required

**Request Body:**
```json
{
  "organisationId": "uuid",
  "returnUrl": "https://...",
  "refreshUrl": "https://..."
}
```

**Response:**
```json
{
  "url": "https://connect.stripe.com/setup/..."
}
```

---

### `create-connect-login-link`

Generates a Stripe Express Dashboard login link for an organizer.

**Method:** POST
**Auth:** Required

**Request Body:**
```json
{
  "organisationId": "uuid"
}
```

**Response:**
```json
{
  "url": "https://connect.stripe.com/express/..."
}
```

---

### `stripe-connect-status`

Checks the current Stripe Connect account status for an organization.

**Method:** GET
**Auth:** Required

**Query Parameters:** `?organisationId=uuid`

**Response:**
```json
{
  "connected": true,
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "accountStatus": "active",
  "requirements": []
}
```

---

## Email Functions

### `send-email`

Sends a transactional email using Resend.

**Method:** POST
**Auth:** Required

**Request Body:**
```json
{
  "template": "booking-confirmation",
  "to": {
    "email": "parent@example.com",
    "name": "Jane Smith"
  },
  "data": {
    "firstName": "Jane",
    "campName": "Summer STEM Camp",
    "startDate": "2026-07-01"
  },
  "context": {
    "type": "booking",
    "id": "uuid",
    "profile_id": "uuid"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "resend-message-id"
}
```

**Available Templates:**

| Template | Trigger | Variables |
|---|---|---|
| `signup-welcome-parent` | Parent registration | `firstName`, `email`, `dashboardUrl` |
| `signup-welcome-organizer` | Organizer registration | `firstName`, `email`, `dashboardUrl` |
| `booking-confirmation` | Payment confirmed | `firstName`, `campName`, `startDate`, `childName`, `bookingReference` |

All emails are sent from the platform's configured sender domain via Resend.

---

### `process-email-queue`

Processes pending emails from the `email_queue` table. Designed to be called on a schedule.

**Method:** POST
**Auth:** Service role (internal use)

**Logic:**
1. Queries `email_queue` for `status = 'pending'` and `scheduled_at <= now()`
2. Processes up to N emails per invocation
3. Calls `send-email` for each
4. Updates status to `sent` or `failed`
5. Increments `attempts` counter on failure

---

## Organizer Functions

### `send-camp-organizer-invite`

Sends an email invitation to a new camp organizer.

**Method:** POST
**Auth:** Required (admin only)

**Request Body:**
```json
{
  "email": "neworganizer@example.com",
  "organisationId": "uuid",
  "invitedBy": "uuid"
}
```

**Logic:**
1. Creates an invite record in `camp_organizer_invites` with a unique token
2. Sets expiry (7 days)
3. Sends email with invite link: `/auth?invite=<token>`
4. When the invitee registers, they are assigned `camp_organizer` role and linked to the organization

---

## Payout Functions

### `process-payouts`

Calculates and processes pending payouts to organizers.

**Method:** POST
**Auth:** Service role (admin-triggered)

**Request Body:**
```json
{
  "organisationId": "uuid",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-01-31"
}
```

**Logic:**
1. Queries `commission_records` for pending payments in period
2. Calculates net amount (payment - commission)
3. Creates Stripe transfer to organizer's Connect account
4. Creates payout record in database
5. Marks commission records as paid

---

## Parent Utility Functions

### `get-or-create-parent`

Finds or creates a parent record for guest checkout flows.

**Method:** POST
**Auth:** Service role

**Request Body:**
```json
{
  "email": "parent@example.com",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "parentId": "uuid",
  "profileId": "uuid",
  "created": true
}
```

---

## Environment Variables

All Edge Functions use these secrets (configured automatically in Supabase):

| Variable | Used By |
|---|---|
| `STRIPE_SECRET_KEY` | All Stripe functions |
| `STRIPE_WEBHOOK_SECRET` | `stripe-webhook` |
| `RESEND_API_KEY` | `send-email`, `process-email-queue` |
| `SUPABASE_URL` | All functions (auto-populated) |
| `SUPABASE_SERVICE_ROLE_KEY` | All functions (auto-populated) |
| `SUPABASE_ANON_KEY` | All functions (auto-populated) |

---

## Error Response Format

All functions return errors in a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

HTTP status codes:
- `400` — Bad request (validation error)
- `401` — Unauthorized
- `402` — Payment required (Stripe account issue)
- `403` — Forbidden (insufficient permissions)
- `404` — Not found
- `500` — Internal server error
