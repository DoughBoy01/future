# Camp Organizer Invite System - Updates

## Changes Made

Based on your feedback, I've made the following improvements to the camp organizer invite system:

### 1. ✅ Navigation - Added to Admin Dashboard

**Problem**: Camp Organizer Management was only accessible via direct URL `/admin/camp-organizers`

**Solution**: Added a link in the main admin dashboard's "Quick Actions" section

**Files Changed**:
- [src/pages/admin/DashboardOverview.tsx](src/pages/admin/DashboardOverview.tsx)

**What Changed**:
- Added "Camp Organizer Management" link to Quick Actions (visible only to super_admin)
- Link appears alongside "Role Management" and "Data Management"
- Uses purple color scheme to differentiate from other admin actions

---

### 2. ✅ Organisation Association - Made Optional

**Problem**: Invite form required selecting an existing school/organisation

**Solution**: Made organisation_id optional - camp organizers will create their own organisation during onboarding

**Files Changed**:
- [supabase/migrations/007_add_camp_organizer_invites.sql](supabase/migrations/007_add_camp_organizer_invites.sql)
- [src/pages/admin/CampOrganizerManagement.tsx](src/pages/admin/CampOrganizerManagement.tsx)
- [src/components/auth/SignupForm.tsx](src/components/auth/SignupForm.tsx)

**What Changed**:

**Database Migration (007)**:
- Changed `organisation_id` from `NOT NULL` to nullable
- Updated `validate_invite_token()` function to handle NULL organisation_id
- Updated `get_organisation_from_invite()` to use LEFT JOIN instead of JOIN

**Admin UI (CampOrganizerManagement.tsx)**:
- Removed organisation dropdown from invite form
- Removed organisation state variable (`inviteOrgId`)
- Removed `loadOrganisations()` function
- Updated invite creation to not require organisation_id
- Organisation column in tables now shows "N/A" when no organisation

**Signup Flow (SignupForm.tsx)**:
- Profile creation only sets organisation_id if invite includes one
- Organisation member record only created if invite has organisation_id
- Invitation banner shows conditional text: "invited you to join the platform as a camp organizer" (without organisation name)

---

### 3. ✅ Email Sending - Implemented

**Problem**: No actual invitation email was being sent

**Solution**: Created Supabase Edge Function that sends professional HTML emails via Resend

**Files Created**:
- [supabase/functions/send-camp-organizer-invite/index.ts](supabase/functions/send-camp-organizer-invite/index.ts) - Edge function code
- [supabase/functions/send-camp-organizer-invite/README.md](supabase/functions/send-camp-organizer-invite/README.md) - Setup documentation

**Files Changed**:
- [src/pages/admin/CampOrganizerManagement.tsx](src/pages/admin/CampOrganizerManagement.tsx) - Calls edge function after creating invite

**Email Features**:
- ✅ Professional HTML template with FutureEdge branding
- ✅ Personalized with inviter name
- ✅ Clear call-to-action button
- ✅ Backup link for copy/paste
- ✅ Expiry reminder (7 days)
- ✅ Mobile-responsive design
- ✅ Graceful fallback if email fails (shows link to copy manually)

**Integration**:
- After creating invite, edge function is called automatically
- Success: Shows "Invitation sent successfully! Email sent to [email]"
- Failure: Shows "Invite created but email failed to send" + manual link

---

## What You Need to Do Next

### Step 1: Deploy Updated Migration

The migration has been updated to make organisation_id nullable. You need to re-run it:

```bash
# If you already ran migration 007, you need to rollback and re-run it
# OR manually update the column in Supabase Dashboard

# Option A: Via Supabase CLI
npx supabase db reset  # WARNING: This resets the entire database
npx supabase db push

# Option B: Via Supabase Dashboard SQL Editor
# Go to: https://app.supabase.com/project/jkfbqimwhjukrmgjsxrj/sql
# Run this SQL:
ALTER TABLE camp_organizer_invites ALTER COLUMN organisation_id DROP NOT NULL;
```

### Step 2: Set Up Email Service (Resend)

1. **Sign up for Resend** (free tier: 3,000 emails/month)
   - Go to [resend.com](https://resend.com)
   - Create account and get your API key

2. **Set environment variables in Supabase**
   - Go to Supabase Dashboard → Settings → Edge Functions
   - Add secrets:
     ```
     RESEND_API_KEY=re_xxxxxxxxxxxxx
     FROM_EMAIL=FutureEdge <noreply@yourverifieddomain.com>
     APP_URL=https://yourapp.com
     ```

   Or via CLI:
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
   npx supabase secrets set FROM_EMAIL="FutureEdge <noreply@yourverifieddomain.com>"
   npx supabase secrets set APP_URL=https://yourapp.com
   ```

3. **Verify your domain in Resend**
   - In Resend dashboard, add and verify your sending domain
   - This allows you to send from `noreply@yourdomain.com` instead of default domain

### Step 3: Deploy Edge Function

```bash
# Deploy the email sending function
npx supabase functions deploy send-camp-organizer-invite

# Test it works
curl -X POST https://your-project-ref.supabase.co/functions/v1/send-camp-organizer-invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "email": "test@example.com",
    "token": "test-token-123",
    "inviterName": "Test Admin"
  }'
