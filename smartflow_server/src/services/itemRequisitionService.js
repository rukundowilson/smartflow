import db from '../config/db.js';

// Helper function to record status changes
async function recordStatusChange(recordType, recordId, previousStatus, newStatus, changedBy) {
  try {
    await db.query(
      `INSERT INTO status_history (record_type, record_id, previous_status, new_status, changed_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [recordType, recordId, previousStatus, newStatus, changedBy]
    );
  } catch (error) {
    console.error("Error recording status change:", error);
    // Don't throw error here as it's not critical to the main operation
  }
}

export async function createItemRequisition(requisitionData) {
  try {
    const [result] = await db.query(
      "INSERT INTO item_requisitions (requested_by, item_name, quantity, justification) VALUES (?, ?, ?, ?)",
      [requisitionData.requested_by, requisitionData.item_name, requisitionData.quantity, requisitionData.justification]
    );
    
    const requisitionId = result.insertId;
    
    // Record initial status change
    await recordStatusChange('item_requisition', requisitionId, null, 'pending', requisitionData.requested_by);
    
    return { success: true, message: "Item requisition created successfully", requisitionId };
  } catch (error) {
    console.error("Error creating item requisition:", error);
    throw error;
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
        ir.reviewed_by,
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
        ir.reviewed_by,
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
        ir.reviewed_by,
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
    // Get current status before updating
    const [currentRequisition] = await db.query(
      "SELECT status FROM item_requisitions WHERE id = ?",
      [requisitionId]
    );
    
    if (currentRequisition.length === 0) {
      throw new Error("Item requisition not found");
    }
    
    const previousStatus = currentRequisition[0].status;
    
    // If approving and the requisition is already assigned, preserve the assignment
    if (status === 'approved') {
      // First check if the requisition is already assigned
      const [assignedRequisition] = await db.query(
        "SELECT assigned_to, assigned_by FROM item_requisitions WHERE id = ?",
        [requisitionId]
      );
      
      if (assignedRequisition.length > 0 && assignedRequisition[0].assigned_to) {
        // If already assigned, keep the assignment but update status to approved
        const [result] = await db.query(
          "UPDATE item_requisitions SET status = ?, reviewed_by = ? WHERE id = ?",
          [status, reviewedBy, requisitionId]
        );
        
        if (result.affectedRows === 0) {
          throw new Error("Item requisition not found");
        }
        
        // Record status change
        await recordStatusChange('item_requisition', requisitionId, previousStatus, status, reviewedBy);
        
        return { success: true, message: "Item requisition approved and assignment preserved" };
      }
    }
    
    // Default behavior for other status updates
    const [result] = await db.query(
      "UPDATE item_requisitions SET status = ?, reviewed_by = ? WHERE id = ?",
      [status, reviewedBy, requisitionId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error("Item requisition not found");
    }
    
    // Record status change
    await recordStatusChange('item_requisition', requisitionId, previousStatus, status, reviewedBy);
    
    return { success: true, message: "Item requisition status updated successfully" };
  } catch (error) {
    console.error("Error updating item requisition status:", error);
    throw error;
  }
}

export async function assignItemRequisition(requisitionId, assignedTo, assignedBy) {
  try {
    // First check current status
    const [currentRequisition] = await db.query(
      "SELECT status FROM item_requisitions WHERE id = ?",
      [requisitionId]
    );
    
    if (currentRequisition.length === 0) {
      throw new Error("Item requisition not found");
    }
    
    const currentStatus = currentRequisition[0].status;
    
    // If already approved, keep the approved status but add assignment
    if (currentStatus === 'approved') {
      const [result] = await db.query(
        "UPDATE item_requisitions SET assigned_to = ?, assigned_by = ? WHERE id = ?",
        [assignedTo, assignedBy, requisitionId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error("Item requisition not found");
      }
      
      return { success: true, message: "Item requisition assigned successfully (approved status preserved)" };
    } else {
      // For other statuses, change to assigned
      const [result] = await db.query(
        "UPDATE item_requisitions SET assigned_to = ?, assigned_by = ?, status = 'assigned' WHERE id = ?",
        [assignedTo, assignedBy, requisitionId]
      );
      
      if (result.affectedRows === 0) {
        throw new Error("Item requisition not found");
      }
      
      // Record status change to assigned
      await recordStatusChange('item_requisition', requisitionId, currentStatus, 'assigned', assignedBy);
      
      return { success: true, message: "Item requisition assigned successfully" };
    }
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
        ir.reviewed_by,
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
    
    // Update status to scheduled
    const [currentRequisition] = await db.query(
      "SELECT status FROM item_requisitions WHERE id = ?",
      [requisitionId]
    );
    
    if (currentRequisition.length > 0) {
      const previousStatus = currentRequisition[0].status;
      await db.query(
        "UPDATE item_requisitions SET status = 'scheduled' WHERE id = ?",
        [requisitionId]
      );
      
      // Record status change to scheduled
      await recordStatusChange('item_requisition', requisitionId, previousStatus, 'scheduled', null);
    }
    
    return { success: true, message: "Pickup scheduled successfully" };
  } catch (error) {
    console.error("Error scheduling item pickup:", error);
    throw new Error("Failed to schedule pickup");
  }
}

export async function markItemAsDelivered(requisitionId, deliveredBy, notes = null) {
  try {
    // First check if pickup record exists
    const [pickupRecord] = await db.query(
      "SELECT id FROM item_pickups WHERE requisition_id = ?",
      [requisitionId]
    );
    
    if (pickupRecord.length > 0) {
      // Update existing pickup record
      await db.query(
        "UPDATE item_pickups SET delivered_at = NOW(), delivered_by = ?, notes = ? WHERE requisition_id = ?",
        [deliveredBy, notes, requisitionId]
      );
    } else {
      // Create a new pickup record for delivery
      await db.query(
        "INSERT INTO item_pickups (requisition_id, delivered_at, delivered_by, notes) VALUES (?, NOW(), ?, ?)",
        [requisitionId, deliveredBy, notes]
      );
    }
    
    // Get current status before updating
    const [currentRequisition] = await db.query(
      "SELECT status FROM item_requisitions WHERE id = ?",
      [requisitionId]
    );
    
    if (currentRequisition.length === 0) {
      throw new Error("Item requisition not found");
    }
    
    const previousStatus = currentRequisition[0].status;
    
    // Update requisition status to delivered
    await db.query(
      "UPDATE item_requisitions SET status = 'delivered' WHERE id = ?",
      [requisitionId]
    );
    
    // Record status change to delivered
    await recordStatusChange('item_requisition', requisitionId, previousStatus, 'delivered', deliveredBy);
    
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
        ip.delivered_by,
        deliverer.full_name as delivered_by_name
      FROM item_pickups ip
      LEFT JOIN users deliverer ON ip.delivered_by = deliverer.id
      WHERE ip.requisition_id = ?`,
      [requisitionId]
    );
    
    return pickups.length > 0 ? pickups[0] : null;
  } catch (error) {
    console.error("Error fetching pickup details:", error);
    throw new Error("Failed to fetch pickup details");
  }
}

// New function to get status history for a requisition
export async function getStatusHistory(recordType, recordId) {
  try {
    const [history] = await db.query(
      `SELECT 
        sh.id,
        sh.previous_status,
        sh.new_status,
        sh.changed_at,
        sh.changed_by,
        u.full_name as changed_by_name
      FROM status_history sh
      LEFT JOIN users u ON sh.changed_by = u.id
      WHERE sh.record_type = ? AND sh.record_id = ?
      ORDER BY sh.changed_at DESC`,
      [recordType, recordId]
    );
    
    return history;
  } catch (error) {
    console.error("Error fetching status history:", error);
    throw new Error("Failed to fetch status history");
  }
} 