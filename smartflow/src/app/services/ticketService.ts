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
