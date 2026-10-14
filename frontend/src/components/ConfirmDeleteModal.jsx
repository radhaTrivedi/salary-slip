import { motion, AnimatePresence } from "framer-motion";

// Opens whenever `employee` is set; pass null to close.
export default function ConfirmDeleteModal({ employee, deleting, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {employee && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-ink-950/50 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={deleting ? undefined : onClose}
        >
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-employee-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-md bg-paper-50 rounded-2xl border border-paper-300 shadow-2xl p-6"
          >
            <h2 id="delete-employee-title" className="font-display text-xl text-ink-900">
              Delete {employee.name}?
            </h2>
            <p className="text-sm text-ink-500 mt-2">
              This permanently removes the employee, <strong className="text-ink-900">all of their salary slips</strong>,
              and their login (if they have one). This can&apos;t be undone.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-ink-500 hover:text-ink-900 disabled:opacity-60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-rust-500 text-white hover:bg-rust-600 disabled:opacity-60 transition-colors"
              >
                {deleting ? "Deleting…" : "Delete employee"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
