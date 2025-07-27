import API from "../utils/axios";

export interface NewTicket {
  issue_type: string;
  priority?: string;
  description: string;
}

export async function createTicket(ticket: NewTicket, created_by: any) {
  try {
    console.log(created_by)
    const response = await API.post("/api/tickets/new", {ticket,created_by});
    return response.data;
  } catch (error: any) {
    console.error("Ticket creation failed", error);
    throw new Error(error.response?.data?.message || "Failed to create ticket");
  }
}
export const fetchTicketsByUserId = async (userId: any) => {
  try {
    console.log(userId)
    const response = await API.get(`/api/tickets/get/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch tickets:", error);
    throw error;
  }
};