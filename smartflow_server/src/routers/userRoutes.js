import express from 'express';
import { registerUser, systemUsers, loginUser, reviewRegistrationApplication } from '../controllers/userController.js';
import { handleGetITUsers } from '../controllers/itTicketController.js';

const router = express.Router();

// Register new user
router.post('/register', registerUser);
// Login (legacy; primary login is in authRoutes)
router.post('/login', loginUser);
// List all users
router.get('/', systemUsers);
// Review registration application (approve/reject)
router.put('/applications/review', reviewRegistrationApplication);

// IT users (alias used by frontend)
router.get('/it', handleGetITUsers);

export default router; 