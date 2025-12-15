-- Migration: Create audit_logs table and triggers
-- Purpose: Track all data modifications with full history for compliance, debugging, and accountability
-- Automatically logs INSERT, UPDATE, DELETE operations on critical tables

-- =====================================================
-- CREATE audit_logs TABLE
-- =====================================================

CREATE TABLE audit_logs (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What was changed
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),

  -- Who made the change
  changed_by UUID REFERENCES profiles(id),
  changed_by_role TEXT,
  changed_by_email TEXT,

  -- Organisation context (for camp organizer changes)
  organisation_id UUID REFERENCES organisations(id),

  -- Change details
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[], -- Array of field names that changed (for UPDATE only)

  -- Metadata
  ip_address INET,
  user_agent TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Constraints
  CONSTRAINT audit_logs_record_check CHECK (record_id IS NOT NULL)
);

-- Add table comment
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail tracking all data modifications. Used for compliance, debugging, and accountability.';

-- Column comments
COMMENT ON COLUMN audit_logs.table_name IS 'Name of the table that was modified';
COMMENT ON COLUMN audit_logs.record_id IS 'UUID of the record that was modified';
COMMENT ON COLUMN audit_logs.action IS 'Type of operation: INSERT, UPDATE, or DELETE';
COMMENT ON COLUMN audit_logs.changed_by IS 'Profile ID of the user who made the change';
COMMENT ON COLUMN audit_logs.changed_by_role IS 'Role of the user at the time of change';
COMMENT ON COLUMN audit_logs.organisation_id IS 'Organisation ID if changed by a camp organizer';
COMMENT ON COLUMN audit_logs.old_values IS 'JSONB of field values before the change (UPDATE and DELETE only)';
COMMENT ON COLUMN audit_logs.new_values IS 'JSONB of field values after the change (INSERT and UPDATE only)';
COMMENT ON COLUMN audit_logs.changed_fields IS 'Array of field names that were modified (UPDATE only)';

-- =====================================================
-- CREATE INDEXES
-- =====================================================

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_changed_by ON audit_logs(changed_by);
CREATE INDEX idx_audit_logs_organisation_id ON audit_logs(organisation_id) WHERE organisation_id IS NOT NULL;
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_table_action ON audit_logs(table_name, action);
CREATE INDEX idx_audit_logs_action_created ON audit_logs(action, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Super admins can see all audit logs
CREATE POLICY "Super admins can view all audit logs"
  ON audit_logs FOR SELECT
  USING (is_super_admin());

-- Camp organizers can see their own organisation's audit logs
CREATE POLICY "Camp organizers can view their org audit logs"
  ON audit_logs FOR SELECT
  USING (
    organisation_id IN (
      SELECT organisation_id FROM organisation_members
      WHERE profile_id = auth.uid() AND status = 'active'
    )
  );

-- Operations and risk teams can view all audit logs
CREATE POLICY "Operations and risk can view all audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('operations', 'risk', 'school_admin')
    )
  );

-- =====================================================
-- AUDIT LOGGING FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
  v_old_values JSONB;
  v_new_values JSONB;
  v_changed_fields TEXT[];
  v_user_role TEXT;
  v_user_email TEXT;
  v_org_id UUID;
  v_record_id UUID;
BEGIN
  -- Get user role and email
  SELECT role, email INTO v_user_role, v_user_email
  FROM profiles
  WHERE id = auth.uid();

  -- Get organisation_id if user is camp_organizer
  IF v_user_role = 'camp_organizer' THEN
    SELECT organisation_id INTO v_org_id
    FROM organisation_members
    WHERE profile_id = auth.uid() AND status = 'active'
    LIMIT 1;
  END IF;

  -- Determine record ID
  IF TG_OP = 'DELETE' THEN
    v_record_id := OLD.id;
  ELSE
    v_record_id := NEW.id;
  END IF;

  -- Handle different operation types
  IF TG_OP = 'DELETE' THEN
    -- For DELETE, capture old values
    v_old_values := to_jsonb(OLD);
    v_new_values := NULL;
    v_changed_fields := ARRAY(SELECT jsonb_object_keys(v_old_values));

  ELSIF TG_OP = 'INSERT' THEN
    -- For INSERT, capture new values
    v_old_values := NULL;
    v_new_values := to_jsonb(NEW);
    v_changed_fields := ARRAY(SELECT jsonb_object_keys(v_new_values));

  ELSE -- UPDATE
    -- For UPDATE, capture both old and new values
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);

    -- Find fields that actually changed
    SELECT ARRAY_AGG(key)
    INTO v_changed_fields
    FROM jsonb_each(v_new_values) new_val
    WHERE v_old_values->>new_val.key IS DISTINCT FROM v_new_values->>new_val.key;

    -- Skip logging if nothing actually changed
    IF v_changed_fields IS NULL OR array_length(v_changed_fields, 1) = 0 THEN
      RETURN NEW;
    END IF;

    -- Filter out system fields that we don't want to log
    v_changed_fields := array_remove(v_changed_fields, 'updated_at');
    v_changed_fields := array_remove(v_changed_fields, 'last_seen_at');

    -- If only system fields changed, skip logging
    IF array_length(v_changed_fields, 1) = 0 THEN
      RETURN NEW;
    END IF;
  END IF;

  -- Insert audit log record
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    changed_by,
    changed_by_role,
    changed_by_email,
    organisation_id,
    old_values,
    new_values,
    changed_fields,
    ip_address,
    user_agent
  ) VALUES (
    TG_TABLE_NAME,
    v_record_id,
    TG_OP,
    auth.uid(),
    v_user_role,
    v_user_email,
    v_org_id,
    v_old_values,
    new_values,
    v_changed_fields,
    inet_client_addr(), -- Get client IP address
    current_setting('request.headers', true)::json->>'user-agent' -- Get user agent from request headers
  );

  -- Return appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the original operation
    RAISE WARNING 'Audit logging failed: %', SQLERRM;
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    ELSE
      RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_audit_trail IS 'Automatically logs INSERT, UPDATE, DELETE operations with full change tracking. Set SECURITY DEFINER to bypass RLS when writing audit logs.';

