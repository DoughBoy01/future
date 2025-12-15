-- Migration: Rename registrations table to bookings
-- Purpose: Clarify that this table stores parent booking records with payment details from checkout
-- The new "registrations" table will be created in a separate migration for child enrollment details

-- =====================================================
-- STEP 1: Rename the table
-- =====================================================
ALTER TABLE registrations RENAME TO bookings;

COMMENT ON TABLE bookings IS 'Parent bookings from checkout flow - contains payment info and basic booking details. Each booking can have multiple children who will complete separate registration forms.';

-- =====================================================
-- STEP 2: Rename foreign key constraints
-- =====================================================

-- Drop old foreign key constraints and recreate with new names
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS registrations_camp_id_fkey;
ALTER TABLE bookings ADD CONSTRAINT bookings_camp_id_fkey
  FOREIGN KEY (camp_id) REFERENCES camps(id) ON DELETE CASCADE;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS registrations_child_id_fkey;
ALTER TABLE bookings ADD CONSTRAINT bookings_child_id_fkey
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE;

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS registrations_parent_id_fkey;
ALTER TABLE bookings ADD CONSTRAINT bookings_parent_id_fkey
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE;

-- =====================================================
-- STEP 3: Update dependent tables
-- =====================================================

-- payment_records table
ALTER TABLE payment_records DROP CONSTRAINT IF EXISTS payment_records_registration_id_fkey;
ALTER TABLE payment_records RENAME COLUMN registration_id TO booking_id;
ALTER TABLE payment_records ADD CONSTRAINT payment_records_booking_id_fkey
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;

-- commission_records table
ALTER TABLE commission_records DROP CONSTRAINT IF EXISTS commission_records_registration_id_fkey;
ALTER TABLE commission_records RENAME COLUMN registration_id TO booking_id;
ALTER TABLE commission_records ADD CONSTRAINT commission_records_booking_id_fkey
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT;

-- attendance table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attendance') THEN
    ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_registration_id_fkey;
    ALTER TABLE attendance RENAME COLUMN registration_id TO booking_id;
    ALTER TABLE attendance ADD CONSTRAINT attendance_booking_id_fkey
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
  END IF;
END $$;

-- feedback table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feedback') THEN
    ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_registration_id_fkey;
    ALTER TABLE feedback RENAME COLUMN registration_id TO booking_id;
    ALTER TABLE feedback ADD CONSTRAINT feedback_booking_id_fkey
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
  END IF;
END $$;

-- registration_forms table (will be deprecated and replaced by new registrations table)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'registration_forms') THEN
    ALTER TABLE registration_forms DROP CONSTRAINT IF EXISTS registration_forms_registration_id_fkey;
    ALTER TABLE registration_forms RENAME COLUMN registration_id TO booking_id;
    ALTER TABLE registration_forms ADD CONSTRAINT registration_forms_booking_id_fkey
      FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =====================================================
-- STEP 4: Rename indexes
-- =====================================================
ALTER INDEX IF EXISTS idx_registrations_camp_id RENAME TO idx_bookings_camp_id;
ALTER INDEX IF EXISTS idx_registrations_parent_id RENAME TO idx_bookings_parent_id;
ALTER INDEX IF EXISTS idx_registrations_child_id RENAME TO idx_bookings_child_id;
ALTER INDEX IF EXISTS idx_registrations_status RENAME TO idx_bookings_status;
ALTER INDEX IF EXISTS idx_registrations_payment_status RENAME TO idx_bookings_payment_status;
ALTER INDEX IF EXISTS idx_registrations_created_at RENAME TO idx_bookings_created_at;

-- =====================================================
-- STEP 5: Update RLS policies
-- =====================================================

-- Drop existing policies (they reference the old table name)
DROP POLICY IF EXISTS "Parents can view their registrations" ON bookings;
DROP POLICY IF EXISTS "Parents can create registrations" ON bookings;
DROP POLICY IF EXISTS "Parents can update their registrations" ON bookings;
DROP POLICY IF EXISTS "Camp organizers can view their camp registrations" ON bookings;
DROP POLICY IF EXISTS "Camp organizers can update registration status" ON bookings;
DROP POLICY IF EXISTS "Super admins can view all registrations" ON bookings;
DROP POLICY IF EXISTS "Super admins can manage all registrations" ON bookings;

-- Recreate RLS policies with updated names and logic
CREATE POLICY "Parents can view their bookings"
  ON bookings FOR SELECT
  USING (
    parent_id IN (
      SELECT id FROM parents WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    parent_id IN (
      SELECT id FROM parents WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update their bookings"
  ON bookings FOR UPDATE
  USING (
    parent_id IN (
      SELECT id FROM parents WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    parent_id IN (
      SELECT id FROM parents WHERE profile_id = auth.uid()
    )
  );

-- Camp organizers can view bookings for their camps
CREATE POLICY "Camp organizers can view their camp bookings"
  ON bookings FOR SELECT
  USING (
    is_super_admin() OR
    camp_id IN (
      SELECT id FROM camps WHERE organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE profile_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Camp organizers can update booking status (but not delete)
CREATE POLICY "Camp organizers can update booking status"
  ON bookings FOR UPDATE
  USING (
    is_super_admin() OR
    camp_id IN (
      SELECT id FROM camps WHERE organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE profile_id = auth.uid() AND status = 'active'
      )
    )
  )
  WITH CHECK (
    is_super_admin() OR
    camp_id IN (
      SELECT id FROM camps WHERE organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE profile_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Super admins can manage all bookings
CREATE POLICY "Super admins can view all bookings"
  ON bookings FOR SELECT
  USING (is_super_admin());

CREATE POLICY "Super admins can manage all bookings"
  ON bookings FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- =====================================================
-- STEP 6: Update triggers (if any exist)
-- =====================================================

-- Update trigger for updated_at column (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers
    WHERE trigger_name = 'update_registrations_updated_at'
    AND event_object_table = 'bookings'
  ) THEN
    DROP TRIGGER update_registrations_updated_at ON bookings;
    CREATE TRIGGER update_bookings_updated_at
      BEFORE UPDATE ON bookings
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =====================================================
-- STEP 7: Update any views or functions that reference registrations
-- =====================================================

-- Note: Functions that use the old table name will need manual updates
-- The following is a placeholder for any custom functions that may need updating

-- Example: If there are any materialized views or functions, they would be updated here
-- This will be handled on a case-by-case basis as they are discovered

-- =====================================================
-- VERIFICATION QUERIES (commented out - for manual testing)
-- =====================================================

-- Verify table rename
-- SELECT COUNT(*) FROM bookings;

-- Verify foreign keys
-- SELECT
--   tc.constraint_name,
--   tc.table_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND (tc.table_name = 'bookings' OR ccu.table_name = 'bookings');

-- Verify indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'bookings';

-- Verify RLS policies
-- SELECT policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'bookings';
