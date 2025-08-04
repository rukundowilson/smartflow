import pool from '../config/db.js';

// Create new access request
export const handleCreateAccessRequest = async (req, res) => {
  try {
    const {
      user_id,
      system_id,
      role_id,
      justification,
      start_date,
      end_date,
      is_permanent
    } = req.body;

    // Validate required fields
    if (!user_id || !system_id || !role_id || !justification || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO access_requests 
       (user_id, system_id, role_id, justification, start_date, end_date, is_permanent, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_manager_approval')`,
      [user_id, system_id, role_id, justification, start_date, end_date, is_permanent]
    );

    res.status(201).json({
      success: true,
      message: 'Access request created successfully',
      request_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating access request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create access request'
    });
  }
};

// Get user's access requests
export const handleGetUserAccessRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [rows] = await pool.query(`
      SELECT 
        ar.*,
        s.name as system_name,
        s.description as system_description,
        r.name as role_name,
        r.description as role_description,
        u.full_name as user_name,
        u.email as user_email
      FROM access_requests ar
      JOIN systems s ON ar.system_id = s.id
      JOIN roles r ON ar.role_id = r.id
      JOIN users u ON ar.user_id = u.id
      WHERE ar.user_id = ?
      ORDER BY ar.submitted_at DESC
    `, [userId]);

    res.json({
      success: true,
      requests: rows
    });
  } catch (error) {
    console.error('Error fetching user access requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access requests'
    });
  }
};

// Get pending access requests (for managers/approvers)
export const handleGetPendingAccessRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ar.*,
        s.name as system_name,
        s.description as system_description,
        r.name as role_name,
        r.description as role_description,
        u.full_name as user_name,
        u.email as user_email
      FROM access_requests ar
      JOIN systems s ON ar.system_id = s.id
      JOIN roles r ON ar.role_id = r.id
      JOIN users u ON ar.user_id = u.id
      WHERE ar.status IN ('pending_manager_approval', 'pending_system_owner')
      ORDER BY ar.submitted_at ASC
    `);

    res.json({
      success: true,
      requests: rows
    });
  } catch (error) {
    console.error('Error fetching pending access requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending requests'
    });
  }
};

// Approve access request
export const handleApproveAccessRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approver_id, comment } = req.body;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update request status
      await connection.query(
        'UPDATE access_requests SET status = ?, approved_at = NOW(), approved_by = ? WHERE id = ?',
        ['granted', approver_id, requestId]
      );

      // Get request details for role assignment
      const [requestRows] = await connection.query(
        'SELECT user_id, system_id, role_id FROM access_requests WHERE id = ?',
        [requestId]
      );

      if (requestRows.length > 0) {
        const request = requestRows[0];
        
        // Assign role to user (using existing role assignment logic)
        await connection.query(
          `INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) 
           VALUES (?, ?, ?, ?, 'active')
           ON DUPLICATE KEY UPDATE status = 'active', assigned_by = ?`,
          [request.user_id, request.system_id, request.role_id, approver_id, approver_id]
        );
      }

      // Log approval action
      await connection.query(
        'INSERT INTO request_approvals (request_id, approver_id, action, comment) VALUES (?, ?, ?, ?)',
        [requestId, approver_id, 'approve', comment]
      );

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: 'Access request approved successfully'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error approving access request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve access request'
    });
  }
};

// Reject access request
export const handleRejectAccessRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approver_id, rejection_reason, comment } = req.body;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update request status
      await connection.query(
        'UPDATE access_requests SET status = ?, approved_at = NOW(), approved_by = ?, rejection_reason = ? WHERE id = ?',
        ['rejected', approver_id, rejection_reason, requestId]
      );

      // Log rejection action
      await connection.query(
        'INSERT INTO request_approvals (request_id, approver_id, action, comment) VALUES (?, ?, ?, ?)',
        [requestId, approver_id, 'reject', comment]
      );

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: 'Access request rejected successfully'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error rejecting access request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject access request'
    });
  }
};

// Get access request by ID
export const handleGetAccessRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const [rows] = await pool.query(`
      SELECT 
        ar.*,
        s.name as system_name,
        s.description as system_description,
        r.name as role_name,
        r.description as role_description,
        u.full_name as user_name,
        u.email as user_email,
        approver.full_name as approver_name
      FROM access_requests ar
      JOIN systems s ON ar.system_id = s.id
      JOIN roles r ON ar.role_id = r.id
      JOIN users u ON ar.user_id = u.id
      LEFT JOIN users approver ON ar.approved_by = approver.id
      WHERE ar.id = ?
    `, [requestId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
    }

    res.json({
      success: true,
      request: rows[0]
    });
  } catch (error) {
    console.error('Error fetching access request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access request'
    });
  }
}; 