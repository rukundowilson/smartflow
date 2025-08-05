import express from "express";
import cors from "cors";

const app = express();
const port = 8081;

app.use(cors({
  origin: [
    'https://smartflow-kappa.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    "https://smartflow-6xzmuaviv-rukundowilsons-projects.vercel.app/"
  ]
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Test server is running" });
});

// Test IT users endpoint
app.get("/api/users/it", (req, res) => {
  try {
    console.log("🔍 Test IT users endpoint called");
    res.status(200).json({
      success: true,
      users: []
    });
  } catch (error) {
    console.error("Error in test IT users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test IT users"
    });
  }
});

// Test user details endpoint
app.get("/api/users/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Test user details endpoint called for user ID: ${userId}`);
    
    res.status(404).json({
      success: false,
      message: "User not found"
    });
  } catch (error) {
    console.error("Error in test user details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details"
    });
  }
});

// Test user role assignments endpoint
app.get("/api/roles/assignments/user/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`🔍 Test user role assignments endpoint called for user ID: ${userId}`);
    
    res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error("Error in test user role assignments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user role assignments"
    });
  }
});

// Test tickets endpoint
app.get("/api/tickets", (req, res) => {
  try {
    console.log("🔍 Test tickets endpoint called");
    res.status(200).json({
      success: true,
      tickets: []
    });
  } catch (error) {
    console.error("Error in test tickets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test tickets"
    });
  }
});

// Test ticket details endpoint
app.get("/api/tickets/:ticketId", (req, res) => {
  try {
    const { ticketId } = req.params;
    console.log(`🔍 Test ticket details endpoint called for ticket ID: ${ticketId}`);
    
    res.status(404).json({
      success: false,
      message: "Ticket not found"
    });
  } catch (error) {
    console.error("Error in test ticket details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ticket details"
    });
  }
});

// Test comments endpoint
app.get("/api/comments/ticket/:ticketId", (req, res) => {
  try {
    const { ticketId } = req.params;
    console.log(`🔍 Test comments endpoint called for ticket ID: ${ticketId}`);
    
    res.status(200).json({
      success: true,
      comments: []
    });
  } catch (error) {
    console.error("Error in test comments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch comments"
    });
  }
});

// Test ticket creation endpoint
app.post("/api/tickets", (req, res) => {
  try {
    console.log("🔍 Test create ticket endpoint called");
    const { title, description, priority, category } = req.body;
    
    res.status(201).json({
      success: true,
      message: "Ticket created successfully"
    });
  } catch (error) {
    console.error("Error in test create ticket:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create test ticket"
    });
  }
});

// Test ticket status update endpoint
app.put("/api/tickets/:ticketId/status", (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, reviewedBy } = req.body;
    console.log(`🔍 Test ticket status update endpoint called for ticket ID: ${ticketId}`);
    console.log(`🔍 Status: ${status}, Reviewed by: ${reviewedBy}`);
    
    res.status(200).json({
      success: true,
      message: `Ticket ${ticketId} status updated to ${status} successfully`
    });
  } catch (error) {
    console.error("Error in test ticket status update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ticket status"
    });
  }
});

// Test ticket assignment update endpoint
app.put("/api/tickets/:ticketId/assign", (req, res) => {
  try {
    const { ticketId } = req.params;
    const { assignedTo } = req.body;
    console.log(`🔍 Test ticket assignment update endpoint called for ticket ID: ${ticketId}`);
    console.log(`🔍 Assigned to: ${assignedTo}`);
    
    res.status(200).json({
      success: true,
      message: `Ticket ${ticketId} assigned to user ${assignedTo} successfully`
    });
  } catch (error) {
    console.error("Error in test ticket assignment update:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ticket assignment"
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Test server running at http://localhost:${port}`);
  console.log("✅ Server started successfully");
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 