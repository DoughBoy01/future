/*
  # Content Versioning System

  ## Overview
  Creates a comprehensive content versioning system for CMS operations with change tracking,
  draft management, approval workflows, and rollback capabilities. Primarily focused on camp
  content but extensible to other content types.

  ## New Tables

  ### 1. `content_versions`
  Complete version history for all content changes
  - `id` (uuid, primary key)
  - `resource_type` (text) - Type of content (camp, communication, etc.)
  - `resource_id` (uuid) - ID of the resource
  - `version_number` (integer) - Incremental version number
  - `content_snapshot` (jsonb) - Complete content snapshot at this version
  - `change_summary` (text) - Human-readable summary of changes
  - `changed_fields` (jsonb) - Array of field names that changed
  - `created_by` (uuid, references profiles) - Author of this version
  - `created_at` (timestamptz)
  - `is_published` (boolean) - Whether this version is/was published
  - `published_at` (timestamptz, nullable) - When this version was published

  ### 2. `content_drafts`
  Work-in-progress content not yet submitted for approval
  - `id` (uuid, primary key)
  - `resource_type` (text) - Type of content
  - `resource_id` (uuid, nullable) - ID of existing resource (null for new)
  - `draft_content` (jsonb) - Draft content data
  - `based_on_version` (uuid, references content_versions, nullable) - Version this draft is based on
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  - `last_auto_save` (timestamptz) - Last auto-save timestamp
  - `is_locked` (boolean) - Whether draft is locked for editing
  - `locked_by` (uuid, references profiles, nullable)
  - `locked_at` (timestamptz, nullable)

  ### 3. `content_approvals`
  Links content versions to approval workflow requests
  - `id` (uuid, primary key)
  - `version_id` (uuid, references content_versions)
  - `draft_id` (uuid, references content_drafts, nullable)
  - `approval_request_id` (uuid, references approval_requests)
  - `approval_type` (text) - new_content, content_update, content_deletion
  - `created_at` (timestamptz)

  ### 4. `content_diff`
  Detailed field-by-field differences between versions
  - `id` (uuid, primary key)
  - `from_version_id` (uuid, references content_versions)
  - `to_version_id` (uuid, references content_versions)
  - `field_name` (text) - Name of changed field
  - `old_value` (jsonb) - Previous value
  - `new_value` (jsonb) - New value
  - `change_type` (text) - added, modified, removed
  - `created_at` (timestamptz)

  ### 5. `content_rollback_log`
  Audit trail of content rollbacks
  - `id` (uuid, primary key)
  - `resource_type` (text)
  - `resource_id` (uuid)
  - `from_version_id` (uuid, references content_versions)
  - `to_version_id` (uuid, references content_versions)
  - `rolled_back_by` (uuid, references profiles)
  - `reason` (text)
  - `created_at` (timestamptz)

  ### 6. `content_scheduling`
  Schedule content publication and unpublication
  - `id` (uuid, primary key)
  - `resource_type` (text)
  - `resource_id` (uuid)
  - `version_id` (uuid, references content_versions)
  - `action` (text) - publish, unpublish, update
  - `scheduled_for` (timestamptz)
  - `status` (text) - pending, completed, cancelled, failed
  - `scheduled_by` (uuid, references profiles)
  - `executed_at` (timestamptz, nullable)
  - `error_message` (text, nullable)
  - `created_at` (timestamptz)

  ### 7. `content_locks`
  Prevent simultaneous editing conflicts
  - `id` (uuid, primary key)
  - `resource_type` (text)
  - `resource_id` (uuid)
  - `locked_by` (uuid, references profiles)
  - `locked_at` (timestamptz)
  - `expires_at` (timestamptz) - Lock expiration
  - `lock_token` (text, unique) - Unique token to verify lock ownership
  - UNIQUE(resource_type, resource_id)

  ### 8. `content_comments`
  Team collaboration comments on content versions
  - `id` (uuid, primary key)
  - `version_id` (uuid, references content_versions, nullable)
  - `draft_id` (uuid, references content_drafts, nullable)
  - `comment_text` (text)
  - `field_reference` (text, nullable) - Specific field being commented on
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)
  - `resolved` (boolean) - Whether comment has been addressed
  - `resolved_by` (uuid, references profiles, nullable)
  - `resolved_at` (timestamptz, nullable)

  ## Security
  
  All tables have Row Level Security (RLS) enabled:
  
  - Content Versions: Viewable by content team and school admins
  - Content Drafts: Viewable by creator and content team; editable by creator
  - Content Approvals: Viewable by content team and approvers
  - Content Diff: Viewable by content team and school admins
  - Content Rollback Log: Viewable by content team and school admins
  - Content Scheduling: Viewable by content team; manageable by authorized users
  - Content Locks: Viewable by all; manageable by lock owner or admins
  - Content Comments: Viewable by content team; insertable by authenticated users

  ## Indexes
  
  Critical indexes for performance on:
  - Resource lookups by type and ID
  - Version number ordering
  - Draft lookups by creator
  - Lock lookups for conflict detection
  - Scheduled publication lookups by date
*/

