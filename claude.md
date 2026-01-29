# Airbnb Design System Replication Guide

You are an expert design system architect and UI/UX designer specializing in creating world-class digital products. Your task is to help implement designs that replicate or are inspired by Airbnb's design language and principles.

## Your Design Philosophy

When designing or helping design user interfaces, always keep these four core principles at the forefront:

1. **Unified** - Every component is part of a greater whole. No isolated features or outliers. All components must be reusable and interconnected within the broader design system.

2. **Universal** - Design must be welcoming and accessible to global communities across 27+ languages, cultures, and contexts. Accessibility is not optional—it's foundational.

3. **Iconic** - Focus on design that speaks boldly and clearly. Let photography and imagery lead the way. Interfaces should be beautiful AND functional.

4. **Conversational** - Motion and interaction should feel warm, human, and responsive. Every animation should communicate, never distract.

## Color System

### Primary Brand Colors
- **Primary Pink:** `#FF385C` (vibrant, energetic, action-oriented)
- **Dark Text:** `#222222` (maximum readability)
- **Secondary Text:** `#717171` (visual hierarchy)
- **Background:** `#FFFFFF` (clean, minimal)
- **Secondary Background:** `#F7F7F7` (subtle contrast)

### Color Token System (Implement as CSS Variables)
Use a numbered system (100-900) for each color family to ensure consistency:

**Pink Palette:**
- `--pink-100`: #FFE8EA (lightest, backgrounds)
- `--pink-300`: #FFC4CC (subtle alerts)
- `--pink-500`: #FF385C (primary actions, links, CTAs)
- `--pink-800`: #fe4d39 (hover states, active)
- `--pink-900`: #C71742 (emphasis, strong states)

**Neutral Palette:**
- `--grey-100`: #F7F7F7 (page backgrounds)
- `--grey-300`: #DDDDDD (borders, dividers)
- `--grey-500`: #717171 (secondary text)
- `--grey-700`: #484848 (icons, UI elements)
- `--grey-900`: #222222 (primary text)

**Semantic Colors:**
- Success: `#008A05` (confirmations, positive states)
- Warning: `#FFB400` (alerts, cautions)
- Error: `#C13515` (critical messages)
- Info: `#0073E6` (informational)

### Color Usage Rules
- Maintain 4.5:1 contrast ratio minimum (WCAG AA)
- Primary pink reserved for CTAs and brand moments
- Default to white backgrounds with dark text
- Use color families consistently (all buttons use same weight level)

## Typography

### Primary Typeface: Circular
- **Family:** Circular (custom sans-serif)
- **Characteristics:** Friendly, warm, geometric, highly readable
- **Fallback Stack:** `'Circular', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif`
- **Weights:** Light (300), Book (400), Medium (500), Bold (700)

### Type Scale (Desktop)
- **Display:** 48px / 56px line-height (Circular Bold)
- **H1:** 32px / 40px (Circular Bold)
- **H2:** 26px / 32px (Circular Medium)
- **H3:** 22px / 28px (Circular Medium)
- **Body Large:** 16px / 24px (Circular Book)
- **Body:** 14px / 20px (Circular Book)
- **Small:** 12px / 16px (Circular Book)
- **Caption:** 10px / 12px (Circular Book)

### Type Scale (Mobile)
- **Display:** 32px / 40px
- **H1:** 26px / 32px
- **H2:** 22px / 28px
- **Body:** 16px / 24px (minimum for readability)

### Typography Rules
1. Emphasize written words over icons for clarity across languages
2. Use bold weights sparingly for emphasis
3. Maintain generous line-height (1.4-1.6) for readability
4. Avoid all-caps for body text
5. Minimum 16px for body text on mobile

## Spacing & Layout System

### 8px Base Grid
All spacing must be multiples of 8px:

```
--space-1: 4px (micro)
--space-2: 8px (tight)
--space-3: 12px (small)
--space-4: 16px (default)
--space-5: 24px (medium)
--space-6: 32px (large)
--space-7: 40px (XL)
--space-8: 48px (XXL)
--space-9: 64px (XXXL)
--space-10: 80px (section)
```

### Responsive Breakpoints
- **Mobile:** 0-743px
- **Tablet:** 744px-1127px
- **Desktop:** 1128px-1440px
- **Large Desktop:** 1440px+

### Layout Principles
- **Generous White Space:** Let designs breathe—negative space is a feature
- **Max Content Width:** 1120px (centered)
- **12-Column Grid:** With 24px gutters
- **Visual Clarity:** Two-layer structure (elevated card + background)
- **Symmetry:** Use for balance and visual appeal

## Component Specifications

### Buttons

**Primary Button:**
```css
background: #FF385C
color: #FFFFFF
padding: 14px 24px
border-radius: 8px
font: 16px Circular Medium
border: none
cursor: pointer
transition: all 0.2s ease

&:hover {
  background: #fe4d39
  transform: scale(1.02)
  box-shadow: 0 4px 12px rgba(255, 56, 92, 0.3)
}

&:active {
  transform: scale(0.98)
}

&:focus {
  outline: 2px solid #222222
  outline-offset: 2px
}
```

**Secondary Button:**
```css
background: #FFFFFF
color: #222222
border: 1px solid #222222
padding: 14px 24px
border-radius: 8px
font: 16px Circular Book
cursor: pointer
transition: all 0.2s ease

&:hover {
  background: #F7F7F7
  border-color: #222222
}
```

**Text Button:**
```css
background: transparent
color: #222222
text-decoration: underline
font: 16px Circular Book
cursor: pointer
padding: 0
border: none

&:hover {
  color: #717171
}

&:focus {
  outline: 2px solid #222222
  outline-offset: 2px
}
```

### Input Fields
```css
border: 1px solid #DDDDDD
border-radius: 8px
padding: 14px 16px
font: 16px Circular Book
background: #FFFFFF
color: #222222
transition: all 0.2s ease

&:focus {
  border-color: #222222
  box-shadow: 0 0 0 2px rgba(34, 34, 34, 0.1)
  outline: none
}

&:invalid {
  border-color: #C13515
}

&::placeholder {
  color: #717171
}
```

### Cards
```css
background: #FFFFFF
border-radius: 12px
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)
padding: 24px
transition: all 0.3s ease

&:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12)
  transform: translateY(-2px)
}
```

### Navigation
- **Height:** 80px (desktop), 56px (mobile)
- **Background:** #FFFFFF with subtle bottom border
- **Logo:** Top-left position
- **Primary CTA:** Top-right (pink button)
- **Search:** Centered, pill-shaped, shadow on focus
- **Mobile:** Bottom navigation tabs, 56px height

## Iconography

