/*
  # Security Fixes - October 30, 2025

  ## Summary
  Fixes critical security issues identified in security audit:
  1. Remove SECURITY DEFINER from views
  2. Add SET search_path to all functions
  3. Add RLS policies for attendance table

  ## Issues Fixed
  - SECURITY DEFINER views (2 critical)
  - Mutable search_path functions (11 warnings)
  - Missing RLS policies on attendance table (1 info)

  See SECURITY_AUDIT_REPORT.md for full details
*/

-- ==================================================
-- FIX 1: Remove SECURITY DEFINER from camp_availability view
-- ==================================================

DROP VIEW IF EXISTS public.camp_availability CASCADE;

CREATE VIEW public.camp_availability
WITH (security_invoker=true)  -- Explicitly use invoker's permissions
AS
SELECT
  c.id,
  c.name,
  c.capacity,
  c.enrolled_count,
  c.capacity - c.enrolled_count AS available_places,
  COUNT(CASE WHEN r.status = 'confirmed' THEN 1 END) AS confirmed_count,
  COUNT(CASE WHEN r.status = 'waitlisted' THEN 1 END) AS waitlist_count,
  COUNT(CASE WHEN r.status = 'pending' THEN 1 END) AS pending_count,
  CASE
    WHEN c.capacity - c.enrolled_count <= 0 THEN 'full'
    WHEN c.capacity - c.enrolled_count <= 5 THEN 'limited'
    ELSE 'available'
  END AS availability_status
FROM camps c
LEFT JOIN registrations r ON r.camp_id = c.id
GROUP BY c.id, c.name, c.capacity, c.enrolled_count;

COMMENT ON VIEW public.camp_availability IS
'Real-time camp availability view - uses SECURITY INVOKER to respect RLS policies';

-- ==================================================
-- FIX 2: Add SET search_path to all functions
-- ==================================================

-- Function: update_camp_enrolled_count
CREATE OR REPLACE FUNCTION update_camp_enrolled_count()
RETURNS TRIGGER
SET search_path = public, pg_catalog  -- FIX: Lock search path
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('confirmed', 'completed') THEN
    UPDATE camps
    SET enrolled_count = enrolled_count + 1
    WHERE id = NEW.camp_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status NOT IN ('confirmed', 'completed') AND NEW.status IN ('confirmed', 'completed') THEN
      UPDATE camps
      SET enrolled_count = enrolled_count + 1
      WHERE id = NEW.camp_id;
    ELSIF OLD.status IN ('confirmed', 'completed') AND NEW.status NOT IN ('confirmed', 'completed') THEN
      UPDATE camps
      SET enrolled_count = enrolled_count - 1
      WHERE id = NEW.camp_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status IN ('confirmed', 'completed') THEN
    UPDATE camps
    SET enrolled_count = enrolled_count - 1
    WHERE id = OLD.camp_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function: update_enquiries_updated_at
CREATE OR REPLACE FUNCTION update_enquiries_updated_at()
RETURNS TRIGGER
SET search_path = public, pg_catalog  -- FIX: Lock search path
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: update_updated_at_column (generic updater)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SET search_path = public, pg_catalog  -- FIX: Lock search path
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- FIX 3: Add RLS Policies for attendance table
-- ==================================================

-- Super admins have full access
CREATE POLICY "Super admins full access to attendance"
ON attendance FOR ALL
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

-- School admins can manage attendance for their schools
CREATE POLICY "School admins can manage their school attendance"
ON attendance FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN camps c ON c.school_id = p.school_id
    WHERE p.id = auth.uid()
    AND c.id = attendance.camp_id
    AND p.role IN ('school_admin', 'operations')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN camps c ON c.school_id = p.school_id
    WHERE p.id = auth.uid()
    AND c.id = attendance.camp_id
    AND p.role IN ('school_admin', 'operations')
  )
);

-- Parents can view attendance for their children
CREATE POLICY "Parents can view their children attendance"
ON attendance FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM children ch
    JOIN parents par ON par.id = ch.parent_id
    WHERE ch.id = attendance.child_id
    AND par.profile_id = auth.uid()
  )
);

-- Staff can check in/out children at their camps
CREATE POLICY "Staff can manage attendance at their camps"
ON attendance FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN camps c ON c.school_id = p.school_id
    WHERE p.id = auth.uid()
    AND c.id = attendance.camp_id
    AND p.role IN ('school_admin', 'operations', 'staff')
  )
);

-- Staff can update attendance records
CREATE POLICY "Staff can update attendance at their camps"
ON attendance FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN camps c ON c.school_id = p.school_id
    WHERE p.id = auth.uid()
    AND c.id = attendance.camp_id
    AND p.role IN ('school_admin', 'operations', 'staff')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    JOIN camps c ON c.school_id = p.school_id
    WHERE p.id = auth.uid()
    AND c.id = attendance.camp_id
    AND p.role IN ('school_admin', 'operations', 'staff')
  )
);

-- ==================================================
-- FIX 4: Add comments for security documentation
-- ==================================================

COMMENT ON POLICY "Super admins full access to attendance" ON attendance IS
'Super admins can view, create, update, and delete all attendance records';

COMMENT ON POLICY "School admins can manage their school attendance" ON attendance IS
'School admins and operations staff can manage attendance for camps at their school';

COMMENT ON POLICY "Parents can view their children attendance" ON attendance IS
'Parents can view attendance records for their own children';

COMMENT ON POLICY "Staff can manage attendance at their camps" ON attendance IS
'Staff can check in/out children at camps belonging to their school';

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- Run these to verify fixes were applied:

-- 1. Check view security_invoker setting
-- SELECT relname, reloptions
-- FROM pg_class
-- WHERE relname = 'camp_availability';
-- Expected: security_invoker=true

-- 2. Check function search_path
-- SELECT proname, prosrc
-- FROM pg_proc
-- WHERE proname LIKE '%update_%'
-- AND pronamespace = 'public'::regnamespace;
-- Expected: All functions have SET search_path

-- 3. Check attendance policies
-- SELECT tablename, policyname
-- FROM pg_policies
-- WHERE tablename = 'attendance';
-- Expected: 5 policies listed

-- ==================================================
-- NOTES
-- ==================================================

/*
  IMPORTANT: Commission-related functions not fixed in this migration
  because they were not found in the migrations folder. They may have
  been created manually or through the Supabase dashboard.

  If commission functions exist, apply this pattern:

  CREATE OR REPLACE FUNCTION function_name()
  RETURNS return_type
  SET search_path = public, pg_catalog  -- ADD THIS LINE
  AS $$
  BEGIN
    -- function body
  END;
  $$ LANGUAGE plpgsql;

  Functions that need fixing (if they exist):
  - get_camp_commission_rate
  - calculate_commission
  - trigger_calculate_commission
  - set_camp_commission_rate
  - mark_commission_paid
  - get_camp_category_names
  - get_camps_by_category
  - get_category_stats
*/
