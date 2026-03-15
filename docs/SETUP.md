# Setup Guide

## Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project (database is already provisioned)
- Git

---

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd <project-directory>
npm install
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

```env
# Required
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Required for payments
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional — AI voice advisor
VITE_VAPI_PUBLIC_KEY=your-vapi-key
```

**Where to find these values:**

| Variable | Location |
|---|---|
| `VITE_SUPABASE_URL` | Supabase Dashboard > Settings > API > Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API > anon public key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard > Developers > API Keys |
| `VITE_VAPI_PUBLIC_KEY` | Vapi Dashboard > Settings > API Keys |

### 3. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables Reference

### Frontend (Client-Side)

These variables are prefixed with `VITE_` and are exposed to the browser. Do not put secrets here.

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project API URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public (anon) key — safe to expose |
| `VITE_STRIPE_PUBLISHABLE_KEY` | For payments | Stripe publishable key (starts with `pk_`) |
| `VITE_VAPI_PUBLIC_KEY` | For AI advisor | Vapi public API key |
| `VITE_DEBUG` | No | Set to `true` for verbose logging |

### Backend (Edge Function Secrets)

These are set as Supabase Edge Function secrets — never in `.env`. They are not accessible client-side.

| Variable | Required | Description |
|---|---|---|
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | For payments | Stripe webhook signing secret |
| `RESEND_API_KEY` | For emails | Resend API key |
| `FROM_EMAIL` | For emails | Sender address (e.g. `FutureEdge <noreply@yourdomain.com>`) |
| `APP_URL` | For emails | App base URL for links in emails |

---

## Setting Up Supabase Edge Function Secrets

Supabase secrets are configured per-project and injected into Edge Functions at runtime.

> Note: The Supabase CLI is not supported in this environment. Secrets are managed via the Supabase Dashboard or MCP tools.

To set secrets via the Supabase Dashboard:
1. Go to your Supabase project
2. Navigate to **Edge Functions** > **Secrets**
3. Add each secret as a key-value pair

---

## Setting Up Stripe

### Development (Test Mode)

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your test API keys from **Developers > API Keys**
3. Add `pk_test_...` to `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`
4. Add `sk_test_...` as `STRIPE_SECRET_KEY` in Supabase secrets

### Stripe Connect (For Organizer Payouts)

The platform uses Stripe Connect to split payments between the platform and organizers.

1. Enable Stripe Connect in your Stripe Dashboard under **Connect > Settings**
2. Configure the Express account type
3. Set the platform's Connect application fee percentage (the platform takes this as commission)

### Webhook Configuration

For payment events to be processed:

1. In Stripe Dashboard, go to **Developers > Webhooks**
2. Add endpoint: `https://<supabase-project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Select events: `checkout.session.completed`, `charge.succeeded`, `charge.refunded`, `account.updated`
4. Copy the webhook signing secret and add it as `STRIPE_WEBHOOK_SECRET` in Supabase secrets

For local development, use the Stripe CLI to forward webhooks:
```bash
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook
```

---

## Setting Up Resend (Email)

1. Create a Resend account at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Create an API key from the Resend dashboard
4. Set in Supabase secrets:
   - `RESEND_API_KEY` = your API key
   - `FROM_EMAIL` = `Your Name <noreply@yourdomain.com>`
   - `APP_URL` = `https://your-app-domain.com`

---

## Setting Up Vapi (AI Advisor)

The `/talk-to-advisor` page uses Vapi for voice AI conversations.

1. Create a Vapi account at [vapi.ai](https://vapi.ai)
2. Create an AI assistant and configure it with camp discovery prompts
3. Copy the Public Key from **Settings > API Keys**
4. Copy the Assistant ID from your assistant configuration
5. Add to `.env`:
   ```env
   VITE_VAPI_PUBLIC_KEY=your-public-key
   ```
6. Update `src/hooks/useVapi.ts` with your assistant ID

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run export-camps` | Export camps data to CSV |
| `npm run video:studio` | Open Remotion video studio |
| `npm run video:render` | Render marketing video to MP4 |
| `npm run video:preview` | Preview video composition |

---

## TypeScript

The project uses strict TypeScript. Run type checking with:

```bash
npm run typecheck
```

Database types are generated from the Supabase schema and stored in `src/lib/database.types.ts`. When the database schema changes, regenerate this file using the Supabase CLI:

```bash
supabase gen types typescript --project-id <project-ref> > src/lib/database.types.ts
```

---

## Production Deployment

The frontend can be deployed to any static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.).

### Build

```bash
npm run build
```

Output goes to `dist/`. Deploy this directory.

### Environment Variables

Set all `VITE_` prefixed variables in your hosting provider's environment configuration.

### Supabase Edge Functions

Edge Functions are already deployed to Supabase. When making changes, deploy using the Supabase MCP tools or Dashboard.

### Domain Configuration

1. Set `APP_URL` in Supabase secrets to your production domain
2. Configure Stripe webhook endpoint to point to production Supabase URL
3. Configure Stripe Connect redirect URLs to your production domain

---

## Project Configuration Files

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite bundler configuration |
| `tailwind.config.js` | Tailwind CSS theme and plugin config |
| `postcss.config.js` | PostCSS configuration |
| `tsconfig.json` | TypeScript base configuration |
| `tsconfig.app.json` | App-specific TypeScript config |
| `tsconfig.node.json` | Node scripts TypeScript config |
| `eslint.config.js` | ESLint rules |
| `.env.example` | Example environment variables (copy to `.env`) |
| `.gitignore` | Git ignore rules (`.env` is excluded) |