### Icon Style
- **Grid:** 24x24px default size
- **Stroke:** 2px consistent stroke weight
- **Style:** Rounded corners, geometric, friendly
- **Color:** Inherits text color (#222222 default, #717171 secondary)

### Icon Rules
1. Always pair with text labels for clarity
2. Minimum 44x44px touch target on mobile
3. Use icons sparingly—text is primary communication
4. Maintain neutral, not overly decorative appearance

## Imagery & Photography

### Image Specifications
- **Listing Cards:** 3:2 aspect ratio
- **Hero Images:** 16:9 aspect ratio
- **Profile Photos:** 1:1 (circular crop)
- **Quality:** High-resolution, professional
- **Style:** Authentic, inviting, human-centered

### Photography Principles
1. **Photography Leads:** Images dominate, text is secondary
2. **Emotional Connection:** Choose images that evoke belonging and adventure
3. **Priming Effect:** Imagery triggers desired emotional responses
4. **Shared Element Transitions:** Smooth animations between list and detail views
5. **Optimization:** Lazy loading and progressive image serving

## Motion & Animation

### Animation Timing Functions
```css
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1)
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1)
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1)
```

### Animation Durations
- **Instant:** 100ms (micro-interactions, form validation)
- **Fast:** 200ms (hover states, tooltips)
- **Standard:** 300ms (modals, dropdowns, page sections)
- **Slow:** 500ms (page transitions, hero animations)

### Motion Principles
1. **Parent-to-Child Transitions:** Visual signal moving from high-level to detail
2. **Shared Element Transitions:** Maintain object constancy (image expands from thumbnail)
3. **Conversational Feedback:** Immediate response to user actions
4. **Subtle & Purposeful:** Motion enhances understanding, never distracts
5. **Performance:** All animations must maintain 60fps

### Common Animation Patterns
- **Hover:** `scale(1.02)` + shadow increase (200ms)
- **Button Press:** `scale(0.98)` (100ms)
- **Modal Enter:** Fade in + scale from 0.95 to 1.0 (300ms)
- **Page Transition:** Cross-fade (500ms)

## Interaction Patterns

### Navigation
- **Mobile:** Bottom navigation (4-5 tabs with icons + labels)
- **Desktop:** Top navigation (logo left, search center, menu right)
- **Hierarchy:** Breadcrumbs for complex structures
- **Consistency:** Back button always visible on mobile detail views

### Search & Discovery
- **Search Bar:** Prominent, pill-shaped, autocomplete support
- **Filters:** Collapsible panels or chip-based selection
- **Results Grid:** 3-4 columns (desktop), 1-2 columns (mobile)
- **Progressive Loading:** Infinite scroll or pagination

### Forms
- **Minimize Inputs:** Follow Miller's Law—reduce cognitive load
- **Inline Validation:** Real-time, non-blocking feedback
- **Clear Labels:** Above inputs, never placeholder text only
- **Progress:** Show steps in multi-step forms

### Feedback States
- **Loading:** Skeleton screens or subtle spinners (never intrusive)
- **Empty:** Friendly illustrations + helpful next steps
- **Errors:** Clear, actionable, non-technical language
- **Success:** Checkmarks + positive confirmation

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- **Text Contrast:** 4.5:1 minimum for normal text, 3:1 for large text
- **UI Elements:** 3:1 minimum contrast against background
- **Touch Targets:** 44x44px minimum on mobile
- **Focus Indicators:** 2px solid outline, high contrast
- **Keyboard Navigation:** Tab order follows visual hierarchy

### Semantic HTML & Accessibility
- **Proper Heading Hierarchy:** h1 > h2 > h3 (no skipping)
- **ARIA Labels:** For icon buttons and dynamic content
- **Alt Text:** Descriptive for all images
- **Screen Readers:** Support semantic landmarks and live regions
- **Skip Links:** "Skip to main content" available

### Inclusive Design Checklist
- ✅ Avoid color-only communication (use icons/text too)
- ✅ Readable fonts (minimum 16px body text)
- ✅ Captions for video/audio content
- ✅ Focus management on modals
- ✅ Language attributes set correctly

## Mobile-First Design Approach

1. **Design for Mobile First:** Start with smallest screen, enhance progressively
2. **Touch-Friendly:** Larger buttons (48px+), avoid hover states
3. **Swipe Gestures:** Natural scrolling, swipe to navigate
4. **Simplified Navigation:** Bottom tabs, hamburger menus
5. **Full-Width Content:** Images and cards span edge to edge
6. **Readable Typography:** 16px minimum for body text

### Responsive Strategy
- Design separate layouts for each breakpoint
- Images scale appropriately via srcset/sizes
- Navigation transforms to hamburger on mobile
- Forms stack vertically on mobile, multi-column on desktop
- Test on real devices, not just browser resize

## Internationalization & Localization

### Language Support
- **27+ Languages:** Design for text expansion/contraction
- **RTL Support:** Mirror layouts for Arabic, Hebrew
- **Font Fallbacks:** System fonts for unsupported character sets
- **Regional Conventions:** Date, time, currency formats respect locale

### Cultural Adaptation
- **Imagery:** Region-appropriate visuals and representation
- **Color Meanings:** Respect cultural color associations
- **Payment Methods:** Support regional gateways
- **Currency:** Display in local currency with conversion tooltip

## Writing & Voice

### Tone Characteristics
- **Warm & Welcoming:** "We're so glad you're here"
- **Clear & Simple:** Avoid jargon and technical language
- **Helpful & Supportive:** Guide users, don't lecture
- **Human & Conversational:** Write as if talking to a friend
- **Inclusive:** Use gender-neutral, accessible language

### Writing Best Practices
1. **Active Voice:** "Find your next adventure" not "Adventures can be found"
2. **Short Sentences:** Maximum 15-20 words
3. **Front-Load Information:** Most important first
4. **Scannable:** Bullets, short paragraphs, clear headings
5. **Action-Oriented CTAs:** "Explore homes" not "Click here"
6. **Empathy:** Acknowledge user needs and feelings

## Design Tokens (CSS Variables)

Implement as root-level CSS variables for consistency:

```css
:root {
  /* Colors */
  --color-primary: #FF385C;
  --color-primary-dark: #fe4d39;
  --color-text-primary: #222222;
  --color-text-secondary: #717171;
  --color-border: #DDDDDD;
  --color-background: #FFFFFF;
  --color-background-secondary: #F7F7F7;

  /* Typography */
  --font-family: 'Circular', -apple-system, sans-serif;
  --font-size-display: 48px;
  --font-size-h1: 32px;
  --font-size-h2: 26px;
  --font-size-body: 16px;
  --font-weight-book: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.12);

  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-standard: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

## Visual Hierarchy & Layout Patterns

### Z-Pattern Navigation
- **Top-Left:** Logo/brand identity
- **Top-Right:** Primary CTA
- **Center:** Main content/search
- **Bottom-Right:** Secondary CTA
- Use double Z-pattern for complex layouts

### Card-Based Design
- Elevated cards with subtle shadows
- Hover effects that lift cards (scale + shadow)
- Consistent internal padding (24px)
- Content hierarchy: Image → Title → Info → CTA

### Visual Weight Distribution
- **Primary Focus:** 60% visual attention (hero, main CTA)
- **Secondary:** 30% attention (supporting information)
- **Tertiary:** 10% attention (footer, fine print)

## Implementation Checklist

When designing or reviewing designs, verify:

✅ **Color:** Primary pink (#FF385C) used for CTAs, high contrast maintained
✅ **Typography:** Circular font with clear hierarchy, minimum 16px body
✅ **Spacing:** 8px grid system, generous white space
✅ **Components:** 8-12px border radius, subtle shadows, hover states
✅ **Imagery:** Photography-led, authentic, appropriate aspect ratios
✅ **Motion:** 300ms standard transitions, smooth animations
✅ **Accessibility:** WCAG AA, keyboard navigation, semantic HTML
✅ **Mobile:** 44px touch targets, bottom navigation, touch-friendly
✅ **Copy:** Warm, conversational, action-oriented language
✅ **Consistency:** Unified system, no one-off designs

## Core Design Values

Remember these principles in every decision:

1. **Clarity Over Cleverness** - Simple, obvious interactions always win
2. **Content Over Chrome** - Let photos and text lead; UI should be invisible
3. **Accessibility First** - Design for everyone from day one
4. **Performance Matters** - Fast experiences are better experiences
5. **Consistency Scales** - Build once, reuse everywhere
6. **Users First** - Every pixel serves the user's needs
7. **Global Thinking** - Design for 27+ languages and cultures
8. **Warm & Human** - Technology should feel approachable, not cold

## When to Deviate

While this system provides comprehensive guidance, occasionally deviations are necessary. Only deviate when:

1. **User Research Supports It** - Data shows deviation serves users better
2. **Brand Differentiation Required** - Unique value proposition demands it
3. **Cultural Appropriateness Needed** - Regional preferences require adaptation
4. **Accessibility Improves** - Changes enhance accessibility further

Always document deviations and ensure they maintain system cohesion.

---

**This is your design North Star.** When making decisions, reference this guide and ask: "Does this maintain the principles of being Unified, Universal, Iconic, and Conversational?" If yes, you're on track. If no, reconsider.

---
---

# Platform Payment Architecture

This section documents the complete payment system architecture, including Stripe Connect integration, payment flows, commission system, security model, and database schema.

## Table of Contents
1. [Overview](#overview)
2. [Stripe Connect Integration](#stripe-connect-integration)
3. [Payment Flows](#payment-flows)
4. [Commission System](#commission-system)
5. [Database Schema](#database-schema)
6. [Security & Validation](#security--validation)
7. [Business Rules](#business-rules)
8. [Reference](#reference)

---

## Overview

### Architecture Summary
The platform uses **Stripe Connect with Direct Charges** to process payments between parents and camp organizers. Key features:

- **Stripe Connect Express Accounts** - Camp organizers connect their own Stripe accounts
- **Direct Charges** - Payments go directly to organizers with automatic platform fee collection
- **Deferred Onboarding** - "Quick Start" mode allows publishing camps before full verification
- **Multi-Child Support** - Parents can register multiple children in a single transaction
- **Guest Checkout** - Anonymous users can book without creating an account
- **Commission Flexibility** - Configurable rates at system, organization, and camp levels

### Key Technologies
- **Stripe Connect** (Express accounts, Direct Charges, Application Fees)
- **Supabase Edge Functions** (6 payment-related functions)
- **PostgreSQL + RLS** (Row-level security for payment data)
- **Webhook Processing** (Real-time payment event handling)

### Payment Modes
1. **Direct Charge Mode** (Production) - Organizer has Stripe Connect configured
2. **Test Mode** (Development) - No Stripe Connect, platform account only

---

## Stripe Connect Integration

### Environment Variables

**Frontend (.env):**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...    # Stripe publishable key
VITE_SUPABASE_URL=https://...              # Supabase project URL
VITE_SUPABASE_ANON_KEY=...                 # Supabase anon key
```

**Edge Functions (Supabase Secrets):**
```bash
STRIPE_SECRET_KEY=sk_test_...              # Stripe secret key (REQUIRED)
STRIPE_WEBHOOK_SECRET=whsec_...            # Webhook signing secret (REQUIRED)
FRONTEND_URL=https://...                   # Frontend URL for redirects
```

Set secrets with: `supabase secrets set STRIPE_SECRET_KEY=sk_test_...`

### Edge Functions Overview

| Function | File | Purpose |
|----------|------|---------|
| **create-connect-account** | `supabase/functions/create-connect-account/index.ts` | Creates Stripe Express accounts for organizations; supports full vs deferred onboarding |
| **stripe-connect-status** | `supabase/functions/stripe-connect-status/index.ts` | Fetches real-time account status from Stripe; updates pending balance |
| **create-connect-account-link** | `supabase/functions/create-connect-account-link/index.ts` | Generates onboarding continuation links for incomplete setups |
| **create-connect-login-link** | `supabase/functions/create-connect-login-link/index.ts` | Creates login links to Stripe Express Dashboard |
| **create-checkout-session** | `supabase/functions/create-checkout-session/index.ts` | Creates Stripe Checkout sessions with automatic commission calculation |
| **stripe-webhook** | `supabase/functions/stripe-webhook/index.ts` | Processes Stripe webhook events (payment success, refunds, account updates) |

### Onboarding Modes Comparison

| Feature | Full Onboarding | Deferred (Quick Start) |
|---------|----------------|------------------------|
| **Time to publish camps** | ~20 minutes | ~5 minutes |
| **Information required** | Business info, bank account, identity | Minimal info only |
| **Funds handling** | Immediate payouts | Held in pending balance |
| **Verification deadline** | Complete upfront | No deadline (complete anytime) |
| **Stripe collection mode** | `eventually_due` | `currently_due` |
| **Database flag** | `payout_enabled = TRUE` | `temp_charges_enabled = TRUE` |
| **Restrictions** | None after approval | Funds held until verified |

**Deferred Mode Flow:**
1. Create Stripe Express account with minimal info
2. Request `card_payments` and `transfers` capabilities
3. Set `temp_charges_enabled = TRUE` in database
4. Organizer can publish camps immediately
5. Stripe automatically holds funds in pending balance
6. Organizer completes verification at their convenience
7. Stripe releases pending balance when `payout_enabled = TRUE`

### Account Status Tracking

**Database Fields (organisations table):**
```sql
-- Core Stripe fields
stripe_account_id TEXT                     -- Stripe Connect account ID
stripe_account_status TEXT                 -- 'pending' | 'active' | 'disabled'
payout_enabled BOOLEAN                     -- Full verification complete

-- Onboarding tracking
onboarding_mode TEXT                       -- 'full' | 'deferred' | 'progressive'
onboarding_step TEXT                       -- Progress tracking
onboarding_started_at TIMESTAMPTZ
onboarding_completed_at TIMESTAMPTZ

-- Deferred mode fields
temp_charges_enabled BOOLEAN               -- Can accept charges before full verification
charges_enabled BOOLEAN                    -- Stripe charges capability
pending_balance_amount DECIMAL(10,2)       -- Funds held awaiting verification
restrictions_active BOOLEAN                -- Stripe-imposed restrictions
restriction_reason TEXT                    -- Why restricted
```

### Webhook Events Processed
- `checkout.session.completed` - Payment success
- `checkout.session.expired` - Session timeout
- `payment_intent.payment_failed` - Payment failure
- `charge.refunded` - Refund processing
- `account.updated` - Stripe account status changes
- `transfer.created/paid` - Transfer tracking
- `payout.paid/failed` - Payout events

---

## Payment Flows

### 1. Organizer Flow: Stripe Connect Onboarding

```
┌─────────────────────────────────────────────────────────────┐
│ CAMP ORGANIZER STRIPE ONBOARDING                            │
└─────────────────────────────────────────────────────────────┘

1. Navigate to Payment Settings
   └─ Component: src/pages/organizer/StripePaymentSettings.tsx

2. Select Onboarding Mode
   ├─ Quick Start (Deferred) - 5 minutes, publish immediately
   └─ Full Setup - 20 minutes, immediate payouts

3. Click "Connect with Stripe"
   └─ POST /functions/v1/create-connect-account
      Body: { organisationId, mode: 'deferred' | 'full' }

      Process:
      a. Create Stripe Express account
      b. Request capabilities: card_payments, transfers
      c. Update database:
         - stripe_account_id
         - onboarding_mode
         - temp_charges_enabled (if deferred)
      d. Create account link
      e. Return redirect URL

4. Redirect to Stripe
   └─ Complete onboarding form (business info, bank, identity)

5. Return to Dashboard
   └─ Webhook updates status via account.updated event

6. Create & Publish Camps
   └─ Validation: validate_stripe_before_publish() trigger
```

**Publishing Validation:**
```sql
-- Trigger: validate_stripe_before_publish()
IF NEW.status = 'published' THEN
  -- Must have Stripe account
  IF stripe_account_id IS NULL THEN
    RAISE EXCEPTION 'Cannot publish: Stripe account not connected';
  END IF;

  -- Must not be restricted
  IF restrictions_active = TRUE THEN
    RAISE EXCEPTION 'Cannot publish: Stripe account restricted';
  END IF;

  -- Must have EITHER full onboarding OR deferred mode
  IF payout_enabled IS NOT TRUE THEN
    IF temp_charges_enabled IS NOT TRUE THEN
      RAISE EXCEPTION 'Cannot publish: Complete Stripe onboarding required';
    END IF;
  END IF;
END IF;
```

### 2. Parent Flow: Camp Registration & Payment

```
┌─────────────────────────────────────────────────────────────┐
│ PARENT BOOKING & PAYMENT FLOW                               │
└─────────────────────────────────────────────────────────────┘

1. Browse Camps (HomePage)
   ├─ View camp cards with pricing
   ├─ Early bird pricing displayed
   └─ Availability status shown

2. Click "Book Now" → CampRegistrationPage
   └─ Component: src/pages/CampRegistrationPage.tsx

3. User Type Detection
   ├─ Authenticated User
   │  └─ Fetch/create parent profile via get-or-create-parent
   └─ Guest Checkout
      └─ Enter name, email, phone

4. Fill Registration Form
   ├─ Number of children (spots)
   ├─ Child details (firstName, lastName, age)
   ├─ Age validation against camp requirements
   ├─ Optional discount code
   └─ Review pricing breakdown

5. Price Calculation
   unitPrice = early_bird_active ? early_bird_price : price
   subtotal = unitPrice × numberOfPlaces
   discount = applyDiscountCode(subtotal, discountCode)
   finalAmount = subtotal - discount

6. Submit Registration
   └─ Call: createMultiChildRegistration()
      Creates: parent, children[], bookings[]
      Returns: { childIds: [], bookingIds: [] }

7. Create Checkout Session
   └─ POST /functions/v1/create-checkout-session

      Process:
      a. Fetch commission rate
         └─ get_effective_commission_rate(camp_id)
            1. Check camps.commission_rate (camp override)
            2. Else: organisations.default_commission_rate
            3. Else: 0.15 (15% default)

      b. Calculate application fee
         applicationFeeAmount = Math.round(totalAmount × commissionRate)

      c. Create Stripe Checkout Session
         IF (has Stripe Connect):
           -- Direct Charge Mode
           stripe.checkout.sessions.create({
             payment_intent_data: {
               application_fee_amount: applicationFeeAmount,
               on_behalf_of: stripe_account_id
             }
           }, { stripeAccount: stripe_account_id })
         ELSE:
           -- Test Mode (no Connect)
           stripe.checkout.sessions.create({
             metadata: { testMode: 'true' }
           })

      d. Create payment_records entry
         status: 'pending'
         charge_type: 'direct' | 'platform_only'

8. Redirect to Stripe Checkout
   └─ Parent enters payment info

9. Payment Processing
   ├─ Success → PaymentSuccessPage
   │  ├─ Show confirmation
   │  ├─ Prompt to complete child details form
   │  └─ Send confirmation email
   └─ Cancel → Back to registration page
```

### 3. Webhook Flow: Payment Event Processing

```
┌─────────────────────────────────────────────────────────────┐
│ WEBHOOK PROCESSING FLOW                                      │
└─────────────────────────────────────────────────────────────┘

Event: checkout.session.completed

1. Verify Webhook Signature
   └─ stripe.webhooks.constructEvent(body, signature, secret)

2. Extract Metadata
   └─ { registrationId, campId, organisationId, chargeType }

3. Retrieve Payment Details
   ├─ PaymentIntent (includes payment_method, amount)
   └─ ApplicationFee (for direct charges only)

4. Update payment_records
   SET
     stripe_payment_intent_id = paymentIntentId,
     application_fee_id = applicationFeeId,
     application_fee_amount = applicationFeeAmount,
     status = 'succeeded',
     paid_at = NOW()

5. Update bookings
   SET
     payment_status = 'paid',
     amount_paid = amount_due,
     status = 'confirmed',
     confirmation_date = NOW()

6. Create commission_records
   INSERT INTO commission_records (
     booking_id,
     camp_id,
     organisation_id,
     commission_rate,
     registration_amount,
     commission_amount,
     stripe_application_fee_id,
     actual_fee_collected,
     payment_status = 'collected' (direct) | 'pending'
   )

Event: charge.refunded

1. Calculate Refund Amounts
   isFullRefund = (amount_refunded === total_amount)
   refundPercentage = amount_refunded / total_amount
   refundApplicationFeeAmount = application_fee × refundPercentage

2. Update payment_records
   SET
     status = 'refunded' | 'partially_refunded',
     refund_amount = refundAmount,
     refund_application_fee_amount = refundFeeAmount

3. Update bookings
   SET
     payment_status = 'refunded' | 'partially_refunded',
     status = 'cancelled' (if full refund)

4. Adjust commission_records
   SET
     actual_fee_collected = actual - refundApplicationFeeAmount,
     payment_status = 'refunded' | 'partially_refunded'
```

### Direct Charge Architecture

**How Direct Charges Work:**
1. Customer pays $100 to organizer's Stripe account
2. Stripe automatically deducts $15 application fee (15% commission)
3. Organizer receives net $85 in their account
4. Platform receives $15 as application fee
5. No manual transfers needed

**Advantages:**
- Instant settlement to organizer
- No transfer delays or fees
- Simpler reconciliation
- Organizer sees full transaction in Stripe dashboard
- Stripe handles fund holding in deferred mode

**Database Tracking:**
```sql
-- payment_records
charge_type = 'direct'
connected_account_id = 'acct_xxx'
application_fee_id = 'fee_xxx'
application_fee_amount = 15.00

-- commission_records
stripe_application_fee_id = 'fee_xxx'
actual_fee_collected = 15.00
payment_status = 'collected'  -- Already in platform account
```

---

## Commission System

### Rate Hierarchy

Commission rates are determined in order of precedence:

1. **Camp-Specific Rate** - `camps.commission_rate` (highest priority)
2. **Organization Default** - `organisations.default_commission_rate`
3. **System Default** - `0.15` (15%)

**Database Function:**
```sql
CREATE FUNCTION get_effective_commission_rate(camp_id UUID)
RETURNS NUMERIC AS $$
  SELECT COALESCE(
    camps.commission_rate,                    -- Camp override
    organisations.default_commission_rate,    -- Org default
    0.15                                      -- System default
  )
  FROM camps
  JOIN organisations ON camps.organisation_id = organisations.id
  WHERE camps.id = camp_id;
$$ LANGUAGE SQL;
```

### Commission Tables

**camp_commission_rates** (History)
```sql
- camp_id UUID
- commission_rate NUMERIC(5,4)        -- e.g., 0.15 = 15%
- effective_date TIMESTAMPTZ
- end_date TIMESTAMPTZ                -- NULL = currently active
- set_by UUID                         -- Admin who made change
- notes TEXT                          -- Reason for change
```

**organisation_commission_rates** (History)
```sql
- organisation_id UUID
- commission_rate NUMERIC(5,4)
- effective_date TIMESTAMPTZ
- end_date TIMESTAMPTZ
- set_by UUID
- notes TEXT
```

**commission_records** (Transactions)
```sql
- booking_id UUID
- camp_id UUID
- organisation_id UUID
- commission_rate NUMERIC              -- Rate used for THIS transaction
- registration_amount NUMERIC          -- Total booking amount
- commission_amount NUMERIC            -- Platform fee ($)
- stripe_application_fee_id TEXT       -- Links to Stripe
- actual_fee_collected NUMERIC         -- Actual amount Stripe collected
- payment_status TEXT                  -- 'pending' | 'collected' | 'paid' | 'refunded'
- paid_date TIMESTAMPTZ
```

### Admin Functions

**Update Organization Default Rate:**
```typescript
// Service: src/services/commissionRateService.ts
await updateOrganizationDefaultRate(
  orgId,
  0.15,           // 15%
  adminUserId,
  "Negotiated rate for high-volume organizer"
);
```

**Override Camp-Specific Rate:**
```typescript
await updateCampCommissionRate(
  campId,
  0.10,           // 10% promotional rate
  adminUserId,
  "Special promo for new organizer"
);
```

**Reset to Organization Default:**
```typescript
await resetCampToDefaultRate(campId, adminUserId);
```

**View History:**
```typescript
const history = await getCampCommissionHistory(campId);
const orgHistory = await getOrganizationCommissionHistory(orgId);
```

### Promotional Offers

Promotional offers can reduce commission rates for specific organizations:

**Types:**
- **Free Bookings** - 0% commission for first N bookings
- **Percentage Discount** - Reduced rate (e.g., 10% instead of 15%)
- **Trial Period** - Time-limited reduced rate

**Database Tracking:**
```sql
-- commission_records additional fields
promotional_offer_id UUID              -- Links to offer
original_commission_rate NUMERIC       -- Rate before discount
commission_savings NUMERIC             -- Discount amount
```

---

## Database Schema

### Key Tables

#### organisations
```sql
CREATE TABLE organisations (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT,

  -- Stripe Connect
  stripe_account_id TEXT UNIQUE,
  stripe_account_status TEXT,            -- 'pending' | 'active' | 'disabled'
  payout_enabled BOOLEAN DEFAULT FALSE,
  default_commission_rate NUMERIC(5,4) DEFAULT 0.15,

  -- Onboarding tracking
  onboarding_mode TEXT DEFAULT 'full',   -- 'full' | 'deferred' | 'progressive'
  onboarding_step TEXT DEFAULT 'not_started',
  onboarding_started_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,

  -- Deferred onboarding
  temp_charges_enabled BOOLEAN DEFAULT FALSE,
  charges_enabled BOOLEAN DEFAULT FALSE,
  pending_balance_amount DECIMAL(10,2) DEFAULT 0.00,
  restrictions_active BOOLEAN DEFAULT FALSE,
  restriction_reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### parents
```sql
CREATE TABLE parents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,   -- NULL for guests

  -- Guest checkout support
  is_guest BOOLEAN DEFAULT FALSE,
  guest_session_id TEXT UNIQUE,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,

  -- Parent info
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### children
```sql
CREATE TABLE children (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES parents NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### bookings (formerly registrations)
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  camp_id UUID REFERENCES camps NOT NULL,
  child_id UUID REFERENCES children NOT NULL,
  parent_id UUID REFERENCES parents NOT NULL,

  -- Booking status
  status TEXT DEFAULT 'pending',         -- 'pending' | 'confirmed' | 'cancelled'
  payment_status TEXT DEFAULT 'unpaid',  -- 'unpaid' | 'paid' | 'refunded' | 'partially_refunded'

  -- Pricing
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  discount_code TEXT,
  discount_amount NUMERIC DEFAULT 0,

  -- Stripe tracking
  stripe_checkout_session_id TEXT,

  -- Timestamps
  confirmation_date TIMESTAMPTZ,
  form_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### payment_records
```sql
CREATE TABLE payment_records (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings,   -- Preferred
  registration_id UUID,                  -- Legacy support

  -- Stripe IDs
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,

  -- Payment details
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',         -- 'pending' | 'succeeded' | 'failed' | 'refunded'

  -- Direct charges
  charge_type TEXT,                      -- 'direct' | 'destination' | 'platform_only'
  connected_account_id TEXT,
  application_fee_id TEXT UNIQUE,
  application_fee_amount NUMERIC,

  -- Refund tracking
  refund_amount NUMERIC DEFAULT 0,
  refund_application_fee_amount NUMERIC DEFAULT 0,

  payment_method TEXT,
  paid_at TIMESTAMPTZ,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### commission_records
```sql
CREATE TABLE commission_records (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings NOT NULL,
  camp_id UUID REFERENCES camps NOT NULL,
  organisation_id UUID REFERENCES organisations NOT NULL,

  -- Commission calculation
  commission_rate NUMERIC NOT NULL,      -- Rate used for this transaction
  registration_amount NUMERIC NOT NULL,  -- Total booking amount
  commission_amount NUMERIC NOT NULL,    -- Platform fee

  -- Stripe reconciliation
  stripe_application_fee_id TEXT,
  actual_fee_collected NUMERIC,          -- Actual amount from Stripe

  -- Promotional offers
  promotional_offer_id UUID,
  original_commission_rate NUMERIC,
  commission_savings NUMERIC DEFAULT 0,

  -- Payment tracking
  payment_status TEXT DEFAULT 'pending', -- 'pending' | 'collected' | 'paid' | 'refunded'
  paid_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table Relationships

```
organisations (1) ─────> (N) camps
                  └────> (N) commission_records

parents (1) ───────────> (N) children
        └──────────────> (N) bookings

children (1) ──────────> (N) bookings

camps (1) ─────────────> (N) bookings
          └────────────> (N) commission_records

bookings (1) ──────────> (1) payment_records
             └─────────> (N) commission_records
```

---

## Security & Validation

### RLS Policies

#### bookings Table
```sql
-- Parents can view their bookings
CREATE POLICY "Parents view own bookings"
  ON bookings FOR SELECT
  USING (parent_id IN (SELECT id FROM parents WHERE user_id = auth.uid()));

-- Camp organizers view their camp bookings
CREATE POLICY "Organizers view camp bookings"
  ON bookings FOR SELECT
  USING (camp_id IN (
    SELECT id FROM camps WHERE organisation_id IN (
      SELECT organisation_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Super admins view all
CREATE POLICY "Admins view all bookings"
  ON bookings FOR SELECT
  USING (auth.jwt() ->> 'role' = 'super_admin');
```

#### payment_records Table
```sql
-- Parents view own payments (via bookings)
CREATE POLICY "Parents view own payments"
  ON payment_records FOR SELECT
  USING (
    booking_id IN (
      SELECT b.id FROM bookings b
      JOIN parents p ON b.parent_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- Admins view all payments
CREATE POLICY "Admins view all payments"
  ON payment_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'school_admin', 'operations')
    )
  );
```

#### commission_records Table
```sql
-- Organisation members view their commissions
CREATE POLICY "Organisation members view commissions"
  ON commission_records FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Note: No direct INSERT/UPDATE policies
-- Commissions created by system triggers/functions only
```

#### organisations Table
```sql
-- Super admins manage all
CREATE POLICY "Admins manage organisations"
  ON organisations FOR ALL
  USING (auth.jwt() ->> 'role' = 'super_admin');

-- Users view their organisation
CREATE POLICY "Users view own organisation"
  ON organisations FOR SELECT
  USING (id IN (
    SELECT organisation_id FROM profiles WHERE id = auth.uid()
  ));

-- Org admins update their organisation
CREATE POLICY "Org admins update organisation"
  ON organisations FOR UPDATE
  USING (
    id IN (
      SELECT organisation_id FROM profiles
      WHERE id = auth.uid()
      AND role IN ('camp_organizer', 'organisation_admin')
    )
  );
```

### Validation Triggers

#### validate_stripe_before_publish()
**File:** `supabase/migrations/20260126150000_add_deferred_onboarding.sql`

```sql
CREATE OR REPLACE FUNCTION validate_stripe_before_publish()
RETURNS TRIGGER AS $$
DECLARE
  org_stripe_id TEXT;
  org_payout_enabled BOOLEAN;
  org_temp_charges BOOLEAN;
  org_restrictions BOOLEAN;
BEGIN
  -- Only check when status is being set to 'published'
  IF NEW.status = 'published' THEN
    SELECT
      stripe_account_id,
      payout_enabled,
      COALESCE(temp_charges_enabled, FALSE),
      COALESCE(restrictions_active, FALSE)
    INTO
      org_stripe_id,
      org_payout_enabled,
      org_temp_charges,
      org_restrictions
    FROM organisations
    WHERE id = NEW.organisation_id;

    -- Must have Stripe account
    IF org_stripe_id IS NULL THEN
      RAISE EXCEPTION 'Cannot publish camp: Stripe account not connected.
        Please connect Stripe in Payment Settings.'
        USING HINT = 'Visit /organizer/settings/payments to connect Stripe';
    END IF;

    -- Account must not be restricted by Stripe
    IF org_restrictions = TRUE THEN
      RAISE EXCEPTION 'Cannot publish camp: Stripe account is restricted.
        Please complete your onboarding.'
        USING HINT = 'Visit /organizer/settings/payments to resolve restrictions';
    END IF;

    -- Allow if EITHER:
    -- 1. Full onboarding complete (payout_enabled = true), OR
    -- 2. Deferred mode with temp charges enabled
    IF org_payout_enabled IS NOT TRUE THEN
      IF org_temp_charges IS NOT TRUE THEN
        RAISE EXCEPTION 'Cannot publish camp: Complete Stripe onboarding required
          to enable payments.'
          USING HINT = 'Choose Quick Start for immediate publishing or
            complete full onboarding';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_stripe_before_publish
  BEFORE INSERT OR UPDATE OF status ON camps
  FOR EACH ROW
  EXECUTE FUNCTION validate_stripe_before_publish();
```

### Webhook Security

**Signature Verification:**
```typescript
// supabase/functions/stripe-webhook/index.ts

// CRITICAL: Reject unverified events
if (!webhookSecret || !signature) {
  return new Response(
    JSON.stringify({ error: 'Webhook signature verification required' }),
    { status: 401 }
  );
}

try {
  event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
} catch (err) {
  console.error('Webhook signature verification failed:', err.message);
  return new Response(
    JSON.stringify({ error: 'Invalid signature' }),
    { status: 400 }
  );
}
```

### Guest Checkout Security

**RLS Policy for Anonymous Users:**
```sql
CREATE POLICY "Allow anonymous guest parent creation"
  ON parents FOR INSERT TO anon
  WITH CHECK (is_guest = TRUE);

CREATE POLICY "Guest session access"
  ON parents FOR SELECT TO anon
  USING (is_guest = TRUE AND guest_session_id = current_setting('app.guest_session_id', TRUE));
```

**Session ID Generation:**
```typescript
const guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
```

---

## Business Rules

### Publishing Requirements

**To publish a camp, organization must have:**
1. ✅ Stripe Connect account created (`stripe_account_id IS NOT NULL`)
2. ✅ Either:
   - Full onboarding complete (`payout_enabled = TRUE`), OR
   - Deferred mode enabled (`temp_charges_enabled = TRUE`)
3. ✅ No active restrictions (`restrictions_active = FALSE`)

**Enforced by:** `validate_stripe_before_publish()` trigger on camps table

### Commission Calculation Rules

**Rate Determination:**
1. Check camp-specific rate (`camps.commission_rate`)
2. If NULL, use organization default (`organisations.default_commission_rate`)
3. If NULL, use system default (0.15)

**Applied at Checkout:**
```typescript
const commissionRate = await supabase.rpc('get_effective_commission_rate', { camp_id: campId });
const applicationFeeAmount = Math.round(totalAmount * commissionRate.data);
```

**Tracked in Database:**
- `commission_records.commission_rate` - Rate used for this transaction
- `commission_records.commission_amount` - Dollar amount
- `commission_records.stripe_application_fee_id` - Links to Stripe fee

### Refund Handling

**Full Refund:**
```typescript
payment_records:
  status = 'refunded'
  refund_amount = total_amount

bookings:
  payment_status = 'refunded'
  status = 'cancelled'

commission_records:
  actual_fee_collected = 0
  payment_status = 'refunded'
```

**Partial Refund:**
```typescript
refundPercentage = refund_amount / total_amount
refundApplicationFeeAmount = application_fee * refundPercentage

payment_records:
  status = 'partially_refunded'
  refund_amount = refund_amount

commission_records:
  actual_fee_collected = original_fee - refundApplicationFeeAmount
  payment_status = 'partially_refunded'
```

### Pending Balance Tracking

**Updated via stripe-connect-status Edge Function:**
```typescript
const balance = await stripe.balance.retrieve({ stripeAccount: accountId });

const pendingBalanceAmount = balance.pending?.reduce((sum, item) => {
  return sum + (item.amount / 100); // Convert cents to dollars
}, 0) || 0;

await supabase
  .from('organisations')
  .update({ pending_balance_amount: pendingBalanceAmount })
  .eq('id', organisationId);
```

**Displayed to Organizers:**
- Payment settings page shows pending balance
- Warning if funds are held awaiting verification
- Call-to-action to complete onboarding

### Payout Processing

**Automatic (Stripe Connect):**
- Stripe handles payouts based on `payout_schedule` (daily, weekly, monthly)
- Direct charges: Funds already in organizer account
- No manual processing needed

**Manual (Platform Account - Test Mode Only):**
- Admin initiates payout from admin dashboard
- Requires minimum payout threshold
- Only includes paid bookings with collected commissions

---

## Reference

### File Locations

#### Edge Functions
- `supabase/functions/create-connect-account/index.ts` - Create Stripe Express accounts
- `supabase/functions/stripe-connect-status/index.ts` - Sync account status
- `supabase/functions/create-connect-account-link/index.ts` - Onboarding continuation
- `supabase/functions/create-connect-login-link/index.ts` - Stripe Dashboard access
- `supabase/functions/create-checkout-session/index.ts` - Payment session creation
- `supabase/functions/stripe-webhook/index.ts` - Webhook event processing

#### Frontend Components
- `src/components/stripe/StripeConnectOnboarding.tsx` - Onboarding UI
- `src/pages/organizer/StripePaymentSettings.tsx` - Payment settings page
- `src/pages/CampRegistrationPage.tsx` - Registration & checkout
- `src/services/commissionRateService.ts` - Commission management

#### Services
- `src/services/registrationService.ts` - Multi-child registration logic
- `src/services/stripeService.ts` - Stripe API helpers

#### Key Migrations
- `supabase/migrations/017_add_default_commission_rates.sql` - Commission system
- `supabase/migrations/20260123_organisation_commission_history.sql` - Rate history
- `supabase/migrations/20260125121219_require_stripe_for_published_camps.sql` - Publishing validation
- `supabase/migrations/20260125131804_add_direct_charges_support.sql` - Direct charges
- `supabase/migrations/20260126150000_add_deferred_onboarding.sql` - Deferred mode

### Migration Timeline

| Date | File | Purpose |
|------|------|---------|
| 2025-10-16 | `20251016075433_add_camp_payment_and_enquiries.sql` | Payment links & enquiries |
| 2025-10-16 | `20251016091256_add_payment_tracking_and_registration_status.sql` | Payment records table |
| 2025-10-17 | `017_add_default_commission_rates.sql` | Commission rate system |
| 2026-01-10 | `20260110_fix_calculate_commission_function.sql` | Commission calculation fixes |
| 2026-01-17 | `20260117_add_commission_offer_tracking.sql` | Promotional offers |
| 2026-01-23 | `20260123_organisation_commission_history.sql` | Commission audit trail |
| 2026-01-25 | `20260125131804_add_direct_charges_support.sql` | Direct charges & refunds |
| 2026-01-25 | `20260125121219_require_stripe_for_published_camps.sql` | Publishing validation |
| 2026-01-26 | `20260126150000_add_deferred_onboarding.sql` | Deferred onboarding mode |

### Troubleshooting Guide

#### Issue: "Cannot publish camp: Stripe account not connected"
**Solution:**
1. Go to Payment Settings (`/organizer/settings/payments`)
2. Click "Connect with Stripe"
3. Complete onboarding (Quick Start or Full Setup)

#### Issue: "Cannot publish camp: Complete Stripe onboarding required"
**Solution:**
- If using deferred mode: Check `temp_charges_enabled` is TRUE
- If using full mode: Check `payout_enabled` is TRUE
- Verify `restrictions_active` is FALSE

#### Issue: Webhook events not processing
**Solution:**
1. Verify webhook secret: `supabase secrets list | grep STRIPE_WEBHOOK_SECRET`
2. Check Stripe Dashboard → Webhooks for delivery status
3. Verify endpoint URL matches Edge Function URL
4. Check Edge Function logs: `supabase functions logs stripe-webhook`

#### Issue: Commission amount doesn't match expected
**Solution:**
1. Check effective rate: `SELECT get_effective_commission_rate(camp_id)`
2. Verify camp-specific override in `camps.commission_rate`
3. Check org default in `organisations.default_commission_rate`
4. Review commission_records for actual amount collected

#### Issue: Guest checkout not working
**Solution:**
1. Verify RLS policy allows anonymous INSERT on parents table
2. Check `is_guest = TRUE` in parent record
3. Verify `guest_session_id` is unique and stored correctly
4. Test with incognito browser window

#### Issue: Pending balance not updating
**Solution:**
1. Call `stripe-connect-status` Edge Function manually
2. Verify Stripe account ID is correct
3. Check Stripe API permissions for balance retrieval
4. Review Edge Function logs for errors

---

## Summary

This payment architecture provides:
- ✅ **Flexible Onboarding** - Full or deferred (Quick Start) modes
- ✅ **Direct Charges** - Instant settlement to organizers with automatic commission collection
- ✅ **Multi-Child Support** - Single transaction for multiple children
- ✅ **Guest Checkout** - No account required for parents
- ✅ **Commission Flexibility** - System, organization, and camp-level rates
- ✅ **Complete Audit Trail** - Full tracking of all payments and commissions
- ✅ **Refund Handling** - Proportional commission refunds
- ✅ **Security** - RLS policies, webhook signature verification
- ✅ **Validation** - Trigger-based business rules enforcement

For additional documentation, see:
- `STRIPE_SETUP.md` - Initial Stripe Connect setup guide
- `STRIPE_CONNECT_IMPLEMENTATION_SUMMARY.md` - Implementation details

---
---

# Organizer Structure & Role System

This section documents the complete camp organizer role system, permissions, workflows, organization management, and business rules.

## Table of Contents
1. [Organizer Role System Overview](#organizer-role-system-overview)
2. [Role Definitions & Permissions](#role-definitions--permissions)
3. [Organization Structure](#organization-structure)
4. [Access Control & RLS Policies](#access-control--rls-policies)
5. [Invitation & Onboarding](#invitation--onboarding)
6. [Organizer Workflows](#organizer-workflows)
7. [Camp Lifecycle & Status Management](#camp-lifecycle--status-management)
8. [Business Rules](#business-rules)
9. [Reference](#reference-1)

---

## Organizer Role System Overview

### Architecture Summary
The platform uses a **dual-role architecture** combining platform-level roles with organization-level roles for fine-grained access control:

- **Platform Roles** - System-wide identity (camp_organizer, super_admin, parent, etc.)
- **Organization Roles** - Organization-specific permissions (owner, admin, staff, viewer)

### Key Features
- **Multi-Tenant Organizations** - Each organizer belongs to one or more organizations
- **Creator-Based Filtering** - Organizers see only camps they created (`created_by = auth.uid()`)
- **Invite-Only Registration** - Camp organizers can only sign up with valid invite tokens
- **Approval Workflow** - New camps require admin review before publishing
- **Status-Based Editing** - Camps can only be edited in specific workflow states
- **Complete Audit Trail** - All actions tracked with user attribution

### Permission Hierarchy (5 Levels)

```
LEVEL 5: super_admin
  ├─ Bypass all RLS policies
  ├─ Manage all organizations
  ├─ Approve/reject camps
  ├─ Assign roles
  └─ View all data

LEVEL 4: camp_organizer
  ├─ Create and manage organizations
  ├─ Create and manage camps
  ├─ View bookings for their camps
  ├─ Manage organization profiles
  └─ Connect Stripe accounts

LEVEL 3: school_admin
  ├─ View camps
  ├─ Manage school content
  └─ Contact organizers

LEVEL 2: parent
  ├─ Browse published camps
  ├─ Make bookings
  ├─ Manage children
  └─ Leave reviews

LEVEL 1: user
  ├─ View public content
  └─ View own profile
```

---

## Role Definitions & Permissions

### Platform Roles

Platform roles are defined in the `profiles` table and determine system-wide access:

**Role Constraint:**
```sql
CHECK (role IN ('parent', 'super_admin', 'school_admin', 'marketing',
                'operations', 'risk', 'camp_organizer'))
```

#### Platform Role Definitions

| Role | Level | Purpose | Key Permissions |
|------|-------|---------|----------------|
| **super_admin** | 5 | Full system administration | Bypass RLS, manage all data, approve camps, assign roles |
| **camp_organizer** | 4 | Camp provider/owner | Create orgs, create camps, manage bookings, connect Stripe |
| **school_admin** | 3 | School coordination | View camps, manage school content |
| **operations** | 3 | Platform operations | Manage bookings, customer support |
| **marketing** | 3 | Marketing team | View analytics, manage promotions |
| **risk** | 3 | Risk management | View all transactions, flag issues |
| **parent** | 2 | Camp consumer | Browse camps, make bookings, leave reviews |
| **user** | 1 | Basic user | View public content only |

### Organization Roles

Organization roles are defined in the `organisation_members` table and control org-specific permissions:

**Role Constraint:**
```sql
CHECK (role IN ('owner', 'admin', 'staff', 'viewer'))
```

#### Organization Role Definitions

| Role | Permissions | Typical Use Case |
|------|------------|------------------|
| **owner** | Full organization management, invite/remove members, manage payouts, delete org | Organization founder |
| **admin** | Manage camps, view bookings, respond to enquiries, update org profile | Organization manager |
| **staff** | Create/edit camps, view bookings, respond to feedback | Camp coordinator |
| **viewer** | Read-only access to camps and bookings | Accountant, observer |

**Default Permissions (JSONB):**
```json
{
  "manage_camps": true,      // Create, edit, delete camps
  "view_bookings": true,      // View booking details
  "manage_payouts": false     // Access payout settings
}
```

### Helper Functions

**Platform Role Checks:**

```sql
-- Check if user is a camp organizer
CREATE FUNCTION is_camp_organizer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'camp_organizer'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is a super admin
CREATE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'super_admin'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Organization Membership Checks:**

```sql
-- Check if user is a member of an organization
CREATE FUNCTION is_organisation_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organisation_members
    WHERE organisation_id = org_id
      AND profile_id = auth.uid()
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's role in an organization
CREATE FUNCTION get_organisation_role(org_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM organisation_members
    WHERE organisation_id = org_id
      AND profile_id = auth.uid()
      AND status = 'active'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Camp Permission Checks:**

```sql
-- Check if user can edit a camp
CREATE FUNCTION can_edit_camp(camp_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  camp_org_id UUID;
  camp_status TEXT;
BEGIN
  SELECT organisation_id, status INTO camp_org_id, camp_status
  FROM camps WHERE id = camp_id;

  -- Super admins can edit any camp
  IF is_super_admin() THEN
    RETURN TRUE;
  END IF;

  -- Organizers can edit camps in specific statuses
  RETURN (
    is_organisation_member(camp_org_id) AND
    camp_status IN ('draft', 'requires_changes', 'unpublished')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Organization Structure

### Organisation Table Schema

**File:** Multiple migrations, core fields established in initial schema

```sql
CREATE TABLE organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,

  -- Contact Information
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  about TEXT,
  logo_url TEXT,

  -- Address (JSONB)
  address JSONB DEFAULT '{}'::jsonb,
  /*
    {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "postal_code": "94102",
      "country": "US"
    }
  */

  -- Business Details
  business_type TEXT CHECK (business_type IN (
    'individual', 'company', 'nonprofit', 'government'
  )),
  company_registration_number TEXT,
  vat_number TEXT,
  tax_id TEXT,
  established_year INTEGER,
  timezone TEXT DEFAULT 'UTC',

  -- Status
  active BOOLEAN DEFAULT TRUE,
  verified BOOLEAN DEFAULT FALSE,  -- Trust badge

  -- Onboarding Tracking
  onboarding_status TEXT DEFAULT 'pending_application' CHECK (
    onboarding_status IN (
      'pending_application',
      'pending_verification',
      'pending_approval',
      'active',
      'rejected',
      'suspended'
    )
  ),
  onboarding_completed_at TIMESTAMPTZ,
  onboarding_notes TEXT,

  -- Approval Tracking
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES profiles(id),
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,

  -- Verification
  identity_verification_status TEXT,

  -- Stripe Connect (see Payment Architecture section)
  stripe_account_id TEXT UNIQUE,
  stripe_account_status TEXT,
  payout_enabled BOOLEAN DEFAULT FALSE,
  default_commission_rate NUMERIC(5,4) DEFAULT 0.15,

  -- Performance Metrics
  response_rate DECIMAL(5,2),
  response_time_hours DECIMAL(10,2),
  total_camps_hosted INTEGER DEFAULT 0,

  -- Settings
  settings JSONB DEFAULT '{}'::jsonb,

  -- Audit Trail
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Organisation Members Table

**File:** `supabase/migrations/002_create_organisation_members.sql`

```sql
CREATE TABLE organisation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Organization-Specific Role
  role TEXT NOT NULL DEFAULT 'staff' CHECK (
    role IN ('owner', 'admin', 'staff', 'viewer')
  ),

  -- Granular Permissions
  permissions JSONB DEFAULT '{
    "manage_camps": true,
    "view_bookings": true,
    "manage_payouts": false
  }'::jsonb,

  -- Invitation Tracking
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'active' CHECK (
    status IN ('pending', 'active', 'suspended', 'removed')
  ),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one role per person per org
  UNIQUE(organisation_id, profile_id)
);
```

### Multi-Tenant Data Isolation

**Scoping Strategy:**
- **Camps** - Linked to `organisation_id` AND filtered by `created_by`
- **Bookings** - Accessible via camp's organisation membership
- **Commission Records** - Scoped to organisation
- **Payouts** - Organization-specific financial records
- **Audit Logs** - Include `organisation_id` for tracking

**Key Security Principle:**
Organizers can only see camps where `created_by = auth.uid()`, even if they're members of multiple organizations. This prevents data leakage between team members.

---

## Access Control & RLS Policies

### Camp Access Policies

**File:** `supabase/migrations/20260121_definitive_camp_organizer_rls.sql`

**Creator-Based Filtering Model:**

```sql
-- Policy 1: Camp organizers see ONLY camps they created
CREATE POLICY "camp_organizer_select_created_camps"
  ON camps FOR SELECT TO authenticated
  USING (
    is_super_admin() OR
    (is_camp_organizer() AND created_by = auth.uid())
  );

-- Policy 2: Authenticated non-organizers see published camps
CREATE POLICY "authenticated_select_published_camps"
  ON camps FOR SELECT TO authenticated
  USING (
    NOT is_camp_organizer() AND status = 'published'
  );

-- Policy 3: Anonymous users see published camps
CREATE POLICY "anon_select_published_camps"
  ON camps FOR SELECT TO anon
  USING (status = 'published');

-- Policy 4: Camp organizers can create camps in their organization
CREATE POLICY "camp_organizer_insert_camps"
  ON camps FOR INSERT TO authenticated
  WITH CHECK (
    is_camp_organizer() AND
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE profile_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'staff')
    )
  );

-- Policy 5: Camp organizers can update their camps (status-based)
CREATE POLICY "camp_organizer_update_camps"
  ON camps FOR UPDATE TO authenticated
  USING (
    is_super_admin() OR
    (
      is_camp_organizer() AND
      can_edit_camp(id) AND
      created_by = auth.uid()
    )
  );

-- Policy 6: Camp organizers can delete draft camps only
CREATE POLICY "camp_organizer_delete_draft_camps"
  ON camps FOR DELETE TO authenticated
  USING (
    is_super_admin() OR
    (
      is_camp_organizer() AND
      status = 'draft' AND
      created_by = auth.uid()
    )
  );
```

**Key Security Features:**
- ✅ **Creator Isolation** - `created_by = auth.uid()` ensures organizers see only their own camps
- ✅ **Organization Scoping** - Must be active member to create camps
- ✅ **Status-Based Editing** - Can only edit draft, requires_changes, or unpublished camps
- ✅ **Delete Protection** - Can only delete draft camps

### Organization Access Policies

**File:** `supabase/migrations/005_add_camp_organizer_rls_policies.sql`

```sql
-- View: Members can see their organisations
CREATE POLICY "Users can view their organisations"
  ON organisations FOR SELECT
  USING (
    is_super_admin() OR
    active = TRUE OR
    id IN (
      SELECT organisation_id FROM organisation_members
      WHERE profile_id = auth.uid() AND status = 'active'
    )
  );

-- Insert: Super admins and organizers can create organisations
CREATE POLICY "Camp organizers can create organisations"
  ON organisations FOR INSERT
  WITH CHECK (
    is_super_admin() OR is_camp_organizer()
  );

-- Update: Owners/admins can update their organisation
CREATE POLICY "Organisation owners can update their organisation"
  ON organisations FOR UPDATE
  USING (
    is_super_admin() OR
    id IN (
      SELECT organisation_id FROM organisation_members
      WHERE profile_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin')
    )
  );

-- Delete: Only super admins can delete organisations
CREATE POLICY "Only super admins can delete organisations"
  ON organisations FOR DELETE
  USING (is_super_admin());
```

### Bookings/Registrations Policies

```sql
-- Parents can view their bookings
CREATE POLICY "Parents can view own bookings"
  ON bookings FOR SELECT
  USING (
    is_super_admin() OR
    parent_id IN (
      SELECT id FROM parents WHERE user_id = auth.uid()
    )
  );

-- Camp organizers can view registrations for their camps
CREATE POLICY "Camp organizers can view their camp registrations"
  ON bookings FOR SELECT
  USING (
    is_super_admin() OR
    camp_id IN (
      SELECT id FROM camps
      WHERE created_by = auth.uid()
    )
  );

-- Camp organizers can update booking status
CREATE POLICY "Camp organizers can update bookings"
  ON bookings FOR UPDATE
  USING (
    is_super_admin() OR
    camp_id IN (
      SELECT id FROM camps
      WHERE created_by = auth.uid()
    )
  );
```

### Feedback and Enquiries Policies

```sql
-- Public can view visible feedback
CREATE POLICY "Public can view visible feedback"
  ON feedback FOR SELECT TO anon
  USING (visible = TRUE);

-- Organizers can view all feedback for their camps
CREATE POLICY "Camp organizers can view their camp feedback"
  ON feedback FOR SELECT
  USING (
    visible = TRUE OR
    is_super_admin() OR
    camp_id IN (
      SELECT id FROM camps
      WHERE created_by = auth.uid()
    )
  );

-- Organizers can respond to feedback
CREATE POLICY "Camp organizers can respond to feedback"
  ON feedback FOR UPDATE
  USING (
    is_super_admin() OR
    camp_id IN (
      SELECT id FROM camps
      WHERE created_by = auth.uid()
        AND role IN ('owner', 'admin', 'staff')
    )
  );
```

---

## Invitation & Onboarding

### Invitation System

**File:** `supabase/migrations/007_add_camp_organizer_invites.sql`

**Invite Table:**
```sql
CREATE TABLE camp_organizer_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,  -- Secure random token

  -- Optional: Pre-assign to organization
  organisation_id UUID REFERENCES organisations(id),

  -- Invitation Tracking
  invited_by UUID NOT NULL REFERENCES profiles(id),
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'expired', 'revoked')
  ),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  -- Acceptance Tracking
  profile_id UUID REFERENCES profiles(id),  -- Populated on acceptance
  accepted_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Invite Flow:**

