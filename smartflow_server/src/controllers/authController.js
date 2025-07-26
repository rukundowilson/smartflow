// controllers/authController.js
import { authenticateUser } from "../services/authService.js";

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 400, message: "Email and password are required" });
    }

    const { token, user } = await authenticateUser(email, password);

    return res.status(200).json({
      status: 200,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "Internal Server Error",
    });
  }
}
