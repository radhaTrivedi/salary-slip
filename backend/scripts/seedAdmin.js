// Creates the very first admin account, only if the User collection is
// empty. Safe to run every time the server starts — it's a no-op once
// any admin already exists.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const FIRST_ADMIN = {
  username: "chaitali",
  password: "chaitali@admin",
};

export async function seedFirstAdmin() {
  const count = await User.countDocuments();
  if (count > 0) return;

  const passwordHash = await bcrypt.hash(FIRST_ADMIN.password, 10);
  await User.create({ username: FIRST_ADMIN.username, passwordHash });
  console.log(`Seeded first admin account: "${FIRST_ADMIN.username}"`);
}

// Allow running directly too: npm run seed:admin
if (import.meta.url === `file://${process.argv[1]}`) {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/salary_system";
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      await seedFirstAdmin();
      await mongoose.disconnect();
    })
    .catch((err) => {
      console.error("Could not seed admin:", err.message);
      process.exit(1);
    });
}
