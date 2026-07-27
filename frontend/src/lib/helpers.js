export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function currency(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

// Deterministic soft accent color per employee, derived from their name.
const ACCENTS = ["ledger", "gold", "ink", "rust"];
export function accentFor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

export async function exportSlipsToExcel(employee, slips) {
  const XLSX = await import("xlsx");

  const rows = slips.map((s) => ({
    Month: s.month,
    Year: s.year,
    "Working days": s.workingDays,
    "Full day leave": s.fullDays,
    "Half day leave": s.halfDays,
    "Basic salary": s.basicSalary,
    "Per day salary": s.perDaySalary,
    "Per hour salary": s.perHourSalary,
    "Travelling expense": s.travelExpense,
    "PF deduction": s.pf,
    "Payment method": s.paymentMethod === "online" ? "Online" : "Cash",
    Note: s.note || "",
    "Earned salary": s.earnedSalary,
    "Gross salary": s.grossSalary,
    "Final salary": s.finalSalary,
  }));

  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Salary slips");
  XLSX.writeFile(workbook, `${employee.name.replace(/\s+/g, "_")}_salary_history.xlsx`);
}

export function currencyForPdf(value) {
  const n = Number(value) || 0;
  const formatted = n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `Rs. ${formatted}`;
}