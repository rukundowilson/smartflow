import { 
  createItemRequisition, 
  getItemRequisitionById, 
  getItemRequisitionsByUser, 
  getAllItemRequisitions, 
  updateItemRequisitionStatus,
  assignItemRequisition,
  getAssignedRequisitions,
  scheduleItemPickup,
  markItemAsDelivered,
  getPickupDetails,
  getStatusHistory
} from '../services/itemRequisitionService.js';

export async function handleCreateItemRequisition(req, res) {
  try {
    const { requested_by, item_name, quantity, justification } = req.body;
    
    if (!requested_by || !item_name || !quantity || !justification) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: requested_by, item_name, quantity, justification" 
      });
    }
    
    const requisition = await createItemRequisition({
      requested_by,
      item_name,
      quantity,
      justification
    });
    
    res.status(201).json({
      success: true,
      message: "Item requisition created successfully",
      requisition
    });
  } catch (error) {
    console.error("Error creating item requisition:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create item requisition"
    });
  }
}

export async function handleGetUserItemRequisitions(req, res) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    const requisitions = await getItemRequisitionsByUser(userId);
    
    res.status(200).json({
      success: true,
      requisitions
    });
  } catch (error) {
    console.error("Error fetching user item requisitions:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch item requisitions"
    });
  }
}

export async function handleGetAllItemRequisitions(req, res) {
  try {
    const requisitions = await getAllItemRequisitions();
    
    res.status(200).json({
      success: true,
      requisitions
    });
  } catch (error) {
    console.error("Error fetching all item requisitions:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch item requisitions"
    });
  }
}

export async function handleUpdateItemRequisitionStatus(req, res) {
  try {
    const { requisitionId } = req.params;
    const { status, reviewed_by } = req.body;
    
    if (!requisitionId || !status || !reviewed_by) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: requisitionId, status, reviewed_by"
      });
    }
    
    if (!['pending', 'approved', 'rejected', 'assigned', 'scheduled', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'pending', 'approved', 'rejected', 'assigned', 'scheduled', or 'delivered'"
      });
    }
    
    const result = await updateItemRequisitionStatus(requisitionId, status, reviewed_by);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("Error updating item requisition status:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update item requisition status"
    });
  }
} 

export async function handleGetItemRequisitionById(req, res) {
  try {
    const { requisitionId } = req.params;
    
    if (!requisitionId) {
      return res.status(400).json({
        success: false,
        message: "Requisition ID is required"
      });
    }
    
    const requisition = await getItemRequisitionById(requisitionId);
    
    res.status(200).json({
      success: true,
      requisition
    });
  } catch (error) {
    console.error("Error fetching item requisition:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch item requisition"
    });
  }
}

export async function handleAssignItemRequisition(req, res) {
  try {
    const { requisitionId } = req.params;
    const { assignedTo, assignedBy } = req.body;
    
    if (!requisitionId || !assignedTo || !assignedBy) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: requisitionId, assignedTo, assignedBy"
      });
    }
    
    const result = await assignItemRequisition(requisitionId, assignedTo, assignedBy);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("Error assigning item requisition:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to assign item requisition"
    });
  }
}

export async function handleGetAssignedRequisitions(req, res) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    const requisitions = await getAssignedRequisitions(userId);
    
    res.status(200).json({
      success: true,
      requisitions
    });
  } catch (error) {
    console.error("Error fetching assigned requisitions:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch assigned requisitions"
    });
  }
}

export async function handleScheduleItemPickup(req, res) {
  try {
    const { requisitionId } = req.params;
    const { scheduled_pickup, notes } = req.body;
    
    if (!requisitionId || !scheduled_pickup) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: requisitionId, scheduled_pickup"
      });
    }
    
    const result = await scheduleItemPickup(requisitionId, scheduled_pickup, notes);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("Error scheduling item pickup:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to schedule pickup"
    });
  }
}

export async function handleMarkItemAsDelivered(req, res) {
  try {
    const { requisitionId } = req.params;
    const { delivered_by, notes } = req.body;
    
    if (!requisitionId || !delivered_by) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: requisitionId, delivered_by"
      });
    }
    
    const result = await markItemAsDelivered(requisitionId, delivered_by, notes);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("Error marking item as delivered:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark item as delivered"
    });
  }
}

export async function handleGetPickupDetails(req, res) {
  try {
    const { requisitionId } = req.params;
    
    if (!requisitionId) {
      return res.status(400).json({
        success: false,
        message: "Requisition ID is required"
      });
    }
    
    const pickupDetails = await getPickupDetails(requisitionId);
    
    res.status(200).json({
      success: true,
      pickupDetails
    });
  } catch (error) {
    console.error("Error fetching pickup details:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch pickup details"
    });
  }
} 

export async function handleGetStatusHistory(req, res) {
  try {
    const { recordType, recordId } = req.params;
    
    if (!recordType || !recordId) {
      return res.status(400).json({
        success: false,
        message: "Record type and record ID are required"
      });
    }
    
    const history = await getStatusHistory(recordType, recordId);
    
    res.status(200).json({
      success: true,
      history
    });
  } catch (error) {
    console.error("Error fetching status history:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch status history"
    });
  }
} 