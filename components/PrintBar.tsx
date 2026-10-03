"use client";
import { useState } from "react";
type Email = { kind: "quote" | "invoice"; ref: string; n?: number; to: string };
export default function PrintBar({ phone, text, subject, link, pdf, email }: { phone: string; text: string; subject: string; link?: string; pdf?: string; email?: Email }) {
  const [copied, setCopied] = useState(false), [open, setOpen] = useState(false), [to, setTo] = useState(email?.to ?? ""), [note, setNote] = useState("");
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const full = () => (link ? `${text}\n${location.origin}${link}` : text);
  async function send() {
    setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...email, to, note }) }), j = await r.json().catch(() => ({}));
      setMsg(r.ok ? { ok: true, t: `Sent to ${to} with the PDF attached.` } : { ok: false, t: j.error ?? "Could not send." });
    } catch { setMsg({ ok: false, t: "Network error. Try again." }); }
    setBusy(false);
  }
  return <div className="noprint" style={{ marginBottom: 16 }}><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
    {pdf ? <a className="btn" href={pdf}>Download PDF</a> : <button className="btn" onClick={() => window.print()}>Download PDF</button>}
    {pdf && <button className="btn ghost" onClick={() => window.print()}>Print</button>}
    {email ? <button className="btn ghost" onClick={() => setOpen(!open)}>Email</button>
      : <button className="btn ghost" onClick={() => { location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(full())}`; }}>Email</button>}
    <button className="btn ghost" onClick={() => window.open(`https://wa.me/${phone}?text=${encodeURIComponent(full())}`, "_blank")}>WhatsApp</button>
    {link && <button className="btn ghost" onClick={async () => { await navigator.clipboard.writeText(location.origin + link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "Link copied" : "Copy link"}</button>}</div>
    {email && open && <div className="card" style={{ marginTop: 10, display: "grid", gap: 8, maxWidth: 520 }}>
      <label htmlFor="em">Send to (PDF attached)</label><input id="em" type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="client@example.com" />
      <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Message (optional)" />
      <button className="btn" disabled={busy || !to} onClick={send}>{busy ? "Sending…" : "Send email"}</button>
      {msg && <small role="status" style={{ color: msg.ok ? "#8FD1A8" : "#E09A7A" }}>{msg.t}</small>}</div>}</div>;
}
