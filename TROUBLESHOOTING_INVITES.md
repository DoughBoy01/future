# Troubleshooting Camp Organizer Invites

## Issue 1: Invitation Email Not Sending

### Current Status ✅
- **RESEND_API_KEY**: Set in Supabase ✓
- **Edge Function**: Deployed ✓
- **Database**: Migrations applied ✓

### Diagnostic Steps

#### Step 1: Check Secrets Configuration

```bash
npx supabase secrets list
```

**Should show**:
- ✅ `RESEND_API_KEY` (required)
- ⚠️  `FROM_EMAIL` (optional, but recommended)
- ⚠️  `APP_URL` (optional, but recommended)

**If missing FROM_EMAIL or APP_URL**:
```bash
npx supabase secrets set FROM_EMAIL="FutureEdge <noreply@yourdomain.com>"
npx supabase secrets set APP_URL=https://yourapp.com
```

#### Step 2: Test Edge Function Directly

Run the test script:
```bash
./test-edge-function.sh
```

This will:
1. Call the edge function directly
2. Show you the exact error if any
3. Confirm if Resend is working

**Expected Output**:
```json
{
  "success": true,
  "emailId": "...",
  "message": "Invitation email sent successfully"
}
```

**If you see an error**:
- Check the error message in the response
- Look at common errors below

#### Step 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Create an invitation
4. Look for these log messages:
   ```
   Attempting to send invitation email...
   Edge function response: { emailData: ..., emailError: ... }
   ```

**What to look for**:
- If `emailError` is present: There's an error calling the edge function
- If `emailData.success` is false: Edge function ran but email failed to send
- Check the error message for details

#### Step 4: Check Edge Function Logs

1. Go to [Supabase Dashboard - Functions](https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/functions)
2. Click on `send-camp-organizer-invite`
3. Click `Logs` tab
4. Look for recent invocations
5. Check for error messages

---

## Issue 2: Invitation Not Being Tracked

### Check Database Records

Go to [Supabase Dashboard - Table Editor](https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/editor)

**Check `camp_organizer_invites` table**:
```sql
SELECT email, status, created_at, token
FROM camp_organizer_invites
ORDER BY created_at DESC
LIMIT 10;
```

**Expected**:
- New rows should appear when you create invitations
- Status should be 'pending'
- Token should be populated

**If no rows appear**:
- Check browser console for JavaScript errors
- Check if the insert is failing
- Verify you're logged in as super_admin

---

## Common Errors and Solutions

### Error: "Email service not configured"

**Cause**: `RESEND_API_KEY` not set or edge function can't access it

**Solution**:
```bash
# Verify secret is set
npx supabase secrets list

# If missing, set it
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Redeploy edge function
npx supabase functions deploy send-camp-organizer-invite
```

### Error: "Failed to send email" (from Resend API)

**Possible causes**:
1. **Invalid API Key**: Check Resend dashboard, regenerate if needed
2. **Domain not verified**: If using custom FROM_EMAIL
3. **Rate limit exceeded**: Free tier has daily limits

**Solutions**:

**1. Verify API Key**:
- Login to https://resend.com
- Go to API Keys
- Check key is active (not revoked)
- Copy key and re-set in Supabase:
  ```bash
  npx supabase secrets set RESEND_API_KEY=re_your_new_key
  ```

**2. Verify Domain** (if using custom FROM_EMAIL):
- Go to Resend Dashboard → Domains
- Add your domain
- Add DNS records as shown
- Wait for verification (5-10 minutes)

**3. Check Rate Limits**:
- Resend free tier: 3,000 emails/month, 100/day
- Check Resend dashboard for usage
- If exceeded, upgrade or wait for reset

### Error: "CORS error" or "Network error"

**Cause**: Edge function not accessible or CORS issue

**Solution**:
1. Check edge function is deployed:
   ```bash
   npx supabase functions list
   ```
   Should show `send-camp-organizer-invite`

2. Redeploy if needed:
   ```bash
   npx supabase functions deploy send-camp-organizer-invite
   ```

### Error: Invite created but no email sent (no error shown)

**Cause**: Edge function failing silently or returning non-standard response

**Solution**:
1. Check browser console for detailed logs
2. Run test script to see exact response:
   ```bash
   ./test-edge-function.sh
   ```
3. Check edge function logs in Supabase dashboard

---

## Quick Verification Checklist

Run through this checklist:

- [ ] **Resend API Key**:
  ```bash
  npx supabase secrets list | grep RESEND
  ```
  Should show RESEND_API_KEY ✅

- [ ] **Resend Account Active**:
  Login to https://resend.com and verify account is active

- [ ] **Edge Function Deployed**:
  ```bash
  npx supabase functions list
  ```
  Should show `send-camp-organizer-invite` ✅

- [ ] **Database Migration Applied**:
  Check `camp_organizer_invites` table exists in Supabase Dashboard

- [ ] **Browser Console**:
  Check for JavaScript errors when creating invite

- [ ] **Test Email**:
  Run `./test-edge-function.sh` and verify you receive the email

---

## Step-by-Step Debug Process

### 1. Test with Script (Fastest)

```bash
./test-edge-function.sh
```

Enter your email when prompted. This bypasses the UI and tests the edge function directly.

**If this works**: Issue is in the frontend code
**If this fails**: Issue is in edge function or Resend configuration

### 2. Check Resend Dashboard

1. Login to https://resend.com
2. Go to "Logs" section
3. Check if API calls are being made
4. Check if they're succeeding or failing

**If no logs appear**: Edge function isn't reaching Resend (check API key)
**If logs show errors**: Check error message for details

### 3. Check Supabase Logs

1. Go to [Functions Dashboard](https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/functions)
2. Click `send-camp-organizer-invite`
3. Click `Logs` tab
4. Look for recent invocations
5. Check error messages

### 4. Test in Browser with Console Open

1. Open browser DevTools (F12)
2. Go to Console tab
3. Create invitation
4. Watch for log messages:
   - "Attempting to send invitation email..."
   - "Edge function response: ..."

**What to look for**:
```javascript
// Success:
{
  emailData: { success: true, emailId: "...", message: "..." },
  emailError: null
}

// Error:
{
  emailData: null,
  emailError: { message: "...", ... }
}
```

---

## Still Not Working?

### Get Detailed Logs

1. **Add more logging to edge function** (temporary):
   Edit `supabase/functions/send-camp-organizer-invite/index.ts`

   Add at the top of the serve function:
   ```typescript
   console.log('Function invoked with:', await req.json());
   ```

2. **Redeploy**:
   ```bash
   npx supabase functions deploy send-camp-organizer-invite
   ```

3. **Test again** and check logs in Supabase dashboard

### Alternative: Use Alternative Email Service

If Resend continues to have issues, you can switch to another service:

**SendGrid**:
- Sign up at https://sendgrid.com
- Get API key
- Update edge function code (see edge function README)

**Mailgun**:
- Sign up at https://mailgun.com
- Get API key
- Update edge function code

---

## Temporary Workaround

While debugging, you can manually share invite links:

1. Create invitation (database record will be created)
2. Copy the invite URL from the toast message
3. Manually email the link to the camp organizer
4. They can still accept the invitation

The invite link format:
```
https://yourapp.com/signup?invite_token=xxxxxxxxxxxxx
```

---

## Contact Support

If none of the above works:

1. **Resend Support**: support@resend.com (for email delivery issues)
2. **Supabase Support**: Via Supabase dashboard support chat (for edge function issues)

**When contacting support, include**:
- Error messages from browser console
- Error messages from edge function logs
- Test script output
- Steps you've already tried
