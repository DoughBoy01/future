-- Create stripe_prices table for syncing with Stripe Price API
-- This table stores different pricing options for products (standard, early bird, tiered, etc.)

CREATE TABLE IF NOT EXISTS stripe_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_price_id TEXT UNIQUE NOT NULL,
  stripe_product_id UUID REFERENCES stripe_products(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  type TEXT NOT NULL CHECK (type IN ('one_time', 'recurring')),
  billing_period TEXT CHECK (billing_period IN ('day', 'week', 'month', 'year') OR billing_period IS NULL),
  price_tier TEXT CHECK (price_tier IN ('standard', 'early_bird', 'family', 'sibling', 'group', 'custom')),
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint: recurring prices must have billing_period
ALTER TABLE stripe_prices ADD CONSTRAINT check_recurring_has_period
  CHECK (
    (type = 'recurring' AND billing_period IS NOT NULL) OR
    (type = 'one_time' AND billing_period IS NULL)
  );

-- Add constraint: valid_from must be before valid_until
ALTER TABLE stripe_prices ADD CONSTRAINT check_valid_date_range
  CHECK (valid_from IS NULL OR valid_until IS NULL OR valid_from < valid_until);

-- Create indexes for efficient lookups
CREATE INDEX idx_stripe_prices_product ON stripe_prices(stripe_product_id);
CREATE INDEX idx_stripe_prices_stripe_id ON stripe_prices(stripe_price_id);
CREATE INDEX idx_stripe_prices_tier ON stripe_prices(price_tier);
CREATE INDEX idx_stripe_prices_active ON stripe_prices(active) WHERE active = true;
CREATE INDEX idx_stripe_prices_validity ON stripe_prices(valid_from, valid_until) WHERE valid_from IS NOT NULL OR valid_until IS NOT NULL;

-- Add comments for documentation
COMMENT ON TABLE stripe_prices IS 'Mapping table for Stripe Prices with support for multiple pricing tiers';
COMMENT ON COLUMN stripe_prices.stripe_price_id IS 'Unique Stripe Price ID (e.g., price_xxxxx)';
COMMENT ON COLUMN stripe_prices.amount IS 'Price amount in cents (e.g., 50000 = $500.00)';
COMMENT ON COLUMN stripe_prices.type IS 'Payment type: one_time for camps, recurring for subscriptions';
COMMENT ON COLUMN stripe_prices.billing_period IS 'For recurring prices: how often to bill';
COMMENT ON COLUMN stripe_prices.price_tier IS 'Pricing tier: standard, early_bird, family, sibling, etc.';
COMMENT ON COLUMN stripe_prices.valid_from IS 'Optional start date for this price (e.g., early bird start)';
COMMENT ON COLUMN stripe_prices.valid_until IS 'Optional end date for this price (e.g., early bird deadline)';

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_stripe_prices_updated_at
  BEFORE UPDATE ON stripe_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE stripe_prices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Super admins can manage all Stripe prices
CREATE POLICY "Super admins can manage stripe_prices"
  ON stripe_prices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Organisation admins can view prices for their products
CREATE POLICY "Organisation admins can view own stripe_prices"
  ON stripe_prices FOR SELECT
  USING (
    stripe_product_id IN (
      SELECT sp.id FROM stripe_products sp
      INNER JOIN camps c ON c.id = sp.entity_id AND sp.entity_type = 'camp'
      INNER JOIN organisation_members om ON om.organisation_id = c.school_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- Public can view active prices for published camps
CREATE POLICY "Public can view active stripe_prices for published camps"
  ON stripe_prices FOR SELECT
  USING (
    active = true AND
    stripe_product_id IN (
      SELECT sp.id FROM stripe_products sp
      INNER JOIN camps c ON c.id = sp.entity_id AND sp.entity_type = 'camp'
      WHERE c.status = 'published' AND sp.active = true
    )
  );
