// Run with: node scripts/setAdmin.js
// Always creates or updates the "chaitali" admin account in Atlas with
// the password and security question below.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const FIRST_ADMIN = {
  username: "chaitali",
  password: "Robo+Chaitali",
  securityQuestion: "What is your daughter's name?",
  securityAnswer: "dwija",
};

const MONGO_URI =
  "mongodb://radha17trivedi_db_user:Radha123456@ac-p8izshz-shard-00-00.klyaukl.mongodb.net:27017,ac-p8izshz-shard-00-01.klyaukl.mongodb.net:27017,ac-p8izshz-shard-00-02.klyaukl.mongodb.net:27017/salary_system?ssl=true&replicaSet=atlas-leaa4s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=salary-count";

async function run() {
  console.log("Connecting to Atlas...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected. Upserting admin...");

  const passwordHash = await bcrypt.hash(FIRST_ADMIN.password, 10);
  const securityAnswerHash = await bcrypt.hash(
    FIRST_ADMIN.securityAnswer.trim().toLowerCase(),
    10
  );

  const result = await User.findOneAndUpdate(
    { username: FIRST_ADMIN.username },
    {
      username: FIRST_ADMIN.username,
      passwordHash,
      role: "admin",
      securityQuestion: FIRST_ADMIN.securityQuestion,
      securityAnswerHash,
    },
    { upsert: true, new: true }
  );

  console.log(`Done. "${result.username}" now has the new password and security question.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});