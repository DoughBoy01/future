-- Migration: Require Stripe Connection for Publishing Camps
-- Description: Adds database trigger to prevent publishing camps without Stripe connected
-- Date: 2026-01-25

-- Function to validate Stripe connection before publishing
CREATE OR REPLACE FUNCTION validate_stripe_before_publish()
RETURNS TRIGGER AS $$
DECLARE
  org_stripe_id TEXT;
  org_payout_enabled BOOLEAN;
BEGIN
  -- Only check when status is being set to 'published'
  IF NEW.status = 'published' THEN
    -- Get organization's Stripe account info
    SELECT stripe_account_id, payout_enabled
    INTO org_stripe_id, org_payout_enabled
    FROM organisations
    WHERE id = NEW.organisation_id;

    -- Validate Stripe is connected
    IF org_stripe_id IS NULL THEN
      RAISE EXCEPTION 'Cannot publish camp: Stripe account not connected. Please connect Stripe in your payment settings.'
        USING HINT = 'Visit /organizer/settings/payments to connect Stripe';
    END IF;

    -- Validate Stripe payouts are enabled
    IF org_payout_enabled IS NOT TRUE THEN
      RAISE EXCEPTION 'Cannot publish camp: Stripe payouts not enabled. Please complete Stripe onboarding.'
        USING HINT = 'Visit your Stripe dashboard to complete setup';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate Stripe before publishing
DROP TRIGGER IF EXISTS check_stripe_before_publish ON camps;
CREATE TRIGGER check_stripe_before_publish
  BEFORE INSERT OR UPDATE OF status ON camps
  FOR EACH ROW
  EXECUTE FUNCTION validate_stripe_before_publish();

-- Add comment for documentation
COMMENT ON FUNCTION validate_stripe_before_publish() IS
  'Validates that organization has Stripe connected and payouts enabled before allowing camp to be published. This ensures organizers can receive payments before camps go live.';

COMMENT ON TRIGGER check_stripe_before_publish ON camps IS
  'Enforces Stripe connection requirement for publishing camps. Part of organizer onboarding flow.';
