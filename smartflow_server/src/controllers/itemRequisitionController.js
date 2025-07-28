import { 
  createItemRequisition, 
  getItemRequisitionsByUser, 
  getAllItemRequisitions,
  updateItemRequisitionStatus 
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
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'pending', 'approved', or 'rejected'"
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