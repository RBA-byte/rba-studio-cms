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
export type Row = { name: string; note: string; pct: number; amount: number; state: "paid" | "part" | "due" };
// Flexible schedule: payment #1 confirms the booking whatever its size, payment #2 settles up to 75% target
// (shortfall/excess carries over), the final instalment is the remaining balance.
export function schedule(b: Booking): Row[] {
  const P = b.payments.map(p => p.amount), t = b.total, sum = P.reduce((s, x) => s + x, 0);
  const m1 = P[0] ?? Math.round(t * .5), m2 = P[1] ?? Math.max(0, Math.round(t * .75) - m1), m3 = Math.max(0, t - m1 - m2);
  return [
    { ...MILESTONES[0], amount: m1, state: P.length >= 1 ? "paid" : "due" },
    { ...MILESTONES[1], amount: m2, state: P.length >= 2 ? "paid" : "due" },
    { ...MILESTONES[2], amount: m3, state: sum >= t ? "paid" : P.length >= 3 ? "part" : "due" },
  ];
}
export function buildInvoice(b: Booking, n: number) {
  const idx = n - 1, pay = b.payments[idx];
  const before = b.payments.slice(0, idx).reduce((s, p) => s + p.amount, 0), received = before + pay.amount, rows = schedule(b), mi = Math.min(idx, 2);
  const remaining = b.total - received;
  const next = idx < 2 ? rows[idx + 1] : remaining > 0 ? { ...rows[2], name: "Final payment (balance)", amount: remaining } : null;
  return { pay, before, received, remaining, phase: MILESTONES[mi].name, rows, mi, next };
}
