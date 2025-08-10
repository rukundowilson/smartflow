import express from 'express';
import { handleCreateComment, getTicketComments, getRequisitionComments, getSystemAccessRequestComments, handleDeleteComment } from '../controllers/commentController.js';

const router = express.Router();

router.post('/', handleCreateComment);
router.post('/create', handleCreateComment);
router.get('/ticket/:ticketId', getTicketComments);
router.get('/requisition/:requisitionId', getRequisitionComments);
router.get('/system-access-request/:requestId', getSystemAccessRequestComments);
router.delete('/:commentId', handleDeleteComment);

export default router; 