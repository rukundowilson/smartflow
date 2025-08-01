import bcrypt from "bcrypt";
import db from "../config/db.js";

async function login(data) {
  const { email, password } = data;

  try {
    // 1. Find user by email
    const [users] = await db.query(
      'SELECT id, full_name, email, password_hash, status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    // 2. Check if user is active
    if (user.status !== 'active') {
      throw new Error('Account is not active. Please contact HR for approval.');
    }

    // 3. Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // 4. Get user's department and role information from user_department_roles table
    const [userRoles] = await db.query(
      `SELECT d.name as department_name, r.name as role_name, udr.status as assignment_status
       FROM user_department_roles udr
       INNER JOIN departments d ON udr.department_id = d.id
       INNER JOIN roles r ON udr.role_id = r.id
       WHERE udr.user_id = ? AND udr.status = 'active'`,
      [user.id]
    );

    const departmentName = userRoles.length > 0 ? userRoles[0].department_name : 'Unknown Department';
    const roleName = userRoles.length > 0 ? userRoles[0].role_name : 'No Role Assigned';

    // 5. Return user data (without password)
    return {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        department: departmentName,
        role: roleName,
        status: user.status
      }
    };
  } catch (error) {
    console.error('❌ Login error:', error.message);
    throw error;
  }
}

async function register(data) {
  const { full_name, email, password, department_id } = data;

  try {
    // 1. Check for existing user
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log(`❌ Registration failed: Email "${email}" is already registered`);
      throw new Error('Email already registered');
    }

    // 2. Validate department_id
    if (!department_id) {
      throw new Error('Department is required');
    }

    // 3. Check if department exists
    const [departments] = await db.query('SELECT id, name FROM departments WHERE id = ?', [department_id]);
    if (departments.length === 0) {
      throw new Error('Invalid department selected');
    }

    const departmentName = departments[0].name;

    // 4. Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Start transaction
    await db.query('START TRANSACTION');

    try {
      // 5. Insert user into users table
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password_hash, status) VALUES (?, ?, ?, ?)',
      [full_name, email, passwordHash, 'pending']
    );

    const userId = result.insertId;
    console.log(`✅ New user created with ID: ${userId}`);

      // 6. Create user_department_roles relationship with the chosen department
      // We'll assign a default role (you can modify this based on your needs)
      const [defaultRole] = await db.query('SELECT id FROM roles WHERE name = ?', ['User']);
      const roleId = defaultRole.length > 0 ? defaultRole[0].id : 3; // Default to role ID 3 (User) if 'User' role doesn't exist

    await db.query(
        'INSERT INTO user_department_roles (user_id, department_id, role_id, assigned_by, status) VALUES (?, ?, ?, ?, ?)',
        [userId, department_id, roleId, 1, 'active'] // assigned_by = 1 (admin), status = 'active'
    );

      console.log(`✅ User ${userId} registered successfully and assigned to department: ${departmentName}`);
      console.log(`🔗 User-department-role relationship created for user ID: ${userId}`);

    // 7. Create registration application
    await db.query(
      'INSERT INTO registration_applications (user_id, submitted_by) VALUES (?, ?)',
      [userId, full_name]
    );
    console.log(`📄 Registration application created for user ID: ${userId}`);

      // Commit transaction
      await db.query('COMMIT');

    return {
      success: true,
      message: 'Registration successful. Awaiting HR approval.',
      user: { id: userId, full_name, email, department: departmentName, status: 'pending' }
    };
    } catch (error) {
      // Rollback on error
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    throw error;
  }
}

async function getSystemUsers() {
  try {
    const [rows] = await db.execute(`
      SELECT ra.id AS application_id, 
             u.id AS user_id,
             u.full_name,
             COALESCE(udr.department_id, NULL) AS department_id,
             COALESCE(d.name, 'Unknown Department') AS department,
             COALESCE(r.name, 'No Role Assigned') AS role,
             u.email,
             u.status AS user_status,
             ra.status AS application_status,
             ra.submitted_by,
             ra.reviewed_by,
             ra.reviewed_at,
             udr.status AS assignment_status
      FROM registration_applications ra
      JOIN users u ON ra.user_id = u.id
      LEFT JOIN user_department_roles udr ON u.id = udr.user_id
      LEFT JOIN departments d ON udr.department_id = d.id
      LEFT JOIN roles r ON udr.role_id = r.id
    `);
    return rows;
  } catch (error) {
    console.error("❌ Error fetching system users:", error.message);
    throw error;
  }
}

// Approve or reject registration application
async function updateApplicationStatus({ id, status, reviewer, reviewed_at }) {
  console.log(`received ${id}, ${status} by ${reviewer}`)
  
  try {
    // Start a transaction
    await db.query('START TRANSACTION');
    
    // 1. Update the registration application status
    const [applicationResult] = await db.query(
      `UPDATE registration_applications
       SET status = ?, reviewed_by = ?, reviewed_at = ?
       WHERE id = ?`,
      [status, reviewer, reviewed_at, id]
    );
    
    if (applicationResult.affectedRows === 0) {
      await db.query('ROLLBACK');
      throw new Error('Application not found');
    }
    
    // 2. If application is approved, update user status to 'active'
    if (status === 'approved') {
      const [userResult] = await db.query(
        `UPDATE users u
         JOIN registration_applications ra ON u.id = ra.user_id
         SET u.status = 'active'
         WHERE ra.id = ?`,
        [id]
      );
      
      if (userResult.affectedRows === 0) {
        await db.query('ROLLBACK');
        throw new Error('User not found for application');
      }
      
      console.log(`✅ Application ${id} approved and user status updated to active`);
    } else if (status === 'rejected') {
      // 3. If application is rejected, update user status to 'rejected'
      const [userResult] = await db.query(
        `UPDATE users u
         JOIN registration_applications ra ON u.id = ra.user_id
         SET u.status = 'rejected'
         WHERE ra.id = ?`,
        [id]
      );
      
      if (userResult.affectedRows === 0) {
        await db.query('ROLLBACK');
        throw new Error('User not found for application');
      }
      
      console.log(`❌ Application ${id} rejected and user status updated to rejected`);
    }
    
    // Commit the transaction
    await db.query('COMMIT');
    
    return {
      success: true,
      affectedRows: applicationResult.affectedRows,
      message: `Application ${status} successfully`
    };
    
  } catch (error) {
    // Rollback on error
    await db.query('ROLLBACK');
    console.error('❌ Error updating application status:', error.message);
    throw error;
  }
}

// Export as named and default
export { getSystemUsers, register, updateApplicationStatus, login };
export default { getSystemUsers, register, login };
