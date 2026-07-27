import express from "express";
import mongoose from "mongoose";
import SalarySlip from "../models/SalarySlip.js";
import Employee from "../models/Employee.js";

const router = express.Router();

// Shared calculation so numbers are always trustworthy, even if the
// client sends a stale preview.
function calculateSlip({ basicSalary, workingDays, fullDays, halfDays, travelExpense, pf }) {
  const days = Number(workingDays) || 30;
  const perDaySalary = days > 0 ? Number(basicSalary) / days : 0;
  const perHourSalary = perDaySalary / 8; // 8-hour working day
  const daysFullyWorked = days - Number(fullDays) - Number(halfDays);
  const earnedSalary =
    daysFullyWorked * perDaySalary + Number(halfDays) * (perDaySalary / 2);
  const grossSalary = earnedSalary + Number(travelExpense || 0);
  const finalSalary = grossSalary - Number(pf || 0);

  return {
    perDaySalary: Number(perDaySalary.toFixed(2)),
    perHourSalary: Number(perHourSalary.toFixed(2)),
    earnedSalary: Number(earnedSalary.toFixed(2)),
    grossSalary: Number(grossSalary.toFixed(2)),
    finalSalary: Number(finalSalary.toFixed(2)),
  };
}

// GET /api/salary/employee/:employeeId - all slips for one employee, newest first
router.get("/employee/:employeeId", async (req, res) => {
  try {
    const slips = await SalarySlip.find({ employee: req.params.employeeId }).sort({
      year: -1,
      createdAt: -1,
    });
    res.json(slips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/salary/:id - single slip
router.get("/:id", async (req, res) => {
  try {
    const slip = await SalarySlip.findById(req.params.id);
    if (!slip) return res.status(404).json({ message: "Salary slip not found" });
    res.json(slip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/salary - create a new month-wise slip
router.post("/", async (req, res) => {
  try {
    const {
      employee,
      month,
      year,
      workingDays,
      fullDays,
      halfDays,
      basicSalary,
      travelExpense,
      pf,
      paymentMethod,
      note,
    } = req.body;

    if (!employee || !month || !year || basicSalary === undefined) {
      return res
        .status(400)
        .json({ message: "Employee, month, year and basic salary are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(employee)) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    const employeeDoc = await Employee.findById(employee);
    if (!employeeDoc) return res.status(404).json({ message: "Employee not found" });

    const existing = await SalarySlip.findOne({ employee, month, year });
    if (existing) {
      return res
        .status(409)
        .json({ message: `A slip for ${month} ${year} already exists for this employee` });
    }

    const totals = calculateSlip({
      basicSalary,
      workingDays: workingDays || 30,
      fullDays: fullDays || 0,
      halfDays: halfDays || 0,
      travelExpense: travelExpense || 0,
      pf: pf || 0,
    });

    const slip = await SalarySlip.create({
      employee,
      employeeName: employeeDoc.name,
      post: employeeDoc.post,
      month,
      year,
      workingDays: workingDays || 30,
      fullDays: fullDays || 0,
      halfDays: halfDays || 0,
      basicSalary,
      travelExpense: travelExpense || 0,
      pf: pf || 0,
      paymentMethod: paymentMethod === "online" ? "online" : "cash",
      note: paymentMethod === "online" ? note || "" : "",
      ...totals,
    });

    res.status(201).json(slip);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "A slip for this month already exists" });
    }
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/salary/:id
router.delete("/:id", async (req, res) => {
  try {
    const slip = await SalarySlip.findByIdAndDelete(req.params.id);
    if (!slip) return res.status(404).json({ message: "Salary slip not found" });
    res.json({ message: "Salary slip deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
