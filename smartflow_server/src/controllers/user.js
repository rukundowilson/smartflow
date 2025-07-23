import register from '../service/userService.js';
export default async function registerUser(req, res) {
  try {
    const userData = req.body;
    const newUser = await register(userData);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(400).json({ error: error.message });
  }
};
