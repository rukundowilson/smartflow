import express from 'express';
import { getDashboardStats, getRecentActivities, getUserMetrics } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);
router.get('/recent-activities', getRecentActivities);
router.get('/activities', getRecentActivities);
router.get('/user-metrics', getUserMetrics);

export default router; 