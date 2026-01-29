-- Create promotional_offers table for admin-configurable promotional campaigns
-- This allows admins to create offers like "First 5 bookings free" or "10% commission for 3 months"

CREATE TABLE IF NOT EXISTS promotional_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name TEXT NOT NULL,
  description TEXT,

  -- Offer Type
  offer_type TEXT NOT NULL CHECK (offer_type IN ('percentage_discount', 'free_bookings', 'trial_period')),

  -- Percentage Discount: Reduced commission rate
  -- Example: 0.10 = 10% commission instead of standard 15%
  discount_rate NUMERIC(5,4),

  -- Free Bookings: No commission on first N bookings
  -- Example: 5 means first 5 bookings are commission-free
  free_booking_limit INTEGER,

  -- Trial Period: Reduced rate for X months
  -- Example: 3 months at 10% commission
  trial_period_months INTEGER,
  trial_discount_rate NUMERIC(5,4),

  -- Validity Period
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,

  -- Status
  active BOOLEAN DEFAULT true,
  auto_apply_to_signups BOOLEAN DEFAULT true, -- Auto-apply to new camp owner signups during validity period

  -- Display
  display_text TEXT, -- Human-readable offer text for landing page (e.g., "First 5 bookings free!")

  -- Audit
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add helpful comments
COMMENT ON TABLE promotional_offers IS 'Admin-configured promotional offers for camp owner acquisition';
COMMENT ON COLUMN promotional_offers.offer_type IS 'Type of offer: percentage_discount, free_bookings, or trial_period';
COMMENT ON COLUMN promotional_offers.discount_rate IS 'For percentage_discount type: reduced commission rate (e.g., 0.10 = 10%)';
COMMENT ON COLUMN promotional_offers.free_booking_limit IS 'For free_bookings type: number of bookings with 0% commission';
COMMENT ON COLUMN promotional_offers.trial_period_months IS 'For trial_period type: duration in months';
COMMENT ON COLUMN promotional_offers.trial_discount_rate IS 'For trial_period type: commission rate during trial';
COMMENT ON COLUMN promotional_offers.auto_apply_to_signups IS 'Automatically enroll new camp owner signups in this offer';
COMMENT ON COLUMN promotional_offers.display_text IS 'Marketing text shown on landing page';

-- Create indexes
CREATE INDEX idx_promotional_offers_active ON promotional_offers(active);
CREATE INDEX idx_promotional_offers_dates ON promotional_offers(start_date, end_date);
CREATE INDEX idx_promotional_offers_auto_apply ON promotional_offers(auto_apply_to_signups, active);

-- Add RLS policies
ALTER TABLE promotional_offers ENABLE ROW LEVEL SECURITY;

-- Admins can manage all offers
CREATE POLICY "super_admin_all_promotional_offers" ON promotional_offers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Camp organizers can view active offers (for landing page display)
CREATE POLICY "camp_organizers_view_active_offers" ON promotional_offers
  FOR SELECT
  USING (active = true AND start_date <= now() AND (end_date IS NULL OR end_date >= now()));

-- Public users can view active offers (for landing page before signup)
CREATE POLICY "public_view_active_offers" ON promotional_offers
  FOR SELECT
  USING (active = true AND start_date <= now() AND (end_date IS NULL OR end_date >= now()));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_promotional_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promotional_offers_updated_at
  BEFORE UPDATE ON promotional_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_promotional_offers_updated_at();
