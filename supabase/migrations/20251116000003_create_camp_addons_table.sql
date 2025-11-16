-- Create camp_addons table for optional add-ons like meals, transport, merchandise
-- This enables flexible pricing without code changes

CREATE TABLE IF NOT EXISTS camp_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('meal', 'merchandise', 'transport', 'equipment', 'insurance', 'extended_care', 'other')),
  price INTEGER NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  optional BOOLEAN DEFAULT true,
  max_quantity INTEGER DEFAULT 1 CHECK (max_quantity > 0),
  available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX idx_camp_addons_camp ON camp_addons(camp_id);
CREATE INDEX idx_camp_addons_category ON camp_addons(category);
CREATE INDEX idx_camp_addons_available ON camp_addons(available) WHERE available = true;
CREATE INDEX idx_camp_addons_sort ON camp_addons(camp_id, sort_order);

-- Add comments for documentation
COMMENT ON TABLE camp_addons IS 'Optional add-ons for camps (meals, transport, merchandise, etc.)';
COMMENT ON COLUMN camp_addons.camp_id IS 'Foreign key to camps table';
COMMENT ON COLUMN camp_addons.category IS 'Type of add-on: meal, merchandise, transport, equipment, etc.';
COMMENT ON COLUMN camp_addons.price IS 'Price in cents (e.g., 2500 = $25.00)';
COMMENT ON COLUMN camp_addons.optional IS 'If false, this add-on is mandatory for all registrations';
COMMENT ON COLUMN camp_addons.max_quantity IS 'Maximum quantity that can be selected (e.g., 5 lunch packages)';
COMMENT ON COLUMN camp_addons.metadata IS 'Additional data like size charts, dietary options, pickup locations';

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_camp_addons_updated_at
  BEFORE UPDATE ON camp_addons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE camp_addons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Super admins can manage all add-ons
CREATE POLICY "Super admins can manage camp_addons"
  ON camp_addons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Organisation admins can manage add-ons for their camps
CREATE POLICY "Organisation admins can manage own camp_addons"
  ON camp_addons FOR ALL
  USING (
    camp_id IN (
      SELECT c.id FROM camps c
      INNER JOIN organisation_members om ON om.organisation_id = c.school_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- Public can view available add-ons for published camps
CREATE POLICY "Public can view available camp_addons for published camps"
  ON camp_addons FOR SELECT
  USING (
    available = true AND
    camp_id IN (
      SELECT id FROM camps WHERE status = 'published'
    )
  );

-- Function to get total add-ons price for a registration
CREATE OR REPLACE FUNCTION calculate_addons_total(selected_addons JSONB)
RETURNS INTEGER AS $$
DECLARE
  addon JSONB;
  total INTEGER := 0;
BEGIN
  IF selected_addons IS NULL OR jsonb_array_length(selected_addons) = 0 THEN
    RETURN 0;
  END IF;

  FOR addon IN SELECT * FROM jsonb_array_elements(selected_addons)
  LOOP
    total := total + ((addon->>'price')::INTEGER * COALESCE((addon->>'quantity')::INTEGER, 1));
  END LOOP;

  RETURN total;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_addons_total IS 'Calculate total price of selected add-ons from JSONB array';
