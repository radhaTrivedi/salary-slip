import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api";
import { currency, initials, exportSlipsToExcel } from "../lib/helpers";
import SixMonthSlipModal from "./SixMonthSlipModal";

export default function SalarySlipModal({ employee, onClose }) {
  const [slips, setSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [sixMonthOpen, setSixMonthOpen] = useState(false);

  useEffect(() => {
    if (!employee) return;
    setLoading(true);
    api
      .get(`/salary/employee/${employee._id}`)
      .then(({ data }) => {
        setSlips(data);
        setActiveId(data[0]?._id || null);
      })
      .catch(() => toast.error("Could not load salary slips"))
      .finally(() => setLoading(false));
  }, [employee]);

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

  return (
    <AnimatePresence>
      {employee && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-3xl max-h-[88vh] bg-paper-50 rounded-2xl border border-paper-300 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-paper-300 bg-ink-900 text-paper-100">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-white/10 grid place-items-center font-display font-semibold">
                  {initials(employee.name)}
                </span>
                <div>
                  <p className="font-display text-lg leading-tight">{employee.name}</p>
                  <p className="text-xs text-ink-300">{employee.post}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <HeaderButton onClick={handlePrint} label="Print" />
                <HeaderButton onClick={handleExcel} label="Excel" />
                <HeaderButton onClick={() => setSixMonthOpen(true)} label="6-month slip" />
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="w-8 h-8 grid place-items-center rounded-full hover:bg-white/10 transition-colors ml-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex flex-1 min-h-0 flex-col sm:flex-row">
              {/* Month rail */}
              <div className="sm:w-48 shrink-0 border-b sm:border-b-0 sm:border-r border-paper-300 overflow-x-auto sm:overflow-y-auto slip-scroll max-h-40 sm:max-h-none">
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
                        className={`text-left px-4 py-3 text-sm border-l-2 sm:border-l-2 whitespace-nowrap sm:whitespace-normal transition-colors ${
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

              {/* Payslip detail */}
              <div className="flex-1 overflow-y-auto slip-scroll p-6">
                {!loading && !active && (
                  <div className="h-full grid place-items-center text-center text-ink-300 text-sm py-16">
                    No payslip on record yet for this employee.
                  </div>
                )}
                {active && (
                  <div className="payslip-print-area">
                    <Payslip slip={active} employee={employee} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          <SixMonthSlipModal
            open={sixMonthOpen}
            onClose={() => setSixMonthOpen(false)}
            employee={employee}
            slips={slips}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function HeaderButton({ onClick, label }) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-medium px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
    >
      {label}
    </button>
  );
}

function Payslip({ slip, employee }) {
  return (
    <div className="relative bg-paper-50 border border-paper-300 rounded-xl p-6">
      <span className="paid-stamp absolute top-4 right-4 text-xs font-semibold px-3 py-1 select-none">
        PAID
      </span>

      <div className="flex items-center gap-3 pr-16 mb-1">
        <img src="/logo.png" alt="ROBO+ EduTech" className="h-8 w-auto" />
      </div>

      <div className="pr-16">
        <p className="text-[11px] uppercase tracking-wider text-ink-500">Payslip for</p>
        <h3 className="font-display text-2xl text-ink-900 mt-0.5">
          {slip.month} {slip.year}
        </h3>
        <p className="text-sm text-ink-500 mt-1">
          {employee.name} &middot; {employee.post}
        </p>
      </div>

      <div className="tear-line mt-6 mb-5" />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <Row label="Basic salary" value={currency(slip.basicSalary)} />
        <Row label="Working days" value={`${slip.workingDays} days`} />
        <Row label="Per day salary" value={currency(slip.perDaySalary)} />
        <Row label="Per hour salary" value={currency(slip.perHourSalary)} />
        <Row label="Full day leave" value={slip.fullDays} />
        <Row label="Half day leave" value={slip.halfDays} />
        <Row label="Travelling expense" value={currency(slip.travelExpense)} />
        <Row label="PF deduction" value={`− ${currency(slip.pf)}`} tone="rust" />
        <Row label="Payment method" value={slip.paymentMethod === "online" ? "Online" : "Cash"} />
      </dl>

      {slip.paymentMethod === "online" && slip.note && (
        <div className="mt-4 rounded-lg bg-gold-100/60 border border-gold-100 px-3 py-2 text-xs text-ink-500">
          <span className="font-medium text-ink-900">Note: </span>
          {slip.note}
        </div>
      )}

      <div className="tear-line mt-5 mb-5" />

      <dl className="space-y-2.5 text-sm">
        <Row label="Earned (attendance) salary" value={currency(slip.earnedSalary)} wide />
        <Row label="Gross salary" value={currency(slip.grossSalary)} wide />
        <div className="flex items-baseline justify-between pt-2 mt-1 border-t border-paper-300">
          <span className="font-display text-base text-ink-900">Final salary</span>
          <span className="font-mono text-xl font-semibold text-ledger-600">
            {currency(slip.finalSalary)}
          </span>
        </div>
      </dl>
    </div>
  );
}

function Row({ label, value, wide, tone }) {
  return (
    <div className={`flex items-baseline justify-between ${wide ? "col-span-2" : ""}`}>
      <dt className="text-ink-500">{label}</dt>
      <dd className={`font-mono ${tone === "rust" ? "text-rust-600" : "text-ink-900"}`}>{value}</dd>
    </div>
  );
}
