import db from '../config/db.js';
import { sendNotificationToUsers } from './notificationController.js';

// Create a system access grant when a request is approved
export async function createSystemAccessGrant(req, res) {
  const connection = await db.getConnection();
  try {
    const { 
      user_id, 
      system_id, 
      granted_from_request_id, 
      granted_by, 
      effective_from, 
      effective_until, 
      is_permanent,
      scheduled_revocation_date 
    } = req.body;

    if (!user_id || !system_id || !granted_from_request_id || !granted_by) {
      connection.release();
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: user_id, system_id, granted_from_request_id, granted_by' 
      });
    }

    await connection.beginTransaction();

    // Check if user already has active access to this system
    const [existingGrants] = await connection.query(
      'SELECT id FROM system_access_grants WHERE user_id = ? AND system_id = ? AND status = "active"',
      [user_id, system_id]
    );

    if (existingGrants.length > 0) {
      connection.release();
      return res.status(400).json({ 
        success: false, 
        message: 'User already has active access to this system' 
      });
    }

    // Create the access grant
    const [result] = await connection.query(
      `INSERT INTO system_access_grants 
       (user_id, system_id, granted_from_request_id, granted_by, effective_from, effective_until, is_permanent, scheduled_revocation_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, system_id, granted_from_request_id, granted_by, effective_from, effective_until, !!is_permanent, scheduled_revocation_date]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({ 
      success: true, 
      message: 'System access grant created successfully',
      grant_id: result.insertId 
    });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('Error creating system access grant:', e);
    res.status(500).json({ success: false, message: 'Failed to create access grant' });
  }
}

// Get active system access grants with time remaining
export async function getActiveSystemAccessGrants(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT 
        sag.id, sag.user_id, sag.system_id, sag.granted_at, sag.granted_by,
        sag.effective_from, sag.effective_until, sag.is_permanent, sag.scheduled_revocation_date,
        sag.revocation_notification_sent, sag.status,
        u.full_name AS user_name, u.email AS user_email,
        s.name AS system_name, s.description AS system_description,
        gb.full_name AS granted_by_name,
        DATEDIFF(sag.effective_until, CURDATE()) AS days_remaining,
        TIMESTAMPDIFF(HOUR, NOW(), sag.scheduled_revocation_date) AS hours_until_revocation
       FROM system_access_grants sag
       JOIN users u ON sag.user_id = u.id
       JOIN systems s ON sag.system_id = s.id
       JOIN users gb ON sag.granted_by = gb.id
       WHERE sag.status = 'active'
       ORDER BY sag.scheduled_revocation_date ASC, sag.granted_at DESC`
    );

    res.json({ success: true, grants: rows });
  } catch (e) {
    console.error('Error fetching active system access grants:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch access grants' });
  }
}

