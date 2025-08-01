import {register, getSystemUsers, updateApplicationStatus, login} from '../services/userService.js';

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const result = await login({ email, password });

    console.log(`✅ User login successful: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: result.user
    });

  } catch (error) {
    console.error(`❌ Login failed for email: ${req.body?.email || 'unknown'} - ${error.message}`);

    res.status(401).json({
      success: false,
      error: error.message
    });
  }
}

async function registerUser(req, res) {
  try {
    const userData = req.body;

    const newUser = await register(userData);

    console.log(`✅ User registration successful: ${userData}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: newUser
    });

  } catch (error) {
    console.error(`❌ Registration failed for email: ${req.body?.email || 'unknown'} - ${error.message}`);

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}

// get all users of the system
async function systemUsers(req,res) {
  try {
    const users = await getSystemUsers();
    return res.status(200).json({
      users : users
    })
  } catch (error) {
    console.log(error)
    return [];
  }
}

export async function reviewRegistrationApplication(req, res) {
  try {
    const { id, status, reviewer, reviewed_at } = req.body;
    console.log(reviewer)

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }

    const result = await updateApplicationStatus({ id, status, reviewer, reviewed_at });

    if (!result || !result.success) {
      return res.status(404).json({ error: "Application not found or not updated" });
    }

    res.json({ message: `Application ${status} successfully` });
  } catch (err) {
    console.error("Error updating application:", err);
    res.status(500).json({ error: "Failed to update application status" });
  }
}

export {registerUser, systemUsers, loginUser}
export default {registerUser, systemUsers, loginUser}