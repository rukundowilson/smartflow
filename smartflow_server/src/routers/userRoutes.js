// routes/registration.routes.js
import express from 'express';
import db from '../config/db.js';
import { 
  registerUser,
  systemUsers,
  loginUser,
  reviewRegistrationApplication
} from '../controllers/userController.js';

import { 
  handleGetITUsers
} from '../controllers/itTicketController.js';



const router = express.Router();

// IT Users Route (more specific - must come before /users)
router.get("/it", handleGetITUsers);

// Mock IT Users Route (fallback)
router.get("/it-mock", (req, res) => {
  try {
    console.log("🔍 Mock IT users endpoint called");
    const mockUsers = [
      { id: 1, full_name: "IT User 1", email: "ituser1@company.com" },
      { id: 2, full_name: "IT User 2", email: "ituser2@company.com" },
      { id: 3, full_name: "IT User 3", email: "ituser3@company.com" }
    ];
    
    res.status(200).json({
      success: true,
      users: mockUsers
    });
  } catch (error) {
    console.error("Error in mock IT users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch mock IT users"
    });
  }
});

// User Routes
router.post("/users", registerUser);
router.get("/users", systemUsers);

// Application Review Route
router.post("/application/review", reviewRegistrationApplication);

// Auth Routes moved to /api/auth

// Debug endpoint to test IT users
router.get("/debug/it-users", async (req, res) => {
  try {
    console.log("🔍 Debug: Testing IT users endpoint");
    const users = await handleGetITUsers(req, res);
    console.log("🔍 Debug: IT users result:", users);
  } catch (error) {
    console.error("🔍 Debug: Error in IT users:", error);
    res.status(500).json({
      success: false,
      message: "Debug error: " + error.message
    });
  }
});

// Database test endpoint
router.get("/debug/db-test", async (req, res) => {
  try {
    console.log("🔍 Debug: Testing database tables");
    
    // Test departments table
    const [departments] = await db.query("SELECT * FROM departments");
    console.log("🔍 Debug: Departments:", departments);
    
    // Test users table
    const [users] = await db.query("SELECT id, full_name, email, status FROM users LIMIT 5");
    console.log("🔍 Debug: Users:", users);
    
    // Test user_department_roles table
    const [userRoles] = await db.query("SELECT * FROM user_department_roles LIMIT 5");
    console.log("🔍 Debug: User Department Roles:", userRoles);
    
    res.json({
      success: true,
      departments: departments.length,
      users: users.length,
      userRoles: userRoles.length,
      message: "Database test completed"
    });
  } catch (error) {
    console.error("🔍 Debug: Database test error:", error);
    res.status(500).json({
      success: false,
      message: "Database test error: " + error.message
    });
  }
});

export default router;