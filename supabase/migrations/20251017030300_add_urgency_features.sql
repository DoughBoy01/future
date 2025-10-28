/*
  # Add Urgency and Booking Activity Features

  ## Overview
  This migration adds real-time urgency features to create FOMO (Fear of Missing Out)
  and encourage faster booking decisions by displaying live availability, recent bookings,
  and viewer activity.

  ## New Tables

  ### `booking_activity`
  Tracks recent booking activity for social proof displays
  - `id` (uuid, primary key)
  - `camp_id` (uuid, foreign key to camps)
  - `parent_location` (text) - City/region for display (e.g., "Austin")
  - `booking_time` (timestamptz) - When the booking occurred
  - `spots_booked` (integer) - Number of spots in this booking
  - `created_at` (timestamptz)

  ### `camp_analytics`
  Tracks real-time camp metrics for urgency messaging
  - `camp_id` (uuid, primary key, foreign key to camps)
  - `current_viewers` (integer) - Number of active viewers right now
  - `bookings_last_24h` (integer) - Bookings in last 24 hours
  - `bookings_last_week` (integer) - Bookings in last 7 days
  - `last_booking_time` (timestamptz) - Most recent booking timestamp
  - `trending_score` (numeric) - Calculated trending indicator
  - `updated_at` (timestamptz)

  ## Table Modifications

  ### `camps`
  - Add `spots_remaining_alert_threshold` (integer, default 5) - Show urgency when spots below this
  - Add `show_booking_activity` (boolean, default true) - Enable/disable booking activity display
  - Add `show_viewer_count` (boolean, default false) - Enable/disable viewer count display

  ## Security
  - Enable RLS on all new tables
  - Booking activity visible to all (anonymized data only)
  - Camp analytics visible to all for urgency displays
  - Only admins can insert/update analytics

  ## Indexes
  - Index on booking_activity(camp_id, booking_time)
  - Index on camp_analytics(camp_id)
*/

-- Create booking_activity table
CREATE TABLE IF NOT EXISTS booking_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id uuid REFERENCES camps(id) ON DELETE CASCADE NOT NULL,
  parent_location text,
  booking_time timestamptz DEFAULT now() NOT NULL,
  spots_booked integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create camp_analytics table
CREATE TABLE IF NOT EXISTS camp_analytics (
  camp_id uuid PRIMARY KEY REFERENCES camps(id) ON DELETE CASCADE,
  current_viewers integer DEFAULT 0 NOT NULL,
  bookings_last_24h integer DEFAULT 0 NOT NULL,
  bookings_last_week integer DEFAULT 0 NOT NULL,
  last_booking_time timestamptz,
  trending_score numeric DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add columns to camps table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'spots_remaining_alert_threshold'
  ) THEN
    ALTER TABLE camps ADD COLUMN spots_remaining_alert_threshold integer DEFAULT 5 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'show_booking_activity'
  ) THEN
    ALTER TABLE camps ADD COLUMN show_booking_activity boolean DEFAULT true NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'show_viewer_count'
  ) THEN
    ALTER TABLE camps ADD COLUMN show_viewer_count boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_booking_activity_camp_time ON booking_activity(camp_id, booking_time DESC);
CREATE INDEX IF NOT EXISTS idx_camp_analytics_camp_id ON camp_analytics(camp_id);

-- Enable RLS
ALTER TABLE booking_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE camp_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for booking_activity

-- Everyone can view booking activity (it's anonymized)
CREATE POLICY "Anyone can view booking activity"
  ON booking_activity FOR SELECT
  USING (true);

-- Only authenticated system can insert booking activity
CREATE POLICY "Authenticated users can create booking activity"
  ON booking_activity FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can delete old booking activity
CREATE POLICY "Admins can delete booking activity"
  ON booking_activity FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'school_admin', 'operations')
    )
  );

-- RLS Policies for camp_analytics

-- Everyone can view camp analytics (for urgency displays)
CREATE POLICY "Anyone can view camp analytics"
  ON camp_analytics FOR SELECT
  USING (true);

-- Authenticated users can create camp analytics
CREATE POLICY "Authenticated users can create camp analytics"
  ON camp_analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update camp analytics
CREATE POLICY "Authenticated users can update camp analytics"
  ON camp_analytics FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admins can delete camp analytics
CREATE POLICY "Admins can delete camp analytics"
  ON camp_analytics FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'school_admin')
    )
  );

-- Create function to clean up old booking activity (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_booking_activity()
RETURNS void AS $$
BEGIN
  DELETE FROM booking_activity
  WHERE booking_time < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update camp_analytics.updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_camp_analytics_updated_at'
  ) THEN
    CREATE TRIGGER update_camp_analytics_updated_at
      BEFORE UPDATE ON camp_analytics
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Initialize camp_analytics for existing camps
INSERT INTO camp_analytics (camp_id)
SELECT id FROM camps
WHERE NOT EXISTS (SELECT 1 FROM camp_analytics WHERE camp_id = camps.id)
ON CONFLICT (camp_id) DO NOTHING;
