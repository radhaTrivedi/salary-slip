// import { initials, accentFor } from "../lib/helpers";
// import EmployeeActions from "./EmployeeActions";

// const accentStyles = {
//   ledger: "bg-ledger-100 text-ledger-600",
//   gold: "bg-gold-100 text-gold-500",
//   ink: "bg-ink-700/10 text-ink-700",
//   rust: "bg-rust-100 text-rust-600",
// };

// export default function EmployeeTable({ employees, onOpen, onEdit, onDelete }) {
//   return (
//     <div className="bg-paper-50 border border-paper-300 rounded-xl overflow-hidden">
//       <table className="w-full text-sm">
//         <thead>
//           <tr className="border-b border-paper-300 text-left text-[11px] uppercase tracking-wider text-ink-500">
//             <th className="px-5 py-3 font-medium">Employee</th>
//             <th className="px-5 py-3 font-medium">Post</th>
//             <th className="px-5 py-3 font-medium hidden sm:table-cell">Department</th>
//             <th className="px-5 py-3 font-medium hidden md:table-cell">Email</th>
//             <th className="px-5 py-3 font-medium text-right">Slips</th>
//             <th className="px-3 py-3 font-medium text-right">
//               <span className="sr-only">Actions</span>
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {employees.map((emp) => (
//             <tr
//               key={emp._id}
//               onClick={() => onOpen(emp)}
//               className="border-b border-paper-200 last:border-b-0 cursor-pointer hover:bg-paper-100 transition-colors"
//             >
//               <td className="px-5 py-3.5">
//                 <div className="flex items-center gap-3">
//                   <span
//                     className={`w-8 h-8 shrink-0 rounded-md grid place-items-center font-display text-sm font-semibold ${accentStyles[accentFor(emp.name)]}`}
//                   >
//                     {initials(emp.name)}
//                   </span>
//                   <span className="font-medium text-ink-900">{emp.name}</span>
//                 </div>
//               </td>
//               <td className="px-5 py-3.5 text-ink-500">{emp.post}</td>
//               <td className="px-5 py-3.5 text-ink-500 hidden sm:table-cell">{emp.department || "General"}</td>
//               <td className="px-5 py-3.5 text-ink-500 hidden md:table-cell">{emp.email || "—"}</td>
//               <td className="px-5 py-3.5 text-right font-mono text-ledger-600">View &rarr;</td>
//               <td className="px-3 py-2.5">
//                 <div className="flex justify-end">
//                   <EmployeeActions employee={emp} onEdit={onEdit} onDelete={onDelete} />
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
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

export default function EmployeeTable({
  employees,
  onOpen,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-paper-50 border border-paper-300 rounded-xl overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-paper-300 text-left text-[11px] uppercase tracking-wider text-ink-500">
            <th className="px-5 py-3 font-medium">Employee</th>
            <th className="px-5 py-3 font-medium">Post</th>

            <th className="px-5 py-3 font-medium hidden sm:table-cell">
              Department
            </th>

            <th className="px-5 py-3 font-medium hidden md:table-cell">
              Phone
            </th>

            <th className="px-5 py-3 font-medium hidden lg:table-cell">
              Parent's Number
            </th>

            <th className="px-5 py-3 font-medium hidden md:table-cell">
              Email
            </th>

            <th className="px-5 py-3 font-medium text-right">
              Slips
            </th>

            <th className="px-3 py-3 font-medium text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {employees.map((emp) => (
            <tr
              key={emp._id}
              onClick={() => onOpen(emp)}
              className="border-b border-paper-200 last:border-b-0 cursor-pointer hover:bg-paper-100 transition-colors"
            >
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-8 h-8 shrink-0 rounded-md grid place-items-center font-display text-sm font-semibold ${
                      accentStyles[accentFor(emp.name)]
                    }`}
                  >
                    {initials(emp.name)}
                  </span>

                  <span className="font-medium text-ink-900">
                    {emp.name}
                  </span>
                </div>
              </td>

              <td className="px-5 py-3.5 text-ink-500">
                {emp.post}
              </td>

              <td className="px-5 py-3.5 text-ink-500 hidden sm:table-cell">
                {emp.department || "General"}
              </td>

              <td className="px-5 py-3.5 text-ink-500 hidden md:table-cell">
                {emp.phone || "—"}
              </td>

              <td className="px-5 py-3.5 text-ink-500 hidden lg:table-cell">
                {emp.parentsNumber || "—"}
              </td>

              <td className="px-5 py-3.5 text-ink-500 hidden md:table-cell">
                {emp.email || "—"}
              </td>

              <td className="px-5 py-3.5 text-right font-mono text-ledger-600">
                View &rarr;
              </td>

              <td className="px-3 py-2.5">
                <div className="flex justify-end">
                  <EmployeeActions
                    employee={emp}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
