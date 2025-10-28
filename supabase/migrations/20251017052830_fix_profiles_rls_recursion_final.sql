/*
  # Fix Profiles RLS Infinite Recursion - Final Fix

  ## Problem
  The "Organisation staff can view profiles in their organisation" policy causes infinite
  recursion because it queries the profiles table within the policy itself.

  ## Solution
  1. Drop the problematic policy
  2. Use the existing helper function that has SECURITY DEFINER (bypasses RLS)
  3. Simplify the policy to avoid nested profile queries
  
  ## Security Notes
  - Helper functions with SECURITY DEFINER bypass RLS, preventing recursion
  - Policies still maintain proper security boundaries
  - Super admins maintain full access
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Organisation staff can view profiles in their organisation" ON profiles;

-- Create a non-recursive version using the helper function
CREATE POLICY "Organisation staff can view profiles in their organisation"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    is_school_staff() 
    AND get_user_school_id() IS NOT NULL 
    AND organisation_id = get_user_school_id()
    AND id != auth.uid()
  );

-- Ensure the "School staff can insert profiles" policy has proper WITH CHECK
DROP POLICY IF EXISTS "School staff can insert profiles" ON profiles;

CREATE POLICY "School staff can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin() OR user_has_role('school_admin'));
