import bcrypt from "bcrypt"
import db from "../config/db.js"

export default async function register (data){
  const { full_name, email, password, role = 'employee' } = data;

  // Check for existing user
  const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    throw new Error('Email already registered');
  }

  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert into users table
  const [result] = await db.query(
    'INSERT INTO users (full_name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
    [full_name, email, passwordHash, role, 'pending']
  );

  const userId = result.insertId;

  // Insert into registration_applications table
  await db.query(
    'INSERT INTO registration_applications (user_id, submitted_by) VALUES (?, ?)',
    [userId, full_name]
  );

  return { id: userId, full_name, email, role, status: 'pending' };
};
