# Quick Test Guide - Invitation System

## 🚀 Quick Start (5 minutes)

### Step 1: Test Edge Function (2 min)

Run the test script to verify email sending works:

```bash
./test-edge-function.sh
```

**What it does**:
- Tests the edge function directly
- Shows you the exact response
- Sends a test email

**Expected result**:
```
✅ SUCCESS! Email sent successfully
```

**If it works**: Check your email inbox for the test invitation!

**If it fails**: See error message and follow troubleshooting steps in the script output.

---

### Step 2: Test via UI (3 min)

1. **Start your app**:
   ```bash
   npm run dev
   ```

2. **Open browser with DevTools**:
   - Press F12 to open DevTools
   - Go to Console tab
   - Keep it open to see logs

3. **Login as super_admin** (use your super admin account)

4. **Navigate**: Admin Dashboard → "Camp Organizer Management"

5. **Create invitation**:
   - Click "Invite Camp Organizer"
   - Enter an email address (your own for testing)
   - Click "Send Invitation"

6. **Watch the console** for these messages:
   ```
   Attempting to send invitation email...
   Edge function response: { emailData: ..., emailError: ... }
   ```

7. **Check the toast notification**:
   - ✅ Success: "Invitation sent successfully! Email sent to..."
   - ⚠️ Warning: "Invite created but email failed to send"
   - ❌ Error: Shows specific error message

---

## 🔍 What to Check

### If Email Sends Successfully ✅

1. **Check your email inbox**
2. **Look for**: Email from "FutureEdge"
3. **Subject**: "You've been invited to join FutureEdge as a Camp Organizer"
4. **Contains**: Blue "Accept Invitation" button
5. **Click the button** to test the signup flow

### If Email Doesn't Send ⚠️

**Check browser console for errors**:

Look for the "Edge function response" log message:

**Success looks like**:
```javascript
{
  emailData: {
    success: true,
    emailId: "abc123...",
    message: "Invitation email sent successfully"
  },
  emailError: null
}
```

**Error looks like**:
```javascript
{
  emailData: null,
  emailError: {
    message: "Some error message",
    ...
  }
}
```

**Common errors and fixes**:

| Error Message | Fix |
|---------------|-----|
| "Email service not configured" | RESEND_API_KEY not set or invalid |
| "Failed to send email" | Check Resend dashboard for API errors |
| "Network error" | Edge function not deployed or unreachable |
| "CORS error" | Edge function CORS configuration issue |

---

## 🐛 Quick Debug Steps

### 1. Verify Secrets ✓

```bash
npx supabase secrets list
```

Should show:
- ✅ `RESEND_API_KEY`
- ✅ `FROM_EMAIL`
- ✅ `APP_URL`

All three are now set!

### 2. Verify Edge Function ✓

```bash
npx supabase functions list
```

Should show:
- ✅ `send-camp-organizer-invite`

Edge function is deployed!

### 3. Check Resend Dashboard

1. Go to https://resend.com
2. Login to your account
3. Click "Logs" in sidebar
4. Look for recent API calls
5. Check if they succeeded or failed

**If no logs appear**: Edge function isn't calling Resend (check API key)
**If logs show errors**: Check the error message

### 4. Check Edge Function Logs

1. Go to [Supabase Functions](https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/functions)
2. Click `send-camp-organizer-invite`
3. Click `Logs` tab
4. Look for recent invocations
5. Check error messages (if any)

---

## 📊 Database Verification

### Check Invites Are Being Created

Go to [Supabase Table Editor](https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/editor)

**Select table**: `camp_organizer_invites`

**Look for**:
- New rows appearing when you create invitations
- Status: `pending`
- Email filled in
- Token populated
- `created_at` recent

**If invites appear in database but emails don't send**:
- Database is working ✓
- Issue is with email sending (check edge function)

**If invites don't appear in database**:
- JavaScript error (check browser console)
- RLS policy issue (check you're logged in as super_admin)
- Network error (check browser network tab)

---

## ✅ Success Checklist

- [ ] Test script sends email successfully
- [ ] UI creates invitation
- [ ] Browser console shows no errors
- [ ] Toast shows "Invitation sent successfully!"
- [ ] Email appears in inbox
- [ ] Database has invite record with status='pending'
- [ ] Can click invite link and see signup page
- [ ] Signup page shows invitation banner
- [ ] Email field is pre-filled and disabled
- [ ] Can complete registration
- [ ] Profile created with camp_organizer role

---

## 🆘 Still Having Issues?

### Option 1: Full Troubleshooting Guide

See [TROUBLESHOOTING_INVITES.md](TROUBLESHOOTING_INVITES.md) for:
- Detailed error messages and solutions
- Step-by-step debugging process
- Common issues and fixes
- Alternative email services

### Option 2: Manual Workaround

While debugging, you can manually share invite links:

1. Create invitation via UI
2. Copy the invite URL from toast message:
   ```
   http://localhost:5173/signup?invite_token=xxxxx
   ```
3. Manually email it to the camp organizer
4. They can still accept and complete registration

### Option 3: Check Logs

**Browser Console**:
- F12 → Console tab
- Look for error messages

**Edge Function Logs**:
- https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/functions
- Click function → Logs tab

**Resend Logs**:
- https://resend.com/logs
- Check for failed API calls

---

## 🎯 Expected Flow

When everything works correctly:

1. **Admin creates invite**
   → Database record created
   → Edge function called
   → Resend API called
   → Email sent

2. **Camp organizer receives email**
   → Clicks "Accept Invitation"
   → Lands on signup page
   → Sees invitation banner
   → Email pre-filled

3. **Camp organizer completes signup**
   → Profile created (role: camp_organizer)
   → Invite marked as accepted
   → Redirected to dashboard

---

## 📞 Next Steps

**If test script works**:
- ✅ Email system is working!
- Test via UI to ensure frontend integration works

**If test script fails**:
- Check Resend API key is valid
- Check Resend account is active
- Check edge function logs for errors
- See [TROUBLESHOOTING_INVITES.md](TROUBLESHOOTING_INVITES.md)

**If UI doesn't send but script works**:
- Check browser console for errors
- Verify you're logged in as super_admin
- Check network tab for failed requests
- Check edge function URL is correct