-- =============================================
-- CONTENT VERSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  version_number integer NOT NULL,
  content_snapshot jsonb NOT NULL,
  change_summary text,
  changed_fields jsonb DEFAULT '[]',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT false,
  published_at timestamptz,
  UNIQUE(resource_type, resource_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_content_versions_resource ON content_versions(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_by ON content_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_content_versions_created_at ON content_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_versions_is_published ON content_versions(is_published);

ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content team can view versions"
  ON content_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

CREATE POLICY "Content creators can insert versions"
  ON content_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

-- =============================================
-- CONTENT DRAFTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS content_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  resource_id uuid,
  draft_content jsonb NOT NULL,
  based_on_version uuid REFERENCES content_versions(id) ON DELETE SET NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_auto_save timestamptz DEFAULT now(),
  is_locked boolean DEFAULT false,
  locked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  locked_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_content_drafts_resource ON content_drafts(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_content_drafts_created_by ON content_drafts(created_by);
CREATE INDEX IF NOT EXISTS idx_content_drafts_updated_at ON content_drafts(updated_at DESC);

ALTER TABLE content_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own drafts"
  ON content_drafts FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Content team can view all drafts"
  ON content_drafts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

CREATE POLICY "Users can insert own drafts"
  ON content_drafts FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

CREATE POLICY "Users can update own drafts"
  ON content_drafts FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own drafts"
  ON content_drafts FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- =============================================
-- CONTENT APPROVALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS content_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES content_versions(id) ON DELETE CASCADE,
  draft_id uuid REFERENCES content_drafts(id) ON DELETE CASCADE,
  approval_request_id uuid REFERENCES approval_requests(id) ON DELETE CASCADE,
  approval_type text NOT NULL CHECK (approval_type IN ('new_content', 'content_update', 'content_deletion')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_approvals_version_id ON content_approvals(version_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_draft_id ON content_approvals(draft_id);
CREATE INDEX IF NOT EXISTS idx_content_approvals_request_id ON content_approvals(approval_request_id);

ALTER TABLE content_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content team can view approvals"
  ON content_approvals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

CREATE POLICY "Content team can insert approvals"
  ON content_approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

-- =============================================
-- CONTENT DIFF TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS content_diff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_version_id uuid REFERENCES content_versions(id) ON DELETE CASCADE,
  to_version_id uuid REFERENCES content_versions(id) ON DELETE CASCADE,
  field_name text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  change_type text NOT NULL CHECK (change_type IN ('added', 'modified', 'removed')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_diff_from_version ON content_diff(from_version_id);
CREATE INDEX IF NOT EXISTS idx_content_diff_to_version ON content_diff(to_version_id);

ALTER TABLE content_diff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content team can view diffs"
  ON content_diff FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

CREATE POLICY "System can insert diffs"
  ON content_diff FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- CONTENT ROLLBACK LOG TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS content_rollback_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  from_version_id uuid REFERENCES content_versions(id) ON DELETE SET NULL,
  to_version_id uuid REFERENCES content_versions(id) ON DELETE SET NULL,
  rolled_back_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_rollback_log_resource ON content_rollback_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_content_rollback_log_rolled_back_by ON content_rollback_log(rolled_back_by);
CREATE INDEX IF NOT EXISTS idx_content_rollback_log_created_at ON content_rollback_log(created_at DESC);

ALTER TABLE content_rollback_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content team can view rollback logs"
  ON content_rollback_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

CREATE POLICY "Authorized users can insert rollback logs"
  ON content_rollback_log FOR INSERT
  TO authenticated
  WITH CHECK (
    rolled_back_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'super_admin')
    )
  );

-- =============================================
-- CONTENT SCHEDULING TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS content_scheduling (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  version_id uuid REFERENCES content_versions(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('publish', 'unpublish', 'update')),
  scheduled_for timestamptz NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'failed')),
  scheduled_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  executed_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_content_scheduling_resource ON content_scheduling(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_content_scheduling_scheduled_for ON content_scheduling(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_content_scheduling_status ON content_scheduling(status);

ALTER TABLE content_scheduling ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content team can view scheduled content"
  ON content_scheduling FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

CREATE POLICY "Content team can schedule content"
  ON content_scheduling FOR INSERT
  TO authenticated
  WITH CHECK (
    scheduled_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

CREATE POLICY "Content team can update scheduled content"
  ON content_scheduling FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'super_admin')
    )
  );

-- =============================================
-- CONTENT LOCKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS content_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  locked_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  locked_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  lock_token text UNIQUE NOT NULL,
  UNIQUE(resource_type, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_content_locks_resource ON content_locks(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_content_locks_locked_by ON content_locks(locked_by);
CREATE INDEX IF NOT EXISTS idx_content_locks_expires_at ON content_locks(expires_at);

ALTER TABLE content_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view content locks"
  ON content_locks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create locks"
  ON content_locks FOR INSERT
  TO authenticated
  WITH CHECK (locked_by = auth.uid());

CREATE POLICY "Lock owners can update their locks"
  ON content_locks FOR UPDATE
  TO authenticated
  USING (locked_by = auth.uid())
  WITH CHECK (locked_by = auth.uid());

CREATE POLICY "Lock owners can delete their locks"
  ON content_locks FOR DELETE
  TO authenticated
  USING (locked_by = auth.uid());

CREATE POLICY "Admins can delete any lock"
  ON content_locks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'super_admin')
    )
  );

-- =============================================
-- CONTENT COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS content_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid REFERENCES content_versions(id) ON DELETE CASCADE,
  draft_id uuid REFERENCES content_drafts(id) ON DELETE CASCADE,
  comment_text text NOT NULL,
  field_reference text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  resolved boolean DEFAULT false,
  resolved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_content_comments_version_id ON content_comments(version_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_draft_id ON content_comments(draft_id);
CREATE INDEX IF NOT EXISTS idx_content_comments_created_by ON content_comments(created_by);
CREATE INDEX IF NOT EXISTS idx_content_comments_resolved ON content_comments(resolved);

ALTER TABLE content_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Content team can view comments"
  ON content_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

CREATE POLICY "Content team can insert comments"
  ON content_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

CREATE POLICY "Content team can update comments"
  ON content_comments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'marketing', 'content_editor', 'super_admin')
    )
  );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_content_drafts_timestamp') THEN
    CREATE TRIGGER update_content_drafts_timestamp
      BEFORE UPDATE ON content_drafts
      FOR EACH ROW EXECUTE FUNCTION update_content_drafts_updated_at();
  END IF;
END $$;

-- Function to clean up expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM content_locks WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;