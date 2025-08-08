import { createTicket, fetchTicketsByUserId, getAllTickets, getTicketById as getTicketByIdService } from "../services/ticketService.js";

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
  console.log("getUserTickets called with userId:", userId);

  try {
    const tickets = await fetchTicketsByUserId(userId);
    console.log("Tickets returned from service:", tickets);
    res.status(200).json({ success: true, tickets: tickets.tickets });
  } catch (error) {
    console.error("Error in getUserTickets:", error);
    if (error && (error.code === 'ER_USER_LIMIT_REACHED' || error.errno === 1226)) {
      return res.status(503).json({ success: false, message: 'Database connection limit reached. Please retry shortly.' });
    }
    res.status(500).json({ success: false, message: "Failed to fetch tickets" });
  }
};

export const handleGetAllTickets = async (req, res) => {
  try {
    const tickets = await getAllTickets();
    console.log("All tickets returned from service:", tickets);
    res.status(200).json({ success: true, tickets: tickets.tickets });
  } catch (error) {
    console.error("Error in handleGetAllTickets:", error);
    res.status(500).json({ success: false, message: "Failed to fetch all tickets" });
  }
};

export const getTicketById = async (req, res) => {
  const ticketId = req.params.ticketId;
  
  try {
    const ticket = await getTicketByIdService(ticketId);
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    console.error("Error in getTicketById:", error);
    res.status(500).json({ success: false, message: "Failed to fetch ticket" });
  }
};

