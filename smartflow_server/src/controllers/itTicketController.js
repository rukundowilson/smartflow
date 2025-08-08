import { 
  getAllTickets, 
  updateTicketAssignment, 
  updateTicketStatus,
  getITUsers 
} from "../services/ticketService.js";
import { sendNotificationToUsers } from './notificationController.js';
import db from '../config/db.js';

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

    // Notify ticket owner about assignment
    try {
      const [[row]] = await db.query(`SELECT t.created_by, t.issue_type FROM tickets t WHERE t.id = ?`, [ticketId]);
      const [[assignee]] = await db.query(`SELECT full_name FROM users WHERE id = ?`, [assignedTo]);
      if (row?.created_by) {
        await sendNotificationToUsers([row.created_by], {
          type: 'ticket',
          title: 'Ticket Assigned',
          message: `Your ticket (${row.issue_type}) was assigned to ${assignee?.full_name || 'an agent'}.`,
          related_id: Number(ticketId),
          related_type: 'ticket'
        });
      }
    } catch (nerr) {
      console.warn('ticket assignment notification failed:', nerr?.message || nerr);
    }

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

    // Notify ticket owner on status change
    try {
      const [[row]] = await db.query(`SELECT t.created_by, t.issue_type FROM tickets t WHERE t.id = ?`, [ticketId]);
      if (row?.created_by) {
        await sendNotificationToUsers([row.created_by], {
          type: 'ticket',
          title: 'Ticket Updated',
          message: `Your ticket (${row.issue_type}) status changed to ${status.replace('_',' ')}.`,
          related_id: Number(ticketId),
          related_type: 'ticket'
        });
      }
    } catch (nerr) {
      console.warn('ticket status notification failed:', nerr?.message || nerr);
    }

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