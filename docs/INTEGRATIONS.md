# Integrations

## Stripe

Stripe handles all payment processing. The platform uses two Stripe products:

### Stripe Checkout

Standard Stripe Checkout is used for parent payments. The flow:

1. Frontend calls the `create-checkout-session` Edge Function
2. Edge Function creates a Stripe Checkout Session
3. Frontend redirects to Stripe's hosted checkout page
4. After payment, Stripe redirects to `/payment-success`
5. The `stripe-webhook` Edge Function processes `checkout.session.completed`

**Client-side usage** (`src/services/stripeService.ts`):
```typescript
const { checkoutUrl } = await stripeService.createCheckoutSession({
  campId,
  registrationIds,
  successUrl: window.location.origin + '/payment-success',
  cancelUrl: window.location.origin + '/camps/' + campId,
});
window.location.href = checkoutUrl;
```

### Stripe Connect

Stripe Connect allows organizers to receive payments directly. The platform acts as the platform account and takes an application fee (commission) on each transaction.

**Account type:** Express (organizer-managed, simplified onboarding)

**Payment flow:** Direct charge to organizer's Stripe account, with platform application fee deducted

**Commission:** Configured per-organization or falls back to system default (see Commission Rates in the admin dashboard)

**Organizer onboarding:**
1. Admin or organizer triggers account creation via `create-connect-account` Edge Function
2. Organizer completes KYC on Stripe's hosted onboarding page
3. Platform receives `account.updated` webhook and updates `organisations.stripe_account_status`
4. Once `charges_enabled = true`, organizer can receive payments

**Deferred onboarding:** The platform supports deferred Stripe onboarding. Payments can be captured before an organizer completes Stripe setup, but transfers are held until the account is active.

### Stripe Webhook Events

Processed by `supabase/functions/stripe-webhook/index.ts`:

| Event | Handler |
|---|---|
| `checkout.session.completed` | Confirm booking, create payment record and commission record, queue confirmation email |
| `charge.succeeded` | Update payment record status |
| `charge.refunded` | Mark booking as cancelled, update payment record |
| `account.updated` | Update organization's Stripe account status |

**Webhook security:** All webhook requests are verified using the `Stripe-Signature` header against `STRIPE_WEBHOOK_SECRET`. Invalid signatures are rejected with HTTP 400.

### Frontend Components

- `src/components/stripe/StripeConnectOnboarding.tsx` — Onboarding UI for organizers
- `src/components/organizer/StripeConnectionBanner.tsx` — Banner shown when Stripe is not connected
- `src/pages/organizer/StripePaymentSettings.tsx` — Payment settings page
- `src/pages/onboarding/StripeConnect.tsx` — Onboarding step for Stripe Connect

### Environment Variables

| Variable | Location | Description |
|---|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `.env` | Public key, used in frontend |
| `STRIPE_SECRET_KEY` | Supabase secrets | Secret key, used in Edge Functions |
| `STRIPE_WEBHOOK_SECRET` | Supabase secrets | Webhook signing secret |

---

## Supabase

Supabase is the core backend providing database, authentication, edge functions, and storage.

### Client Setup

The Supabase client is a singleton initialized in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

The `Database` type (from `src/lib/database.types.ts`) provides full TypeScript autocompletion for all tables, views, and RPC functions.

### Authentication

Supabase Auth handles sessions:

```typescript
// Sign up
await supabase.auth.signUp({ email, password });

// Sign in
await supabase.auth.signInWithPassword({ email, password });

// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => { ... });
```

Sessions are stored in `localStorage` and auto-refreshed. The `AuthContext` wraps these calls and provides the auth state to all components.

### Database Queries

Standard Supabase query patterns used throughout the codebase:

```typescript
// Fetch with maybeSingle (preferred for 0-1 results)
const { data, error } = await supabase
  .from('camps')
  .select('*')
  .eq('id', campId)
  .maybeSingle();

// Insert
const { data, error } = await supabase
  .from('bookings')
  .insert({ camp_id, parent_id, amount_due })
  .select()
  .single();

// Update
const { error } = await supabase
  .from('camps')
  .update({ status: 'published' })
  .eq('id', campId);

// RPC call
const { data } = await supabase.rpc('has_permission', {
  user_id: userId,
  permission_name: 'camps.approve'
});
```

### Storage

Supabase Storage is used for camp images and organization logos. Buckets:
- `camp-images` — Camp featured images and gallery photos
- `organisation-logos` — Organization profile logos

