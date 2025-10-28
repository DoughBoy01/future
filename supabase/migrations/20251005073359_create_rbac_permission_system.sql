/*
  # Role-Based Access Control - Core Permission Infrastructure

  ## Overview
  Creates the foundational permission system for comprehensive RBAC across the CRM and CMS platform.
  This migration establishes standardized permissions, role-permission mappings, and user-specific overrides.

  ## New Tables

  ### 1. `permission_groups`
  Logical groupings of related permissions for organization and management
  - `id` (uuid, primary key)
  - `name` (text, unique) - Group name (e.g., "Camp Management", "Financial Operations")
  - `description` (text) - Detailed description of permission group
  - `display_order` (integer) - Sort order for UI display
  - `created_at` (timestamptz)

  ### 2. `permissions`
  Granular permissions defining specific actions on resources
  - `id` (uuid, primary key)
  - `group_id` (uuid, references permission_groups) - Parent group
  - `name` (text, unique) - Permission identifier (e.g., "camps.create", "registrations.approve")
  - `display_name` (text) - Human-readable name
  - `description` (text) - Detailed explanation of permission
  - `resource_type` (text) - Resource this permission applies to
  - `action` (text) - Action type (create, read, update, delete, approve, publish, etc.)
  - `scope_level` (text) - Scope: platform, school, camp, individual
  - `requires_approval` (boolean) - Whether using this permission triggers approval workflow
  - `created_at` (timestamptz)

  ### 3. `role_permissions`
  Junction table mapping permissions to roles
  - `id` (uuid, primary key)
  - `role` (text) - Role name matching profiles.role enum
  - `permission_id` (uuid, references permissions)
  - `granted` (boolean) - Whether permission is granted or explicitly denied
  - `created_at` (timestamptz)
  - UNIQUE(role, permission_id)

  ### 4. `user_permission_overrides`
  User-specific permission exceptions overriding role defaults
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles) - User receiving override
  - `permission_id` (uuid, references permissions)
  - `granted` (boolean) - Whether permission is granted or denied
  - `granted_by` (uuid, references profiles) - Admin who granted override
  - `reason` (text) - Justification for override
  - `expires_at` (timestamptz, nullable) - Optional expiration for temporary access
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - UNIQUE(user_id, permission_id)

  ### 5. `permission_dependencies`
  Defines permissions that require other permissions as prerequisites
  - `id` (uuid, primary key)
  - `permission_id` (uuid, references permissions) - Permission that has dependency
  - `depends_on_permission_id` (uuid, references permissions) - Required permission
  - `created_at` (timestamptz)

  ### 6. `audit_logs`
  Comprehensive audit trail for all permission-related actions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles) - User who performed action
  - `action` (text) - Action type (permission_check, permission_granted, permission_denied, etc.)
  - `resource_type` (text) - Type of resource accessed
  - `resource_id` (uuid, nullable) - Specific resource accessed
  - `permission_name` (text) - Permission being checked or used
  - `granted` (boolean) - Whether permission was granted
  - `metadata` (jsonb) - Additional context (IP address, user agent, etc.)
  - `created_at` (timestamptz)

  ## Security
  
  All tables have Row Level Security (RLS) enabled with restrictive policies:
  
  - Permission Groups: Readable by all authenticated users; manageable by super_admin only
  - Permissions: Readable by all authenticated users; manageable by super_admin only
  - Role Permissions: Readable by all authenticated users; manageable by super_admin only
  - User Permission Overrides: Users can view their own; school_admin and super_admin can manage
  - Permission Dependencies: Readable by all authenticated users; manageable by super_admin only
  - Audit Logs: Users can view their own; admins can view school-level; super_admin views all

  ## Indexes
  
  Critical indexes for performance on:
  - Foreign key relationships
  - Permission lookups by name and resource type
  - Role-permission joins
  - User permission override lookups
  - Audit log queries by user, resource, and timestamp
*/

-- =============================================
-- PERMISSION GROUPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS permission_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_permission_groups_display_order ON permission_groups(display_order);

ALTER TABLE permission_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permission groups are viewable by authenticated users"
  ON permission_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage permission groups"
  ON permission_groups FOR ALL
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
-- PERMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES permission_groups(id) ON DELETE CASCADE,
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  resource_type text NOT NULL,
  action text NOT NULL,
  scope_level text DEFAULT 'school' CHECK (scope_level IN ('platform', 'school', 'camp', 'individual')),
  requires_approval boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_permissions_group_id ON permissions(group_id);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON permissions(name);
