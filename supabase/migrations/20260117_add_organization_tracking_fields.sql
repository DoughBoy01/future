-- Add tracking fields to organizations table for:
-- 1. Signup method (invite vs self-service)
-- 2. Promotional offer enrollment
-- 3. Stripe connection reminders

-- Add signup method tracking
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS signup_method TEXT DEFAULT 'invite' CHECK (signup_method IN ('invite', 'self_service'));

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS signup_completed_at TIMESTAMPTZ;

-- Add promotional offer tracking
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS promotional_offer_id UUID REFERENCES promotional_offers(id) ON DELETE SET NULL;

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS offer_enrolled_at TIMESTAMPTZ;

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS offer_bookings_count INTEGER DEFAULT 0;

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS offer_expires_at TIMESTAMPTZ;

-- Add Stripe connection reminder tracking
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS stripe_connection_required_at TIMESTAMPTZ;

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS stripe_connection_reminder_sent_at TIMESTAMPTZ;

-- Add helpful comments
COMMENT ON COLUMN organisations.signup_method IS 'How the organization was created: invite (admin-invited) or self_service (public signup)';
COMMENT ON COLUMN organisations.signup_completed_at IS 'When the camp owner completed the signup/onboarding process';
COMMENT ON COLUMN organisations.promotional_offer_id IS 'Active promotional offer enrolled in (if any)';
COMMENT ON COLUMN organisations.offer_enrolled_at IS 'When the organization enrolled in the promotional offer';
COMMENT ON COLUMN organisations.offer_bookings_count IS 'Number of bookings processed under the promotional offer';
COMMENT ON COLUMN organisations.offer_expires_at IS 'When the promotional offer expires for this specific organization';
COMMENT ON COLUMN organisations.stripe_connection_required_at IS 'When Stripe connection became required (typically after first booking)';
COMMENT ON COLUMN organisations.stripe_connection_reminder_sent_at IS 'Last time reminder email was sent about Stripe connection';

-- Create indexes for filtering and querying
CREATE INDEX IF NOT EXISTS idx_organisations_signup_method ON organisations(signup_method);
CREATE INDEX IF NOT EXISTS idx_organisations_promotional_offer ON organisations(promotional_offer_id) WHERE promotional_offer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organisations_stripe_required ON organisations(stripe_connection_required_at) WHERE stripe_connection_required_at IS NOT NULL AND stripe_account_id IS NULL;

-- Create a function to get the currently active promotional offer for new signups
CREATE OR REPLACE FUNCTION get_active_promotional_offer()
RETURNS UUID AS $$
DECLARE
  active_offer_id UUID;
BEGIN
  SELECT id INTO active_offer_id
  FROM promotional_offers
  WHERE active = true
    AND auto_apply_to_signups = true
    AND start_date <= now()
    AND (end_date IS NULL OR end_date >= now())
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN active_offer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_active_promotional_offer() IS 'Returns the currently active promotional offer that should be auto-applied to new signups';

-- Create a function to enroll an organization in a promotional offer
CREATE OR REPLACE FUNCTION enroll_organization_in_offer(
  p_organization_id UUID,
  p_offer_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_offer RECORD;
  v_expiry_date TIMESTAMPTZ;
BEGIN
  -- Get offer details
  SELECT * INTO v_offer
  FROM promotional_offers
  WHERE id = p_offer_id AND active = true;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Promotional offer not found or inactive';
  END IF;

  -- Calculate expiry date based on offer type
  IF v_offer.offer_type = 'trial_period' AND v_offer.trial_period_months IS NOT NULL THEN
    v_expiry_date := now() + (v_offer.trial_period_months || ' months')::INTERVAL;
  ELSIF v_offer.end_date IS NOT NULL THEN
    v_expiry_date := v_offer.end_date;
  ELSE
    v_expiry_date := NULL; -- No expiry for open-ended offers
  END IF;

  -- Update organization
  UPDATE organisations
  SET
    promotional_offer_id = p_offer_id,
    offer_enrolled_at = now(),
    offer_bookings_count = 0,
    offer_expires_at = v_expiry_date
  WHERE id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION enroll_organization_in_offer(UUID, UUID) IS 'Enrolls an organization in a promotional offer and sets expiry date';