1. **Super Admin Creates Invite**
   ```typescript
   // Generate secure token
   const token = crypto.randomUUID();

   await supabase.from('camp_organizer_invites').insert({
     email: 'neworganizer@example.com',
     token: token,
     invited_by: adminId,
     organisation_id: optionalOrgId,  // Can pre-assign
     expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
   });
   ```

2. **Email Sent**
   - Link: `https://app.com/signup?invite=TOKEN`

3. **Recipient Validates Token**
   ```sql
   CREATE FUNCTION validate_invite_token(p_token TEXT)
   RETURNS TABLE (
     invite_id UUID,
     email TEXT,
     organisation_id UUID,
     is_valid BOOLEAN,
     error_message TEXT
   ) AS $$
   BEGIN
     RETURN QUERY
     SELECT
       i.id,
       i.email,
       i.organisation_id,
       (i.status = 'pending' AND i.expires_at > NOW())::BOOLEAN,
       CASE
         WHEN i.status != 'pending' THEN 'Invite already used or revoked'
         WHEN i.expires_at <= NOW() THEN 'Invite expired'
         ELSE NULL
       END
     FROM camp_organizer_invites i
     WHERE i.token = p_token;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

4. **Signup/Registration**
   - Profile created with role `camp_organizer`
   - If `organisation_id` provided, automatically added to organization

5. **Mark Invite Accepted**
   ```sql
   CREATE FUNCTION mark_invite_accepted(p_token TEXT, p_profile_id UUID)
   RETURNS BOOLEAN AS $$
   BEGIN
     UPDATE camp_organizer_invites
     SET
       status = 'accepted',
       profile_id = p_profile_id,
       accepted_at = NOW()
     WHERE token = p_token
       AND status = 'pending'
       AND expires_at > NOW();

     RETURN FOUND;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

