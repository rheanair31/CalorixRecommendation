import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import mealPlanRouter from "./routes/mealPlanRoutes.js";
import waterIntakeRouter from "./routes/waterIntakeRoutes.js";
import exerciseRouter from "./routes/exerciseRoutes.js";
import foodLogRouter from "./routes/foodLogRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to database
connectDB();

// API Routes
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/meal-plans", mealPlanRouter);
app.use("/api/water-intake", waterIntakeRouter);
app.use("/api/exercise", exerciseRouter);
app.use("/api/food-log", foodLogRouter);
app.use("/api/dashboard", dashboardRouter);

// Serve uploaded images
app.use("/images", express.static("uploads"));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    success: true,
    message: "Calorix Recommendation API is running",
    endpoints: {
      auth: "/api/user",
      mealPlans: "/api/meal-plans",
      waterIntake: "/api/water-intake",
      exercise: "/api/exercise",
      foodLog: "/api/food-log",
      dashboard: "/api/dashboard"
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: "Route not found" 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || "Internal server error" 
  });
});

// Start server
app.listen(port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║   Calorix Recommendation Server Started Successfully   ║
╚═══════════════════════════════════════════════════════╝

🚀 Server running on: http://localhost:${port}
📊 Database: MongoDB Connected
🔐 Auth: JWT Authentication Enabled

Available Endpoints:
  • POST   /api/user/register          - Register new user
  • POST   /api/user/login             - Login user
  • GET    /api/user/profile           - Get user profile
  • PUT    /api/user/profile           - Update user profile
  
  • POST   /api/meal-plans/generate    - Generate meal plan
  • POST   /api/meal-plans/save        - Save meal plan
  • GET    /api/meal-plans/saved       - Get saved plans
  
  • POST   /api/water-intake           - Log water intake
  • GET    /api/water-intake/daily     - Get daily water
  • GET    /api/water-intake/history   - Get water history
  
  • POST   /api/exercise               - Log exercise
  • GET    /api/exercise/daily         - Get daily exercise
  • GET    /api/exercise/history       - Get exercise history
  • GET    /api/exercise/stats         - Get exercise stats
  
  • POST   /api/food-log               - Log food
  • GET    /api/food-log/daily         - Get daily food log
  • GET    /api/food-log/history       - Get food log history
  
  • GET    /api/dashboard              - Get comprehensive dashboard
  • GET    /api/dashboard/quick-stats  - Get today's quick stats

🎯 Ready to track your health journey!
  `);
});
