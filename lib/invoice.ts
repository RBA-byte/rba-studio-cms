import { Booking } from "./data";
export const MILESTONES = [
  { name: "Advance", note: "Booking confirmation (no booking without advance)", pct: 50 },
  { name: "Partial payment", note: "On the day of the event", pct: 25 },
  { name: "Final payment", note: "Before raw files are sent for selection", pct: 25 },
];
export const plan = (total: number) => {
  const a = Math.round(total * .5), b = Math.round(total * .25);
  return MILESTONES.map((m, i) => ({ ...m, amount: [a, b, total - a - b][i] }));
};
export const invoiceNo = (year: number, seq: number) => `RBA-INV-${year}-${String(seq).padStart(3, "0")}`;
export function buildInvoice(b: Booking, n: number) {
  const idx = n - 1, pay = b.payments[idx];
  const before = b.payments.slice(0, idx).reduce((s, p) => s + p.amount, 0);
  const received = before + pay.amount, planned = plan(b.total);
  return { pay, before, received, remaining: b.total - received, phase: MILESTONES[idx]?.name ?? "Payment", planned, next: planned[n] ?? null };
}
