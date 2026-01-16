-- ============================================================
-- FIX CHILDREN TABLE RLS - RESTORE GUEST CHECKOUT
-- ============================================================

-- Drop existing guest children policies to ensure clean slate
DROP POLICY IF EXISTS "Guest users can create children records" ON children;
DROP POLICY IF EXISTS "Guest users can view children records" ON children;

-- Allow guest users (anon) to create children records for checkout
CREATE POLICY "Guest users can create children records"
  ON children FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = children.parent_id
      AND parents.is_guest = true
    )
  );

-- Allow guest users to view children records (for retrieving during checkout)
CREATE POLICY "Guest users can view children records"
  ON children FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = children.parent_id
      AND parents.is_guest = true
    )
  );

-- Ensure anonymous users have permissions on children
GRANT INSERT, SELECT ON children TO anon;

-- ============================================================
-- FIX BOOKINGS TABLE RLS (parent booking records)
-- ============================================================

-- Drop existing guest bookings policies
DROP POLICY IF EXISTS "Guest users can create bookings" ON bookings;
DROP POLICY IF EXISTS "Guest users can view bookings" ON bookings;

-- Allow guest users to create bookings
CREATE POLICY "Guest users can create bookings"
  ON bookings FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = bookings.parent_id
      AND parents.is_guest = true
    )
  );

-- Allow guest users to view their bookings
CREATE POLICY "Guest users can view bookings"
  ON bookings FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = bookings.parent_id
      AND parents.is_guest = true
    )
  );

-- Ensure anonymous users have permissions on bookings
GRANT INSERT, SELECT ON bookings TO anon;

-- ============================================================
-- FIX REGISTRATIONS TABLE RLS (child-specific registrations)
-- ============================================================

-- Drop existing guest registrations policies
DROP POLICY IF EXISTS "Guest users can create registrations" ON registrations;
DROP POLICY IF EXISTS "Guest users can view registrations" ON registrations;

-- Allow guest users to create registrations (via bookings → parents)
CREATE POLICY "Guest users can create registrations"
  ON registrations FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN parents p ON b.parent_id = p.id
      WHERE b.id = registrations.booking_id
      AND p.is_guest = true
    )
  );

-- Allow guest users to view their registrations (via bookings → parents)
CREATE POLICY "Guest users can view registrations"
  ON registrations FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN parents p ON b.parent_id = p.id
      WHERE b.id = registrations.booking_id
      AND p.is_guest = true
    )
  );

-- Ensure anonymous users have permissions on registrations
GRANT INSERT, SELECT ON registrations TO anon;
