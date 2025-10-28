/*
  # Add Super Admin RLS Policies

  This migration adds comprehensive Row Level Security policies to grant super_admin users 
  full access to all tables in the database for data management purposes.

  ## Changes

  1. **Profiles Table** - Add policies for super_admin full access
  2. **Schools Table** - Add policies for super_admin full access
  3. **Camps Table** - Add policies for super_admin full access
  4. **Registrations Table** - Add policies for super_admin full access
  5. **Children Table** - Add policies for super_admin full access
  6. **Communications Table** - Add policies for super_admin full access
  7. **Discount Codes Table** - Add policies for super_admin full access
  8. **Incidents Table** - Add policies for super_admin full access
  9. **Feedback Table** - Add policies for super_admin full access

  ## Security Notes
  - All policies check that the authenticated user has role = 'super_admin'
  - Policies are additive and work alongside existing role-specific policies
*/

-- Profiles table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Super admins can view all profiles') THEN
    CREATE POLICY "Super admins can view all profiles"
      ON profiles FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Super admins can update all profiles') THEN
    CREATE POLICY "Super admins can update all profiles"
      ON profiles FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Super admins can delete profiles') THEN
    CREATE POLICY "Super admins can delete profiles"
      ON profiles FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

-- Schools table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Super admins can insert schools') THEN
    CREATE POLICY "Super admins can insert schools"
      ON schools FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Super admins can update schools') THEN
    CREATE POLICY "Super admins can update schools"
      ON schools FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'schools' AND policyname = 'Super admins can delete schools') THEN
    CREATE POLICY "Super admins can delete schools"
      ON schools FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

-- Camps table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camps' AND policyname = 'Super admins can view all camps') THEN
    CREATE POLICY "Super admins can view all camps"
      ON camps FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camps' AND policyname = 'Super admins can insert camps') THEN
    CREATE POLICY "Super admins can insert camps"
      ON camps FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camps' AND policyname = 'Super admins can update camps') THEN
    CREATE POLICY "Super admins can update camps"
      ON camps FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'camps' AND policyname = 'Super admins can delete camps') THEN
    CREATE POLICY "Super admins can delete camps"
      ON camps FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

-- Registrations table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'Super admins can view all registrations') THEN
    CREATE POLICY "Super admins can view all registrations"
      ON registrations FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'Super admins can insert registrations') THEN
    CREATE POLICY "Super admins can insert registrations"
      ON registrations FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'Super admins can update registrations') THEN
    CREATE POLICY "Super admins can update registrations"
      ON registrations FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'registrations' AND policyname = 'Super admins can delete registrations') THEN
    CREATE POLICY "Super admins can delete registrations"
      ON registrations FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

-- Children table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Super admins can view all children') THEN
    CREATE POLICY "Super admins can view all children"
      ON children FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Super admins can insert children') THEN
    CREATE POLICY "Super admins can insert children"
      ON children FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Super admins can update children') THEN
    CREATE POLICY "Super admins can update children"
      ON children FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'children' AND policyname = 'Super admins can delete children') THEN
    CREATE POLICY "Super admins can delete children"
      ON children FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

-- Communications table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communications' AND policyname = 'Super admins can view all communications') THEN
    CREATE POLICY "Super admins can view all communications"
      ON communications FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communications' AND policyname = 'Super admins can insert communications') THEN
    CREATE POLICY "Super admins can insert communications"
      ON communications FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communications' AND policyname = 'Super admins can update communications') THEN
    CREATE POLICY "Super admins can update communications"
      ON communications FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communications' AND policyname = 'Super admins can delete communications') THEN
    CREATE POLICY "Super admins can delete communications"
      ON communications FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

-- Discount codes table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discount_codes' AND policyname = 'Super admins can view all discount codes') THEN
    CREATE POLICY "Super admins can view all discount codes"
      ON discount_codes FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discount_codes' AND policyname = 'Super admins can insert discount codes') THEN
    CREATE POLICY "Super admins can insert discount codes"
      ON discount_codes FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discount_codes' AND policyname = 'Super admins can update discount codes') THEN
    CREATE POLICY "Super admins can update discount codes"
      ON discount_codes FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'discount_codes' AND policyname = 'Super admins can delete discount codes') THEN
    CREATE POLICY "Super admins can delete discount codes"
      ON discount_codes FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

-- Incidents table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incidents' AND policyname = 'Super admins can view all incidents') THEN
    CREATE POLICY "Super admins can view all incidents"
      ON incidents FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incidents' AND policyname = 'Super admins can insert incidents') THEN
    CREATE POLICY "Super admins can insert incidents"
      ON incidents FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incidents' AND policyname = 'Super admins can update incidents') THEN
    CREATE POLICY "Super admins can update incidents"
      ON incidents FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'incidents' AND policyname = 'Super admins can delete incidents') THEN
    CREATE POLICY "Super admins can delete incidents"
      ON incidents FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

-- Feedback table policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Super admins can view all feedback') THEN
    CREATE POLICY "Super admins can view all feedback"
      ON feedback FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Super admins can insert feedback') THEN
    CREATE POLICY "Super admins can insert feedback"
      ON feedback FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Super admins can update feedback') THEN
    CREATE POLICY "Super admins can update feedback"
      ON feedback FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feedback' AND policyname = 'Super admins can delete feedback') THEN
    CREATE POLICY "Super admins can delete feedback"
      ON feedback FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'super_admin'
        )
      );
  END IF;
END $$;
