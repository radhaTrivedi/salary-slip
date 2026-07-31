//  import dns from 'dns';
// dns.setDefaultResultOrder('ipv4first');
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";

// import authRoutes from "./routes/auth.js";
// import employeeRoutes from "./routes/employees.js";
// import salaryRoutes from "./routes/salary.js";
// import requireAuth from "./middleware/auth.js";
// import { seedFirstAdmin } from "./scripts/seedAdmin.js";
// import employeeLoginRoutes from "./routes/employeeLogins.js";
// import requireAdmin from "./middleware/requireAdmin.js";

// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());

// // Public
// app.use("/api/auth", authRoutes);
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", message: "Salary system API is running" });
// });
  

// app.use("/api/employees", requireAuth, requireAdmin, employeeRoutes);
// app.use("/api/salary", requireAuth, salaryRoutes);
// app.use("/api/employee-logins", requireAuth, requireAdmin, employeeLoginRoutes);

// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI  ;

// mongoose
//   .connect(MONGO_URI)
//   .then(async () => {
//     console.log("MongoDB connected");
//     await seedFirstAdmin();
//     app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error:", err.message);
//     process.exit(1);
//   });

// import dns from "dns";
// dns.setDefaultResultOrder("ipv4first");

// import "dotenv/config";
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";

// import authRoutes from "./routes/auth.js";
// import employeeRoutes from "./routes/employees.js";
// import salaryRoutes from "./routes/salary.js";
// import requireAuth from "./middleware/auth.js";
// import { seedFirstAdmin } from "./scripts/seedAdmin.js";
// import employeeLoginRoutes from "./routes/employeeLogins.js";
// import requireAdmin from "./middleware/requireAdmin.js";

// const app = express();
// app.use(cors());
// app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.get("/api/health", (req, res) => {
//   res.json({ status: "ok", message: "Salary system API is running" });
// });
// app.use("/api/employees", requireAuth, requireAdmin, employeeRoutes);
// app.use("/api/salary", requireAuth, salaryRoutes);
// app.use("/api/employee-logins", requireAuth, requireAdmin, employeeLoginRoutes);

// // Connect to Mongo once, reused across invocations
// let isConnected = false;
// async function connectDB() {
//   if (isConnected) return;
//   await mongoose.connect(process.env.MONGO_URI);
//   isConnected = true;
//   await seedFirstAdmin();
// }

// // For local dev only
// if (process.env.NODE_ENV !== "production") {
//   connectDB().then(() => {
//     app.listen(process.env.PORT || 5000, () =>
//       console.log(`Server running locally on port ${process.env.PORT || 5000}`)
//     );
//   });
// }

// // Vercel serverless handler
// export default async function handler(req, res) {
//   await connectDB();
//   return app(req, res);
// }

import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import salaryRoutes from "./routes/salary.js";
import requireAuth from "./middleware/auth.js";
import { seedFirstAdmin } from "./scripts/seedAdmin.js";
import employeeLoginRoutes from "./routes/employeeLogins.js";
import requireAdmin from "./middleware/requireAdmin.js";

// Hardcoded config (no .env / process.env used)
const MONGO_URI =
  "mongodb://radha17trivedi_db_user:Radha123456@ac-p8izshz-shard-00-00.klyaukl.mongodb.net:27017,ac-p8izshz-shard-00-01.klyaukl.mongodb.net:27017,ac-p8izshz-shard-00-02.klyaukl.mongodb.net:27017/salary_system?ssl=true&replicaSet=atlas-leaa4s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=salary-count";
const PORT = 5000;
export const JWT_SECRET =
  "7cca89d2f7d23e3b79f57438759aa3c0ebd5b225f18956ba72fa9b496beda796d076fb36dd7d3a93f312c14c7e07e7b2";

const app = express();

app.use(cors());
app.use(express.json());

// Public
app.use("/api/auth", authRoutes);
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Salary system API is running" });
});

// Everything below requires a logged-in admin
app.use("/api/employees", requireAuth, requireAdmin, employeeRoutes);
app.use("/api/salary", requireAuth, salaryRoutes);
app.use("/api/employee-logins", requireAuth, requireAdmin, employeeLoginRoutes);

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await seedFirstAdmin();
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.error("Full error object:", err);
    process.exit(1);
  });