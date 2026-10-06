#!/usr/bin/env bash
# Stripe key setup for the FutureEdge Worker.
#   npm run stripe:setup   store your Stripe keys as Cloudflare secrets (you type them; nothing is echoed or logged)
#   npm run stripe:check   report whether the live site can take payments
set -euo pipefail
cd "$(dirname "$0")/.."

SITE="${SITE_URL:-https://futureedge.pm2120600.workers.dev}"

put_secret() { # name, prompt, required
  local name="$1" prompt="$2" required="$3" value
  read -r -s -p "$prompt" value; echo
  if [[ -z "$value" ]]; then
    [[ "$required" == "required" ]] && { echo "  Skipped $name, but it is required."; return 1; }
    echo "  Skipped $name."; return 0
  fi
  printf '%s' "$value" | npx wrangler secret put "$name" >/dev/null && echo "  ✓ $name saved"
}

case "${1:-}" in
  setup)
    cat <<'MSG'
Stripe setup (test mode first). You will need, from https://dashboard.stripe.com/test/apikeys :
  • Secret key            sk_test_…   (or rk_test_… for a restricted key)
and from https://dashboard.stripe.com/test/webhooks , after adding an endpoint for
  <your site>/api/stripe/webhook  (events are listed in STRIPE_SETUP.md):
  • Signing secret        whsec_…
Input is hidden. Press Enter to skip an optional one.

MSG
    put_secret STRIPE_SECRET_KEY "Secret key: " required
    put_secret STRIPE_WEBHOOK_SECRET "Webhook signing secret: " required
    put_secret STRIPE_CONNECT_WEBHOOK_SECRET "Connect webhook signing secret (optional, for organizer payouts): " optional
    echo; echo "Done. Verify with:  npm run stripe:check"
    ;;
  check)
    config=$(curl -fsS "$SITE/api/config") || { echo "Could not reach $SITE"; exit 1; }
    code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$SITE/api/stripe/webhook" -H 'content-type: application/json' -d '{}')
    [[ "$config" == *'"paymentsEnabled":true'* ]] && echo "  ✓ Secret key is set" || echo "  ✗ Secret key missing  → npm run stripe:setup"
    case "$code" in
      400) echo "  ✓ Webhook is live and rejecting unsigned requests" ;;
      503) echo "  ✗ Webhook secret missing  → npm run stripe:setup" ;;
      *)   echo "  ? Webhook returned HTTP $code" ;;
    esac
    ;;
  *) echo "usage: $0 setup|check"; exit 2 ;;
esac
