import API from '../utils/axios';

export interface AccessRequest {
  id: number;
  user_id: number;
  system_id: number;
  role_id: number;
  justification: string;
  start_date: string;
  end_date?: string;
  is_permanent: boolean;
  status: 'pending_manager_approval' | 'pending_system_owner' | 'granted' | 'rejected';
  submitted_at: string;
  approved_at?: string;
  approved_by?: number;
  rejection_reason?: string;
  system_name: string;
  system_description: string;
  role_name: string;
  role_description: string;
  user_name: string;
  user_email: string;
  approver_name?: string;
}

export interface CreateAccessRequestData {
  user_id: number;
  system_id: number;
  role_id: number;
  justification: string;
  start_date: string;
  end_date?: string;
  is_permanent: boolean;
}

export interface ApproveRequestData {
  approver_id: number;
  comment?: string;
}

export interface RejectRequestData {
  approver_id: number;
  rejection_reason: string;
  comment?: string;
}

class AccessRequestService {
  private baseUrl = '/api/access-requests';

  // Create new access request
  async createAccessRequest(data: CreateAccessRequestData): Promise<{ success: boolean; message: string; request_id: number }> {
    try {
      const response = await API.post(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Error creating access request:', error);
      throw error;
    }
  }

  // Get user's access requests
  async getUserAccessRequests(userId: number): Promise<{ success: boolean; requests: AccessRequest[] }> {
    try {
      const response = await API.get(`${this.baseUrl}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user access requests:', error);
      throw error;
    }
  }

  // Get pending access requests (for managers/approvers)
  async getPendingAccessRequests(): Promise<{ success: boolean; requests: AccessRequest[] }> {
    try {
      const response = await API.get(`${this.baseUrl}/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending access requests:', error);
      throw error;
    }
  }

  // Get access request by ID
  async getAccessRequestById(requestId: number): Promise<{ success: boolean; request: AccessRequest }> {
    try {
      const response = await API.get(`${this.baseUrl}/${requestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching access request:', error);
      throw error;
    }
  }

  // Approve access request
  async approveAccessRequest(requestId: number, data: ApproveRequestData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await API.put(`${this.baseUrl}/${requestId}/approve`, data);
      return response.data;
    } catch (error) {
      console.error('Error approving access request:', error);
      throw error;
    }
  }

  // Reject access request
  async rejectAccessRequest(requestId: number, data: RejectRequestData): Promise<{ success: boolean; message: string }> {
    try {
      const response = await API.put(`${this.baseUrl}/${requestId}/reject`, data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting access request:', error);
      throw error;
    }
  }
}

export default new AccessRequestService(); 