-- Enhance registrations table to support advanced Stripe features
-- Add support for pricing tiers, add-ons, and detailed payment tracking

-- Add new columns for pricing tiers
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS pricing_tier_id UUID REFERENCES pricing_tiers(id) ON DELETE SET NULL;

-- Add new columns for add-ons tracking
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS selected_addons JSONB DEFAULT '[]'::jsonb;

-- Add detailed amount breakdown columns (using INTEGER for cents to match Stripe)
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS total_amount INTEGER;

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS base_amount INTEGER;

ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS addons_amount INTEGER DEFAULT 0;

-- Add enhanced discount tracking
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS discount_applied JSONB DEFAULT '{}'::jsonb;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_registrations_pricing_tier ON registrations(pricing_tier_id);
CREATE INDEX IF NOT EXISTS idx_registrations_total_amount ON registrations(total_amount);

-- Add comments for documentation
COMMENT ON COLUMN registrations.pricing_tier_id IS 'Selected pricing tier (NULL = base camp price)';
COMMENT ON COLUMN registrations.selected_addons IS 'Array of selected add-ons: [{"addon_id": "uuid", "quantity": 2, "price": 1500}]';
COMMENT ON COLUMN registrations.total_amount IS 'Total amount in cents (base + addons - discounts)';
COMMENT ON COLUMN registrations.base_amount IS 'Base camp price in cents (from tier or camp.price)';
COMMENT ON COLUMN registrations.addons_amount IS 'Total add-ons cost in cents';
COMMENT ON COLUMN registrations.discount_applied IS 'Discount details: {"type": "sibling", "amount": 2000, "code": "SIBLING10", "automatic_discount_id": "uuid"}';

-- Create function to calculate registration total
CREATE OR REPLACE FUNCTION calculate_registration_total(
  p_camp_id UUID,
  p_pricing_tier_id UUID DEFAULT NULL,
  p_selected_addons JSONB DEFAULT '[]'::jsonb,
  p_discount_code TEXT DEFAULT NULL,
  p_parent_id UUID DEFAULT NULL
)
RETURNS TABLE (
  base_amount INTEGER,
  addons_amount INTEGER,
  discount_amount INTEGER,
  total_amount INTEGER,
  discount_details JSONB
) AS $$
DECLARE
  v_base_amount INTEGER := 0;
  v_addons_amount INTEGER := 0;
  v_discount_amount INTEGER := 0;
  v_discount_details JSONB := '{}'::jsonb;
  v_early_bird_active BOOLEAN;
  v_camp RECORD;
  v_addon JSONB;
  v_addon_data RECORD;
