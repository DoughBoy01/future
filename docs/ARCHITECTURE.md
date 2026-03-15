# Architecture

## Overview

FutureEdge uses a modern client-server architecture built on React (frontend) and Supabase (backend). All server-side business logic runs in Supabase Edge Functions (Deno runtime). The database is PostgreSQL with Row Level Security enforced at the database layer.

---

## Frontend Architecture

### Entry Point

```
src/main.tsx          → App bootstrap, providers
src/App.tsx           → Route definitions, protected routes
src/index.css         → Global styles
```

### Routing

React Router DOM v7 manages all client-side routing. Routes are structured into four groups:

1. **Public routes** — No authentication required
2. **Parent routes** — Requires `ProtectedRoute` (any authenticated user)
3. **Camp Organizer routes** — Requires `ProtectedRoute` + `RoleBasedRoute(['camp_organizer'])`
4. **Admin routes** — Requires `ProtectedRoute` + `RoleBasedRoute([...admin roles])`

The `ProtectedRoute` component redirects unauthenticated users to `/auth`. The `RoleBasedRoute` component checks the user's role from `AuthContext` and blocks access if the role is not allowed.

Admin routes (`/admin/*`) suppress the `Navbar` and `Footer` — the admin dashboard uses its own `DashboardLayout` component.

### State Management

Global state is managed with two React Context providers:

| Context | Purpose | Key Values |
|---|---|---|
| `AuthContext` | Authentication state, user profile, organization | `user`, `profile`, `organization`, `session`, `loading` |
| `UserViewContext` | View mode for multi-role users | `currentView`, `canSwitchView`, `setView` |

All other state is local to components or managed via custom hooks.

### Custom Hooks

| Hook | Purpose |
|---|---|
| `useAuth()` | Access `AuthContext` |
| `usePermissions()` | Check fine-grained RBAC permissions with caching |
| `useCommissionRate(orgId?)` | Fetch commission rates with system default fallback |
| `usePromotionalOffer()` | Access active promotional offers |
| `useVapi()` | Vapi AI conversation state and controls |

### Service Layer

Business logic is abstracted into service modules in `src/services/`. Components call services rather than querying Supabase directly. This keeps components focused on rendering and separates data concerns.

| Service | Responsibility |
|---|---|
| `registrationService` | Create, update, validate registrations and bookings |
| `stripeService` | Create checkout sessions, verify payments |
| `commissionService` | Calculate and record commissions |
| `commissionRateService` | Fetch and update commission rate configurations |
| `payoutService` | Calculate and schedule payouts to organizers |
| `permissionService` | Check user permissions against RBAC table (with 5-min TTL cache) |
| `onboardingService` | Track organizer onboarding progress and steps |
| `quizService` | Score camps against quiz responses, generate recommendations |
| `quizAnalyticsService` | Track quiz engagement and completion metrics |
| `promotionalOfferService` | Fetch and apply promotional offers |
| `systemSettingsService` | Read/write platform-wide configuration values |
| `dataManagementService` | Bulk import/export operations |
| `approvalWorkflowService` | Create and resolve camp approval workflows |
| `campStatusService` | Manage camp publish/unpublish lifecycle |
| `importExportService` | CSV/JSON data transformation and validation |
| `versionControlService` | Content version tracking |

---

## Backend Architecture

### Supabase

Supabase provides:
- **PostgreSQL database** with PostGIS (for potential geo queries)
- **Auth** via GoTrue (email/password sessions)
- **Edge Functions** (Deno runtime) for server-side logic
- **Storage** for camp images and media
- **Real-time** subscriptions (available but limited usage in current codebase)

### Database Access Patterns

The frontend uses `@supabase/supabase-js` to query the database directly for standard CRUD operations. Row Level Security (RLS) policies enforce access control at the database level, so the frontend cannot access data it is not permitted to see regardless of client-side code.

Privileged operations (Stripe, email, payout processing) always go through Edge Functions using the service role key, which bypasses RLS.

### Edge Functions

