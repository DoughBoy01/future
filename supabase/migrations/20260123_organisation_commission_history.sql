/*
  # Organisation Commission Rate History

  Tracks changes to organisation-level default commission rates with full audit trail.
  Complements the existing camp_commission_rates table for camp-specific overrides.

  ## Changes
  1. Creates organisation_commission_rates table
  2. Adds trigger to auto-end previous rate when new rate is set
  3. RLS policies for super admins and organisation members
  4. Indexes for performance

  ## Notes
  - This tracks organisation.default_commission_rate changes
  - Camp-specific overrides are tracked in existing camp_commission_rates table
  - Auto-ends previous rate period when new rate is inserted
*/

-- ============================================================================
-- STEP 1: CREATE ORGANISATION COMMISSION HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS organisation_commission_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  commission_rate NUMERIC(5,4) NOT NULL CHECK (commission_rate >= 0 AND commission_rate <= 1),
  effective_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  set_by UUID REFERENCES profiles(id),
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE organisation_commission_rates
  IS 'Audit trail of organisation default commission rate changes';

COMMENT ON COLUMN organisation_commission_rates.commission_rate
  IS 'Commission rate (0-1 range, e.g., 0.15 = 15%)';

COMMENT ON COLUMN organisation_commission_rates.effective_date
  IS 'Date when this rate became effective';

COMMENT ON COLUMN organisation_commission_rates.end_date
  IS 'Date when this rate was replaced (NULL if current rate)';

COMMENT ON COLUMN organisation_commission_rates.set_by
  IS 'Admin who set this rate';

COMMENT ON COLUMN organisation_commission_rates.notes
  IS 'Required explanation of why the rate was changed';

-- ============================================================================
-- STEP 2: INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_org_commission_rates_org_id
  ON organisation_commission_rates(organisation_id);

CREATE INDEX idx_org_commission_rates_effective
  ON organisation_commission_rates(effective_date DESC);

CREATE INDEX idx_org_commission_rates_current
  ON organisation_commission_rates(organisation_id, effective_date DESC)
  WHERE end_date IS NULL;

-- ============================================================================
-- STEP 3: AUTO-END PREVIOUS RATE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION end_previous_org_commission_rate()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- When a new rate is inserted, end the previous rate for this organisation
  UPDATE organisation_commission_rates
  SET end_date = NEW.effective_date
  WHERE organisation_id = NEW.organisation_id
    AND end_date IS NULL
    AND id != NEW.id;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION end_previous_org_commission_rate()
  IS 'Automatically sets end_date on previous commission rate when new rate is inserted';

CREATE TRIGGER auto_end_org_commission_rate
  AFTER INSERT ON organisation_commission_rates
  FOR EACH ROW
  EXECUTE FUNCTION end_previous_org_commission_rate();

-- ============================================================================
-- STEP 4: RLS POLICIES
-- ============================================================================

ALTER TABLE organisation_commission_rates ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all org commission history
CREATE POLICY "Super admins can manage org commission history"
  ON organisation_commission_rates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

COMMENT ON POLICY "Super admins can manage org commission history" ON organisation_commission_rates
  IS 'Super admins have full access to organisation commission rate history';

-- Organisation members can view their own org commission history
CREATE POLICY "Org members can view their org commission history"
  ON organisation_commission_rates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organisation_members
      WHERE organisation_members.organisation_id = organisation_commission_rates.organisation_id
        AND organisation_members.profile_id = auth.uid()
        AND organisation_members.status = 'active'
    )
  );

COMMENT ON POLICY "Org members can view their org commission history" ON organisation_commission_rates
  IS 'Active organisation members can view their own organisation commission rate history';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- To verify this migration worked, run:
--
-- 1. Check that organisation_commission_rates table exists:
-- \d organisation_commission_rates
--
-- 2. Verify indexes were created:
-- SELECT indexname FROM pg_indexes
-- WHERE tablename = 'organisation_commission_rates';
--
-- 3. Verify trigger exists:
-- SELECT trigger_name FROM information_schema.triggers
-- WHERE event_object_table = 'organisation_commission_rates';
--
-- 4. Verify RLS policies:
-- SELECT policyname FROM pg_policies
-- WHERE tablename = 'organisation_commission_rates';
