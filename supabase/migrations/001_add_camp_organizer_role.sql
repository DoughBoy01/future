-- Migration: Add camp_organizer role support
-- Phase 1: Core Setup - Step 1
-- Description: Adds camp_organizer as a valid role in the profiles table

-- Note: profiles.role is currently a TEXT field, not an enum
-- We'll add a CHECK constraint to validate roles

-- Add CHECK constraint for valid roles
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('parent', 'super_admin', 'school_admin', 'marketing', 'operations', 'risk', 'camp_organizer'));

-- Add comment documenting the role
COMMENT ON COLUMN profiles.role IS 'User role: parent, super_admin, school_admin, marketing, operations, risk, camp_organizer';

-- Update existing RLS helper functions to support camp_organizer role
CREATE OR REPLACE FUNCTION is_camp_organizer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'camp_organizer'
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_camp_organizer IS 'Check if current user has camp_organizer role';
