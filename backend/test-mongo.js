import mongoose from "mongoose";

async function testMongo() {
  try {
    await mongoose.connect(
      "mongodb+srv://radha17trivedi_db_user:Radha123456@salary-count.klyaukl.mongodb.net/salary_system?retryWrites=true&w=majority&appName=salary-count",
      {
        tls: true,
        serverSelectionTimeoutMS: 60000
      }
    );

    console.log("✅ MongoDB Connected Successfully");
    process.exit(0);

  } catch (error) {
    console.log("❌ MongoDB Error:");
    console.log(error);
    process.exit(1);
  }
}

testMongo();