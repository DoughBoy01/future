# Quick Deployment Guide - Camp Organizer Invite System

Choose one of two methods below:

---

## 🚀 Method 1: Automated Script (Recommended)

Run the deployment script that will guide you through all steps:

```bash
./deploy-invite-system.sh
```

The script will:
- ✅ Check Supabase login
- ✅ Link to your project
- ✅ Run database migrations
- ✅ Deploy edge function
- ✅ Set up environment variables
- ✅ Regenerate TypeScript types

---

## 📋 Method 2: Manual Commands

If you prefer to run commands manually:

### Step 1: Login to Supabase

```bash
npx supabase login
```

### Step 2: Link Project

```bash
npx supabase link --project-ref jkfbqimwhjukrmgjsxrj
```

### Step 3: Run Database Migrations

```bash
npx supabase db push
```

This will apply migration 008 which makes `organisation_id` nullable.

### Step 4: Deploy Edge Function

```bash
npx supabase functions deploy send-camp-organizer-invite
```

### Step 5: Set Environment Variables

```bash
# Get your Resend API key from https://resend.com
npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx

# Optional: Set custom FROM email
npx supabase secrets set FROM_EMAIL="FutureEdge <noreply@yourdomain.com>"

# Optional: Set your app URL
npx supabase secrets set APP_URL=https://yourapp.com
```

### Step 6: Regenerate TypeScript Types

```bash
npx supabase gen types typescript --project-id jkfbqimwhjukrmgjsxrj > src/lib/database.types.ts
```

### Step 7: Install Dependencies (if not already installed)

```bash
npm install react-hot-toast
```

---

## 🧪 Testing

### 1. Test Edge Function

```bash
# Get your anon key from Supabase Dashboard → Settings → API
curl -X POST https://jkfbqimwhjukrmgjsxrj.supabase.co/functions/v1/send-camp-organizer-invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "email": "test@example.com",
    "token": "test-token-123",
    "inviterName": "Test Admin"
  }'
```

### 2. Test Complete Flow

1. **Login as super_admin**
2. **Navigate**: Admin Dashboard → "Camp Organizer Management"
3. **Create Invite**:
   - Click "Invite Camp Organizer"
   - Enter email address
   - Click "Send Invitation"
4. **Check Email**: Invitation should arrive within 1 minute
5. **Accept Invite**:
   - Click link in email
   - Complete registration
   - Verify profile created with `camp_organizer` role

---

## 🔧 Troubleshooting

### Migration already applied?

If you already ran migration 007, you can apply just the update:

```bash
npx supabase db execute -f supabase/migrations/008_update_camp_organizer_invites_optional_org.sql
```

Or run this SQL directly in Supabase Dashboard:

```sql
ALTER TABLE camp_organizer_invites
  ALTER COLUMN organisation_id DROP NOT NULL;
```

### Edge function not sending emails?

1. Check secrets are set:
   ```bash
   npx supabase secrets list
   ```

2. Check function logs:
   ```bash
   npx supabase functions logs send-camp-organizer-invite
   ```

3. Verify Resend API key is valid:
   - Login to [resend.com](https://resend.com)
   - Go to API Keys
   - Check key is active

### TypeScript errors?

If you see errors about `camp_organizer_invites`:

1. Make sure migration ran successfully
2. Regenerate types again
3. Restart your TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")

---

## 📚 Additional Resources

- **Edge Function Docs**: [supabase/functions/send-camp-organizer-invite/README.md](supabase/functions/send-camp-organizer-invite/README.md)
- **Changes Overview**: [CAMP_ORGANIZER_INVITE_UPDATES.md](CAMP_ORGANIZER_INVITE_UPDATES.md)
- **Resend Setup**: [resend.com/docs](https://resend.com/docs)

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Migration 008 applied (organisation_id is nullable)
- [ ] Edge function deployed and accessible
- [ ] Environment secrets set (RESEND_API_KEY at minimum)
- [ ] TypeScript types regenerated (no compilation errors)
- [ ] Can create invite from admin dashboard
- [ ] Invitation email received
- [ ] Can accept invite via link
- [ ] Profile created with camp_organizer role
- [ ] No organisation_id required

---

## 🆘 Need Help?

If you encounter issues:

1. Check function logs: `npx supabase functions logs send-camp-organizer-invite`
2. Check database: Verify `camp_organizer_invites` table structure
3. Check Resend: Login to dashboard and verify API key
4. Check email spam folder
5. Verify FROM_EMAIL domain is verified in Resend

---

**You're all set!** 🎉

The invite system will now:
- ✅ Send professional branded emails automatically
- ✅ Work without requiring organisations
- ✅ Allow camp organizers to create their own org during onboarding
