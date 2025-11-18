-- Create automatic_discounts table for auto-applied discounts
-- Examples: Sibling discounts, Multi-camp bundles, Volume discounts

CREATE TABLE IF NOT EXISTS automatic_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  school_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value NUMERIC NOT NULL CHECK (discount_value >= 0),
  trigger_condition TEXT NOT NULL CHECK (trigger_condition IN ('sibling_count', 'camp_count', 'total_amount', 'referral', 'loyalty_points')),
  trigger_threshold INTEGER CHECK (trigger_threshold > 0),
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'second_child', 'third_child', 'nth_registration', 'cheapest_item', 'most_expensive_item')),
  max_discount_amount INTEGER CHECK (max_discount_amount IS NULL OR max_discount_amount > 0),
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX idx_automatic_discounts_school ON automatic_discounts(school_id);
CREATE INDEX idx_automatic_discounts_active ON automatic_discounts(active) WHERE active = true;
CREATE INDEX idx_automatic_discounts_trigger ON automatic_discounts(trigger_condition);
CREATE INDEX idx_automatic_discounts_priority ON automatic_discounts(priority);

-- Add comments for documentation
COMMENT ON TABLE automatic_discounts IS 'Auto-applied discounts like sibling discounts, multi-camp bundles';
COMMENT ON COLUMN automatic_discounts.school_id IS 'Foreign key to organisations (NULL = platform-wide discount)';
COMMENT ON COLUMN automatic_discounts.discount_type IS 'Type: percentage (e.g., 10%) or fixed_amount (e.g., $50)';
COMMENT ON COLUMN automatic_discounts.discount_value IS 'Discount value: 10 for 10% or 5000 for $50 (in cents)';
COMMENT ON COLUMN automatic_discounts.trigger_condition IS 'What triggers this discount: sibling count, camp count, etc.';
COMMENT ON COLUMN automatic_discounts.trigger_threshold IS 'Minimum value to trigger (e.g., 2 siblings)';
COMMENT ON COLUMN automatic_discounts.applies_to IS 'Which registration gets the discount';
COMMENT ON COLUMN automatic_discounts.max_discount_amount IS 'Maximum discount cap in cents (NULL = unlimited)';
COMMENT ON COLUMN automatic_discounts.priority IS 'Higher priority discounts applied first';

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_automatic_discounts_updated_at
  BEFORE UPDATE ON automatic_discounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE automatic_discounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Super admins can manage all automatic discounts
CREATE POLICY "Super admins can manage automatic_discounts"
  ON automatic_discounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Organisation admins can manage their own automatic discounts
CREATE POLICY "Organisation admins can manage own automatic_discounts"
  ON automatic_discounts FOR ALL
  USING (
    school_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'owner')
    )
  );

-- Public can view active automatic discounts
CREATE POLICY "Public can view active automatic_discounts"
  ON automatic_discounts FOR SELECT
  USING (active = true);

-- Function to check applicable automatic discounts for a user
CREATE OR REPLACE FUNCTION get_applicable_automatic_discounts(
  p_parent_id UUID,
  p_camp_id UUID,
  p_total_amount INTEGER
)
RETURNS TABLE (
  discount_id UUID,
  discount_name TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  calculated_amount INTEGER
) AS $$
DECLARE
  sibling_count INTEGER;
  camp_count INTEGER;
  school_id_var UUID;
BEGIN
  -- Get the school_id for the camp
  SELECT school_id INTO school_id_var FROM camps WHERE id = p_camp_id;

  -- Count existing confirmed registrations for siblings
  SELECT COUNT(DISTINCT r.child_id) INTO sibling_count
  FROM registrations r
  INNER JOIN children c ON c.id = r.child_id
  WHERE c.parent_id = p_parent_id
  AND r.status IN ('confirmed', 'pending');

  -- Count camps the parent has registered for
  SELECT COUNT(DISTINCT r.camp_id) INTO camp_count
  FROM registrations r
  INNER JOIN children c ON c.id = r.child_id
  WHERE c.parent_id = p_parent_id
  AND r.status IN ('confirmed', 'pending');

  -- Return applicable discounts
  RETURN QUERY
  SELECT
    ad.id,
    ad.name,
    ad.discount_type,
    ad.discount_value,
    CASE
      WHEN ad.discount_type = 'percentage' THEN
        LEAST(
          (p_total_amount * ad.discount_value / 100)::INTEGER,
          COALESCE(ad.max_discount_amount, 999999999)
        )
      WHEN ad.discount_type = 'fixed_amount' THEN
        LEAST(ad.discount_value::INTEGER, p_total_amount)
    END AS calculated_amount
  FROM automatic_discounts ad
  WHERE ad.active = true
  AND (ad.school_id = school_id_var OR ad.school_id IS NULL)
  AND (
    (ad.trigger_condition = 'sibling_count' AND sibling_count >= ad.trigger_threshold) OR
    (ad.trigger_condition = 'camp_count' AND camp_count >= ad.trigger_threshold) OR
    (ad.trigger_condition = 'total_amount' AND p_total_amount >= ad.trigger_threshold)
  )
  ORDER BY ad.priority DESC, calculated_amount DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_applicable_automatic_discounts IS 'Get all applicable automatic discounts for a parent registering for a camp';
