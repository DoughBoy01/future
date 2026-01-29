/*
  # Add created_by column to organisations table

  ## Problem
  The organisations table is missing a `created_by` column, which causes
  errors during camp owner signup when trying to create an organization.

  ## Solution
  Add the `created_by` column as a nullable foreign key to profiles table.
  Set it to nullable since existing organizations may not have a creator.

  ## Related
  - Fixes signup error: "column "created_by" of relation "organisations" does not exist"
  - Allows tracking who created each organization
*/

-- Add created_by column to organisations table
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_organisations_created_by ON organisations(created_by) WHERE created_by IS NOT NULL;

-- Add comment
COMMENT ON COLUMN organisations.created_by IS 'Profile ID of the user who created this organization';
