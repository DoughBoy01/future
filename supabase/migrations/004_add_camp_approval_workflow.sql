-- Migration: Add camp approval workflow and status constraints
-- Phase 1: Core Setup - Step 4 & Phase 2: Workflows - Step 1
-- Description: Defines camp status workflow and adds approval tracking fields

-- Add CHECK constraint for camp status
ALTER TABLE camps
DROP CONSTRAINT IF EXISTS camps_status_check;

ALTER TABLE camps
ADD CONSTRAINT camps_status_check
CHECK (status IN (
  'draft',              -- Camp being created by organizer
  'pending_review',     -- Submitted for admin approval
  'requires_changes',   -- Admin requested changes
  'approved',           -- Admin approved, ready to publish
  'published',          -- Live on the platform
  'unpublished',        -- Temporarily hidden
  'archived',           -- Past camp or permanently removed
  'rejected'            -- Admin rejected the camp
));

-- Add approval tracking fields
ALTER TABLE camps
ADD COLUMN IF NOT EXISTS submitted_for_review_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS review_notes TEXT,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS changes_requested TEXT;

-- Add auto-publish flag (for trusted organizations)
ALTER TABLE camps
ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN DEFAULT FALSE;

-- Update existing camps to have valid status
UPDATE camps
SET status = CASE
  WHEN status IS NULL OR status = '' THEN 'draft'
  WHEN status = 'active' THEN 'published'
  WHEN status = 'inactive' THEN 'unpublished'
  ELSE status
END
WHERE status IS NULL OR status NOT IN (
  'draft', 'pending_review', 'requires_changes', 'approved',
  'published', 'unpublished', 'archived', 'rejected'
);

-- Make status NOT NULL with default
ALTER TABLE camps
ALTER COLUMN status SET DEFAULT 'draft',
ALTER COLUMN status SET NOT NULL;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_camps_status ON camps(status);
CREATE INDEX IF NOT EXISTS idx_camps_reviewed_by ON camps(reviewed_by) WHERE reviewed_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_camps_pending_review
  ON camps(submitted_for_review_at)
  WHERE status = 'pending_review';

-- Helper function to check if user can edit camp
CREATE OR REPLACE FUNCTION can_edit_camp(camp_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  camp_org_id UUID;
  camp_status TEXT;
BEGIN
  -- Get camp organisation and status
  SELECT organisation_id, status INTO camp_org_id, camp_status
  FROM camps WHERE id = camp_id;

  -- Super admins can edit any camp
  IF is_super_admin() THEN
    RETURN TRUE;
  END IF;

  -- Camp organizers can only edit their own org's camps
  -- And only if status allows editing
  RETURN (
    is_organisation_member(camp_org_id) AND
    camp_status IN ('draft', 'requires_changes', 'unpublished')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user can approve/reject camps
CREATE OR REPLACE FUNCTION can_review_camps()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_super_admin() OR (
    SELECT role IN ('school_admin', 'operations', 'marketing')
    FROM profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-set submitted_for_review_at
CREATE OR REPLACE FUNCTION set_submitted_for_review_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending_review' AND OLD.status != 'pending_review' THEN
    NEW.submitted_for_review_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER camps_set_submitted_for_review
  BEFORE UPDATE ON camps
  FOR EACH ROW
  EXECUTE FUNCTION set_submitted_for_review_timestamp();

-- Trigger to auto-set reviewed_at
CREATE OR REPLACE FUNCTION set_reviewed_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('approved', 'rejected', 'requires_changes')
     AND OLD.status = 'pending_review' THEN
    NEW.reviewed_at = NOW();
    NEW.reviewed_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER camps_set_reviewed
  BEFORE UPDATE ON camps
  FOR EACH ROW
  EXECUTE FUNCTION set_reviewed_timestamp();

-- Trigger to auto-publish approved camps (if auto_publish is TRUE)
CREATE OR REPLACE FUNCTION auto_publish_approved_camp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.auto_publish = TRUE THEN
    NEW.status = 'published';
    NEW.published_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER camps_auto_publish
  BEFORE UPDATE ON camps
  FOR EACH ROW
  EXECUTE FUNCTION auto_publish_approved_camp();

-- Add comments
COMMENT ON COLUMN camps.status IS 'Camp lifecycle status: draft → pending_review → approved → published';
COMMENT ON COLUMN camps.reviewed_by IS 'Admin who approved/rejected the camp';
COMMENT ON COLUMN camps.auto_publish IS 'Automatically publish when approved (for trusted organizations)';
COMMENT ON COLUMN camps.changes_requested IS 'Specific changes requested by admin for requires_changes status';
