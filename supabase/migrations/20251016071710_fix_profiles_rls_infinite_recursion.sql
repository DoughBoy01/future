/*
  # Fix Infinite Recursion in Profiles RLS Policies

  ## Problem
  The super_admin policies on the profiles table are causing infinite recursion because
  they query the profiles table to check if a user is a super_admin, which requires
  querying the profiles table again.

  ## Solution
  1. Create a security definer function to check user role without RLS
  2. Drop existing problematic super_admin policies
  3. Recreate policies using the security definer function

  ## Changes
  - Create `is_super_admin()` function with SECURITY DEFINER
  - Drop and recreate super_admin policies using the function
  - Drop and recreate school admin policies using the function
*/

-- Create a security definer function to check if current user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
$$;

-- Create a security definer function to check user role
CREATE OR REPLACE FUNCTION public.user_has_role(check_role text)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = check_role
  );
$$;

-- Drop existing super_admin policies that cause recursion
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;

-- Drop school admin policies that may cause recursion
DROP POLICY IF EXISTS "School staff can view profiles in their school" ON profiles;
DROP POLICY IF EXISTS "School staff can insert profiles" ON profiles;

-- Recreate super_admin policies using security definer function
CREATE POLICY "Super admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "Super admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

CREATE POLICY "Super admins can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- Recreate school admin policy using security definer function
CREATE POLICY "School staff can view profiles in their school"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.school_id = profiles.school_id
      AND p.role IN ('school_admin', 'marketing', 'operations', 'risk')
      AND profiles.id != auth.uid()  -- Prevent recursion for own profile
    )
  );

CREATE POLICY "School staff can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin() OR user_has_role('school_admin'));
