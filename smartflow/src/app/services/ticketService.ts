import API from "../utils/axios";

export interface NewTicket {
  issue_type: string;
  priority?: string;
  description: string;
}

export async function createTicket(ticket: NewTicket, created_by: any) {
  try {
    console.log(created_by)
    const response = await API.post("/api/tickets", {ticket,created_by});
    return response.data;
  } catch (error: any) {
    console.error("Ticket creation failed", error);
    throw new Error(error.response?.data?.message || "Failed to create ticket");
  }
}

export const fetchTicketsByUserId = async (userId: any) => {
  try {
    console.log("Fetching tickets for userId:", userId, "Type:", typeof userId);
    const response = await API.get(`/api/tickets/get/${userId}`);
    console.log("Raw API response:", response);
    console.log("Response data:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch tickets:", error);
    console.error("Error response:", error.response);
    console.error("Error message:", error.message);
    throw error;
  }
};