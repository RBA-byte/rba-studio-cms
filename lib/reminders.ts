import { Booking, paidOf } from "./data";
import { schedule } from "./invoice";
import { BRAND, shortDate } from "./brand";
import { pkr } from "./calc";
const dated = (b: Booking) => b.events.map(e => e.date).filter(Boolean).sort();
export type Due = { name: string; due: string; days: number; amount: number; left: number };
// Next instalment: advance is due now, partial payment on the first event day, final after the last event day.
export function nextDue(b: Booking, today: string): Due | null {
  const left = b.total - paidOf(b); if (b.cancelled || left <= 0) return null;
  const rows = schedule(b), i = rows.findIndex(r => r.state !== "paid"), r = rows[i], d = dated(b);
  const due = i === 0 ? today : i === 1 ? d[0] : d[d.length - 1];
  return { name: r.name, due: due ?? "", amount: r.state === "part" ? left : r.amount, left, days: due ? Math.round((Date.parse(due) - Date.parse(today)) / 864e5) : 999 };
}
export const dueSoon = (bookings: Booking[], today: string, within = 3) =>
  bookings.flatMap(b => { const d = nextDue(b, today); return d && d.days <= within ? [{ b, d }] : []; }).sort((x, y) => x.d.days - y.d.days);
export const dueLabel = (days: number) => days < 0 ? `overdue by ${-days} day${days < -1 ? "s" : ""}` : days === 0 ? "due today" : `due in ${days} day${days > 1 ? "s" : ""}`;
export const reminderText = (b: Booking, d: Due) =>
  `Assalam o Alaikum ${b.couple}, a gentle reminder from ${BRAND.name}: the ${d.name.toLowerCase()} of ${pkr(d.amount)} is due ${d.due ? "on " + shortDate(d.due) : "as per schedule"}. Remaining balance: ${pkr(d.left)}. Thank you!`;
export const confirmationText = (b: Booking) =>
  `Assalam o Alaikum ${b.couple}, your booking with ${BRAND.name} is confirmed. ${b.events.map(e => `${e.name}: ${shortDate(e.date)}${e.venue ? " at " + e.venue : ""}`).join("; ")}. Advance received: ${pkr(b.payments[0]?.amount ?? 0)}. Remaining balance: ${pkr(b.total - paidOf(b))}. Thank you for choosing us!`;
