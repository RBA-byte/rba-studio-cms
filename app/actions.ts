"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase";
import { Quote, quoteTotal } from "@/lib/doc";
import { lastEventDate, taskRows, unlocked } from "@/lib/checklist";
import { todayPK } from "@/lib/brand";
/* eslint-disable @typescript-eslint/no-explicit-any */
const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };
const refresh = () => revalidatePath("/", "layout");

export async function login(fd: FormData) {
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email: String(fd.get("email")), password: String(fd.get("password")) });
  if (error) redirect("/login?error=1");
  redirect("/");
}
export async function logout() { const sb = await createClient(); await sb.auth.signOut(); redirect("/login"); }

export async function saveQuotation(input: { form: any; quote: Quote; no?: number }): Promise<number> {
  const sb = await createClient(), total = quoteTotal(input.quote), data = { quote: input.quote, form: input.form };
  let clientId: string | null = null;
  if (input.quote.phone) {
    const { data: c } = await sb.from("clients").select("id").eq("phone", input.quote.phone).maybeSingle();
    if (c) clientId = c.id; else { const r = await sb.from("clients").insert({ name: input.quote.customer, phone: input.quote.phone }).select("id").single(); fail(r.error); clientId = r.data!.id; }
  }
  let no = input.no;
  if (no) {
    const { data: q, error } = await sb.from("quotations").select("id,current_revision,status").eq("number", no).single(); fail(error);
    if (q!.status === "Accepted") throw new Error("An accepted quotation cannot be revised.");
    const revision = q!.current_revision + 1;
    fail((await sb.from("quotation_revisions").insert({ quotation_id: q!.id, revision, total, data })).error);
    fail((await sb.from("quotations").update({ current_revision: revision, status: "Draft", client_id: clientId }).eq("id", q!.id)).error);
  } else {
    const r = await sb.from("quotations").insert({ client_id: clientId }).select("id,number").single(); fail(r.error);
    fail((await sb.from("quotation_revisions").insert({ quotation_id: r.data!.id, revision: 1, total, data })).error);
    no = Number(r.data!.number);
  }
  refresh(); return no!;
}
export async function setQuotationStatus(fd: FormData) {
  const sb = await createClient(), no = Number(fd.get("no"));
  fail((await sb.from("quotations").update({ status: String(fd.get("status")) }).eq("number", no)).error);
  refresh(); redirect(`/quotations/${no}`);
}
export async function acceptQuotation(fd: FormData) {
  const sb = await createClient(), no = Number(fd.get("no"));
  const { data: q, error } = await sb.from("quotations").select("id,current_revision,quotation_revisions(revision,total,data)").eq("number", no).single(); fail(error);
  const rev: any = q!.quotation_revisions.find((r: any) => r.revision === q!.current_revision), quote: Quote = rev.data.quote;
  const b = await sb.from("bookings").insert({ quotation_id: q!.id, ref: String(no), couple: quote.customer, phone: quote.phone, total: rev.total }).select("id").single(); fail(b.error);
  const days = quote.days ?? [];
  if (days.length) fail((await sb.from("booking_events").insert(days.map(d => ({ booking_id: b.data!.id, name: d.event, event_date: d.date || null, venue: d.venue || null, outdoor: !!d.outdoor })))).error);
  const slots: any[] = []; let ord = 0;
  for (const d of days) for (const [label, n] of [["Photographer", d.p], ["Videographer", d.v], ["Drone operator", d.d]] as [string, number][])
    for (let i = 1; i <= n; i++) slots.push({ booking_id: b.data!.id, ord: ord++, event_name: d.event, role: n > 1 ? `${label} ${i}` : label });
  if (slots.length) fail((await sb.from("booking_slots").insert(slots)).error);
  fail((await sb.from("production_tasks").insert(taskRows(b.data!.id, Number(rev.data.form?.albums ?? 0) > 0))).error);
  fail((await sb.from("quotations").update({ status: "Accepted" }).eq("id", q!.id)).error);
  refresh(); redirect(`/bookings/${b.data!.id}`);
}
// One Save for the whole booking. A crew slot is assigned when a name is entered ("Self" = no expense).
export async function saveBooking(fd: FormData) {
  const sb = await createClient(), keys = [...fd.keys()];
  const ids = (p: string) => [...new Set(keys.filter(k => k.startsWith(p)).map(k => k.split("_")[1]))];
  const jobs: PromiseLike<{ error: { message: string } | null }>[] = [];
  for (const id of ids("event_")) jobs.push(sb.from("booking_events").update({ event_date: String(fd.get(`event_${id}_date`)) || null, venue: String(fd.get(`event_${id}_venue`) ?? "").trim() || null }).eq("id", id));
  for (const id of ids("slot_")) {
    const person = String(fd.get(`slot_${id}_person`) ?? "").trim(), self = /^self$/i.test(person);
    jobs.push(sb.from("booking_slots").update({ status: person ? "assigned" : "pending", person: person || null, agency: null, cost: self ? 0 : Math.max(0, Number(fd.get(`slot_${id}_cost`)) || 0) }).eq("id", id));
  }
  (await Promise.all(jobs)).forEach(r => fail(r.error));
  refresh();
}
export async function addAddon(fd: FormData) {
  const sb = await createClient(), id = String(fd.get("booking")), amount = Number(fd.get("amount")), description = String(fd.get("description") ?? "").trim();
  if (!description || !(amount > 0)) throw new Error("Enter a description and an amount.");
  const { data: bk, error } = await sb.from("bookings").select("total,status").eq("id", id).single(); fail(error);
  if (bk!.status === "Cancelled") throw new Error("This booking is cancelled.");
  fail((await sb.from("booking_addons").insert({ booking_id: id, description, amount })).error);
  fail((await sb.from("bookings").update({ total: Number(bk!.total) + amount }).eq("id", id)).error);
  const event = String(fd.get("event") ?? ""), role = String(fd.get("role") ?? "").trim();
  if (event && role) {
    const { data: last } = await sb.from("booking_slots").select("ord").eq("booking_id", id).order("ord", { ascending: false }).limit(1);
    fail((await sb.from("booking_slots").insert({ booking_id: id, ord: (last?.[0]?.ord ?? 0) + 1, event_name: event, role })).error);
  }
  refresh();
}
export async function removeAddon(fd: FormData) {
  const sb = await createClient();
  const { data: a, error } = await sb.from("booking_addons").select("booking_id,amount").eq("id", String(fd.get("id"))).single(); fail(error);
  const { data: bk, error: e2 } = await sb.from("bookings").select("total,payments(amount)").eq("id", a!.booking_id).single(); fail(e2);
  const paid = (bk!.payments as any[]).reduce((s, p) => s + Number(p.amount), 0), total = Number(bk!.total) - Number(a!.amount);
  if (total < paid) throw new Error("Cannot remove: the client has already paid more than the new total.");
  fail((await sb.from("booking_addons").delete().eq("id", String(fd.get("id")))).error);
  fail((await sb.from("bookings").update({ total }).eq("id", a!.booking_id)).error);
  refresh();
}
export async function recordPayment(fd: FormData) {
  const sb = await createClient(), id = String(fd.get("booking")), amount = Number(fd.get("amount"));
  if (!(amount > 0)) throw new Error("Enter a payment amount.");
  const { data: bk, error } = await sb.from("bookings").select("total,status,payments(amount)").eq("id", id).single(); fail(error);
  if (bk!.status === "Cancelled") throw new Error("This booking is cancelled.");
  const paid = (bk!.payments as any[]).reduce((s, p) => s + Number(p.amount), 0);
  if (amount > Number(bk!.total) - paid) throw new Error("Amount is more than the remaining balance.");
  fail((await sb.from("payments").insert({ booking_id: id, amount, paid_on: String(fd.get("date")) || undefined })).error);
  refresh(); redirect(`/invoices/${id}/${(bk!.payments as any[]).length + 1}`);
}
export async function cancelBooking(fd: FormData) {
  const sb = await createClient(), id = String(fd.get("booking")), mode = String(fd.get("refund"));
  const { data: bk, error } = await sb.from("bookings").select("payments(amount,seq)").eq("id", id).single(); fail(error);
  const pays = [...(bk!.payments as any[])].sort((x, y) => x.seq - y.seq), paid = pays.reduce((s, p) => s + Number(p.amount), 0), adv = Number(pays[0]?.amount ?? 0);
  // Refund is based on the advance (first payment): 25%, 100%, none, or a custom amount.
  const refund = mode === "policy" ? Math.round(adv * .25) : mode === "full" ? adv : mode === "custom" ? Math.max(0, Number(fd.get("custom")) || 0) : 0;
  fail((await sb.from("bookings").update({ status: "Cancelled", cancelled_at: new Date().toISOString(), cancel_reason: String(fd.get("reason") ?? "") || null, refund_amount: Math.min(refund, paid) }).eq("id", id)).error);
  refresh(); redirect(`/bookings/${id}`);
}
export async function restoreBooking(fd: FormData) {
  const sb = await createClient(), id = String(fd.get("booking"));
  fail((await sb.from("bookings").update({ status: "Booked", cancelled_at: null, cancel_reason: null, refund_amount: 0 }).eq("id", id)).error);
  refresh();
}
export async function toggleTask(fd: FormData) {
  const sb = await createClient(), done = String(fd.get("done")) !== "true";
  const { data: t, error } = await sb.from("production_tasks").select("ord,booking_id").eq("id", String(fd.get("id"))).single(); fail(error);
  const { data: bk, error: e2 } = await sb.from("bookings").select("booking_events(event_date),production_tasks(ord,done)").eq("id", t!.booking_id).single(); fail(e2);
  const last = lastEventDate((bk!.booking_events as any[]).map(e => ({ date: e.event_date ?? "" })));
  if (!unlocked(bk!.production_tasks as any[], last, todayPK()).has(t!.ord)) throw new Error("This step is not unlocked yet.");
  fail((await sb.from("production_tasks").update({ done, done_on: done ? todayPK() : null }).eq("id", String(fd.get("id")))).error);
  refresh();
}
export async function createTasks(fd: FormData) {
  const sb = await createClient();
  fail((await sb.from("production_tasks").insert(taskRows(String(fd.get("booking")), fd.get("albums") === "on"))).error);
  refresh();
}
export async function addExpense(fd: FormData) {
  const sb = await createClient(), amount = Number(fd.get("amount"));
  if (!(amount > 0)) throw new Error("Enter an amount.");
  fail((await sb.from("expenses").insert({ amount, category: String(fd.get("category")), note: String(fd.get("note") ?? "") || null,
    spent_on: String(fd.get("date")) || undefined, booking_id: String(fd.get("booking") ?? "") || null })).error);
  refresh();
}
export async function deleteExpense(fd: FormData) {
  const sb = await createClient();
  fail((await sb.from("expenses").delete().eq("id", String(fd.get("id")))).error);
  refresh();
}
