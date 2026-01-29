-- Migration: Add Camp Publish/Unpublish Toggle Functionality
-- Created: 2026-01-27
-- Purpose: Allow camp organizers to toggle status between published and unpublished

-- ===========================================================================
-- PART 1: Create Toggle Function
-- ===========================================================================

CREATE OR REPLACE FUNCTION toggle_camp_publish_status(
  p_camp_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  new_status TEXT,
  message TEXT,
  confirmed_bookings_count INTEGER
) AS $$
DECLARE
  v_camp_status TEXT;
  v_created_by UUID;
  v_organisation_id UUID;
  v_bookings_count INTEGER;
  v_new_status TEXT;
BEGIN
  -- Fetch camp details
  SELECT status, created_by, organisation_id
  INTO v_camp_status, v_created_by, v_organisation_id
  FROM camps
  WHERE id = p_camp_id;

  -- Security Check 1: Camp must exist
  IF v_camp_status IS NULL THEN
    RETURN QUERY SELECT
      FALSE,
      NULL::TEXT,
      'Camp not found'::TEXT,
      0;
    RETURN;
  END IF;

  -- Security Check 2: User must be creator (or super admin)
  IF NOT is_super_admin() AND v_created_by != auth.uid() THEN
    RETURN QUERY SELECT
      FALSE,
      NULL::TEXT,
      'Unauthorized: You can only toggle camps you created'::TEXT,
      0;
    RETURN;
  END IF;

  -- Security Check 3: Can only toggle between published and unpublished
  IF v_camp_status NOT IN ('published', 'unpublished') THEN
    RETURN QUERY SELECT
      FALSE,
      NULL::TEXT,
      ('Can only toggle published or unpublished camps. Current status: ' || v_camp_status)::TEXT,
      0;
    RETURN;
  END IF;

  -- Count confirmed bookings for this camp
  SELECT COUNT(*)::INTEGER
  INTO v_bookings_count
  FROM bookings
  WHERE camp_id = p_camp_id
    AND status = 'confirmed'
    AND payment_status = 'paid';

  -- Determine new status
  IF v_camp_status = 'published' THEN
    v_new_status := 'unpublished';
  ELSE
    v_new_status := 'published';
  END IF;

  -- Perform the toggle
  -- Note: validate_stripe_before_publish() trigger will run and validate if republishing
  UPDATE camps
  SET
    status = v_new_status,
    updated_at = NOW()
  WHERE id = p_camp_id;

  -- Return success with details
  RETURN QUERY SELECT
    TRUE,
    v_new_status,
    CASE
      WHEN v_new_status = 'unpublished' AND v_bookings_count > 0 THEN
        ('Camp unpublished. ' || v_bookings_count || ' confirmed booking(s) remain active.')::TEXT
      WHEN v_new_status = 'unpublished' THEN
        'Camp unpublished successfully'::TEXT
      WHEN v_new_status = 'published' THEN
        'Camp published successfully'::TEXT
      ELSE 'Status updated'::TEXT
    END,
    v_bookings_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function comment
COMMENT ON FUNCTION toggle_camp_publish_status(UUID) IS
  'Toggles camp between published and unpublished status. Security: creator-only.
   Stripe validation occurs automatically via validate_stripe_before_publish() trigger.';

-- ===========================================================================
-- PART 2: Create RLS Policy for Toggle Function
-- ===========================================================================

-- RLS Policy: Allow creators to toggle their camp status
-- This is more permissive than can_edit_camp() but ONLY for status field
CREATE POLICY "camp_creator_toggle_publish_status"
  ON camps
  FOR UPDATE
  TO authenticated
  USING (
    -- Must be creator or super admin
    (created_by = auth.uid() OR is_super_admin())
    AND
    -- Can only toggle between published/unpublished
    status IN ('published', 'unpublished')
  )
  WITH CHECK (
    -- After update, status must still be published or unpublished
    status IN ('published', 'unpublished')
  );

COMMENT ON POLICY "camp_creator_toggle_publish_status" ON camps IS
  'Allows camp creators to toggle status between published and unpublished.
   Separate from can_edit_camp() to enable quick publish/unpublish without full edit access.';

-- ===========================================================================
-- PART 3: Create Audit Logging (Optional but Recommended)
-- ===========================================================================

-- Create audit log table for status changes
CREATE TABLE IF NOT EXISTS camp_status_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID NOT NULL REFERENCES profiles(id),
  change_reason TEXT,
  bookings_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX IF NOT EXISTS idx_camp_status_audit_camp_id ON camp_status_audit(camp_id);
CREATE INDEX IF NOT EXISTS idx_camp_status_audit_changed_by ON camp_status_audit(changed_by);

COMMENT ON TABLE camp_status_audit IS
  'Audit trail for camp status changes, especially publish/unpublish actions';

-- Trigger function to log status changes
CREATE OR REPLACE FUNCTION log_camp_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log status changes to/from published/unpublished
  IF OLD.status != NEW.status
     AND (OLD.status IN ('published', 'unpublished')
          OR NEW.status IN ('published', 'unpublished')) THEN
    INSERT INTO camp_status_audit (
      camp_id,
      old_status,
      new_status,
      changed_by,
      change_reason,
      bookings_count
    )
    SELECT
      NEW.id,
      OLD.status,
      NEW.status,
      COALESCE(auth.uid(), NEW.created_by),
      CASE
        WHEN OLD.status = 'published' AND NEW.status = 'unpublished' THEN 'Manual unpublish'
        WHEN OLD.status = 'unpublished' AND NEW.status = 'published' THEN 'Manual publish'
        ELSE 'Status change'
      END,
      (SELECT COUNT(*)::INTEGER FROM bookings
       WHERE camp_id = NEW.id
       AND status = 'confirmed'
       AND payment_status = 'paid');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS camp_status_audit_trigger ON camps;
CREATE TRIGGER camp_status_audit_trigger
  AFTER UPDATE ON camps
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_camp_status_change();

-- ===========================================================================
-- Migration Complete
-- ===========================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Camp publish/unpublish toggle migration completed successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Added:';
  RAISE NOTICE '  - toggle_camp_publish_status() function';
  RAISE NOTICE '  - camp_creator_toggle_publish_status RLS policy';
  RAISE NOTICE '  - camp_status_audit table and trigger';
  RAISE NOTICE '';
  RAISE NOTICE 'Organizers can now toggle their camps between published and unpublished status.';
END $$;
