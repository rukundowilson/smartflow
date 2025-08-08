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
        t.reviewed_by,
        t.reviewed_at,
        creator.full_name as created_by_name,
        assignee.full_name as assigned_to_name,
        reviewer.full_name as reviewed_by_name
      FROM tickets t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      LEFT JOIN users reviewer ON t.reviewed_by = reviewer.id
      WHERE t.created_by = ?
      ORDER BY t.created_at DESC`,
      [numericUserId]
    );
    
    console.log("Query result:", tickets);
    console.log("Number of tickets found:", tickets.length);
    
    return { tickets };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    throw error; // Preserve original MySQL error (e.g., ER_USER_LIMIT_REACHED)
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
        t.reviewed_by,
        t.reviewed_at,
        creator.full_name as created_by_name,
        assignee.full_name as assigned_to_name,
        reviewer.full_name as reviewed_by_name
      FROM tickets t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      LEFT JOIN users reviewer ON t.reviewed_by = reviewer.id
      ORDER BY t.created_at DESC`
    );
    
    return { tickets };
  } catch (error) {
    console.error("Error fetching all tickets:", error);
    throw new Error("Failed to fetch all tickets");
  }
}

export async function getTicketById(ticketId) {
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
        t.reviewed_by,
        t.reviewed_at,
        creator.full_name as created_by_name,
        assignee.full_name as assigned_to_name,
        reviewer.full_name as reviewed_by_name
      FROM tickets t
      LEFT JOIN users creator ON t.created_by = creator.id
      LEFT JOIN users assignee ON t.assigned_to = assignee.id
      LEFT JOIN users reviewer ON t.reviewed_by = reviewer.id
      WHERE t.id = ?`,
      [ticketId]
    );
    
    if (tickets.length === 0) {
      throw new Error("Ticket not found");
    }
    
    return tickets[0];
  } catch (error) {
    console.error("Error fetching ticket by ID:", error);
    throw error;
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

export async function updateTicketStatus(ticketId, status, reviewedBy = null) {
  try {
    let query, params;
    
    if (reviewedBy) {
      // If reviewer is provided, update status and review info
      query = "UPDATE tickets SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?";
      params = [status, reviewedBy, ticketId];
    } else {
      // If no reviewer, just update status
      query = "UPDATE tickets SET status = ? WHERE id = ?";
      params = [status, ticketId];
    }
    
    const [result] = await db.query(query, params);
    
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
    console.log("🔍 getITUsers: Starting query");
    
    // Query IT users by joining with user_department_roles and departments tables
    // Handle various spellings and typos in department names
    const [users] = await db.query(`
      SELECT DISTINCT u.id, u.full_name, u.email 
      FROM users u
      JOIN user_department_roles udr ON u.id = udr.user_id
      JOIN departments d ON udr.department_id = d.id
      WHERE (
        LOWER(d.name) LIKE '%it%' OR 
        LOWER(d.name) LIKE '%information%' OR 
        LOWER(d.name) LIKE '%technology%' OR
        LOWER(d.name) LIKE '%tech%'
      )
      AND u.status = 'active'
      AND udr.status = 'active'
    `);
    
    console.log("🔍 getITUsers: Query result:", users);
    
    // Only return IT department users, no fallback to all users
    console.log(`🔍 getITUsers: Found ${users.length} IT users`);
    return users;
  } catch (error) {
    console.error("🔍 getITUsers: Error fetching IT users:", error);
    throw new Error("Failed to fetch IT users");
  }
}
