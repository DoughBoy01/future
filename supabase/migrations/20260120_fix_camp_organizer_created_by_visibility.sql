/*
  # Fix Camp Organizer Visibility - Show Only Created Camps

  ## Problem
  Camp organizers can see ALL camps from their organization.
  They should only see camps they personally created.

  ## Solution
  1. Backfill created_by for existing camps (set to organization owner)
  2. Update RLS policy to filter by created_by instead of organisation_id

  ## Changes
  - Backfills created_by for camps where it's NULL
  - Drops organization-based visibility policy
  - Creates creator-based visibility policy
*/

-- ============================================================================
-- STEP 1: BACKFILL created_by FOR EXISTING CAMPS
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
  IS 'User who created the camp. Backfilled to organization owner for existing camps.';

-- ============================================================================
-- STEP 2: UPDATE RLS POLICY FOR CAMP ORGANIZERS
-- ============================================================================

-- Drop the organization-based policy
DROP POLICY IF EXISTS "Camp organizers can view their organisation camps" ON camps;

-- Create new creator-based policy
CREATE POLICY "Camp organizers can view their created camps"
  ON camps
  FOR SELECT
  TO authenticated
  USING (
    -- Super admins see all camps
    is_super_admin()
    OR
    -- Camp organizers ONLY see camps they created
    (
      is_camp_organizer()
      AND created_by = auth.uid()
    )
  );

COMMENT ON POLICY "Camp organizers can view their created camps" ON camps
  IS 'Camp organizers can ONLY view camps they personally created. Super admins see all camps.';

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
-- 2. Verify the new policy exists:
-- SELECT tablename, policyname, roles, qual::text
-- FROM pg_policies
-- WHERE tablename = 'camps'
-- AND policyname = 'Camp organizers can view their created camps';
--
-- 3. Test as camp organizer:
-- SELECT id, name, created_by, organisation_id
-- FROM camps;
-- (Should only return camps where created_by = current user's ID)
