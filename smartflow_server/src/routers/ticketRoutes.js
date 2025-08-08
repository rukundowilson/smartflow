import express from 'express';
import { handleCreateTicket, getUserTickets, handleGetAllTickets as handleGetAllTicketsUser, getTicketById } from '../controllers/ticketController.js';
import { handleGetAllTickets, handleUpdateTicketAssignment, handleUpdateTicketStatus, handleGetITUsers } from '../controllers/itTicketController.js';

const router = express.Router();

// User-facing
router.post('/', handleCreateTicket);
router.get('/user/:userId', getUserTickets);
// Legacy alias
router.get('/get/:userId', getUserTickets);
router.get('/all', handleGetAllTicketsUser);
router.get('/:ticketId', getTicketById);

// IT-facing
router.get('/', handleGetAllTickets);
router.put('/:ticketId/assign', handleUpdateTicketAssignment);
router.put('/:ticketId/status', handleUpdateTicketStatus);
router.get('/it/users', handleGetITUsers);

// IT-prefixed aliases (frontend expects these)
router.put('/it/:ticketId/assign', handleUpdateTicketAssignment);
router.put('/it/:ticketId/status', handleUpdateTicketStatus);

export default router; 