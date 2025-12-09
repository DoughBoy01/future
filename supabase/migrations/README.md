# Database Migrations for Camp Organizer Self-Service

This directory contains SQL migrations to prepare the database for camp organizer self-service functionality.

## Migration Order

These migrations **must be run in order**:

### Phase 1: Core Setup (Required)

1. **`001_add_camp_organizer_role.sql`**
   - Adds `camp_organizer` role support to profiles table
   - Creates helper function `is_camp_organizer()`
   - **Impact**: Enables camp organizer user registration

2. **`002_create_organisation_members.sql`**
   - Creates `organisation_members` table
   - Enables multi-user organisations with roles (owner, admin, staff, viewer)
   - Adds RLS policies for member management
   - **Impact**: Teams can collaborate on camp management

3. **`003_add_organisation_onboarding.sql`**
   - Adds onboarding workflow fields to `organisations`
   - Adds Stripe Connect integration fields
   - Adds business verification fields
   - **Impact**: Tracks organisation approval process and payout setup

4. **`004_add_camp_approval_workflow.sql`**
   - Defines camp status workflow with constraints
   - Adds approval tracking fields (reviewed_by, reviewed_at, rejection_reason)
   - Creates helper functions for permission checks
   - Adds auto-publish trigger for trusted orgs
   - **Impact**: Enables admin approval workflow for new camps

### Phase 2: Workflows (Important)

5. **`005_add_camp_organizer_rls_policies.sql`**
   - Comprehensive RLS policies for camp_organizer role
   - Policies for camps, organisations, commissions, registrations, enquiries, feedback
   - **Impact**: Camp organizers can only access their own organisation's data

### Phase 3: Financials (Nice to Have)

6. **`006_create_payouts_table.sql`**
   - Creates `payouts` table for tracking payouts to organisations
   - Adds `upcoming_payouts_summary` view
   - Creates helper functions: `calculate_next_payout()`, `create_payout()`
   - **Impact**: Automated payout scheduling and tracking

### Phase 4: Security (Critical for Production)

7. **`007_add_camp_organizer_invites.sql`**
   - Creates `camp_organizer_invites` table for admin-controlled registration
   - Adds invite validation and acceptance functions
   - RLS policies: Only super_admin can create invites
   - Helper functions: `validate_invite_token()`, `mark_invite_accepted()`, `expire_old_invites()`
   - **Impact**: Prevents unauthorized camp organizer registration, admin vets all organizers before onboarding

## How to Run Migrations

### Option 1: Supabase CLI (Recommended)

```bash
# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref jkfbqimwhjukrmgjsxrj

# Run all migrations
npx supabase db push

# Or run individually
npx supabase db execute -f supabase/migrations/001_add_camp_organizer_role.sql
npx supabase db execute -f supabase/migrations/002_create_organisation_members.sql
# ... etc
```

### Option 2: Supabase Dashboard

1. Go to https://app.supabase.com/project/jkfbqimwhjukrmgjsxrj/sql
2. Copy the contents of each migration file
3. Paste and execute in the SQL Editor
4. Run migrations **in order** (001 → 002 → 003 → 004 → 005 → 006)

### Option 3: Direct psql

```bash
# Get your connection string from Supabase dashboard
psql "postgresql://postgres:[YOUR-PASSWORD]@db.jkfbqimwhjukrmgjsxrj.supabase.co:5432/postgres" \
  -f supabase/migrations/001_add_camp_organizer_role.sql

# Repeat for each migration in order
```

## After Running Migrations

### 1. Regenerate TypeScript Types

```bash
npx supabase gen types typescript --project-id jkfbqimwhjukrmgjsxrj > src/lib/database.types.ts
```

### 2. Verify Changes

Check that new tables and columns exist:

```sql
-- Check new role is allowed
SELECT * FROM profiles LIMIT 1;

-- Check new tables exist
SELECT * FROM organisation_members LIMIT 1;
SELECT * FROM payouts LIMIT 1;

-- Check new columns on organisations
\d organisations

-- Check new columns on camps
\d camps
```

### 3. Create Initial Data (Optional)

```sql
-- Example: Create a test organisation with camp_organizer
INSERT INTO organisations (name, slug, contact_email, onboarding_status, payout_enabled)
VALUES ('Test Camp Co.', 'test-camp-co', 'test@example.com', 'active', true)
RETURNING id;

-- Example: Add a user as organisation member
-- (Replace UUIDs with actual IDs)
INSERT INTO organisation_members (organisation_id, profile_id, role, status, joined_at)
VALUES (
  '<organisation_id_from_above>',
  '<profile_id_of_user>',
  'owner',
  'active',
  NOW()
);
```

