import express from 'express';
import { 
  handleCreateComment, 
  getTicketComments, 
  getRequisitionComments, 
  handleDeleteComment 
} from '../controllers/commentController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Comment Routes - making auth optional for now
router.post("/create", handleCreateComment);
router.get("/ticket/:ticketId", getTicketComments);
router.get("/requisition/:requisitionId", getRequisitionComments);
router.delete("/:commentId", handleDeleteComment);

export default router; 