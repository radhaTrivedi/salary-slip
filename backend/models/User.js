import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
     role: {
      type: String,
      enum: ["admin", "employee"],
      default: "admin",
    },
    employeeRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
     securityQuestion: {
      type: String,
      default: "",
    },
    securityAnswerHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
