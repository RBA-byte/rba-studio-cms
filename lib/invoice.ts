import { Booking } from "./data";
export const MILESTONES = [
  { name: "Advance", note: "Booking confirmation", pct: 50 },
  { name: "Partial payment", note: "Wedding day", pct: 25 },
  { name: "Final payment", note: "Before raw files are sent for selection", pct: 25 },
];
// Invoice numbers are sequential per payment: RBA-INV-2026-001, -002, ...
export const invoiceNo = (year: number, seq: number) => `RBA-INV-${year}-${String(seq).padStart(3, "0")}`;
export function buildInvoice(b: Booking, n: number) {
  const idx = n - 1, pay = b.payments[idx];
  const before = b.payments.slice(0, idx).reduce((s, p) => s + p.amount, 0);
  const received = before + pay.amount;
  const planned = MILESTONES.map((m, i) => ({ ...m, amount: i === 2 ? b.total - Math.round(b.total*.5) - Math.round(b.total*.25) : Math.round(b.total * m.pct / 100) }));
  const next = planned[n] ?? null;
  return { pay, before, received, remaining: b.total - received, phase: MILESTONES[idx]?.name ?? "Payment", planned, next };
}
