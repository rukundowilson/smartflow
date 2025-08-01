import express, { json } from "express";
import db from "./src/config/db.js";
import cors from "cors";
import userRouter from './src/routers/userRoutes.js';
import roleRouter from './src/routers/roleRoutes.js';
import departmentRouter from './src/routers/departmentRoutes.js';
import authRouter from './src/routers/authRoutes.js';
import ticketRouter from './src/routers/ticketRoutes.js';
import requisitionRouter from './src/routers/requisitionRoutes.js';
import commentRouter from './src/routers/commentRoutes.js';
import dashboardRouter from './src/routers/dashboardRoutes.js';

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
app.use(json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world" });
});

// API routes
app.use('/api/users', userRouter);
app.use('/api/roles', roleRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketRouter);
app.use('/api/requisitions', requisitionRouter);
app.use('/api/comments', commentRouter);
app.use('/api/dashboard', dashboardRouter);

async function startServer() {
  try {
    console.log("🔌 Testing DB connection...");
    const [rows] = await db.query("SELECT 1 + 1 AS solution");

    if (rows[0].solution === 2) {
      console.log("✅ DB connection OK");
    }

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to DB:", err);
    process.exit(1); // Exit with error code
  }
}
startServer();
