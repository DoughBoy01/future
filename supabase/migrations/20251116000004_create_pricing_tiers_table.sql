-- Create pricing_tiers table for camps with multiple pricing options
-- Examples: Full Day, Half Day, Extended Care, With/Without Lunch

CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  capacity INTEGER CHECK (capacity IS NULL OR capacity > 0),
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX idx_pricing_tiers_camp ON pricing_tiers(camp_id);
CREATE INDEX idx_pricing_tiers_available ON pricing_tiers(available) WHERE available = true;
CREATE INDEX idx_pricing_tiers_sort ON pricing_tiers(camp_id, sort_order);

-- Add comments for documentation
COMMENT ON TABLE pricing_tiers IS 'Multiple pricing options for camps (e.g., Full Day vs Half Day)';
COMMENT ON COLUMN pricing_tiers.camp_id IS 'Foreign key to camps table';
COMMENT ON COLUMN pricing_tiers.name IS 'Display name like "Full Day with Lunch" or "Half Day"';
COMMENT ON COLUMN pricing_tiers.price IS 'Price in cents (e.g., 50000 = $500.00)';
COMMENT ON COLUMN pricing_tiers.capacity IS 'Optional capacity limit for this specific tier';
COMMENT ON COLUMN pricing_tiers.metadata IS 'Additional data like schedule times, included items, etc.';

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Super admins can manage all pricing tiers
CREATE POLICY "Super admins can manage pricing_tiers"
  ON pricing_tiers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Organisation admins can manage pricing tiers for their camps
CREATE POLICY "Organisation admins can manage own pricing_tiers"
  ON pricing_tiers FOR ALL
  USING (
    camp_id IN (
      SELECT c.id FROM camps c
      INNER JOIN organisation_members om ON om.organisation_id = c.school_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- Public can view available pricing tiers for published camps
CREATE POLICY "Public can view available pricing_tiers for published camps"
  ON pricing_tiers FOR SELECT
  USING (
    available = true AND
    camp_id IN (
      SELECT id FROM camps WHERE status = 'published'
    )
  );

-- Function to check if a pricing tier has available capacity
CREATE OR REPLACE FUNCTION pricing_tier_has_capacity(tier_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  tier_capacity INTEGER;
  current_registrations INTEGER;
BEGIN
  -- Get tier capacity (NULL means unlimited)
  SELECT capacity INTO tier_capacity
  FROM pricing_tiers
  WHERE id = tier_id;

  -- If no capacity limit, always return true
  IF tier_capacity IS NULL THEN
    RETURN TRUE;
  END IF;

  -- Count current registrations for this tier
  SELECT COUNT(*) INTO current_registrations
  FROM registrations
  WHERE pricing_tier_id = tier_id
  AND status IN ('confirmed', 'pending');

  RETURN current_registrations < tier_capacity;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION pricing_tier_has_capacity IS 'Check if a pricing tier has available capacity for new registrations';
