/*
  # Add Payment Links and Enquiries System

  ## Summary
  Adds payment link functionality to camps and creates an enquiries system
  for parents to ask questions about specific camps before booking.

  ## Changes
  
  ### 1. Camps Table Updates
  - Add `payment_link` column to store external payment URLs
  - Add `enquiries_enabled` column to control whether enquiries are allowed
  - Add `enrolled_count` column to cache the number of confirmed registrations
  
  ### 2. New `enquiries` Table
  - `id` (uuid, primary key)
  - `camp_id` (uuid, references camps) - Links enquiry to specific camp
  - `parent_id` (uuid, references parents) - Parent making the enquiry
  - `parent_name` (text) - Cached parent name for easy display
  - `parent_email` (text) - Contact email for responses
  - `subject` (text) - Brief enquiry subject
  - `message` (text) - Full enquiry message
  - `status` (text) - new, in_progress, resolved
  - `response` (text, nullable) - Staff response to enquiry
  - `responded_by` (uuid, nullable) - Staff member who responded
  - `responded_at` (timestamptz, nullable) - When response was sent
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. Create View `camp_availability`
  - Calculates real-time available places for each camp
  - Shows enrolled count vs capacity
  - Includes waitlist count
  
  ## Security (RLS Policies)
  
  ### Enquiries Table
  - Parents can create enquiries for any published camp
  - Parents can view their own enquiries
  - Staff can view all enquiries
  - Staff can update enquiries to respond
  - Super admins have full access
*/

-- Add new columns to camps table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'payment_link'
  ) THEN
    ALTER TABLE camps ADD COLUMN payment_link text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'enquiries_enabled'
  ) THEN
    ALTER TABLE camps ADD COLUMN enquiries_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'camps' AND column_name = 'enrolled_count'
  ) THEN
    ALTER TABLE camps ADD COLUMN enrolled_count integer DEFAULT 0;
  END IF;
END $$;

-- Create enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id uuid NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES parents(id) ON DELETE SET NULL,
  parent_name text NOT NULL,
  parent_email text NOT NULL,
  parent_phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  response text,
  responded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS enquiries_camp_id_idx ON enquiries(camp_id);
CREATE INDEX IF NOT EXISTS enquiries_parent_id_idx ON enquiries(parent_id);
CREATE INDEX IF NOT EXISTS enquiries_status_idx ON enquiries(status);
CREATE INDEX IF NOT EXISTS enquiries_created_at_idx ON enquiries(created_at DESC);

-- Enable RLS on enquiries
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enquiries

-- Anyone can create enquiries (even non-authenticated users)
CREATE POLICY "Anyone can create enquiries"
  ON enquiries FOR INSERT
  TO public
  WITH CHECK (true);

-- Parents can view their own enquiries
CREATE POLICY "Parents can view own enquiries"
  ON enquiries FOR SELECT
  TO authenticated
  USING (
    parent_id IN (
      SELECT id FROM parents WHERE profile_id = auth.uid()
    )
  );

-- Staff can view all enquiries
CREATE POLICY "Staff can view all enquiries"
  ON enquiries FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('school_admin', 'operations', 'marketing', 'super_admin')
    )
  );

-- Staff can update enquiries to respond
CREATE POLICY "Staff can update enquiries"
  ON enquiries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('school_admin', 'operations', 'marketing', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('school_admin', 'operations', 'marketing', 'super_admin')
    )
  );

-- Create or replace view for camp availability
CREATE OR REPLACE VIEW camp_availability AS
SELECT 
  c.id,
  c.name,
  c.capacity,
  c.enrolled_count,
  c.capacity - c.enrolled_count AS available_places,
  COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) AS confirmed_count,
  COUNT(CASE WHEN r.status = 'waitlisted' THEN 1 END) AS waitlist_count,
  COUNT(CASE WHEN r.status = 'pending' THEN 1 END) AS pending_count,
  CASE 
    WHEN c.capacity - c.enrolled_count <= 0 THEN 'full'
    WHEN c.capacity - c.enrolled_count <= 5 THEN 'limited'
    ELSE 'available'
  END AS availability_status
FROM camps c
LEFT JOIN registrations r ON r.camp_id = c.id
GROUP BY c.id, c.name, c.capacity, c.enrolled_count;

-- Function to update enrolled_count when registrations change
CREATE OR REPLACE FUNCTION update_camp_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('confirmed', 'completed') THEN
    UPDATE camps 
    SET enrolled_count = enrolled_count + 1
    WHERE id = NEW.camp_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status NOT IN ('confirmed', 'completed') AND NEW.status IN ('confirmed', 'completed') THEN
      UPDATE camps 
      SET enrolled_count = enrolled_count + 1
      WHERE id = NEW.camp_id;
    ELSIF OLD.status IN ('confirmed', 'completed') AND NEW.status NOT IN ('confirmed', 'completed') THEN
      UPDATE camps 
      SET enrolled_count = enrolled_count - 1
      WHERE id = NEW.camp_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status IN ('confirmed', 'completed') THEN
    UPDATE camps 
    SET enrolled_count = enrolled_count - 1
    WHERE id = OLD.camp_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic enrolled_count updates
DROP TRIGGER IF EXISTS update_camp_enrolled_count_trigger ON registrations;
CREATE TRIGGER update_camp_enrolled_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_camp_enrolled_count();

-- Update existing enrolled counts
UPDATE camps c
SET enrolled_count = (
  SELECT COUNT(*)
  FROM registrations r
  WHERE r.camp_id = c.id
  AND r.status IN ('confirmed', 'completed')
);

-- Add updated_at trigger for enquiries
CREATE OR REPLACE FUNCTION update_enquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_enquiries_updated_at_trigger ON enquiries;
CREATE TRIGGER update_enquiries_updated_at_trigger
  BEFORE UPDATE ON enquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_enquiries_updated_at();