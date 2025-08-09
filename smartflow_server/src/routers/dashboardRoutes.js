import express from 'express';
import { getDashboardStats, getRecentActivities } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/recent-activities', getRecentActivities);
// Add alias to match frontend service expecting /activities
router.get('/activities', getRecentActivities);

export default router; 