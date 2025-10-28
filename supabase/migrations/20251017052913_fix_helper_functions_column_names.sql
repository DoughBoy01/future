/*
  # Fix Helper Functions Column Names

  ## Problem
  Helper functions still reference 'school_id' but the actual column is 'organisation_id'

  ## Solution
  Update all helper functions to use the correct column name 'organisation_id'
*/

-- Drop and recreate get_user_school_id to return organisation_id
DROP FUNCTION IF EXISTS public.get_user_school_id() CASCADE;

CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  org_id uuid;
BEGIN
  SELECT organisation_id 
  FROM public.profiles 
  WHERE id = auth.uid()
  INTO org_id;
  
  RETURN org_id;
END;
$$;

-- Verify is_super_admin still works
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Verify user_has_role still works
DROP FUNCTION IF EXISTS public.user_has_role(text) CASCADE;

CREATE OR REPLACE FUNCTION public.user_has_role(check_role text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = check_role
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Verify is_school_staff still works
DROP FUNCTION IF EXISTS public.is_school_staff() CASCADE;

CREATE OR REPLACE FUNCTION public.is_school_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  result BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('school_admin', 'marketing', 'operations', 'risk')
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Now recreate all the policies that depend on these functions
-- (They were dropped by CASCADE)

-- Profiles table policies
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

CREATE POLICY "Organisation staff can view profiles in their organisation"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    is_school_staff() 
    AND get_user_school_id() IS NOT NULL 
    AND organisation_id = get_user_school_id()
    AND id != auth.uid()
  );

CREATE POLICY "School staff can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin() OR user_has_role('school_admin'));
