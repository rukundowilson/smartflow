import db from '../config/db.js';
import { sendNotificationToUsers } from './notificationController.js';
import { sendAccessGrantedEmail } from '../services/emailService.js';

export async function createSystemAccessRequest(req, res) {
  try {
    const { user_id, system_id, justification, start_date, end_date, is_permanent } = req.body;

    if (!user_id || !system_id || !justification || !start_date) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate user
    const [users] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(400).json({ success: false, message: `User with ID ${user_id} does not exist` });
    }

    // Validate system
    const [systems] = await db.query('SELECT id FROM systems WHERE id = ?', [system_id]);
    if (systems.length === 0) {
      return res.status(400).json({ success: false, message: `System with ID ${system_id} does not exist` });
    }

    const [result] = await db.query(
      `INSERT INTO system_access_requests (user_id, system_id, justification, start_date, end_date, is_permanent, status)
       VALUES (?, ?, ?, ?, ?, ?, 'request_pending')`,
      [user_id, system_id, justification, start_date, end_date || null, !!is_permanent]
    );

    // Fetch requester and system names
    const [[userRow]] = await db.query('SELECT full_name FROM users WHERE id = ?', [user_id]);
    const [[sysRow]] = await db.query('SELECT name FROM systems WHERE id = ?', [system_id]);

    // Find Line Managers in same department(s)
    const [lmRows] = await db.query(
      `SELECT DISTINCT appr_udr.user_id AS user_id
       FROM user_department_roles req_udr
       JOIN user_department_roles appr_udr ON appr_udr.department_id = req_udr.department_id
       JOIN roles appr_role ON appr_role.id = appr_udr.role_id
       WHERE req_udr.user_id = ?
         AND req_udr.status = 'active'
         AND appr_udr.status = 'active'
         AND appr_role.name = 'Line Manager'`,
      [user_id]
    );
    const lmRecipientIds = lmRows.map(r => r.user_id);

    // Notify LMs about new request
    await sendNotificationToUsers(lmRecipientIds, {
      type: 'access_request',
      title: 'New System Access Request',
      message: `${userRow?.full_name || 'An employee'} requested access to ${sysRow?.name || 'a system'}`,
      sender_id: user_id,
      related_id: result.insertId,
      related_type: 'system_access_request'
    });

    res.status(201).json({ success: true, message: 'Request submitted', request_id: result.insertId });
  } catch (e) {
    console.error('Error creating system access request:', e);
    res.status(500).json({ success: false, message: 'Failed to submit request' });
  }
}

export async function getUserSystemAccessRequests(req, res) {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      `SELECT r.id, r.user_id, r.system_id, r.justification, r.start_date, r.end_date, r.is_permanent,
               r.status, r.submitted_at,
               r.line_manager_id, r.line_manager_at, r.hod_id, r.hod_at,
               s.name as system_name, s.description as system_description
        FROM system_access_requests r
        JOIN systems s ON r.system_id = s.id
        WHERE r.user_id = ?
        ORDER BY r.submitted_at DESC
        LIMIT 50`,
       [userId]
     );
     res.json({ success: true, requests: rows });
   } catch (e) {
     console.error('Error fetching system access requests:', e);
     if (e && (e.code === 'ER_USER_LIMIT_REACHED' || e.errno === 1226)) {
       return res.status(503).json({ success: false, message: 'Database connection limit reached. Please retry shortly.' });
     }
     res.status(500).json({ success: false, message: 'Failed to fetch requests' });
   }
 }

