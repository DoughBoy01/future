/*
  # Restore Super Admin RLS Policies

  ## Overview
  Restores missing super admin Row Level Security policies for parents, children, and bookings tables.
  These policies were inadvertently removed in the 20260108 migrations when fixing guest checkout RLS.

  ## Background
  - Migration 20260108_fix_parents_rls.sql dropped all parent policies but only recreated user/guest policies
  - Migration 20260108_fix_children_rls.sql dropped all children/bookings guest policies but didn't restore super admin policies
  - This caused the BookingsManagement dashboard to show "Unknown" for contact details because admins couldn't access parent records

  ## Changes
  1. **Parents Table** - Restore super admin SELECT, INSERT, UPDATE, DELETE policies
  2. **Children Table** - Restore super admin SELECT, INSERT, UPDATE, DELETE policies
  3. **Bookings Table** - Restore super admin SELECT, INSERT, UPDATE, DELETE policies

  ## Security Notes
  - All policies check that the authenticated user has role = 'super_admin' via is_super_admin() helper
  - Policies are additive and work alongside existing user/guest policies
  - Uses idempotent pattern (IF NOT EXISTS) for safe re-running
*/

-- =============================================
-- PARENTS TABLE - SUPER ADMIN POLICIES
-- =============================================

-- Super admins can view all parents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'Super admins can view all parents') THEN
    CREATE POLICY "Super admins can view all parents"
      ON parents FOR SELECT
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

-- Super admins can insert parents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'Super admins can insert parents') THEN
    CREATE POLICY "Super admins can insert parents"
      ON parents FOR INSERT
      TO authenticated
      WITH CHECK (is_super_admin());
  END IF;
END $$;

-- Super admins can update parents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'Super admins can update parents') THEN
    CREATE POLICY "Super admins can update parents"
      ON parents FOR UPDATE
      TO authenticated
      USING (is_super_admin())
      WITH CHECK (is_super_admin());
  END IF;
END $$;

-- Super admins can delete parents
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'Super admins can delete parents') THEN
    CREATE POLICY "Super admins can delete parents"
      ON parents FOR DELETE
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

-- =============================================
-- CHILDREN TABLE - SUPER ADMIN POLICIES
-- =============================================

-- Super admins can view all children
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Super admins can view all children') THEN
    CREATE POLICY "Super admins can view all children"
      ON children FOR SELECT
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

-- Super admins can insert children
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Super admins can insert children') THEN
    CREATE POLICY "Super admins can insert children"
      ON children FOR INSERT
      TO authenticated
      WITH CHECK (is_super_admin());
  END IF;
END $$;

-- Super admins can update children
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Super admins can update children') THEN
    CREATE POLICY "Super admins can update children"
      ON children FOR UPDATE
      TO authenticated
      USING (is_super_admin())
      WITH CHECK (is_super_admin());
  END IF;
END $$;

-- Super admins can delete children
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Super admins can delete children') THEN
    CREATE POLICY "Super admins can delete children"
      ON children FOR DELETE
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

-- =============================================
-- BOOKINGS TABLE - SUPER ADMIN POLICIES
-- =============================================

-- Super admins can view all bookings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Super admins can view all bookings') THEN
    CREATE POLICY "Super admins can view all bookings"
      ON bookings FOR SELECT
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

-- Super admins can insert bookings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Super admins can insert bookings') THEN
    CREATE POLICY "Super admins can insert bookings"
      ON bookings FOR INSERT
      TO authenticated
      WITH CHECK (is_super_admin());
  END IF;
END $$;

-- Super admins can update bookings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Super admins can update bookings') THEN
    CREATE POLICY "Super admins can update bookings"
      ON bookings FOR UPDATE
      TO authenticated
      USING (is_super_admin())
      WITH CHECK (is_super_admin());
  END IF;
END $$;

-- Super admins can delete bookings
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Super admins can delete bookings') THEN
    CREATE POLICY "Super admins can delete bookings"
      ON bookings FOR DELETE
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;
