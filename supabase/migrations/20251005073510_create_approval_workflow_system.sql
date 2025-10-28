/*
  # Workflow Approval System

  ## Overview
  Creates a comprehensive approval workflow system for managing multi-step approval processes
  across the CRM and CMS platform. Enables configurable workflows for camps, registrations,
  communications, and other resources requiring review and approval.

  ## New Tables

  ### 1. `approval_workflows`
  Defines reusable approval workflow templates
  - `id` (uuid, primary key)
  - `name` (text, unique) - Workflow name (e.g., "Camp Publication Workflow")
  - `description` (text) - Detailed workflow description
  - `resource_type` (text) - Type of resource this workflow applies to
  - `trigger_condition` (jsonb) - Conditions that trigger this workflow
  - `is_active` (boolean) - Whether workflow is currently active
  - `is_sequential` (boolean) - Whether steps must be completed in order
  - `auto_approve_threshold` (jsonb, nullable) - Conditions for automatic approval
  - `created_by` (uuid, references profiles)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `approval_workflow_steps`
  Individual steps within an approval workflow
  - `id` (uuid, primary key)
  - `workflow_id` (uuid, references approval_workflows)
  - `step_order` (integer) - Order of execution
  - `name` (text) - Step name
  - `description` (text) - Step description
  - `required_role` (text) - Role required to approve this step
  - `required_permission` (text, nullable) - Specific permission required
  - `allow_multiple_approvers` (boolean) - Whether multiple people can approve
  - `required_approver_count` (integer) - Number of approvals needed
  - `escalation_timeout_hours` (integer, nullable) - Hours before escalation
  - `escalation_role` (text, nullable) - Role to escalate to if timeout
  - `can_reject` (boolean) - Whether this step can reject the request
  - `created_at` (timestamptz)

  ### 3. `approval_requests`
  Individual approval request instances
  - `id` (uuid, primary key)
  - `workflow_id` (uuid, references approval_workflows)
  - `resource_type` (text) - Type of resource being approved
  - `resource_id` (uuid) - ID of resource being approved
  - `current_step_id` (uuid, references approval_workflow_steps, nullable)
  - `status` (text) - pending, approved, rejected, cancelled
  - `submitted_by` (uuid, references profiles)
  - `submitted_at` (timestamptz)
  - `completed_at` (timestamptz, nullable)
  - `priority` (text) - low, medium, high, urgent
  - `metadata` (jsonb) - Additional context about the request
  - `rejection_reason` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `approval_actions`
  Log of all approval decisions and comments
  - `id` (uuid, primary key)
  - `request_id` (uuid, references approval_requests)
  - `step_id` (uuid, references approval_workflow_steps)
  - `actor_id` (uuid, references profiles) - User who took action
  - `action` (text) - approved, rejected, requested_changes, commented
  - `comment` (text, nullable)
  - `changes_requested` (jsonb, nullable) - Specific changes requested
  - `created_at` (timestamptz)

  ### 5. `approval_delegates`
  Temporary delegation of approval authority
  - `id` (uuid, primary key)
  - `delegator_id` (uuid, references profiles) - User delegating authority
  - `delegate_id` (uuid, references profiles) - User receiving authority
  - `workflow_id` (uuid, references approval_workflows, nullable) - Specific workflow or all
  - `start_date` (timestamptz)
  - `end_date` (timestamptz)
  - `reason` (text)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 6. `approval_notifications`
  Tracks notifications sent for approval requests
  - `id` (uuid, primary key)
  - `request_id` (uuid, references approval_requests)
  - `recipient_id` (uuid, references profiles)
  - `notification_type` (text) - submission, approval_needed, approved, rejected, escalated
  - `sent_at` (timestamptz)
  - `read_at` (timestamptz, nullable)
  - `metadata` (jsonb)
  - `created_at` (timestamptz)

  ## Security
  
  All tables have Row Level Security (RLS) enabled:
  
  - Approval Workflows: Viewable by all authenticated; manageable by school_admin and super_admin
  - Workflow Steps: Viewable by all authenticated; manageable by school_admin and super_admin
  - Approval Requests: Viewable by submitter and approvers; manageable by involved parties
  - Approval Actions: Viewable by request participants; insertable by authorized approvers
  - Approval Delegates: Viewable by involved parties; manageable by delegator and admins
  - Approval Notifications: Viewable by recipient only

  ## Indexes
  
  Critical indexes for performance on:
  - Foreign key relationships
  - Workflow lookups by resource type and status
  - Request lookups by status and priority
  - Action lookups by request and actor
  - Notification lookups by recipient and read status
*/

-- =============================================
-- APPROVAL WORKFLOWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS approval_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  resource_type text NOT NULL,
  trigger_condition jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_sequential boolean DEFAULT true,
  auto_approve_threshold jsonb,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_workflows_resource_type ON approval_workflows(resource_type);
CREATE INDEX IF NOT EXISTS idx_approval_workflows_is_active ON approval_workflows(is_active);

ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approval workflows are viewable by authenticated users"
  ON approval_workflows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "School admins can manage workflows"
  ON approval_workflows FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'super_admin')
    )
  );

-- =============================================
-- APPROVAL WORKFLOW STEPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS approval_workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES approval_workflows(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  name text NOT NULL,
  description text,
  required_role text NOT NULL CHECK (required_role IN ('parent', 'school_admin', 'marketing', 'operations', 'risk', 'super_admin', 'content_editor', 'accountant', 'camp_counselor', 'support_agent')),
  required_permission text,
  allow_multiple_approvers boolean DEFAULT false,
  required_approver_count integer DEFAULT 1,
  escalation_timeout_hours integer,
  escalation_role text CHECK (escalation_role IN ('parent', 'school_admin', 'marketing', 'operations', 'risk', 'super_admin', 'content_editor', 'accountant', 'camp_counselor', 'support_agent')),
  can_reject boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_workflow_steps_workflow_id ON approval_workflow_steps(workflow_id);
CREATE INDEX IF NOT EXISTS idx_approval_workflow_steps_step_order ON approval_workflow_steps(step_order);

ALTER TABLE approval_workflow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workflow steps are viewable by authenticated users"
  ON approval_workflow_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "School admins can manage workflow steps"
  ON approval_workflow_steps FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'super_admin')
    )
  );