// List pending system access requests for an approver (Line Manager / HOD)
export async function getPendingSystemAccessRequests(req, res) {
  try {
    const { approver_id, approver_role } = req.query;

    if (!approver_id || !approver_role) {
      return res.status(400).json({ success: false, message: 'approver_id and approver_role are required' });
    }

    let statusFilter = '';
    let roleName = '';

    if (approver_role === 'Line Manager') {
      // LM sees requests that are newly submitted and awaiting LM review
      statusFilter = "r.status IN ('request_pending','line_manager_pending')";
      roleName = 'Line Manager';
    } else if (approver_role === 'HOD') {
      // HOD sees only after LM approval
      statusFilter = "r.status = 'hod_pending'";
      roleName = 'HOD';
    } else if (approver_role === 'IT HOD') {
      const [rows] = await db.query(
        `SELECT r.*, s.name AS system_name, s.description AS system_description,
                u.full_name AS user_name, u.email AS user_email
         FROM system_access_requests r
         JOIN systems s ON r.system_id = s.id
         JOIN users u ON r.user_id = u.id
         WHERE r.status = 'it_hod_pending'
         ORDER BY r.submitted_at DESC`
      );
      return res.json({ success: true, requests: rows });
    } else if (approver_role === 'IT Manager') {
      const [rows] = await db.query(
        `SELECT r.*, s.name AS system_name, s.description AS system_description,
                u.full_name AS user_name, u.email AS user_email,
                d.name AS department_name, rr.name AS role_name,
                its.full_name AS it_support_name
         FROM system_access_requests r
         JOIN systems s ON r.system_id = s.id
         JOIN users u ON r.user_id = u.id
         LEFT JOIN (
           SELECT udr1.*
           FROM user_department_roles udr1
           WHERE udr1.status = 'active'
           AND udr1.assigned_at = (
             SELECT MAX(assigned_at) FROM user_department_roles m
             WHERE m.user_id = udr1.user_id AND m.status = 'active'
           )
         ) audr ON audr.user_id = u.id
         LEFT JOIN departments d ON d.id = audr.department_id
         LEFT JOIN roles rr ON rr.id = audr.role_id
         LEFT JOIN users its ON its.id = r.it_support_id
         WHERE r.status = 'it_manager_pending'
         ORDER BY r.submitted_at DESC`
      );
      return res.json({ success: true, requests: rows });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid approver_role. Use Line Manager, HOD, IT HOD or IT Manager' });
    }

    // Department-based visibility: requester and approver must share a department where the approver holds the right role
    const query = `
      SELECT r.*, s.name AS system_name, s.description AS system_description,
             u.full_name AS user_name, u.email AS user_email,
             d.name AS department_name, rr.name AS role_name
      FROM system_access_requests r
      JOIN systems s ON r.system_id = s.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN (
        SELECT udr1.*
        FROM user_department_roles udr1
        WHERE udr1.status = 'active'
        AND udr1.assigned_at = (
          SELECT MAX(assigned_at) FROM user_department_roles m
          WHERE m.user_id = udr1.user_id AND m.status = 'active'
        )
      ) audr ON audr.user_id = u.id
      LEFT JOIN departments d ON d.id = audr.department_id
      LEFT JOIN roles rr ON rr.id = audr.role_id
      WHERE ${statusFilter}
        AND EXISTS (
          SELECT 1
          FROM user_department_roles req_udr
          JOIN user_department_roles appr_udr
            ON appr_udr.department_id = req_udr.department_id
          JOIN roles appr_role
            ON appr_role.id = appr_udr.role_id
          WHERE req_udr.user_id = r.user_id
            AND appr_udr.user_id = ?
            AND appr_role.name = ?
            AND req_udr.status = 'active'
            AND appr_udr.status = 'active'
        )
      ORDER BY r.submitted_at DESC
    `;

    const [rows] = await db.query(query, [approver_id, roleName]);

    res.json({ success: true, requests: rows });
  } catch (e) {
    console.error('Error fetching pending system access requests:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch pending requests' });
  }
}

