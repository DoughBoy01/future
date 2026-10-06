# Stripe setup

Payments run in the Cloudflare Worker (`/api/bookings`, `/api/stripe/webhook`). Until the keys below
exist, booking returns "Online payments are not available yet" and nothing breaks.

You add the keys yourself; they never need to be shared with anyone.

## 1. Get your test keys
1. Stripe Dashboard → toggle **Test mode** → **Developers → API keys**.
2. Copy the **Secret key** (`sk_test_…`).

## 2. Add the webhook
Stripe Dashboard → **Developers → Webhooks → Add endpoint**

- **URL:** `https://futureedge.pm2120600.workers.dev/api/stripe/webhook`
- **Events:**
  `checkout.session.completed`, `checkout.session.expired`,
  `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`,
  `charge.refunded`
- Copy the endpoint's **Signing secret** (`whsec_…`).

## 3. Store the keys as Cloudflare secrets
```bash
npm run stripe:setup     # prompts for each key; input is hidden
npm run stripe:check     # confirms the live site is ready
```

## 4. Try it
Open a camp → **Reserve** → pay with card `4242 4242 4242 4242`, any future expiry, any CVC.
The booking confirms through the webhook and the camp's places are taken.

## Organisers paid directly (Stripe Connect) — later
Add a second endpoint with the same URL, choose **Listen to events on Connected accounts**, and store its
signing secret as `STRIPE_CONNECT_WEBHOOK_SECRET` (`npm run stripe:setup` asks for it). Organisations without a
connected account are charged on the platform account, with the commission recorded as `owed_to_organisation`.

## Local development
```bash
stripe listen --forward-to localhost:8787/api/stripe/webhook   # prints a whsec_… for local use
```
Put `STRIPE_SECRET_KEY` and that `STRIPE_WEBHOOK_SECRET` in `.dev.vars` (see `.dev.vars.example`).

## Going live
Repeat steps 1–3 with live-mode values. Nothing in the code changes.

## Tests (no keys needed)
`npm run test:payments` runs the whole flow against a fake Stripe: pricing, discounts, forged and replayed
webhooks, capacity, expiry and Connect fees.
