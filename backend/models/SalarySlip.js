import mongoose from "mongoose";

const salarySlipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    post: {
      type: String,
    },
    month: {
      type: String, // e.g. "August"
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },

    // Attendance
    workingDays: {
      type: Number,
      default: 30,
    },
    fullDays: {
      type: Number,
      default: 0,
    },
    halfDays: {
      type: Number,
      default: 0,
    },

    // Pay components
    basicSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    perDaySalary: {
      type: Number,
      default: 0,
    },
    perHourSalary: {
      type: Number,
      default: 0,
    },
    travelExpense: {
      type: Number,
      default: 0,
    },
    pf: {
      type: Number,
      default: 0,
    },

    // Payment
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash",
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },

    // Totals
    earnedSalary: {
      type: Number,
      default: 0,
    },
    grossSalary: {
      type: Number,
      default: 0,
    },
    finalSalary: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// One slip per employee per month/year
salarySlipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("SalarySlip", salarySlipSchema);
