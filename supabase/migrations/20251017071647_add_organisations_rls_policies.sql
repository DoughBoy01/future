/*
  # Add RLS Policies for Organisations Management

  ## Overview
  Enables super admins to fully manage organisations (create, read, update, delete) while maintaining
  existing view permissions for authenticated users.

  ## Changes
  1. **Organisations Table RLS Policies**
     - Super admins can insert new organisations
     - Super admins can update any organisation
     - Super admins can delete organisations
     - Super admins can view all organisations
  
  ## Security Notes
  - All policies require authentication
  - Super admin role is verified using the is_super_admin() helper function
  - Policies are additive to existing RLS policies
  - Data integrity maintained through foreign key relationships
*/

-- =============================================
-- ORGANISATIONS TABLE RLS POLICIES
-- =============================================

-- Check and create policy for inserting organisations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organisations' AND policyname = 'Super admins can insert organisations') THEN
    CREATE POLICY "Super admins can insert organisations"
      ON organisations FOR INSERT
      TO authenticated
      WITH CHECK (is_super_admin());
  END IF;
END $$;

-- Check and create policy for updating organisations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organisations' AND policyname = 'Super admins can update organisations') THEN
    CREATE POLICY "Super admins can update organisations"
      ON organisations FOR UPDATE
      TO authenticated
      USING (is_super_admin())
      WITH CHECK (is_super_admin());
  END IF;
END $$;

-- Check and create policy for deleting organisations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organisations' AND policyname = 'Super admins can delete organisations') THEN
    CREATE POLICY "Super admins can delete organisations"
      ON organisations FOR DELETE
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;

-- Check and create policy for viewing all organisations
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'organisations' AND policyname = 'Super admins can view all organisations') THEN
    CREATE POLICY "Super admins can view all organisations"
      ON organisations FOR SELECT
      TO authenticated
      USING (is_super_admin());
  END IF;
END $$;
