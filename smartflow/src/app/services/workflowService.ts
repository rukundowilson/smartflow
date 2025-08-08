import API from "@/app/utils/axios";

export interface WorkflowStep {
  id: number;
  workflow_id: number;
  step_order: number;
  role_id: number;
  role_name: string;
  action_type: 'approve' | 'reject' | 'assign' | 'review';
  is_required: boolean;
  can_skip: boolean;
  auto_approve_conditions?: string; // JSON conditions
  timeout_hours?: number;
  escalation_role_id?: number;
}

export interface Workflow {
  id: number;
  name: string;
  description: string;
  type: 'ticket' | 'requisition' | 'access_request' | 'registration';
  department_id: number;
  is_active: boolean;
  steps: WorkflowStep[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowInstance {
  id: number;
  workflow_id: number;
  record_id: number;
  record_type: string;
  current_step: number;
  status: 'active' | 'completed' | 'cancelled' | 'escalated';
  started_at: string;
  completed_at?: string;
  current_assignee_id?: number;
  escalation_reason?: string;
}

export interface WorkflowAction {
  instance_id: number;
  step_id: number;
  action: 'approve' | 'reject' | 'assign' | 'skip' | 'escalate';
  user_id: number;
  comments?: string;
  metadata?: Record<string, any>;
}

export class WorkflowService {
  // Get available workflows for a department
  async getWorkflows(departmentId: number): Promise<Workflow[]> {
    try {
      const response = await API.get(`/api/workflows/department/${departmentId}`);
      return response.data.workflows;
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      return [];
    }
  }

  // Start a new workflow instance
  async startWorkflow(workflowId: number, recordId: number, recordType: string): Promise<WorkflowInstance> {
    try {
      const response = await API.post('/api/workflows/instances', {
        workflow_id: workflowId,
        record_id: recordId,
        record_type: recordType
      });
      return response.data.instance;
    } catch (error) {
      console.error('Failed to start workflow:', error);
      throw error;
    }
  }

  // Get active workflow instances for a user
  async getUserWorkflows(userId: number): Promise<WorkflowInstance[]> {
    try {
      const response = await API.get(`/api/workflows/instances/user/${userId}`);
      return response.data.instances;
    } catch (error) {
      console.error('Failed to fetch user workflows:', error);
      return [];
    }
  }

  // Perform a workflow action
  async performAction(action: WorkflowAction): Promise<{ success: boolean; nextStep?: WorkflowStep }> {
    try {
      const response = await API.post('/api/workflows/actions', action);
      return response.data;
    } catch (error) {
      console.error('Failed to perform workflow action:', error);
      throw error;
    }
  }

  // Get workflow history
  async getWorkflowHistory(instanceId: number): Promise<any[]> {
    try {
      const response = await API.get(`/api/workflows/instances/${instanceId}/history`);
      return response.data.history;
    } catch (error) {
      console.error('Failed to fetch workflow history:', error);
      return [];
    }
  }

  // Check if workflow can be auto-approved
  async checkAutoApprovalConditions(instanceId: number, stepId: number): Promise<boolean> {
    try {
      const response = await API.get(`/api/workflows/instances/${instanceId}/auto-approve/${stepId}`);
      return response.data.canAutoApprove;
    } catch (error) {
      console.error('Failed to check auto-approval conditions:', error);
      return false;
    }
  }

  // Escalate workflow
  async escalateWorkflow(instanceId: number, reason: string, escalatedToUserId: number): Promise<void> {
    try {
      await API.post(`/api/workflows/instances/${instanceId}/escalate`, {
        reason,
        escalated_to_user_id: escalatedToUserId
      });
    } catch (error) {
      console.error('Failed to escalate workflow:', error);
      throw error;
    }
  }

  // Get workflow statistics
  async getWorkflowStats(departmentId: number): Promise<any> {
    try {
      const response = await API.get(`/api/workflows/stats/department/${departmentId}`);
      return response.data.stats;
    } catch (error) {
      console.error('Failed to fetch workflow stats:', error);
      return {};
    }
  }

  // Create custom workflow
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Promise<Workflow> {
    try {
      const response = await API.post('/api/workflows', workflow);
      return response.data.workflow;
    } catch (error) {
      console.error('Failed to create workflow:', error);
      throw error;
    }
  }

  // Update workflow
  async updateWorkflow(workflowId: number, updates: Partial<Workflow>): Promise<Workflow> {
    try {
      const response = await API.put(`/api/workflows/${workflowId}`, updates);
      return response.data.workflow;
    } catch (error) {
      console.error('Failed to update workflow:', error);
      throw error;
    }
  }

  // Cancel workflow instance
  async cancelWorkflow(instanceId: number, reason: string): Promise<void> {
    try {
      await API.post(`/api/workflows/instances/${instanceId}/cancel`, { reason });
    } catch (error) {
      console.error('Failed to cancel workflow:', error);
      throw error;
    }
  }
}

export default new WorkflowService(); 