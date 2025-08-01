import express from 'express';
import {
  getDashboardStats,
  getRecentActivities
} from '../controllers/dashboardController.js';

const router = express.Router();

// Dashboard Routes
router.get("/stats", getDashboardStats);
router.get("/activities", getRecentActivities);

export default router; 