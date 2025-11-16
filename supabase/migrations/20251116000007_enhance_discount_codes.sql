-- Enhance discount_codes table to support advanced discount features
-- Add support for scope, stacking, auto-apply, and conditions

-- Add new columns for advanced discounting
ALTER TABLE discount_codes
  ADD COLUMN IF NOT EXISTS discount_scope TEXT DEFAULT 'registration'
    CHECK (discount_scope IN ('registration', 'addon', 'both'));

ALTER TABLE discount_codes
  ADD COLUMN IF NOT EXISTS stackable BOOLEAN DEFAULT false;

ALTER TABLE discount_codes
  ADD COLUMN IF NOT EXISTS auto_apply BOOLEAN DEFAULT false;

ALTER TABLE discount_codes
  ADD COLUMN IF NOT EXISTS conditions JSONB DEFAULT '{}'::jsonb;

ALTER TABLE discount_codes
  ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_discount_codes_scope ON discount_codes(discount_scope);
CREATE INDEX IF NOT EXISTS idx_discount_codes_auto_apply ON discount_codes(auto_apply) WHERE auto_apply = true;
CREATE INDEX IF NOT EXISTS idx_discount_codes_priority ON discount_codes(priority);

-- Add comments for documentation
COMMENT ON COLUMN discount_codes.discount_scope IS 'What the discount applies to: registration (camp price), addon (add-ons only), or both';
COMMENT ON COLUMN discount_codes.stackable IS 'Can this discount be combined with other discounts?';
COMMENT ON COLUMN discount_codes.auto_apply IS 'Automatically apply this discount if conditions are met (like sibling discounts)';
COMMENT ON COLUMN discount_codes.conditions IS 'Additional conditions: {"min_siblings": 2, "min_age": 5, "specific_addons": ["uuid1", "uuid2"]}';
COMMENT ON COLUMN discount_codes.priority IS 'For stackable discounts, apply in priority order (higher = first)';

-- Function to validate discount code
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code TEXT,
  p_camp_id UUID,
  p_parent_id UUID DEFAULT NULL
)
RETURNS TABLE (
  valid BOOLEAN,
  discount_id UUID,
  discount_type TEXT,
  discount_value NUMERIC,
  error_message TEXT
) AS $$
DECLARE
  v_discount RECORD;
  v_applicable_camps JSONB;
BEGIN
  -- Try to find the discount code
  SELECT * INTO v_discount
  FROM discount_codes
  WHERE code = p_code;

  -- Check if code exists
  IF v_discount IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::NUMERIC, 'Invalid discount code';
    RETURN;
  END IF;

  -- Check if active
  IF v_discount.active = false THEN
    RETURN QUERY SELECT false, v_discount.id, NULL::TEXT, NULL::NUMERIC, 'This discount code is no longer active';
    RETURN;
  END IF;

  -- Check valid date range
  IF v_discount.valid_from IS NOT NULL AND v_discount.valid_from > NOW() THEN
    RETURN QUERY SELECT false, v_discount.id, NULL::TEXT, NULL::NUMERIC, 'This discount code is not yet valid';
    RETURN;
  END IF;

  IF v_discount.valid_until IS NOT NULL AND v_discount.valid_until < NOW() THEN
    RETURN QUERY SELECT false, v_discount.id, NULL::TEXT, NULL::NUMERIC, 'This discount code has expired';
    RETURN;
  END IF;

  -- Check usage limits
  IF v_discount.max_uses IS NOT NULL AND v_discount.uses_count >= v_discount.max_uses THEN
    RETURN QUERY SELECT false, v_discount.id, NULL::TEXT, NULL::NUMERIC, 'This discount code has reached its usage limit';
    RETURN;
  END IF;

  -- Check if applies to this camp
  IF v_discount.applicable_camps IS NOT NULL THEN
    v_applicable_camps := v_discount.applicable_camps;
    IF NOT (v_applicable_camps @> to_jsonb(p_camp_id::TEXT)) THEN
      RETURN QUERY SELECT false, v_discount.id, NULL::TEXT, NULL::NUMERIC, 'This discount code is not valid for this camp';
      RETURN;
    END IF;
  END IF;

  -- All checks passed
  RETURN QUERY SELECT
    true,
    v_discount.id,
    v_discount.discount_type,
    v_discount.discount_value,
    NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_discount_code IS 'Validate a discount code and return details or error message';

-- Function to increment discount code usage
CREATE OR REPLACE FUNCTION increment_discount_usage(p_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE discount_codes
  SET uses_count = uses_count + 1
  WHERE code = p_code;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_discount_usage IS 'Increment the usage count for a discount code';

-- Function to get all applicable discount codes for a camp
CREATE OR REPLACE FUNCTION get_applicable_discount_codes(p_camp_id UUID)
RETURNS TABLE (
  id UUID,
  code TEXT,
  description TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  auto_apply BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.code,
    dc.description,
    dc.discount_type,
    dc.discount_value,
    dc.auto_apply
  FROM discount_codes dc
  WHERE dc.active = true
  AND (dc.valid_from IS NULL OR dc.valid_from <= NOW())
  AND (dc.valid_until IS NULL OR dc.valid_until > NOW())
  AND (dc.max_uses IS NULL OR dc.uses_count < dc.max_uses)
  AND (
    dc.applicable_camps IS NULL OR
    dc.applicable_camps @> to_jsonb(p_camp_id::TEXT)
  )
  ORDER BY dc.priority DESC, dc.discount_value DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_applicable_discount_codes IS 'Get all valid discount codes for a specific camp';