// Approve a system access request (LM -> HOD, HOD -> IT HOD)
export async function approveSystemAccessRequest(req, res) {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { approver_id, approver_role, comment } = req.body || {};

    if (!approver_id || !approver_role) {
      connection.release();
      return res.status(400).json({ success: false, message: 'approver_id and approver_role are required' });
    }

    await connection.beginTransaction();

    const [[reqRow]] = await connection.query('SELECT status FROM system_access_requests WHERE id = ?', [id]);
    if (!reqRow) {
      throw new Error('Request not found');
    }

    const currentStatus = reqRow.status;
    let nextStatus = '';
    let stageColumnSets = '';

    if (approver_role === 'Line Manager' && currentStatus === 'request_pending') {
      nextStatus = 'hod_pending';
      stageColumnSets = 'line_manager_id = ?, line_manager_at = NOW()';
    } else if (approver_role === 'HOD' && currentStatus === 'hod_pending') {
      nextStatus = 'it_hod_pending';
      stageColumnSets = 'hod_id = ?, hod_at = NOW()';
    } else if (approver_role === 'IT HOD' && currentStatus === 'it_hod_pending') {
      nextStatus = 'it_manager_pending';
      stageColumnSets = 'it_hod_id = ?, it_hod_at = NOW()';
    } else {
      throw new Error('Invalid stage transition for this approver');
    }

    await connection.query(
      `UPDATE system_access_requests
       SET status = ?, ${stageColumnSets}
       WHERE id = ?`,
      [nextStatus, approver_id, id]
    );

    // Persist approver comment if provided
    if (comment && comment.trim()) {
      try {
        await connection.query(
          `INSERT INTO comments (comment_type, commented_id, commented_by, content)
           VALUES ('system_access_request', ?, ?, ?)`,
          [id, approver_id, comment.trim()]
        );
      } catch (insertErr) {
        console.warn('Warning: failed to insert approval comment (non-blocking):', insertErr?.message || insertErr);
      }
    }

    await connection.commit();
    connection.release();

    // After approval, send notifications
    try {
      const [[info]] = await db.query(
        `SELECT r.user_id, s.name AS system_name, u.full_name AS user_name
         FROM system_access_requests r
         JOIN systems s ON s.id = r.system_id
         JOIN users u ON u.id = r.user_id
         WHERE r.id = ?`,
        [id]
      );

      // Notify requester that their request moved forward
      await sendNotificationToUsers([info?.user_id], {
        type: 'access_request',
        title: 'Access Request Updated',
        message: `Your request for ${info?.system_name || 'a system'} was approved by ${approver_role}.`,
        sender_id: approver_id,
        related_id: Number(id),
        related_type: 'system_access_request'
      });

      // Notify next approver group
      if (nextStatus === 'hod_pending') {
        // Notify HODs in same department(s)
        const [hodRows] = await db.query(
          `SELECT DISTINCT appr_udr.user_id AS user_id
           FROM user_department_roles req_udr
           JOIN user_department_roles appr_udr ON appr_udr.department_id = req_udr.department_id
           JOIN roles appr_role ON appr_role.id = appr_udr.role_id
           JOIN system_access_requests r ON r.user_id = req_udr.user_id
           WHERE r.id = ?
             AND req_udr.status = 'active'
             AND appr_udr.status = 'active'
             AND appr_role.name = 'HOD'`,
          [id]
        );
        const hodRecipientIds = hodRows.map(r => r.user_id);
        await sendNotificationToUsers(hodRecipientIds, {
          type: 'access_request',
          title: 'Approval Required: System Access',
          message: `${info?.user_name || 'An employee'}'s request for ${info?.system_name || 'a system'} is awaiting your review.`,
          sender_id: approver_id,
          related_id: Number(id),
          related_type: 'system_access_request'
        });
      }
    } catch (nerr) {
      console.warn('Notification emit failed (non-blocking):', nerr?.message || nerr);
    }

    res.json({ success: true, message: 'Request approved', next_status: nextStatus });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('Error approving system access request:', e);
    res.status(500).json({ success: false, message: e.message || 'Failed to approve request' });
  }
}

