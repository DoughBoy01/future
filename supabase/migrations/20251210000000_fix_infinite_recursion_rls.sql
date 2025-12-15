-- Migration: Fix Infinite Recursion in organisation_members RLS Policies
-- Description: Replaces self-referential RLS policies with SECURITY DEFINER functions

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Users can view their organisation members" ON organisation_members;
DROP POLICY IF EXISTS "Owners and admins can manage members" ON organisation_members;

-- Create a SECURITY DEFINER function to get user's organisations
-- This bypasses RLS when checking organization membership
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

-- Create a SECURITY DEFINER function to check if user is org admin/owner
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

-- Recreate the SELECT policy without self-reference
CREATE POLICY "Users can view their organisation members"
  ON organisation_members FOR SELECT
  USING (
    -- User can see their own membership
    profile_id = auth.uid()
    OR
    -- User can see members of organisations they belong to
    organisation_id IN (SELECT get_user_organisation_ids())
    OR
    -- Super admins can see all
    is_super_admin()
  );

-- Recreate the management policy without self-reference
CREATE POLICY "Owners and admins can manage members"
  ON organisation_members FOR ALL
  USING (
    -- User must be an admin/owner of the organisation
    is_organisation_admin(organisation_id)
    OR
    -- Super admins can manage all
    is_super_admin()
  );

-- Add policy for inserting new members (camp organizer invites)
CREATE POLICY "Super admins can insert members"
  ON organisation_members FOR INSERT
  WITH CHECK (
    is_super_admin()
    OR
    -- Org admins can invite members to their org
    is_organisation_admin(organisation_id)
  );

-- Add policy for deleting members
CREATE POLICY "Org admins can remove members"
  ON organisation_members FOR DELETE
  USING (
    is_super_admin()
    OR
    is_organisation_admin(organisation_id)
  );

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION get_user_organisation_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION is_organisation_admin(UUID) TO authenticated;

-- Add comment explaining the fix
COMMENT ON FUNCTION get_user_organisation_ids() IS 'SECURITY DEFINER function to get user organisation IDs without triggering RLS recursion';
COMMENT ON FUNCTION is_organisation_admin(UUID) IS 'SECURITY DEFINER function to check if user is an admin/owner of an organisation without triggering RLS recursion';
