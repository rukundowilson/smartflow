import express from 'express';
import {
  createSystemAccessGrant,
  getActiveSystemAccessGrants,
  getGrantsNeedingRevocationNotification,
  markRevocationNotificationSent,
  revokeSystemAccess,
  scheduleRevocation,
  getRevocationHistory,
  getUserRevokedGrants
} from '../controllers/systemAccessGrantController.js';

const router = express.Router();

// Create a system access grant
router.post('/', createSystemAccessGrant);

// Get active system access grants
router.get('/active', getActiveSystemAccessGrants);

// Get grants needing revocation notification
router.get('/needing-notification', getGrantsNeedingRevocationNotification);

// Mark notification as sent
router.patch('/:grant_id/mark-notification-sent', markRevocationNotificationSent);

// Revoke system access
router.patch('/:grant_id/revoke', revokeSystemAccess);

// Schedule revocation
router.patch('/:grant_id/schedule-revocation', scheduleRevocation);

// Get revocation history
router.get('/history', getRevocationHistory);

// Get user's revoked grants
router.get('/user/:userId/revoked', getUserRevokedGrants);

export default router; 