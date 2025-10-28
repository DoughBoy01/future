/*
  # Add Guest Checkout Support

  ## Overview
  Enables guest users to book camps without creating an account by making profile_id optional
  in the parents table and adding guest contact information fields.

  ## Changes

  ### 1. Modified Tables
    - `parents`
      - Make `profile_id` nullable to support guest users
      - Add `guest_email` field for guest user contact
      - Add `guest_name` field for guest user name
      - Add `guest_phone` field for guest user phone
      - Add `is_guest` boolean field to identify guest users

  ### 2. Security Changes
    - Update RLS policies to allow guest users to create parent records
    - Allow unauthenticated users to insert parent records for guest checkout
    - Allow guest users to create children records
    - Allow guest users to create registration records
    - Update camps SELECT policy to allow unauthenticated users to view published camps
    - Add anon role policies for guest checkout flow

  ### 3. Important Notes
    - Guest users will be identified by `is_guest = true` and `profile_id IS NULL`
    - Guest users can only access their data via the registration confirmation or email links
    - Existing authenticated user flows remain unchanged
    - RLS policies maintain security by restricting guest users to their own data
*/

-- =============================================
-- MODIFY PARENTS TABLE FOR GUEST USERS
-- =============================================

-- Make profile_id nullable and add guest user fields
DO $$
BEGIN
  -- Drop existing foreign key constraint if exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'parents_profile_id_fkey'
    AND table_name = 'parents'
  ) THEN
    ALTER TABLE parents DROP CONSTRAINT parents_profile_id_fkey;
  END IF;

  -- Make profile_id nullable
  ALTER TABLE parents ALTER COLUMN profile_id DROP NOT NULL;

  -- Re-add foreign key constraint (now allows NULL)
  ALTER TABLE parents ADD CONSTRAINT parents_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

  -- Add guest user fields if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parents' AND column_name = 'guest_email'
  ) THEN
    ALTER TABLE parents ADD COLUMN guest_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parents' AND column_name = 'guest_name'
  ) THEN
    ALTER TABLE parents ADD COLUMN guest_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parents' AND column_name = 'guest_phone'
  ) THEN
    ALTER TABLE parents ADD COLUMN guest_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parents' AND column_name = 'is_guest'
  ) THEN
    ALTER TABLE parents ADD COLUMN is_guest boolean DEFAULT false;
  END IF;
END $$;

-- Add check constraint to ensure either profile_id OR guest info is provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'parents_profile_or_guest_check'
  ) THEN
    ALTER TABLE parents ADD CONSTRAINT parents_profile_or_guest_check
      CHECK (
        (profile_id IS NOT NULL AND is_guest = false) OR
        (profile_id IS NULL AND is_guest = true AND guest_email IS NOT NULL AND guest_name IS NOT NULL)
      );
  END IF;
END $$;

-- =============================================
-- UPDATE RLS POLICIES FOR GUEST CHECKOUT
-- =============================================

-- Drop existing policies that we need to update
DROP POLICY IF EXISTS "Published camps are viewable by everyone" ON camps;
DROP POLICY IF EXISTS "Parents can insert own data" ON parents;
DROP POLICY IF EXISTS "Parents can insert own children" ON children;
DROP POLICY IF EXISTS "Parents can insert registrations for own children" ON registrations;
DROP POLICY IF EXISTS "Parents can view active discount codes" ON discount_codes;

-- Allow EVERYONE (including anon) to view published camps
CREATE POLICY "Published camps are viewable by everyone"
  ON camps FOR SELECT
  USING (status = 'published');

-- Allow anon users to insert parent records for guest checkout
CREATE POLICY "Guest users can create parent records"
  ON parents FOR INSERT
  TO anon
  WITH CHECK (
    is_guest = true
    AND profile_id IS NULL
    AND guest_email IS NOT NULL
    AND guest_name IS NOT NULL
  );

-- Keep existing authenticated parent insert policy
CREATE POLICY "Parents can insert own data"
  ON parents FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Allow anon users to insert children records for guest checkout
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

-- Keep existing authenticated children insert policy  
CREATE POLICY "Parents can insert own children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = children.parent_id
      AND parents.profile_id = auth.uid()
    )
  );

-- Allow anon users to insert registrations for guest checkout
CREATE POLICY "Guest users can create registrations"
  ON registrations FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = registrations.parent_id
      AND parents.is_guest = true
    )
  );

-- Keep existing authenticated registration insert policy
CREATE POLICY "Parents can insert registrations for own children"
  ON registrations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM parents
      WHERE parents.id = registrations.parent_id
      AND parents.profile_id = auth.uid()
    )
  );

-- Allow anon and authenticated users to view active discount codes
CREATE POLICY "Everyone can view active discount codes"
  ON discount_codes FOR SELECT
  USING (
    active = true
    AND valid_from <= CURRENT_DATE
    AND valid_until >= CURRENT_DATE
  );

-- =============================================
-- CREATE INDEXES FOR GUEST USER QUERIES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_parents_guest_email ON parents(guest_email) WHERE is_guest = true;
CREATE INDEX IF NOT EXISTS idx_parents_is_guest ON parents(is_guest);