"use client";
import { useState } from "react";
export default function PrintBar({ phone, text, subject, link }: { phone: string; text: string; subject: string; link?: string }) {
  const [copied, setCopied] = useState(false);
  const full = () => (link ? `${text}\n${location.origin}${link}` : text);
  return <div className="noprint" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
    <button className="btn" onClick={() => window.print()}>Download PDF</button>
    <button className="btn ghost" onClick={() => { location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(full())}`; }}>Email</button>
    <button className="btn ghost" onClick={() => window.open(`https://wa.me/${phone}?text=${encodeURIComponent(full())}`, "_blank")}>WhatsApp</button>
    {link && <button className="btn ghost" onClick={async () => { await navigator.clipboard.writeText(location.origin + link); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "Link copied" : "Copy link"}</button>}
  </div>;
}
