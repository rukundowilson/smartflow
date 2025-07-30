import API from "@/app/utils/axios";

export interface DashboardStats {
  tickets: {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    byStatus: { status: string; count: number }[];
  };
  requisitions: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    assigned: number;
    delivered: number;
    byStatus: { status: string; count: number }[];
  };
  users: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    byStatus: { status: string; count: number }[];
  };
  recentActivities: {
    id: string;
    type: 'ticket' | 'requisition' | 'user' | 'access';
    action: string;
    description: string;
    timestamp: string;
    user: string;
  }[];
}

export async function getDashboardStats(): Promise<{ success: boolean; data: DashboardStats }> {
  try {
    const response = await API.get("/api/dashboard/stats");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch dashboard stats";
    throw new Error(message);
  }
}

export async function getRecentActivities(): Promise<{ success: boolean; activities: DashboardStats['recentActivities'] }> {
  try {
    const response = await API.get("/api/dashboard/activities");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch recent activities";
    throw new Error(message);
  }
} 