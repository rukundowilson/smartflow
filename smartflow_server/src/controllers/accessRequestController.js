import pool from '../config/db.js';

// Create new access request
export const handleCreateAccessRequest = async (req, res) => {
  try {
    const {
      user_id,
      department_id, // Changed from system_id
      role_id,
      justification,
      start_date,
      end_date,
      is_permanent
    } = req.body;

    // Validate required fields
    if (!user_id || !department_id || !role_id || !justification || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate that user exists
    const [users] = await pool.query(
      'SELECT id, full_name, email FROM users WHERE id = ?',
      [user_id]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: `User with ID ${user_id} does not exist`
      });
    }

    // Validate that department exists
    const [departments] = await pool.query(
      'SELECT id, name FROM departments WHERE id = ?',
      [department_id]
    );

    if (departments.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Department with ID ${department_id} does not exist`
      });
    }

    // Validate that role exists
    const [roles] = await pool.query(
      'SELECT id, name FROM roles WHERE id = ?',
      [role_id]
    );

    if (roles.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Role with ID ${role_id} does not exist`
      });
    }



    const [result] = await pool.query(
      `INSERT INTO access_requests 
       (user_id, department_id, role_id, justification, start_date, end_date, is_permanent, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_manager_approval')`,
      [user_id, department_id, role_id, justification, start_date, end_date, is_permanent]
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
        d.name as department_name,
        d.description as department_description,
        r.name as role_name,
        r.description as role_description,
        u.full_name as user_name,
        u.email as user_email
      FROM access_requests ar
      JOIN departments d ON ar.department_id = d.id
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

// Get pending access requests for approval
export const handleGetPendingAccessRequests = async (req, res) => {
  try {
    const { approver_id, approver_role } = req.query;
    
    console.log('🔍 Getting pending requests for:', { approver_id, approver_role });

    let statusFilter = '';
    let departmentFilter = '';

    // Determine which requests to show based on approver role
    if (approver_role === 'Line Manager') {
      statusFilter = "AND ar.status = 'pending_manager_approval'";
      departmentFilter = `
        AND EXISTS (
          SELECT 1 FROM user_department_roles udr 
          JOIN roles r ON udr.role_id = r.id
          WHERE udr.user_id = ? AND r.name = 'Line Manager'
          AND udr.department_id = ar.department_id
        )
      `;
    } else if (approver_role === 'HOD') {
      statusFilter = "AND ar.status = 'pending_hod'";
      departmentFilter = `
        AND EXISTS (
          SELECT 1 FROM user_department_roles udr 
          JOIN roles r ON udr.role_id = r.id
          WHERE udr.user_id = ? AND r.name = 'HOD'
          AND udr.department_id = ar.department_id
        )
      `;
    } else if (approver_role === 'IT Manager') {
      statusFilter = "AND ar.status = 'pending_it_manager'";
      // IT Manager can see all requests regardless of department
      departmentFilter = '';
    } else if (approver_role === 'IT Support') {
      statusFilter = "AND ar.status = 'pending_it_review'";
      // IT department users can see all requests regardless of department
      departmentFilter = '';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid approver role'
      });
    }

    const query = `
      SELECT 
        ar.*,
        d.name as department_name,
        d.description as department_description,
        r.name as role_name,
        r.description as role_description,
        u.full_name as user_name,
        u.email as user_email,
        approver.full_name as approver_name
      FROM access_requests ar
      JOIN departments d ON ar.department_id = d.id
      JOIN roles r ON ar.role_id = r.id
      JOIN users u ON ar.user_id = u.id
      LEFT JOIN users approver ON ar.approved_by = approver.id
      WHERE ar.status != 'granted' AND ar.status != 'rejected'
      ${statusFilter}
      ${departmentFilter}
      ORDER BY ar.submitted_at DESC
    `;

    const params = approver_role === 'IT Manager' || approver_role === 'IT' ? [] : [approver_id];
    const [rows] = await pool.query(query, params);

    console.log(`✅ Found ${rows.length} pending requests for ${approver_role}`);

    res.json({
      success: true,
      requests: rows
    });
  } catch (error) {
    console.error('Error fetching pending access requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending access requests'
    });
  }
};

