import bcrypt from "bcrypt";
import db from "../config/db.js";

async function register(data) {
  const { full_name, email, password, role = 'employee' } = data;

  try {
    // 1. Check for existing user
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log(`❌ Registration failed: Email "${email}" is already registered`);
      throw new Error('Email already registered');
    }

    // 2. Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert user into users table
    const [result] = await db.query(
      'INSERT INTO users (full_name, email, password_hash, department, status) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, passwordHash, role, 'pending']
    );

    const userId = result.insertId;
    console.log(`✅ New user created with ID: ${userId}`);

    // 4. Create registration application
    await db.query(
      'INSERT INTO registration_applications (user_id, submitted_by) VALUES (?, ?)',
      [userId, full_name]
    );
    console.log(`📄 Registration application created for user ID: ${userId}`);

    return {
      success: true,
      message: 'Registration successful. Awaiting HR approval.',
      user: { id: userId, full_name, email, role, status: 'pending' }
    };
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
             u.department,
             u.email,
             u.status AS user_status,
             ra.status AS application_status,
             ra.submitted_by,
             ra.reviewed_by,
             ra.reviewed_at
      FROM registration_applications ra
      JOIN users u ON ra.user_id = u.id
    `);

    return rows;
  } catch (error) {
    console.error("❌ Error fetching system users:", error.message);
    throw error;
  }
}

// Approve or reject registration application
async function updateApplicationStatus({ id, status, hr_reviewed_by, reviewed_at }) {
  console.log(`recived ${id}, ${status}`)
  const [result] = await db.query(
    `UPDATE registration_applications
     SET status = ?, reviewed_by = ?, reviewed_at = ?
     WHERE id = ?`,
    [status, hr_reviewed_by, reviewed_at, id]
  );
  return result.affectedRows > 0;
}

// Export as named and default
export { getSystemUsers, register, updateApplicationStatus};
export default { getSystemUsers, register };
