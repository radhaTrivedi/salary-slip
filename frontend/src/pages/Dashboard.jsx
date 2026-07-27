import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import EmployeeCard from "../components/EmployeeCard";
import EmployeeTable from "../components/EmployeeTable";
import AddEmployeeModal from "../components/AddEmployeeModal";
import SalarySlipModal from "../components/SalarySlipModal";

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  function loadEmployees() {
    setLoading(true);
    api
      .get("/employees")
      .then(({ data }) => setEmployees(data))
      .catch(() => toast.error("Could not load employees"))
      .finally(() => setLoading(false));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) => e.name.toLowerCase().includes(q) || e.post.toLowerCase().includes(q)
    );
  }, [employees, query]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-ledger-600 font-medium">Payroll register</p>
          <h1 className="font-display text-3xl text-ink-900 mt-1">
            {employees.length} {employees.length === 1 ? "employee" : "employees"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-paper-200 rounded-lg p-1">
            <ToggleButton active={view === "grid"} onClick={() => setView("grid")} label="Cards" />
            <ToggleButton active={view === "table"} onClick={() => setView("table")} label="Table" />
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-lg bg-ink-900 text-white text-sm font-medium px-4 py-2 hover:bg-ink-800 transition-colors"
          >
            + Add employee
          </button>
        </div>
      </header>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or post…"
        className="w-full sm:w-80 mb-6 rounded-lg border border-paper-300 bg-paper-50 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-ledger-400"
      />

      {loading ? (
        <p className="text-sm text-ink-300">Loading employees…</p>
      ) : filtered.length === 0 ? (
        <EmptyState hasEmployees={employees.length > 0} onAdd={() => setAddOpen(true)} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((emp) => (
            <EmployeeCard key={emp._id} employee={emp} onOpen={setActiveEmployee} />
          ))}
        </div>
      ) : (
        <EmployeeTable employees={filtered} onOpen={setActiveEmployee} />
      )}

      <AddEmployeeModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(emp) => setEmployees((list) => [emp, ...list])}
      />

      <SalarySlipModal employee={activeEmployee} onClose={() => setActiveEmployee(null)} />
    </div>
  );
}

function ToggleButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active ? "bg-paper-50 text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-900"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ hasEmployees, onAdd }) {
  return (
    <div className="text-center border border-dashed border-paper-300 rounded-xl py-16 px-6">
      <p className="font-display text-lg text-ink-900">
        {hasEmployees ? "No employees match your search" : "No employees in the register yet"}
      </p>
      <p className="text-sm text-ink-500 mt-1.5">
        {hasEmployees ? "Try a different name or post." : "Add your first employee to start recording payslips."}
      </p>
      {!hasEmployees && (
        <button
          onClick={onAdd}
          className="mt-5 rounded-lg bg-ledger-500 text-white text-sm font-medium px-4 py-2 hover:bg-ledger-600 transition-colors"
        >
          + Add employee
        </button>
      )}
    </div>
  );
}