// Reject a system access request (LM/HOD)
export async function rejectSystemAccessRequest(req, res) {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { approver_id, approver_role, rejection_reason, comment } = req.body || {};

    if (!approver_id || !approver_role) {
      connection.release();
      return res.status(400).json({ success: false, message: 'approver_id and approver_role are required' });
    }

    await connection.beginTransaction();

    const [[reqRow]] = await connection.query('SELECT status FROM system_access_requests WHERE id = ?', [id]);
    if (!reqRow) {
      throw new Error('Request not found');
    }

    // Mark rejected and capture which stage rejected
    let stageColumnSets = '';
    if (approver_role === 'Line Manager') {
      stageColumnSets = 'line_manager_id = ?, line_manager_at = NOW()';
    } else if (approver_role === 'HOD') {
      stageColumnSets = 'hod_id = ?, hod_at = NOW()';
    } else if (approver_role === 'IT HOD') {
      stageColumnSets = 'it_hod_id = ?, it_hod_at = NOW()';
    } else if (approver_role === 'IT Manager') {
      stageColumnSets = 'it_manager_id = ?, it_manager_at = NOW()';
    } else {
      throw new Error('Invalid approver_role');
    }

    await connection.query(
      `UPDATE system_access_requests
       SET status = 'rejected', ${stageColumnSets}
       WHERE id = ?`,
      [approver_id, id]
    );

    // Persist rejection reason/comment if provided
    const contentParts = [];
    if (rejection_reason && rejection_reason.trim()) contentParts.push(`Rejection reason: ${rejection_reason.trim()}`);
    if (comment && comment.trim()) contentParts.push(`Note: ${comment.trim()}`);
    const content = contentParts.join(' \n ');
    if (content) {
      try {
        await connection.query(
          `INSERT INTO comments (comment_type, commented_id, commented_by, content)
           VALUES ('system_access_request', ?, ?, ?)`,
          [id, approver_id, content]
        );
      } catch (insertErr) {
        console.warn('Warning: failed to insert rejection comment (non-blocking):', insertErr?.message || insertErr);
      }
    }

    await connection.commit();
    connection.release();

    res.json({ success: true, message: 'Request rejected' });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('Error rejecting system access request:', e);
    res.status(500).json({ success: false, message: e.message || 'Failed to reject request' });
  }
}

// IT Manager assignment: move to IT support review and optionally assign support
export async function assignSystemAccessRequest(req, res) {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { approver_id, assigned_user_id, comment } = req.body || {};

    if (!approver_id) {
      connection.release();
      return res.status(400).json({ success: false, message: 'approver_id is required' });
    }

    await connection.beginTransaction();

    const [[reqRow]] = await connection.query('SELECT status FROM system_access_requests WHERE id = ?', [id]);
    if (!reqRow) {
      throw new Error('Request not found');
    }
    if (reqRow.status !== 'it_manager_pending') {
      throw new Error('Only requests pending IT Manager can be assigned');
    }

    // Update status and stamp IT Manager
    await connection.query(
      `UPDATE system_access_requests
       SET status = 'it_support_review', it_manager_id = ?, it_manager_at = NOW(), it_support_id = ?
       WHERE id = ?`,
      [approver_id, assigned_user_id || null, id]
    );

    // Persist assignment comment if provided
    if (comment && comment.trim()) {
      try {
        await connection.query(
          `INSERT INTO comments (comment_type, commented_id, commented_by, content)
           VALUES ('system_access_request', ?, ?, ?)`,
          [id, approver_id, `Assignment: ${comment.trim()}`]
        );
      } catch (insertErr) {
        console.warn('Warning: failed to insert assignment comment (non-blocking):', insertErr?.message || insertErr);
      }
    }

    await connection.commit();
    connection.release();

    // Notify IT support assignee or group
    try {
      const [[info]] = await db.query(
        `SELECT r.user_id, s.name AS system_name, u.full_name AS requester_name
         FROM system_access_requests r
         JOIN systems s ON s.id = r.system_id
         JOIN users u ON u.id = r.user_id
         WHERE r.id = ?`,
        [id]
      );
      if (assigned_user_id) {
        await sendNotificationToUsers([assigned_user_id], {
          type: 'access_request',
          title: 'Access Request Assigned',
          message: `You have been assigned to review access for ${info?.requester_name || 'a user'} on ${info?.system_name || 'a system'}.`,
          sender_id: approver_id,
          related_id: Number(id),
          related_type: 'system_access_request'
        });
      } else {
        // notify IT Support role users when unassigned in queue
        const [rows] = await db.query(
          `SELECT DISTINCT udr.user_id AS id
           FROM user_department_roles udr
           JOIN roles r ON r.id = udr.role_id
           WHERE udr.status = 'active' AND r.name = 'IT Support'`
        );
        const recipients = Array.isArray(rows) ? rows.map(r => r.id).filter(Boolean) : [];
        if (recipients.length > 0) {
          await sendNotificationToUsers(recipients, {
            type: 'access_request',
            title: 'Access Request Needs Assignment',
            message: `A request for ${info?.system_name || 'a system'} by ${info?.requester_name || 'a user'} needs IT assignment.`,
            sender_id: approver_id,
            related_id: Number(id),
            related_type: 'system_access_request'
          });
        }
      }
    } catch (nerr) {
      console.warn('assignment notification failed:', nerr?.message || nerr);
    }

    res.json({ success: true, message: 'Request assigned to IT support', next_status: 'it_support_review' });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('Error assigning system access request:', e);
    res.status(500).json({ success: false, message: e.message || 'Failed to assign request' });
  }
}

