import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Enter both username and password");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { username, password });
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.username}`);
      const redirectTo = location.state?.from || "/";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper-100 ledger-bg grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="ROBO+ EduTech" className="h-16 w-auto mb-3" />
          <p className="text-sm text-ink-500">Salary Management System</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-paper-50 border border-paper-300 rounded-2xl p-7 shadow-[0_10px_40px_-12px_rgba(46,76,158,0.18)]"
        >
          <h1 className="font-display text-xl text-ink-900 mb-1">Admin login</h1>
          <p className="text-sm text-ink-500 mb-6">Sign in to manage employees and payroll.</p>

          <label className="block mb-4">
            <span className="text-xs font-medium text-ink-500">Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="chaitali"
              autoFocus
              className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400"
            />
          </label>

          <label className="block mb-6">
            <span className="text-xs font-medium text-ink-500">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-ink-900 text-white font-medium py-2.5 text-sm hover:bg-ink-800 disabled:opacity-60 transition-colors"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-ink-300 text-center mt-6">
          New admin accounts are added directly to the database — there's no self-signup.
        </p>
      </div>
    </div>
  );
}
