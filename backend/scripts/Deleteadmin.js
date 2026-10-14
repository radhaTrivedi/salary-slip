// Usage: node scripts/deleteAdmin.js <username>
// Removes an admin account from the live database.
// Safety: it refuses to delete an employee login, and refuses to delete the
// last remaining admin (nobody could log in as admin afterwards).
import mongoose from "mongoose";
import User from "../models/User.js";

const [, , username] = process.argv;

if (!username) {
  console.error("Usage: node scripts/deleteAdmin.js <username>");
  process.exit(1);
}

const MONGO_URI =
  "mongodb://radha17trivedi_db_user:Radha123456@ac-p8izshz-shard-00-00.klyaukl.mongodb.net:27017,ac-p8izshz-shard-00-01.klyaukl.mongodb.net:27017,ac-p8izshz-shard-00-02.klyaukl.mongodb.net:27017/salary_system?ssl=true&replicaSet=atlas-leaa4s-shard-0&authSource=admin&retryWrites=true&w=majority&appName=salary-count";

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function run() {
  await mongoose.connect(MONGO_URI);
  try {
    const name = username.trim().toLowerCase();

    const user = await User.findOne({ username: name });
    if (!user) return fail(`No user named "${username}" was found.`);

    if (user.role === "employee") {
      return fail(`"${username}" is an employee login, not an admin. Nothing was deleted.`);
    }

    const adminCount = await User.countDocuments({ role: { $ne: "employee" } });
    if (adminCount <= 1) {
      return fail(
        `"${username}" is the only admin left. Nothing was deleted, because nobody could log in as admin afterwards.`
      );
    }

    await User.deleteOne({ _id: user._id });
    console.log(`Admin "${name}" deleted. ${adminCount - 1} admin(s) remain.`);
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((err) => {
  console.error("Could not delete admin:", err.message);
  process.exit(1);
});