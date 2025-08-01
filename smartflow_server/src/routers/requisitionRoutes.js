import express from 'express';
import { 
  handleCreateItemRequisition, 
  handleGetUserItemRequisitions, 
  handleGetAllItemRequisitions,
  handleUpdateItemRequisitionStatus,
  handleGetItemRequisitionById,
  handleScheduleItemPickup,
  handleMarkItemAsDelivered,
  handleGetPickupDetails,
  handleAssignItemRequisition,
  handleGetAssignedRequisitions,
  handleGetStatusHistory
} from '../controllers/itemRequisitionController.js';

const router = express.Router();

// Item Requisition Routes
router.post("/new", handleCreateItemRequisition);
router.get("/user/:userId", handleGetUserItemRequisitions);
router.get("/all", handleGetAllItemRequisitions);
router.put("/:requisitionId/status", handleUpdateItemRequisitionStatus);
router.get("/:requisitionId", handleGetItemRequisitionById);
router.post("/:requisitionId/pickup", handleScheduleItemPickup);
router.post("/:requisitionId/deliver", handleMarkItemAsDelivered);
router.get("/:requisitionId/pickup", handleGetPickupDetails);
router.put("/:requisitionId/assign", handleAssignItemRequisition);
router.get("/assigned/:userId", handleGetAssignedRequisitions);

// Status History Routes
router.get("/status-history/:recordType/:recordId", handleGetStatusHistory);

export default router; 