"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase";
import { Quote, quoteTotal } from "@/lib/doc";
/* eslint-disable @typescript-eslint/no-explicit-any */
const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };
const refresh = () => revalidatePath("/", "layout");

export async function login(fd: FormData) {
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email: String(fd.get("email")), password: String(fd.get("password")) });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
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
  if (days.length) fail((await sb.from("booking_events").insert(days.map(d => ({ booking_id: b.data!.id, name: d.event, event_date: d.date || null, venue: d.venue || null })))).error);
  const slots: any[] = []; let ord = 0;
  for (const d of days) for (const [label, n] of [["Photographer", d.p], ["Videographer", d.v], ["Drone operator", d.d]] as [string, number][])
    for (let i = 1; i <= n; i++) slots.push({ booking_id: b.data!.id, ord: ord++, event_name: d.event, role: n > 1 ? `${label} ${i}` : label });
  if (slots.length) fail((await sb.from("booking_slots").insert(slots)).error);
  fail((await sb.from("quotations").update({ status: "Accepted" }).eq("id", q!.id)).error);
  refresh(); redirect(`/bookings/${b.data!.id}`);
}
export async function updateSlot(fd: FormData) {
  const sb = await createClient(), status = String(fd.get("status"));
  fail((await sb.from("booking_slots").update({ status, person: String(fd.get("person") ?? "") || null, agency: String(fd.get("agency") ?? "") || null }).eq("id", String(fd.get("id")))).error);
  refresh();
}
export async function recordPayment(fd: FormData) {
  const sb = await createClient(), id = String(fd.get("booking")), amount = Number(fd.get("amount"));
  if (!(amount > 0)) throw new Error("Enter a payment amount.");
  const { count } = await sb.from("payments").select("id", { count: "exact", head: true }).eq("booking_id", id);
  fail((await sb.from("payments").insert({ booking_id: id, amount, paid_on: String(fd.get("date")) || undefined })).error);
  refresh(); redirect(`/invoices/${id}/${(count ?? 0) + 1}`);
}