// List requests already acted on by an approver (LM/HOD)
export async function getApprovedByApprover(req, res) {
  try {
    const { approver_id, approver_role } = req.query;
    if (!approver_id || !approver_role) {
      return res.status(400).json({ success: false, message: 'approver_id and approver_role are required' });
    }

    let whereClause = '';
    let orderExpr = '';
    if (approver_role === 'Line Manager') {
      whereClause = 'r.line_manager_id = ? AND r.line_manager_at IS NOT NULL';
      orderExpr = 'COALESCE(r.line_manager_at, r.submitted_at)';
    } else if (approver_role === 'HOD') {
      whereClause = 'r.hod_id = ? AND r.hod_at IS NOT NULL';
      orderExpr = 'COALESCE(r.hod_at, r.submitted_at)';
    } else if (approver_role === 'IT HOD') {
      whereClause = 'r.it_hod_id = ? AND r.it_hod_at IS NOT NULL';
      orderExpr = 'COALESCE(r.it_hod_at, r.submitted_at)';
    } else if (approver_role === 'IT Manager') {
      whereClause = 'r.it_manager_id = ? AND r.it_manager_at IS NOT NULL';
      orderExpr = 'COALESCE(r.it_manager_at, r.submitted_at)';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid approver_role. Use Line Manager, HOD, IT HOD, or IT Manager' });
    }

          const query = `
        SELECT r.*, s.name AS system_name, s.description AS system_description,
               u.full_name AS user_name, u.email AS user_email,
               d.name AS department_name, rr.name AS role_name,
               lm.full_name AS line_manager_name, hod.full_name AS hod_name,
               its.full_name AS it_support_name
        FROM system_access_requests r
        JOIN systems s ON r.system_id = s.id
        JOIN users u ON r.user_id = u.id
        LEFT JOIN (
          SELECT udr1.*
          FROM user_department_roles udr1
          WHERE udr1.status = 'active'
          AND udr1.assigned_at = (
            SELECT MAX(assigned_at) FROM user_department_roles m
            WHERE m.user_id = udr1.user_id AND m.status = 'active'
          )
        ) audr ON audr.user_id = u.id
        LEFT JOIN departments d ON d.id = audr.department_id
        LEFT JOIN roles rr ON rr.id = audr.role_id
        LEFT JOIN users lm ON lm.id = r.line_manager_id
        LEFT JOIN users hod ON hod.id = r.hod_id
        LEFT JOIN users its ON its.id = r.it_support_id
        WHERE ${whereClause}
        ORDER BY ${orderExpr} DESC
      `;

    const [rows] = await db.query(query, [approver_id]);
    res.json({ success: true, requests: rows });
  } catch (e) {
    console.error('Error fetching approved-by-approver system access requests:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
}

// LM department-wide approved list
export async function getApprovedInDepartment(req, res) {
  try {
    const { approver_id } = req.query;
    if (!approver_id) {
      return res.status(400).json({ success: false, message: 'approver_id is required' });
    }

    const query = `
      SELECT r.*, s.name AS system_name, s.description AS system_description,
             u.full_name AS user_name, u.email AS user_email,
             lm.full_name AS line_manager_name, hod.full_name AS hod_name
      FROM system_access_requests r
      JOIN systems s ON r.system_id = s.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN users lm ON lm.id = r.line_manager_id
      LEFT JOIN users hod ON hod.id = r.hod_id
      WHERE r.line_manager_at IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM user_department_roles req_udr
          JOIN user_department_roles lm_udr
            ON lm_udr.department_id = req_udr.department_id
          JOIN roles lm_role ON lm_role.id = lm_udr.role_id
          WHERE req_udr.user_id = r.user_id
            AND lm_udr.user_id = ?
            AND lm_role.name = 'Line Manager'
            AND req_udr.status = 'active'
            AND lm_udr.status = 'active'
        )
      ORDER BY COALESCE(r.line_manager_at, r.submitted_at) DESC
    `;
    const [rows] = await db.query(query, [approver_id]);
    res.json({ success: true, requests: rows });
  } catch (e) {
    console.error('Error fetching department-approved system access requests:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch requests' });
  }
}

export async function getITSupportQueue(req, res) {
  try {
    const { user_id } = req.query;
    const userIdNum = Number(user_id) || 0;

    const query = `
      SELECT r.*, s.name AS system_name, s.description AS system_description,
             u.full_name AS user_name, u.email AS user_email,
             d.name AS department_name, rr.name AS role_name,
             its.full_name AS it_support_name
      FROM system_access_requests r
      JOIN systems s ON r.system_id = s.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN (
        SELECT udr1.*
        FROM user_department_roles udr1
        WHERE udr1.status = 'active'
        AND udr1.assigned_at = (
          SELECT MAX(assigned_at) FROM user_department_roles m
          WHERE m.user_id = udr1.user_id AND m.status = 'active'
        )
      ) audr ON audr.user_id = u.id
      LEFT JOIN departments d ON d.id = audr.department_id
      LEFT JOIN roles rr ON rr.id = audr.role_id
      LEFT JOIN users its ON its.id = r.it_support_id
      WHERE r.status IN ('it_support_review','granted','rejected')
      ORDER BY r.submitted_at DESC
    `;

    const [rows] = await db.query(query);
    res.json({ success: true, requests: rows });
  } catch (e) {
    console.error('Error fetching IT support queue:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch IT support queue' });
  }
}