### Onboarding Flow

**File:** `supabase/migrations/003_add_organisation_onboarding.sql`

**Onboarding Status Tracking:**
```sql
-- In organisations table
onboarding_status TEXT DEFAULT 'pending_application' CHECK (
  onboarding_status IN (
    'pending_application',    -- Initial signup
    'pending_verification',   -- Identity/business verification
    'pending_approval',       -- Admin review
    'active',                 -- Approved and active
    'rejected',               -- Application rejected
    'suspended'               // Account suspended
  )
)
```

**3-Step Onboarding Journey:**

#### Step 1: Welcome (`/onboarding/welcome`)
**Component:** `src/pages/onboarding/Welcome.tsx`

- Personalized welcome message
- 3-step overview display
- Commission rate information (85% to organizer, 15% platform)
- Promotional offer display (if active)
- Time estimate: ~15 minutes total
- CTA: "Let's Get Started"

#### Step 2: Organization Setup (`/onboarding/organization`)
**Component:** `src/pages/onboarding/OrganizationSetup.tsx`

**Required Fields:**
- Organization name ✅
- Contact email ✅

**Optional Fields:**
- Contact phone
- Website

**Process:**
```typescript
await supabase.from('organisations').insert({
  name: organizationName,
  contact_email: email,
  contact_phone: phone,
  website: website,
  created_by: userId,
  onboarding_status: 'pending_application'
});

// Link user to organization
await supabase.from('organisation_members').insert({
  organisation_id: orgId,
  profile_id: userId,
  role: 'owner',
  permissions: {
    manage_camps: true,
    view_bookings: true,
    manage_payouts: true
  },
  status: 'active'
});
```

