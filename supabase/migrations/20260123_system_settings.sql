/*
  # System Settings Table

  Creates a flexible key-value store for system-wide configuration settings
  with audit trail support.

  ## Tables Created
  1. system_settings - Key-value store for system configuration
  2. system_settings_audit - Audit log for all changes to system settings

  ## Features
  - Stores settings as JSONB for flexibility
  - Full audit trail of all changes
  - RLS policies restrict access to super admins only
  - Seeds default commission rate (0.15 = 15%)
*/

-- ============================================================================
-- STEP 1: CREATE SYSTEM SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE system_settings
  IS 'System-wide configuration settings in key-value format';

COMMENT ON COLUMN system_settings.key
  IS 'Unique identifier for the setting (e.g., default_commission_rate)';

COMMENT ON COLUMN system_settings.value
  IS 'Setting value stored as JSONB for flexibility (strings, numbers, objects)';

COMMENT ON COLUMN system_settings.updated_by
  IS 'Profile ID of admin who last updated this setting';

-- ============================================================================
-- STEP 2: CREATE AUDIT TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  changed_by UUID REFERENCES profiles(id),
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE system_settings_audit
  IS 'Audit log tracking all changes to system settings with reasons';

COMMENT ON COLUMN system_settings_audit.notes
  IS 'Required explanation of why the setting was changed';

CREATE INDEX idx_system_settings_audit_key ON system_settings_audit(key);
CREATE INDEX idx_system_settings_audit_created_at ON system_settings_audit(created_at DESC);

-- ============================================================================
-- STEP 3: SEED DEFAULT COMMISSION RATE
-- ============================================================================

INSERT INTO system_settings (key, value, description)
VALUES (
  'default_commission_rate',
  '0.15'::jsonb,
  'Default commission rate for new organizations (0.15 = 15%). This is the platform fee charged on bookings.'
)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- STEP 4: RLS POLICIES
-- ============================================================================

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings_audit ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all system settings
CREATE POLICY "Super admins can manage system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

COMMENT ON POLICY "Super admins can manage system settings" ON system_settings
  IS 'Only super admins can view and modify system settings';

-- Super admins can view audit log
CREATE POLICY "Super admins can view system settings audit"
  ON system_settings_audit
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'super_admin'
    )
  );

COMMENT ON POLICY "Super admins can view system settings audit" ON system_settings_audit
  IS 'Only super admins can view the audit log of system settings changes';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- To verify this migration worked, run:
--
-- 1. Check that system_settings table exists with default commission rate:
-- SELECT * FROM system_settings WHERE key = 'default_commission_rate';
-- (Should return one row with value = 0.15)
--
-- 2. Verify RLS policies are in place:
-- SELECT tablename, policyname FROM pg_policies
-- WHERE tablename IN ('system_settings', 'system_settings_audit');
-- (Should return 2 policies total)