// Completed requests (granted or rejected) regardless of assignee
export async function getCompletedSystemAccessRequests(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT r.*, s.name AS system_name, s.description AS system_description,
              u.full_name AS user_name, u.email AS user_email,
              d.name AS department_name, rr.name AS role_name,
              its.full_name AS it_support_name,
              lm.full_name AS line_manager_name,
              hod.full_name AS hod_name,
              ith.full_name AS it_hod_name,
              itm.full_name AS it_manager_name
       FROM system_access_requests r
       JOIN systems s ON r.system_id = s.id
       JOIN users u ON r.user_id = u.id
       LEFT JOIN (
         SELECT udr1.*
         FROM user_department_roles udr1
         WHERE udr1.status = 'active'
         AND udr1.assigned_at = (
           SELECT MAX(assigned_at) FROM user_department_roles m
           WHERE m.user_id = udr1.user_id AND m.status = 'active'
         )
       ) audr ON audr.user_id = u.id
       LEFT JOIN departments d ON d.id = audr.department_id
       LEFT JOIN roles rr ON rr.id = audr.role_id
       LEFT JOIN users its ON its.id = r.it_support_id
       LEFT JOIN users lm ON lm.id = r.line_manager_id
       LEFT JOIN users hod ON hod.id = r.hod_id
       LEFT JOIN users ith ON ith.id = r.it_hod_id
       LEFT JOIN users itm ON itm.id = r.it_manager_id
       WHERE r.status IN ('granted','rejected')
       ORDER BY COALESCE(r.it_support_at, r.submitted_at) DESC`
    );
    res.json({ success: true, requests: rows });
  } catch (e) {
    console.error('Error fetching completed system access requests:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch completed requests' });
  }
}

// IT Support: mark a request as granted
export async function itSupportGrantSystemAccessRequest(req, res) {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { user_id, comment } = req.body || {};

    if (!user_id) {
      connection.release();
      return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    await connection.beginTransaction();

    const [[row]] = await connection.query('SELECT status FROM system_access_requests WHERE id = ?', [id]);
    if (!row) {
      throw new Error('Request not found');
    }
    if (row.status !== 'it_support_review') {
      throw new Error('Only requests in it_support_review can be granted');
    }

    await connection.query(
      `UPDATE system_access_requests
       SET status = 'granted', it_support_id = COALESCE(it_support_id, ?), it_support_at = NOW()
       WHERE id = ?`,
      [user_id, id]
    );

    if (comment && comment.trim()) {
      try {
        await connection.query(
          `INSERT INTO comments (comment_type, commented_id, commented_by, content)
           VALUES ('system_access_request', ?, ?, ?)`,
          [id, user_id, comment.trim()]
        );
      } catch (insertErr) {
        console.warn('Warning: failed to insert IT support grant comment (non-blocking):', insertErr?.message || insertErr);
      }
    }

    await connection.commit();
    connection.release();

    try {
      const [[info]] = await db.query(
        `SELECT r.user_id, s.name AS system_name, u.email AS user_email
         FROM system_access_requests r
         JOIN systems s ON s.id = r.system_id
         JOIN users u ON u.id = r.user_id
         WHERE r.id = ?`,
        [id]
      );
      await sendNotificationToUsers([info?.user_id], {
        type: 'access_request',
        title: 'Access Granted',
        message: `Your access request for ${info?.system_name || 'a system'} has been granted by IT Support`,
        sender_id: user_id,
        related_id: Number(id),
        related_type: 'system_access_request'
      });
      // Send email if user's email exists and SMTP is configured
      if (info?.user_email) {
        try {
          await sendAccessGrantedEmail({ to: info.user_email, systemName: info.system_name, requestId: id });
        } catch (mailErr) {
          console.warn('email send failed (non-blocking):', mailErr?.message || mailErr);
        }
      }
      // Optionally notify IT Manager that the request was completed
      try {
        const [[mgr]] = await db.query(`SELECT it_manager_id FROM system_access_requests WHERE id = ?`, [id]);
        if (mgr?.it_manager_id) {
          await sendNotificationToUsers([mgr.it_manager_id], {
            type: 'access_request',
            title: 'Request Completed',
            message: `IT Support granted access for request #${id}.`,
            sender_id: user_id,
            related_id: Number(id),
            related_type: 'system_access_request'
          });
        }
      } catch {}
    } catch (nerr) {
      console.warn('Notification emit failed (non-blocking):', nerr?.message || nerr);
    }

    res.json({ success: true, message: 'Request marked as granted' });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('Error granting system access request:', e);
    res.status(500).json({ success: false, message: e.message || 'Failed to grant request' });
  }
}

