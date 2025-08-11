import db from '../config/db.js';
import { sendNotificationToUsers } from './notificationController.js';
import { sendAccessRevokedEmail } from '../services/emailService.js';

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

    // Get grant details with user and system info
    const [[grant]] = await connection.query(
      `SELECT sag.user_id, sag.system_id, sag.status, 
              u.email as user_email, u.full_name as user_name,
              s.name as system_name
       FROM system_access_grants sag
       JOIN users u ON sag.user_id = u.id
       JOIN systems s ON sag.system_id = s.id
       WHERE sag.id = ?`,
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

    // Send enhanced notification for /others/ users
    await sendEnhancedRevocationNotification(grant.user_id, grant.system_name, revocation_reason, revoked_by);

    // Send standard in-app notification to user
    try {
      await sendNotificationToUsers([grant.user_id], {
        type: 'access_revocation',
        title: 'System Access Revoked',
        message: `Your access to ${grant.system_name} has been revoked. Reason: ${revocation_reason || 'Access expiration'}`,
        sender_id: revoked_by,
        related_id: Number(grant_id),
        related_type: 'system_access_grant'
      });
    } catch (nerr) {
      console.warn('In-app notification failed (non-blocking):', nerr?.message || nerr);
    }

    // Send email notification
    try {
      await sendAccessRevokedEmail({
        to: grant.user_email,
        systemName: grant.system_name,
        reason: revocation_reason || 'Access expiration'
      });
      console.log(`Email notification sent to ${grant.user_email} for ${grant.system_name} access revocation`);
    } catch (eerr) {
      console.warn('Email notification failed (non-blocking):', eerr?.message || eerr);
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

// Get user's revoked grants
export async function getUserRevokedGrants(req, res) {
  try {
    const { userId } = req.params;

    const [rows] = await db.query(
      `SELECT 
        sag.id, sag.user_id, sag.system_id, sag.revoked_at, sag.revoked_by,
        sag.revocation_reason, sag.granted_at, sag.granted_by,
        sag.effective_from, sag.effective_until, sag.is_permanent,
        u.full_name AS user_name, u.email AS user_email,
        s.name AS system_name, s.description AS system_description,
        rb.full_name AS revoked_by_name,
        gb.full_name AS granted_by_name
       FROM system_access_grants sag
       JOIN users u ON sag.user_id = u.id
       JOIN systems s ON sag.system_id = s.id
       LEFT JOIN users rb ON sag.revoked_by = rb.id
       LEFT JOIN users gb ON sag.granted_by = gb.id
       WHERE sag.user_id = ? AND sag.status = 'revoked'
       ORDER BY sag.revoked_at DESC`,
      [userId]
    );

    res.json({ success: true, grants: rows });
  } catch (e) {
    console.error('Error fetching user revoked grants:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch user revoked grants' });
  }
}

// Check if user is in /others/ department
async function isUserInOthersDepartment(userId) {
  const connection = await db.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT udr.department_id, d.name as department_name
       FROM user_department_roles udr
       JOIN departments d ON udr.department_id = d.id
       WHERE udr.user_id = ? AND udr.status = 'active'`,
      [userId]
    );
    
    // Check if user has any role in a department that's not IT, HR, or Superadmin
    const othersDepartments = rows.filter(row => 
      !['IT Department', 'Human Resources', 'Superadmin', 'IT hod'].includes(row.department_name)
    );
    
    return othersDepartments.length > 0;
  } catch (error) {
    console.error('Error checking user department:', error);
    return false;
  } finally {
    connection.release();
  }
}

// Send enhanced notification for users in /others/ department
async function sendEnhancedRevocationNotification(userId, systemName, reason, revokedBy) {
  const isOthersUser = await isUserInOthersDepartment(userId);
  
  if (isOthersUser) {
    // Send enhanced notification for /others/ users
    try {
      await sendNotificationToUsers([userId], {
        type: 'access_revocation',
        title: '🔒 System Access Revoked',
        message: `Your access to ${systemName} has been revoked. Reason: ${reason || 'Access expiration'}. Please contact IT support if you need access again.`,
        sender_id: revokedBy,
        related_type: 'system_access_grant'
      });
      console.log(`Enhanced notification sent to /others/ user ${userId} for ${systemName} access revocation`);
    } catch (error) {
      console.warn('Enhanced notification failed:', error?.message || error);
    }
  }
} 