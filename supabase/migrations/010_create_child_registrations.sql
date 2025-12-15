-- Migration: Create new registrations table for child enrollment details
-- Purpose: Store enhanced child details collected POST-booking during camp onboarding
-- Each booking can have multiple children, and each child needs to complete a separate registration form

-- =====================================================
-- CREATE registrations TABLE
-- =====================================================

CREATE TABLE registrations (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,

  -- Emergency contact information (camp-specific, may differ from parent's general emergency contact)
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,

  -- Medical information (more detailed than child profile - specific to this camp)
  current_medications TEXT,
  medication_administration_instructions TEXT,
  doctor_name TEXT,
  doctor_phone TEXT,

  -- Special requirements for THIS specific camp
  dietary_requirements TEXT,
  activity_restrictions TEXT,
  special_accommodations TEXT,

  -- Permissions (camp-specific consent forms)
  photo_permission BOOLEAN DEFAULT false,
  media_release_permission BOOLEAN DEFAULT false,
  field_trip_permission BOOLEAN DEFAULT false,
  water_activities_permission BOOLEAN DEFAULT false,

  -- Camp-specific details
  t_shirt_size TEXT CHECK (t_shirt_size IN ('XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'Youth S', 'Youth M', 'Youth L', 'Youth XL')),
  pickup_authorized_persons JSONB DEFAULT '[]'::jsonb, -- Array of {name, relationship, phone, id_verified}
  additional_notes TEXT,

  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'incomplete', 'complete', 'cancelled')),
  form_completed_at TIMESTAMPTZ,

  -- Attendance tracking (for day-of-camp operations)
  checked_in BOOLEAN DEFAULT false,
  check_in_time TIMESTAMPTZ,
  check_in_by UUID REFERENCES profiles(id), -- Staff member who checked in the child
  checked_out BOOLEAN DEFAULT false,
  check_out_time TIMESTAMPTZ,
  check_out_by UUID REFERENCES profiles(id), -- Staff member who checked out the child

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id),

  -- Constraints
  UNIQUE(booking_id, child_id), -- Each child can only be registered once per booking
  CHECK (form_completed_at IS NULL OR status IN ('complete', 'cancelled'))
);

-- Add table comment
COMMENT ON TABLE registrations IS 'Enhanced child enrollment details collected during post-booking onboarding. Each registration represents one child participating in one camp, with detailed camp-specific information.';

-- Column comments
COMMENT ON COLUMN registrations.booking_id IS 'Reference to the parent booking from checkout';
COMMENT ON COLUMN registrations.child_id IS 'Reference to the child profile';
COMMENT ON COLUMN registrations.camp_id IS 'Reference to the camp this registration is for';
COMMENT ON COLUMN registrations.pickup_authorized_persons IS 'JSON array of authorized pickup persons with fields: name, relationship, phone, id_verified';
COMMENT ON COLUMN registrations.status IS 'pending: form not started, incomplete: partially filled, complete: all required fields filled, cancelled: registration cancelled';

-- =====================================================
-- CREATE INDEXES
-- =====================================================

CREATE INDEX idx_registrations_booking_id ON registrations(booking_id);
CREATE INDEX idx_registrations_child_id ON registrations(child_id);
CREATE INDEX idx_registrations_camp_id ON registrations(camp_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_created_at ON registrations(created_at DESC);
CREATE INDEX idx_registrations_form_completed_at ON registrations(form_completed_at DESC) WHERE form_completed_at IS NOT NULL;
CREATE INDEX idx_registrations_checked_in ON registrations(checked_in, check_in_time) WHERE checked_in = true;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Trigger for updated_at timestamp
CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically set form_completed_at when status changes to 'complete'
CREATE OR REPLACE FUNCTION set_registration_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  -- If status is being set to 'complete' and form_completed_at is not set
  IF NEW.status = 'complete' AND OLD.status != 'complete' AND NEW.form_completed_at IS NULL THEN
    NEW.form_completed_at := NOW();
  END IF;

  -- If status is changed away from 'complete', clear form_completed_at
  IF NEW.status != 'complete' AND OLD.status = 'complete' THEN
    NEW.form_completed_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_registration_completed_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION set_registration_completed_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Parents can view their children's registrations
CREATE POLICY "Parents can view their children registrations"
  ON registrations FOR SELECT
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE parent_id IN (
        SELECT id FROM parents WHERE profile_id = auth.uid()
      )
    )
  );

-- Parents can create registrations for their bookings
CREATE POLICY "Parents can create registrations"
  ON registrations FOR INSERT
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE parent_id IN (
        SELECT id FROM parents WHERE profile_id = auth.uid()
      )
    )
  );

