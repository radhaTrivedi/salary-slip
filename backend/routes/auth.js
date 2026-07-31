import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import requireAuth from "../middleware/auth.js";
import Employee from "../models/Employee.js";
import requireAdmin from "../middleware/requireAdmin.js";


const router = express.Router();

// POST /api/auth/login
// This is intentionally the ONLY way in through the app. New admin accounts
// are never created from the UI or a public endpoint — they are added
// directly in MongoDB (see backend/scripts/createAdmin.js), by design.


// router.post("/login", async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ message: "Username and password are required" });
//     }

//     const user = await User.findOne({ username: username.trim().toLowerCase() });
//     if (!user) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     const valid = await bcrypt.compare(password, user.passwordHash);
//     if (!valid) {
//       return res.status(401).json({ message: "Invalid username or password" });
//     }

//     const token = jwt.sign(
//       { id: user._id, username: user.username, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    let employeeInfo = null;
    if (user.role === "employee" && user.employeeRef) {
      const emp = await Employee.findById(user.employeeRef);
      if (emp) {
        employeeInfo = { id: emp._id, name: emp.name, post: emp.post };
      }
    }

    // const token = jwt.sign(
    //   {
    //     id: user._id,
    //     username: user.username,
    //     role: user.role,
    //     employeeId: employeeInfo ? employeeInfo.id : null,
    //   },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "7d" }
    // );

    const token = jwt.sign(
  {
    id: user._id,
    username: user.username,
    role: user.role,
    employeeId: employeeInfo ? employeeInfo.id : null,
  },
  "7cca89d2f7d23e3b79f57438759aa3c0ebd5b225f18956ba72fa9b496beda796d076fb36dd7d3a93f312c14c7e07e7b2",
  { expiresIn: "7d" }
);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        employee: employeeInfo,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me - confirms a token is still valid, used on app load
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/security-question/:username - fetch the question to display
router.get("/security-question/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username.trim().toLowerCase() });
    if (!user || !user.securityQuestion) {
      return res.status(404).json({ message: "No recovery question set up for that username" });
    }
    res.json({ question: user.securityQuestion });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/reset-with-answer
router.post("/reset-with-answer", async (req, res) => {
  try {
    const { username, answer, newPassword } = req.body;

    if (!username || !answer || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ username: username.trim().toLowerCase() });
    if (!user || !user.securityAnswerHash) {
      return res.status(400).json({ message: "Incorrect answer" });
    }

    const valid = await bcrypt.compare(answer.trim().toLowerCase(), user.securityAnswerHash);
    if (!valid) {
      return res.status(400).json({ message: "Incorrect answer" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated - you can now log in with your new password" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/create-admin", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { username, password, securityQuestion, securityAnswer } = req.body;

    if (!username || !password || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ username: username.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: `"${username}" already exists` });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);

    const newAdmin = await User.create({
      username: username.trim().toLowerCase(),
      passwordHash,
      role: "admin",
      securityQuestion: securityQuestion.trim(),
      securityAnswerHash,
    });

    res.status(201).json({ message: `Admin "${newAdmin.username}" created successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
