-- Create stripe_products table for syncing with Stripe Product API
-- This table maintains a mapping between our entities (camps, addons, bundles) and Stripe Products

CREATE TABLE IF NOT EXISTS stripe_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_product_id TEXT UNIQUE NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('camp', 'addon', 'bundle')),
  entity_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient lookups
CREATE INDEX idx_stripe_products_entity ON stripe_products(entity_type, entity_id);
CREATE INDEX idx_stripe_products_stripe_id ON stripe_products(stripe_product_id);
CREATE INDEX idx_stripe_products_active ON stripe_products(active) WHERE active = true;

-- Add comments for documentation
COMMENT ON TABLE stripe_products IS 'Mapping table between our entities and Stripe Products';
COMMENT ON COLUMN stripe_products.stripe_product_id IS 'Unique Stripe Product ID (e.g., prod_xxxxx)';
COMMENT ON COLUMN stripe_products.entity_type IS 'Type of entity: camp, addon, or bundle';
COMMENT ON COLUMN stripe_products.entity_id IS 'Foreign key to camps.id, camp_addons.id, or camp_bundles.id';
COMMENT ON COLUMN stripe_products.metadata IS 'Additional Stripe metadata stored as JSONB';

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_stripe_products_updated_at
  BEFORE UPDATE ON stripe_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE stripe_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Super admins can manage all Stripe products
CREATE POLICY "Super admins can manage stripe_products"
  ON stripe_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Organisation admins can view their own products
CREATE POLICY "Organisation admins can view own stripe_products"
  ON stripe_products FOR SELECT
  USING (
    entity_type = 'camp' AND
    entity_id IN (
      SELECT c.id FROM camps c
      INNER JOIN organisation_members om ON om.organisation_id = c.school_id
      WHERE om.user_id = auth.uid()
      AND om.role IN ('admin', 'owner')
    )
  );

-- Public can view active products for published camps
CREATE POLICY "Public can view active stripe_products for published camps"
  ON stripe_products FOR SELECT
  USING (
    active = true AND
    entity_type = 'camp' AND
    entity_id IN (
      SELECT id FROM camps WHERE status = 'published'
    )
  );
