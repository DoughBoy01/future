-- Migration: Create Email Queue Table
-- Created: 2026-01-28
-- Purpose: Retry queue for failed email sends with exponential backoff

-- ===========================================================================
-- PART 1: Create calculate_next_retry Function
-- ===========================================================================

CREATE OR REPLACE FUNCTION calculate_next_retry(retry_count INTEGER)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN NOW() + CASE retry_count
    WHEN 0 THEN INTERVAL '1 minute'
    WHEN 1 THEN INTERVAL '5 minutes'
    WHEN 2 THEN INTERVAL '30 minutes'
    ELSE INTERVAL '2 hours'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION calculate_next_retry(INTEGER) IS
  'Calculates next retry time with exponential backoff: 1min → 5min → 30min → 2hr';

-- ===========================================================================
-- PART 2: Create email_queue Table
-- ===========================================================================

CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Link to email log (optional, may be NULL if log creation failed)
  email_log_id UUID REFERENCES email_logs(id) ON DELETE CASCADE,

  -- Email details (denormalized for retry)
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  template_data JSONB NOT NULL,

  -- Queue management
  status TEXT NOT NULL DEFAULT 'queued' CHECK (
    status IN ('queued', 'processing', 'completed', 'failed', 'abandoned')
  ),

  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  next_retry_at TIMESTAMPTZ DEFAULT NOW(),

  -- Error tracking
  last_error TEXT,
  error_history JSONB DEFAULT '[]'::jsonb,

  -- Priority (1=highest, 5=lowest)
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ
);

-- ===========================================================================
-- PART 3: Create Indexes
-- ===========================================================================

CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_next_retry ON email_queue(next_retry_at)
  WHERE status = 'queued';
CREATE INDEX idx_email_queue_priority ON email_queue(priority, created_at);
CREATE INDEX idx_email_queue_email_log ON email_queue(email_log_id);
CREATE INDEX idx_email_queue_recipient ON email_queue(recipient_email);

-- ===========================================================================
-- PART 4: Enable Row Level Security
-- ===========================================================================

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- ===========================================================================
-- PART 5: Create RLS Policies
-- ===========================================================================

-- Policy 1: Admins can view all queue items
CREATE POLICY "admins_view_email_queue"
  ON email_queue FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('super_admin', 'operations')
    )
  );

-- Policy 2: Service role can manage all queue items (for Edge Functions)
CREATE POLICY "service_role_manages_email_queue"
  ON email_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ===========================================================================
-- PART 6: Create Trigger for updated_at
-- ===========================================================================

CREATE OR REPLACE FUNCTION update_email_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER email_queue_updated_at_trigger
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_email_queue_updated_at();

-- ===========================================================================
-- PART 7: Create Helper Functions
-- ===========================================================================

-- Function to add email to retry queue
CREATE OR REPLACE FUNCTION queue_email_for_retry(
  p_email_log_id UUID,
  p_template_name TEXT,
  p_recipient_email TEXT,
  p_template_data JSONB,
  p_error_message TEXT DEFAULT NULL,
  p_priority INTEGER DEFAULT 3
)
RETURNS UUID AS $$
DECLARE
  v_queue_id UUID;
BEGIN
  INSERT INTO email_queue (
    email_log_id,
    template_name,
    recipient_email,
    template_data,
    status,
    retry_count,
    next_retry_at,
    last_error,
    error_history,
    priority
  )
  VALUES (
    p_email_log_id,
    p_template_name,
    p_recipient_email,
    p_template_data,
    'queued',
    0,
    calculate_next_retry(0),
    p_error_message,
    CASE WHEN p_error_message IS NOT NULL
      THEN jsonb_build_array(
        jsonb_build_object(
          'error', p_error_message,
          'timestamp', NOW()
        )
      )
      ELSE '[]'::jsonb
    END,
    p_priority
  )
  RETURNING id INTO v_queue_id;

  RETURN v_queue_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION queue_email_for_retry IS
  'Adds failed email to retry queue with initial retry time';

-- Function to increment retry count
CREATE OR REPLACE FUNCTION increment_email_retry(
  p_queue_id UUID,
  p_error_message TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_retry_count INTEGER;
  v_max_retries INTEGER;
  v_error_history JSONB;
BEGIN
  -- Get current retry count and error history
  SELECT retry_count, max_retries, error_history
  INTO v_retry_count, v_max_retries, v_error_history
  FROM email_queue
  WHERE id = p_queue_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  v_retry_count := v_retry_count + 1;

  -- Append error to history
  v_error_history := v_error_history || jsonb_build_array(
    jsonb_build_object(
      'error', p_error_message,
      'timestamp', NOW(),
      'retry_attempt', v_retry_count
    )
  );

  IF v_retry_count >= v_max_retries THEN
    -- Mark as abandoned
    UPDATE email_queue
    SET
      status = 'abandoned',
      retry_count = v_retry_count,
      last_error = p_error_message,
      error_history = v_error_history,
      abandoned_at = NOW()
    WHERE id = p_queue_id;
  ELSE
    -- Schedule next retry
    UPDATE email_queue
    SET
      status = 'queued',
      retry_count = v_retry_count,
      next_retry_at = calculate_next_retry(v_retry_count),
      last_error = p_error_message,
      error_history = v_error_history
    WHERE id = p_queue_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_email_retry IS
  'Increments retry count and schedules next retry or marks as abandoned';

-- ===========================================================================
-- PART 8: Create View for Queue Statistics
-- ===========================================================================

CREATE OR REPLACE VIEW email_queue_stats AS
SELECT
  status,
  COUNT(*) as count,
  AVG(retry_count) as avg_retries,
  MIN(created_at) as oldest_email,
  MAX(created_at) as newest_email
FROM email_queue
GROUP BY status;

COMMENT ON VIEW email_queue_stats IS
  'Statistics on email queue status for monitoring and alerting';

-- ===========================================================================
-- PART 9: Add Table Comments
-- ===========================================================================

COMMENT ON TABLE email_queue IS
  'Retry queue for failed email sends with exponential backoff and priority';

COMMENT ON COLUMN email_queue.template_data IS
  'Complete template data needed to resend the email';

COMMENT ON COLUMN email_queue.status IS
  'Queue item status: queued → processing → completed|abandoned';

COMMENT ON COLUMN email_queue.priority IS
  'Priority level (1=highest, 5=lowest). Lower numbers processed first.';

COMMENT ON COLUMN email_queue.error_history IS
  'JSON array of all retry attempts with errors and timestamps';

-- ===========================================================================
-- Migration Complete
-- ===========================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Email queue table created successfully';
  RAISE NOTICE '';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '  - email_queue table with retry logic';
  RAISE NOTICE '  - 5 indexes for query performance';
  RAISE NOTICE '  - 2 RLS policies (admin, service role)';
  RAISE NOTICE '  - calculate_next_retry() function';
  RAISE NOTICE '  - queue_email_for_retry() helper';
  RAISE NOTICE '  - increment_email_retry() helper';
  RAISE NOTICE '  - email_queue_stats view';
  RAISE NOTICE '';
  RAISE NOTICE 'Retry schedule: 1min → 5min → 30min → 2hr (max 3 retries)';
END $$;
