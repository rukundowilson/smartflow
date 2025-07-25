// controllers/authController.js
import { authenticateUser } from "../service/authService.js";

export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const { token, user } = await authenticateUser(email, password);
    res.status(200).json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
}
