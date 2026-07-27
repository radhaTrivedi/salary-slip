import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { MONTHS, currency } from "../lib/helpers";
import AddEmployeeModal from "../components/AddEmployeeModal";

const initialForm = {
  employee: "",
  month: MONTHS[new Date().getMonth()],
  year: new Date().getFullYear(),
  basicSalary: "",
  workingDays: 30,
  fullDays: "",
  halfDays: "",
  travelExpense: "",
  pf: "",
  paymentMethod: "cash",
  note: "",
};

export default function AddSalary() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, []);

  function loadEmployees() {
    api
      .get("/employees")
      .then(({ data }) => setEmployees(data))
      .catch(() => toast.error("Could not load employees"));
  }

  function handleEmployeeCreated(newEmployee) {
    setEmployees((list) => [newEmployee, ...list]);
    update("employee", newEmployee._id);
  }

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const calc = useMemo(() => {
    const basic = Number(form.basicSalary) || 0;
    const days = Number(form.workingDays) || 30;
    const full = Number(form.fullDays) || 0;
    const half = Number(form.halfDays) || 0;
    const travel = Number(form.travelExpense) || 0;
    const pf = Number(form.pf) || 0;

    const perDaySalary = days > 0 ? basic / days : 0;
    const perHourSalary = perDaySalary / 8;
    const daysFullyWorked = days - full - half;
    const earnedSalary = daysFullyWorked * perDaySalary + half * (perDaySalary / 2);
    const grossSalary = earnedSalary + travel;
    const finalSalary = grossSalary - pf;

    return { perDaySalary, perHourSalary, earnedSalary, grossSalary, finalSalary };
  }, [form]);

  const selectedEmployee = employees.find((e) => e._id === form.employee);
  const totalMarkedDays = (Number(form.fullDays) || 0) + (Number(form.halfDays) || 0) * 0.5;
  const daysOverWorking = totalMarkedDays > Number(form.workingDays || 30);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.employee) return toast.error("Please select an employee");
    if (!form.basicSalary || Number(form.basicSalary) <= 0)
      return toast.error("Please enter a valid basic salary");
    if (daysOverWorking)
      return toast.error("Full + half day leaves can't exceed the working days");
    if (form.paymentMethod === "online" && !form.note.trim())
      return toast.error("Add a note for the online payment (e.g. UPI/transaction ref)");

    setSaving(true);
    try {
      const { data } = await api.post("/salary", {
        ...form,
        basicSalary: Number(form.basicSalary),
        workingDays: Number(form.workingDays),
        fullDays: Number(form.fullDays) || 0,
        halfDays: Number(form.halfDays) || 0,
        travelExpense: Number(form.travelExpense) || 0,
        pf: Number(form.pf) || 0,
        year: Number(form.year),
        paymentMethod: form.paymentMethod,
        note: form.paymentMethod === "online" ? form.note : "",
      });
      toast.success(`Salary slip saved for ${data.month} ${data.year}`);
      setForm({ ...initialForm, employee: form.employee });
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save salary slip");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wider text-ledger-600 font-medium">New entry</p>
        <h1 className="font-display text-3xl text-ink-900 mt-1">Add a salary slip</h1>
        <p className="text-sm text-ink-500 mt-2 max-w-xl">
          Pick an employee, mark their attendance, and the day-wise and hour-wise pay is worked out
          for you automatically.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form fields */}
        <div className="lg:col-span-3 bg-paper-50 border border-paper-300 rounded-xl p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <Label>Employee</Label>
              <button
                type="button"
                onClick={() => setAddEmployeeOpen(true)}
                className="text-xs font-medium text-ledger-600 hover:text-ledger-500 transition-colors"
              >
                + New employee
              </button>
            </div>
            <select
              value={form.employee}
              onChange={(e) => update("employee", e.target.value)}
              className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ledger-400"
            >
              <option value="">Select an employee…</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} — {emp.post}
                </option>
              ))}
            </select>
            {employees.length === 0 && (
              <p className="text-xs text-ink-300 mt-1.5">
                No employees yet — click "+ New employee" above to add one.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Month</Label>
              <select
                value={form.month}
                onChange={(e) => update("month", e.target.value)}
                className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ledger-400"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <NumberField label="Year" value={form.year} onChange={(v) => update("year", v)} />
          </div>

          <NumberField
            label="Basic (monthly) salary"
            value={form.basicSalary}
            onChange={(v) => update("basicSalary", v)}
            placeholder="30000"
          />

          <div>
            <Label>Working days (fixed)</Label>
            <input
              type="number"
              value={form.workingDays}
              onChange={(e) => update("workingDays", e.target.value)}
              className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-200/60 px-3 py-2.5 text-sm text-ink-500 focus:outline-none focus:ring-2 focus:ring-ledger-400"
            />
            <p className="text-xs text-ink-300 mt-1.5">Standard month is treated as 30 working days.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Full day leave" value={form.fullDays} onChange={(v) => update("fullDays", v)} placeholder="2" />
            <NumberField label="Half day leave" value={form.halfDays} onChange={(v) => update("halfDays", v)} placeholder="1" />
          </div>
          {daysOverWorking && (
            <p className="text-xs text-rust-600 -mt-2">
              Full + half day leaves ({totalMarkedDays}) can't exceed the {form.workingDays} working days.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Travelling expense" value={form.travelExpense} onChange={(v) => update("travelExpense", v)} placeholder="1500" />
            <NumberField label="PF deduction" value={form.pf} onChange={(v) => update("pf", v)} placeholder="1800" />
          </div>

          {/* Payment method */}
          <div>
            <Label>Payment method</Label>
            <div className="mt-2 flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-ink-900 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={form.paymentMethod === "cash"}
                  onChange={(e) => update("paymentMethod", e.target.value)}
                  className="accent-ledger-500 w-4 h-4"
                />
                Cash
              </label>
              <label className="flex items-center gap-2 text-sm text-ink-900 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={form.paymentMethod === "online"}
                  onChange={(e) => update("paymentMethod", e.target.value)}
                  className="accent-ledger-500 w-4 h-4"
                />
                Online
              </label>
            </div>
          </div>

          {form.paymentMethod === "online" && (
            <div>
              <Label>Note (UPI ref / bank transfer note)</Label>
              <textarea
                value={form.note}
                onChange={(e) => update("note", e.target.value)}
                placeholder="e.g. UPI txn ID, transferred via HDFC..."
                rows={2}
                className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400 resize-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-2 rounded-lg bg-ledger-500 text-white font-medium py-3 text-sm hover:bg-ledger-600 disabled:opacity-60 transition-colors"
          >
            {saving ? "Saving slip…" : "Calculate & save salary slip"}
          </button>
        </div>

        {/* Live preview */}
        <div className="lg:col-span-2">
          <div className="sticky top-6 bg-ink-900 text-paper-100 rounded-xl p-6">
            <p className="text-[11px] uppercase tracking-wider text-ink-300">Live preview</p>
            <h3 className="font-display text-xl mt-1">
              {selectedEmployee ? selectedEmployee.name : "Select an employee"}
            </h3>
            <p className="text-xs text-ink-300">
              {form.month} {form.year} &middot; {form.paymentMethod === "online" ? "Online" : "Cash"}
            </p>

            <div className="tear-line mt-5 mb-5 !border-white/20" />

            <dl className="space-y-3 text-sm font-mono">
              <PreviewRow label="Per day salary" value={currency(calc.perDaySalary)} />
              <PreviewRow label="Per hour salary" value={currency(calc.perHourSalary)} />
              <PreviewRow label="Earned salary" value={currency(calc.earnedSalary)} />
              <PreviewRow label="Gross salary" value={currency(calc.grossSalary)} />
            </dl>

            <div className="mt-5 pt-4 border-t border-white/15 flex items-baseline justify-between">
              <span className="font-display text-base">Final salary</span>
              <span className="font-mono text-2xl font-semibold text-ledger-400">
                {currency(calc.finalSalary)}
              </span>
            </div>
          </div>
        </div>
      </form>

      <AddEmployeeModal
        open={addEmployeeOpen}
        onClose={() => setAddEmployeeOpen(false)}
        onCreated={handleEmployeeCreated}
      />
    </div>
  );
}

function Label({ children }) {
  return <span className="text-xs font-medium text-ink-500">{children}</span>;
}

function NumberField({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-paper-300 bg-paper-50 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400"
      />
    </label>
  );
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-ink-300 font-sans text-xs">{label}</span>
      <span>{value}</span>
    </div>
  );
}