## New Database Features

### Tables
- `organisation_members` - Multi-user organisation management
- `payouts` - Payout tracking and scheduling

### Views
- `upcoming_payouts_summary` - Pending commission totals per organisation

### Functions
- `is_camp_organizer()` - Check if user has camp_organizer role
- `is_organisation_member(org_id)` - Check membership
- `get_organisation_role(org_id)` - Get user's role in org
- `can_edit_camp(camp_id)` - Check edit permissions
- `can_review_camps()` - Check review permissions
- `calculate_next_payout(org_id)` - Calculate pending payout
- `create_payout(org_id, start_date, end_date)` - Create payout record

### New Columns on `organisations`
- `onboarding_status` - Application workflow tracking
- `onboarding_completed_at` - When onboarding finished
- `stripe_account_id` - Stripe Connect account
- `stripe_account_status` - Stripe verification status
- `payout_enabled` - Whether payouts are active
- `payout_schedule` - weekly/biweekly/monthly
- `minimum_payout_amount` - Minimum before payout
- `business_type` - individual/company/nonprofit/government
- `approved_by`, `approved_at` - Approval tracking
- `rejected_by`, `rejected_at`, `rejection_reason` - Rejection tracking

### New Columns on `camps`
- `status` - Now constrained to workflow states
- `submitted_for_review_at` - When submitted
- `reviewed_by`, `reviewed_at` - Who/when reviewed
- `review_notes`, `rejection_reason`, `changes_requested` - Feedback
- `auto_publish` - Auto-publish on approval (trusted orgs)

## Camp Status Workflow

```
draft → pending_review → approved → published
          ↓                ↓
    requires_changes   rejected
          ↓
        draft

Also: unpublished, archived
```

## Organisation Onboarding Workflow

```
pending_application → pending_verification → pending_approval → active

Also: suspended, rejected
```

## Troubleshooting

### Error: "relation already exists"
- Migration was already run partially
- Safe to continue with next migration

### Error: "constraint already exists"
- Drop the constraint first:
  ```sql
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ```

### Error: "function already exists"
- Drop the function first:
  ```sql
  DROP FUNCTION IF EXISTS is_camp_organizer();
  ```

### RLS Policies Not Working
- Verify you're logged in as the correct user
- Check `auth.uid()` returns expected user ID:
  ```sql
  SELECT auth.uid();
  ```

## Security Considerations

- All tables have RLS enabled
- Camp organizers can only see their organisation's data
- Only super_admin can approve/reject camps
- Only super_admin can manage payouts
- Organisation owners/admins can manage team members

## Next Steps

After migrations are complete:

1. **Update TypeScript types** (see above)
2. **Build Camp Organizer Dashboard** - UI for managing camps
3. **Build Admin Approval Flow** - UI for reviewing submitted camps
4. **Integrate Stripe Connect** - For automated payouts
5. **Build Onboarding Flow** - Multi-step organisation signup
6. **Add Email Notifications** - For approval/rejection/payouts

## Rollback (if needed)

To rollback these migrations, run in **reverse order**:

```sql
-- 007: Drop camp organizer invites
DROP TABLE IF EXISTS camp_organizer_invites CASCADE;
DROP FUNCTION IF EXISTS validate_invite_token CASCADE;
DROP FUNCTION IF EXISTS get_organisation_from_invite CASCADE;
DROP FUNCTION IF EXISTS mark_invite_accepted CASCADE;
DROP FUNCTION IF EXISTS expire_old_invites CASCADE;

-- 006: Drop payouts
DROP TABLE IF EXISTS payouts CASCADE;
DROP VIEW IF EXISTS upcoming_payouts_summary CASCADE;
DROP FUNCTION IF EXISTS calculate_next_payout CASCADE;
DROP FUNCTION IF EXISTS create_payout CASCADE;

-- 005: Drop RLS policies
-- (See migration file for policy names)

-- 004: Revert camp columns
ALTER TABLE camps DROP COLUMN IF EXISTS submitted_for_review_at CASCADE;
ALTER TABLE camps DROP COLUMN IF EXISTS reviewed_by CASCADE;
-- ... etc

-- 003: Revert organisation columns
ALTER TABLE organisations DROP COLUMN IF EXISTS onboarding_status CASCADE;
-- ... etc

-- 002: Drop organisation_members
DROP TABLE IF EXISTS organisation_members CASCADE;

-- 001: Revert role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
```

## Support

For issues or questions:
1. Check Supabase logs: Dashboard → Logs
2. Review RLS policies: Dashboard → Database → Policies
3. Test queries in SQL Editor with different user contexts
