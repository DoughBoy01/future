/*
  # Fix Infinite Recursion in Profiles RLS - Version 3

  ## Problem
  Functions can't be dropped due to policy dependencies. Need to drop policies first.

  ## Solution
  1. Drop all policies that depend on the functions
  2. Drop and recreate functions with proper RLS bypass
  3. Recreate all policies using the new functions
*/

-- Drop all policies first
DROP POLICY IF EXISTS "Super admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "School staff can view profiles in their school" ON profiles;
DROP POLICY IF EXISTS "School staff can insert profiles" ON profiles;

-- Now drop and recreate functions
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.user_has_role(text) CASCADE;

-- Create is_super_admin with proper RLS bypass
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

-- Create user_has_role with proper RLS bypass
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

-- Create function to get user's school_id
CREATE OR REPLACE FUNCTION public.get_user_school_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  school uuid;
BEGIN
  SELECT school_id 
  FROM public.profiles 
  WHERE id = auth.uid()
  INTO school;
  
  RETURN school;
END;
$$;

-- Create function to check if user is school staff
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

-- Recreate super_admin policies
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

-- Recreate school staff policies using helper functions
CREATE POLICY "School staff can view profiles in their school"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    is_school_staff() 
    AND get_user_school_id() IS NOT NULL 
    AND school_id = get_user_school_id()
    AND id != auth.uid()
  );

CREATE POLICY "School staff can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin() OR user_has_role('school_admin'));
