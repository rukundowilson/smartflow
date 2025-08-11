import API from '../utils/axios';

export interface UserMetrics {
  user_id: number;
  full_name: string;
  email: string;
  role_name: string;
  department_name: string;
  user_created_at: string;
  role_assigned_at: string;
  metrics: {
    tickets: {
      total: number;
      resolved: number;
      avg_tat: number;
    };
    access_requests: {
      total: number;
      granted: number;
      avg_tat: number;
    };
    requisitions: {
      total: number;
      approved: number;
      avg_tat: number;
    };
    overall: {
      total_items: number;
      completed_items: number;
      completion_rate: number;
      avg_tat_hours: number;
    };
  };
}

export interface UserMetricsResponse {
  success: boolean;
  data?: UserMetrics[];
  error?: string;
}

class UserMetricsService {
  // Get user metrics for TAT analysis
  async getUserMetrics(role?: string): Promise<UserMetricsResponse> {
    try {
      const params = role ? { role } : {};
      const response = await API.get('/api/dashboard/user-metrics', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user metrics:', error);
      return {
        success: false,
        error: error?.response?.data?.error || 'Failed to fetch user metrics'
      };
    }
  }

  // Format TAT hours for display
  formatTAT(hours: number): string {
    if (hours === 0 || !hours) return 'N/A';
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  }

  // Get performance grade based on completion rate
  getPerformanceGrade(completionRate: number): { grade: string; color: string; bgColor: string } {
    if (completionRate >= 90) return { grade: 'A+', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (completionRate >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (completionRate >= 70) return { grade: 'B+', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (completionRate >= 60) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (completionRate >= 50) return { grade: 'C+', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (completionRate >= 40) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (completionRate >= 30) return { grade: 'D+', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (completionRate >= 20) return { grade: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { grade: 'F', color: 'text-red-600', bgColor: 'bg-red-100' };
  }

  // Get TAT performance grade
  getTATGrade(avgTAT: number): { grade: string; color: string; bgColor: string } {
    if (avgTAT <= 4) return { grade: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (avgTAT <= 24) return { grade: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (avgTAT <= 72) return { grade: 'Fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (avgTAT <= 168) return { grade: 'Poor', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { grade: 'Very Poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  }
}

export default new UserMetricsService(); 