import { createClient } from "./supabase";
import { Booking } from "./data";
import { stageOf } from "./checklist";
import { Quote, quoteTotal } from "./doc";
/* eslint-disable @typescript-eslint/no-explicit-any */
const toBooking = (r: any): Booking => { const tasks = [...(r.production_tasks ?? [])].sort((a: any, b: any) => a.ord - b.ord).map((t: any) => ({ id: t.id, ord: t.ord, label: t.label, done: t.done, doneOn: t.done_on ?? undefined }));
  return {
  id: r.id, ref: String(r.ref), couple: r.couple, phone: r.phone ?? "", status: r.status, total: Number(r.total), cancelled: r.status === "Cancelled", refund: Number(r.refund_amount ?? 0), cancelReason: r.cancel_reason ?? "",
  tasks, phase: tasks.length ? stageOf(tasks) : r.phase,
  events: (r.booking_events ?? []).map((e: any) => ({ id: e.id, name: e.name, date: e.event_date ?? "", venue: e.venue ?? "", outdoor: !!e.outdoor })).sort((a: any, b: any) => a.date.localeCompare(b.date)),
  slots: [...(r.booking_slots ?? [])].sort((a: any, b: any) => a.ord - b.ord).map((s: any) => ({ id: s.id, event: s.event_name, role: s.role, status: s.status, person: s.person ?? undefined, agency: s.agency ?? undefined })),
  payments: [...(r.payments ?? [])].sort((a: any, b: any) => a.seq - b.seq).map((p: any) => ({ date: p.paid_on, amount: Number(p.amount), seq: Number(p.seq) })),
}; };
export async function getBookings(): Promise<Booking[]> {
  const sb = await createClient();
  const { data, error } = await sb.from("bookings").select("*, booking_events(*), booking_slots(*), payments(*), production_tasks(*)").order("created_at", { ascending: false });
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
export async function getQuote(no: number) {
  const sb = await createClient();
  const { data, error } = await sb.from("quotations").select("id,number,status,current_revision,quotation_revisions(revision,total,data,created_at),bookings(id)").eq("number", no).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const rev: any = data.quotation_revisions.find((x: any) => x.revision === data.current_revision);
  const bk: any = Array.isArray(data.bookings) ? data.bookings[0] : data.bookings;
  const quote: Quote = { ...rev.data.quote, no: Number(data.number), revision: data.current_revision, date: String(rev.created_at).slice(0, 10), status: data.status };
  return { no: Number(data.number), status: data.status as string, revision: data.current_revision as number, quote, form: rev.data.form,
    revisions: [...data.quotation_revisions].sort((a: any, b: any) => b.revision - a.revision).map((r: any) => ({ revision: r.revision as number, total: Number(r.total), date: String(r.created_at).slice(0, 10) })),
    bookingId: (bk?.id ?? null) as string | null, total: quoteTotal(quote) };
}
