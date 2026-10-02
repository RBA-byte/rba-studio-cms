"use client";
export default function PrintBar({ phone, text, subject }: { phone: string; text: string; subject: string }) {
  return <div className="noprint" style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
    <button className="btn" onClick={() => window.print()}>Download PDF</button>
    <a className="btn ghost" href={`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`}>Email</a>
    <a className="btn ghost" href={`https://wa.me/${phone}?text=${encodeURIComponent(text)}`} target="_blank">WhatsApp</a>
  </div>;
}
