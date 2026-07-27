import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import PasswordInput from "../components/PasswordInput";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleFindUser(e) {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Enter your username");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(
        `/auth/security-question/${username.trim()}`,
      );
      setQuestion(data.question);
      setStep(2);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not find that username",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-with-answer", {
        username,
        answer,
        newPassword,
      });
      toast.success(data.message);
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect answer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper-100 ledger-bg grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="ROBO+ EduTech"
            className="h-16 w-auto mb-3"
          />
          <p className="text-sm text-ink-500">Salary Management System</p>
        </div>

        <div className="bg-paper-50 border border-paper-300 rounded-2xl p-7 shadow-[0_10px_40px_-12px_rgba(46,76,158,0.18)]">
          <h1 className="font-display text-xl text-ink-900 mb-1">
            Forgot password
          </h1>

          {step === 1 && (
            <form onSubmit={handleFindUser}>
              <p className="text-sm text-ink-500 mb-6">
                Enter your username to see your recovery question.
              </p>
              <label className="block mb-6">
                <span className="text-xs font-medium text-ink-500">
                  Username
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usenname"
                  autoFocus
                  className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-ink-900 text-white font-medium py-2.5 text-sm hover:bg-ink-800 disabled:opacity-60 transition-colors"
              >
                {loading ? "Checking…" : "Continue"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset}>
              <p className="text-sm text-ink-500 mb-4">{question}</p>
              <label className="block mb-4">
                <span className="text-xs font-medium text-ink-500">
                  Your answer
                </span>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  autoFocus
                  autoComplete="off"
                  name="security-answer"
                  className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ledger-400"
                />
              </label>
              {/* <label className="block mb-4">
                <span className="text-xs font-medium text-ink-500">
                  New password
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400"
                />
              </label>
              <label className="block mb-6">
                <span className="text-xs font-medium text-ink-500">
                  Confirm new password
                </span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ledger-400"
                />
              </label> */}

              <div className="mb-4">
                <PasswordInput
                  label="New password"
                  value={newPassword}
                  onChange={setNewPassword}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
              </div>
              <div className="mb-6">
                <PasswordInput
                  label="Confirm new password"
                  value={confirm}
                  onChange={setConfirm}
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-ink-900 text-white font-medium py-2.5 text-sm hover:bg-ink-800 disabled:opacity-60 transition-colors"
              >
                {loading ? "Saving…" : "Reset password"}
              </button>
            </form>
          )}
        </div>

        <p className="text-xs text-ink-300 text-center mt-6">
          <Link
            to="/login"
            className="text-ledger-600 hover:text-ledger-500 font-medium"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
