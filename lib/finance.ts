import type { Booking } from "./data";
export const CATEGORIES = ["Editing", "Printing & albums", "Travel", "Crew / agency", "Equipment", "Marketing", "Other"];
export type Range = "month" | "last" | "all";
export const monthOf = (d: string) => d.slice(0, 7);
export const shiftMonth = (key: string, n: number) => { const d = new Date(key + "-01T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 7); };
export const keyFor = (r: Range, today: string) => (r === "all" ? null : r === "last" ? shiftMonth(monthOf(today), -1) : monthOf(today));
export const inRange = (date: string, key: string | null) => key === null || monthOf(date) === key;
export const monthLabel = (key: string) => new Date(key + "-01T00:00:00Z").toLocaleString("en", { month: "short", year: "numeric", timeZone: "UTC" });
export type Exp = { id: string; date: string; amount: number; category: string; note: string; bookingId: string | null; crew?: boolean };
// Crew expenses entered on a booking count as project expenses (dated on the event day).
export const crewExpenses = (bookings: Booking[], today: string): Exp[] => bookings.filter(b => !b.cancelled).flatMap(b => b.slots.filter(s => s.cost > 0).map(s => ({
  id: "crew-" + s.id, amount: s.cost, category: "Crew (from bookings)", bookingId: b.id, crew: true,
  date: b.events.find(e => e.name === s.event)?.date || b.events.find(e => e.date)?.date || b.payments[0]?.date || today,
  note: `${s.role}${s.person ? " – " + s.person : ""} · ${s.event}` })));
