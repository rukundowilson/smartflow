import express from 'express';
import { createSystemAccessRequest, getUserSystemAccessRequests, getPendingSystemAccessRequests, approveSystemAccessRequest, rejectSystemAccessRequest, getApprovedByApprover, getApprovedInDepartment, assignSystemAccessRequest } from '../controllers/systemAccessRequestController.js';

const router = express.Router();

// Create and list user system access requests
router.post('/', createSystemAccessRequest);
router.get('/user/:userId', getUserSystemAccessRequests);

// Pending for approvers (LM/HOD/IT HOD/IT Manager)
router.get('/pending', getPendingSystemAccessRequests);
// Approved by a specific approver
router.get('/approved-by', getApprovedByApprover);
// Department-wide approved (LM visibility)
router.get('/approved-department', getApprovedInDepartment);

// Approvals and IT Manager assignment
router.put('/:id/approve', approveSystemAccessRequest);
router.put('/:id/reject', rejectSystemAccessRequest);
router.put('/:id/assign', assignSystemAccessRequest);

export default router; 