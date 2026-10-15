
import express from "express";
import Employee from "../models/Employee.js";
import SalarySlip from "../models/SalarySlip.js";

const router = express.Router();

/*
  GET /api/salary/report/pf

  Returns all employees with their PF history across
  all available months and years.
*/
router.get("/report/pf", async (req, res) => {
  try {
    const employees = await Employee.find().lean();

    const salarySlips = await SalarySlip.find()
      .populate("employee")
      .lean();

    const report = employees.map((employee) => {
      const employeeId = String(employee._id);

      const employeeSlips = salarySlips.filter((slip) => {
        const slipEmployeeId =
          slip.employee?._id?.toString() ??
          slip.employee?.toString() ??
          slip.employeeId?.toString();

        return slipEmployeeId === employeeId;
      });

      const records = employeeSlips.map((slip) => {
        const pf = Number(
          slip.pf ??
            slip.pfAmount ??
            slip.providentFund ??
            slip.deductions?.pf ??
            0
        );

        const date = slip.createdAt
          ? new Date(slip.createdAt)
          : null;

        const month =
          slip.month ??
          slip.salaryMonth ??
          (date && !Number.isNaN(date.getTime())
            ? date.toLocaleString("en-US", { month: "long" })
            : "Unknown");

        const year =
          slip.year ??
          slip.salaryYear ??
          (date && !Number.isNaN(date.getTime())
            ? date.getFullYear()
            : "");

        return {
          salarySlipId: String(slip._id),
          month,
          year,
          pf: Number.isFinite(pf) ? pf : 0,
          status: pf > 0 ? "Deducted" : "Not deducted",
        };
      });

      // Sort newest month/year first.
      records.sort((a, b) => {
        const dateA = new Date(`${a.month} 1, ${a.year}`).getTime();
        const dateB = new Date(`${b.month} 1, ${b.year}`).getTime();

        return (
          (Number.isFinite(dateB) ? dateB : 0) -
          (Number.isFinite(dateA) ? dateA : 0)
        );
      });

      const totalPF = records.reduce(
        (sum, record) => sum + record.pf,
        0
      );

      const deductedPF = records
        .filter((record) => record.status === "Deducted")
        .reduce((sum, record) => sum + record.pf, 0);

      const pendingCount = records.filter(
        (record) => record.status === "Not deducted"
      ).length;

      return {
        employeeId,
        employeeName:
          employee.name ??
          employee.fullName ??
          employee.employeeName ??
          "Unknown",
        employeeCode:
          employee.employeeId ??
          employee.employeeCode ??
          employee.code ??
          "",
        totalPF,
        deductedPF,
        pendingCount,
        salarySlipCount: records.length,
        records,
      };
    });

    return res.status(200).json({
      success: true,
      count: report.length,
      data: report,
    });
  } catch (error) {
    console.error("PF report error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate PF retention report.",
    });
  }
});

/* GET /api/salary - list all salary slips */
router.get("/", async (req, res) => {
  try {
    const salarySlips = await SalarySlip.find()
      .populate("employee")
      .sort({ createdAt: -1 });

    return res.json(salarySlips);
  } catch (error) {
    console.error("Get salary slips error:", error);

    return res.status(500).json({
      message: "Failed to fetch salary slips.",
    });
  }
});

/* GET /api/salary/:id - get one salary slip */
router.get("/:id", async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findById(req.params.id)
      .populate("employee");

    if (!salarySlip) {
      return res.status(404).json({
        message: "Salary slip not found.",
      });
    }

    return res.json(salarySlip);
  } catch (error) {
    console.error("Get salary slip error:", error);

    return res.status(500).json({
      message: "Failed to fetch salary slip.",
    });
  }
});

/* POST /api/salary - create salary slip */
router.post("/", async (req, res) => {
  try {
    const salarySlip = await SalarySlip.create(req.body);

    return res.status(201).json(salarySlip);
  } catch (error) {
    console.error("Create salary slip error:", error);

    return res.status(400).json({
      message: error.message || "Failed to create salary slip.",
    });
  }
});

/* PUT /api/salary/:id - update salary slip */
router.put("/:id", async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!salarySlip) {
      return res.status(404).json({
        message: "Salary slip not found.",
      });
    }

    return res.json(salarySlip);
  } catch (error) {
    console.error("Update salary slip error:", error);

    return res.status(400).json({
      message: error.message || "Failed to update salary slip.",
    });
  }
});

/* DELETE /api/salary/:id - delete salary slip */
router.delete("/:id", async (req, res) => {
  try {
    const salarySlip = await SalarySlip.findByIdAndDelete(
      req.params.id
    );

    if (!salarySlip) {
      return res.status(404).json({
        message: "Salary slip not found.",
      });
    }

    return res.json({
      success: true,
      message: "Salary slip deleted successfully.",
    });
  } catch (error) {
    console.error("Delete salary slip error:", error);

    return res.status(500).json({
      message: "Failed to delete salary slip.",
    });
  }
});

export default router;
