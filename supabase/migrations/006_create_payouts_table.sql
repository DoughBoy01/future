-- Migration: Create payouts table
-- Phase 3: Financials - Step 1
-- Description: Tracks scheduled and completed payouts to camp organizers

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE RESTRICT,

  -- Payout amount details
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'GBP',
  commission_amount DECIMAL(10,2) NOT NULL, -- Total commission from which payout is calculated
  platform_fee DECIMAL(10,2) DEFAULT 0.00, -- Additional platform fees deducted

  -- Period covered by this payout
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Commission records included in this payout
  commission_record_ids UUID[] NOT NULL,

  -- Payout status and processing
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'scheduled', 'processing', 'paid', 'failed', 'cancelled')),
  scheduled_for DATE, -- When payout is scheduled to be processed

  -- Stripe integration
  stripe_payout_id TEXT UNIQUE,
  stripe_transfer_id TEXT,

  -- Payment details
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  retry_count INT DEFAULT 0,

  -- Bank account used (from organisation.bank_account_details)
  bank_account_last4 TEXT,

  -- Audit trail
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),

  -- Metadata for additional info
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT,

  -- Ensure period makes sense
  CHECK (period_end >= period_start)
);

-- Add indexes
CREATE INDEX idx_payouts_organisation_id ON payouts(organisation_id);
CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_scheduled_for ON payouts(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX idx_payouts_stripe_payout_id ON payouts(stripe_payout_id) WHERE stripe_payout_id IS NOT NULL;
CREATE INDEX idx_payouts_period ON payouts(period_start, period_end);
CREATE INDEX idx_payouts_created_at ON payouts(created_at DESC);

-- Add trigger to update updated_at
CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Policy: Organisation members can view their payouts
CREATE POLICY "Organisation members can view their payouts"
  ON payouts FOR SELECT
  USING (
    is_super_admin() OR
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE profile_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Only super admins can create/update/delete payouts
CREATE POLICY "Super admins can manage payouts"
  ON payouts FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- View: Upcoming payouts summary for organisations
CREATE OR REPLACE VIEW upcoming_payouts_summary AS
SELECT
  o.id AS organisation_id,
  o.name AS organisation_name,
  o.payout_schedule,
  COUNT(DISTINCT cr.id) AS pending_commissions_count,
  COALESCE(SUM(cr.commission_amount), 0) AS pending_commission_total,
  COALESCE(SUM(cr.registration_amount), 0) AS total_bookings_value,
  MIN(cr.created_at) AS oldest_pending_commission,
  o.minimum_payout_amount,
  CASE
    WHEN COALESCE(SUM(cr.commission_amount), 0) >= o.minimum_payout_amount
    THEN TRUE
    ELSE FALSE
  END AS ready_for_payout,
  CASE
    WHEN o.payout_schedule = 'weekly' THEN CURRENT_DATE + INTERVAL '1 week'
    WHEN o.payout_schedule = 'biweekly' THEN CURRENT_DATE + INTERVAL '2 weeks'
    WHEN o.payout_schedule = 'monthly' THEN CURRENT_DATE + INTERVAL '1 month'
  END AS next_payout_date
FROM organisations o
LEFT JOIN commission_records cr ON cr.organisation_id = o.id
  AND cr.payment_status = 'paid'
  AND cr.id NOT IN (
    SELECT UNNEST(commission_record_ids)
    FROM payouts
    WHERE status IN ('paid', 'processing', 'scheduled')
  )
WHERE o.payout_enabled = TRUE
  AND o.onboarding_status = 'active'
GROUP BY o.id, o.name, o.payout_schedule, o.minimum_payout_amount;

-- Function to calculate next payout for an organisation
CREATE OR REPLACE FUNCTION calculate_next_payout(org_id UUID)
RETURNS TABLE (
  amount DECIMAL(10,2),
  commission_count BIGINT,
  commission_ids UUID[],
  ready BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(cr.commission_amount), 0)::DECIMAL(10,2) AS amount,
    COUNT(cr.id) AS commission_count,
    ARRAY_AGG(cr.id) AS commission_ids,
    (COALESCE(SUM(cr.commission_amount), 0) >= o.minimum_payout_amount) AS ready
  FROM organisations o
  LEFT JOIN commission_records cr ON cr.organisation_id = o.id
    AND cr.payment_status = 'paid'
    AND cr.id NOT IN (
      SELECT UNNEST(commission_record_ids)
      FROM payouts
      WHERE status IN ('paid', 'processing', 'scheduled')
    )
  WHERE o.id = org_id
  GROUP BY o.id, o.minimum_payout_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create a payout for an organisation
CREATE OR REPLACE FUNCTION create_payout(
  p_organisation_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS UUID AS $$
DECLARE
  v_payout_id UUID;
  v_commission_ids UUID[];
  v_total_amount DECIMAL(10,2);
  v_currency TEXT;
  v_org_record RECORD;
BEGIN
  -- Get organisation details
  SELECT * INTO v_org_record
  FROM organisations
  WHERE id = p_organisation_id;

  -- Verify organisation is ready for payouts
  IF NOT v_org_record.payout_enabled THEN
    RAISE EXCEPTION 'Organisation payouts are not enabled';
  END IF;

  -- Get eligible commission records
  SELECT
    ARRAY_AGG(id),
    COALESCE(SUM(commission_amount), 0),
    MAX(COALESCE((SELECT currency FROM camps WHERE id = camp_id LIMIT 1), 'GBP'))
  INTO v_commission_ids, v_total_amount, v_currency
  FROM commission_records
  WHERE organisation_id = p_organisation_id
    AND payment_status = 'paid'
    AND created_at::DATE BETWEEN p_period_start AND p_period_end
    AND id NOT IN (
      SELECT UNNEST(commission_record_ids)
      FROM payouts
      WHERE status IN ('paid', 'processing', 'scheduled')
    );

  -- Check if we have any commissions and meet minimum
  IF v_total_amount = 0 THEN
    RAISE EXCEPTION 'No eligible commissions found for the period';
  END IF;

  IF v_total_amount < v_org_record.minimum_payout_amount THEN
    RAISE EXCEPTION 'Total amount (%) is below minimum payout amount (%)',
      v_total_amount, v_org_record.minimum_payout_amount;
  END IF;

  -- Create the payout
  INSERT INTO payouts (
    organisation_id,
    amount,
    currency,
    commission_amount,
    period_start,
    period_end,
    commission_record_ids,
    status,
    created_by
  ) VALUES (
    p_organisation_id,
    v_total_amount,
    v_currency,
    v_total_amount,
    p_period_start,
    p_period_end,
    v_commission_ids,
    'pending',
    auth.uid()
  ) RETURNING id INTO v_payout_id;

  RETURN v_payout_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE payouts IS 'Tracks payouts to camp organizers from platform commissions';
COMMENT ON COLUMN payouts.status IS 'Payout status: pending → scheduled → processing → paid (or failed)';
COMMENT ON COLUMN payouts.commission_record_ids IS 'Array of commission_records.id included in this payout';
COMMENT ON COLUMN payouts.stripe_payout_id IS 'Stripe payout ID for tracking in Stripe Dashboard';
COMMENT ON VIEW upcoming_payouts_summary IS 'Summary of pending commissions and next payout date per organisation';
COMMENT ON FUNCTION create_payout IS 'Creates a new payout for an organisation for a given period';
