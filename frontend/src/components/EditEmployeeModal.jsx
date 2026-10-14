import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api";

const emptyForm = { name: "", post: "", department: "", email: "", phone: "" };

// Opens whenever `employee` is set; pass null to close.
export default function EditEmployeeModal({ employee, onClose, onUpdated }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  // Fill the form with the selected employee's current details.
  useEffect(() => {
    if (employee) {
      setForm({
        name: employee.name || "",
        post: employee.post || "",
        department: employee.department || "",
        email: employee.email || "",
        phone: employee.phone || "",
      });
    }
  }, [employee]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.post.trim()) {
      toast.error("Name and post are required");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put(`/employees/${employee._id}`, form);
      toast.success(`${data.name} updated`);
      onUpdated(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {employee && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={saving ? undefined : onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-md bg-paper-50 rounded-2xl border border-paper-300 shadow-2xl p-6"
          >
            <h2 className="font-display text-xl text-ink-900">Edit employee</h2>
            <p className="text-sm text-ink-500 mt-1">
              Fixing the name also updates it on their existing salary slips.
            </p>

            <div className="mt-5 space-y-4">
              <Field label="Full name" value={form.name} onChange={(v) => update("name", v)} required />
              <Field label="Post / designation" value={form.post} onChange={(v) => update("post", v)} required />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Department" value={form.department} onChange={(v) => update("department", v)} />
                <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} />
              </div>
              <Field label="Email" value={form.email} onChange={(v) => update("email", v)} type="email" />
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-ink-500 hover:text-ink-900 disabled:opacity-60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-ledger-500 text-white hover:bg-ledger-600 disabled:opacity-60 transition-colors"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, type = "text", required }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink-500">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400 focus:border-transparent"
      />
    </label>
  );
}
