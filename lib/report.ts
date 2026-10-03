import type { Booking } from "./data";
import { paidOf } from "./data";
import type { Expense } from "./db";
export const defaultRange = (today: string) => { const ym = today.slice(0, 7);
  return { from: `${ym}-01`, to: new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5), 0)).toISOString().slice(0, 10) }; };
export type RepWedding = { b: Booking; days: { event: string; date: string; venue: string; crew: { label: string; cost: number }[] }[];
  crew: number; misc: number; totalExp: number; paid: number; pending: number; profit: number };
export function buildReport(bookings: Booking[], manual: Expense[], from: string, to: string) {
  const weds: RepWedding[] = bookings.filter(b => !b.cancelled && b.events.some(e => e.date && e.date >= from && e.date <= to))
    .sort((a, b) => (a.events[0]?.date ?? "").localeCompare(b.events[0]?.date ?? "")).map(b => {
      const crew = b.slots.reduce((s, x) => s + x.cost, 0), misc = manual.filter(e => e.bookingId === b.id).reduce((s, e) => s + e.amount, 0), paid = paidOf(b);
      return { b, crew, misc, totalExp: crew + misc, paid, pending: b.total - paid, profit: paid - b.refund - crew - misc,
        days: b.events.map(e => ({ event: e.name, date: e.date, venue: e.venue, crew: b.slots.filter(s => s.event === e.name).map(s => ({ label: `${s.role}: ${s.person || "Not assigned"}`, cost: s.cost })) })) };
    });
  return { weds, total: weds.reduce((s, w) => s + w.profit, 0) };
}
