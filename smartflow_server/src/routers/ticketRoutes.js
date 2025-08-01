import express from 'express';
import { 
  handleCreateTicket,
  getUserTickets,
  handleGetAllTickets,
  getTicketById
} from '../controllers/ticketController.js';

import { 
  handleGetAllTickets as handleGetAllITTickets,
  handleUpdateTicketAssignment,
  handleUpdateTicketStatus,
  handleGetITUsers
} from '../controllers/itTicketController.js';

const router = express.Router();

// Ticket Routes
router.post("/", handleCreateTicket);
router.get("/get/:userId", getUserTickets);
router.get("/all", handleGetAllTickets);
router.get("/:ticketId", getTicketById);

// IT Ticket Routes
router.get("/it/all", handleGetAllITTickets);
router.put("/it/:ticketId/assign", handleUpdateTicketAssignment);
router.put("/it/:ticketId/status", handleUpdateTicketStatus);

export default router; 