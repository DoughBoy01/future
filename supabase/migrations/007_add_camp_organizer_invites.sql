-- Migration: Add camp organizer invite system
-- Phase 1: Security - Admin-controlled registration
-- Description: Implements invite-only registration for camp organizers to prevent unauthorized access

-- ============================================================================
-- CREATE INVITATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS camp_organizer_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Invite details
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,  -- Cryptographically secure random token

  -- Organisation linkage
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,

  -- Admin tracking
  invited_by UUID NOT NULL REFERENCES profiles(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  -- Profile created from this invite
  profile_id UUID REFERENCES profiles(id),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ADD INDEXES
-- ============================================================================

CREATE INDEX idx_invites_token ON camp_organizer_invites(token);
CREATE INDEX idx_invites_email ON camp_organizer_invites(email);
CREATE INDEX idx_invites_status ON camp_organizer_invites(status);
CREATE INDEX idx_invites_organisation ON camp_organizer_invites(organisation_id);
CREATE INDEX idx_invites_expires_at ON camp_organizer_invites(expires_at) WHERE status = 'pending';

-- ============================================================================
-- ADD TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_camp_organizer_invites_updated_at
  BEFORE UPDATE ON camp_organizer_invites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE camp_organizer_invites ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES FOR INVITES
-- ============================================================================

-- Policy: Only super admins can view all invites
CREATE POLICY "Super admins can view all invites"
  ON camp_organizer_invites FOR SELECT
  USING (is_super_admin());

-- Policy: Only super admins can create invites
CREATE POLICY "Super admins can create invites"
  ON camp_organizer_invites FOR INSERT
  WITH CHECK (is_super_admin());

-- Policy: Only super admins can update invites (revoke, resend)
CREATE POLICY "Super admins can manage invites"
  ON camp_organizer_invites FOR UPDATE
  USING (is_super_admin());

-- Policy: Only super admins can delete invites
CREATE POLICY "Super admins can delete invites"
  ON camp_organizer_invites FOR DELETE
  USING (is_super_admin());

-- ============================================================================
-- VALIDATION FUNCTION
-- ============================================================================

-- Function to validate invite token and get details
CREATE OR REPLACE FUNCTION validate_invite_token(p_token TEXT)
RETURNS TABLE (
  invite_id UUID,
  email TEXT,
  organisation_id UUID,
  organisation_name TEXT,
  invited_by_id UUID,
  invited_by_name TEXT,
  is_valid BOOLEAN,
  error_message TEXT
) AS $$
DECLARE
  invite_record RECORD;
  org_record RECORD;
  inviter_record RECORD;
BEGIN
  -- Get invite record
  SELECT * INTO invite_record
  FROM camp_organizer_invites
  WHERE token = p_token;

  -- Check if invite exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT
      NULL::UUID,
      NULL::TEXT,
      NULL::UUID,
      NULL::TEXT,
      NULL::UUID,
      NULL::TEXT,
      FALSE,
      'Invalid invite token'::TEXT;
    RETURN;
  END IF;

  -- Check if already accepted
  IF invite_record.status = 'accepted' THEN
    RETURN QUERY SELECT
      invite_record.id,
      invite_record.email,
      invite_record.organisation_id,
      NULL::TEXT,
      invite_record.invited_by,
      NULL::TEXT,
      FALSE,
      'Invite already accepted'::TEXT;
    RETURN;
  END IF;

  -- Check if expired
  IF invite_record.expires_at < NOW() THEN
    RETURN QUERY SELECT
      invite_record.id,
      invite_record.email,
      invite_record.organisation_id,
      NULL::TEXT,
      invite_record.invited_by,
      NULL::TEXT,
      FALSE,
      'Invite expired'::TEXT;
    RETURN;
  END IF;

  -- Check if revoked
  IF invite_record.status = 'revoked' THEN
    RETURN QUERY SELECT
      invite_record.id,
      invite_record.email,
      invite_record.organisation_id,
      NULL::TEXT,
      invite_record.invited_by,
      NULL::TEXT,
      FALSE,
      'Invite revoked'::TEXT;
    RETURN;
  END IF;

  -- Get organisation details
  SELECT name INTO org_record
  FROM organisations
  WHERE id = invite_record.organisation_id;

  -- Get inviter details
  SELECT first_name || ' ' || last_name INTO inviter_record
  FROM profiles
  WHERE id = invite_record.invited_by;

  -- Valid invite
  RETURN QUERY SELECT
    invite_record.id,
    invite_record.email,
    invite_record.organisation_id,
    org_record.name,
    invite_record.invited_by,
    inviter_record.first_name,
    TRUE,
    'Valid'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTION: GET ORGANISATION NAME FROM INVITE TOKEN
-- ============================================================================

CREATE OR REPLACE FUNCTION get_organisation_from_invite(p_token TEXT)
RETURNS TEXT AS $$
DECLARE
  org_name TEXT;
BEGIN
  SELECT o.name INTO org_name
  FROM camp_organizer_invites i
  JOIN organisations o ON o.id = i.organisation_id
  WHERE i.token = p_token
    AND i.status = 'pending'
    AND i.expires_at > NOW();

  RETURN org_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: MARK INVITE AS ACCEPTED
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_invite_accepted(
  p_token TEXT,
  p_profile_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_invite_id UUID;
BEGIN
  -- Update invite status
  UPDATE camp_organizer_invites
  SET
    status = 'accepted',
    accepted_at = NOW(),
    profile_id = p_profile_id
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > NOW()
  RETURNING id INTO v_invite_id;

  RETURN v_invite_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: AUTO-EXPIRE PENDING INVITES
-- ============================================================================

CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE camp_organizer_invites
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;

  RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE camp_organizer_invites IS 'Tracks invitations sent to potential camp organizers by super admins';
COMMENT ON COLUMN camp_organizer_invites.token IS 'Cryptographically secure random token used in invite URL';
COMMENT ON COLUMN camp_organizer_invites.status IS 'Invite lifecycle: pending → accepted (or expired/revoked)';
COMMENT ON COLUMN camp_organizer_invites.expires_at IS 'Invites expire after 7 days by default';
COMMENT ON FUNCTION validate_invite_token IS 'Validates invite token and returns invite details with organisation info';
COMMENT ON FUNCTION mark_invite_accepted IS 'Marks an invite as accepted when camp organizer completes registration';
COMMENT ON FUNCTION expire_old_invites IS 'Batch function to mark expired invites - run via cron job';
