// routes/registration.routes.js
import {Router} from "express";
const router = Router();
import {registerUser,systemUsers, reviewRegistrationApplication} from '../controllers/userController.js';
import { loginController } from "../controllers/authController.js";
import { handleCreateTicket,getUserTickets } from "../controllers/ticketController.js";

router.post('/auth/signup', registerUser);
router.get('/users/dir', systemUsers);
router.post('/application/review', reviewRegistrationApplication);
router.post("/auth/signin",loginController);

router.post("/tickets/new", handleCreateTicket);
router.get("/tickets/get/:userId", getUserTickets);


export default router;