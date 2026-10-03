"use client";
import { useState } from "react";
export default function MsgButtons({ phone, text }: { phone: string; text: string }) {
  const [ok, setOk] = useState(false), wa = phone.replace(/\D/g, "").replace(/^0/, "92");
  return <span style={{ display: "inline-flex", gap: 8 }}>
    <a className="btn ghost" target="_blank" href={`https://wa.me/${wa}?text=${encodeURIComponent(text)}`}>WhatsApp</a>
    <button className="btn ghost" onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); }}>{ok ? "Copied" : "Copy"}</button></span>;
}
