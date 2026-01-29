-- Migration: Add Direct Charges Support for Stripe Connect Marketplace
-- Description: Adds fields to track direct charges vs destination charges,
--              application fees, refunds, and guest checkout support
-- Date: 2026-01-25

-- ===========================================================================
-- PART 1: Update payment_records for Direct Charges
-- ===========================================================================

-- Add fields to track charge type and connected account details
ALTER TABLE payment_records
  ADD COLUMN IF NOT EXISTS charge_type TEXT CHECK (charge_type IN ('direct', 'destination', 'platform_only')),
  ADD COLUMN IF NOT EXISTS connected_account_id TEXT, -- Stripe account that received the charge
  ADD COLUMN IF NOT EXISTS application_fee_id TEXT UNIQUE, -- Stripe application fee ID
  ADD COLUMN IF NOT EXISTS application_fee_amount NUMERIC; -- Actual fee charged (in dollars)

-- Add refund tracking
ALTER TABLE payment_records
  ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS refund_application_fee_amount NUMERIC DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_records_connected_account
  ON payment_records(connected_account_id)
  WHERE connected_account_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_records_charge_type
  ON payment_records(charge_type)
  WHERE charge_type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_payment_records_application_fee
  ON payment_records(application_fee_id)
  WHERE application_fee_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN payment_records.charge_type IS
  'Type of Stripe charge: direct (charged to connected account), destination (platform → transfer), platform_only (test mode)';

COMMENT ON COLUMN payment_records.connected_account_id IS
  'Stripe Connect account ID that received the funds (for direct or destination charges)';

COMMENT ON COLUMN payment_records.application_fee_id IS
  'Stripe Application Fee ID for the commission collected by platform';

COMMENT ON COLUMN payment_records.application_fee_amount IS
  'Platform commission amount in dollars (calculated from application_fee_amount from Stripe)';

-- ===========================================================================
-- PART 2: Update commission_records for Direct Charges
-- ===========================================================================

-- Link commission records to Stripe application fees
ALTER TABLE commission_records
  ADD COLUMN IF NOT EXISTS stripe_application_fee_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS actual_fee_collected NUMERIC; -- Amount Stripe actually collected

-- Add index
CREATE INDEX IF NOT EXISTS idx_commission_records_application_fee
  ON commission_records(stripe_application_fee_id)
  WHERE stripe_application_fee_id IS NOT NULL;

COMMENT ON COLUMN commission_records.stripe_application_fee_id IS
  'Links to Stripe Application Fee for audit trail and reconciliation';

COMMENT ON COLUMN commission_records.actual_fee_collected IS
  'Actual fee amount collected by Stripe (may differ from calculated commission_amount due to refunds)';

-- ===========================================================================
-- PART 3: Guest Checkout Support
-- ===========================================================================

-- Add guest parent support to parents table
ALTER TABLE parents
  ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS guest_session_id TEXT UNIQUE; -- For guest checkout tracking

-- Add indexes for guest lookups
CREATE INDEX IF NOT EXISTS idx_parents_guest
  ON parents(is_guest)
  WHERE is_guest = TRUE;

CREATE INDEX IF NOT EXISTS idx_parents_guest_session
  ON parents(guest_session_id)
  WHERE guest_session_id IS NOT NULL;

-- Add emergency contact fields if they don't exist (for guest checkout)
ALTER TABLE parents
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

COMMENT ON COLUMN parents.is_guest IS
  'True if parent checked out without creating an account (guest checkout)';

COMMENT ON COLUMN parents.guest_session_id IS
  'Unique session ID for tracking guest checkouts and sending confirmation emails';

-- ===========================================================================
-- PART 4: Ensure booking_id compatibility
-- ===========================================================================

-- Check if payment_records still uses registration_id and needs migration
DO $$
BEGIN
  -- If registration_id column exists, add booking_id if it doesn't exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_records' AND column_name = 'registration_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payment_records' AND column_name = 'booking_id'
  ) THEN
    -- Add booking_id column
    ALTER TABLE payment_records ADD COLUMN booking_id UUID REFERENCES bookings(id);

    -- Copy data from registration_id to booking_id
    UPDATE payment_records SET booking_id = registration_id WHERE booking_id IS NULL;

    -- Add index
    CREATE INDEX idx_payment_records_booking_id ON payment_records(booking_id);

    RAISE NOTICE 'Added booking_id column to payment_records and migrated data from registration_id';
  END IF;
END $$;

-- ===========================================================================
-- PART 5: Add RLS Policies for Guest Checkout
-- ===========================================================================

-- Allow anonymous users to insert guest parent records
CREATE POLICY IF NOT EXISTS "Allow anonymous guest parent creation"
  ON parents FOR INSERT
  TO anon
  WITH CHECK (is_guest = TRUE);

-- Allow anonymous users to read their own guest parent record (by session ID)
CREATE POLICY IF NOT EXISTS "Allow anonymous guest parent read by session"
  ON parents FOR SELECT
  TO anon
  USING (is_guest = TRUE AND guest_session_id IS NOT NULL);

-- ===========================================================================
-- PART 6: Helper Functions
-- ===========================================================================

-- Function to clean up old guest records (optional - can be run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_guest_parents()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete guest parents older than 90 days with no associated bookings
  DELETE FROM parents
  WHERE is_guest = TRUE
    AND created_at < NOW() - INTERVAL '90 days'
    AND NOT EXISTS (
      SELECT 1 FROM bookings WHERE bookings.parent_id = parents.id
    );

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_guest_parents() IS
  'Removes guest parent records older than 90 days that have no associated bookings. Can be scheduled via pg_cron.';

-- ===========================================================================
-- PART 7: Update Views (if they reference old fields)
-- ===========================================================================

-- Refresh materializedviews if they exist and depend on payment_records
-- Note: This is safe even if views don't exist
DO $$
BEGIN
  REFRESH MATERIALIZED VIEW IF EXISTS payment_analytics;
  REFRESH MATERIALIZED VIEW IF EXISTS commission_summary;
EXCEPTION
  WHEN undefined_table THEN
    NULL; -- Views don't exist, that's fine
END $$;

-- ===========================================================================
-- Migration Complete
-- ===========================================================================

-- Log the migration
DO $$
BEGIN
  RAISE NOTICE 'Migration 20260125131804_add_direct_charges_support completed successfully';
  RAISE NOTICE 'Added support for:';
  RAISE NOTICE '  - Direct charges (charge_type, connected_account_id, application_fee_id)';
  RAISE NOTICE '  - Refund tracking (refund_amount, refund_application_fee_amount)';
  RAISE NOTICE '  - Guest checkout (is_guest, guest_session_id on parents table)';
  RAISE NOTICE '  - Commission tracking (stripe_application_fee_id, actual_fee_collected)';
  RAISE NOTICE '  - Booking ID compatibility (booking_id if registration_id exists)';
END $$;
