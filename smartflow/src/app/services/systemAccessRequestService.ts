import API from '../utils/axios';

export interface CreateSystemAccessRequestData {
  user_id: number;
  system_id: number;
  justification: string;
  start_date: string;
  end_date?: string;
  is_permanent: boolean;
}

export type SystemAccessStatus =
  | 'request_pending'
  | 'line_manager_pending'
  | 'hod_pending'
  | 'it_hod_pending'
  | 'it_manager_pending'
  | 'it_support_review'
  | 'granted'
  | 'rejected';

export interface SystemAccessRequest {
  id: number;
  user_id: number;
  system_id: number;
  justification: string;
  start_date: string;
  end_date?: string;
  is_permanent: boolean;
  status: SystemAccessStatus;
  submitted_at: string;
  system_name: string;
  system_description?: string;
  user_name?: string;
  user_email?: string;
  department_name?: string;
  role_name?: string;
  line_manager_id?: number;
  line_manager_at?: string;
  line_manager_name?: string;
  hod_id?: number;
  hod_at?: string;
  hod_name?: string;
  it_support_id?: number | null;
  it_support_name?: string | null;
  // Optional stage timestamps for analytics
  it_hod_id?: number;
  it_hod_at?: string;
  it_manager_id?: number;
  it_manager_at?: string;
  it_support_at?: string;
}

export interface ApprovalData {
  approver_id: number;
  approver_role: 'Line Manager' | 'HOD' | 'IT HOD' | 'IT Manager';
  comment?: string;
  rejection_reason?: string;
}

class SystemAccessRequestService {
  private baseUrl = '/api/system-access-requests';

  async create(data: CreateSystemAccessRequestData): Promise<any> {
    const res = await API.post(`${this.baseUrl}`, data);
    return res.data;
  }

  async getUserRequests(userId: number): Promise<{ success: boolean; requests: SystemAccessRequest[] }> {
    const res = await API.get(`${this.baseUrl}/user/${userId}`);
    return res.data;
  }

  async getPending(params: { approver_id: number; approver_role: 'Line Manager' | 'HOD' | 'IT HOD' | 'IT Manager' }): Promise<{ success: boolean; requests: SystemAccessRequest[] }> {
    const q = new URLSearchParams({ approver_id: String(params.approver_id), approver_role: params.approver_role });
    const res = await API.get(`${this.baseUrl}/pending?${q.toString()}`);
    return res.data;
  }

  async approve(id: number, data: ApprovalData): Promise<any> {
    const res = await API.put(`${this.baseUrl}/${id}/approve`, data);
    return res.data;
  }

  async reject(id: number, data: ApprovalData): Promise<any> {
    const res = await API.put(`${this.baseUrl}/${id}/reject`, data);
    return res.data;
  }

  async getApprovedBy(params: { approver_id: number; approver_role: 'Line Manager' | 'HOD' | 'IT HOD' | 'IT Manager' }): Promise<{ success: boolean; requests: SystemAccessRequest[] }> {
    const q = new URLSearchParams({ approver_id: String(params.approver_id), approver_role: params.approver_role });
    const res = await API.get(`${this.baseUrl}/approved-by?${q.toString()}`);
    return res.data;
  }

  async getApprovedDepartment(params: { approver_id: number }): Promise<{ success: boolean; requests: SystemAccessRequest[] }> {
    const q = new URLSearchParams({ approver_id: String(params.approver_id) });
    const res = await API.get(`${this.baseUrl}/approved-department?${q.toString()}`);
    return res.data;
  }

  async getITSupportQueue(params: { user_id: number }): Promise<{ success: boolean; requests: SystemAccessRequest[] }> {
    const q = new URLSearchParams({ user_id: String(params.user_id) });
    const res = await API.get(`${this.baseUrl}/it-support-queue?${q.toString()}`);
    return res.data;
  }

  async getCompleted(): Promise<{ success: boolean; requests: SystemAccessRequest[] }> {
    const res = await API.get(`${this.baseUrl}/completed`);
    return res.data;
  }

  async itSupportGrant(id: number, data: { user_id: number; comment?: string }): Promise<any> {
    const res = await API.put(`${this.baseUrl}/${id}/it-support/grant`, data);
    return res.data;
  }

  async itSupportReject(id: number, data: { user_id: number; rejection_reason?: string; comment?: string }): Promise<any> {
    const res = await API.put(`${this.baseUrl}/${id}/it-support/reject`, data);
    return res.data;
  }
}

export default new SystemAccessRequestService(); 