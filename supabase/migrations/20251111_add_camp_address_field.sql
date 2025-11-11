/*
  # Add Camp Address Field

  ## Overview
  Adds a dedicated camp_address field to the camps table to store detailed physical addresses.
  This field complements the existing location field which stores general location descriptors.

  ## Changes Made

  ### 1. Camps Table Enhancement
  New field added:
  - `camp_address` (text, nullable) - Detailed physical address for the camp venue
    - Positioned after the location field logically
    - Stores complete address information (street, building, city, postal code)
    - Nullable to allow gradual data population
    - Indexed for search performance

  ## Field Usage
  - `location` - General location descriptor (e.g., "School Campus", "Tokyo - Japan", "Borneo")
  - `camp_address` - Full physical address (e.g., "123 Main Street, Building A, Tokyo 100-0001")

  ## Security
  - Inherits existing RLS policies from camps table
  - No changes to access control patterns
  - Read access follows existing published/staff visibility rules

  ## Notes
  - Field is nullable to support existing camps without addresses
  - Can be populated via form, CSV import, or API
  - Searchable via full-text search when populated
*/

-- =====================================================
-- ADD CAMP_ADDRESS FIELD TO CAMPS TABLE
-- =====================================================

DO $$
BEGIN
  -- Add camp_address field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'camp_address'
  ) THEN
    ALTER TABLE camps ADD COLUMN camp_address text DEFAULT NULL;

    -- Add comment explaining the field
    COMMENT ON COLUMN camps.camp_address IS 'Detailed physical address for the camp venue. Use location field for general location descriptor and camp_address for complete street address.';
  END IF;
END $$;

-- =====================================================
-- CREATE INDEX FOR ADDRESS SEARCH
-- =====================================================

-- Index for searching camps by address
CREATE INDEX IF NOT EXISTS idx_camps_address ON camps(camp_address) WHERE camp_address IS NOT NULL;

-- GIN index for full-text search on address (if needed for search features)
CREATE INDEX IF NOT EXISTS idx_camps_address_gin ON camps USING gin (to_tsvector('english', coalesce(camp_address, '')));
