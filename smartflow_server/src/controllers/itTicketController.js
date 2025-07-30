import { 
  getAllTickets, 
  updateTicketAssignment, 
  updateTicketStatus,
  getITUsers 
} from "../services/ticketService.js";

export async function handleGetAllTickets(req, res) {
  try {
    const tickets = await getAllTickets();
    res.status(200).json({
      success: true,
      tickets: tickets.tickets
    });
  } catch (error) {
    console.error("Error in handleGetAllTickets:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch tickets"
    });
  }
}

export async function handleUpdateTicketAssignment(req, res) {
  try {
    const { ticketId } = req.params;
    const { assignedTo } = req.body;
    
    if (!ticketId || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Ticket ID and assignedTo are required"
      });
    }
    
    const result = await updateTicketAssignment(ticketId, assignedTo);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in handleUpdateTicketAssignment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update ticket assignment"
    });
  }
}

export async function handleUpdateTicketStatus(req, res) {
  try {
    const { ticketId } = req.params;
    const { status, reviewedBy } = req.body;
    
    if (!ticketId || !status) {
      return res.status(400).json({
        success: false,
        message: "Ticket ID and status are required"
      });
    }
    
    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: open, in_progress, resolved, closed"
      });
    }
    
    const result = await updateTicketStatus(ticketId, status, reviewedBy);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in handleUpdateTicketStatus:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update ticket status"
    });
  }
}

export async function handleGetITUsers(req, res) {
  try {
    const users = await getITUsers();
    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error in handleGetITUsers:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch IT users"
    });
  }
} 