-- =============================================
-- APPROVAL REQUESTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES approval_workflows(id) ON DELETE RESTRICT,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  current_step_id uuid REFERENCES approval_workflow_steps(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  submitted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  metadata jsonb DEFAULT '{}',
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_requests_workflow_id ON approval_requests(workflow_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_resource ON approval_requests(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_submitted_by ON approval_requests(submitted_by);
CREATE INDEX IF NOT EXISTS idx_approval_requests_priority ON approval_requests(priority);

ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own approval requests"
  ON approval_requests FOR SELECT
  TO authenticated
  USING (submitted_by = auth.uid());

CREATE POLICY "Approvers can view requests they can approve"
  ON approval_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approval_workflow_steps aws
      JOIN profiles p ON p.id = auth.uid()
      WHERE aws.id = approval_requests.current_step_id
      AND p.role = aws.required_role
    )
  );

CREATE POLICY "School admins can view all approval requests"
  ON approval_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "Users can insert approval requests"
  ON approval_requests FOR INSERT
  TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Approvers can update requests they can approve"
  ON approval_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approval_workflow_steps aws
      JOIN profiles p ON p.id = auth.uid()
      WHERE aws.id = approval_requests.current_step_id
      AND p.role = aws.required_role
    ) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'super_admin')
    )
  );

-- =============================================
-- APPROVAL ACTIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS approval_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES approval_requests(id) ON DELETE CASCADE,
  step_id uuid REFERENCES approval_workflow_steps(id) ON DELETE SET NULL,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('approved', 'rejected', 'requested_changes', 'commented')),
  comment text,
  changes_requested jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_actions_request_id ON approval_actions(request_id);
CREATE INDEX IF NOT EXISTS idx_approval_actions_actor_id ON approval_actions(actor_id);
CREATE INDEX IF NOT EXISTS idx_approval_actions_created_at ON approval_actions(created_at DESC);

ALTER TABLE approval_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view actions on their requests"
  ON approval_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approval_requests ar
      WHERE ar.id = approval_actions.request_id
      AND ar.submitted_by = auth.uid()
    )
  );

CREATE POLICY "Approvers can view actions on requests they can approve"
  ON approval_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM approval_requests ar
      JOIN approval_workflow_steps aws ON aws.id = ar.current_step_id
      JOIN profiles p ON p.id = auth.uid()
      WHERE ar.id = approval_actions.request_id
      AND p.role = aws.required_role
    )
  );

CREATE POLICY "School admins can view all approval actions"
  ON approval_actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "Approvers can insert approval actions"
  ON approval_actions FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM approval_requests ar
        JOIN approval_workflow_steps aws ON aws.id = ar.current_step_id
        JOIN profiles p ON p.id = auth.uid()
        WHERE ar.id = approval_actions.request_id
        AND p.role = aws.required_role
      ) OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('school_admin', 'super_admin')
      )
    )
  );

-- =============================================
-- APPROVAL DELEGATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS approval_delegates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  delegate_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES approval_workflows(id) ON DELETE CASCADE,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz NOT NULL,
  reason text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_delegates_delegator_id ON approval_delegates(delegator_id);
CREATE INDEX IF NOT EXISTS idx_approval_delegates_delegate_id ON approval_delegates(delegate_id);
CREATE INDEX IF NOT EXISTS idx_approval_delegates_workflow_id ON approval_delegates(workflow_id);
CREATE INDEX IF NOT EXISTS idx_approval_delegates_dates ON approval_delegates(start_date, end_date);

ALTER TABLE approval_delegates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view delegations involving them"
  ON approval_delegates FOR SELECT
  TO authenticated
  USING (
    delegator_id = auth.uid() OR
    delegate_id = auth.uid()
  );

CREATE POLICY "School admins can view all delegations"
  ON approval_delegates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "Users can create delegations for themselves"
  ON approval_delegates FOR INSERT
  TO authenticated
  WITH CHECK (delegator_id = auth.uid());

CREATE POLICY "Users can update own delegations"
  ON approval_delegates FOR UPDATE
  TO authenticated
  USING (delegator_id = auth.uid());

CREATE POLICY "Users can delete own delegations"
  ON approval_delegates FOR DELETE
  TO authenticated
  USING (delegator_id = auth.uid());

-- =============================================
-- APPROVAL NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS approval_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES approval_requests(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL CHECK (notification_type IN ('submission', 'approval_needed', 'approved', 'rejected', 'escalated', 'changes_requested')),
  sent_at timestamptz DEFAULT now(),
  read_at timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_approval_notifications_request_id ON approval_notifications(request_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_recipient_id ON approval_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_approval_notifications_read_at ON approval_notifications(read_at);

ALTER TABLE approval_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON approval_notifications FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON approval_notifications FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON approval_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_approval_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_approval_workflows_updated_at') THEN
    CREATE TRIGGER update_approval_workflows_updated_at
      BEFORE UPDATE ON approval_workflows
      FOR EACH ROW EXECUTE FUNCTION update_approval_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_approval_requests_updated_at') THEN
    CREATE TRIGGER update_approval_requests_updated_at
      BEFORE UPDATE ON approval_requests
      FOR EACH ROW EXECUTE FUNCTION update_approval_updated_at();
  END IF;
END $$;