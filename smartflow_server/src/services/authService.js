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
