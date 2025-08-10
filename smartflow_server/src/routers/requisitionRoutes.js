import express from 'express';
import {
  handleCreateItemRequisition,
  handleGetUserItemRequisitions,
  handleGetAllItemRequisitions,
  handleUpdateItemRequisitionStatus,
  handleAssignItemRequisition,
  handleGetAssignedRequisitions,
  handleScheduleItemPickup,
  handleMarkItemAsDelivered,
  handleGetItemRequisitionById,
  handleGetPickupDetails,
  handleGetStatusHistory
} from '../controllers/itemRequisitionController.js';

const router = express.Router();

router.post('/', handleCreateItemRequisition);
router.get('/user/:userId', handleGetUserItemRequisitions);
router.get('/', handleGetAllItemRequisitions);
router.get('/:requisitionId', handleGetItemRequisitionById);
router.put('/:requisitionId/status', handleUpdateItemRequisitionStatus);
router.put('/:requisitionId/assign', handleAssignItemRequisition);
router.get('/assigned/:userId', handleGetAssignedRequisitions);
router.post('/:requisitionId/schedule-pickup', handleScheduleItemPickup);
router.post('/:requisitionId/mark-delivered', handleMarkItemAsDelivered);
router.get('/:requisitionId/pickup-details', handleGetPickupDetails);
router.get('/history/:recordType/:recordId', handleGetStatusHistory);

export default router; 