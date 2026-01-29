-- Add promotional offer tracking to commission_records table
-- This allows tracking which commissions were calculated under promotional offers
-- and how much camp owners saved compared to standard rates

ALTER TABLE commission_records
ADD COLUMN IF NOT EXISTS promotional_offer_applied BOOLEAN DEFAULT false;

ALTER TABLE commission_records
ADD COLUMN IF NOT EXISTS promotional_offer_id UUID REFERENCES promotional_offers(id) ON DELETE SET NULL;

ALTER TABLE commission_records
ADD COLUMN IF NOT EXISTS standard_commission_rate NUMERIC(5,4);

ALTER TABLE commission_records
ADD COLUMN IF NOT EXISTS promotional_commission_rate NUMERIC(5,4);

ALTER TABLE commission_records
ADD COLUMN IF NOT EXISTS commission_savings DECIMAL(10,2);

-- Add helpful comments
COMMENT ON COLUMN commission_records.promotional_offer_applied IS 'Whether a promotional offer was applied to this commission';
COMMENT ON COLUMN commission_records.promotional_offer_id IS 'The promotional offer that was applied (if any)';
COMMENT ON COLUMN commission_records.standard_commission_rate IS 'What the commission rate would have been without the offer (e.g., 0.15 = 15%)';
COMMENT ON COLUMN commission_records.promotional_commission_rate IS 'The actual commission rate charged under the promotional offer';
COMMENT ON COLUMN commission_records.commission_savings IS 'How much the camp owner saved due to the promotional offer';

-- Create index for filtering promotional commissions
CREATE INDEX IF NOT EXISTS idx_commission_records_promotional ON commission_records(promotional_offer_id)
WHERE promotional_offer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_commission_records_offer_applied ON commission_records(promotional_offer_applied)
WHERE promotional_offer_applied = true;

-- Create a function to calculate commission with promotional offer
CREATE OR REPLACE FUNCTION calculate_commission_with_offer(
  p_booking_id UUID,
  p_organization_id UUID,
  p_booking_amount DECIMAL
)
RETURNS TABLE (
  commission_rate NUMERIC,
  commission_amount DECIMAL,
  platform_amount DECIMAL,
  organizer_amount DECIMAL,
  promotional_offer_id UUID,
  promotional_offer_applied BOOLEAN,
  standard_rate NUMERIC,
  promotional_rate NUMERIC,
  savings DECIMAL
) AS $$
DECLARE
  v_org RECORD;
  v_camp RECORD;
  v_offer RECORD;
  v_standard_rate NUMERIC;
  v_effective_rate NUMERIC;
  v_commission DECIMAL;
  v_platform DECIMAL;
  v_organizer DECIMAL;
  v_savings DECIMAL;
BEGIN
  -- Get organization details including promotional offer
  SELECT * INTO v_org
  FROM organisations
  WHERE id = p_organization_id;

  -- Get camp details (if we need camp-specific commission rate)
  SELECT * INTO v_camp
  FROM camps c
  JOIN bookings b ON b.camp_id = c.id
  WHERE b.id = p_booking_id;

  -- Determine standard commission rate (without promotional offer)
  v_standard_rate := COALESCE(
    v_camp.commission_rate,
    v_org.default_commission_rate,
    0.15
  );

  -- Check if organization has an active promotional offer
  IF v_org.promotional_offer_id IS NOT NULL THEN
    SELECT * INTO v_offer
    FROM promotional_offers
    WHERE id = v_org.promotional_offer_id
      AND active = true;

    IF FOUND THEN
      -- Apply promotional offer based on type
      IF v_offer.offer_type = 'free_bookings' THEN
        -- Check if within free booking limit
        IF v_org.offer_bookings_count < v_offer.free_booking_limit THEN
          v_effective_rate := 0.0; -- Commission-free
        ELSE
          v_effective_rate := v_standard_rate; -- Back to standard rate
        END IF;

      ELSIF v_offer.offer_type = 'percentage_discount' THEN
        v_effective_rate := v_offer.discount_rate;

      ELSIF v_offer.offer_type = 'trial_period' THEN
        -- Check if still within trial period
        IF v_org.offer_expires_at IS NULL OR v_org.offer_expires_at >= now() THEN
          v_effective_rate := v_offer.trial_discount_rate;
        ELSE
          v_effective_rate := v_standard_rate; -- Trial expired
        END IF;

      ELSE
        v_effective_rate := v_standard_rate;
      END IF;
    ELSE
      v_effective_rate := v_standard_rate;
    END IF;
  ELSE
    v_effective_rate := v_standard_rate;
  END IF;

  -- Calculate amounts
  v_commission := v_effective_rate;
  v_platform := ROUND(p_booking_amount * v_effective_rate, 2);
  v_organizer := p_booking_amount - v_platform;
  v_savings := ROUND(p_booking_amount * (v_standard_rate - v_effective_rate), 2);

  -- Return results
  RETURN QUERY SELECT
    v_commission AS commission_rate,
    v_platform AS commission_amount,
    v_platform AS platform_amount,
    v_organizer AS organizer_amount,
    v_org.promotional_offer_id AS promotional_offer_id,
    (v_org.promotional_offer_id IS NOT NULL AND v_effective_rate < v_standard_rate) AS promotional_offer_applied,
    v_standard_rate AS standard_rate,
    v_effective_rate AS promotional_rate,
    v_savings AS savings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION calculate_commission_with_offer(UUID, UUID, DECIMAL) IS 'Calculates commission amount considering active promotional offers';

-- Create a function to track offer usage after booking
CREATE OR REPLACE FUNCTION track_promotional_offer_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- If a promotional offer was applied, increment the organization's booking count
  IF NEW.promotional_offer_applied = true AND NEW.promotional_offer_id IS NOT NULL THEN
    UPDATE organisations
    SET offer_bookings_count = offer_bookings_count + 1
    WHERE id = (
      SELECT c.organisation_id
      FROM camps c
      JOIN bookings b ON b.camp_id = c.id
      WHERE b.id = NEW.booking_id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to track offer usage
DROP TRIGGER IF EXISTS track_offer_usage_on_commission ON commission_records;
CREATE TRIGGER track_offer_usage_on_commission
  AFTER INSERT ON commission_records
  FOR EACH ROW
  WHEN (NEW.promotional_offer_applied = true)
  EXECUTE FUNCTION track_promotional_offer_usage();

COMMENT ON TRIGGER track_offer_usage_on_commission ON commission_records IS 'Automatically updates organization offer_bookings_count when promotional commission is recorded';
