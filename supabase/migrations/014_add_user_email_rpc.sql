-- Migration: Add RPC function to get user emails for admin
-- Description: Creates a function to fetch user emails from auth.users
-- This is needed because regular users can't access auth.users directly

-- Function to get all users with emails (super_admin only)
CREATE OR REPLACE FUNCTION get_all_users_with_emails()
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  last_name text,
  role text,
  created_at timestamptz,
  last_seen_at timestamptz,
  organisation_id uuid
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is super_admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Super admin role required.';
  END IF;

  -- Return all users with their emails from auth.users
  RETURN QUERY
  SELECT
    p.id,
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at,
    p.last_seen_at,
    p.organisation_id
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_all_users_with_emails() TO authenticated;

-- Function to get users filtered by role with emails
CREATE OR REPLACE FUNCTION get_users_by_role_with_emails(p_role text)
RETURNS TABLE (
  id uuid,
  email text,
  first_name text,
  last_name text,
  role text,
  created_at timestamptz,
  last_seen_at timestamptz,
  organisation_id uuid
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is super_admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied. Super admin role required.';
  END IF;

  -- Return filtered users
  RETURN QUERY
  SELECT
    p.id,
    au.email,
    p.first_name,
    p.last_name,
    p.role,
    p.created_at,
    p.last_seen_at,
    p.organisation_id
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  WHERE p.role = p_role
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_users_by_role_with_emails(text) TO authenticated;

-- Add comments
COMMENT ON FUNCTION get_all_users_with_emails IS 'Get all users with their email addresses. Super admin only.';
COMMENT ON FUNCTION get_users_by_role_with_emails IS 'Get users filtered by role with their email addresses. Super admin only.';