-- =====================================================
-- APPLY AUDIT TRIGGERS TO KEY TABLES
-- =====================================================

-- Bookings table (formerly registrations)
CREATE TRIGGER audit_bookings_changes
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Registrations table (new child enrollment details)
CREATE TRIGGER audit_registrations_changes
  AFTER INSERT OR UPDATE OR DELETE ON registrations
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Children table
CREATE TRIGGER audit_children_changes
  AFTER INSERT OR UPDATE OR DELETE ON children
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Parents table
CREATE TRIGGER audit_parents_changes
  AFTER INSERT OR UPDATE OR DELETE ON parents
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Enquiries table
CREATE TRIGGER audit_enquiries_changes
  AFTER INSERT OR UPDATE OR DELETE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Camps table
CREATE TRIGGER audit_camps_changes
  AFTER INSERT OR UPDATE OR DELETE ON camps
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Organisations table
CREATE TRIGGER audit_organisations_changes
  AFTER INSERT OR UPDATE OR DELETE ON organisations
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Commission records table
CREATE TRIGGER audit_commission_records_changes
  AFTER INSERT OR UPDATE OR DELETE ON commission_records
  FOR EACH ROW EXECUTE FUNCTION log_audit_trail();

-- Payment records table (if exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_records') THEN
    CREATE TRIGGER audit_payment_records_changes
      AFTER INSERT OR UPDATE OR DELETE ON payment_records
      FOR EACH ROW EXECUTE FUNCTION log_audit_trail();
  END IF;
END $$;

-- =====================================================
-- HELPER FUNCTIONS FOR QUERYING AUDIT LOGS
-- =====================================================

-- Function to get audit history for a specific record
CREATE OR REPLACE FUNCTION get_audit_history(
  p_table_name TEXT,
  p_record_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  action TEXT,
  changed_by UUID,
  changed_by_role TEXT,
  changed_by_email TEXT,
  changed_fields TEXT[],
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.changed_by,
    al.changed_by_role,
    al.changed_by_email,
    al.changed_fields,
    al.old_values,
    al.new_values,
    al.created_at
  FROM audit_logs al
  WHERE al.table_name = p_table_name
    AND al.record_id = p_record_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_audit_history IS 'Returns audit history for a specific record, ordered by most recent first';

-- Function to get recent audit logs for an organisation
CREATE OR REPLACE FUNCTION get_organisation_audit_logs(
  p_organisation_id UUID,
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  table_name TEXT,
  record_id UUID,
  action TEXT,
  changed_by UUID,
  changed_by_role TEXT,
  changed_fields TEXT[],
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.id,
    al.table_name,
    al.record_id,
    al.action,
    al.changed_by,
    al.changed_by_role,
    al.changed_fields,
    al.created_at
  FROM audit_logs al
  WHERE al.organisation_id = p_organisation_id
  ORDER BY al.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_organisation_audit_logs IS 'Returns recent audit logs for a specific organisation';

-- =====================================================
-- AUDIT LOG RETENTION POLICY (Optional)
-- =====================================================

-- Function to archive old audit logs (can be run periodically)
CREATE OR REPLACE FUNCTION archive_old_audit_logs(p_days_to_keep INTEGER DEFAULT 730)
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete audit logs older than specified days
  -- Default: 730 days (2 years)
  DELETE FROM audit_logs
  WHERE created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION archive_old_audit_logs IS 'Archives (deletes) audit logs older than specified days. Default: 730 days (2 years). Returns count of deleted records.';

-- =====================================================
-- VERIFICATION QUERIES (commented out - for manual testing)
-- =====================================================

-- Verify table creation
-- SELECT COUNT(*) FROM audit_logs;

-- Verify indexes
-- SELECT indexname FROM pg_indexes WHERE tablename = 'audit_logs';

-- Verify RLS policies
-- SELECT policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename = 'audit_logs';

-- Test audit logging by making a change
-- UPDATE bookings SET status = 'confirmed' WHERE id = '[some-booking-id]';

-- View recent audit logs
-- SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;

-- Get audit history for a specific record
-- SELECT * FROM get_audit_history('bookings', '[booking-uuid]');

-- Get organisation audit logs
-- SELECT * FROM get_organisation_audit_logs('[organisation-uuid]');
