import { Router } from 'express';
import { streamNotifications, getUserNotifications, getUnreadCount, markAsRead } from '../controllers/notificationController.js';

const router = Router();

router.get('/stream/:userId', streamNotifications);
router.get('/user/:userId', getUserNotifications);
router.get('/unread-count/:userId', getUnreadCount);
router.put('/:id/read', markAsRead);

export default router; 