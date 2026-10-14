// import { initials, accentFor } from "../lib/helpers";
// import EmployeeActions from "./EmployeeActions";

// const accentStyles = {
//   ledger: "bg-ledger-100 text-ledger-600",
//   gold: "bg-gold-100 text-gold-500",
//   ink: "bg-ink-700/10 text-ink-700",
//   rust: "bg-rust-100 text-rust-600",
// };

// export default function EmployeeCard({ employee, onOpen, onEdit, onDelete }) {
//   const accent = accentStyles[accentFor(employee.name)];

//   // The card is a div (not a <button>) because it contains the edit/delete
//   // buttons, and buttons can't be nested. Keyboard access is kept manually.
//   function handleKeyDown(e) {
//     if (e.target !== e.currentTarget) return; // ignore keys from inner buttons
//     if (e.key === "Enter" || e.key === " ") {
//       e.preventDefault();
//       onOpen(employee);
//     }
//   }

//   return (
//     <div
//       role="button"
//       tabIndex={0}
//       onClick={() => onOpen(employee)}
//       onKeyDown={handleKeyDown}
//       className="group cursor-pointer text-left bg-paper-50 border border-paper-300 rounded-xl p-5 hover:border-ledger-400 hover:shadow-[0_6px_24px_-8px_rgba(22,35,61,0.25)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ledger-500"
//     >
//       <div className="flex items-start justify-between gap-2">
//         <div className={`w-12 h-12 shrink-0 rounded-lg grid place-items-center font-display font-semibold text-lg ${accent}`}>
//           {initials(employee.name)}
//         </div>
//         <div className="flex items-center gap-1.5 min-w-0">
//           <span className="text-[10px] uppercase tracking-wider text-ink-300 font-medium truncate">
//             {employee.department || "General"}
//           </span>
//           <EmployeeActions employee={employee} onEdit={onEdit} onDelete={onDelete} />
//         </div>
//       </div>

//       <h3 className="mt-4 font-display text-lg text-ink-900 leading-snug">{employee.name}</h3>
//       <p className="text-sm text-ink-500">{employee.post}</p>

//       <div className="mt-4 pt-4 border-t border-paper-300 flex items-center justify-between">
//         <span className="text-xs text-ink-500 truncate">{employee.email || "No email on file"}</span>
//         <span className="text-xs font-mono font-medium text-ledger-600 opacity-0 group-hover:opacity-100 transition-opacity">
//           View slips &rarr;
//         </span>
//       </div>
//     </div>
//   );
// }



import { initials, accentFor } from "../lib/helpers";
import EmployeeActions from "./EmployeeActions";

const accentStyles = {
  ledger: "bg-ledger-100 text-ledger-600",
  gold: "bg-gold-100 text-gold-500",
  ink: "bg-ink-700/10 text-ink-700",
  rust: "bg-rust-100 text-rust-600",
};

export default function EmployeeCard({
  employee,
  onOpen,
  onEdit,
  onDelete,
}) {
  const accent = accentStyles[accentFor(employee.name)];

  // Support keyboard navigation while ignoring keys from inner buttons.
  function handleKeyDown(e) {
    if (e.target !== e.currentTarget) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(employee);
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(employee)}
      onKeyDown={handleKeyDown}
      className="group cursor-pointer text-left bg-paper-50 border border-paper-300 rounded-xl p-5 hover:border-ledger-400 hover:shadow-[0_6px_24px_-8px_rgba(22,35,61,0.25)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ledger-500"
    >
      {/* Employee header */}
      <div className="flex items-start justify-between gap-2">
        <div
          className={`w-12 h-12 shrink-0 rounded-lg grid place-items-center font-display font-semibold text-lg ${accent}`}
        >
          {initials(employee.name)}
        </div>

        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] uppercase tracking-wider text-ink-300 font-medium truncate">
            {employee.department || "General"}
          </span>

          <EmployeeActions
            employee={employee}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* Employee details */}
      <h3 className="mt-4 font-display text-lg text-ink-900 leading-snug">
        {employee.name}
      </h3>

      <p className="text-sm text-ink-500">{employee.post}</p>

      {/* Contact information */}
      <div className="mt-3 space-y-2">
        <div className="flex items-start gap-2 text-xs text-ink-500">
          <span className="font-medium shrink-0">Phone:</span>
          <span className="break-all">
            {employee.phone || "Not provided"}
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs text-ink-500">
          <span className="font-medium shrink-0">Parent's Number:</span>
          <span className="break-all">
            {employee.parentsNumber || "Not provided"}
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs text-ink-500">
          <span className="font-medium shrink-0">Email:</span>
          <span className="break-all">
            {employee.email || "No email on file"}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-paper-300 flex justify-end">
        <span className="text-xs font-mono font-medium text-ledger-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View slips &rarr;
        </span>
      </div>
    </div>
  );
}
