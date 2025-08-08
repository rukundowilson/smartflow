// services/authService.js
import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export async function authenticateUser(email, password) {
  if (typeof email !== "string" || typeof password !== "string") {
    throw { status: 400, message: "Email and password must be strings" };
  }

  const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

  if (users.length === 0) {
    throw { status: 404, message: "User not found" };
  }

  const user = users[0]; 

  // Check their registration application status
  const [applications] = await db.query(
    "SELECT status FROM registration_applications WHERE user_id = ? ORDER BY id DESC LIMIT 1",
    [user.id]
  );

  if (applications.length === 0) {
    throw { status: 400, message: "No registration application found for this user." };
  }

  const appStatus = applications[0].status;

  if (appStatus !== "approved") {
    throw {
      status: 400,
      message: `Sorry! Your account is still under review. Current status: ${appStatus}`,
    };
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw { status: 401, message: "Invalid password" };
  }

  // Enrich with roles and primary department/role from user_department_roles
  const [userRoles] = await db.query(
    `SELECT d.name as department_name, r.name as role_name,
            udr.department_id, udr.role_id, d.id as dept_id, r.id as role_id
     FROM user_department_roles udr
     INNER JOIN departments d ON udr.department_id = d.id
     INNER JOIN roles r ON udr.role_id = r.id
     WHERE udr.user_id = ? AND udr.status = 'active'
     ORDER BY udr.assigned_at DESC`,
    [user.id]
  );

  const roles = userRoles.map((row) => ({
    department_name: row.department_name,
    role_name: row.role_name,
    department_id: row.department_id,
    role_id: row.role_id,
    dept_id: row.dept_id,
  }));

  const primaryRole = userRoles.length > 0 ? userRoles[0] : null;
  const departmentName = primaryRole ? primaryRole.department_name : (user.department || "Unknown Department");
  const roleName = primaryRole ? primaryRole.role_name : (user.role || "User");

  const sanitizedUser = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    department: departmentName,
    role: roleName,
    status: user.status,
    roles: roles,
  };

  const token = jwt.sign(
    {
      id: sanitizedUser.id,
      full_name: sanitizedUser.full_name,
      email: sanitizedUser.email,
      department: sanitizedUser.department,
      status: sanitizedUser.status,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user: sanitizedUser };
}
