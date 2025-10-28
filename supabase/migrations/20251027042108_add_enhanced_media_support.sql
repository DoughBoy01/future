/*
  # Enhanced Media Support for Camps

  ## Overview
  This migration adds comprehensive media support to the camps table, enabling multiple videos
  and enhanced image management with metadata.

  ## Changes Made

  1. New Columns Added
    - `video_urls` (jsonb array) - Stores multiple video URLs (YouTube, Vimeo, or direct uploads)
    - `video_metadata` (jsonb array) - Stores metadata for each video:
      - title: Video title
      - description: Video description
      - thumbnail_url: Preview thumbnail URL
      - video_type: 'youtube' | 'vimeo' | 'direct'
      - duration: Video duration in seconds
      - display_order: Order of display
    - `image_metadata` (jsonb array) - Stores metadata for gallery images:
      - url: Image URL
      - caption: Image caption
      - alt_text: Alternative text for accessibility
      - display_order: Order of display in gallery

  ## Notes
  - Existing video_url field is preserved for backward compatibility
  - gallery_urls remains as the primary image storage array
  - All new fields are nullable and default to empty arrays
  - Maximum 10 images recommended in gallery_urls
  - Video files can be stored in Supabase storage or embedded from external platforms
*/

-- Add new media fields to camps table
DO $$
BEGIN
  -- Add video_urls array field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'video_urls'
  ) THEN
    ALTER TABLE camps ADD COLUMN video_urls jsonb DEFAULT '[]';
  END IF;

  -- Add video_metadata array field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'video_metadata'
  ) THEN
    ALTER TABLE camps ADD COLUMN video_metadata jsonb DEFAULT '[]';
  END IF;

  -- Add image_metadata array field
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'image_metadata'
  ) THEN
    ALTER TABLE camps ADD COLUMN image_metadata jsonb DEFAULT '[]';
  END IF;
END $$;

-- Create indexes for efficient JSON queries
CREATE INDEX IF NOT EXISTS idx_camps_video_urls ON camps USING gin(video_urls);
CREATE INDEX IF NOT EXISTS idx_camps_video_metadata ON camps USING gin(video_metadata);
CREATE INDEX IF NOT EXISTS idx_camps_image_metadata ON camps USING gin(image_metadata);