```

### Step 4: Test the Complete Flow

1. **Create an Invitation**:
   - Log in as super_admin
   - Go to Admin Dashboard → "Camp Organizer Management" (in Quick Actions)
   - Click "Invite Camp Organizer"
   - Enter email and optional notes
   - Click "Send Invitation"
   - Should see: "Invitation sent successfully! Email sent to [email]"

2. **Check Email**:
   - Check the email inbox of the invited address
   - Should receive professional HTML email with invite link
   - Link format: `https://yourapp.com/signup?invite_token=xxx`

3. **Accept Invitation**:
   - Click link in email or open in browser
   - Should see invitation banner: "You've been invited to join the platform as a camp organizer"
   - Email field should be pre-filled and disabled
   - Complete registration with name + password
   - Should create camp_organizer profile
   - Should redirect to dashboard

4. **Verify in Database**:
   - Check `camp_organizer_invites` table: status should be 'accepted'
   - Check `profiles` table: role should be 'camp_organizer', organisation_id should be NULL
   - Check `organisation_members` table: should NOT have a record (since no organisation)

---

## Updated User Flow

### Admin Flow
```
1. Admin goes to Admin Dashboard
2. Clicks "Camp Organizer Management" in Quick Actions
3. Clicks "Invite Camp Organizer" button
4. Enters email address (no organisation selection)
5. Optionally adds notes
6. Clicks "Send Invitation"
7. System:
   - Generates secure token
   - Creates invite record in database
   - Calls edge function to send email
   - Shows success message
8. Invited user receives professional email with link
```

### Camp Organizer Flow
```
1. Receives email from FutureEdge
2. Clicks "Accept Invitation" button in email
3. Lands on /signup?invite_token=xxx
4. Sees invitation banner (without organisation name)
5. Email pre-filled and disabled
6. Enters name and password
7. Clicks "Complete Registration"
8. System:
   - Creates auth user
   - Creates camp_organizer profile (organisation_id = NULL)
   - Marks invite as accepted
   - Does NOT create organisation_member record
9. Redirects to /dashboard
10. Later: Camp organizer creates their own organisation during onboarding
```

---

## Alternative Email Services

If you prefer not to use Resend, you can easily swap to:
- **SendGrid**: Update `index.ts` to use SendGrid API
- **Mailgun**: Update `index.ts` to use Mailgun API
- **AWS SES**: Update `index.ts` to use AWS SES
- **Postmark**: Update `index.ts` to use Postmark API

See the edge function README for modification instructions.

---

## Development/Testing Without Email

If you want to test without setting up email:

1. Comment out the edge function call in `CampOrganizerManagement.tsx`:
   ```typescript
   // Temporarily disable email for testing
   /*
   const { data: emailData, error: emailError } = await supabase.functions.invoke(
     'send-camp-organizer-invite',
     ...
   );
   */
   ```

2. The toast message will still show the invite link to copy manually

3. Re-enable when ready to use email in production

---

## Summary of Benefits

✅ **Navigation**: Camp Organizer Management easily accessible from admin dashboard
✅ **Simplified Workflow**: No need to pre-create organisations for invites
✅ **Flexible**: Camp organizers create their own organisation during onboarding
✅ **Professional Emails**: Automated, branded invitation emails
✅ **Error Handling**: Graceful fallback if email fails (manual link shown)
✅ **Scalable**: Uses Resend's reliable email infrastructure
✅ **Free Tier**: 3,000 emails/month on free plan

---

## Rollback Instructions

If you need to rollback these changes:

1. **Revert migration**:
   ```sql
   ALTER TABLE camp_organizer_invites ALTER COLUMN organisation_id SET NOT NULL;
   ```

2. **Restore old invite form**:
   - Revert changes to `CampOrganizerManagement.tsx`
   - Re-add organisation dropdown
   - Remove edge function call

3. **Delete edge function**:
   ```bash
   npx supabase functions delete send-camp-organizer-invite
   ```

---

## Questions or Issues?

If you encounter any problems:

1. Check edge function logs: `npx supabase functions logs send-camp-organizer-invite`
2. Verify Resend API key is set correctly
3. Check email in spam folder
4. Ensure FROM_EMAIL domain is verified in Resend

Need help? Check the edge function README at:
`supabase/functions/send-camp-organizer-invite/README.md`
