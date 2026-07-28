import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { exportSlipsToExcel } from "../lib/helpers";
import Payslip from "../components/Payslip";

export default function MySalarySlips() {
  const { user } = useAuth();
  const employee = user?.employee;

  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (!employee?.id) return;
    setLoading(true);
    api
      .get(`/salary/employee/${employee.id}`)
      .then(({ data }) => {
        setSlips(data);
        setActiveId(data[0]?._id || null);
      })
      .catch(() => toast.error("Could not load your salary slips"))
      .finally(() => setLoading(false));
  }, [employee?.id]);

  const active = slips.find((s) => s._id === activeId);

  function handlePrint() {
    window.print();
  }

  async function handleExcel() {
    if (slips.length === 0) {
      toast.error("No salary slips to export yet");
      return;
    }
    try {
      await exportSlipsToExcel(employee, slips);
      toast.success("Excel file downloaded");
    } catch {
      toast.error("Could not export to Excel");
    }
  }

  if (!employee) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-sm text-ink-500">
        Your account isn't linked to an employee record yet — ask your admin to fix this.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-wider text-ledger-600 font-medium">My payroll</p>
          <h1 className="font-display text-3xl text-ink-900 mt-1">{employee.name}</h1>
          <p className="text-sm text-ink-500">{employee.post}</p>
        </div>
        <div className="flex items-center gap-2">
          <HeaderButton onClick={handlePrint} label="Print" />
          <HeaderButton onClick={handleExcel} label="Excel" />
        </div>
      </header>

      <div className="bg-paper-50 border border-paper-300 rounded-xl overflow-hidden flex flex-col sm:flex-row min-h-[400px]">
        <div className="sm:w-52 shrink-0 border-b sm:border-b-0 sm:border-r border-paper-300 overflow-x-auto sm:overflow-y-auto slip-scroll max-h-40 sm:max-h-none">
          {loading ? (
            <p className="p-4 text-sm text-ink-300">Loading…</p>
          ) : slips.length === 0 ? (
            <p className="p-4 text-sm text-ink-300">No salary slips yet.</p>
          ) : (
            <div className="flex sm:flex-col">
              {slips.map((s) => (
                <button
                  key={s._id}
                  onClick={() => setActiveId(s._id)}
                  className={`text-left px-4 py-3 text-sm border-l-2 whitespace-nowrap sm:whitespace-normal transition-colors ${
                    s._id === activeId
                      ? "border-ledger-500 bg-ledger-100/60 text-ink-900 font-medium"
                      : "border-transparent text-ink-500 hover:bg-paper-100"
                  }`}
                >
                  {s.month} {s.year}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto slip-scroll p-6">
          {!loading && !active && (
            <div className="h-full grid place-items-center text-center text-ink-300 text-sm py-16">
              No payslip on record yet.
            </div>
          )}
          {active && (
            <div className="payslip-print-area">
              <Payslip slip={active} employee={employee} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HeaderButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-medium px-3 py-1.5 rounded-md bg-ink-900 text-white hover:bg-ink-800 transition-colors"
    >
      {label}
    </button>
  );
}