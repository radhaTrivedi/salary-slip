import jwt from "jsonwebtoken";

// Verifies the "Authorization: Bearer <token>" header on protected routes.
export default function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    // const payload = jwt.verify(token, process.env.JWT_SECRET);

    const payload = jwt.verify(
  token,
  "7cca89d2f7d23e3b79f57438759aa3c0ebd5b225f18956ba72fa9b496beda796d076fb36dd7d3a93f312c14c7e07e7b2"
);
    req.user = payload; // { id, username, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Session expired, please log in again" });
  }
}
