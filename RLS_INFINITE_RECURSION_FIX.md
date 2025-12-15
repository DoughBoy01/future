# Fix: RLS Infinite Recursion Error

## Error Message
```
Failed to load camps: infinite recursion detected in policy for relation "organisation_members"
```

## Root Cause

The `organisation_members` table had **self-referential RLS policies** that created infinite recursion. Specifically:

### Problematic Policy (Migration 002)
```sql
CREATE POLICY "Users can view their organisation members"
  ON organisation_members FOR SELECT
  USING (
    profile_id = auth.uid() OR
    organisation_id IN (
      SELECT organisation_id FROM organisation_members  -- ❌ Self-reference!
      WHERE profile_id = auth.uid()
    ) OR
    is_super_admin()
  );
```

**The Problem:**
1. User tries to read from `organisation_members`
2. RLS policy evaluates and needs to query `organisation_members` in subquery
3. That subquery also triggers RLS evaluation
4. RLS tries to evaluate the same policy again
5. **Infinite recursion detected!**

## The Solution

Create **SECURITY DEFINER helper functions** that bypass RLS when checking organization membership, then use those functions in the RLS policies.

### Files Created

1. **[supabase/migrations/009_fix_infinite_recursion_rls.sql](supabase/migrations/009_fix_infinite_recursion_rls.sql)** - Migration to fix the issue
2. **[fix-rls-recursion.sh](fix-rls-recursion.sh)** - Script to apply the migration

## What the Fix Does

### Step 1: Create Helper Functions (SECURITY DEFINER)

