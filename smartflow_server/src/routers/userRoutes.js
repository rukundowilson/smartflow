// routes/registration.routes.js
import express from 'express';
import { 
  registerUser,
  systemUsers,
  loginUser,
  reviewRegistrationApplication
} from '../controllers/userController.js';

import { 
  handleCreateTicket,
  getUserTickets,
  handleGetAllTickets
} from '../controllers/ticketController.js';

import { 
  handleGetAllTickets as handleGetAllITTickets,
  handleUpdateTicketAssignment,
  handleUpdateTicketStatus,
  handleGetITUsers
} from '../controllers/itTicketController.js';

import { 
  handleCreateItemRequisition, 
  handleGetUserItemRequisitions, 
  handleGetAllItemRequisitions,
  handleUpdateItemRequisitionStatus,
  handleGetItemRequisitionById,
  handleScheduleItemPickup,
  handleMarkItemAsDelivered,
  handleGetPickupDetails,
  handleAssignItemRequisition,
  handleGetAssignedRequisitions
} from '../controllers/itemRequisitionController.js';

import { 
  getDashboardStats,
  getRecentActivities
} from '../controllers/dashboardController.js';



const router = express.Router();

// User Routes
router.post("/users", registerUser);
router.get("/users", systemUsers);

// Application Review Route
router.post("/application/review", reviewRegistrationApplication);

// Auth Routes
router.post("/auth/login", loginUser);
router.post("/auth/signin", loginUser);
router.post("/auth/signup", registerUser);

// Ticket Routes
router.post("/tickets", handleCreateTicket);
router.get("/tickets/get/:userId", getUserTickets);
router.get("/tickets/all", handleGetAllTickets);
router.put("/tickets/:ticketId/assign", handleUpdateTicketAssignment);
router.put("/tickets/:ticketId/status", handleUpdateTicketStatus);

// Item Requisition Routes
router.post("/requisitions/new", handleCreateItemRequisition);
router.get("/requisitions/user/:userId", handleGetUserItemRequisitions);
router.get("/requisitions/all", handleGetAllItemRequisitions);
router.put("/requisitions/:requisitionId/status", handleUpdateItemRequisitionStatus);
router.get("/requisitions/:requisitionId", handleGetItemRequisitionById);
router.post("/requisitions/:requisitionId/pickup", handleScheduleItemPickup);
router.put("/requisitions/:requisitionId/deliver", handleMarkItemAsDelivered);
router.get("/requisitions/:requisitionId/pickup", handleGetPickupDetails);
router.put("/requisitions/:requisitionId/assign", handleAssignItemRequisition);
router.get("/requisitions/assigned/:userId", handleGetAssignedRequisitions);

// IT Users Route
router.get("/users/it", handleGetITUsers);

// Dashboard Routes
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/activities", getRecentActivities);

export default router;