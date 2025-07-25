import {register,getSystemUsers} from '../service/userService.js';

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
export {registerUser,systemUsers}
export default {registerUser,systemUsers}