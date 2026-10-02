import Link from "next/link";
import { bookings, paidOf } from "@/lib/data";
import { invNo } from "@/lib/invoice";
import { pkr } from "@/lib/calc";
const R = (i: number) => ({ "--i": i } as React.CSSProperties);
export default function Invoices() {
  const paid = bookings.reduce((s, b) => s + paidOf(b), 0), pending = bookings.reduce((s, b) => s + b.total - paidOf(b), 0);
  return <><h1 className="reveal">Invoices</h1>
    <div className="grid4 reveal" style={{ ...R(1), gridTemplateColumns: "1fr 1fr" }}>
      <div className="card stat"><small>Total paid</small><div className="num">{pkr(paid)}</div></div>
      <div className="card stat"><small>Pending</small><div className="num pending">{pkr(pending)}</div></div></div>
    {bookings.map((b, k) => { const due = b.total - paidOf(b); return <div className="card reveal" style={{ ...R(k + 2), marginBottom: 14 }} key={b.id}>
      <div className="row" style={{ border: 0, paddingTop: 0 }}><h2 style={{ margin: 0 }}>{b.couple}</h2>
        <span className={due > 0 ? "pending" : "mute"}>Paid {pkr(paidOf(b))} · {due > 0 ? `Pending ${pkr(due)}` : "Settled"}</span></div>
      {b.payments.map((p, i) => <Link key={i} className={`row${due > 0 ? " pending" : ""}`} href={`/invoices/${b.id}/${i + 1}`}>
        <div>{invNo(b.id, i + 1)}<div className="mute">{p.date}</div></div><span className="num">{pkr(p.amount)}</span></Link>)}</div>; })}</>;
}
