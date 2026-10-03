import { createClient } from "@/lib/supabase";
import { renderDoc } from "@/lib/render";
const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const json = (o: object, status = 200) => Response.json(o, { status });
export async function POST(req: Request) {
  const sb = await createClient();
  if (!(await sb.auth.getUser()).data.user) return json({ error: "Not signed in." }, 401);
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return json({ error: "Email is not set up yet. Add RESEND_API_KEY and EMAIL_FROM in Vercel." }, 500);
  const { kind, ref, n, to, note } = await req.json().catch(() => ({}));
  if (typeof to !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return json({ error: "Enter a valid email address." }, 400);
  const r = await renderDoc(kind === "invoice" ? "invoice" : "quote", String(ref ?? ""), Number(n || 1), new URL(req.url).origin);
  if (!r) return json({ error: "Document not found." }, 404);
  const html = `<p>Assalam o Alaikum ${esc(r.name)},</p><p>Please find your ${esc(r.label)} from ${esc(r.brand.name)} attached as a PDF.</p>${note ? `<p>${esc(String(note)).replace(/\n/g, "<br>")}</p>` : ""}<p>Kind regards,<br>${esc(r.brand.name)}<br>${esc(r.brand.cell)}</p>`;
  const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], ...(process.env.EMAIL_REPLY_TO ? { reply_to: process.env.EMAIL_REPLY_TO } : {}), subject: r.subject, html, attachments: [{ filename: r.filename, content: Buffer.from(r.bytes).toString("base64") }] }) });
  if (!res.ok) { const e = await res.json().catch(() => ({})); return json({ error: `Resend: ${e.message ?? res.statusText}` }, 502); }
  if (r.phone) await sb.from("clients").update({ email: to }).eq("phone", r.phone); // remember it for next time
  return json({ ok: true });
}
