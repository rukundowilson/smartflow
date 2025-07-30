import API from "../utils/axios";

export interface Comment {
  id: number;
  comment_type: 'ticket' | 'requisition';
  commented_id: number;
  commented_by: number;
  content: string;
  created_at: string;
  commented_by_name: string;
  commented_by_email: string;
}

export interface NewComment {
  comment_type: 'ticket' | 'requisition';
  commented_id: number;
  commented_by: number;
  content: string;
}

export async function createComment(comment: NewComment): Promise<Comment> {
  try {
    const response = await API.post("/api/comments/create", comment);
    return response.data;
  } catch (error: any) {
    console.error("Comment creation failed", error);
    throw new Error(error.response?.data?.error || error.response?.data?.message || "Failed to create comment");
  }
}

export async function getTicketComments(ticketId: number): Promise<{ success: boolean; comments: Comment[] }> {
  try {
    const response = await API.get(`/api/comments/ticket/${ticketId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch ticket comments:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch comments");
  }
}

export async function getRequisitionComments(requisitionId: number): Promise<{ success: boolean; comments: Comment[] }> {
  try {
    const response = await API.get(`/api/comments/requisition/${requisitionId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch requisition comments:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch comments");
  }
}

export async function deleteComment(commentId: number, userId: number): Promise<{ success: boolean; message: string }> {
  try {
    const response = await API.delete(`/api/comments/${commentId}`, {
      data: { userId }
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to delete comment:", error);
    throw new Error(error.response?.data?.message || "Failed to delete comment");
  }
} 