import { createTicket, fetchTicketsByUserId } from "../services/ticketService.js";

export async function handleCreateTicket(req, res) {
  const {ticket, created_by, assigned_to } = req.body;
    const {issue_type, priority, description } = ticket;
  console.log(created_by)
  console.log(issue_type)
  if (!created_by || !issue_type || !description) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  console.log(created_by)

  try {
    const ticket = await createTicket({
      created_by,
      issue_type,
      priority,
      description,
    });

    res.status(201).json({ message: "Ticket created", ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while creating ticket" });
  }
}

export const getUserTickets = async (req, res) => {
  const userId = req.params.userId;

  try {
    const tickets = await fetchTicketsByUserId(userId);
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    console.error("Error in getUserTickets:", error);
    res.status(500).json({ success: false, message: "Failed to fetch tickets" });
  }
};

