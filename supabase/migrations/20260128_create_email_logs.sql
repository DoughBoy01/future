-- Migration: Create Email Logs Table
-- Created: 2026-01-28
-- Purpose: Track all outbound emails with delivery status and engagement metrics

-- ===========================================================================
-- PART 1: Create email_logs Table
-- ===========================================================================

CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Email identification
  resend_email_id TEXT UNIQUE,
  template_name TEXT NOT NULL,

  -- Recipient information
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  recipient_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Email content
  subject TEXT NOT NULL,
  preview_text TEXT,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'queued', 'sent', 'delivered',
               'opened', 'clicked', 'failed', 'bounced', 'complained')
  ),

  -- Error tracking
  error_code TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Engagement tracking
  opened_at TIMESTAMPTZ,
  first_clicked_at TIMESTAMPTZ,
  click_count INTEGER DEFAULT 0,

  -- Context and metadata
  context_type TEXT,
  context_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================================================
-- PART 2: Create Indexes
-- ===========================================================================

CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_context ON email_logs(context_type, context_id);
CREATE INDEX idx_email_logs_resend_id ON email_logs(resend_email_id);
CREATE INDEX idx_email_logs_created ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_profile ON email_logs(recipient_profile_id);
CREATE INDEX idx_email_logs_template ON email_logs(template_name);

-- ===========================================================================
-- PART 3: Enable Row Level Security
-- ===========================================================================

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- PART 4: Create RLS Policies
-- ===========================================================================

-- Policy 1: Admins and operations can view all email logs
CREATE POLICY "admins_view_all_email_logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'operations')
    )
  );

-- Policy 2: Users can view their own email logs
CREATE POLICY "users_view_own_email_logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (recipient_profile_id = auth.uid());

-- Policy 3: Service role can manage all email logs (for Edge Functions)
CREATE POLICY "service_role_manages_email_logs"
  ON email_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ===========================================================================
-- PART 5: Create Trigger for updated_at
-- ===========================================================================

CREATE OR REPLACE FUNCTION update_email_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_logs_updated_at_trigger
  BEFORE UPDATE ON email_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_email_logs_updated_at();

-- ===========================================================================
-- PART 6: Add Table Comments
-- ===========================================================================

COMMENT ON TABLE email_logs IS
  'Tracks all transactional emails sent via Resend with delivery status and engagement metrics';

COMMENT ON COLUMN email_logs.resend_email_id IS
  'Unique ID returned by Resend API for tracking';

COMMENT ON COLUMN email_logs.template_name IS
  'Email template identifier (e.g., signup-welcome-parent, booking-confirmation)';

COMMENT ON COLUMN email_logs.status IS
  'Current delivery status: pending → sent → delivered → opened/clicked';

COMMENT ON COLUMN email_logs.context_type IS
  'Type of action that triggered email (e.g., signup, booking, password_reset)';

COMMENT ON COLUMN email_logs.context_id IS
  'ID of related entity (e.g., booking_id, user_id)';

-- ===========================================================================
-- Migration Complete
-- ===========================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Email logs table created successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - email_logs table';
  RAISE NOTICE '  - 7 indexes for query performance';
  RAISE NOTICE '  - 3 RLS policies (admin, user, service role)';
  RAISE NOTICE '  - updated_at trigger';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready to track transactional email delivery and engagement.';
END $$;
