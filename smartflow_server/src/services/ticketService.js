import db from "../config/db.js";

export async function createTicket(ticketData) {
  try {
    const { created_by, issue_type, priority, description } = ticketData;
    
    const [result] = await db.query(
      "INSERT INTO tickets (created_by, issue_type, priority, description) VALUES (?, ?, ?, ?)",
      [created_by, issue_type, priority, description]
    );
    
    return {
      id: result.insertId,
      created_by,
      issue_type,
      priority,
      description,
      status: 'open',
      created_at: new Date()
    };
  } catch (error) {
    console.error("Error creating ticket:", error);
    throw new Error("Failed to create ticket");
  }
}

export async function fetchTicketsByUserId(userId) {
  try {
    console.log("Fetching tickets for userId:", userId, "Type:", typeof userId);
    
    // Convert userId to number if it's a string
    const numericUserId = parseInt(userId, 10);
    console.log("Numeric userId:", numericUserId);
    
    const [tickets] = await db.query(
      `SELECT 
        t.id,
        t.issue_type,
        t.priority,
        t.description,
        t.status,
        t.created_at,
        t.assigned_to,
        creator.full_name as created_by_name,
        assignee.full_name as assigned_to_name
      FROM tickets t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      WHERE t.created_by = ?
      ORDER BY t.created_at DESC`,
      [numericUserId]
    );
    
    console.log("Query result:", tickets);
    console.log("Number of tickets found:", tickets.length);
    
    return { tickets };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw new Error("Failed to fetch tickets");
  }
}

export async function getAllTickets() {
  try {
    const [tickets] = await db.query(
      `SELECT 
        t.id,
        t.issue_type,
        t.priority,
        t.description,
        t.status,
        t.created_at,
        t.assigned_to,
        creator.full_name as created_by_name,
        assignee.full_name as assigned_to_name
      FROM tickets t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      ORDER BY t.created_at DESC`
    );
    
    return { tickets };
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    throw new Error("Failed to fetch all tickets");
  }
}

export async function updateTicketAssignment(ticketId, assignedTo) {
  try {
    const [result] = await db.query(
      "UPDATE tickets SET assigned_to = ? WHERE id = ?",
      [assignedTo, ticketId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Ticket not found");
    }
    
    return { success: true, message: "Ticket assignment updated successfully" };
  } catch (error) {
    console.error("Error updating ticket assignment:", error);
    throw error;
  }
}

export async function updateTicketStatus(ticketId, status) {
  try {
    const [result] = await db.query(
      "UPDATE tickets SET status = ? WHERE id = ?",
      [status, ticketId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Ticket not found");
    }
    
    return { success: true, message: "Ticket status updated successfully" };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    throw error;
  }
}

export async function getITUsers() {
  try {
    // Try a more flexible query
    const [users] = await db.query(
      "SELECT id, full_name, email FROM users WHERE (LOWER(department) = 'it' OR LOWER(department) = 'it department' OR LOWER(department) = 'information technology') AND status = 'active'"
    );
    
    // If no IT users found, return all active users as fallback
    if (users.length === 0) {
      const [fallbackUsers] = await db.query(
        "SELECT id, full_name, email FROM users WHERE status = 'active' LIMIT 10"
      );
      return fallbackUsers;
    }
    
    return users;
  } catch (error) {
    console.error("Error fetching IT users:", error);
    throw new Error("Failed to fetch IT users");
  }
}
