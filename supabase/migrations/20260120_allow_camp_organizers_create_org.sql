/*
  # Allow Camp Organizers to Create Organizations

  ## Problem
  All camp organizers signing up are being assigned to the same organization
  instead of creating unique organizations for each signup.

  ## Root Cause
  The organisations table RLS policy ONLY allows super_admins to INSERT.
  When camp organizers sign up via self-service, their organization creation
  is blocked by RLS, causing signup failures or fallback to default org.

  ## Solution
  Add RLS policies to allow camp_organizer users to:
  1. INSERT their own organization during signup
  2. INSERT themselves as organization members

  This enables the self-service camp owner onboarding flow.
*/

-- Policy 1: Camp organizers can create their own organization
CREATE POLICY "Camp organizers can create organizations"
  ON organisations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User must be a camp_organizer
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'camp_organizer'
    )
  );

COMMENT ON POLICY "Camp organizers can create organizations" ON organisations
  IS 'Allows camp_organizer users to create their own organization during self-service signup';

-- Policy 2: Camp organizers can add themselves as organization members
CREATE POLICY "Camp organizers can join as members"
  ON organisation_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can add themselves as a member
    profile_id = auth.uid()
    -- And they must be a camp_organizer
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'camp_organizer'
    )
  );

COMMENT ON POLICY "Camp organizers can join as members" ON organisation_members
  IS 'Allows camp_organizer users to add themselves as organization members during signup';
