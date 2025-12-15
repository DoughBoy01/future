-- Migration: Make organisation_id optional in camp_organizer_invites
-- This allows invites to be sent without requiring a pre-existing organisation
-- Camp organizers will create their own organisation during onboarding

-- Make organisation_id nullable
ALTER TABLE camp_organizer_invites
  ALTER COLUMN organisation_id DROP NOT NULL;

-- Add comment explaining the change
COMMENT ON COLUMN camp_organizer_invites.organisation_id IS
  'Optional organisation linkage. If NULL, camp organizer will create their own organisation during onboarding';
