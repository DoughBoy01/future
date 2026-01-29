/*
  # Fix onboarding_status CHECK constraint

  ## Problem
  The organisations table onboarding_status CHECK constraint is rejecting the value 'completed',
  but something in the system is trying to set it to that value.

  ## Solution
  Drop the old constraint and create a new one that includes 'completed' as a valid value.
*/

-- Drop the existing constraint
ALTER TABLE organisations
DROP CONSTRAINT IF EXISTS organisations_onboarding_status_check;

-- Add the new constraint with 'completed' included
ALTER TABLE organisations
ADD CONSTRAINT organisations_onboarding_status_check
CHECK (onboarding_status IN (
  'pending_application',
  'pending_verification',
  'pending_approval',
  'active',
  'suspended',
  'rejected',
  'completed'  -- Added to support completion status
));

COMMENT ON CONSTRAINT organisations_onboarding_status_check ON organisations
  IS 'Valid onboarding status values including completed state';
