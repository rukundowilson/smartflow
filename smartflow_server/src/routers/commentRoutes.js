import express from 'express';
import { 
  handleCreateComment, 
  getTicketComments, 
  getRequisitionComments, 
  handleDeleteComment 
} from '../controllers/commentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Comment Routes
router.post("/create", verifyToken, handleCreateComment);
router.get("/ticket/:ticketId", verifyToken, getTicketComments);
router.get("/requisition/:requisitionId", verifyToken, getRequisitionComments);
router.delete("/:commentId", verifyToken, handleDeleteComment);

export default router; 