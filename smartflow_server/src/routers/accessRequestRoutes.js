import express from 'express';
import {
  handleCreateAccessRequest,
  handleGetUserAccessRequests,
  handleGetPendingAccessRequests,
  handleGetAllAccessRequests,
  handleGetApprovalHistory,
  handleApproveAccessRequest,
  handleRejectAccessRequest,
  handleGetAccessRequestById,
  handleITAssignment
} from '../controllers/accessRequestController.js';

const router = express.Router();

// Access Request Routes
router.post('/', handleCreateAccessRequest);
router.get('/user/:userId', handleGetUserAccessRequests);
router.get('/pending', handleGetPendingAccessRequests);
router.get('/all', handleGetAllAccessRequests);
router.get('/history', handleGetApprovalHistory);
router.get('/:requestId', handleGetAccessRequestById);
router.put('/:requestId/approve', handleApproveAccessRequest);
router.put('/:requestId/reject', handleRejectAccessRequest);
router.put('/:requestId/assign', handleITAssignment);

export default router; 