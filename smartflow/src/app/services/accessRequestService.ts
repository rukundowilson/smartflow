import API from '../utils/axios';

export interface ApprovalHistory {
  id: number;
  request_id: number;
  approver_id: number;
  action: 'approve' | 'reject';
  comment?: string;
  approved_at: string;
  approver_name: string;
  approver_email: string;
}

export interface AccessRequest {
  id: number;
  user_id: number;
  department_id: number;
  role_id: number;
  justification: string;
  start_date: string;
  end_date?: string;
  is_permanent: boolean;
  status: 'pending_line_manager' | 'pending_hod' | 'pending_it_manager' | 'pending_it_review' | 'pending_manager_approval' | 'pending_system_owner' | 'ready_for_assignment' | 'granted' | 'rejected' | 'approved' | 'access_granted' | 'it_assigned';
  submitted_at: string;
  approved_at?: string;
  approved_by?: number;
  rejection_reason?: string;
  department_name: string;
  department_description?: string;
  role_name: string;
  role_description?: string;
  user_name: string;
  user_email: string;
  approver_name?: string;
  approval_history?: ApprovalHistory[];
}

export interface ApprovalData {
  approver_id: number;
  comment?: string;
  rejection_reason?: string;
  approver_role?: string;
}

export interface CreateAccessRequestData {
  user_id: number;
  department_id: number;
  role_id: number;
  justification: string;
  start_date: string;
  end_date?: string;
  is_permanent: boolean;
}

class AccessRequestService {
  private baseUrl = '/api/access-requests';

  // Get all access requests for HOD dashboard
  async getAllRequests(): Promise<AccessRequest[]> {
    try {
      const response = await API.get(`${this.baseUrl}/all`);
      return response.data.requests || [];
    } catch (error) {
      console.error('Error fetching all requests:', error);
      throw error;
    }
  }

  // Get approval history for a specific approver
  async getApprovalHistory(approverId: number, role?: string): Promise<{ success: boolean; requests: AccessRequest[] }> {
    try {
      const params = new URLSearchParams();
      params.append('approver_id', approverId.toString());
      if (role) {
        params.append('role', role);
      }
      const response = await API.get(`${this.baseUrl}/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching approval history:', error);
      throw error;
    }
  }

  // Get pending access requests for HOD approval
  async getPendingRequests(params?: { approver_id?: number; approver_role?: string }): Promise<{ success: boolean; requests: AccessRequest[] }> {
    try {
      const queryParams = params ? new URLSearchParams({
        approver_id: params.approver_id?.toString() || '',
        approver_role: params.approver_role || ''
      }).toString() : '';
      
      const url = queryParams ? `${this.baseUrl}/pending?${queryParams}` : `${this.baseUrl}/pending`;
      const response = await API.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      throw error;
    }
  }

  // Get specific access request by ID with approval history
  async getRequestById(requestId: number): Promise<{ success: boolean; request: AccessRequest }> {
    try {
      const response = await API.get(`${this.baseUrl}/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching request:', error);
      throw error;
    }
  }

  // Approve access request
  async approveRequest(requestId: number, approvalData: ApprovalData): Promise<any> {
    try {
      const response = await API.put(`${this.baseUrl}/${requestId}/approve`, approvalData);
      return response.data;
    } catch (error) {
      console.error('Error approving request:', error);
      throw error;
    }
  }

  // Reject access request
  async rejectRequest(requestId: number, rejectionData: ApprovalData): Promise<any> {
    try {
      const response = await API.put(`${this.baseUrl}/${requestId}/reject`, rejectionData);
      return response.data;
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }

  // IT Assignment
  async assignRequest(requestId: number, assignmentData: {
    approver_id: number;
    assignment_type: 'auto' | 'manual';
    assigned_user_id?: number;
    comment?: string;
  }): Promise<any> {
    try {
      const response = await API.put(`${this.baseUrl}/${requestId}/assign`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Error assigning request:', error);
      throw error;
    }
  }

  // Get user's access requests
  async getUserRequests(userId: number): Promise<AccessRequest[]> {
    try {
      const response = await API.get(`${this.baseUrl}/user/${userId}`);
      return response.data.requests || [];
    } catch (error) {
      console.error('Error fetching user requests:', error);
      throw error;
    }
  }

  // Create new access request
  async createAccessRequest(requestData: CreateAccessRequestData): Promise<any> {
    try {
      const response = await API.post(`${this.baseUrl}`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating access request:', error);
      throw error;
    }
  }
}

export default new AccessRequestService(); 