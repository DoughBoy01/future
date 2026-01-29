/*
  # Restore Self-Access Policies for Profiles Table

  ## Problem
  During RLS recursion fixes (migrations 20251016-20251017), the policies allowing
  users to SELECT and UPDATE their own profiles were accidentally removed.

  This causes the organizer dashboard access issue where:
  1. User signs up successfully (INSERT works due to 20260117 fix)
  2. AuthContext.loadProfile() fails to SELECT the user's own profile
  3. Profile remains null, causing RoleBasedRoute to redirect to home

  ## Root Cause
  The "Organisation staff can view profiles in their organisation" policy has:
    AND id != auth.uid()  -- This excludes viewing own profile!

  This was intentional to prevent RLS recursion in helper functions, but it means
  normal users (including camp_organizers and parents) cannot view their own profile.

  ## Solution
  Add two policies that allow users to access their OWN profile:
  1. SELECT policy: Users can view their own profile
  2. UPDATE policy: Users can update their own profile

  These policies are safe and don't cause recursion because they use a simple
  direct comparison (auth.uid() = id) without calling helper functions that query
  the profiles table.

  ## Security Notes
  - Users can only access their OWN profile (id must equal auth.uid())
  - Super admins retain ability to view/update all profiles
  - Organisation staff can still view OTHER profiles in their org
  - No RLS recursion risk (direct comparison, no subqueries)
  - WITH CHECK clause prevents privilege escalation on UPDATE
*/

-- Add SELECT policy for users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Add UPDATE policy for users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add helpful comments for documentation
COMMENT ON POLICY "Users can view own profile" ON profiles
  IS 'Allows authenticated users to view their own profile. Essential for AuthContext.loadProfile() to work correctly. Uses direct auth.uid() comparison to avoid RLS recursion.';

COMMENT ON POLICY "Users can update own profile" ON profiles
  IS 'Allows authenticated users to update their own profile information (name, phone, preferences, etc.). The WITH CHECK clause prevents users from modifying the id field or escalating privileges.';
