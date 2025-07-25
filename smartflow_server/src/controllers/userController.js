import {register,getSystemUsers, updateApplicationStatus} from '../service/userService.js';


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
    const { id, status, hr_reviewed_by, reviewed_at } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status must be 'approved' or 'rejected'" });
    }

    const success = await updateApplicationStatus({ id, status, hr_reviewed_by, reviewed_at });

    if (!success) {
      return res.status(404).json({ error: "Application not found or not updated" });
    }

    res.json({ message: `Application ${status} successfully` });
  } catch (err) {
    console.error("Error updating application:", err);
    res.status(500).json({ error: "Failed to update application status" });
  }
}

export {registerUser,systemUsers}
export default {registerUser,systemUsers}