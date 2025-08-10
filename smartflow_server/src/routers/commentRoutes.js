import express from 'express';
import { handleCreateComment, handleGetCommentsByTicketId, handleGetCommentsByRequisitionId, handleDeleteComment } from '../controllers/commentController.js';

const router = express.Router();

router.post('/', handleCreateComment);
router.post('/create', handleCreateComment);
router.get('/ticket/:ticketId', handleGetCommentsByTicketId);
router.get('/requisition/:requisitionId', handleGetCommentsByRequisitionId);
router.delete('/:commentId', handleDeleteComment);

export default router; 