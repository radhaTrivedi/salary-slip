// Usage: node scripts/setPassword.js <username> "<newPassword>"
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const [, , username, newPassword] = process.argv;

if (!username || !newPassword) {
  console.error('Usage: node scripts/setPassword.js <username> "<newPassword>"');
  process.exit(1);
}

const MONGO_URI =
  "mongodb://radha17trivedi_db_user:Radha123456@ac-p8izshz-shard-00-00.klyaukl.mongodb.net:27017,ac-p8izshz-shard-00-01.klyaukl.mongodb.net:27017,ac-p8izshz-shard-00-02.klyaukl.mongodb.net:27017/salary_system?ssl=true&replicaSet=atlas-leaa4s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=salary-count";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      console.error(`No user named "${username}" was found.`);
      process.exit(1);
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log(`Password updated for "${username}".`);
    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Could not set password:", err.message);
    process.exit(1);
  });