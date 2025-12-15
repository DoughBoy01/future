-- Migration: Create roles table and role management system
-- Description: Creates a proper roles table with predefined system roles
-- and allows admins to assign roles to users

-- =============================================
-- ROLES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  level integer NOT NULL DEFAULT 1, -- Hierarchy level (1=lowest, 5=highest)
  is_system_role boolean DEFAULT true, -- System roles cannot be deleted
  permissions jsonb DEFAULT '{}', -- Role-specific permissions/capabilities
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster role lookups
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_level ON roles(level);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view roles
CREATE POLICY "Roles are viewable by authenticated users"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- Only super admins can manage roles
CREATE POLICY "Super admins can manage roles"
  ON roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- =============================================
-- SEED PREDEFINED ROLES
-- =============================================
INSERT INTO roles (name, display_name, description, level, is_system_role, permissions) VALUES
  ('super_admin', 'Super Admin', 'Full system access with all privileges. Can manage all users, camps, organizations, and system settings.', 5, true, '{"can_manage_users": true, "can_manage_roles": true, "can_manage_camps": true, "can_manage_organizations": true, "can_view_analytics": true, "can_manage_settings": true}'::jsonb),
  ('camp_organizer', 'Camp Organizer', 'Organization administrators who can create and manage their own camps, view bookings, and manage their organization settings.', 4, true, '{"can_create_camps": true, "can_edit_own_camps": true, "can_view_own_bookings": true, "can_manage_own_organization": true, "can_view_own_analytics": true}'::jsonb),
  ('school_admin', 'School Admin', 'School administrators who can manage school-related content, view school analytics, and coordinate with camp organizers.', 3, true, '{"can_view_camps": true, "can_manage_school_content": true, "can_view_school_analytics": true, "can_contact_organizers": true}'::jsonb),
  ('parent', 'Parent', 'Parents who can browse camps, make bookings, manage their children profiles, and view their booking history.', 2, true, '{"can_browse_camps": true, "can_make_bookings": true, "can_manage_children": true, "can_view_own_bookings": true, "can_leave_reviews": true}'::jsonb),
  ('user', 'User', 'Basic authenticated user with limited access. Can browse public content and view their own profile.', 1, true, '{"can_view_public_content": true, "can_view_own_profile": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- ROLE ASSIGNMENT AUDIT LOG
-- =============================================
CREATE TABLE IF NOT EXISTS role_assignment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  old_role text,
  new_role text NOT NULL,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_role_assignment_history_user_id ON role_assignment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_role_assignment_history_assigned_by ON role_assignment_history(assigned_by);
CREATE INDEX IF NOT EXISTS idx_role_assignment_history_created_at ON role_assignment_history(created_at DESC);

-- Enable RLS
ALTER TABLE role_assignment_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own role history
CREATE POLICY "Users can view own role assignment history"
  ON role_assignment_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Super admins can view all role assignment history
CREATE POLICY "Super admins can view all role assignment history"
  ON role_assignment_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Only super admins can insert into role assignment history (via trigger)
CREATE POLICY "Super admins can insert role assignment history"
  ON role_assignment_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- =============================================
-- TRIGGER TO LOG ROLE CHANGES
-- =============================================
CREATE OR REPLACE FUNCTION log_role_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if role actually changed
  IF (OLD.role IS DISTINCT FROM NEW.role) THEN
    INSERT INTO role_assignment_history (user_id, old_role, new_role, assigned_by, reason)
    VALUES (
      NEW.id,
      OLD.role,
      NEW.role,
      auth.uid(),
      'Role updated via admin panel'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trigger_log_role_assignment ON profiles;
CREATE TRIGGER trigger_log_role_assignment
  AFTER UPDATE OF role ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_role_assignment();

-- =============================================
-- UPDATE PROFILES ROLE CONSTRAINT
-- =============================================
-- Update the CHECK constraint to match our new roles table
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('super_admin', 'camp_organizer', 'school_admin', 'parent', 'user'));

-- Update column comment
COMMENT ON COLUMN profiles.role IS 'User role: super_admin, camp_organizer, school_admin, parent, user';

-- =============================================
-- UPDATE ROLE_PERMISSIONS TABLE (if it exists)
-- =============================================
-- Update the role_permissions table to match new roles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_permissions') THEN
    ALTER TABLE role_permissions DROP CONSTRAINT IF EXISTS role_permissions_role_check;
    ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_role_check
    CHECK (role IN ('super_admin', 'camp_organizer', 'school_admin', 'parent', 'user'));
  END IF;
END $$;

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get role details by name
CREATE OR REPLACE FUNCTION get_role_details(p_role_name text)
RETURNS TABLE (
  id uuid,
  name text,
  display_name text,
  description text,
  level integer,
  permissions jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.display_name, r.description, r.level, r.permissions
  FROM roles r
  WHERE r.name = p_role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user can assign a specific role
CREATE OR REPLACE FUNCTION can_assign_role(p_target_role text)
RETURNS boolean AS $$
DECLARE
  v_user_role text;
  v_user_level integer;
  v_target_level integer;
BEGIN
  -- Get current user's role
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = auth.uid();

  -- Only super_admin can assign roles
  IF v_user_role != 'super_admin' THEN
    RETURN false;
  END IF;

  -- Get role levels
  SELECT level INTO v_user_level FROM roles WHERE name = v_user_role;
  SELECT level INTO v_target_level FROM roles WHERE name = p_target_role;

  -- Super admins can assign any role
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user role (with audit logging)
CREATE OR REPLACE FUNCTION update_user_role(
  p_user_id uuid,
  p_new_role text,
  p_reason text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_old_role text;
  v_can_assign boolean;
BEGIN
  -- Check if current user can assign this role
  SELECT can_assign_role(p_new_role) INTO v_can_assign;

  IF NOT v_can_assign THEN
    RAISE EXCEPTION 'You do not have permission to assign this role';
  END IF;

  -- Get current role
  SELECT role INTO v_old_role FROM profiles WHERE id = p_user_id;

  -- Update the role
  UPDATE profiles
  SET role = p_new_role, updated_at = now()
  WHERE id = p_user_id;

  -- The trigger will automatically log this change

  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to update role: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all users with a specific role
CREATE OR REPLACE FUNCTION get_users_by_role(p_role text)
RETURNS TABLE (
  id uuid,
  first_name text,
  last_name text,
  email text,
  role text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.first_name,
    p.last_name,
    au.email,
    p.role,
    p.created_at
  FROM profiles p
  LEFT JOIN auth.users au ON au.id = p.id
  WHERE p.role = p_role
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated timestamp trigger for roles table
CREATE OR REPLACE FUNCTION update_roles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_roles_timestamp ON roles;
CREATE TRIGGER trigger_update_roles_timestamp
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_roles_updated_at();

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE roles IS 'System roles with defined permissions and hierarchy levels';
COMMENT ON TABLE role_assignment_history IS 'Audit log of all role changes made to user accounts';
COMMENT ON FUNCTION update_user_role IS 'Admin function to update a user role with automatic audit logging';
COMMENT ON FUNCTION can_assign_role IS 'Check if the current user has permission to assign a specific role';
COMMENT ON FUNCTION get_role_details IS 'Get detailed information about a specific role';
COMMENT ON FUNCTION get_users_by_role IS 'Get all users with a specific role';
