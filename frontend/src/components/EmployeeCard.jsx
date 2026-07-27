import { initials, accentFor } from "../lib/helpers";

const accentStyles = {
  ledger: "bg-ledger-100 text-ledger-600",
  gold: "bg-gold-100 text-gold-500",
  ink: "bg-ink-700/10 text-ink-700",
  rust: "bg-rust-100 text-rust-600",
};

export default function EmployeeCard({ employee, onOpen }) {
  const accent = accentStyles[accentFor(employee.name)];

  return (
    <button
      onClick={() => onOpen(employee)}
      className="group text-left bg-paper-50 border border-paper-300 rounded-xl p-5 hover:border-ledger-400 hover:shadow-[0_6px_24px_-8px_rgba(22,35,61,0.25)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ledger-500"
    >
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-lg grid place-items-center font-display font-semibold text-lg ${accent}`}>
          {initials(employee.name)}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-ink-300 font-medium mt-1">
          {employee.department || "General"}
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg text-ink-900 leading-snug">{employee.name}</h3>
      <p className="text-sm text-ink-500">{employee.post}</p>

      <div className="mt-4 pt-4 border-t border-paper-300 flex items-center justify-between">
        <span className="text-xs text-ink-500 truncate">{employee.email || "No email on file"}</span>
        <span className="text-xs font-mono font-medium text-ledger-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View slips &rarr;
        </span>
      </div>
    </button>
  );
}
