# Send Camp Organizer Invite Edge Function

This Supabase Edge Function sends invitation emails to camp organizers using Resend email service.

## Setup

### 1. Install Resend

Sign up for a free account at [resend.com](https://resend.com) and get your API key.

### 2. Set Environment Variables

In your Supabase project dashboard:

1. Go to **Settings** → **Edge Functions**
2. Add the following secrets:

```bash
# Required
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Optional (defaults shown)
FROM_EMAIL=FutureEdge <noreply@futureedge.com>
APP_URL=https://yourapp.com
```

Or set them locally for development:

```bash
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
npx supabase secrets set FROM_EMAIL="FutureEdge <noreply@futureedge.com>"
npx supabase secrets set APP_URL=http://localhost:5173
```

### 3. Deploy the Function

```bash
npx supabase functions deploy send-camp-organizer-invite
```

### 4. Test Locally

```bash
# Start Supabase local development
npx supabase start

# Serve the function locally
npx supabase functions serve send-camp-organizer-invite --env-file supabase/.env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/send-camp-organizer-invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "email": "test@example.com",
    "token": "abc123def456",
    "inviterName": "John Doe",
    "organisationName": "Test School"
  }'
```

## Usage

### From Frontend

Call the edge function after creating an invite:

```typescript
const { data, error } = await supabase.functions.invoke('send-camp-organizer-invite', {
  body: {
    email: 'organizer@example.com',
    token: 'generated-secure-token',
    inviterName: 'Admin Name',
    organisationName: 'School Name' // Optional
  }
});

if (error) {
  console.error('Failed to send invitation email:', error);
} else {
  console.log('Invitation email sent:', data);
}
```

## Email Template

The invitation email includes:
- ✅ Personalized greeting with inviter name
- ✅ Organisation name (if provided)
- ✅ Clear call-to-action button
- ✅ Backup link to copy/paste
- ✅ Expiry reminder (7 days)
- ✅ Professional FutureEdge branding

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Yes | - | Your Resend API key |
| `FROM_EMAIL` | No | `FutureEdge <noreply@futureedge.com>` | Sender email address |
| `APP_URL` | No | `http://localhost:5173` | Your app's base URL for generating invite links |

## Error Handling

The function returns appropriate HTTP status codes:

- **200**: Email sent successfully
- **400**: Missing required fields (email, token, inviterName)
- **500**: Email service error or internal server error

## Security

- ✅ CORS headers configured for cross-origin requests
- ✅ Validates all required fields
- ✅ Uses secure HTTPS for Resend API
- ✅ API keys stored as environment secrets
- ✅ No sensitive data logged

## Resend Free Tier

Resend's free tier includes:
- 3,000 emails per month
- 100 emails per day
- No credit card required

Perfect for development and moderate production use.

## Alternative Email Services

To use a different email service (SendGrid, Mailgun, etc.), modify the fetch request in `index.ts` to match your provider's API.

## Troubleshooting

### Email not sending
1. Check Resend API key is set correctly
2. Verify FROM_EMAIL domain is verified in Resend
3. Check function logs: `npx supabase functions logs send-camp-organizer-invite`

### Invite link incorrect
1. Verify APP_URL environment variable is set
2. Check that invite token is being passed correctly

### CORS errors
The function includes CORS headers for all origins. If you need to restrict this, modify the `corsHeaders` object in `index.ts`.