// IT Support: mark a request as rejected
export async function itSupportRejectSystemAccessRequest(req, res) {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { user_id, rejection_reason, comment } = req.body || {};

    if (!user_id) {
      connection.release();
      return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    await connection.beginTransaction();

    const [[row]] = await connection.query('SELECT status FROM system_access_requests WHERE id = ?', [id]);
    if (!row) {
      throw new Error('Request not found');
    }
    if (row.status !== 'it_support_review') {
      throw new Error('Only requests in it_support_review can be rejected');
    }

    await connection.query(
      `UPDATE system_access_requests
       SET status = 'rejected', it_support_id = COALESCE(it_support_id, ?), it_support_at = NOW()
       WHERE id = ?`,
      [user_id, id]
    );

    const parts = [];
    if (rejection_reason && rejection_reason.trim()) parts.push(`Rejection reason: ${rejection_reason.trim()}`);
    if (comment && comment.trim()) parts.push(`Note: ${comment.trim()}`);
    const content = parts.join(' \n ');
    if (content) {
      try {
        await connection.query(
          `INSERT INTO comments (comment_type, commented_id, commented_by, content)
           VALUES ('system_access_request', ?, ?, ?)`,
          [id, user_id, content]
        );
      } catch (insertErr) {
        console.warn('Warning: failed to insert IT support rejection comment (non-blocking):', insertErr?.message || insertErr);
      }
    }

    await connection.commit();
    connection.release();

    // Notify requester and optionally IT Manager
    try {
      const [[info]] = await db.query(
        `SELECT r.user_id, s.name AS system_name
         FROM system_access_requests r
         JOIN systems s ON s.id = r.system_id
         WHERE r.id = ?`,
        [id]
      );
      await sendNotificationToUsers([info?.user_id], {
        type: 'access_request',
        title: 'Access Rejected',
        message: `Your access request for ${info?.system_name || 'a system'} was rejected by IT Support`,
        sender_id: user_id,
        related_id: Number(id),
        related_type: 'system_access_request'
      });
    } catch (nerr) {
      console.warn('Notification emit failed (non-blocking):', nerr?.message || nerr);
    }

    res.json({ success: true, message: 'Request marked as rejected' });
  } catch (e) {
    try { await connection.rollback(); } catch {}
    connection.release();
    console.error('Error rejecting system access request:', e);
    res.status(500).json({ success: false, message: e.message || 'Failed to reject request' });
  }
} 