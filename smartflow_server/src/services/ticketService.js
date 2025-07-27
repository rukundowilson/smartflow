import db from "../config/db.js";

export async function createTicket(ticketData) {
  const { created_by, issue_type, priority, description } = ticketData;

  const query = `
    INSERT INTO tickets (created_by,issue_type, priority, description)
    VALUES (?, ?, ?,?)
  `;

  const values = [created_by ?? 'null',issue_type, priority ?? 'medium', description];

  try {
    const [result] = await db.query(query, values);
    return {
      id: result.insertId,
      ...ticketData,
      status: "open",
    };
  } catch (error) {
    throw new Error("Failed to create ticket: " + error.message);
  }
}

export const fetchTicketsByUserId = async (userId) => {
  const [rows] = await db.query(
    "SELECT * FROM tickets WHERE created_by = ? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
};
