export const PHASES = ["Quotation","Booked","Shoot","Selection","Editing","Albums","Delivered"] as const;
export type Payment = { date: string; amount: number; seq: number };
export type Slot = { id?: string; event: string; role: string; status: "assigned" | "pending" | "agency"; person?: string; agency?: string };
export type Booking = { id: string; ref: string; couple: string; phone: string; status: string; phase: number; total: number;
  events: { name: string; date: string; venue: string }[]; slots: Slot[]; payments: Payment[] };
export const paidOf = (b: Booking) => b.payments.reduce((s, p) => s + p.amount, 0);
