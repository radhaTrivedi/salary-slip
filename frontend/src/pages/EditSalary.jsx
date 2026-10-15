import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api";
import { MONTHS, currency } from "../lib/helpers";

const fields = [
  ["basicSalary", "Basic salary"], ["workingDays", "Working days"],
  ["fullDays", "Full-day leave"], ["halfDays", "Half-day leave"],
  ["travelExpense", "Travel expense"], ["pf", "PF deduction"],
];

export default function EditSalary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/salary/${id}`).then(({ data }) => setForm({
      month: data.month, year: data.year, basicSalary: data.basicSalary ?? 0,
      workingDays: data.workingDays ?? 30, fullDays: data.fullDays ?? 0,
      halfDays: data.halfDays ?? 0, travelExpense: data.travelExpense ?? 0,
      pf: data.pf ?? 0, paymentMethod: data.paymentMethod || "cash", note: data.note || "",
      employeeName: data.employeeName,
    })).catch((err) => toast.error(err.response?.data?.message || "Could not load salary slip"));
  }, [id]);

  function update(key, value) { setForm((old) => ({ ...old, [key]: value })); }

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      delete payload.employeeName;
      for (const key of ["year", "basicSalary", "workingDays", "fullDays", "halfDays", "travelExpense", "pf"]) payload[key] = Number(payload[key]) || 0;
      await api.put(`/salary/${id}`, payload);
      toast.success("Salary slip updated and totals recalculated");
      navigate("/admin/reports");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update salary slip");
    } finally { setSaving(false); }
  }

  if (!form) return <div className="p-8 text-sm text-ink-500">Loading salary slip…</div>;
  const basic = Number(form.basicSalary) || 0, days = Number(form.workingDays) || 30;
  const earned = (days - (Number(form.fullDays)||0) - (Number(form.halfDays)||0)) * (days ? basic/days : 0) + (Number(form.halfDays)||0) * (days ? basic/days/2 : 0);
  const finalSalary = earned + (Number(form.travelExpense)||0) - (Number(form.pf)||0);

  return <div className="mx-auto max-w-3xl px-6 py-10">
    <header className="mb-7"><p className="text-xs uppercase tracking-wider text-ledger-600">Admin action</p><h1 className="mt-1 font-display text-3xl text-ink-900">Edit salary slip</h1><p className="mt-2 text-sm text-ink-500">{form.employeeName}</p></header>
    <form onSubmit={submit} className="rounded-xl border border-paper-300 bg-white p-6">
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-xs font-medium text-ink-500">Month<select value={form.month} onChange={e=>update("month",e.target.value)} className="mt-1 block w-full rounded-lg border border-paper-300 px-3 py-2.5 text-sm">{MONTHS.map(m=><option key={m}>{m}</option>)}</select></label>
        <label className="text-xs font-medium text-ink-500">Year<input type="number" value={form.year} onChange={e=>update("year",e.target.value)} className="mt-1 block w-full rounded-lg border border-paper-300 px-3 py-2.5 text-sm" required /></label>
        {fields.map(([key,label])=><label key={key} className="text-xs font-medium text-ink-500">{label}<input type="number" min="0" step="any" value={form[key]} onChange={e=>update(key,e.target.value)} className="mt-1 block w-full rounded-lg border border-paper-300 px-3 py-2.5 text-sm" required /></label>)}
        <label className="text-xs font-medium text-ink-500">Payment method<select value={form.paymentMethod} onChange={e=>update("paymentMethod",e.target.value)} className="mt-1 block w-full rounded-lg border border-paper-300 px-3 py-2.5 text-sm"><option value="cash">Cash</option><option value="online">Online</option></select></label>
        {form.paymentMethod === "online" && <label className="text-xs font-medium text-ink-500 sm:col-span-2">Payment note<textarea value={form.note} onChange={e=>update("note",e.target.value)} className="mt-1 block w-full rounded-lg border border-paper-300 px-3 py-2.5 text-sm" rows="2" /></label>}
      </div>
      <div className="mb-5 rounded-lg bg-ink-900 p-4 text-white"><p className="text-xs text-white/60">Estimated final salary (recalculated on save)</p><p className="mt-1 font-mono text-2xl font-semibold">{currency(finalSalary)}</p></div>
      <div className="flex gap-3"><button disabled={saving} className="rounded-lg bg-ledger-500 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button><button type="button" onClick={()=>navigate("/admin/reports")} className="rounded-lg border border-paper-300 px-5 py-2.5 text-sm">Cancel</button></div>
    </form>
  </div>;
}
