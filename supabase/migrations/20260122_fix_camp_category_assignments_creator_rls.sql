/*
  # Fix camp_category_assignments RLS - Align with Creator-Based Filtering

  ## Problem
  Camp organizers get 403 error when editing camps:
  "new row violates row-level security policy for table camp_category_assignments"

  ## Root Cause
  - camps table RLS uses creator-based filtering (created_by = auth.uid())
  - camp_category_assignments RLS uses organization-based filtering (joins organisation_members)
  - This mismatch causes failures when organizers aren't properly in organisation_members
    or when their organisation_members.status isn't 'active'

  ## Solution
  Replace organization-based policies with creator-based policies that:
  1. Check if camp.created_by = auth.uid() (matching camps table logic)
  2. Verify user has role = 'camp_organizer' in profiles
  3. Keep super_admin and public policies unchanged

  ## Migration Steps
  1. Drop existing organization-based policies for camp organizers
  2. Create new creator-based policies
  3. Add verification comments
*/

-- ============================================================================
-- STEP 1: DROP ORGANIZATION-BASED POLICIES
-- ============================================================================

-- Drop the policies that check organisation_members table
DROP POLICY IF EXISTS "Camp organizers can view their org camp categories" ON camp_category_assignments;
DROP POLICY IF EXISTS "Camp organizers can assign categories to their org camps" ON camp_category_assignments;
DROP POLICY IF EXISTS "Camp organizers can remove categories from their org camps" ON camp_category_assignments;

-- Note: Keep super admin and public policies - they don't need changes
-- "Super admins full access to camp category assignments"
-- "Public can view camp category assignments"

-- ============================================================================
-- STEP 2: CREATE CREATOR-BASED POLICIES
-- ============================================================================

-- Policy 1: Camp organizers can SELECT category assignments for their created camps
CREATE POLICY "Camp organizers can view categories for their created camps"
  ON camp_category_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps c
      WHERE c.id = camp_category_assignments.camp_id
      AND c.created_by = auth.uid()  -- Creator-based filtering
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'camp_organizer'
      )
    )
  );

COMMENT ON POLICY "Camp organizers can view categories for their created camps" ON camp_category_assignments
  IS 'Camp organizers can view category assignments for camps they personally created (creator-based filtering aligned with camps table RLS)';

-- Policy 2: Camp organizers can INSERT category assignments for their created camps
CREATE POLICY "Camp organizers can assign categories to their created camps"
  ON camp_category_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM camps c
      WHERE c.id = camp_category_assignments.camp_id
      AND c.created_by = auth.uid()  -- Creator-based filtering
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'camp_organizer'
      )
    )
  );

COMMENT ON POLICY "Camp organizers can assign categories to their created camps" ON camp_category_assignments
  IS 'Camp organizers can create category assignments for camps they personally created (creator-based filtering aligned with camps table RLS)';

-- Policy 3: Camp organizers can DELETE category assignments for their created camps
CREATE POLICY "Camp organizers can remove categories from their created camps"
  ON camp_category_assignments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps c
      WHERE c.id = camp_category_assignments.camp_id
      AND c.created_by = auth.uid()  -- Creator-based filtering
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'camp_organizer'
      )
    )
  );

COMMENT ON POLICY "Camp organizers can remove categories from their created camps" ON camp_category_assignments
  IS 'Camp organizers can delete category assignments for camps they personally created (creator-based filtering aligned with camps table RLS)';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- To verify this migration worked, run:
--
-- 1. Check that exactly 5 policies exist on camp_category_assignments:
-- SELECT policyname, cmd, roles::text
-- FROM pg_policies
-- WHERE tablename = 'camp_category_assignments'
-- ORDER BY policyname;
-- Expected: 5 policies total
--   - 1 super admin policy (FOR ALL)
--   - 1 public SELECT policy
--   - 3 camp organizer policies (SELECT, INSERT, DELETE with creator-based filtering)
--
-- 2. Test as camp organizer (should succeed):
-- -- Create a test camp assignment
-- INSERT INTO camp_category_assignments (camp_id, category_id)
-- VALUES ('your-camp-id', 'some-category-id');
--
-- 3. Verify policy alignment with camps table:
-- -- Both should use created_by = auth.uid()
-- SELECT
--   'camps' as table_name,
--   policyname,
--   qual::text as using_clause
-- FROM pg_policies
-- WHERE tablename = 'camps' AND policyname LIKE '%organizer%'
-- UNION ALL
-- SELECT
--   'camp_category_assignments' as table_name,
--   policyname,
--   qual::text as using_clause
-- FROM pg_policies
-- WHERE tablename = 'camp_category_assignments' AND policyname LIKE '%organizer%'
-- ORDER BY table_name, policyname;
