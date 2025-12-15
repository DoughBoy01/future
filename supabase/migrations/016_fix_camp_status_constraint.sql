-- Migration: Fix camp status constraint to include all status values
-- Description: Updates the CHECK constraint to include 'full', 'cancelled', and 'completed' statuses

-- Drop the existing constraint
ALTER TABLE camps
DROP CONSTRAINT IF EXISTS camps_status_check;

-- Add updated constraint with all status values
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
  'rejected',           -- Admin rejected the camp
  'full',               -- Camp is at capacity
  'cancelled',          -- Camp has been cancelled
  'completed'           -- Camp has finished
));

COMMENT ON CONSTRAINT camps_status_check ON camps IS 'Ensures camp status is one of the valid workflow states';
