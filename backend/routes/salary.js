import express from "express";
import mongoose from "mongoose";
import SalarySlip from "../models/SalarySlip.js";
import Employee from "../models/Employee.js";
import requireAdmin from "../middleware/requireAdmin.js";

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
// router.get("/employee/:employeeId", async (req, res) => {
//   try {
//     const slips = await SalarySlip.find({ employee: req.params.employeeId }).sort({
//       year: -1,
//       createdAt: -1,
//     });
//     res.json(slips);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.get("/employee/:employeeId", async (req, res) => {
  try {
    if (req.user.role === "employee" && req.user.employeeId !== req.params.employeeId) {
      return res.status(403).json({ message: "You can only view your own salary slips" });
    }

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
// router.get("/:id", async (req, res) => {
//   try {
//     const slip = await SalarySlip.findById(req.params.id);
//     if (!slip) return res.status(404).json({ message: "Salary slip not found" });
//     res.json(slip);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });



// GET /api/salary/report/company - month-wise total salary paid across
// ALL employees, for the admin's company-wide spending view.
// IMPORTANT: this must stay ABOVE the "/:id" route below, otherwise
// Express will treat "report" as an :id value and this will never run.
router.get("/report/company", requireAdmin, async (req, res) => {
  try {
    const results = await SalarySlip.aggregate([
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          totalFinalSalary: { $sum: "$finalSalary" },
          totalGrossSalary: { $sum: "$grossSalary" },
          employeeCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          year: "$_id.year",
          totalFinalSalary: 1,
          totalGrossSalary: 1,
          employeeCount: 1,
        },
      },
    ]);

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const slip = await SalarySlip.findById(req.params.id);
    if (!slip) return res.status(404).json({ message: "Salary slip not found" });

    if (req.user.role === "employee" && req.user.employeeId !== slip.employee.toString()) {
      return res.status(403).json({ message: "You can only view your own salary slips" });
    }

    res.json(slip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/salary - create a new month-wise slip
// router.post("/", async (req, res) => {
router.post("/", requireAdmin, async (req, res) => {
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
// router.delete("/:id", async (req, res) => {          
router.delete("/:id", requireAdmin, async (req, res) => {       
  try {
    const slip = await SalarySlip.findByIdAndDelete(req.params.id);
    if (!slip) return res.status(404).json({ message: "Salary slip not found" });
    res.json({ message: "Salary slip deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


 // PUT /api/salary/:id - update an existing salary slip
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const slip = await SalarySlip.findById(req.params.id);

    if (!slip) {
      return res.status(404).json({ message: "Salary slip not found" });
    }

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

    // Keep existing values when fields are omitted.
    const updatedEmployeeId = employee || slip.employee;
    const updatedMonth = month || slip.month;
    const updatedYear = year ?? slip.year;

    if (!mongoose.Types.ObjectId.isValid(updatedEmployeeId)) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    const employeeDoc = await Employee.findById(updatedEmployeeId);

    if (!employeeDoc) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Prevent duplicate slips for the same employee, month and year.
    const duplicate = await SalarySlip.findOne({
      employee: updatedEmployeeId,
      month: updatedMonth,
      year: updatedYear,
      _id: { $ne: slip._id },
    });

    if (duplicate) {
      return res.status(409).json({
        message: `A slip for ${updatedMonth} ${updatedYear} already exists for this employee`,
      });
    }

    const updatedWorkingDays = Number(workingDays ?? slip.workingDays ?? 30);
    const updatedFullDays = Number(fullDays ?? slip.fullDays ?? 0);
    const updatedHalfDays = Number(halfDays ?? slip.halfDays ?? 0);
    const updatedBasicSalary = Number(basicSalary ?? slip.basicSalary);
    const updatedTravelExpense = Number(
      travelExpense ?? slip.travelExpense ?? 0
    );
    const updatedPF = Number(pf ?? slip.pf ?? 0);

    if (
      !Number.isFinite(updatedWorkingDays) ||
      updatedWorkingDays <= 0 ||
      !Number.isFinite(updatedFullDays) ||
      !Number.isFinite(updatedHalfDays) ||
      !Number.isFinite(updatedBasicSalary) ||
      updatedBasicSalary < 0 ||
      !Number.isFinite(updatedTravelExpense) ||
      updatedTravelExpense < 0 ||
      !Number.isFinite(updatedPF) ||
      updatedPF < 0 ||
      updatedFullDays < 0 ||
      updatedHalfDays < 0 ||
      updatedFullDays + updatedHalfDays > updatedWorkingDays
    ) {
      return res.status(400).json({
        message: "Please check the salary and attendance values",
      });
    }

    const totals = calculateSlip({
      basicSalary: updatedBasicSalary,
      workingDays: updatedWorkingDays,
      fullDays: updatedFullDays,
      halfDays: updatedHalfDays,
      travelExpense: updatedTravelExpense,
      pf: updatedPF,
    });

    slip.employee = updatedEmployeeId;
    slip.employeeName = employeeDoc.name;
    slip.post = employeeDoc.post;
    slip.month = updatedMonth;
    slip.year = updatedYear;
    slip.workingDays = updatedWorkingDays;
    slip.fullDays = updatedFullDays;
    slip.halfDays = updatedHalfDays;
    slip.basicSalary = updatedBasicSalary;
    slip.travelExpense = updatedTravelExpense;
    slip.pf = updatedPF;
    slip.paymentMethod =
      paymentMethod === undefined
        ? slip.paymentMethod
        : paymentMethod === "online"
          ? "online"
          : "cash";

    if (paymentMethod !== undefined) {
      slip.note =
        slip.paymentMethod === "online" ? note ?? slip.note ?? "" : "";
    } else if (note !== undefined) {
      slip.note = note;
    }

    Object.assign(slip, totals);

    await slip.save();

    return res.json({
      message: "Salary slip updated successfully",
      data: slip,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "A slip for this month already exists for this employee",
      });
    }

    console.error("Update salary error:", err);
    return res.status(500).json({ message: err.message });
  }
});


export default router;
