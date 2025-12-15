# 🔧 Debugging Summary - Invitation Email Issues

## What We've Done

### ✅ Completed
1. **Added detailed logging** to invitation creation
   - Now logs edge function requests
   - Now logs edge function responses
   - Shows detailed error messages in toast notifications

2. **Set all required secrets**:
   - ✅ `RESEND_API_KEY` (you already set this)
   - ✅ `FROM_EMAIL` (just set to default)
   - ✅ `APP_URL` (just set to localhost)

3. **Created debugging tools**:
   - `test-edge-function.sh` - Test email sending directly
   - `TROUBLESHOOTING_INVITES.md` - Comprehensive troubleshooting guide
   - `QUICK_TEST_GUIDE.md` - Step-by-step testing instructions

---

## 🎯 What to Do Right Now

### Step 1: Test Edge Function (MOST IMPORTANT)

Run this command to test if email sending works:

```bash
./test-edge-function.sh
```

**This will tell you**:
- ✅ If Resend is configured correctly
- ✅ If emails are actually sending
- ❌ Exact error if something is wrong

### Step 2: Check Browser Console

1. Open your app: `npm run dev`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Login as super_admin
5. Try creating an invitation
6. **Look for these log messages**:

```javascript
// When you click "Send Invitation":
Attempting to send invitation email... {
  email: "...",
  inviterName: "...",
  token: "..."
}

// After edge function responds:
Edge function response: {
  emailData: { ... },
  emailError: { ... }
}
```

**What to check**:
- If `emailError` is NOT null → There's an error (see the error message)
- If `emailData.success` is true → Email sent successfully! ✅
- If `emailData.success` is false → Email failed (check emailData.error)

---

## 🐛 Common Issues and Quick Fixes

### Issue 1: "Email service not configured"

**Cause**: Edge function can't access RESEND_API_KEY

**Fix**:
```bash
# Check if secret is set
npx supabase secrets list | grep RESEND

# If missing or wrong, set it again
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Redeploy edge function
npx supabase functions deploy send-camp-organizer-invite
```

### Issue 2: "Failed to send email" from Resend

**Cause**: Invalid API key or Resend account issue

**Fix**:
1. Login to https://resend.com
2. Go to API Keys
3. Verify key is active (green status)
4. If revoked/invalid, create a new key
5. Update in Supabase:
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_your_new_key
   ```

### Issue 3: Invite created but no email (no error)

**Cause**: Edge function failing silently

**Fix**:
1. Check edge function logs:
   - Go to https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/functions
   - Click `send-camp-organizer-invite`
   - Click `Logs` tab

2. Look for error messages

3. Common issues:
   - Missing environment variables
   - Resend API rate limit
   - Invalid FROM_EMAIL domain

### Issue 4: No database record created

**Cause**: JavaScript error before database insert

**Fix**:
1. Check browser console for errors
2. Verify you're logged in as super_admin
3. Check network tab for failed API calls

---

## 📋 Checklist for Debugging

Go through this in order:

### Database Layer ✅
- [ ] Migration 007 applied (check Supabase table editor)
- [ ] Migration 008 applied (organisation_id nullable)
- [ ] Can see `camp_organizer_invites` table
- [ ] Creating invite creates database record

### Edge Function Layer
- [ ] Edge function deployed: `npx supabase functions list`
- [ ] RESEND_API_KEY set: `npx supabase secrets list`
- [ ] Test script succeeds: `./test-edge-function.sh`
- [ ] Edge function logs show no errors

### Frontend Layer
- [ ] Browser console shows no errors
- [ ] See "Attempting to send invitation email..." log
- [ ] See "Edge function response..." log
- [ ] Toast notification shows appropriate message

### Email Delivery Layer
- [ ] Resend account active
- [ ] API key valid (check Resend dashboard)
- [ ] Email appears in Resend logs
- [ ] Email received in inbox (check spam too!)

---

## 🔍 Diagnostic Flow

```
1. Run test script
   └─ Success? → Go to step 2
   └─ Fail? → Fix edge function/Resend (see TROUBLESHOOTING_INVITES.md)

2. Test via UI with console open
   └─ Invite created in DB? → Yes, go to step 3
   └─ No DB record? → Frontend error (check console)

3. Check console logs
   └─ Edge function called? → Yes, go to step 4
   └─ Not called? → Check code/network

4. Check edge function response
   └─ emailData.success = true? → ✅ Working! Check email
   └─ emailError present? → See error message, fix issue
   └─ No response? → Edge function crashed, check logs

5. Check email inbox
   └─ Email received? → ✅ COMPLETE! System working
   └─ Not received? → Check spam, check Resend logs
```

---

## 📞 Support Resources

### Documentation Created
1. **[QUICK_TEST_GUIDE.md](QUICK_TEST_GUIDE.md)** - Start here for testing
2. **[TROUBLESHOOTING_INVITES.md](TROUBLESHOOTING_INVITES.md)** - Comprehensive troubleshooting
3. **[DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md)** - What was deployed
4. **[CAMP_ORGANIZER_INVITE_UPDATES.md](CAMP_ORGANIZER_INVITE_UPDATES.md)** - All code changes

### Tools Created
1. **`./test-edge-function.sh`** - Test email sending directly
2. **Enhanced logging** - Browser console shows detailed info

### External Resources
- **Resend Dashboard**: https://resend.com
- **Supabase Functions**: https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/functions
- **Supabase Tables**: https://supabase.com/dashboard/project/jkfbqimwhjukrmgjsxrj/editor

---

## 🎯 Next Actions

### Immediate (Do This Now)
1. Run: `./test-edge-function.sh`
2. Check result
3. If success → Test via UI
4. If fail → Check error message and follow fix

### If Test Script Works
✅ Email system is working!

**Then**:
1. Test via UI with browser console open
2. Look for any frontend errors
3. Verify complete flow works

### If Test Script Fails
❌ Issue with edge function or Resend

**Then**:
1. Check error message from script
2. Go to [TROUBLESHOOTING_INVITES.md](TROUBLESHOOTING_INVITES.md)
3. Find your error in "Common Errors" section
4. Follow the fix steps

---

## 💡 Quick Win

**Test immediately with one command**:

```bash
# This will test everything end-to-end
./test-edge-function.sh

# Enter your email when prompted
# Check your inbox for the test invitation
```

**If you get the email**: System works! 🎉
**If you don't**: Check the error message and follow the troubleshooting guide.

---

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Database | ✅ Working | Migrations applied, types regenerated |
| Edge Function | ✅ Deployed | Function deployed and accessible |
| Secrets | ✅ Set | RESEND_API_KEY, FROM_EMAIL, APP_URL all set |
| Frontend | ✅ Updated | Enhanced logging and error messages |
| Email Service | ⚠️ Unknown | Need to test with script |

**Next**: Run `./test-edge-function.sh` to verify email service! 🚀
