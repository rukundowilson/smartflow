import { 
  createItemRequisition, 
  getItemRequisitionsByUser, 
  getAllItemRequisitions,
  updateItemRequisitionStatus,
  getItemRequisitionById,
  scheduleItemPickup,
  markItemAsDelivered,
  getPickupDetails,
  assignItemRequisition,
  getAssignedRequisitions
} from "../services/itemRequisitionService.js";

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
    
    if (!['pending', 'approved', 'rejected', 'assigned', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'pending', 'approved', 'rejected', 'assigned', or 'delivered'"
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
    const { scheduledPickup, notes } = req.body;
    
    if (!requisitionId || !scheduledPickup) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: requisitionId, scheduledPickup"
      });
    }
    
    const result = await scheduleItemPickup(requisitionId, scheduledPickup, notes);
    
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
    const { deliveredBy, notes } = req.body;
    
    if (!requisitionId || !deliveredBy) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: requisitionId, deliveredBy"
      });
    }
    
    const result = await markItemAsDelivered(requisitionId, deliveredBy, notes);
    
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