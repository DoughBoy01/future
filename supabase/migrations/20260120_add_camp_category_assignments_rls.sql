/*
  # Add RLS Policies for camp_category_assignments

  ## Problem
  Camp organizers cannot save new camps because INSERT operations on
  camp_category_assignments table are blocked by RLS.

  Error: "new row violates row-level security policy for table camp_category_assignments"

  ## Root Cause
  The camp_category_assignments table has RLS enabled but no policies exist
  to allow camp organizers to assign categories to their camps.

  ## Solution
  Add RLS policies to allow camp organizers to:
  1. INSERT category assignments for camps in their organization
  2. DELETE category assignments for camps in their organization (needed for updates)
  3. SELECT category assignments for camps in their organization
  4. Super admins get full access
*/

-- Enable RLS if not already enabled
ALTER TABLE camp_category_assignments ENABLE ROW LEVEL SECURITY;

-- Policy 1: Super admins have full access
CREATE POLICY "Super admins full access to camp category assignments"
  ON camp_category_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );

COMMENT ON POLICY "Super admins full access to camp category assignments" ON camp_category_assignments
  IS 'Super admins can view, create, update, and delete all camp category assignments';

-- Policy 2: Camp organizers can view category assignments for their org's camps
CREATE POLICY "Camp organizers can view their org camp categories"
  ON camp_category_assignments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps c
      INNER JOIN organisation_members om ON om.organisation_id = c.organisation_id
      WHERE c.id = camp_category_assignments.camp_id
      AND om.profile_id = auth.uid()
      AND om.status = 'active'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'camp_organizer'
      )
    )
  );

COMMENT ON POLICY "Camp organizers can view their org camp categories" ON camp_category_assignments
  IS 'Camp organizers can view category assignments for camps in their organization';

-- Policy 3: Camp organizers can insert category assignments for their org's camps
CREATE POLICY "Camp organizers can assign categories to their org camps"
  ON camp_category_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM camps c
      INNER JOIN organisation_members om ON om.organisation_id = c.organisation_id
      WHERE c.id = camp_category_assignments.camp_id
      AND om.profile_id = auth.uid()
      AND om.status = 'active'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'camp_organizer'
      )
    )
  );

COMMENT ON POLICY "Camp organizers can assign categories to their org camps" ON camp_category_assignments
  IS 'Camp organizers can create category assignments for camps in their organization';

-- Policy 4: Camp organizers can delete category assignments for their org's camps
CREATE POLICY "Camp organizers can remove categories from their org camps"
  ON camp_category_assignments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM camps c
      INNER JOIN organisation_members om ON om.organisation_id = c.organisation_id
      WHERE c.id = camp_category_assignments.camp_id
      AND om.profile_id = auth.uid()
      AND om.status = 'active'
      AND EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid()
        AND role = 'camp_organizer'
      )
    )
  );

COMMENT ON POLICY "Camp organizers can remove categories from their org camps" ON camp_category_assignments
  IS 'Camp organizers can delete category assignments for camps in their organization';

-- Policy 5: Allow public to view category assignments (needed for public camp browsing)
CREATE POLICY "Public can view camp category assignments"
  ON camp_category_assignments
  FOR SELECT
  TO public
  USING (true);

COMMENT ON POLICY "Public can view camp category assignments" ON camp_category_assignments
  IS 'Public users can view category assignments to browse camps by category';
