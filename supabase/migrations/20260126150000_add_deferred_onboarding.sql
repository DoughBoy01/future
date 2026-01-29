-- Migration: Add Deferred Onboarding Support for Stripe Connect
-- Description: Enables quick-start onboarding - funds held until verification complete
-- Date: 2026-01-26

-- ===========================================================================
-- PART 1: Add Onboarding Tracking Columns to Organisations Table
-- ===========================================================================

-- Onboarding mode and progress tracking
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS onboarding_mode TEXT DEFAULT 'full'
  CHECK (onboarding_mode IN ('full', 'deferred', 'progressive'));

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS onboarding_step TEXT DEFAULT 'not_started'
  CHECK (onboarding_step IN (
    'not_started',           -- No Stripe account created
    'account_created',        -- Account exists, minimal info provided
    'business_info_pending',  -- Awaiting business details
    'bank_account_pending',   -- Awaiting bank details
    'identity_pending',       -- Awaiting identity verification
    'verification_complete'   -- Full onboarding done
  ));

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS onboarding_started_at TIMESTAMPTZ;

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Deferred onboarding capabilities
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS temp_charges_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS charges_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS pending_balance_amount DECIMAL(10,2) DEFAULT 0.00;

-- Restriction tracking
ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS restrictions_active BOOLEAN DEFAULT FALSE;

ALTER TABLE organisations
ADD COLUMN IF NOT EXISTS restriction_reason TEXT;

-- ===========================================================================
-- PART 2: Add Indexes for Performance
-- ===========================================================================

CREATE INDEX IF NOT EXISTS idx_organisations_onboarding_mode
  ON organisations(onboarding_mode);

CREATE INDEX IF NOT EXISTS idx_organisations_temp_charges
  ON organisations(temp_charges_enabled)
  WHERE temp_charges_enabled = TRUE;

CREATE INDEX IF NOT EXISTS idx_organisations_restrictions
  ON organisations(restrictions_active)
  WHERE restrictions_active = TRUE;

-- ===========================================================================
-- PART 3: Add Column Comments for Documentation
-- ===========================================================================

COMMENT ON COLUMN organisations.onboarding_mode IS
  'Type of Stripe onboarding: full (complete upfront), deferred (quick start), progressive (step-by-step)';

COMMENT ON COLUMN organisations.onboarding_step IS
  'Current step in the onboarding process for tracking progress';

COMMENT ON COLUMN organisations.temp_charges_enabled IS
  'Whether organization can accept charges before full verification (deferred mode). Funds held in pending balance.';

COMMENT ON COLUMN organisations.pending_balance_amount IS
  'Amount held in Stripe pending balance awaiting payout verification completion';

COMMENT ON COLUMN organisations.restrictions_active IS
  'Whether the Stripe account is restricted from processing payments by Stripe';

COMMENT ON COLUMN organisations.restriction_reason IS
  'Reason for account restriction from Stripe';

-- ===========================================================================
-- PART 4: Update validate_stripe_before_publish() Trigger Function
-- ===========================================================================

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS check_stripe_before_publish ON camps;

-- Replace the function to support deferred onboarding
CREATE OR REPLACE FUNCTION validate_stripe_before_publish()
RETURNS TRIGGER AS $$
DECLARE
  org_stripe_id TEXT;
  org_payout_enabled BOOLEAN;
  org_temp_charges BOOLEAN;
  org_restrictions BOOLEAN;
BEGIN
  -- Only check when status is being set to 'published'
  IF NEW.status = 'published' THEN
    SELECT
      stripe_account_id,
      payout_enabled,
      COALESCE(temp_charges_enabled, FALSE),
      COALESCE(restrictions_active, FALSE)
    INTO
      org_stripe_id,
      org_payout_enabled,
      org_temp_charges,
      org_restrictions
    FROM organisations
    WHERE id = NEW.organisation_id;

    -- Must have Stripe account
    IF org_stripe_id IS NULL THEN
      RAISE EXCEPTION 'Cannot publish camp: Stripe account not connected. Please connect Stripe in Payment Settings.'
        USING HINT = 'Visit /organizer/settings/payments to connect Stripe';
    END IF;

    -- Account must not be restricted by Stripe
    IF org_restrictions = TRUE THEN
      RAISE EXCEPTION 'Cannot publish camp: Stripe account is restricted. Please complete your onboarding.'
        USING HINT = 'Visit /organizer/settings/payments to resolve restrictions';
    END IF;

    -- Allow if EITHER:
    -- 1. Full onboarding complete (payout_enabled = true), OR
    -- 2. Deferred mode with temp charges enabled (funds held in pending balance)
    IF org_payout_enabled IS NOT TRUE THEN
      IF org_temp_charges IS NOT TRUE THEN
        RAISE EXCEPTION 'Cannot publish camp: Complete Stripe onboarding required to enable payments.'
          USING HINT = 'Choose Quick Start for immediate publishing or complete full onboarding';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER check_stripe_before_publish
  BEFORE INSERT OR UPDATE OF status ON camps
  FOR EACH ROW
  EXECUTE FUNCTION validate_stripe_before_publish();

-- ===========================================================================
-- PART 5: Update Existing Organisations (Backward Compatibility)
-- ===========================================================================

-- Set existing organisations with Stripe accounts to 'full' mode with completed status
UPDATE organisations
SET
  onboarding_mode = 'full',
  onboarding_step = 'verification_complete',
  onboarding_completed_at = NOW(),
  temp_charges_enabled = FALSE,
  charges_enabled = payout_enabled,
  restrictions_active = FALSE
WHERE stripe_account_id IS NOT NULL
  AND payout_enabled = TRUE
  AND onboarding_mode IS NULL;

-- Set existing organisations without Stripe to 'not_started'
UPDATE organisations
SET
  onboarding_mode = 'full',
  onboarding_step = 'not_started',
  temp_charges_enabled = FALSE,
  charges_enabled = FALSE,
  restrictions_active = FALSE
WHERE stripe_account_id IS NULL
  AND onboarding_mode IS NULL;

-- ===========================================================================
-- PART 6: Add Check Constraint for Data Integrity
-- ===========================================================================

-- Ensure temp_charges_enabled only true for deferred mode
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'temp_charges_only_for_deferred'
  ) THEN
    ALTER TABLE organisations ADD CONSTRAINT temp_charges_only_for_deferred
      CHECK (
        (temp_charges_enabled = FALSE) OR
        (temp_charges_enabled = TRUE AND onboarding_mode = 'deferred')
      );
  END IF;
END $$;

-- ===========================================================================
-- Migration Complete
-- ===========================================================================

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 20260126_add_deferred_onboarding completed successfully';
  RAISE NOTICE 'Added support for:';
  RAISE NOTICE '  - Deferred onboarding mode (no deadline - funds held until verified)';
  RAISE NOTICE '  - Temporary charges capability';
  RAISE NOTICE '  - Onboarding progress tracking';
  RAISE NOTICE '  - Pending balance monitoring';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Update create-connect-account Edge Function to support mode parameter';
  RAISE NOTICE '  2. Update stripe-connect-status Edge Function for progress tracking';
  RAISE NOTICE '  3. Update UI components for mode selection';
END $$;