// Get grants that need revocation notifications
export async function getGrantsNeedingRevocationNotification(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT 
        sag.id, sag.user_id, sag.system_id, sag.scheduled_revocation_date,
        sag.revocation_notification_sent,
        u.full_name AS user_name, u.email AS user_email,
        s.name AS system_name,
        TIMESTAMPDIFF(HOUR, NOW(), sag.scheduled_revocation_date) AS hours_until_revocation
       FROM system_access_grants sag
       JOIN users u ON sag.user_id = u.id
       JOIN systems s ON sag.system_id = s.id
       WHERE sag.status = 'active' 
         AND sag.scheduled_revocation_date IS NOT NULL
         AND sag.scheduled_revocation_date > NOW()
         AND sag.revocation_notification_sent = FALSE
         AND TIMESTAMPDIFF(HOUR, NOW(), sag.scheduled_revocation_date) <= 24
       ORDER BY sag.scheduled_revocation_date ASC`
    );

    res.json({ success: true, grants: rows });
  } catch (e) {
    console.error('Error fetching grants needing revocation notification:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch grants needing notification' });
  }
}

// Mark notification as sent for a grant
export async function markRevocationNotificationSent(req, res) {
  const connection = await db.getConnection();
  try {
    const { grant_id } = req.params;

    await connection.beginTransaction();

    await connection.query(
      'UPDATE system_access_grants SET revocation_notification_sent = TRUE WHERE id = ?',
      [grant_id]
    );

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Notification marked as sent' });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('Error marking notification as sent:', e);
    res.status(500).json({ success: false, message: 'Failed to mark notification as sent' });
  }
}

// Revoke system access
export async function revokeSystemAccess(req, res) {
  const connection = await db.getConnection();
  try {
    const { grant_id } = req.params;
    const { revoked_by, revocation_reason } = req.body;

    if (!revoked_by) {
      connection.release();
      return res.status(400).json({ success: false, message: 'revoked_by is required' });
    }

    await connection.beginTransaction();

    // Get grant details
    const [[grant]] = await connection.query(
      'SELECT user_id, system_id, status FROM system_access_grants WHERE id = ?',
      [grant_id]
    );

    if (!grant) {
      throw new Error('Grant not found');
    }

    if (grant.status !== 'active') {
      throw new Error('Grant is not active');
    }

    // Update grant status
    await connection.query(
      `UPDATE system_access_grants 
       SET status = 'revoked', revoked_at = NOW(), revoked_by = ?, revocation_reason = ?
       WHERE id = ?`,
      [revoked_by, revocation_reason, grant_id]
    );

    await connection.commit();
    connection.release();

    // Send notification to user
    try {
      await sendNotificationToUsers([grant.user_id], {
        type: 'access_revocation',
        title: 'System Access Revoked',
        message: `Your access to the system has been revoked.`,
        sender_id: revoked_by,
        related_id: Number(grant_id),
        related_type: 'system_access_grant'
      });
    } catch (nerr) {
      console.warn('Notification emit failed (non-blocking):', nerr?.message || nerr);
    }

    res.json({ success: true, message: 'System access revoked successfully' });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('Error revoking system access:', e);
    res.status(500).json({ success: false, message: e.message || 'Failed to revoke access' });
  }
}

// Schedule revocation for a grant
export async function scheduleRevocation(req, res) {
  const connection = await db.getConnection();
  try {
    const { grant_id } = req.params;
    const { scheduled_revocation_date, scheduled_by } = req.body;

    if (!scheduled_revocation_date || !scheduled_by) {
      connection.release();
      return res.status(400).json({ 
        success: false, 
        message: 'scheduled_revocation_date and scheduled_by are required' 
      });
    }

    await connection.beginTransaction();

    // Update grant with scheduled revocation
    await connection.query(
      `UPDATE system_access_grants 
       SET scheduled_revocation_date = ?, status = 'scheduled_for_revocation'
       WHERE id = ?`,
      [scheduled_revocation_date, grant_id]
    );

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Revocation scheduled successfully' });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('Error scheduling revocation:', e);
    res.status(500).json({ success: false, message: 'Failed to schedule revocation' });
  }
}

// Get revocation history
export async function getRevocationHistory(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT 
        sag.id, sag.user_id, sag.system_id, sag.revoked_at, sag.revoked_by,
        sag.revocation_reason, sag.granted_at, sag.granted_by,
        u.full_name AS user_name, u.email AS user_email,
        s.name AS system_name,
        rb.full_name AS revoked_by_name,
        gb.full_name AS granted_by_name
       FROM system_access_grants sag
       JOIN users u ON sag.user_id = u.id
       JOIN systems s ON sag.system_id = s.id
       LEFT JOIN users rb ON sag.revoked_by = rb.id
       LEFT JOIN users gb ON sag.granted_by = gb.id
       WHERE sag.status = 'revoked'
       ORDER BY sag.revoked_at DESC
       LIMIT 100`
    );

    res.json({ success: true, history: rows });
  } catch (e) {
    console.error('Error fetching revocation history:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch revocation history' });
  }
} 