CREATE INDEX IF NOT EXISTS idx_permissions_resource_type ON permissions(resource_type);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permissions are viewable by authenticated users"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage permissions"
  ON permissions FOR ALL
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
-- ROLE PERMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('parent', 'school_admin', 'marketing', 'operations', 'risk', 'super_admin', 'content_editor', 'accountant', 'camp_counselor', 'support_agent')),
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  granted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role permissions are viewable by authenticated users"
  ON role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage role permissions"
  ON role_permissions FOR ALL
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
-- USER PERMISSION OVERRIDES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS user_permission_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  granted boolean DEFAULT true,
  granted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text NOT NULL,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_user_id ON user_permission_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_permission_id ON user_permission_overrides(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permission_overrides_expires_at ON user_permission_overrides(expires_at);

ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own permission overrides"
  ON user_permission_overrides FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "School admins can view overrides in their school"
  ON user_permission_overrides FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN profiles AS target_user ON target_user.id = user_permission_overrides.user_id
      WHERE p.id = auth.uid()
      AND p.school_id = target_user.school_id
      AND p.role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "School admins can manage overrides in their school"
  ON user_permission_overrides FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN profiles AS target_user ON target_user.id = user_permission_overrides.user_id
      WHERE p.id = auth.uid()
      AND p.school_id = target_user.school_id
      AND p.role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "School admins can update overrides in their school"
  ON user_permission_overrides FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN profiles AS target_user ON target_user.id = user_permission_overrides.user_id
      WHERE p.id = auth.uid()
      AND p.school_id = target_user.school_id
      AND p.role IN ('school_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN profiles AS target_user ON target_user.id = user_permission_overrides.user_id
      WHERE p.id = auth.uid()
      AND p.school_id = target_user.school_id
      AND p.role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "School admins can delete overrides in their school"
  ON user_permission_overrides FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN profiles AS target_user ON target_user.id = user_permission_overrides.user_id
      WHERE p.id = auth.uid()
      AND p.school_id = target_user.school_id
      AND p.role IN ('school_admin', 'super_admin')
    )
  );

-- =============================================
-- PERMISSION DEPENDENCIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS permission_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  depends_on_permission_id uuid REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(permission_id, depends_on_permission_id)
);

CREATE INDEX IF NOT EXISTS idx_permission_dependencies_permission_id ON permission_dependencies(permission_id);
CREATE INDEX IF NOT EXISTS idx_permission_dependencies_depends_on ON permission_dependencies(depends_on_permission_id);

ALTER TABLE permission_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permission dependencies are viewable by authenticated users"
  ON permission_dependencies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage permission dependencies"
  ON permission_dependencies FOR ALL
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
-- AUDIT LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  permission_name text,
  granted boolean,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "School admins can view school audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      JOIN profiles AS target_user ON target_user.id = audit_logs.user_id
      WHERE p.id = auth.uid()
      AND p.school_id = target_user.school_id
      AND p.role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "Super admins can view all audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp on user_permission_overrides
CREATE OR REPLACE FUNCTION update_user_permission_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_permission_overrides_timestamp') THEN
    CREATE TRIGGER update_user_permission_overrides_timestamp
      BEFORE UPDATE ON user_permission_overrides
      FOR EACH ROW EXECUTE FUNCTION update_user_permission_overrides_updated_at();
  END IF;
END $$;

-- Function to check if a user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(
  p_user_id uuid,
  p_permission_name text
)
RETURNS boolean AS $$
DECLARE
  v_has_permission boolean;
  v_user_role text;
  v_permission_id uuid;
BEGIN
  -- Get user's role
  SELECT role INTO v_user_role
  FROM profiles
  WHERE id = p_user_id;

  IF v_user_role IS NULL THEN
    RETURN false;
  END IF;

  -- Get permission ID
  SELECT id INTO v_permission_id
  FROM permissions
  WHERE name = p_permission_name;

  IF v_permission_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check for user-specific override (takes precedence)
  SELECT granted INTO v_has_permission
  FROM user_permission_overrides
  WHERE user_id = p_user_id
  AND permission_id = v_permission_id
  AND (expires_at IS NULL OR expires_at > now());

  IF v_has_permission IS NOT NULL THEN
    RETURN v_has_permission;
  END IF;

  -- Check role permissions
  SELECT granted INTO v_has_permission
  FROM role_permissions
  WHERE role = v_user_role
  AND permission_id = v_permission_id;

  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all permissions for a user
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id uuid)
RETURNS TABLE (
  permission_name text,
  granted boolean,
  source text
) AS $$
BEGIN
  RETURN QUERY
  WITH user_role AS (
    SELECT role FROM profiles WHERE id = p_user_id
  ),
  role_perms AS (
    SELECT 
      p.name as permission_name,
      rp.granted,
      'role' as source
    FROM role_permissions rp
    JOIN permissions p ON p.id = rp.permission_id
    JOIN user_role ur ON ur.role = rp.role
  ),
  override_perms AS (
    SELECT 
      p.name as permission_name,
      upo.granted,
      'override' as source
    FROM user_permission_overrides upo
    JOIN permissions p ON p.id = upo.permission_id
    WHERE upo.user_id = p_user_id
    AND (upo.expires_at IS NULL OR upo.expires_at > now())
  )
  SELECT 
    COALESCE(op.permission_name, rp.permission_name) as permission_name,
    COALESCE(op.granted, rp.granted) as granted,
    COALESCE(op.source, rp.source) as source
  FROM role_perms rp
  FULL OUTER JOIN override_perms op ON rp.permission_name = op.permission_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;