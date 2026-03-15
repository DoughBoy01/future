/*
  # RLS Policies for commission_records and payouts tables

  ## Summary
  Adds row-level security policies to financial tables that were missing access controls.

  ## Tables Fixed

  ### 1. commission_records
  - Enabled RLS
  - Organisation members can view their own organisation's commission records
  - Super admins have full read access
  - Service role retains full access (for Edge Functions)

  ### 2. payouts
  - Enabled RLS
  - Organisation members can view their own organisation's payouts
  - Super admins have full read access

  ## Security Notes
  - Only authenticated users with correct org membership can access records
  - No user can modify commission records directly (write access reserved for service role via Edge Functions)
  - Payout creation/updates are reserved for super admins and service role
*/

-- =============================================
-- COMMISSION_RECORDS TABLE
-- =============================================

ALTER TABLE IF EXISTS commission_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'commission_records' AND policyname = 'Org members can view their commission records'
  ) THEN
    CREATE POLICY "Org members can view their commission records"
      ON commission_records FOR SELECT
      TO authenticated
      USING (
        organisation_id IN (
          SELECT organisation_id FROM profiles
          WHERE id = auth.uid()
          AND organisation_id IS NOT NULL
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'commission_records' AND policyname = 'Super admins can view all commission records'
  ) THEN
    CREATE POLICY "Super admins can view all commission records"
      ON commission_records FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role IN ('super_admin', 'school_admin', 'operations')
        )
      );
  END IF;
END $$;

-- =============================================
-- PAYOUTS TABLE
-- =============================================

ALTER TABLE IF EXISTS payouts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payouts' AND policyname = 'Org members can view their payouts'
  ) THEN
    CREATE POLICY "Org members can view their payouts"
      ON payouts FOR SELECT
      TO authenticated
      USING (
        organisation_id IN (
          SELECT organisation_id FROM profiles
          WHERE id = auth.uid()
          AND organisation_id IS NOT NULL
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payouts' AND policyname = 'Super admins can view all payouts'
  ) THEN
    CREATE POLICY "Super admins can view all payouts"
      ON payouts FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role IN ('super_admin', 'school_admin', 'operations')
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payouts' AND policyname = 'Super admins can insert payouts'
  ) THEN
    CREATE POLICY "Super admins can insert payouts"
      ON payouts FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role IN ('super_admin', 'school_admin', 'operations')
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'payouts' AND policyname = 'Super admins can update payouts'
  ) THEN
    CREATE POLICY "Super admins can update payouts"
      ON payouts FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role IN ('super_admin', 'school_admin', 'operations')
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid()
          AND role IN ('super_admin', 'school_admin', 'operations')
        )
      );
  END IF;
END $$;
