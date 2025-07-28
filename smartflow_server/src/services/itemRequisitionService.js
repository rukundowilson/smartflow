import db from "../config/db.js";

export async function createItemRequisition(requisitionData) {
  try {
    const { requested_by, item_name, quantity, justification } = requisitionData;
    
    const [result] = await db.query(
      "INSERT INTO item_requisitions (requested_by, item_name, quantity, justification) VALUES (?, ?, ?, ?)",
      [requested_by, item_name, quantity, justification]
    );
    
    return {
      id: result.insertId,
      requested_by,
      item_name,
      quantity,
      justification,
      status: 'pending',
      created_at: new Date()
    };
  } catch (error) {
    console.error("Error creating item requisition:", error);
    throw new Error("Failed to create item requisition");
  }
}

export async function getItemRequisitionsByUser(userId) {
  try {
    const [requisitions] = await db.query(
      `SELECT 
        ir.id,
        ir.item_name,
        ir.quantity,
        ir.justification,
        ir.status,
        ir.created_at,
        u.full_name as requested_by_name,
        reviewer.full_name as reviewed_by_name
      FROM item_requisitions ir
      LEFT JOIN users u ON ir.requested_by = u.id
      LEFT JOIN users reviewer ON ir.reviewed_by = reviewer.id
      WHERE ir.requested_by = ?
      ORDER BY ir.created_at DESC`,
      [userId]
    );
    
    return requisitions;
  } catch (error) {
    console.error("Error fetching item requisitions:", error);
    throw new Error("Failed to fetch item requisitions");
  }
}

export async function getAllItemRequisitions() {
  try {
    const [requisitions] = await db.query(
      `SELECT 
        ir.id,
        ir.item_name,
        ir.quantity,
        ir.justification,
        ir.status,
        ir.created_at,
        u.full_name as requested_by_name,
        reviewer.full_name as reviewed_by_name
      FROM item_requisitions ir
      LEFT JOIN users u ON ir.requested_by = u.id
      LEFT JOIN users reviewer ON ir.reviewed_by = reviewer.id
      ORDER BY ir.created_at DESC`
    );
    
    return requisitions;
  } catch (error) {
    console.error("Error fetching all item requisitions:", error);
    throw new Error("Failed to fetch item requisitions");
  }
}

export async function updateItemRequisitionStatus(requisitionId, status, reviewedBy) {
  try {
    const [result] = await db.query(
      "UPDATE item_requisitions SET status = ?, reviewed_by = ? WHERE id = ?",
      [status, reviewedBy, requisitionId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Item requisition not found");
    }
    
    return { success: true, message: "Item requisition status updated successfully" };
  } catch (error) {
    console.error("Error updating item requisition status:", error);
    throw error;
  }
} 