// routes/registration.routes.js
import express from 'express';
import { 
  registerUser,
  systemUsers,
  loginUser,
  reviewRegistrationApplication
} from '../controllers/userController.js';

import { 
  handleGetITUsers
} from '../controllers/itTicketController.js';



const router = express.Router();

// User Routes
router.post("/users", registerUser);
router.get("/users", systemUsers);

// Application Review Route
router.post("/application/review", reviewRegistrationApplication);

// Auth Routes moved to /api/auth

// IT Users Route
router.get("/users/it", handleGetITUsers);

export default router;