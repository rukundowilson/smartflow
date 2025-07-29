// routes/registration.routes.js
import {Router} from "express";
const router = Router();
import {registerUser,systemUsers, reviewRegistrationApplication} from '../controllers/userController.js';
import { loginController } from "../controllers/authController.js";
import { handleCreateTicket,getUserTickets } from "../controllers/ticketController.js";
import { 
  handleCreateItemRequisition, 
  handleGetUserItemRequisitions, 
  handleGetAllItemRequisitions,
  handleUpdateItemRequisitionStatus,
  handleGetItemRequisitionById,
  handleScheduleItemPickup,
  handleMarkItemAsDelivered,
  handleGetPickupDetails
} from "../controllers/itemRequisitionController.js";
import {
  handleGetAllTickets,
  handleUpdateTicketAssignment,
  handleUpdateTicketStatus,
  handleGetITUsers
} from "../controllers/itTicketController.js";

router.post('/auth/signup', registerUser);
router.get('/users/dir', systemUsers);
router.post('/application/review', reviewRegistrationApplication);
router.post("/auth/signin",loginController);

router.post("/tickets/new", handleCreateTicket);
router.get("/tickets/get/:userId", getUserTickets);

// Item Requisition Routes
router.post("/requisitions/new", handleCreateItemRequisition);
router.get("/requisitions/user/:userId", handleGetUserItemRequisitions);
router.get("/requisitions/all", handleGetAllItemRequisitions);
router.get("/requisitions/:requisitionId", handleGetItemRequisitionById);
router.put("/requisitions/:requisitionId/status", handleUpdateItemRequisitionStatus);
router.post("/requisitions/:requisitionId/pickup", handleScheduleItemPickup);
router.put("/requisitions/:requisitionId/deliver", handleMarkItemAsDelivered);
router.get("/requisitions/:requisitionId/pickup", handleGetPickupDetails);

// IT Department Ticket Management Routes
router.get("/tickets/all", handleGetAllTickets);
router.put("/tickets/:ticketId/assign", handleUpdateTicketAssignment);
router.put("/tickets/:ticketId/status", handleUpdateTicketStatus);
router.get("/users/it", handleGetITUsers);

export default router;