### Edge Functions

See [API & Edge Functions](./API.md) for full documentation.

---

## Resend

Resend handles all transactional email delivery. Emails are sent exclusively through the `send-email` Edge Function — never directly from the frontend.

### Email Templates

Templates are defined in `supabase/functions/send-email/templates/`. Each template is a TypeScript module that exports an HTML string and subject line.

Template files:
- `base.ts` — Base layout with header, footer, brand styles
- `booking-confirmation.ts` — Sent after payment is confirmed
- `signup-welcome-parent.ts` — Sent when a parent registers
- `signup-welcome-organizer.ts` — Sent when an organizer registers

The `template-registry.ts` file maps template names to their modules.

### Async Email Queue

For emails that should be sent asynchronously (not blocking the main request):

1. Insert a record to `email_queue` table
2. The `process-email-queue` Edge Function processes the queue (called on a schedule or on-demand)

This prevents email failures from blocking payment or registration flows.

### Configuration

| Variable | Location | Description |
|---|---|---|
| `RESEND_API_KEY` | Supabase secrets | API key from Resend dashboard |
| `FROM_EMAIL` | Supabase secrets | Sender display name and address |
| `APP_URL` | Supabase secrets | App base URL for email links |

---

## Vapi

Vapi powers the AI-driven conversational camp advisor at `/talk-to-advisor`.

### How It Works

1. User visits `/talk-to-advisor` and grants microphone permission
2. User clicks "Start Conversation"
3. The Vapi SDK connects to the AI assistant
4. The user speaks; Vapi transcribes, processes, and responds via voice
5. A real-time transcript is displayed on-screen
6. User can end the conversation at any time

### Client Integration

The `useVapi()` hook (`src/hooks/useVapi.ts`) manages all Vapi state:

```typescript
const {
  callStatus,     // 'idle' | 'connecting' | 'active' | 'ending'
  orbState,       // 'idle' | 'listening' | 'speaking' | 'thinking'
  transcript,     // Array of { role, text } messages
  error,
  isMicrophonePermissionGranted,
  startCall,
  stopCall,
} = useVapi();
```

### Visual Components

- `VapiOrb` (`src/components/vapi/VapiOrb.tsx`) — Animated orb that changes based on call state
- `ConversationControls` (`src/components/vapi/ConversationControls.tsx`) — Start/stop buttons and status display

### Configuration

| Variable | Location | Description |
|---|---|---|
| `VITE_VAPI_PUBLIC_KEY` | `.env` | Vapi public API key |
| Assistant ID | `src/hooks/useVapi.ts` | ID of the configured Vapi assistant |

---

## Framer Motion

Framer Motion provides animations throughout the UI. It is used for:

- Page section entrance animations (fade-in, slide-up)
- Camp card hover effects
- Modal open/close transitions
- Carousel animations on the homepage
- Quiz question transitions
- Loading state animations

The library is used directly in components without a wrapper — standard `motion.div`, `AnimatePresence`, and `useAnimation` hooks are used throughout.

---

## i18next

Internationalization uses `react-i18next` with browser language auto-detection.

### Configuration

Set up in `src/i18n/config.ts`. Translation files are loaded via HTTP backend from `public/locales/`.

### Supported Languages

| Code | Language |
|---|---|
| `en` | English (default) |
| `es` | Spanish |
| `ja` | Japanese |
| `zh` | Chinese |

### Translation Files

```
public/locales/
├── en/
│   ├── common.json    # Shared UI strings
│   └── camps.json     # Camp-specific strings
├── es/
│   ├── common.json
│   └── camps.json
├── ja/
│   └── ...
└── zh/
    └── ...
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation('common');
  return <h1>{t('welcome')}</h1>;
}
```

---

## Remotion

Remotion is used to generate a promotional marketing video for the camp owner acquisition funnel.

The video composition (`src/remotion/compositions/CampOwnerPromo.tsx`) contains five scenes:

| Scene | Content |
|---|---|
| `Scene1Hero` | Platform introduction and hook |
| `Scene2Money` | Revenue potential for camp owners |
| `Scene3Paperwork` | How the platform handles admin burden |
| `Scene4Benefits` | Key platform benefits |
| `Scene5CTA` | Call to action to sign up |

This is a standalone build pipeline separate from the main web app. The rendered video can be embedded in the `/partners` landing page.

```bash
npm run video:render    # Renders to out/camp-owner-promo.mp4
npm run video:studio    # Opens interactive editor
```