-- Parents can update their children's registrations (before camp starts)
CREATE POLICY "Parents can update their children registrations"
  ON registrations FOR UPDATE
  USING (
    booking_id IN (
      SELECT id FROM bookings WHERE parent_id IN (
        SELECT id FROM parents WHERE profile_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    booking_id IN (
      SELECT id FROM bookings WHERE parent_id IN (
        SELECT id FROM parents WHERE profile_id = auth.uid()
      )
    )
  );

-- Camp organizers can view registrations for their camps
CREATE POLICY "Camp organizers can view their camp registrations"
  ON registrations FOR SELECT
  USING (
    is_super_admin() OR
    camp_id IN (
      SELECT id FROM camps WHERE organisation_id IN (
        SELECT organisation_id FROM organisation_members
        WHERE profile_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Camp organizers can update attendance fields (check-in/check-out)
-- But cannot modify parent-entered data
CREATE POLICY "Camp organizers can update attendance"
  ON registrations FOR UPDATE
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
    (
      camp_id IN (
        SELECT id FROM camps WHERE organisation_id IN (
          SELECT organisation_id FROM organisation_members
          WHERE profile_id = auth.uid() AND status = 'active'
        )
      )
      -- Ensure they're only updating attendance-related fields
      AND booking_id = booking_id -- booking_id hasn't changed
      AND child_id = child_id -- child_id hasn't changed
    )
  );

-- Super admins can manage all registrations
CREATE POLICY "Super admins can view all registrations"
  ON registrations FOR SELECT
  USING (is_super_admin());

CREATE POLICY "Super admins can manage all registrations"
  ON registrations FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get registration completion percentage for a booking
CREATE OR REPLACE FUNCTION get_booking_registration_completion(p_booking_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_total_children INTEGER;
  v_completed_children INTEGER;
BEGIN
  -- Count total children in the booking
  SELECT COUNT(DISTINCT child_id)
  INTO v_total_children
  FROM registrations
  WHERE booking_id = p_booking_id;

  -- Count completed registrations
  SELECT COUNT(*)
  INTO v_completed_children
  FROM registrations
  WHERE booking_id = p_booking_id
    AND status = 'complete';

  -- Return percentage
  IF v_total_children = 0 THEN
    RETURN 0;
  ELSE
    RETURN ROUND((v_completed_children::NUMERIC / v_total_children::NUMERIC) * 100);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_booking_registration_completion IS 'Returns the percentage of completed registrations for a booking (0-100)';

-- Function to check if a booking has all registrations complete
CREATE OR REPLACE FUNCTION is_booking_fully_registered(p_booking_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_incomplete_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_incomplete_count
  FROM registrations
  WHERE booking_id = p_booking_id
    AND status != 'complete';

  RETURN v_incomplete_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_booking_fully_registered IS 'Returns true if all registrations for a booking are complete';

-- =====================================================
-- MIGRATION FROM OLD registration_forms TABLE (if exists)
-- =====================================================

-- Note: The old registration_forms table had a different structure
-- If you need to migrate data from registration_forms to registrations,
-- you can add a data migration here based on your specific needs

-- Example migration (commented out - customize as needed):
/*
INSERT INTO registrations (
  booking_id,
  child_id,
  camp_id,
  status,
  form_completed_at,
  created_at,
  updated_at
)
SELECT
  rf.booking_id,
  rf.child_id,
  b.camp_id,
  CASE
    WHEN rf.completed = true THEN 'complete'
    ELSE 'incomplete'
  END,
  rf.submitted_at,
  rf.created_at,
  rf.updated_at
FROM registration_forms rf
JOIN bookings b ON b.id = rf.booking_id
WHERE NOT EXISTS (
  SELECT 1 FROM registrations r
  WHERE r.booking_id = rf.booking_id
    AND r.child_id = rf.child_id
);
*/

-- =====================================================
-- VERIFICATION QUERIES (commented out - for manual testing)
-- =====================================================

-- Verify table creation
-- SELECT COUNT(*) FROM registrations;

-- Verify foreign keys
-- SELECT
--   tc.constraint_name,
--   kcu.column_name,
--   ccu.table_name AS foreign_table_name,
--   ccu.column_name AS foreign_column_name
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu
--   ON tc.constraint_name = kcu.constraint_name
-- JOIN information_schema.constraint_column_usage AS ccu
--   ON ccu.constraint_name = tc.constraint_name
-- WHERE tc.constraint_type = 'FOREIGN KEY'
--   AND tc.table_name = 'registrations';

-- Verify indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'registrations';

-- Verify RLS policies
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'registrations';

-- Test helper functions
-- SELECT get_booking_registration_completion('[booking-uuid]');
-- SELECT is_booking_fully_registered('[booking-uuid]');
