-- Migration: Allow users to insert their own profile during signup
-- Description: Fixes the chicken-and-egg problem where new users cannot create
--              their own profile because RLS policies only allowed super_admin
--              or school_admin to insert profiles.

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "School staff can insert profiles" ON profiles;

-- Create two policies:
-- 1. Users can create their own profile during signup
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User can only insert a profile for themselves
    id = auth.uid()
  );

-- 2. School staff can still insert profiles for others
CREATE POLICY "School staff can insert other profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    -- School admins and super admins can create profiles for others
    (is_super_admin() OR user_has_role('school_admin'))
    AND id != auth.uid()  -- For OTHER users, not themselves
  );

COMMENT ON POLICY "Users can insert own profile" ON profiles
  IS 'Allows authenticated users to create their own profile during signup';

COMMENT ON POLICY "School staff can insert other profiles" ON profiles
  IS 'Allows school staff and super admins to create profiles for other users';
