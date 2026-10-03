import { createClient } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Booking } from "./data";
import { stageOf } from "./checklist";
import { Quote, quoteTotal } from "./doc";
/* eslint-disable @typescript-eslint/no-explicit-any */
const toBooking = (r: any): Booking => { const tasks = [...(r.production_tasks ?? [])].sort((a: any, b: any) => a.ord - b.ord).map((t: any) => ({ id: t.id, ord: t.ord, label: t.label, done: t.done, doneOn: t.done_on ?? undefined }));
  const qr: any = Array.isArray(r.quotations) ? r.quotations[0] : r.quotations, rev = qr?.quotation_revisions?.find((x: any) => x.revision === qr.current_revision);
  return {
  id: r.id, ref: String(r.ref), couple: r.couple, phone: r.phone ?? "", status: r.status, total: Number(r.total), cancelled: r.status === "Cancelled", cancelledAt: String(r.cancelled_at ?? "").slice(0, 10), refund: Number(r.refund_amount ?? 0), cancelReason: r.cancel_reason ?? "",
  tasks, phase: tasks.length ? stageOf(tasks) : r.phase,
  quote: rev?.data?.quote, addons: [...(r.booking_addons ?? [])].sort((a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at))).map((a: any) => ({ id: a.id, description: a.description, amount: Number(a.amount) })), events: (r.booking_events ?? []).map((e: any) => ({ id: e.id, name: e.name, date: e.event_date ?? "", venue: e.venue ?? "", outdoor: !!e.outdoor })).sort((a: any, b: any) => a.date.localeCompare(b.date)),
  slots: [...(r.booking_slots ?? [])].sort((a: any, b: any) => a.ord - b.ord).map((s: any) => ({ id: s.id, event: s.event_name, role: s.role, status: s.status === "assigned" ? "assigned" : "pending", person: s.person ?? undefined, cost: Number(s.cost ?? 0) })),
  payments: [...(r.payments ?? [])].sort((a: any, b: any) => a.seq - b.seq).map((p: any) => ({ date: p.paid_on, amount: Number(p.amount), seq: Number(p.seq) })),
}; };
export async function getBookings(client?: SupabaseClient): Promise<Booking[]> {
  const sb = client ?? await createClient();
  const { data, error } = await sb.from("bookings").select("*, booking_events(*), booking_slots(*), payments(*), production_tasks(*), booking_addons(*), quotations(current_revision, quotation_revisions(revision, data))").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toBooking);
}
export async function getQuotes() {
  const sb = await createClient();
  const { data, error } = await sb.from("quotations").select("number,status,current_revision,quotation_revisions(revision,total,data)").order("number", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((q: any) => { const r = q.quotation_revisions.find((x: any) => x.revision === q.current_revision);
    return { no: Number(q.number), status: q.status as string, customer: (r?.data?.quote?.customer ?? "") as string, total: Number(r?.total ?? 0) }; });
}
export async function getQuote(no: number, client?: SupabaseClient) {
  const sb = client ?? await createClient();
  const { data, error } = await sb.from("quotations").select("id,number,status,current_revision,quotation_revisions(revision,total,data,created_at),bookings(id,booking_addons(description,amount,created_at))").eq("number", no).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const rev: any = data.quotation_revisions.find((x: any) => x.revision === data.current_revision);
  const bk: any = Array.isArray(data.bookings) ? data.bookings[0] : data.bookings;
  const adds = [...(bk?.booking_addons ?? [])].sort((a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at)));
  const quote: Quote = { ...rev.data.quote, no: Number(data.number), revision: data.current_revision, date: String(rev.created_at).slice(0, 10), status: data.status,
    items: [...rev.data.quote.items, ...adds.map((a: any) => ({ title: a.description, sub: "Added after acceptance", amount: Number(a.amount), discount: 0 }))] };
  return { no: Number(data.number), status: data.status as string, revision: data.current_revision as number, quote, form: rev.data.form,
    revisions: [...data.quotation_revisions].sort((a: any, b: any) => b.revision - a.revision).map((r: any) => ({ revision: r.revision as number, total: Number(r.total), date: String(r.created_at).slice(0, 10) })),
    bookingId: (bk?.id ?? null) as string | null, total: quoteTotal(quote) };
}

export type Expense = { id: string; date: string; amount: number; category: string; note: string; bookingId: string | null };
export async function getExpenses(): Promise<Expense[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("expenses").select("*").order("spent_on", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((e: any) => ({ id: e.id, date: e.spent_on, amount: Number(e.amount), category: e.category, note: e.note ?? "", bookingId: e.booking_id }));
}
export async function getClients() {
  const sb = await createClient();
  const { data, error } = await sb.from("clients").select("id,name,phone,email,quotations(number)").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((c: any) => ({ id: c.id as string, name: c.name as string, phone: (c.phone ?? "") as string, email: (c.email ?? "") as string, quotes: (c.quotations ?? []).length as number }));
}
export async function getClientEmail(phone: string) {
  if (!phone) return "";
  const sb = await createClient(); const { data } = await sb.from("clients").select("email").eq("phone", phone).maybeSingle();
  return (data?.email ?? "") as string;
}