BEGIN
  -- Get camp details
  SELECT * INTO v_camp FROM camps WHERE id = p_camp_id;

  -- Calculate base amount
  IF p_pricing_tier_id IS NOT NULL THEN
    -- Use pricing tier
    SELECT price INTO v_base_amount FROM pricing_tiers WHERE id = p_pricing_tier_id;
  ELSE
    -- Check if early bird pricing is active
    v_early_bird_active := (
      v_camp.early_bird_price IS NOT NULL AND
      v_camp.early_bird_deadline IS NOT NULL AND
      v_camp.early_bird_deadline > NOW()
    );

    -- Use early bird or standard price
    IF v_early_bird_active THEN
      v_base_amount := (v_camp.early_bird_price * 100)::INTEGER;
    ELSE
      v_base_amount := (v_camp.price * 100)::INTEGER;
    END IF;
  END IF;

  -- Calculate add-ons total
  IF p_selected_addons IS NOT NULL AND jsonb_array_length(p_selected_addons) > 0 THEN
    FOR v_addon IN SELECT * FROM jsonb_array_elements(p_selected_addons)
    LOOP
      -- Get addon details and validate
      SELECT price INTO v_addon_data
      FROM camp_addons
      WHERE id = (v_addon->>'addon_id')::UUID
      AND available = true;

      IF v_addon_data IS NOT NULL THEN
        v_addons_amount := v_addons_amount + (
          v_addon_data.price * COALESCE((v_addon->>'quantity')::INTEGER, 1)
        );
      END IF;
    END LOOP;
  END IF;

  -- Calculate discount from code
  IF p_discount_code IS NOT NULL THEN
    DECLARE
      v_discount RECORD;
      v_code_discount INTEGER := 0;
    BEGIN
      SELECT * INTO v_discount
      FROM discount_codes
      WHERE code = p_discount_code
      AND active = true
      AND (valid_from IS NULL OR valid_from <= NOW())
      AND (valid_until IS NULL OR valid_until > NOW())
      AND (max_uses IS NULL OR uses_count < max_uses);

      IF v_discount IS NOT NULL THEN
        IF v_discount.discount_type = 'percentage' THEN
          v_code_discount := ((v_base_amount + v_addons_amount) * v_discount.discount_value / 100)::INTEGER;
        ELSE
          v_code_discount := (v_discount.discount_value * 100)::INTEGER;
        END IF;

        v_discount_amount := v_discount_amount + v_code_discount;
        v_discount_details := jsonb_set(
          v_discount_details,
          '{code}',
          jsonb_build_object(
            'code', p_discount_code,
            'type', v_discount.discount_type,
            'value', v_discount.discount_value,
            'amount', v_code_discount
          )
        );
      END IF;
    END;
  END IF;

  -- Check for automatic discounts
  IF p_parent_id IS NOT NULL THEN
    DECLARE
      v_auto_discount RECORD;
      v_auto_amount INTEGER := 0;
    BEGIN
      -- Get best automatic discount
      SELECT * INTO v_auto_discount
      FROM get_applicable_automatic_discounts(
        p_parent_id,
        p_camp_id,
        v_base_amount + v_addons_amount
      )
      LIMIT 1;

      IF v_auto_discount IS NOT NULL THEN
        v_auto_amount := v_auto_discount.calculated_amount;
        v_discount_amount := v_discount_amount + v_auto_amount;

        v_discount_details := jsonb_set(
          v_discount_details,
          '{automatic}',
          jsonb_build_object(
            'discount_id', v_auto_discount.discount_id,
            'name', v_auto_discount.discount_name,
            'type', v_auto_discount.discount_type,
            'amount', v_auto_amount
          )
        );
      END IF;
    END;
  END IF;

  -- Return calculated amounts
  RETURN QUERY SELECT
    v_base_amount,
    v_addons_amount,
    v_discount_amount,
    GREATEST(v_base_amount + v_addons_amount - v_discount_amount, 0),
    v_discount_details;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_registration_total IS 'Calculate complete registration pricing with add-ons and discounts';

-- Trigger to automatically calculate amounts on registration insert/update
CREATE OR REPLACE FUNCTION update_registration_amounts()
RETURNS TRIGGER AS $$
DECLARE
  v_amounts RECORD;
BEGIN
  -- Calculate all amounts
  SELECT * INTO v_amounts
  FROM calculate_registration_total(
    NEW.camp_id,
    NEW.pricing_tier_id,
    NEW.selected_addons,
    NEW.discount_code,
    NEW.parent_id
  );

  -- Update the registration record
  NEW.base_amount := v_amounts.base_amount;
  NEW.addons_amount := v_amounts.addons_amount;
  NEW.total_amount := v_amounts.total_amount;
  NEW.discount_applied := v_amounts.discount_details;

  -- Update legacy amount_due field (in dollars for backward compatibility)
  NEW.amount_due := (v_amounts.total_amount / 100.0);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_registration_amounts
  BEFORE INSERT OR UPDATE OF camp_id, pricing_tier_id, selected_addons, discount_code
  ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_registration_amounts();

COMMENT ON TRIGGER calculate_registration_amounts ON registrations IS 'Automatically calculate amounts when registration is created or updated';
