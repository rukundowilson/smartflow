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
  console.log(process.env.JWT_SECRET)

  const token = jwt.sign(
    {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      department: user.department,
      status: user.status,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return { token, user };
}
