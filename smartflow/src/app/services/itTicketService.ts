import API from "@/app/utils/axios";

export interface ITTicket {
  id: number;
  issue_type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  assigned_to: number | null;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_by_name: string;
  assigned_to_name: string | null;
  reviewed_by_name: string | null;
}

export interface ITUser {
  id: number;
  full_name: string;
  email: string;
}

export async function getAllTickets(): Promise<{ success: boolean; tickets: ITTicket[] }> {
  try {
    const response = await API.get("/api/tickets/all");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch tickets";
    throw new Error(message);
  }
}

export async function updateTicketAssignment(
  ticketId: number, 
  assignedTo: number | null
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await API.put(`/api/tickets/${ticketId}/assign`, {
      assignedTo
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update ticket assignment";
    throw new Error(message);
  }
}

export async function updateTicketStatus(
  ticketId: number, 
  status: 'open' | 'in_progress' | 'resolved' | 'closed',
  reviewedBy?: number | null
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await API.put(`/api/tickets/${ticketId}/status`, {
      status,
      reviewedBy
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update ticket status";
    throw new Error(message);
  }
}

export async function getITUsers(): Promise<{ success: boolean; users: ITUser[] }> {
  try {
    const response = await API.get("/api/users/it");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch IT users";
    throw new Error(message);
  }
} 