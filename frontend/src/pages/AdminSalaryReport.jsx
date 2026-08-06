import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../api.js";

const MONTH_ORDER = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const slip = payload[0].payload;
  return (
    <div className="rounded-lg border border-ink-100 bg-white px-3.5 py-2.5 shadow-lg">
      <p className="text-xs font-medium text-ink-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-ink-900">
        {currency(slip.finalSalary)}
      </p>
      {slip.leaveDays > 0 && (
        <p className="text-xs text-ink-400 mt-0.5">
          {slip.leaveDays} leave day{slip.leaveDays !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="flex-1 rounded-lg border border-ink-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <p className={`mt-1 text-xl font-display font-semibold ${accent}`}>
        {value}
      </p>
    </div>
  );
}

export default function AdminSalaryReport() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/employees")
      .then((res) => setEmployees(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load employees")
      );
  }, []);

  useEffect(() => {
    if (!selectedEmployee) {
      setSlips([]);
      return;
    }
    setLoading(true);
    setError("");
    api
      .get(`/salary/employee/${selectedEmployee}`)
      .then((res) => {
        const sorted = [...res.data].sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month);
        });
        setSlips(sorted);
      })
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load salary slips")
      )
      .finally(() => setLoading(false));
  }, [selectedEmployee]);

  const chartData = slips.map((slip) => ({
    label: `${slip.month.slice(0, 3)} ${String(slip.year).slice(-2)}`,
    finalSalary: slip.finalSalary,
    leaveDays: (slip.fullDays || 0) + (slip.halfDays || 0) * 0.5,
  }));

  const totalPaid = slips.reduce((sum, s) => sum + (s.finalSalary || 0), 0);
  const latest = slips[slips.length - 1];
  const average = slips.length > 0 ? totalPaid / slips.length : 0;

  const selectedEmployeeName = employees.find(
    (e) => e._id === selectedEmployee
  )?.name;

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-5">
        <h2 className="font-display text-xl font-semibold text-ink-900">
          Salary Report
        </h2>
        <p className="text-sm text-ink-400 mt-0.5">
          Month-by-month salary paid to an employee.
        </p>
      </div>

      <div className="rounded-lg border border-ink-100 bg-white p-4 shadow-sm mb-5">
        <label
          htmlFor="employee-select"
          className="block text-[11px] font-medium uppercase tracking-wide text-ink-400 mb-1.5"
        >
          Select employee
        </label>
        <select
          id="employee-select"
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full md:w-72 rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ink-900/20 focus:border-ink-900 transition"
        >
          <option value="">-- Choose an employee --</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name} {emp.post ? `(${emp.post})` : ""}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 mb-5">
          {error}
        </div>
      )}

      {loading && (
        <div className="rounded-lg border border-ink-100 bg-white p-8 text-center text-sm text-ink-400 shadow-sm">
          Loading…
        </div>
      )}

      {!loading && selectedEmployee && chartData.length === 0 && !error && (
        <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 p-8 text-center text-sm text-ink-400">
          No salary slips found for this employee yet.
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <>
          <div className="mb-5 grid grid-cols-3 gap-3">
            <StatCard
              label="Total paid till date"
              value={currency(totalPaid)}
              accent="text-ink-900"
            />
            <StatCard
              label="Latest month"
              value={currency(latest?.finalSalary)}
              accent="text-blue-700"
            />
            <StatCard
              label="Monthly average"
              value={currency(average)}
              accent="text-green-700"
            />
          </div>

          <div className="rounded-lg border border-ink-100 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">
                {selectedEmployeeName}
              </h3>
              <span className="text-xs text-ink-400">
                {chartData.length} month{chartData.length !== 1 ? "s" : ""}
              </span>
            </div>

            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0f3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#8b8f98" }}
                  axisLine={{ stroke: "#eef0f3" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#8b8f98" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
                  width={42}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f4f6fb" }} />
                <Bar
                  dataKey="finalSalary"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {!selectedEmployee && !loading && (
        <div className="rounded-lg border border-dashed border-ink-200 bg-ink-50/40 p-8 text-center text-sm text-ink-400">
          Pick an employee above to see their salary report.
        </div>
      )}
    </div>
  );
}