import { currency } from "../lib/helpers";

export default function Payslip({ slip, employee }) {
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