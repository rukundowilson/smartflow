import API from "@/app/utils/axios";

export interface ItemRequisition {
  id: number;
  item_name: string;
  quantity: number;
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'assigned' | 'delivered';
  created_at: string;
  requested_by: number;
  requested_by_name: string;
  reviewed_by_name?: string;
  assigned_to?: number;
  assigned_by?: number;
  assigned_to_name?: string;
  assigned_by_name?: string;
}

export interface CreateItemRequisitionData {
  requested_by: number;
  item_name: string;
  quantity: number;
  justification: string;
}

export interface PickupDetails {
  id: number;
  requisition_id: number;
  scheduled_pickup: string;
  picked_up_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  delivered_by_name: string | null;
}

export interface AssignRequisitionData {
  assignedTo: number;
  assignedBy: number;
}

export async function createItemRequisition(data: CreateItemRequisitionData): Promise<{ success: boolean; message: string; requisition: ItemRequisition }> {
  try {
    const response = await API.post("/api/requisitions/new", data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to create item requisition";
    throw new Error(message);
  }
}

export async function getUserItemRequisitions(userId: number): Promise<{ success: boolean; requisitions: ItemRequisition[] }> {
  try {
    const response = await API.get(`/api/requisitions/user/${userId}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch item requisitions";
    throw new Error(message);
  }
}

export async function getAllItemRequisitions(): Promise<{ success: boolean; requisitions: ItemRequisition[] }> {
  try {
    const response = await API.get("/api/requisitions/all");
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch all item requisitions";
    throw new Error(message);
  }
}

export async function updateItemRequisitionStatus(requisitionId: number, status: string, reviewedBy: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await API.put(`/api/requisitions/${requisitionId}/status`, {
      status,
      reviewed_by: reviewedBy
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update item requisition status";
    throw new Error(message);
  }
}

export async function getItemRequisitionById(requisitionId: number): Promise<{ success: boolean; requisition: ItemRequisition }> {
  try {
    const response = await API.get(`/api/requisitions/${requisitionId}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch item requisition";
    throw new Error(message);
  }
}

export async function assignItemRequisition(requisitionId: number, data: AssignRequisitionData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await API.put(`/api/requisitions/${requisitionId}/assign`, data);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to assign item requisition";
    throw new Error(message);
  }
}

export async function getAssignedRequisitions(userId: number): Promise<{ success: boolean; requisitions: ItemRequisition[] }> {
  try {
    const response = await API.get(`/api/requisitions/assigned/${userId}`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch assigned requisitions";
    throw new Error(message);
  }
}

export async function scheduleItemPickup(requisitionId: number, scheduledPickup: string, notes?: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await API.post(`/api/requisitions/${requisitionId}/pickup`, {
      scheduledPickup,
      notes
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to schedule pickup";
    throw new Error(message);
  }
}

export async function markItemAsDelivered(requisitionId: number, deliveredBy: number, notes?: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await API.put(`/api/requisitions/${requisitionId}/deliver`, {
      deliveredBy,
      notes
    });
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to mark item as delivered";
    throw new Error(message);
  }
}

export async function getPickupDetails(requisitionId: number): Promise<{ success: boolean; pickupDetails: PickupDetails | null }> {
  try {
    const response = await API.get(`/api/requisitions/${requisitionId}/pickup`);
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch pickup details";
    throw new Error(message);
  }
} 