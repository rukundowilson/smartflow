import express from 'express';
import {
  handleCreateAccessRequest,
  handleGetUserAccessRequests,
  handleGetPendingAccessRequests,
  handleGetAllAccessRequests,
  handleGetApprovalHistory,
  handleApproveAccessRequest,
  handleRejectAccessRequest,
  handleITAssignment,
  handleGetAccessRequestById
} from '../controllers/accessRequestController.js';

const router = express.Router();

router.post('/', handleCreateAccessRequest);
router.get('/user/:userId', handleGetUserAccessRequests);
router.get('/pending', handleGetPendingAccessRequests);
router.get('/all', handleGetAllAccessRequests);
router.get('/approval-history', handleGetApprovalHistory);
router.get('/:requestId', handleGetAccessRequestById);
router.put('/:requestId/approve', handleApproveAccessRequest);
router.put('/:requestId/reject', handleRejectAccessRequest);
router.put('/:requestId/assign', handleITAssignment);

export default router; 