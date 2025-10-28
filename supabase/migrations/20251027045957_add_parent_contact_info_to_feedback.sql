/*
  # Add Parent Contact Information to Feedback Table

  ## Overview
  Adds denormalized parent contact information columns to the feedback table
  to support efficient review display without requiring joins. This aligns the
  database schema with the application code expectations.

  ## Changes Made

  ### Feedback Table Enhancements
  
  1. New Columns Added:
    - `parent_name` (text, nullable) - Cached parent/reviewer name for display
      - Nullable to support anonymous reviews or missing data
      - Can be populated from profiles table via parent_id
    - `parent_email` (text, nullable) - Cached parent email for contact
      - Nullable to respect privacy and handle missing data
      - Used for review verification and communication

  2. Data Migration:
    - Backfills existing feedback records with parent information
    - Joins feedback -> parents -> profiles to get name and email
    - Safely handles NULL parent_id values
    - Constructs full name from first_name and last_name

  ## Design Rationale

  ### Why Denormalized Data?
  - Performance: Displaying reviews doesn't require joins to parents/profiles tables
  - Availability: Reviews remain readable even if parent account is deleted
  - Flexibility: Supports future features like guest reviews or imported reviews
  - Historical accuracy: Preserves reviewer name even if they change their profile

  ### Data Integrity Considerations
  - parent_id reference is maintained for authoritative parent data
  - These columns are cache/display fields, not source of truth
  - RLS policies continue to use parent_id for access control
  - Application code should populate these fields when creating reviews

  ## Security
  - Maintains existing RLS policies on the feedback table
  - No changes to access control patterns
  - Email is optional and can be omitted for privacy

  ## Performance
  - Reduces need for joins when displaying reviews
  - Indexes not added initially (can be added if filtering by name/email is needed)
  - Backfill query uses efficient join pattern

  ## Notes
  - Existing feedback records will be updated with parent data where available
  - Records with NULL parent_id will have NULL parent_name and parent_email
  - Application code should continue to set these fields when creating new reviews
*/

-- =====================================================
-- ADD PARENT CONTACT COLUMNS TO FEEDBACK TABLE
-- =====================================================

DO $$
BEGIN
  -- Add parent_name column (cached reviewer name)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'parent_name'
  ) THEN
    ALTER TABLE feedback ADD COLUMN parent_name text;
    COMMENT ON COLUMN feedback.parent_name IS 'Cached parent/reviewer name for display purposes. Populated from profiles table via parent_id.';
  END IF;

  -- Add parent_email column (cached contact email)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'parent_email'
  ) THEN
    ALTER TABLE feedback ADD COLUMN parent_email text;
    COMMENT ON COLUMN feedback.parent_email IS 'Cached parent email for contact and verification. May be NULL for privacy or missing data.';
  END IF;
END $$;

-- =====================================================
-- BACKFILL EXISTING FEEDBACK RECORDS
-- =====================================================

-- Update existing feedback records with parent information
-- This query safely handles NULL parent_id values
UPDATE feedback f
SET 
  parent_name = CONCAT(p.first_name, ' ', p.last_name),
  parent_email = (SELECT email FROM auth.users WHERE id = p.id)
FROM parents par
JOIN profiles p ON p.id = par.profile_id
WHERE f.parent_id = par.id
  AND f.parent_name IS NULL;

-- =====================================================
-- VERIFICATION QUERY (for logging/debugging)
-- =====================================================

-- Log the results of the migration
DO $$
DECLARE
  total_feedback INTEGER;
  updated_feedback INTEGER;
  null_parent_feedback INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_feedback FROM feedback;
  SELECT COUNT(*) INTO updated_feedback FROM feedback WHERE parent_name IS NOT NULL;
  SELECT COUNT(*) INTO null_parent_feedback FROM feedback WHERE parent_id IS NULL;
  
  RAISE NOTICE 'Migration completed:';
  RAISE NOTICE '  Total feedback records: %', total_feedback;
  RAISE NOTICE '  Records with parent_name: %', updated_feedback;
  RAISE NOTICE '  Records with NULL parent_id: %', null_parent_feedback;
END $$;
