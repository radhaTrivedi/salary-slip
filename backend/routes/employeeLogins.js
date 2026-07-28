    import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Employee from "../models/Employee.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const logins = await User.find({ role: "employee" })
      .select("-passwordHash -securityAnswerHash")
      .populate("employeeRef", "name post")
      .sort({ createdAt: -1 });
    res.json(logins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { username, password, employeeId, securityQuestion, securityAnswer } = req.body;

    if (!username || !password || !employeeId || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const existing = await User.findOne({ username: username.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: `"${username}" already exists` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);

    const login = await User.create({
      username: username.trim().toLowerCase(),
      passwordHash,
      role: "employee",
      employeeRef: employeeId,
      securityQuestion: securityQuestion.trim(),
      securityAnswerHash,
    });

    res.status(201).json({
      id: login._id,
      username: login.username,
      employeeRef: { id: employee._id, name: employee.name, post: employee.post },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const login = await User.findOne({ _id: req.params.id, role: "employee" });
    if (!login) return res.status(404).json({ message: "Employee login not found" });

    const { username, password, employeeId } = req.body;

    if (username && username.trim().toLowerCase() !== login.username) {
      const existing = await User.findOne({ username: username.trim().toLowerCase() });
      if (existing) {
        return res.status(409).json({ message: `"${username}" already exists` });
      }
      login.username = username.trim().toLowerCase();
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      login.passwordHash = await bcrypt.hash(password, 10);
    }

    if (employeeId) {
      const employee = await Employee.findById(employeeId);
      if (!employee) return res.status(404).json({ message: "Employee not found" });
      login.employeeRef = employeeId;
    }

    await login.save();
    res.json({ message: "Employee login updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const login = await User.findOneAndDelete({ _id: req.params.id, role: "employee" });
    if (!login) return res.status(404).json({ message: "Employee login not found" });
    res.json({ message: "Employee login deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;