**Function 1: `get_user_organisation_ids()`**
```sql
CREATE OR REPLACE FUNCTION get_user_organisation_ids()
RETURNS TABLE(organisation_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT om.organisation_id
  FROM organisation_members om
  WHERE om.profile_id = auth.uid()
    AND om.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Why it works:** `SECURITY DEFINER` means the function runs with the privileges of the function creator (bypassing RLS), preventing recursion.

**Function 2: `is_organisation_admin(org_id)`**
```sql
CREATE OR REPLACE FUNCTION is_organisation_admin(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM organisation_members om
    WHERE om.organisation_id = org_id
      AND om.profile_id = auth.uid()
      AND om.role IN ('owner', 'admin')
      AND om.status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 2: Replace Policies with Non-Recursive Versions

**New SELECT Policy:**
```sql
CREATE POLICY "Users can view their organisation members"
  ON organisation_members FOR SELECT
  USING (
    profile_id = auth.uid()
    OR
    organisation_id IN (SELECT get_user_organisation_ids())  -- ✅ Uses helper function
    OR
    is_super_admin()
  );
```

**New Management Policy:**
```sql
CREATE POLICY "Owners and admins can manage members"
  ON organisation_members FOR ALL
  USING (
    is_organisation_admin(organisation_id)  -- ✅ Uses helper function
    OR
    is_super_admin()
  );
```

## How to Apply the Fix

### Option 1: Automated Script (Recommended)
```bash
cd /Users/stephenaris/Future_db/future
./fix-rls-recursion.sh
```

### Option 2: Manual Application
```bash
# Push all pending migrations
npx supabase db push

# Or apply specific migration
npx supabase db push --migration 009_fix_infinite_recursion_rls.sql
```

### Option 3: Direct SQL (Supabase Dashboard)
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/009_fix_infinite_recursion_rls.sql`
3. Paste and run the SQL

## Verification Steps

### 1. Test Camps Page
```bash
# Navigate to /admin/dashboard/camps in browser
# Open browser console (F12)
# Should see:
[CampsManagement] Loading camps for user: <role>, <organisation_id>
[CampsManagement] Loaded camps count: <number>
```

### 2. Verify No More Recursion Error
- **Before:** "infinite recursion detected in policy for relation 'organisation_members'"
- **After:** Camps load successfully, or different specific error if data issues exist

### 3. Check RLS Policies
```sql
-- Run in Supabase SQL Editor
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'organisation_members';
```

Should show policies without self-referential subqueries.

### 4. Test Helper Functions
```sql
-- Test get_user_organisation_ids() (run as authenticated user)
SELECT * FROM get_user_organisation_ids();

-- Test is_organisation_admin()
SELECT is_organisation_admin('<some-org-id>');
```

## Impact on Different User Roles

### Super Admins
- **Before Fix:** Could not load any camps due to recursion error
- **After Fix:** Can load all camps from all organizations

### Camp Organizers
- **Before Fix:** Could not load any camps due to recursion error
- **After Fix:** Can load camps from their organization(s)

### Regular Users
- **Before Fix:** Could not access organization data
- **After Fix:** Can access organization data they're members of

## Technical Details

### Why SECURITY DEFINER Fixes Recursion

**Regular Policy Flow (with recursion):**
```
User Query → RLS Policy Evaluation → Subquery → RLS Policy Evaluation → ... ∞
```

**SECURITY DEFINER Flow (no recursion):**
```
User Query → RLS Policy Evaluation → Function Call (bypasses RLS) → Direct Query → Result
```

The `SECURITY DEFINER` function runs with the function creator's privileges, which bypass RLS on the tables it accesses internally.

### Security Considerations

**Q: Is SECURITY DEFINER safe?**

A: Yes, when properly implemented:
- ✅ Functions only return data for `auth.uid()` (current user)
- ✅ Functions check `status = 'active'` to exclude inactive members
- ✅ Functions are narrowly scoped to specific checks
- ✅ No arbitrary data exposure

**Q: Can users bypass RLS with these functions?**

A: No:
- Functions are called from within RLS policies
- Functions only check the current authenticated user's memberships
- Users cannot call functions to access other users' data

## Related Files Modified

### Migrations
- `supabase/migrations/002_create_organisation_members.sql` - Original problematic policies (replaced)
- `supabase/migrations/009_fix_infinite_recursion_rls.sql` - New fix migration

### Application Code
- `src/App.tsx` - Already fixed to allow camp_organizer role
- `src/pages/admin/CampsManagement.tsx` - Already has error display

## Troubleshooting

### Issue: Migration fails to apply

**Check:**
```sql
-- See if old policies still exist
SELECT policyname FROM pg_policies
WHERE tablename = 'organisation_members';
```

**Fix:**
```sql
-- Manually drop old policies
DROP POLICY IF EXISTS "Users can view their organisation members" ON organisation_members;
DROP POLICY IF EXISTS "Owners and admins can manage members" ON organisation_members;
```

### Issue: Functions don't exist

**Check:**
```sql
SELECT proname FROM pg_proc
WHERE proname IN ('get_user_organisation_ids', 'is_organisation_admin');
```

**Fix:**
Re-run the migration or manually create the functions.

### Issue: Still seeing recursion errors

**Check which table:**
The error message will say: "infinite recursion detected in policy for relation '<TABLE>'"

**If it's a different table:**
That table may also have self-referential policies. Apply the same fix pattern:
1. Create SECURITY DEFINER helper function
2. Replace policy to use the helper function

## Success Criteria

✅ No more "infinite recursion" errors
✅ Camps page loads successfully
✅ Super admins see all camps
✅ Camp organizers see their organization's camps
✅ Console shows successful query logs
✅ RLS policies still enforce proper access control

## Next Steps After Fix

1. **Test the fix** - Navigate to `/admin/dashboard/camps` and verify camps load
2. **Check console** - Ensure no errors appear
3. **Verify data** - Confirm camps from correct organizations display
4. **Test permissions** - Try accessing as different user roles

## Summary

The infinite recursion was caused by RLS policies on `organisation_members` table that queried the same table within their policy conditions. The fix uses `SECURITY DEFINER` helper functions that bypass RLS when performing internal checks, breaking the recursion cycle while maintaining proper access control.

This is a common pattern in Supabase RLS when you need to check relationships across tables - always use `SECURITY DEFINER` functions instead of inline subqueries that reference the protected table.