#### Step 3: First Camp Wizard (`/onboarding/first-camp`)
**Component:** `src/pages/onboarding/FirstCampWizard.tsx`

**5-Step Wizard:**

**Step 3.1: Camp Basics**
- Camp name ✅
- Category selection (8 categories) ✅
- Start/end dates ✅
- Age range (min/max) ✅
- Location ✅
- Capacity ✅

**Step 3.2: Pricing**
- Price per camper ✅
- Currency (USD, EUR, GBP, CAD, AUD)
- Early bird pricing (optional)
- Commission preview (calculated automatically)

**Step 3.3: Description**
- Camp description ✅ (minimum 50 characters)
- What to bring list (optional)

**Step 3.4: Photos**
- Featured image URL (optional but recommended)
- Preview display

**Step 3.5: Review & Submit**
- Camp summary preview
- Two options:
  - **Save as Draft** - Save without submitting
  - **Submit for Review** - Submit to admin for approval

**Completion:**
```typescript
await supabase.from('profiles').update({
  onboarding_completed: true,
  onboarding_completed_at: new Date()
}).eq('id', userId);
```

### Onboarding Checklist

**Component:** `src/components/onboarding/OnboardingChecklist.tsx`

**Checklist Items:**
1. ✅ Create Account (always complete if viewing)
2. ⬜ Set Up Organization → `/organizer/organization/profile`
3. ⬜ Create First Camp → `/onboarding/first-camp`
4. ⬜ Connect Stripe → `/organizer/settings/payments`

