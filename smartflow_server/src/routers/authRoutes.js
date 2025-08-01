import express from 'express';
import { loginUser, registerUser } from '../controllers/userController.js';

const router = express.Router();

// Auth Routes
router.post("/signin", loginUser);
router.post("/login", loginUser);
router.post("/signup", registerUser);

export default router; 