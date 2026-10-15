
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import { currency } from "../lib/helpers";

export default function PFRetention() {
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadReport() {
    setLoading(true);
    setErrorMessage("");

    try {
      const { data } = await api.get("/salary/report/pf");

      if (!data || !Array.isArray(data.data)) {
        throw new Error("Unexpected PF report format from server.");
      }

      setEmployees(data.data);

      // Select the first employee automatically if none is selected.
      setEmployeeId((currentId) => {
        const stillExists = data.data.some(
          (employee) => employee.employeeId === currentId
        );

        return stillExists
          ? currentId
          : data.data[0]?.employeeId || "";
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Could not load the PF report.";

      setEmployees([]);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) =>
      `${employee.employeeName} ${employee.employeeCode}`
        .toLowerCase()
        .includes(query)
    );
  }, [employees, search]);

  const selectedEmployee = employees.find(
    (employee) => employee.employeeId === employeeId
  );

  const records = selectedEmployee?.records || [];

  const totalPF = records.reduce(
    (sum, record) => sum + Number(record.pf || 0),
    0
  );

  const deductedCount = records.filter(
    (record) => record.status === "Deducted"
  ).length;

  const notDeductedCount = records.filter(
    (record) => record.status !== "Deducted"
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-7">
        <p className="text-xs font-medium uppercase tracking-wider text-ledger-600">
          Admin report
        </p>

        <h1 className="mt-1 font-display text-3xl text-ink-900">
          PF Retention
        </h1>

        <p className="mt-2 text-sm text-ink-500">
          Select an employee to view all available salary-slip PF records,
          across months and years.
        </p>
      </header>

      <div className="mb-5 rounded-xl border border-paper-300 bg-paper-50 p-4">
        <label className="mb-1 block text-xs font-medium text-ink-500">
          Search employee
        </label>

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by employee name or code..."
          className="mb-3 w-full rounded-lg border border-paper-300 bg-white px-3 py-2 text-sm"
        />

        <label className="mb-1 block text-xs font-medium text-ink-500">
          Select employee
        </label>

        <select
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
          disabled={loading}
          className="w-full rounded-lg border border-paper-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Select an employee</option>

          {filteredEmployees.map((employee) => (
            <option
              key={employee.employeeId}
              value={employee.employeeId}
            >
              {employee.employeeName}
              {employee.employeeCode
                ? ` (${employee.employeeCode})`
                : ""}
            </option>
          ))}
        </select>

        <button
          onClick={loadReport}
          disabled={loading}
          className="mt-3 rounded-lg bg-ledger-500 px-4 py-2 text-sm font-medium text-white hover:bg-ledger-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errorMessage}
        </div>
      )}

      {selectedEmployee && (
        <>
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-ink-900">
              {selectedEmployee.employeeName}
            </h2>

            {selectedEmployee.employeeCode && (
              <p className="mt-1 text-sm text-ink-500">
                Employee code: {selectedEmployee.employeeCode}
              </p>
            )}
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="Total PF" value={currency(totalPF)} />
            <Stat label="Records with PF deducted" value={deductedCount} />
            <Stat label="Records with no PF" value={notDeductedCount} />
          </div>

          <div className="overflow-x-auto rounded-xl border border-paper-300 bg-white">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-paper-100 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3 text-right">PF amount</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-paper-200">
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-ink-400"
                    >
                      No salary-slip records found for this employee.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr
                      key={record.salarySlipId}
                      className="hover:bg-paper-50"
                    >
                      <td className="px-4 py-3">
                        {record.month}
                      </td>

                      <td className="px-4 py-3">
                        {record.year || "—"}
                      </td>

                      <td className="px-4 py-3 text-right font-mono">
                        {currency(record.pf)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            record.status === "Deducted"
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !errorMessage && employees.length === 0 && (
        <p className="py-8 text-center text-ink-400">
          No employees found.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-paper-300 bg-white p-4">
      <p className="text-xs uppercase tracking-wide text-ink-400">
        {label}
      </p>

      <p className="mt-1 font-display text-2xl font-semibold text-ink-900">
        {value}
      </p>
    </div>
  );
}