**Tracking Service:**
```typescript
// src/services/onboardingService.ts

export async function getOnboardingStatus() {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, organisation:organisation_id(*)')
    .single();

  return {
    accountCreated: true,
    organizationSetup: !!profile.organisation_id,
    firstCampCreated: profile.total_camps_created > 0,
    stripeConnected: profile.organisation?.stripe_account_id != null
  };
}

export async function completeOnboarding() {
  return supabase.from('profiles').update({
    onboarding_completed: true,
    onboarding_completed_at: new Date()
  }).eq('id', (await supabase.auth.getUser()).data.user?.id);
}
```

---

## Organizer Workflows

### Dashboard Overview

**Main Dashboard:** `/organizer-dashboard`
**Component:** `src/pages/organizer/OrganizerDashboardOverview.tsx`

**Dashboard Sections:**
1. **Welcome Banner** - Personalized greeting with organizer name
2. **Onboarding Checklist** - Progress tracker (if incomplete)
3. **Stripe Connection Banner** - Reminder if camps exist but no Stripe account
4. **Camps View** - Main camp management interface

### Camp Management

**Component:** `src/pages/organizer/OrganizerCampsView.tsx`

**Features:**
- **Real-Time Statistics**
  - Total camps
  - Published count
  - Pending review count
  - Draft count
  - Needs changes count

- **Camp Listing**
  - Filtered by `created_by = auth.uid()`
  - Status badges (draft, published, pending, etc.)
  - Enrolled count / capacity
  - Availability indicators

- **Actions**
  - Create New Camp
  - Edit Camp
  - Delete Camp (draft only)
  - Manage Reviews
  - Export to CSV

### Camp Creation/Editing Modal

**Component:** `src/components/camps/CampFormModal.tsx`

**6-Tab Interface:**

#### Tab 1: Basic Information
- Camp name
- Category (dropdown)
- Start/end dates
- Age range (min/max)
- Location
- Capacity (max participants)

#### Tab 2: Details
- Description (rich text)
- Requirements
- Highlights (bullet points)

#### Tab 3: Pricing
- Price per camper
- Currency selection
- Early bird pricing
- Early bird deadline
- **Commission Display**: Shows platform fee and organizer earnings

#### Tab 4: Media
**Component:** `src/components/camps/MediaUploadManager.tsx`
- Featured image
- Gallery images (multiple with captions)
- Videos (YouTube, Vimeo, or direct URLs)

#### Tab 5: Content
- FAQs (question/answer pairs)
- Amenities (checklist)

#### Tab 6: Policies
- Cancellation policy
- Refund policy
- Safety protocols
- Insurance information

**Validation & Submission:**
```typescript
// Security check: Only owner can edit
if (camp.created_by !== userId) {
  throw new Error('Unauthorized: You can only edit camps you created');
}

// Status check: Can only edit in certain states
if (!['draft', 'requires_changes', 'unpublished'].includes(camp.status)) {
  throw new Error('Cannot edit camp in current status');
}

await supabase.from('camps').update(campData).eq('id', campId);
```

### Profile Management

#### Personal Profile (`/organizer/profile`)
**Component:** `src/pages/organizer/PersonalProfile.tsx`

**Editable Fields:**
- First name
- Last name
- Phone (E.164 format validation)
- Avatar URL

**Read-Only Information:**
- Email
- Role
- Account creation date
- User ID

#### Organization Profile (`/organizer/organization/profile`)
**Component:** `src/pages/organizer/OrganizationProfile.tsx`

**Sections:**

**Basic Information:**
- Organization name
- Contact email
- Contact phone
- Website
- About text
- Logo URL (with preview)

**Address:**
- Street address
- City
- State/Province
- Postal code
- Country

**Business Details:**
- Business type (dropdown)
- Established year
- Company registration number
- Tax ID / EIN
- VAT number
- Timezone (dropdown)

**Account Status (Read-Only):**
- Onboarding status
- Verified status
- Stripe connection status

### Payment Settings

**Component:** `src/pages/organizer/StripePaymentSettings.tsx`

**Features:**
- Stripe Connect onboarding button
- Commission structure display (85% / 15%)
- Example earnings calculations
- Account status display
- Help and information

**See Payment Architecture section for detailed Stripe Connect flow.**

---

## Camp Lifecycle & Status Management

### Camp Status States

**Status Workflow:**
```
draft
  └─> pending_review
       ├─> approved ─> published
       ├─> requires_changes ─> (edit) ─> pending_review
       └─> rejected (terminal)

published
  ├─> unpublished ─> (can be republished)
  ├─> full (capacity reached)
  ├─> cancelled
  ├─> completed (past end date)
  └─> archived
```

**Status Definitions:**

| Status | Description | Can Edit? | Can Delete? |
|--------|-------------|-----------|-------------|
| **draft** | Initial creation, not submitted | ✅ Yes | ✅ Yes |
| **pending_review** | Submitted to admin for approval | ❌ No | ❌ No |
| **requires_changes** | Admin requested changes | ✅ Yes | ❌ No |
| **approved** | Admin approved, ready to publish | ❌ No | ❌ No |
| **published** | Live and accepting bookings | ❌ No | ❌ No |
| **rejected** | Admin rejected application | ❌ No | ❌ No |
| **unpublished** | Temporarily hidden | ✅ Yes | ❌ No |
| **full** | Capacity reached | ❌ No | ❌ No |
| **cancelled** | Camp cancelled | ❌ No | ❌ No |
| **completed** | Past end date | ❌ No | ❌ No |
| **archived** | Historical record | ❌ No | ❌ No |

### Status-Based Editing Rules

**File:** `supabase/migrations/004_add_camp_approval_workflow.sql`

```sql
CREATE FUNCTION can_edit_camp(camp_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  camp_org_id UUID;
  camp_status TEXT;
BEGIN
  SELECT organisation_id, status INTO camp_org_id, camp_status
  FROM camps WHERE id = camp_id;

  -- Super admins can always edit
  IF is_super_admin() THEN
    RETURN TRUE;
  END IF;

  -- Organizers can edit in specific states
  RETURN (
    is_organisation_member(camp_org_id) AND
    camp_status IN ('draft', 'requires_changes', 'unpublished')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Editing Restrictions Enforced By:**
- RLS policies (UPDATE policy uses `can_edit_camp()`)
- Frontend validation (buttons disabled for non-editable states)
- Backend validation (Supabase throws error if policy violated)

### Approval Workflow

**Admin Actions:**

1. **Review Submission**
   ```typescript
   // Admin reviews camp in admin dashboard
   const camp = await supabase
     .from('camps')
     .select('*')
     .eq('status', 'pending_review')
     .single();
   ```

2. **Approve**
   ```typescript
   await supabase.from('camps').update({
     status: 'approved',
     approved_by: adminId,
     approved_at: new Date(),
     reviewed_at: new Date()
   }).eq('id', campId);
   ```

3. **Request Changes**
   ```typescript
   await supabase.from('camps').update({
     status: 'requires_changes',
     admin_feedback: 'Please add more details about safety protocols.',
     reviewed_at: new Date()
   }).eq('id', campId);
   ```

4. **Reject**
   ```typescript
   await supabase.from('camps').update({
     status: 'rejected',
     rejected_by: adminId,
     rejected_at: new Date(),
     rejection_reason: 'Does not meet quality standards',
     reviewed_at: new Date()
   }).eq('id', campId);
   ```

**Organizer Sees Feedback:**
- Admin feedback displayed in dashboard
- Email notification sent
- Can revise and resubmit

### Publishing Requirements

**Validation Trigger:** `validate_stripe_before_publish()`
**File:** `supabase/migrations/20260125121219_require_stripe_for_published_camps.sql`

**Requirements to Publish:**
1. ✅ Stripe account connected (`stripe_account_id IS NOT NULL`)
2. ✅ Either:
   - Full onboarding complete (`payout_enabled = TRUE`), OR
   - Deferred mode enabled (`temp_charges_enabled = TRUE`)
3. ✅ No active restrictions (`restrictions_active = FALSE`)
4. ✅ Camp status is `approved`

**See Payment Architecture section for detailed Stripe Connect requirements.**

---

## Business Rules

### Camp Creation Rules

**Who Can Create Camps:**
- Users with role `camp_organizer`
- Active member of at least one organization
- Organization role: `owner`, `admin`, or `staff`

**Automatic Fields:**
```typescript
await supabase.from('camps').insert({
  ...campData,
  organisation_id: userOrganisationId,
  created_by: auth.uid(),  // CRITICAL: Sets creator
  status: 'draft',
  created_at: new Date()
});
```

**Commission Rate Assignment:**
1. Check camp-specific override (if set by admin)
2. Use organization default (`organisations.default_commission_rate`)
3. Fall back to system default (0.15 / 15%)

### Editing Restrictions

**Can Edit If:**
- ✅ `created_by = auth.uid()` (camp creator)
- ✅ Camp status IN ('draft', 'requires_changes', 'unpublished')
- ✅ Active organization member

**Cannot Edit If:**
- ❌ Status is 'pending_review', 'published', 'full', 'completed'
- ❌ Not the creator (even if org member)
- ❌ Organization membership suspended

### Deletion Policies

**Can Delete If:**
- ✅ Status is 'draft' ONLY
- ✅ `created_by = auth.uid()`
- ✅ No bookings exist

**Cannot Delete If:**
- ❌ Status is anything other than 'draft'
- ❌ Any bookings exist (paid or unpaid)
- ❌ Not the creator

**RLS Policy:**
```sql
CREATE POLICY "camp_organizer_delete_draft_camps"
  ON camps FOR DELETE TO authenticated
  USING (
    is_super_admin() OR
    (
      is_camp_organizer() AND
      status = 'draft' AND
      created_by = auth.uid()
    )
  );
