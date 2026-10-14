// import express from "express";
// import Employee from "../models/Employee.js";
// import SalarySlip from "../models/SalarySlip.js";

// const router = express.Router();

// // GET /api/employees - list all employees
// router.get("/", async (req, res) => {
//   try {
//     const employees = await Employee.find().sort({ createdAt: -1 });
//     res.json(employees);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/employees/:id - single employee
// router.get("/:id", async (req, res) => {
//   try {
//     const employee = await Employee.findById(req.params.id);
//     if (!employee) return res.status(404).json({ message: "Employee not found" });
//     res.json(employee);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // POST /api/employees - create employee
// router.post("/", async (req, res) => {
//   try {
//     const { name, post, department, email, phone, joiningDate, baseSalary } = req.body;

//     if (!name || !post) {
//       return res.status(400).json({ message: "Name and post are required" });
//     }

//     const employee = await Employee.create({
//       name,
//       post,
//       department,
//       email,
//       phone,
//       joiningDate,
//       baseSalary,
//     });

//     res.status(201).json(employee);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // PUT /api/employees/:id - update employee
// router.put("/:id", async (req, res) => {
//   try {
//     const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     if (!employee) return res.status(404).json({ message: "Employee not found" });
//     res.json(employee);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // DELETE /api/employees/:id - remove employee + their slips
// router.delete("/:id", async (req, res) => {
//   try {
//     const employee = await Employee.findByIdAndDelete(req.params.id);
//     if (!employee) return res.status(404).json({ message: "Employee not found" });
//     await SalarySlip.deleteMany({ employee: req.params.id });
//     res.json({ message: "Employee deleted" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;


import express from "express";
import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import SalarySlip from "../models/SalarySlip.js";
import User from "../models/User.js";

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

// Only these fields can be changed through the edit endpoint.
const EDITABLE_FIELDS = ["name", "post", "department", "email", "phone", "baseSalary"];

// PUT /api/employees/:id - update employee details
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        const value = req.body[field];
        updates[field] = typeof value === "string" ? value.trim() : value;
      }
    }

    if ("name" in updates && !updates.name) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }
    if ("post" in updates && !updates.post) {
      return res.status(400).json({ message: "Post cannot be empty" });
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Salary slips keep a copy of the name, so keep it in sync if it was corrected.
    // (The post is left as-is on old slips: it records the role at the time.)
    if ("name" in updates) {
      await SalarySlip.updateMany({ employee: employee._id }, { employeeName: employee.name });
    }

    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/employees/:id - remove employee, their slips, and their login
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid employee id" });
    }

    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const [slips, logins] = await Promise.all([
      SalarySlip.deleteMany({ employee: employee._id }),
      // Employee login accounts point at this employee; remove them too so no
      // orphaned login is left behind.
      User.deleteMany({ role: "employee", employeeRef: employee._id }),
    ]);

    res.json({
      message: "Employee deleted",
      slipsDeleted: slips.deletedCount,
      loginsDeleted: logins.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
