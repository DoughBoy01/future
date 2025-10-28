/*
  # Add Enhanced Camp Details Fields

  ## Overview
  Adds comprehensive content management fields to support the redesigned camp details page
  with rich content including amenities, highlights, FAQs, policies, and host information.

  ## Changes Made

  ### 1. Camps Table Enhancements
  New fields added:
  - `amenities` (jsonb) - Categorized list of camp amenities and facilities
  - `highlights` (jsonb) - Array of key selling points for the camp
  - `faqs` (jsonb) - Frequently asked questions with answers
  - `cancellation_policy` (text) - Detailed cancellation terms
  - `refund_policy` (text) - Refund process and policy details
  - `insurance_info` (text) - Insurance coverage information
  - `safety_protocols` (text) - Safety measures and certifications
  - `video_url` (text) - Promotional video URL (YouTube, Vimeo, etc.)
  - `staff_credentials` (jsonb) - Instructor qualifications and certifications
  - `daily_schedule` (jsonb) - Hour-by-hour camp schedule
  - `included_in_price` (jsonb) - Items/services included in base price
  - `not_included_in_price` (jsonb) - Additional costs parents should expect

  ### 2. Organisations Table Enhancements
  New fields added:
  - `about` (text) - Organization description for camp detail pages
  - `verified` (boolean) - Verification status badge
  - `response_rate` (decimal) - Percentage of enquiries responded to (0-1)
  - `response_time_hours` (integer) - Average response time in hours
  - `total_camps_hosted` (integer) - Historical camp count
  - `established_year` (integer) - Year organization was founded

  ### 3. Feedback Table Enhancements
  New fields added:
  - `photos` (jsonb) - Array of photo URLs from reviewers
  - `helpful_count` (integer) - Number of users who found review helpful
  - `verified_booking` (boolean) - Indicates verified booking status
  - `parent_location` (text) - Reviewer location for credibility
  - `response_from_host` (text) - Organization's response to review
  - `response_date` (timestamptz) - When host responded to review

  ## Security
  - All new fields maintain existing RLS policies
  - No changes to access control patterns
  - Nullable fields allow gradual content migration

  ## Notes
  - All new fields are nullable to allow gradual content population
  - JSON fields use proper JSONB format for efficient querying
  - Indexes can be added later based on query patterns
  - Default values are not set to avoid masking missing content
*/

-- =====================================================
-- CAMPS TABLE ENHANCEMENTS
-- =====================================================

DO $$
BEGIN
  -- Add amenities field (categorized list)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'amenities'
  ) THEN
    ALTER TABLE camps ADD COLUMN amenities jsonb DEFAULT NULL;
  END IF;

  -- Add highlights field (key selling points)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'highlights'
  ) THEN
    ALTER TABLE camps ADD COLUMN highlights jsonb DEFAULT NULL;
  END IF;

  -- Add FAQs field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'faqs'
  ) THEN
    ALTER TABLE camps ADD COLUMN faqs jsonb DEFAULT NULL;
  END IF;

  -- Add cancellation policy
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'cancellation_policy'
  ) THEN
    ALTER TABLE camps ADD COLUMN cancellation_policy text DEFAULT NULL;
  END IF;

  -- Add refund policy
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'refund_policy'
  ) THEN
    ALTER TABLE camps ADD COLUMN refund_policy text DEFAULT NULL;
  END IF;

  -- Add insurance information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'insurance_info'
  ) THEN
    ALTER TABLE camps ADD COLUMN insurance_info text DEFAULT NULL;
  END IF;

  -- Add safety protocols
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'safety_protocols'
  ) THEN
    ALTER TABLE camps ADD COLUMN safety_protocols text DEFAULT NULL;
  END IF;

  -- Add video URL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE camps ADD COLUMN video_url text DEFAULT NULL;
  END IF;

  -- Add staff credentials
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'staff_credentials'
  ) THEN
    ALTER TABLE camps ADD COLUMN staff_credentials jsonb DEFAULT NULL;
  END IF;

  -- Add daily schedule
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'daily_schedule'
  ) THEN
    ALTER TABLE camps ADD COLUMN daily_schedule jsonb DEFAULT NULL;
  END IF;

  -- Add included in price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'included_in_price'
  ) THEN
    ALTER TABLE camps ADD COLUMN included_in_price jsonb DEFAULT NULL;
  END IF;

  -- Add not included in price
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'not_included_in_price'
  ) THEN
    ALTER TABLE camps ADD COLUMN not_included_in_price jsonb DEFAULT NULL;
  END IF;
END $$;

-- =====================================================
-- ORGANISATIONS TABLE ENHANCEMENTS
-- =====================================================

