/*
  # Definitive Camp Organizer RLS Policies - Creator-Based Filtering

  ## Purpose
  Single source of truth for camp visibility policies.
  Enforces creator-based filtering: organizers see ONLY camps they created.

  ## Changes
  1. Drops all conflicting SELECT policies on camps table
  2. Creates 3 new policies:
     - camp_organizer_select_created_camps: Organizers see only their created camps
     - authenticated_select_published_camps: Non-organizers see all published camps
     - anon_select_published_camps: Public users see all published camps
  3. Backfills created_by for any NULL values
  4. Adds verification comments

  ## Security Model
  - Camp organizers: See ONLY camps where created_by = auth.uid()
  - Super admins: See ALL camps (is_super_admin() function)
  - Authenticated non-organizers (parents): See published camps only
  - Anonymous users: See published camps only
*/

-- ============================================================================
-- STEP 1: DROP CONFLICTING POLICIES
-- ============================================================================

-- Drop all existing SELECT policies that might conflict
DROP POLICY IF EXISTS "Camp organizers can view their organisation camps" ON camps;
DROP POLICY IF EXISTS "Camp organizers can view their created camps" ON camps;
DROP POLICY IF EXISTS "Camp organizers can view organisation camps" ON camps;
DROP POLICY IF EXISTS "Authenticated users can view published camps" ON camps;
DROP POLICY IF EXISTS "Anon users can view published camps" ON camps;
DROP POLICY IF EXISTS "camp_organizer_select_created_camps" ON camps;
DROP POLICY IF EXISTS "authenticated_select_published_camps" ON camps;
DROP POLICY IF EXISTS "anon_select_published_camps" ON camps;

-- ============================================================================
-- STEP 2: BACKFILL created_by FOR EXISTING CAMPS
-- ============================================================================

-- Set created_by to the organization owner for camps that don't have it set
UPDATE camps
SET created_by = (
  SELECT om.profile_id
  FROM organisation_members om
  WHERE om.organisation_id = camps.organisation_id
    AND om.role = 'owner'
    AND om.status = 'active'
  ORDER BY om.created_at ASC
  LIMIT 1
)
WHERE created_by IS NULL;

COMMENT ON COLUMN camps.created_by
  IS 'User who created the camp. Creator-based RLS filtering enforces organizers see only their camps.';

-- ============================================================================
-- STEP 3: CREATE DEFINITIVE RLS POLICIES
-- ============================================================================

-- Policy 1: Camp organizers see ONLY camps they created (creator-based)
CREATE POLICY "camp_organizer_select_created_camps"
  ON camps
  FOR SELECT
  TO authenticated
  USING (
    -- Super admins see all camps
    is_super_admin()
    OR
    -- Camp organizers ONLY see camps they personally created
    (
      is_camp_organizer()
      AND created_by = auth.uid()
    )
  );

COMMENT ON POLICY "camp_organizer_select_created_camps" ON camps
  IS 'Camp organizers can ONLY view camps they personally created (created_by = auth.uid()). Super admins see all camps.';

-- Policy 2: Authenticated non-organizers see published camps
CREATE POLICY "authenticated_select_published_camps"
  ON camps
  FOR SELECT
  TO authenticated
  USING (
    -- NOT a camp organizer (parents, etc.) - see published camps only
    NOT is_camp_organizer()
    AND status = 'published'
  );

COMMENT ON POLICY "authenticated_select_published_camps" ON camps
  IS 'Authenticated users who are NOT camp organizers (e.g., parents) can view all published camps.';

-- Policy 3: Anonymous users see published camps
CREATE POLICY "anon_select_published_camps"
  ON camps
  FOR SELECT
  TO anon
  USING (
    status = 'published'
  );

COMMENT ON POLICY "anon_select_published_camps" ON camps
  IS 'Anonymous (non-authenticated) users can view published camps for browsing.';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- To verify this migration worked, run:
--
-- 1. Check that all camps now have created_by set:
-- SELECT COUNT(*) as camps_without_creator
-- FROM camps
-- WHERE created_by IS NULL;
-- (Should return 0)
--
-- 2. Verify exactly 3 SELECT policies exist:
-- SELECT policyname, cmd, qual::text
-- FROM pg_policies
-- WHERE tablename = 'camps' AND cmd = 'SELECT'
-- ORDER BY policyname;
-- (Should return 3 rows)
--
-- 3. Test as camp organizer (should see only own camps):
-- SELECT id, name, created_by, organisation_id
-- FROM camps;
--
-- 4. Test as parent (should see only published camps):
-- SELECT id, name, status
-- FROM camps;