// Get all access requests (for HOD dashboard)
export const handleGetAllAccessRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ar.*,
        d.name as department_name,
        d.description as department_description,
        r.name as role_name,
        r.description as role_description,
        u.full_name as user_name,
        u.email as user_email,
        approver.full_name as approver_name
      FROM access_requests ar
      JOIN departments d ON ar.department_id = d.id
      JOIN roles r ON ar.role_id = r.id
      JOIN users u ON ar.user_id = u.id
      LEFT JOIN users approver ON ar.approved_by = approver.id
      ORDER BY ar.submitted_at DESC
    `);

    res.json({
      success: true,
      requests: rows
    });
  } catch (error) {
    console.error('Error fetching all access requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access requests'
    });
  }
};

// Get approval history for a specific approver
export const handleGetApprovalHistory = async (req, res) => {
  try {
    const { approver_id, role } = req.query;
    
    if (!approver_id) {
      return res.status(400).json({
        success: false,
        message: 'Approver ID is required'
      });
    }

    if (role === 'Line Manager') {
      // For Line Manager: Get requests they approved that are now pending HOD or beyond
      const [rows] = await pool.query(`
        SELECT 
          ar.*,
          d.name as department_name,
          d.description as department_description,
          r.name as role_name,
          r.description as role_description,
          u.full_name as user_name,
          u.email as user_email,
          approver.full_name as approver_name
        FROM access_requests ar
        JOIN departments d ON ar.department_id = d.id
        JOIN roles r ON ar.role_id = r.id
        JOIN users u ON ar.user_id = u.id
        LEFT JOIN users approver ON ar.approved_by = approver.id
        WHERE ar.approved_by = ? AND ar.status IN ('pending_hod', 'pending_it_manager', 'pending_it_review', 'ready_for_assignment', 'access_granted', 'it_assigned', 'granted', 'rejected')
        ORDER BY ar.submitted_at DESC
      `, [approver_id]);

      res.json({
        success: true,
        requests: rows
      });
    } else {
      // For HOD: Get requests in their department
      const [hodRows] = await pool.query(`
        SELECT department_id FROM user_department_roles 
        WHERE user_id = ? AND role_id = (SELECT id FROM roles WHERE name = 'HOD')
      `, [approver_id]);

      if (hodRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'HOD not found or not assigned to a department'
        });
      }

      const hodDepartmentId = hodRows[0].department_id;

      const [rows] = await pool.query(`
        SELECT 
          ar.*,
          d.name as department_name,
          d.description as department_description,
          r.name as role_name,
          r.description as role_description,
          u.full_name as user_name,
          u.email as user_email,
          approver.full_name as approver_name
        FROM access_requests ar
        JOIN departments d ON ar.department_id = d.id
        JOIN roles r ON ar.role_id = r.id
        JOIN users u ON ar.user_id = u.id
        LEFT JOIN users approver ON ar.approved_by = approver.id
        WHERE ar.department_id = ? AND (ar.approved_by = ? OR ar.status = 'pending_hod') AND (ar.status = 'granted' OR ar.status = 'rejected' OR ar.status = 'ready_for_assignment' OR ar.status = 'pending_hod' OR ar.status = 'pending_it_manager' OR ar.status = 'pending_it_review')
        ORDER BY ar.submitted_at DESC
      `, [hodDepartmentId, approver_id]);

      res.json({
        success: true,
        requests: rows
      });
    }
  } catch (error) {
    console.error('Error fetching approval history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch approval history'
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
      // Get current request status
      const [requestRows] = await connection.query(
        'SELECT status FROM access_requests WHERE id = ?',
        [requestId]
      );

      if (requestRows.length === 0) {
        throw new Error('Request not found');
      }

      const currentStatus = requestRows[0].status;
      let newStatus = '';

      // Determine next status based on current status and approver role
      switch (currentStatus) {
        case 'pending_manager_approval':
          newStatus = 'pending_hod'; // Line Manager → HOD
          break;
        
        case 'pending_hod':
          newStatus = 'pending_it_manager'; // HOD → IT Manager
          break;
        
        case 'pending_it_manager':
          newStatus = 'pending_it_review'; // IT Manager → IT Department Review
          break;
        
        case 'pending_it_review':
          newStatus = 'ready_for_assignment'; // IT Department → Ready for Assignment
          break;
        
        case 'ready_for_assignment':
          newStatus = 'access_granted'; // Ready for Assignment → Access Granted
          break;
        
        default:
          throw new Error('Invalid request status for approval');
      }

      // Update request status
      await connection.query(
        'UPDATE access_requests SET status = ?, approved_at = NOW(), approved_by = ? WHERE id = ?',
        [newStatus, approver_id, requestId]
      );

      // If request is ready for assignment, automatically assign the role to user
      if (newStatus === 'ready_for_assignment') {
        // Get the request details
        const [requestDetails] = await connection.query(
          'SELECT user_id, department_id, role_id FROM access_requests WHERE id = ?',
          [requestId]
        );

        if (requestDetails.length > 0) {
          const request = requestDetails[0];
          
          // Check if this role assignment already exists
          const [existingAssignment] = await connection.query(
            'SELECT user_id FROM user_department_roles WHERE user_id = ? AND department_id = ? AND role_id = ?',
            [request.user_id, request.department_id, request.role_id]
          );

          if (existingAssignment.length === 0) {
            // Assign the role to user (department_id is used as department_id for system-specific roles)
            await connection.query(
              `INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) 
               VALUES (?, ?, ?, ?, 'active')`,
              [request.user_id, request.department_id, request.role_id, approver_id]
            );
            
            console.log(`✅ Role ${request.role_id} assigned to user ${request.user_id} for department ${request.department_id}`);
          } else {
            console.log(`ℹ️ Role ${request.role_id} already assigned to user ${request.user_id}`);
          }
        }
      }

      // Log approval action
      await connection.query(
        'INSERT INTO request_approvals (request_id, approver_id, action, comment) VALUES (?, ?, ?, ?)',
        [requestId, approver_id, 'approve', comment || '']
      );

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: `Access request approved by ${approver_id}. ${newStatus === 'access_granted' ? 'Request is now fully approved.' : 'Waiting for next level approval.'}`,
        next_status: newStatus
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
      message: error.message || 'Failed to approve access request'
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
        [requestId, approver_id, 'reject', comment || '']
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

// Get access request by ID with approval history
export const handleGetAccessRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    // Get request details
    const [requestRows] = await pool.query(`
      SELECT 
        ar.*,
        d.name as department_name,
        d.description as department_description,
        r.name as role_name,
        r.description as role_description,
        u.full_name as user_name,
        u.email as user_email,
        approver.full_name as approver_name
      FROM access_requests ar
      JOIN departments d ON ar.department_id = d.id
      JOIN roles r ON ar.role_id = r.id
      JOIN users u ON ar.user_id = u.id
      LEFT JOIN users approver ON ar.approved_by = approver.id
      WHERE ar.id = ?
    `, [requestId]);

    if (requestRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Access request not found'
      });
    }

    // Get approval history
    const [approvalRows] = await pool.query(`
      SELECT 
        ra.*,
        u.full_name as approver_name,
        u.email as approver_email
      FROM request_approvals ra
      JOIN users u ON ra.approver_id = u.id
      WHERE ra.request_id = ?
      ORDER BY ra.approved_at ASC
    `, [requestId]);

    const request = requestRows[0];
    request.approval_history = approvalRows;

    res.json({
      success: true,
      request: request
    });
  } catch (error) {
    console.error('Error fetching access request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch access request'
    });
  }
};

// IT Assignment function
export const handleITAssignment = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approver_id, assignment_type, assigned_user_id, comment } = req.body;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get current request status
      const [requestRows] = await connection.query(
        'SELECT status FROM access_requests WHERE id = ?',
        [requestId]
      );

      if (requestRows.length === 0) {
        throw new Error('Request not found');
      }

      const currentStatus = requestRows[0].status;
      
      if (currentStatus !== 'ready_for_assignment') {
        throw new Error('Request is not ready for assignment');
      }

      let newStatus = 'it_assigned';
      let assignmentMessage = '';

      // Handle assignment based on type
      if (assignment_type === 'auto') {
        // Auto-assign to the requesting user
        const [requestDetails] = await connection.query(
          'SELECT user_id, department_id, role_id FROM access_requests WHERE id = ?',
          [requestId]
        );

        if (requestDetails.length > 0) {
          const request = requestDetails[0];
          
          // Check if this role assignment already exists
          const [existingAssignment] = await connection.query(
            'SELECT user_id FROM user_department_roles WHERE user_id = ? AND department_id = ? AND role_id = ?',
            [request.user_id, request.department_id, request.role_id]
          );

          if (existingAssignment.length === 0) {
            // Assign the role to user
            await connection.query(
              `INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) 
               VALUES (?, ?, ?, ?, 'active')`,
              [request.user_id, request.department_id, request.role_id, approver_id]
            );
            
            assignmentMessage = `Role automatically assigned to requesting user`;
            console.log(`✅ Role ${request.role_id} assigned to user ${request.user_id} for department ${request.department_id}`);
          } else {
            assignmentMessage = `Role already assigned to requesting user`;
            console.log(`ℹ️ Role ${request.role_id} already assigned to user ${request.user_id}`);
          }
        }
      } else if (assignment_type === 'manual' && assigned_user_id) {
        // Manual assignment to specific user
        const [requestDetails] = await connection.query(
          'SELECT department_id, role_id FROM access_requests WHERE id = ?',
          [requestId]
        );

        if (requestDetails.length > 0) {
          const request = requestDetails[0];
          
          // Check if this role assignment already exists
          const [existingAssignment] = await connection.query(
            'SELECT user_id FROM user_department_roles WHERE user_id = ? AND department_id = ? AND role_id = ?',
            [assigned_user_id, request.department_id, request.role_id]
          );

          if (existingAssignment.length === 0) {
            // Assign the role to specified user
            await connection.query(
              `INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) 
               VALUES (?, ?, ?, ?, 'active')`,
              [assigned_user_id, request.department_id, request.role_id, approver_id]
            );
            
            assignmentMessage = `Role manually assigned to user ${assigned_user_id}`;
            console.log(`✅ Role ${request.role_id} assigned to user ${assigned_user_id} for department ${request.department_id}`);
          } else {
            assignmentMessage = `Role already assigned to user ${assigned_user_id}`;
            console.log(`ℹ️ Role ${request.role_id} already assigned to user ${assigned_user_id}`);
          }
        }
      }

      // Update request status
      await connection.query(
        'UPDATE access_requests SET status = ?, approved_at = NOW(), approved_by = ? WHERE id = ?',
        [newStatus, approver_id, requestId]
      );

      // Log assignment action
      await connection.query(
        'INSERT INTO request_approvals (request_id, approver_id, action, comment) VALUES (?, ?, ?, ?)',
        [requestId, approver_id, 'assign', comment || assignmentMessage]
      );

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: `Access request assigned successfully. ${assignmentMessage}`,
        next_status: newStatus
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error assigning access request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign access request'
    });
  }
}; 