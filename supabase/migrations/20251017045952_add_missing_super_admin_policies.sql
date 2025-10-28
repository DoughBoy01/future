/*
  # Add Missing Super Admin RLS Policies

  ## Overview
  Adds missing Row Level Security policies to ensure super_admin users can access all data
  required for the admin dashboard to function properly.

  ## Changes
  1. **Parents Table** - Add super admin SELECT policy
  2. **Enquiries Table** - Verify super admin has all CRUD operations (already has some)
  3. **Payment Records Table** - Add super admin policies
  4. **Attendance Table** - Add super admin policies  
  5. **Registration Forms Table** - Add super admin policies

  ## Security Notes
  - All policies check that the authenticated user has role = 'super_admin'
  - Policies are additive and work alongside existing role-specific policies
  - Super admins need read access to generate dashboard statistics
*/

-- Parents table - Add SELECT policy for super admins
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'Super admins can view all parents') THEN
    CREATE POLICY "Super admins can view all parents"
      ON parents FOR SELECT
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

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

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'parents' AND policyname = 'Super admins can delete parents') THEN
    CREATE POLICY "Super admins can delete parents"
      ON parents FOR DELETE
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

-- Enquiries table - Add INSERT and DELETE policies for super admins (SELECT/UPDATE already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'enquiries' AND policyname = 'Super admins can insert enquiries') THEN
    CREATE POLICY "Super admins can insert enquiries"
      ON enquiries FOR INSERT
      TO authenticated
      WITH CHECK (is_super_admin());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'enquiries' AND policyname = 'Super admins can delete enquiries') THEN
    CREATE POLICY "Super admins can delete enquiries"
      ON enquiries FOR DELETE
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

-- Payment records table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_records' AND policyname = 'Super admins can view all payment records') THEN
    CREATE POLICY "Super admins can view all payment records"
      ON payment_records FOR SELECT
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_records' AND policyname = 'Super admins can insert payment records') THEN
    CREATE POLICY "Super admins can insert payment records"
      ON payment_records FOR INSERT
      TO authenticated
      WITH CHECK (is_super_admin());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_records' AND policyname = 'Super admins can update payment records') THEN
    CREATE POLICY "Super admins can update payment records"
      ON payment_records FOR UPDATE
      TO authenticated
      USING (is_super_admin())
      WITH CHECK (is_super_admin());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payment_records' AND policyname = 'Super admins can delete payment records') THEN
    CREATE POLICY "Super admins can delete payment records"
      ON payment_records FOR DELETE
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

-- Attendance table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'Super admins can view all attendance') THEN
    CREATE POLICY "Super admins can view all attendance"
      ON attendance FOR SELECT
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'Super admins can insert attendance') THEN
    CREATE POLICY "Super admins can insert attendance"
      ON attendance FOR INSERT
      TO authenticated
      WITH CHECK (is_super_admin());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'Super admins can update attendance') THEN
    CREATE POLICY "Super admins can update attendance"
      ON attendance FOR UPDATE
      TO authenticated
      USING (is_super_admin())
      WITH CHECK (is_super_admin());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'Super admins can delete attendance') THEN
    CREATE POLICY "Super admins can delete attendance"
      ON attendance FOR DELETE
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

-- Registration forms table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registration_forms' AND policyname = 'Super admins can view all registration forms') THEN
    CREATE POLICY "Super admins can view all registration forms"
      ON registration_forms FOR SELECT
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registration_forms' AND policyname = 'Super admins can insert registration forms') THEN
    CREATE POLICY "Super admins can insert registration forms"
      ON registration_forms FOR INSERT
      TO authenticated
      WITH CHECK (is_super_admin());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registration_forms' AND policyname = 'Super admins can update registration forms') THEN
    CREATE POLICY "Super admins can update registration forms"
      ON registration_forms FOR UPDATE
      TO authenticated
      USING (is_super_admin())
      WITH CHECK (is_super_admin());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registration_forms' AND policyname = 'Super admins can delete registration forms') THEN
    CREATE POLICY "Super admins can delete registration forms"
      ON registration_forms FOR DELETE
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;
