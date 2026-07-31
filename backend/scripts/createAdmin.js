// Run this from the command line to add another admin directly to the
// database. This is intentionally NOT exposed as an API route or UI button —
// only someone with access to run backend scripts (or the database itself)
// can create new admins.
//
// Usage:
//   node scripts/createAdmin.js <username> <password>
//   npm run create:admin -- <username> <password>
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error("Usage: node scripts/createAdmin.js <username> <password>");
  process.exit(1);
}

// const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/salary_system";
const MONGO_URI =
  "mongodb://radha17trivedi_db_user:Radha123456@ac-p8izshz-shard-00-00.klyaukl.mongodb.net:27017,ac-p8izshz-shard-00-01.klyaukl.mongodb.net:27017,ac-p8izshz-shard-00-02.klyaukl.mongodb.net:27017/salary_system?ssl=true&replicaSet=atlas-leaa4s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=salary-count";


mongoose
  .connect(MONGO_URI)
  .then(async () => {
    const existing = await User.findOne({ username: username.trim().toLowerCase() });
    if (existing) {
      console.error(`A user named "${username}" already exists.`);
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ username: username.trim().toLowerCase(), passwordHash });
    console.log(`Admin "${username}" created successfully.`);
    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Could not create admin:", err.message);
    process.exit(1);
  });
