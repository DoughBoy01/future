import { supabase } from '../lib/supabase';

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  resource_type: string;
  is_active: boolean;
  is_sequential: boolean;
}

export interface ApprovalWorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  name: string;
  description: string | null;
  required_role: string;
  required_permission: string | null;
  allow_multiple_approvers: boolean;
  required_approver_count: number;
  can_reject: boolean;
}

export interface ApprovalRequest {
  id: string;
  workflow_id: string;
  resource_type: string;
  resource_id: string;
  current_step_id: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  submitted_by: string;
  submitted_at: string;
  completed_at: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata: any;
  rejection_reason: string | null;
}

export interface ApprovalAction {
  id: string;
  request_id: string;
  step_id: string | null;
  actor_id: string;
  action: 'approved' | 'rejected' | 'requested_changes' | 'commented';
  comment: string | null;
  created_at: string;
}

class ApprovalWorkflowService {
  async getWorkflowByResourceType(resourceType: string): Promise<ApprovalWorkflow | null> {
    try {
      const { data, error } = await supabase
        .from('approval_workflows')
        .select('*')
        .eq('resource_type', resourceType)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workflow:', error);
      return null;
    }
  }

  async getWorkflowSteps(workflowId: string): Promise<ApprovalWorkflowStep[]> {
    try {
      const { data, error } = await supabase
        .from('approval_workflow_steps')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('step_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workflow steps:', error);
      return [];
    }
  }

  async submitApprovalRequest(
    workflowId: string,
    resourceType: string,
    resourceId: string,
    submittedBy: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    metadata: any = {}
  ): Promise<{ success: boolean; requestId?: string; error?: string }> {
    try {
      const steps = await this.getWorkflowSteps(workflowId);
      if (steps.length === 0) {
        return { success: false, error: 'No workflow steps found' };
      }

      const firstStep = steps[0];

      const { data, error } = await supabase
        .from('approval_requests')
        .insert({
          workflow_id: workflowId,
          resource_type: resourceType,
          resource_id: resourceId,
          current_step_id: firstStep.id,
          status: 'pending',
          submitted_by: submittedBy,
          priority,
          metadata,
        })
        .select()
        .single();

      if (error) throw error;

      await this.notifyApprovers(data.id, firstStep.id);

      return { success: true, requestId: data.id };
    } catch (error: any) {
      console.error('Error submitting approval request:', error);
      return { success: false, error: error.message };
    }
  }

  async approveRequest(
    requestId: string,
    approverId: string,
    comment?: string
  ): Promise<{ success: boolean; completed?: boolean; error?: string }> {
    try {
      const request = await this.getApprovalRequest(requestId);
      if (!request) {
        return { success: false, error: 'Approval request not found' };
      }

      if (request.status !== 'pending') {
        return { success: false, error: 'Request is not pending' };
      }

      if (!request.current_step_id) {
        return { success: false, error: 'No current step' };
      }

      await supabase.from('approval_actions').insert({
        request_id: requestId,
        step_id: request.current_step_id,
        actor_id: approverId,
        action: 'approved',
        comment,
      });

      const workflow = await this.getWorkflowByResourceType(request.resource_type);
      if (!workflow) {
        return { success: false, error: 'Workflow not found' };
      }

      const allSteps = await this.getWorkflowSteps(workflow.id);
      const currentStepIndex = allSteps.findIndex((s) => s.id === request.current_step_id);
      const nextStep = allSteps[currentStepIndex + 1];

      if (nextStep) {
        await supabase
          .from('approval_requests')
          .update({ current_step_id: nextStep.id })
          .eq('id', requestId);

        await this.notifyApprovers(requestId, nextStep.id);

        return { success: true, completed: false };
      } else {
        await supabase
          .from('approval_requests')
          .update({
            status: 'approved',
            completed_at: new Date().toISOString(),
          })
          .eq('id', requestId);

        await this.notifySubmitter(requestId, 'approved');

        return { success: true, completed: true };
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      return { success: false, error: error.message };
    }
  }

  async rejectRequest(
    requestId: string,
    rejectorId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const request = await this.getApprovalRequest(requestId);
      if (!request) {
        return { success: false, error: 'Approval request not found' };
      }

      if (request.status !== 'pending') {
        return { success: false, error: 'Request is not pending' };
      }

      await supabase.from('approval_actions').insert({
        request_id: requestId,
        step_id: request.current_step_id,
        actor_id: rejectorId,
        action: 'rejected',
        comment: reason,
      });

      await supabase
        .from('approval_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          completed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      await this.notifySubmitter(requestId, 'rejected');

      return { success: true };
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      return { success: false, error: error.message };
    }
  }

  async requestChanges(
    requestId: string,
    reviewerId: string,
    changes: any,
    comment?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const request = await this.getApprovalRequest(requestId);
      if (!request) {
        return { success: false, error: 'Approval request not found' };
      }

      await supabase.from('approval_actions').insert({
        request_id: requestId,
        step_id: request.current_step_id,
        actor_id: reviewerId,
        action: 'requested_changes',
        comment,
        changes_requested: changes,
      });

      await this.notifySubmitter(requestId, 'changes_requested');

      return { success: true };
    } catch (error: any) {
      console.error('Error requesting changes:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserPendingApprovals(userId: string, role: string): Promise<ApprovalRequest[]> {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*, approval_workflow_steps!inner(*)')
        .eq('status', 'pending')
        .eq('approval_workflow_steps.required_role', role);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      return [];
    }
  }

  async getUserSubmittedRequests(userId: string): Promise<ApprovalRequest[]> {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('submitted_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching submitted requests:', error);
      return [];
    }
  }

  async getApprovalHistory(requestId: string): Promise<ApprovalAction[]> {
    try {
      const { data, error } = await supabase
        .from('approval_actions')
        .select('*, profiles(first_name, last_name, role)')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching approval history:', error);
      return [];
    }
  }

  private async getApprovalRequest(requestId: string): Promise<ApprovalRequest | null> {
    const { data, error } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('id', requestId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching approval request:', error);
      return null;
    }

    return data;
  }

  private async notifyApprovers(requestId: string, stepId: string): Promise<void> {
    try {
      const step = await this.getStepDetails(stepId);
      if (!step) return;

      const approvers = await this.getUsersWithRole(step.required_role);

      const notifications = approvers.map((approverId) => ({
        request_id: requestId,
        recipient_id: approverId,
        notification_type: 'approval_needed' as const,
      }));

      await supabase.from('approval_notifications').insert(notifications);
    } catch (error) {
      console.error('Error notifying approvers:', error);
    }
  }

  private async notifySubmitter(
    requestId: string,
    notificationType: 'approved' | 'rejected' | 'changes_requested'
  ): Promise<void> {
    try {
      const request = await this.getApprovalRequest(requestId);
      if (!request) return;

      await supabase.from('approval_notifications').insert({
        request_id: requestId,
        recipient_id: request.submitted_by,
        notification_type: notificationType,
      });
    } catch (error) {
      console.error('Error notifying submitter:', error);
    }
  }

  private async getStepDetails(stepId: string): Promise<ApprovalWorkflowStep | null> {
    const { data, error } = await supabase
      .from('approval_workflow_steps')
      .select('*')
      .eq('id', stepId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching step details:', error);
      return null;
    }

    return data;
  }

  private async getUsersWithRole(role: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', role);

    if (error) {
      console.error('Error fetching users with role:', error);
      return [];
    }

    return data.map((u) => u.id);
  }
}

export const approvalWorkflowService = new ApprovalWorkflowService();
