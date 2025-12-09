-- Migration: Create organisation_members table
-- Phase 1: Core Setup - Step 2
-- Description: Enables multiple users per organisation with role-based permissions

CREATE TABLE IF NOT EXISTS organisation_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff', 'viewer')),
  permissions JSONB DEFAULT '{"manage_camps": true, "view_bookings": true, "manage_payouts": false}'::jsonb,
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure a user can only be in an organisation once
  UNIQUE(organisation_id, profile_id)
);

-- Add indexes for common queries
CREATE INDEX idx_organisation_members_org_id ON organisation_members(organisation_id);
CREATE INDEX idx_organisation_members_profile_id ON organisation_members(profile_id);
CREATE INDEX idx_organisation_members_status ON organisation_members(status);

-- Add trigger to update updated_at
CREATE TRIGGER update_organisation_members_updated_at
  BEFORE UPDATE ON organisation_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE organisation_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of organisations they belong to
CREATE POLICY "Users can view their organisation members"
  ON organisation_members FOR SELECT
  USING (
    profile_id = auth.uid() OR
    organisation_id IN (
      SELECT organisation_id FROM organisation_members WHERE profile_id = auth.uid()
    ) OR
    is_super_admin()
  );

-- Policy: Organisation owners/admins can manage members
CREATE POLICY "Owners and admins can manage members"
  ON organisation_members FOR ALL
  USING (
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE profile_id = auth.uid() AND role IN ('owner', 'admin')
    ) OR
    is_super_admin()
  );

-- Helper function to check if user is a member of an organisation
CREATE OR REPLACE FUNCTION is_organisation_member(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organisation_members
    WHERE organisation_id = org_id
      AND profile_id = auth.uid()
      AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's organisation role
CREATE OR REPLACE FUNCTION get_organisation_role(org_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM organisation_members
    WHERE organisation_id = org_id
      AND profile_id = auth.uid()
      AND status = 'active'
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE organisation_members IS 'Manages multiple users per organisation with role-based permissions';
COMMENT ON COLUMN organisation_members.role IS 'Member role: owner (full control), admin (manage camps/members), staff (manage camps), viewer (read-only)';
COMMENT ON COLUMN organisation_members.permissions IS 'Granular permissions JSON object for fine-grained access control';
COMMENT ON COLUMN organisation_members.status IS 'Membership status: pending (invited), active, suspended, removed';
