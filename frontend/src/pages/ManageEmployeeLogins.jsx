import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import PasswordInput from "../components/PasswordInput";

const emptyForm = {
  username: "",
  password: "",
  employeeId: "",
  securityQuestion: "",
  securityAnswer: "",
};

export default function ManageEmployeeLogins() {
  const [logins, setLogins] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    setLoading(true);
    Promise.all([api.get("/employee-logins"), api.get("/employees")])
      .then(([loginsRes, employeesRes]) => {
        setLogins(loginsRes.data);
        setEmployees(employeesRes.data);
      })
      .catch(() => toast.error("Could not load employee logins"))
      .finally(() => setLoading(false));
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function startEdit(login) {
    setEditingId(login._id);
    setForm({
      username: login.username,
      password: "",
      employeeId: login.employeeRef?._id || "",
      securityQuestion: "",
      securityAnswer: "",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.username.trim() || !form.employeeId) {
      toast.error("Username and employee are required");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        const payload = { username: form.username, employeeId: form.employeeId };
        if (form.password) payload.password = form.password;
        await api.put(`/employee-logins/${editingId}`, payload);
        toast.success("Login updated");
      } else {
        if (!form.password || !form.securityQuestion.trim() || !form.securityAnswer.trim()) {
          toast.error("Password, security question and answer are required for a new login");
          setSaving(false);
          return;
        }
        await api.post("/employee-logins", form);
        toast.success("Employee login created");
      }
      cancelEdit();
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save employee login");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(login) {
    if (!confirm(`Delete login "${login.username}"? This can't be undone.`)) return;
    try {
      await api.delete(`/employee-logins/${login._id}`);
      toast.success("Login deleted");
      loadAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete login");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-ledger-600 font-medium">Employee access</p>
        <h1 className="font-display text-3xl text-ink-900 mt-1">Employee logins</h1>
        <p className="text-sm text-ink-500 mt-2">
          Give an employee their own login so they can view (and print/export) only their own salary
          slips — they can't add, edit, or delete anything.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="bg-paper-50 border border-paper-300 rounded-xl p-6 space-y-4 mb-8">
        <h2 className="font-display text-lg text-ink-900">
          {editingId ? "Edit login" : "Create a new login"}
        </h2>

        <label className="block">
          <span className="text-xs font-medium text-ink-500">Employee</span>
          <select
            value={form.employeeId}
            onChange={(e) => update("employeeId", e.target.value)}
            className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ledger-400"
          >
            <option value="">Select an employee…</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} — {emp.post}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-ink-500">Username</span>
          <input
            type="text"
            value={form.username}
            onChange={(e) => update("username", e.target.value)}
            placeholder="e.g. rahul.k"
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400"
          />
        </label>

        <PasswordInput
          label={editingId ? "New password (leave blank to keep current)" : "Password"}
          value={form.password}
          onChange={(v) => update("password", v)}
          placeholder="At least 6 characters"
          autoComplete="new-password"
        />

        {!editingId && (
          <>
            <label className="block">
              <span className="text-xs font-medium text-ink-500">Security question</span>
              <input
                type="text"
                value={form.securityQuestion}
                onChange={(e) => update("securityQuestion", e.target.value)}
                placeholder="e.g. What is your pet's name?"
                className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink-500">Security answer</span>
              <input
                type="text"
                value={form.securityAnswer}
                onChange={(e) => update("securityAnswer", e.target.value)}
                autoComplete="off"
                className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ledger-400"
              />
            </label>
          </>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-ledger-500 text-white font-medium px-4 py-2.5 text-sm hover:bg-ledger-600 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Create login"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="font-display text-lg text-ink-900 mb-3">Existing employee logins</h2>
      {loading ? (
        <p className="text-sm text-ink-300">Loading…</p>
      ) : logins.length === 0 ? (
        <p className="text-sm text-ink-300">No employee logins created yet.</p>
      ) : (
        <div className="bg-paper-50 border border-paper-300 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-paper-300 text-left text-[11px] uppercase tracking-wider text-ink-500">
                <th className="px-4 py-3 font-medium">Username</th>
                <th className="px-4 py-3 font-medium">Linked employee</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logins.map((login) => (
                <tr key={login._id} className="border-b border-paper-200 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-ink-900">{login.username}</td>
                  <td className="px-4 py-3 text-ink-500">
                    {login.employeeRef ? `${login.employeeRef.name} — ${login.employeeRef.post}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right space-x-3">
                    <button
                      onClick={() => startEdit(login)}
                      className="text-xs font-medium text-ledger-600 hover:text-ledger-500 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(login)}
                      className="text-xs font-medium text-rust-600 hover:text-rust-500 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}