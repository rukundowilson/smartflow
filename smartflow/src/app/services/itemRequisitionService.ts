import API from "@/app/utils/axios";

export interface ItemRequisition {
  id: number;
  item_name: string;
  quantity: number;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  requested_by_name: string;
  reviewed_by_name?: string;
}

export interface CreateItemRequisitionData {
  requested_by: number;
  item_name: string;
  quantity: number;
  justification: string;
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

export async function updateItemRequisitionStatus(
  requisitionId: number, 
  status: 'pending' | 'approved' | 'rejected', 
  reviewedBy: number
): Promise<{ success: boolean; message: string }> {
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