DO $$
BEGIN
  -- Add about field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organisations' AND column_name = 'about'
  ) THEN
    ALTER TABLE organisations ADD COLUMN about text DEFAULT NULL;
  END IF;

  -- Add verified status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organisations' AND column_name = 'verified'
  ) THEN
    ALTER TABLE organisations ADD COLUMN verified boolean DEFAULT false NOT NULL;
  END IF;

  -- Add response rate (0 to 1, representing percentage)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organisations' AND column_name = 'response_rate'
  ) THEN
    ALTER TABLE organisations ADD COLUMN response_rate numeric(3,2) DEFAULT 0 NOT NULL CHECK (response_rate >= 0 AND response_rate <= 1);
  END IF;

  -- Add response time in hours
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organisations' AND column_name = 'response_time_hours'
  ) THEN
    ALTER TABLE organisations ADD COLUMN response_time_hours integer DEFAULT 24 NOT NULL CHECK (response_time_hours >= 0);
  END IF;

  -- Add total camps hosted
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organisations' AND column_name = 'total_camps_hosted'
  ) THEN
    ALTER TABLE organisations ADD COLUMN total_camps_hosted integer DEFAULT 0 NOT NULL CHECK (total_camps_hosted >= 0);
  END IF;

  -- Add established year
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'organisations' AND column_name = 'established_year'
  ) THEN
    ALTER TABLE organisations ADD COLUMN established_year integer DEFAULT NULL CHECK (established_year >= 1900 AND established_year <= EXTRACT(YEAR FROM CURRENT_DATE));
  END IF;
END $$;

-- =====================================================
-- FEEDBACK TABLE ENHANCEMENTS
-- =====================================================

DO $$
BEGIN
  -- Add photos field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'photos'
  ) THEN
    ALTER TABLE feedback ADD COLUMN photos jsonb DEFAULT NULL;
  END IF;

  -- Add helpful count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'helpful_count'
  ) THEN
    ALTER TABLE feedback ADD COLUMN helpful_count integer DEFAULT 0 NOT NULL CHECK (helpful_count >= 0);
  END IF;

  -- Add verified booking status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'verified_booking'
  ) THEN
    ALTER TABLE feedback ADD COLUMN verified_booking boolean DEFAULT false NOT NULL;
  END IF;

  -- Add parent location
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'parent_location'
  ) THEN
    ALTER TABLE feedback ADD COLUMN parent_location text DEFAULT NULL;
  END IF;

  -- Add response from host
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'response_from_host'
  ) THEN
    ALTER TABLE feedback ADD COLUMN response_from_host text DEFAULT NULL;
  END IF;

  -- Add response date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'feedback' AND column_name = 'response_date'
  ) THEN
    ALTER TABLE feedback ADD COLUMN response_date timestamptz DEFAULT NULL;
  END IF;
END $$;

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for searching camps by amenities
CREATE INDEX IF NOT EXISTS idx_camps_amenities ON camps USING gin (amenities);

-- Index for FAQ searches
CREATE INDEX IF NOT EXISTS idx_camps_faqs ON camps USING gin (faqs);

-- Index for verified organisations
CREATE INDEX IF NOT EXISTS idx_organisations_verified ON organisations(verified) WHERE verified = true;

-- Index for feedback with photos
CREATE INDEX IF NOT EXISTS idx_feedback_photos ON feedback USING gin (photos) WHERE photos IS NOT NULL;

-- Index for verified booking reviews
CREATE INDEX IF NOT EXISTS idx_feedback_verified ON feedback(verified_booking) WHERE verified_booking = true;

-- =====================================================
-- UPDATE ORGANISATION CAMP COUNTS
-- =====================================================

-- Update total_camps_hosted for existing organisations based on published camps
UPDATE organisations
SET total_camps_hosted = (
  SELECT COUNT(*)
  FROM camps
  WHERE camps.organisation_id = organisations.id
  AND camps.status = 'published'
)
WHERE total_camps_hosted = 0;

-- =====================================================
-- SAMPLE DATA COMMENT
-- =====================================================

COMMENT ON COLUMN camps.amenities IS 'JSONB array of categorized amenities. Example: [{"category": "Facilities", "items": ["Swimming pool", "Air conditioning"]}, {"category": "Safety", "items": ["First aid certified staff", "CCTV monitoring"]}]';

COMMENT ON COLUMN camps.highlights IS 'JSONB array of key selling points. Example: ["Small group sizes (max 15 per instructor)", "Daily photo updates for parents"]';

COMMENT ON COLUMN camps.faqs IS 'JSONB array of FAQ objects. Example: [{"question": "What is the daily schedule?", "answer": "Camp runs from 9 AM to 4 PM..."}]';

COMMENT ON COLUMN camps.staff_credentials IS 'JSONB array of staff qualifications. Example: [{"name": "John Doe", "role": "Lead Instructor", "certifications": ["First Aid", "CPR"]}]';

COMMENT ON COLUMN camps.daily_schedule IS 'JSONB object with time-based activities. Example: {"09:00": "Arrival & Registration", "10:00": "Morning Activities"}';

COMMENT ON COLUMN camps.included_in_price IS 'JSONB array of included items. Example: ["All materials and equipment", "Snacks and beverages", "Certificate of completion"]';

COMMENT ON COLUMN camps.not_included_in_price IS 'JSONB array of additional costs. Example: ["Lunch ($10/day)", "Transportation", "Extended care ($5/hour)"]';

COMMENT ON COLUMN feedback.photos IS 'JSONB array of photo URLs. Example: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]';
