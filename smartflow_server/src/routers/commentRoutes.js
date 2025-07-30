import express from 'express';
import { 
  handleCreateComment, 
  getTicketComments, 
  getRequisitionComments, 
  handleDeleteComment 
} from '../controllers/commentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create a new comment
router.post('/create', authenticateToken, handleCreateComment);

// Get comments for a specific ticket
router.get('/ticket/:ticketId', authenticateToken, getTicketComments);

// Get comments for a specific requisition
router.get('/requisition/:requisitionId', authenticateToken, getRequisitionComments);

// Delete a comment
router.delete('/:commentId', authenticateToken, handleDeleteComment);

export default router; 