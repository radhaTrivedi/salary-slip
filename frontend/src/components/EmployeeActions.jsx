// Small pencil / trash buttons shown on each employee (card + table).
// Clicks are stopped from bubbling so they don't also open the salary slips.

function stop(e) {
  e.stopPropagation();
}

export default function EmployeeActions({ employee, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1" onClick={stop}>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          onEdit(employee);
        }}
        aria-label={`Edit ${employee.name}`}
        title="Edit"
        className="h-8 w-8 grid place-items-center rounded-md text-ink-500 hover:bg-paper-200 hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ledger-500 transition-colors"
      >
        <PencilIcon />
      </button>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          onDelete(employee);
        }}
        aria-label={`Delete ${employee.name}`}
        title="Delete"
        className="h-8 w-8 grid place-items-center rounded-md text-ink-500 hover:bg-rust-100 hover:text-rust-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rust-500 transition-colors"
      >
        <TrashIcon />
      </button>
    </div>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
