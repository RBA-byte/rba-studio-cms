import Link from "next/link";
import { getBookings } from "@/lib/db";
import { paidOf } from "@/lib/data";
import { invoiceNo } from "@/lib/invoice";
import { pkr } from "@/lib/calc";
const R = (i: number) => ({ "--i": i } as React.CSSProperties);
export default async function Invoices() {
  const all = await getBookings(), live = all.filter(b => !b.cancelled);
  const paid = all.reduce((s, b) => s + paidOf(b) - b.refund, 0), pending = live.reduce((s, b) => s + b.total - paidOf(b), 0);
  return <><h1 className="reveal">Invoices</h1>
    <div className="grid4 reveal" style={{ ...R(1), gridTemplateColumns: "1fr 1fr" }}>
      <div className="card stat"><small>Total paid (after refunds)</small><div className="num">{pkr(paid)}</div></div>
      <div className="card stat"><small>Pending</small><div className="num pending">{pkr(pending)}</div></div></div>
    {all.filter(b => b.payments.length).map((b, k) => { const due = b.cancelled ? 0 : b.total - paidOf(b); return <details className="card dropd reveal" style={{ ...R(k + 2), marginBottom: 14 }} key={b.id}>
      <summary><div><h2 style={{ margin: 0 }}>{b.couple}</h2><span className={due > 0 ? "pending" : "mute"}>{b.cancelled ? `Cancelled · refunded ${pkr(b.refund)}` : `Paid ${pkr(paidOf(b))} · ${due > 0 ? `Pending ${pkr(due)}` : "Settled"}`}</span></div>
        <span className="chev" aria-hidden><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 9.5 12 15l5.5-5.5" /></svg></span></summary>
      <div className="dd">{b.payments.map((p, i) => <Link key={i} className={`row${due > 0 ? " pending" : ""}`} href={`/invoices/${b.id}/${i + 1}`}>
        <div>{invoiceNo(+p.date.slice(0, 4), p.seq)}<div className="mute">{p.date}</div></div><span className="num">{pkr(p.amount)}</span></Link>)}</div></details>; })}</>;
}
