import { Booking } from "./data";
// A booking is confirmed only once the 50% advance has been received.
export const advanceDue = (b: Booking) => Math.round(b.total * 0.5);
// Any advance amount confirms the booking; the difference rolls into the next instalment.
export const isConfirmed = (b: Booking) => !b.cancelled && b.payments.length > 0;
export const crewProgress = (b: Booking) => ({ done: b.slots.filter(s => s.status === "assigned").length, total: b.slots.length });
// Dates that another booking has also reserved.
export const conflicts = (b: Booking, bookings: Booking[]) => b.events.flatMap(e =>
  bookings.filter(o => o.id !== b.id && e.date && o.events.some(x => x.date === e.date)).map(o => ({ date: e.date, other: o.couple })));
export const slotLabel = (s: Booking["slots"][number]) =>
  s.status === "assigned" ? (s.person ?? "Assigned") : s.status === "agency" ? `Agency${s.agency ? " · " + s.agency : ""} (awaiting crew)` : "Not assigned";
