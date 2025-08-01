import express from 'express';
import {
  handleCreateAccessRequest,
  handleGetUserAccessRequests,
  handleGetPendingAccessRequests,
  handleApproveAccessRequest,
  handleRejectAccessRequest,
  handleGetAccessRequestById
} from '../controllers/accessRequestController.js';

const router = express.Router();

// Access Request Routes
router.post('/', handleCreateAccessRequest);
router.get('/user/:userId', handleGetUserAccessRequests);
router.get('/pending', handleGetPendingAccessRequests);
router.get('/:requestId', handleGetAccessRequestById);
router.put('/:requestId/approve', handleApproveAccessRequest);
router.put('/:requestId/reject', handleRejectAccessRequest);

export default router; 