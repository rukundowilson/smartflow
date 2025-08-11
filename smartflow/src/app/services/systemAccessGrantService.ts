import API from '../utils/axios';

export interface SystemAccessGrant {
  id: number;
  user_id: number;
  system_id: number;
  granted_at: string;
  granted_by: number;
  effective_from?: string;
  effective_until?: string;
  is_permanent: boolean;
  scheduled_revocation_date?: string;
  revocation_notification_sent: boolean;
  status: 'active' | 'revoked' | 'expired' | 'scheduled_for_revocation';
  user_name: string;
  user_email: string;
  system_name: string;
  system_description?: string;
  granted_by_name: string;
  days_remaining?: number;
  hours_until_revocation?: number;
}

export interface CreateSystemAccessGrantData {
  user_id: number;
  system_id: number;
  granted_from_request_id: number;
  granted_by: number;
  effective_from?: string;
  effective_until?: string;
  is_permanent: boolean;
  scheduled_revocation_date?: string;
}

export interface RevokeAccessData {
  revoked_by: number;
  revocation_reason?: string;
}

export interface ScheduleRevocationData {
  scheduled_revocation_date: string;
  scheduled_by: number;
}

class SystemAccessGrantService {
  // Get active system access grants
  async getActiveGrants(): Promise<{ success: boolean; grants?: SystemAccessGrant[]; message?: string }> {
    try {
      const response = await API.get('/system-access-grants/active');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching active grants:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch active grants'
      };
    }
  }

  // Get grants needing revocation notification
  async getGrantsNeedingNotification(): Promise<{ success: boolean; grants?: SystemAccessGrant[]; message?: string }> {
    try {
      const response = await API.get('/system-access-grants/needing-notification');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching grants needing notification:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch grants needing notification'
      };
    }
  }

  // Mark notification as sent
  async markNotificationSent(grantId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await API.patch(`/system-access-grants/${grantId}/mark-notification-sent`);
      return response.data;
    } catch (error: any) {
      console.error('Error marking notification as sent:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to mark notification as sent'
      };
    }
  }

  // Revoke system access
  async revokeAccess(grantId: number, data: RevokeAccessData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await API.patch(`/system-access-grants/${grantId}/revoke`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error revoking access:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to revoke access'
      };
    }
  }

  // Schedule revocation
  async scheduleRevocation(grantId: number, data: ScheduleRevocationData): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await API.patch(`/system-access-grants/${grantId}/schedule-revocation`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error scheduling revocation:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to schedule revocation'
      };
    }
  }

  // Get revocation history
  async getRevocationHistory(): Promise<{ success: boolean; history?: any[]; message?: string }> {
    try {
      const response = await API.get('/system-access-grants/history');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching revocation history:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to fetch revocation history'
      };
    }
  }

  // Create system access grant
  async createGrant(data: CreateSystemAccessGrantData): Promise<{ success: boolean; grant_id?: number; message?: string }> {
    try {
      const response = await API.post('/system-access-grants', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating grant:', error);
      return {
        success: false,
        message: error?.response?.data?.message || 'Failed to create grant'
      };
    }
  }
}

export default new SystemAccessGrantService(); 