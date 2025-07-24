import bcrypt from "bcrypt";
import db from "../config/db.js";

export default async function register(data) {
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
      'INSERT INTO users (full_name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
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
