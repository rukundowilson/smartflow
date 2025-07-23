import express, { json } from "express";
import db from "./src/config/db.js";
import cors from "cors";
import router from './src/routers/userRoutes.js';


const app = express();
const port = 8080;

app.use(cors({
  origin: 'https://smartflow-kappa.vercel.app',
}));
app.use(json());


app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world" });
});

app.use('/api', router);


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
