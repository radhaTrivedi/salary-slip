import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import salaryRoutes from "./routes/salary.js";
import requireAuth from "./middleware/auth.js";
import { seedFirstAdmin } from "./scripts/seedAdmin.js";
import employeeLoginRoutes from "./routes/employeeLogins.js";
import requireAdmin from "./middleware/requireAdmin.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Public
app.use("/api/auth", authRoutes);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Salary system API is running" });
});

// Everything below requires a logged-in admin
// app.use("/api/employees", requireAuth, employeeRoutes);
// app.use("/api/salary", requireAuth, salaryRoutes);

app.use("/api/employees", requireAuth, requireAdmin, employeeRoutes);
app.use("/api/salary", requireAuth, salaryRoutes);
app.use("/api/employee-logins", requireAuth, requireAdmin, employeeLoginRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/salary_system";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedFirstAdmin();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