All Edge Functions are deployed to Supabase and run in the Deno runtime. They handle:
- Payment processing via Stripe API
- Email delivery via Resend
- Payout calculations
- Privileged database operations requiring service role access

See [API & Edge Functions](./API.md) for full details.

---

## Security Architecture

### Row Level Security (RLS)

Every table has RLS enabled. Policies enforce:
- Parents can only access their own data
- Organizers can only access their organization's data
- Admin roles have broader access scoped by role
- Unauthenticated users can only read published public data (camps, categories)

Policies use `auth.uid()` to identify the current user and never use `USING (true)` for protected tables.

### Role-Based Access Control (RBAC)

A fine-grained permission system lives in `permissions` and `role_permissions` tables. The `has_permission(user_id, permission_name)` RPC function checks permissions. This is used for sub-role access control within the admin area.

### Authentication

- Supabase Auth handles session management
- Sessions are stored in `localStorage` and auto-refreshed
- Password reset sends an email link to `/reset-password`
- `onAuthStateChange` listeners use async IIFE pattern to avoid deadlocks

### Secrets

- All secrets and API keys are stored as Supabase Edge Function secrets
- No secrets are exposed in client-side code
- `VITE_` prefixed variables are public (Supabase URL, anon key, Stripe publishable key, Vapi public key)

---

## Data Flow Diagrams

### Registration / Payment Flow

```
Parent selects camp
        ↓
CampRegistrationPage builds registration form
        ↓
registrationService.createRegistration() → inserts pending record to DB
        ↓
stripeService.createCheckoutSession() → calls Edge Function
        ↓
create-checkout-session Edge Function
  → validates camp, organizer Stripe account
  → creates Stripe Checkout Session with application fee (commission)
  → returns checkout URL
        ↓
Browser redirects to Stripe Checkout
        ↓
User completes payment on Stripe
        ↓
stripe-webhook Edge Function receives checkout.session.completed
  → updates registration status to 'confirmed'
  → creates payment_record
  → creates commission_record
  → queues booking confirmation email
        ↓
Browser redirects to /payment-success
```

### Camp Approval Flow

```
Organizer creates/submits camp (status: 'pending_review')
        ↓
approvalWorkflowService creates approval request in DB
        ↓
Admin sees pending camp in /admin/dashboard/camps
        ↓
Admin reviews and approves → camp status → 'approved'
OR Admin requests changes → camp status → 'requires_changes'
OR Admin rejects → camp status → 'rejected'
        ↓
Organizer sees updated status in organizer dashboard
```

### Organizer Onboarding Flow

```
New user registers with camp_organizer role
        ↓
/onboarding/welcome → Introduction
        ↓
/onboarding/organization → Create org profile
        ↓
/onboarding/first-camp → Camp creation wizard
        ↓
/onboarding/stripe-connect → Connect Stripe account
        ↓
/organizer-dashboard → Ongoing dashboard
```

---

## Component Organization Principles

- **Single Responsibility:** Each component has one clear purpose
- **Composition:** Complex UIs built from small focused components
- **Colocation:** Related sub-components live in the same directory
- **No Global State for UI:** UI state is local to components
- **Services for Data:** Components don't embed raw Supabase queries (except simple ones)
- **Progressive Disclosure:** Secondary actions appear in modals and drawers

---

## Internationalization

The platform uses `i18next` with `i18next-http-backend` for translation file loading and `i18next-browser-languagedetector` for automatic locale detection.

Translation files live in `public/locales/{lang}/`:
- `common.json` — Shared UI strings
- `camps.json` — Camp-specific strings

Supported languages: English (`en`), Spanish (`es`), Japanese (`ja`), Chinese (`zh`)

---

## Video Generation

The `src/remotion/` folder contains a marketing video composition built with Remotion. It renders a promotional video for camp owners with five scenes (Hero, Money/Revenue, Paperwork, Benefits, CTA). This is a separate build pipeline and is not part of the main web app bundle.

Commands:
```bash
npm run video:studio    # Open Remotion Studio
npm run video:render    # Render to MP4
npm run video:preview   # Preview composition
```
