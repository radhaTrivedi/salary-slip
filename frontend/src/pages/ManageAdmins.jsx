import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import PasswordInput from "../components/PasswordInput";

export default function ManageAdmins() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!username.trim() || !password || !securityQuestion.trim() || !securityAnswer.trim()) {
      toast.error("All fields are required");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post("/auth/create-admin", {
        username,
        password,
        securityQuestion,
        securityAnswer,
      });
      toast.success(data.message);
      setUsername("");
      setPassword("");
      setConfirm("");
      setSecurityQuestion("");
      setSecurityAnswer("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create admin");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-ledger-600 font-medium">Admin access</p>
        <h1 className="font-display text-3xl text-ink-900 mt-1">Add a new admin</h1>
        <p className="text-sm text-ink-500 mt-2">
          Create another admin login for this system. They'll be able to do everything you can.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-paper-50 border border-paper-300 rounded-xl p-6 space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-ink-500">Username</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. rahul"
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400"
          />
        </label>

        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />

        <PasswordInput
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        <label className="block">
          <span className="text-xs font-medium text-ink-500">Security question</span>
          <input
            type="text"
            value={securityQuestion}
            onChange={(e) => setSecurityQuestion(e.target.value)}
            placeholder="e.g. What is your pet's name?"
            className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-ink-500">Security answer</span>
          <input
            type="text"
            value={securityAnswer}
            onChange={(e) => setSecurityAnswer(e.target.value)}
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ledger-400"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-ledger-500 text-white font-medium py-2.5 text-sm hover:bg-ledger-600 disabled:opacity-60 transition-colors"
        >
          {saving ? "Creating…" : "Create admin"}
        </button>
      </form>
    </div>
  );
}