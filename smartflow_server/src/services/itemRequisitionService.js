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

export async function getItemRequisitionById(requisitionId) {
  try {
    const [requisitions] = await db.query(
      `SELECT 
        ir.id,
        ir.item_name,
        ir.quantity,
        ir.justification,
        ir.status,
        ir.created_at,
        ir.assigned_to,
        ir.assigned_by,
        u.full_name as requested_by_name,
        reviewer.full_name as reviewed_by_name,
        assignee.full_name as assigned_to_name,
        assigner.full_name as assigned_by_name
      FROM item_requisitions ir
      LEFT JOIN users u ON ir.requested_by = u.id
      LEFT JOIN users reviewer ON ir.reviewed_by = reviewer.id
      LEFT JOIN users assignee ON ir.assigned_to = assignee.id
      LEFT JOIN users assigner ON ir.assigned_by = assigner.id
      WHERE ir.id = ?`,
      [requisitionId]
    );
    
    if (requisitions.length === 0) {
      throw new Error("Item requisition not found");
    }
    
    return requisitions[0];
  } catch (error) {
    console.error("Error fetching item requisition:", error);
    throw error;
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
        ir.assigned_to,
        ir.assigned_by,
        u.full_name as requested_by_name,
        reviewer.full_name as reviewed_by_name,
        assignee.full_name as assigned_to_name,
        assigner.full_name as assigned_by_name
      FROM item_requisitions ir
      LEFT JOIN users u ON ir.requested_by = u.id
      LEFT JOIN users reviewer ON ir.reviewed_by = reviewer.id
      LEFT JOIN users assignee ON ir.assigned_to = assignee.id
      LEFT JOIN users assigner ON ir.assigned_by = assigner.id
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
        ir.assigned_to,
        ir.assigned_by,
        u.full_name as requested_by_name,
        reviewer.full_name as reviewed_by_name,
        assignee.full_name as assigned_to_name,
        assigner.full_name as assigned_by_name
      FROM item_requisitions ir
      LEFT JOIN users u ON ir.requested_by = u.id
      LEFT JOIN users reviewer ON ir.reviewed_by = reviewer.id
      LEFT JOIN users assignee ON ir.assigned_to = assignee.id
      LEFT JOIN users assigner ON ir.assigned_by = assigner.id
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

export async function assignItemRequisition(requisitionId, assignedTo, assignedBy) {
  try {
    const [result] = await db.query(
      "UPDATE item_requisitions SET assigned_to = ?, assigned_by = ?, status = 'assigned' WHERE id = ?",
      [assignedTo, assignedBy, requisitionId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Item requisition not found");
    }
    
    return { success: true, message: "Item requisition assigned successfully" };
  } catch (error) {
    console.error("Error assigning item requisition:", error);
    throw error;
  }
}

export async function getAssignedRequisitions(userId) {
  try {
    const [requisitions] = await db.query(
      `SELECT 
        ir.id,
        ir.item_name,
        ir.quantity,
        ir.justification,
        ir.status,
        ir.created_at,
        ir.assigned_to,
        ir.assigned_by,
        u.full_name as requested_by_name,
        reviewer.full_name as reviewed_by_name,
        assignee.full_name as assigned_to_name,
        assigner.full_name as assigned_by_name
      FROM item_requisitions ir
      LEFT JOIN users u ON ir.requested_by = u.id
      LEFT JOIN users reviewer ON ir.reviewed_by = reviewer.id
      LEFT JOIN users assignee ON ir.assigned_to = assignee.id
      LEFT JOIN users assigner ON ir.assigned_by = assigner.id
      WHERE ir.assigned_to = ?
      ORDER BY ir.created_at DESC`,
      [userId]
    );
    
    return requisitions;
  } catch (error) {
    console.error("Error fetching assigned requisitions:", error);
    throw new Error("Failed to fetch assigned requisitions");
  }
}

export async function scheduleItemPickup(requisitionId, scheduledPickup, notes = null) {
  try {
    // First check if pickup already exists
    const [existingPickup] = await db.query(
      "SELECT id FROM item_pickups WHERE requisition_id = ?",
      [requisitionId]
    );
    
    if (existingPickup.length > 0) {
      // Update existing pickup
      await db.query(
        "UPDATE item_pickups SET scheduled_pickup = ?, notes = ? WHERE requisition_id = ?",
        [scheduledPickup, notes, requisitionId]
      );
    } else {
      // Create new pickup
      await db.query(
        "INSERT INTO item_pickups (requisition_id, scheduled_pickup, notes) VALUES (?, ?, ?)",
        [requisitionId, scheduledPickup, notes]
      );
    }
    
    return { success: true, message: "Pickup scheduled successfully" };
  } catch (error) {
    console.error("Error scheduling item pickup:", error);
    throw new Error("Failed to schedule pickup");
  }
}

export async function markItemAsDelivered(requisitionId, deliveredBy, notes = null) {
  try {
    // Update pickup record
    await db.query(
      "UPDATE item_pickups SET delivered_at = NOW(), delivered_by = ?, notes = ? WHERE requisition_id = ?",
      [deliveredBy, notes, requisitionId]
    );
    
    // Update requisition status to delivered
    await db.query(
      "UPDATE item_requisitions SET status = 'delivered' WHERE id = ?",
      [requisitionId]
    );
    
    return { success: true, message: "Item marked as delivered successfully" };
  } catch (error) {
    console.error("Error marking item as delivered:", error);
    throw new Error("Failed to mark item as delivered");
  }
}

export async function getPickupDetails(requisitionId) {
  try {
    const [pickups] = await db.query(
      `SELECT 
        ip.id,
        ip.requisition_id,
        ip.scheduled_pickup,
        ip.picked_up_at,
        ip.delivered_at,
        ip.notes,
        u.full_name as delivered_by_name
      FROM item_pickups ip
      LEFT JOIN users u ON ip.delivered_by = u.id
      WHERE ip.requisition_id = ?`,
      [requisitionId]
    );
    
    return pickups.length > 0 ? pickups[0] : null;
  } catch (error) {
    console.error("Error fetching pickup details:", error);
    throw new Error("Failed to fetch pickup details");
  }
} 