-- Simple fix: Allow users to create their own profiles during signup

-- Add INSERT policy for profiles (missing from original schema)
CREATE POLICY "Users can create own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure camp_organizers can create organizations
CREATE POLICY "Camp organizers can create organizations" ON organisations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'camp_organizer'
    )
  );

-- Ensure camp_organizers can add themselves as members
CREATE POLICY "Users can add themselves as org members" ON organisation_members
  FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());
