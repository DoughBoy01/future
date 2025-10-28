/*
  # Add Feedback Visibility and Featured Columns

  ## Overview
  Adds missing columns to the feedback table that are required by the application
  for managing review visibility and featuring reviews.

  ## Changes Made

  ### Feedback Table Enhancements
  New columns added:
  - `visible` (boolean) - Controls whether the review is publicly visible
    - Default: true (all existing reviews remain visible)
    - NOT NULL constraint ensures explicit visibility state
  - `featured` (boolean) - Marks reviews as featured/highlighted
    - Default: false (existing reviews are not featured by default)
    - NOT NULL constraint ensures explicit featured state

  ## Security
  - Maintains existing RLS policies on the feedback table
  - No changes to access control patterns
  - All existing feedback records are updated with default values

  ## Performance
  - Indexes added for efficient filtering by visibility and featured status
  - Optimizes queries that filter visible or featured reviews

  ## Notes
  - Existing feedback records will have visible=true and featured=false by default
  - These flags allow admins to moderate reviews and highlight quality feedback
  - Compatible with existing application code expecting these columns
*/

-- =====================================================
-- ADD MISSING COLUMNS TO FEEDBACK TABLE
-- =====================================================

DO $$
BEGIN
  -- Add visible column (controls public visibility)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'visible'
  ) THEN
    ALTER TABLE feedback ADD COLUMN visible boolean DEFAULT true NOT NULL;
  END IF;

  -- Add featured column (marks reviews as featured)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'featured'
  ) THEN
    ALTER TABLE feedback ADD COLUMN featured boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for filtering visible reviews (most common query)
CREATE INDEX IF NOT EXISTS idx_feedback_visible ON feedback(visible) WHERE visible = true;

-- Index for filtering featured reviews
CREATE INDEX IF NOT EXISTS idx_feedback_featured ON feedback(featured) WHERE featured = true;

-- Composite index for filtering by camp and visibility
CREATE INDEX IF NOT EXISTS idx_feedback_camp_visible ON feedback(camp_id, visible) WHERE visible = true;

-- =====================================================
-- ADD COLUMN COMMENTS
-- =====================================================

COMMENT ON COLUMN feedback.visible IS 'Controls whether the review is publicly visible. Set to false to hide inappropriate or disputed reviews.';
COMMENT ON COLUMN feedback.featured IS 'Marks exceptional reviews to be highlighted on camp detail pages and marketing materials.';
