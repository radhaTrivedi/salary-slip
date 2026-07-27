import express from "express";
import Employee from "../models/Employee.js";
import SalarySlip from "../models/SalarySlip.js";

const router = express.Router();

// GET /api/employees - list all employees
router.get("/", async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/employees/:id - single employee
router.get("/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/employees - create employee
router.post("/", async (req, res) => {
  try {
    const { name, post, department, email, phone, joiningDate, baseSalary } = req.body;

    if (!name || !post) {
      return res.status(400).json({ message: "Name and post are required" });
    }

    const employee = await Employee.create({
      name,
      post,
      department,
      email,
      phone,
      joiningDate,
      baseSalary,
    });

    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/employees/:id - update employee
router.put("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/employees/:id - remove employee + their slips
router.delete("/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    await SalarySlip.deleteMany({ employee: req.params.id });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