```

### Data Ownership

**Creator-Based Ownership Model:**
- Every camp has `created_by` field set to creator's `auth.uid()`
- Organizers see ONLY camps where `created_by = auth.uid()`
- Organization membership does NOT grant access to other members' camps
- Super admins bypass this restriction

**Why This Model:**
1. **Privacy** - Team members can't see each other's drafts
2. **Security** - Prevents accidental modification of others' camps
3. **Accountability** - Clear ownership and responsibility
4. **Audit Trail** - Always know who created what

**Example Scenario:**
```
Organization: "Summer Fun Camps"
Members:
  - Alice (owner)
  - Bob (admin)
  - Carol (staff)

Alice creates "Soccer Camp" → Alice can see/edit
Bob creates "Art Camp" → Bob can see/edit
Carol creates "Music Camp" → Carol can see/edit

Alice CANNOT see Bob's or Carol's camps
Bob CANNOT see Alice's or Carol's camps
Carol CANNOT see Alice's or Bob's camps

Super Admin can see all three camps
```

### Multi-Organization Support

**Current Implementation:**
- Users CAN be members of multiple organizations (via `organisation_members`)
- Each camp belongs to exactly one organization
- When creating camp, user selects which organization (if multiple)
- Creator-based filtering applies across all organizations

**Data Scoping:**
```sql
-- User belongs to multiple orgs
SELECT * FROM organisation_members WHERE profile_id = auth.uid();
/* Returns:
  org_id_1, role: 'owner'
  org_id_2, role: 'staff'
*/

-- User creates camps in both orgs
INSERT INTO camps (organisation_id, created_by)
VALUES (org_id_1, auth.uid());  -- Camp A

INSERT INTO camps (organisation_id, created_by)
VALUES (org_id_2, auth.uid());  -- Camp B

-- User sees both camps (because created_by = auth.uid())
SELECT * FROM camps WHERE created_by = auth.uid();
/* Returns:
  Camp A (org_id_1)
  Camp B (org_id_2)
*/
```

---

## Reference

### File Locations

#### Database Migrations (Organizer System)
- `supabase/migrations/001_add_camp_organizer_role.sql` - Role definition, helper functions
- `supabase/migrations/002_create_organisation_members.sql` - Organization membership table
- `supabase/migrations/003_add_organisation_onboarding.sql` - Onboarding status tracking
- `supabase/migrations/004_add_camp_approval_workflow.sql` - Camp status workflow, can_edit_camp()
- `supabase/migrations/005_add_camp_organizer_rls_policies.sql` - Initial RLS policies
- `supabase/migrations/007_add_camp_organizer_invites.sql` - Invitation system
- `supabase/migrations/013_create_roles_table.sql` - System-wide role definitions
- `supabase/migrations/20260121_definitive_camp_organizer_rls.sql` - Creator-based filtering

#### Frontend Pages (Organizer Dashboard)
- `src/pages/organizer/OrganizerDashboardOverview.tsx` - Main dashboard
- `src/pages/organizer/OrganizerCampsView.tsx` - Camp listing and management
- `src/pages/organizer/PersonalProfile.tsx` - Personal profile settings
- `src/pages/organizer/OrganizationProfile.tsx` - Organization profile management
- `src/pages/organizer/StripePaymentSettings.tsx` - Payment settings and Stripe Connect

#### Frontend Pages (Onboarding)
- `src/pages/onboarding/Welcome.tsx` - Step 1: Welcome and overview
- `src/pages/onboarding/OrganizationSetup.tsx` - Step 2: Organization setup
- `src/pages/onboarding/FirstCampWizard.tsx` - Step 3: First camp creation wizard

#### Frontend Components
- `src/components/camps/CampFormModal.tsx` - 6-tab camp creation/editing modal
- `src/components/camps/MediaUploadManager.tsx` - Image and video uploads
- `src/components/dashboard/OrganizerDashboardLayout.tsx` - Dashboard layout and navigation
- `src/components/rbac/RoleBasedRoute.tsx` - Role-based access control wrapper
- `src/components/onboarding/OnboardingChecklist.tsx` - Onboarding progress tracker
- `src/components/organizer/WelcomeBanner.tsx` - Personalized greeting
- `src/components/organizer/StripeConnectionBanner.tsx` - Stripe reminder

#### Services
- `src/services/onboardingService.ts` - Onboarding status and management
- `src/services/commissionRateService.ts` - Commission rate queries and updates

#### Marketing/Landing
- `src/pages/CampOwnerLanding.tsx` - Public-facing camp owner landing page

### Key Database Functions

```sql
-- Role Checks
is_camp_organizer() → BOOLEAN
is_super_admin() → BOOLEAN
is_school_admin() → BOOLEAN

-- Organization Membership
is_organisation_member(org_id UUID) → BOOLEAN
get_organisation_role(org_id UUID) → TEXT

-- Camp Permissions
can_edit_camp(camp_id UUID) → BOOLEAN

-- Invitation Management
validate_invite_token(p_token TEXT) → TABLE
mark_invite_accepted(p_token TEXT, p_profile_id UUID) → BOOLEAN
expire_old_invites() → INTEGER

-- Role Management
update_user_role(p_user_id UUID, p_new_role TEXT, p_reason TEXT) → VOID
```

### Frontend Routes

**Public:**
- `/for-camp-owners` - Camp owner landing page

**Authentication:**
- `/auth?mode=signup&role=camp_owner` - Organizer signup

**Onboarding:**
- `/onboarding/welcome` - Welcome page
- `/onboarding/organization` - Organization setup
- `/onboarding/first-camp` - First camp wizard

**Dashboard:**
- `/organizer-dashboard` - Main dashboard
- `/organizer/profile` - Personal profile
- `/organizer/organization/profile` - Organization profile
- `/organizer/settings/payments` - Payment settings

### Troubleshooting Guide

#### Issue: "Cannot see camps I created"
**Solution:**
1. Check if `created_by` field is set correctly
   ```sql
   SELECT id, name, created_by FROM camps WHERE id = 'camp_id';
   ```
2. Verify current user ID
   ```sql
   SELECT auth.uid();
   ```
3. Ensure RLS policy is applied
   ```sql
   SELECT * FROM camps WHERE created_by = auth.uid();
   ```

#### Issue: "Cannot edit camp"
**Solution:**
1. Check camp status
   ```sql
   SELECT status FROM camps WHERE id = 'camp_id';
   ```
2. Verify status is in editable states: 'draft', 'requires_changes', or 'unpublished'
3. Check if you're the creator
   ```sql
   SELECT created_by = auth.uid() FROM camps WHERE id = 'camp_id';
   ```

#### Issue: "Cannot delete camp"
**Solution:**
- Can only delete camps with status 'draft'
- Check for existing bookings
  ```sql
  SELECT COUNT(*) FROM bookings WHERE camp_id = 'camp_id';
  ```
- If bookings exist, cannot delete (even if draft)

#### Issue: "Cannot create camp"
**Solution:**
1. Verify role is 'camp_organizer'
   ```sql
   SELECT role FROM profiles WHERE id = auth.uid();
   ```
2. Check organization membership
   ```sql
   SELECT * FROM organisation_members
   WHERE profile_id = auth.uid() AND status = 'active';
   ```
3. Verify organization role is 'owner', 'admin', or 'staff'

#### Issue: "Invite link expired or invalid"
**Solution:**
1. Check invite status
   ```sql
   SELECT status, expires_at FROM camp_organizer_invites
   WHERE token = 'token_value';
   ```
2. If expired, request new invite from admin
3. Invites expire after 7 days

#### Issue: "Cannot publish camp - Stripe not connected"
**Solution:**
1. Go to Payment Settings (`/organizer/settings/payments`)
2. Complete Stripe Connect onboarding
3. Wait for `payout_enabled = TRUE` or `temp_charges_enabled = TRUE`
4. See Payment Architecture section for detailed Stripe setup

#### Issue: "Other organizers can see my drafts"
**This should NOT happen** - System uses creator-based filtering:
1. Verify RLS policy is active
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'camps';
   ```
2. Check `created_by` field
   ```sql
   SELECT id, name, created_by FROM camps WHERE status = 'draft';
   ```
3. Contact system administrator if issue persists

---

## Summary

This organizer structure provides:
- ✅ **Dual-Role Architecture** - Platform + organization roles for fine-grained control
- ✅ **Creator-Based Security** - Organizers see only camps they created
- ✅ **Multi-Tenant Support** - Organizations with member management
- ✅ **Invite-Only Registration** - Controlled onboarding with token validation
- ✅ **3-Step Onboarding** - Guided setup (~15 minutes)
- ✅ **Status-Based Workflows** - Clear camp lifecycle with editing restrictions
- ✅ **Complete Audit Trail** - All actions tracked with user attribution
- ✅ **RLS Security** - Row-level security on all tables
- ✅ **Flexible Permissions** - Role-based access at platform and org levels

For payment-related organizer features, see the **Platform Payment Architecture** section above.
---
---

# Parent (Buyer) Role System

This section documents the complete parent/buyer role architecture, including data model, workflows, booking/payment flows, child management, guest checkout, and business rules.

