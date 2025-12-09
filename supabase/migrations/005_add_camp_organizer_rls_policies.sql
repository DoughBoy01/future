-- Migration: Add RLS policies for camp_organizer role
-- Phase 2: Workflows - Step 2
-- Description: Row-level security policies allowing camp organizers to manage their camps

-- ============================================================================
-- CAMPS TABLE POLICIES
-- ============================================================================

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Camp organizers can view their camps" ON camps;
DROP POLICY IF EXISTS "Camp organizers can create camps" ON camps;
DROP POLICY IF EXISTS "Camp organizers can update their camps" ON camps;
DROP POLICY IF EXISTS "Camp organizers can delete draft camps" ON camps;

-- Policy: Camp organizers can view their own organisation's camps
CREATE POLICY "Camp organizers can view their organisation camps"
  ON camps FOR SELECT
  USING (
    -- Public can see published camps
    status = 'published' OR
    -- Super admins see all
    is_super_admin() OR
    -- Camp organizers see their org's camps
    (is_camp_organizer() AND organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE profile_id = auth.uid() AND status = 'active'
    ))
  );

-- Policy: Camp organizers can create camps for their organisation
CREATE POLICY "Camp organizers can create camps"
  ON camps FOR INSERT
  WITH CHECK (
    is_camp_organizer() AND
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE profile_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin', 'staff')
    )
  );

-- Policy: Camp organizers can update their camps (with restrictions)
CREATE POLICY "Camp organizers can update their camps"
  ON camps FOR UPDATE
  USING (
    is_super_admin() OR
    (
      is_camp_organizer() AND
      can_edit_camp(id) AND
      organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE profile_id = auth.uid()
          AND status = 'active'
          AND role IN ('owner', 'admin', 'staff')
      )
    )
  );

-- Policy: Camp organizers can delete only draft camps
CREATE POLICY "Camp organizers can delete draft camps"
  ON camps FOR DELETE
  USING (
    is_super_admin() OR
    (
      is_camp_organizer() AND
      status = 'draft' AND
      organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE profile_id = auth.uid()
          AND status = 'active'
          AND role IN ('owner', 'admin')
      )
    )
  );

-- ============================================================================
-- ORGANISATIONS TABLE POLICIES
-- ============================================================================

-- Policy: Users can view organisations they're members of
CREATE POLICY "Users can view their organisations"
  ON organisations FOR SELECT
  USING (
    is_super_admin() OR
    active = TRUE OR
    id IN (
      SELECT organisation_id FROM organisation_members
      WHERE profile_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Organisation owners can update their organisation
CREATE POLICY "Organisation owners can update their organisation"
  ON organisations FOR UPDATE
  USING (
    is_super_admin() OR
    id IN (
      SELECT organisation_id FROM organisation_members
      WHERE profile_id = auth.uid()
        AND status = 'active'
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================================
-- COMMISSION RECORDS POLICIES
-- ============================================================================

-- Policy: Organisation members can view their commission records
CREATE POLICY "Organisation members can view their commissions"
  ON commission_records FOR SELECT
  USING (
    is_super_admin() OR
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE profile_id = auth.uid() AND status = 'active'
    )
  );

-- ============================================================================
-- REGISTRATIONS POLICIES (for camp organizers to view bookings)
-- ============================================================================

-- Policy: Camp organizers can view registrations for their camps
CREATE POLICY "Camp organizers can view their camp registrations"
  ON registrations FOR SELECT
  USING (
    is_super_admin() OR
    parent_id IN (
      SELECT id FROM parents WHERE profile_id = auth.uid()
    ) OR
    camp_id IN (
      SELECT id FROM camps
      WHERE organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE profile_id = auth.uid()
          AND status = 'active'
      )
    )
  );

-- ============================================================================
-- ENQUIRIES POLICIES
-- ============================================================================

-- Policy: Camp organizers can view enquiries for their camps
CREATE POLICY "Camp organizers can view their camp enquiries"
  ON enquiries FOR SELECT
  USING (
    is_super_admin() OR
    parent_id IN (
      SELECT id FROM parents WHERE profile_id = auth.uid()
    ) OR
    camp_id IN (
      SELECT id FROM camps
      WHERE organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE profile_id = auth.uid()
          AND status = 'active'
      )
    )
  );

-- Policy: Camp organizers can respond to enquiries
CREATE POLICY "Camp organizers can respond to enquiries"
  ON enquiries FOR UPDATE
  USING (
    is_super_admin() OR
    camp_id IN (
      SELECT id FROM camps
      WHERE organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE profile_id = auth.uid()
          AND status = 'active'
          AND role IN ('owner', 'admin', 'staff')
      )
    )
  );

-- ============================================================================
-- FEEDBACK POLICIES
-- ============================================================================

-- Policy: Camp organizers can view feedback for their camps
CREATE POLICY "Camp organizers can view their camp feedback"
  ON feedback FOR SELECT
  USING (
    visible = TRUE OR
    is_super_admin() OR
    camp_id IN (
      SELECT id FROM camps
      WHERE organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE profile_id = auth.uid()
          AND status = 'active'
      )
    )
  );

-- Policy: Camp organizers can respond to feedback
CREATE POLICY "Camp organizers can respond to feedback"
  ON feedback FOR UPDATE
  USING (
    is_super_admin() OR
    camp_id IN (
      SELECT id FROM camps
      WHERE organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE profile_id = auth.uid()
          AND status = 'active'
          AND role IN ('owner', 'admin', 'staff')
      )
    )
  )
  WITH CHECK (
    -- Can only update response fields
    camp_id = camp_id AND
    parent_id = parent_id AND
    overall_rating = overall_rating
  );

COMMENT ON POLICY "Camp organizers can view their organisation camps" ON camps
  IS 'Allows camp organizers to see all camps from their organisation';

COMMENT ON POLICY "Camp organizers can update their camps" ON camps
  IS 'Allows camp organizers to edit camps in draft, requires_changes, or unpublished status';
