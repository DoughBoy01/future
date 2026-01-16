-- Drop ALL existing policies to ensure clean slate
DROP POLICY IF EXISTS "Parents can insert own data" ON parents;
DROP POLICY IF EXISTS "Parents can view own data" ON parents;
DROP POLICY IF EXISTS "Parents can update own data" ON parents;
DROP POLICY IF EXISTS "Guest users can create parent records" ON parents;
DROP POLICY IF EXISTS "Guest users can view guest records" ON parents;

-- =============================================
-- AUTHENTICATED USER POLICIES
-- =============================================

-- Allow authenticated users to insert their own parent records
CREATE POLICY "Parents can insert own data"
  ON parents FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Allow authenticated users to view their own parent records
CREATE POLICY "Parents can view own data"
  ON parents FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Allow authenticated users to update their own parent records
CREATE POLICY "Parents can update own data"
  ON parents FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- =============================================
-- GUEST USER POLICIES (UNAUTHENTICATED)
-- =============================================

-- Allow guest users (anon) to create parent records for checkout
CREATE POLICY "Guest users can create parent records"
  ON parents FOR INSERT
  TO anon
  WITH CHECK (
    is_guest = true
    AND profile_id IS NULL
    AND guest_email IS NOT NULL
    AND guest_name IS NOT NULL
  );

-- Allow guest users to view guest parent records
-- (needed for retrieving guest info during checkout/confirmation)
CREATE POLICY "Guest users can view guest records"
  ON parents FOR SELECT
  TO anon
  USING (
    is_guest = true
    AND profile_id IS NULL
  );

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant permissions to authenticated users
GRANT INSERT, SELECT, UPDATE ON parents TO authenticated;

-- Grant permissions to anonymous users (for guest checkout)
GRANT INSERT, SELECT ON parents TO anon;