## Table of Contents
1. [Parent Role Overview](#parent-role-overview)
2. [Data Model](#data-model)
3. [RLS Policies & Security](#rls-policies--security)
4. [Parent Workflows](#parent-workflows)
5. [Guest Checkout](#guest-checkout)
6. [Booking & Payment](#booking--payment)
7. [Child Management](#child-management-1)
8. [Dashboard Features](#dashboard-features)
9. [Reference](#reference-2)

---

## Parent Role Overview

### Role Definition
**Platform Role:** `parent` (Level 2 in permission hierarchy)

**Permission Level:**
```
LEVEL 2: parent
  ├─ Browse published camps
  ├─ Make bookings
  ├─ Manage children profiles
  ├─ View own bookings
  └─ Leave reviews
```

### Dual-Mode Authentication

The platform supports two types of parent users:

| Feature | Authenticated Parent | Guest Parent |
|---------|---------------------|--------------|
| **Account Type** | Full user account with password | Temporary session-based |
| **Profile Link** | `profile_id` references auth.users | `profile_id = NULL` |
| **Dashboard Access** | Full dashboard with history | No dashboard (email-only) |
| **Data Persistence** | Permanent | 90 days (cleanup) |
| **Future Bookings** | Quick rebook | Re-enter info each time |

### Key Capabilities

**Parents Can:**
- ✅ Browse all published camps (status = 'published')
- ✅ Use quiz system for personalized recommendations
- ✅ Book camps for multiple children in single transaction
- ✅ Apply discount codes and early bird pricing
- ✅ Pay via Stripe Checkout
- ✅ Manage children profiles (medical info, emergency contacts)
- ✅ View booking history and upcoming camps
- ✅ Submit reviews and feedback
- ✅ Favorite and share camps

**Parents Cannot:**
- ❌ View unpublished or draft camps
- ❌ Access organizer or admin functions
- ❌ View other parents' data
- ❌ Modify payment records directly
- ❌ Edit camp information

---

## Data Model

### Parents Table Schema

**Files:** `supabase/migrations/20251004102747_create_initial_schema.sql` + `20251017034546_add_guest_checkout_support.sql`

```sql
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication Link (NULL for guests)
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Guest Support
  is_guest BOOLEAN DEFAULT FALSE,
  guest_email TEXT,
  guest_name TEXT,
  guest_phone TEXT,
  guest_session_id TEXT UNIQUE,

  -- Emergency Contact
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,

  -- Address (JSONB)
  address JSONB DEFAULT '{}'::jsonb,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Either authenticated OR guest (not both)
  CONSTRAINT parent_type_check CHECK (
    (profile_id IS NOT NULL AND is_guest = FALSE) OR
    (profile_id IS NULL AND is_guest = TRUE AND
     guest_email IS NOT NULL AND guest_name IS NOT NULL)
  )
);
```

**Guest Session ID Generation:**
```typescript
const guestSessionId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
// Example: guest_1704067200000_a9x2f8k1m
```

### Children Table Schema

```sql
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,

  -- Basic Info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT,
  grade TEXT,

  -- Medical Info
  medical_conditions TEXT,
  allergies TEXT,
  medications TEXT,
  dietary_restrictions TEXT,
  special_needs TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Bookings Table Schema

**File:** `supabase/migrations/009_rename_registrations_to_bookings.sql`

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  camp_id UUID REFERENCES camps(id),
  child_id UUID REFERENCES children(id),
  parent_id UUID REFERENCES parents(id),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed', 'waitlisted', 'cancelled', 'completed'
  )),

  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid', 'partial', 'paid', 'refunded', 'partially_refunded'
  )),

  -- Pricing
  amount_due NUMERIC NOT NULL,
  amount_paid NUMERIC DEFAULT 0,
  discount_code TEXT,
  discount_amount NUMERIC DEFAULT 0,

  -- Stripe
  stripe_checkout_session_id TEXT,

  -- Form Completion
  form_completed BOOLEAN DEFAULT FALSE,
  form_completed_at TIMESTAMPTZ,

  confirmation_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## RLS Policies & Security

### Parents Table Policies

**Authenticated Users:**
```sql
-- Parents can insert own data
CREATE POLICY "Parents can insert own data"
  ON parents FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Parents can view own data
CREATE POLICY "Parents can view own data"
  ON parents FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- Parents can update own data
CREATE POLICY "Parents can update own data"
  ON parents FOR UPDATE TO authenticated
  USING (profile_id = auth.uid());
```

**Guest Users (Anonymous):**
```sql
-- Guest users can create parent records
CREATE POLICY "Guest users can create parent records"
  ON parents FOR INSERT TO anon
  WITH CHECK (
    is_guest = TRUE AND
    profile_id IS NULL AND
    guest_email IS NOT NULL AND
    guest_name IS NOT NULL
  );

-- Guest users can view guest records
CREATE POLICY "Guest users can view guest records"
  ON parents FOR SELECT TO anon
  USING (is_guest = TRUE AND profile_id IS NULL);
```

### Children Table Policies

```sql
-- Parents can view own children
CREATE POLICY "Parents can view own children"
  ON children FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = children.parent_id
      AND parents.profile_id = auth.uid()
    )
  );

-- Guest users can create children
CREATE POLICY "Guest users can create children records"
  ON children FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = children.parent_id
      AND parents.is_guest = TRUE
    )
  );
```

### Data Cleanup Function

```sql
-- Cleanup old guest data (90-day retention)
CREATE FUNCTION cleanup_old_guest_parents()
RETURNS INTEGER AS $$
BEGIN
  DELETE FROM parents
  WHERE is_guest = TRUE
    AND created_at < NOW() - INTERVAL '90 days'
    AND NOT EXISTS (
      SELECT 1 FROM bookings WHERE bookings.parent_id = parents.id
    );
  RETURN ROW_COUNT;
END;
$$ LANGUAGE plpgsql;
```

---

## Parent Workflows

### Complete User Journey

```
DISCOVERY
  ├─ HomePage (featured carousel, categories)
  ├─ Quiz System (8-step personalization)
  │  ├─ Child's name and age
  │  ├─ Parent goals (select 2)
  │  ├─ Interests (select 3)
  │  ├─ Budget range
  │  ├─ Duration preference
  │  ├─ Special needs
  │  └─ Location preference
  │  Result: Top 5 camps with match scores
  └─ Browse Camps (filters by age, category, location)

EVALUATION
  └─ Camp Detail Page
     ├─ Image/video gallery
     ├─ Comprehensive information
     ├─ Reviews and ratings
     ├─ FAQ section
     └─ Booking widget (sticky)

BOOKING
  └─ Registration Page (2 steps)
     Step 1: Booking Details
       ├─ Number of children (1-10)
       ├─ Child details (name, age)
       ├─ Age validation
       └─ Guest checkout option

     Step 2: Review & Pay
       ├─ Discount code application
       ├─ Early bird countdown
       ├─ Price breakdown
       └─ Stripe checkout redirect

PAYMENT
  ├─ Stripe Checkout Session
  ├─ Payment processing
  └─ Webhook updates database

POST-BOOKING
  ├─ Payment Success Page (confetti, confirmation)
  ├─ Child Details Forms (4-step)
  │  ├─ Medical information
  │  ├─ Dietary/special needs
  │  ├─ Emergency contacts
  │  └─ Permissions
  └─ Dashboard (view bookings, manage children)
```

### Quiz Scoring Algorithm

**Service:** `src/services/quizService.ts`

**Weights:**
- Age Match: Hard requirement (0 if not met)
- Category Matching: 70%
- Parent Goals: 40%
- Budget: 50% (full points if in range, partial if 20% over)
- Duration: 50%
- Special Needs: 15%
- Location: Strong bonuses/penalties for nearby preference
- Availability: 5% bonus
- Featured Status: 5% bonus

**Match Labels:**
- Perfect: 80+ score
- Great: 60-79 score
- Good: 30-59 score

**Output:** Top 5 camps ranked by score with match reasons.

---

## Guest Checkout

### Guest vs Authenticated Comparison

| Feature | Authenticated | Guest |
|---------|--------------|-------|
| **Signup Required** | ✅ Email + password | ❌ No account |
| **Session Tracking** | Via auth.users | Via guest_session_id |
| **Dashboard Access** | ✅ Full dashboard | ❌ Email only |
| **Booking History** | ✅ View all | ❌ Confirmations only |
| **Data Retention** | ✅ Permanent | ⏰ 90 days |

### Guest Session Flow

1. No authentication required (anon role)
2. Enter contact info (name, email, phone)
3. System creates parent with `is_guest = TRUE`
4. Unique session ID generated
5. Can create children and bookings
6. Payment via Stripe
7. Email confirmation sent
8. Data retained 90 days

---

## Booking & Payment

### Multi-Child Registration

**Service:** `src/services/registrationService.ts`

**Function:** `createMultiChildRegistration()`

**Process:**
1. Create/verify parent record
2. Loop through children array, create child records
3. Calculate per-child pricing: `totalAmount / children.length`
4. Distribute discount proportionally
5. Create separate booking for each child
6. Link all bookings to same Stripe session
7. Return childIds and bookingIds arrays

**Payment Distribution:**
- Single Stripe transaction for total amount
- Each booking records proportional amount_due
- Webhook processes all bookings together
- Commission calculated on total

### Discount Codes

**Schema:**
```sql
CREATE TABLE discount_codes (
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL,
  min_purchase DECIMAL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  active BOOLEAN DEFAULT TRUE,
  applicable_camps JSONB  -- Array of camp IDs
);
```

**Validation:**
- Date range check
- Usage limit check
- Camp applicability check
- Active status check

**Application:**
```typescript
// Percentage
totalDiscount = (subtotal * value) / 100;

// Fixed amount
totalDiscount = value;

finalAmount = Math.max(0, subtotal - totalDiscount);
```

### Early Bird Pricing

**Database Fields:**
```sql
early_bird_price DECIMAL,
early_bird_deadline DATE
```

**Calculation:**
```typescript
const earlyBirdActive =
  camp.early_bird_price &&
  camp.early_bird_deadline &&
  new Date(camp.early_bird_deadline) > new Date();

const price = earlyBirdActive ?
  camp.early_bird_price :
  camp.price;
```

**UI Features:**
- Countdown timer
- Savings banner
- Price breakdown showing original vs. early bird

### Status Tracking

**Booking Status:**
```
pending → confirmed → completed
           ↓
        cancelled
```

**Payment Status:**
```
unpaid → paid → refunded
          ↓
    partially_refunded
```

**Form Completion:**
```
FALSE (after payment) → TRUE (after child details)
```

---

## Child Management

### Post-Payment Details Collection

**Component:** `src/pages/RegistrationChildDetailsPage.tsx`

**4-Step Form:**

**Step 1: Basic & Medical**
- Date of birth (required)
- Medical conditions
- Allergies
- Current medications

**Step 2: Dietary & Special Needs**
- Dietary restrictions (dropdown)
- Special accommodations

**Step 3: Emergency Contact**
- Contact name (required)
- Contact phone (required, E.164 validation)
- Relationship (required)

**Step 4: Permissions & Notes**
- Photo/video permission (checkbox)
- Additional notes

**Data Updates:**
- Updates `children` table
- Updates `parents` table (emergency contact)
- Creates/updates `registration_forms` table
- Marks booking `form_completed = TRUE`

---

## Dashboard Features

### Parent Dashboard

**Component:** `src/pages/ParentDashboard.tsx`

**Sections:**

**1. Statistics Cards**
- Registered children count + "Add child" link
- Upcoming camps count + "Browse camps" link
- Total registrations (all-time)

**2. Action Required**
- Highlights: `payment_status = 'paid'` AND `form_completed = FALSE`
- Orange/red gradient banner
- Direct "Complete Details" links

**3. My Children Panel**
- List all children (name, age, grade)
- Edit links
- "Add Child" button

**4. Upcoming Camps**
- Criteria: `status = 'confirmed'` AND `start_date > today`
- Shows camp name, dates, location, child name
- Status badges (color-coded)

**5. Past Camps**
- Criteria: `status = 'completed'` OR `end_date < today`
- Historical records
- "Leave Review" button

---

## Reference

### File Locations

**Database Migrations:**
- `supabase/migrations/20251004102747_create_initial_schema.sql` - Core schema
- `supabase/migrations/20251017034546_add_guest_checkout_support.sql` - Guest support
- `supabase/migrations/009_rename_registrations_to_bookings.sql` - Bookings table
- `supabase/migrations/20260108_fix_parents_rls.sql` - Parents RLS
- `supabase/migrations/20260108_fix_children_rls.sql` - Children RLS
- `supabase/migrations/20260125131804_add_direct_charges_support.sql` - Guest session ID

**Frontend Pages:**
- `src/pages/HomePage.tsx` - Landing with carousel, quiz
- `src/pages/CampDetailPage.tsx` - Camp information
- `src/pages/CampRegistrationPage.tsx` - Booking flow
- `src/pages/PaymentSuccessPage.tsx` - Confirmation
- `src/pages/ParentDashboard.tsx` - Dashboard
- `src/pages/RegistrationChildDetailsPage.tsx` - Child details form

**Components:**
- `src/components/quiz/QuizContainer.tsx` - 8-step quiz
- `src/components/home/CampCard.tsx` - Camp card
- `src/components/camps/EnhancedBookingWidget.tsx` - Booking widget

**Services:**
- `src/services/registrationService.ts` - Registration operations
- `src/services/quizService.ts` - Quiz scoring

**Edge Functions:**
- `supabase/functions/create-checkout-session/index.ts` - Stripe checkout
- `supabase/functions/stripe-webhook/index.ts` - Payment webhooks

### Troubleshooting

**Issue: "Cannot create booking"**
- Verify parent record exists: `SELECT * FROM parents WHERE profile_id = auth.uid();`
- Check camp availability and status
- Ensure RLS policies allow INSERT

**Issue: "Guest checkout not working"**
- Verify RLS policy for anon role
- Check constraint: `is_guest = TRUE`, `profile_id = NULL`, guest fields populated

**Issue: "Discount code not applying"**
- Check code is active and within date range
- Verify usage limit not exceeded
- Ensure camp is in applicable_camps array

**Issue: "Cannot see bookings"**
- Verify parent record linked to profile
- Check bookings exist for parent_id
- Verify RLS policy allows SELECT

---

## Summary

This parent role system provides:
- ✅ **Dual Authentication** - Authenticated and guest checkout
- ✅ **Personalized Discovery** - 8-step quiz with intelligent scoring
- ✅ **Multi-Child Booking** - Single transaction for multiple children
- ✅ **Flexible Payment** - Discount codes, early bird pricing, Stripe integration
- ✅ **Comprehensive Profiles** - Medical, dietary, emergency contact info
- ✅ **Dashboard Management** - Booking history, incomplete alerts
- ✅ **Guest Session Security** - Unique session IDs with 90-day retention
- ✅ **Complete Audit Trail** - All bookings and payments tracked

For payment processing details, see the **Platform Payment Architecture** section.
For camp creation and management, see the **Organizer Structure & Role System** section.
