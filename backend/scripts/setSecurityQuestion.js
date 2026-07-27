// Usage: node scripts/setSecurityQuestion.js <username> "<question>" "<answer>"
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const [, , username, question, answer] = process.argv;

if (!username || !question || !answer) {
  console.error('Usage: node scripts/setSecurityQuestion.js <username> "<question>" "<answer>"');
  process.exit(1);
}

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/salary_system";

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      console.error(`No user named "${username}" was found.`);
      process.exit(1);
    }

    user.securityQuestion = question.trim();
    user.securityAnswerHash = await bcrypt.hash(answer.trim().toLowerCase(), 10);
    await user.save();

    console.log(`Security question set for "${username}".`);
    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Could not set security question:", err.message);
    process.exit(1);
  });