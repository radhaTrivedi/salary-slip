import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { MONTHS, currency, currencyForPdf } from "../lib/helpers";
import { LOGO_BASE64 } from "../lib/logo";

function monthIndex(monthName, year) {
  return year * 12 + MONTHS.indexOf(monthName);
}

export default function SixMonthSlipModal({ open, onClose, employee, slips }) {
  const now = new Date();
  const [fromMonth, setFromMonth] = useState(MONTHS[now.getMonth()]);
  const [fromYear, setFromYear] = useState(now.getFullYear());
  const [toMonth, setToMonth] = useState(MONTHS[now.getMonth()]);
  const [toYear, setToYear] = useState(now.getFullYear());

  const yearOptions = useMemo(() => {
    const years = new Set(slips.map((s) => s.year));
    years.add(now.getFullYear());
    return Array.from(years).sort();
  }, [slips]);

  const matched = useMemo(() => {
    const start = monthIndex(fromMonth, fromYear);
    const end = monthIndex(toMonth, toYear);
    const [lo, hi] = start <= end ? [start, end] : [end, start];

    return slips
      .filter((s) => {
        const idx = monthIndex(s.month, s.year);
        return idx >= lo && idx <= hi;
      })
      .sort(
        (a, b) => monthIndex(a.month, a.year) - monthIndex(b.month, b.year),
      );
  }, [slips, fromMonth, fromYear, toMonth, toYear]);

  const total = matched.reduce((sum, s) => sum + Number(s.finalSalary || 0), 0);

  function generatePdf() {
    if (matched.length === 0) {
      toast.error("No salary slips fall in that date range");
      return;
    }

    const doc = new jsPDF();

    doc.addImage(LOGO_BASE64, "PNG", 14, 10, 42, 18);
    doc.setFontSize(15);
    doc.setTextColor(31, 63, 128);
    doc.text("Salary Slip Summary", 62, 20);
    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    // doc.text(`${employee.name} — ${employee.post}`, 62, 27);
    // doc.text(
    //   `${fromMonth} ${fromYear} to ${toMonth} ${toYear}`,
    //   62,
    //   33
    // );

    // const rows = matched.map((s) => [
    //   `${s.month} ${s.year}`,
    //   currency(s.basicSalary),
    //   currency(s.travelExpense),
    //   currency(s.pf),
    //   s.paymentMethod === "online" ? "Online" : "Cash",
    //   currency(s.finalSalary),
    // ]);

    doc.text(`${employee.name} - ${employee.post}`, 62, 27);
    doc.text(`${fromMonth} ${fromYear} to ${toMonth} ${toYear}`, 62, 33);

    const rows = matched.map((s) => [
      `${s.month} ${s.year}`,
      currencyForPdf(s.basicSalary),
      currencyForPdf(s.travelExpense),
      currencyForPdf(s.pf),
      s.paymentMethod === "online" ? "Online" : "Cash",
      currencyForPdf(s.finalSalary),
    ]);
    rows.push(["Total paid", "", "", "", "", currencyForPdf(total)]);
    // rows.push(["Total paid", "", "", "", "", currency(total)]);

    autoTable(doc, {
      startY: 42,
      head: [["Month", "Basic", "Travel", "PF", "Payment", "Final salary"]],
      body: rows,
      headStyles: { fillColor: [31, 63, 128] },
      didParseCell: (data) => {
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.fillColor = [219, 243, 247];
        }
      },
    });

    doc.save(`${employee.name.replace(/\s+/g, "_")}_6month_salary_slip.pdf`);
    toast.success("6-month salary slip PDF downloaded");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-ink-950/50 backdrop-blur-sm p-4"
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
            className="w-full max-w-md bg-paper-50 rounded-2xl border border-paper-300 shadow-2xl p-6"
          >
            <h2 className="font-display text-xl text-ink-900">
              6-month salary slip
            </h2>
            <p className="text-sm text-ink-500 mt-1">
              Choose a date range for {employee.name} — we'll total the final
              salary paid across it.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <span className="text-xs font-medium text-ink-500">From</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <select
                    value={fromMonth}
                    onChange={(e) => setFromMonth(e.target.value)}
                    className="rounded-lg border border-paper-300 bg-paper-50 px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ledger-400"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={fromYear}
                    onChange={(e) => setFromYear(Number(e.target.value))}
                    className="rounded-lg border border-paper-300 bg-paper-50 px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ledger-400"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-ink-500">To</span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <select
                    value={toMonth}
                    onChange={(e) => setToMonth(e.target.value)}
                    className="rounded-lg border border-paper-300 bg-paper-50 px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ledger-400"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={toYear}
                    onChange={(e) => setToYear(Number(e.target.value))}
                    className="rounded-lg border border-paper-300 bg-paper-50 px-3 py-2 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-ledger-400"
                  >
                    {yearOptions.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-ledger-100/60 border border-ledger-100 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-500">
                  {matched.length} slip(s) in range
                </span>
                <span className="font-mono font-semibold text-ledger-600">
                  {currency(total)}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-ink-500 hover:text-ink-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={generatePdf}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-ledger-500 text-white hover:bg-ledger-600 transition-colors"
              >
                Download PDF
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
