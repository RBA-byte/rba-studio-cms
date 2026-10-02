import Link from "next/link";
import { bookings } from "@/lib/data";
import { invoiceNo } from "@/lib/invoice";
import { pkr } from "@/lib/calc";
export default function Invoices() {
  return <><h1>Invoices</h1><div className="card">{bookings.flatMap(b => b.payments.map((p, i) =>
    <Link className="row" key={b.id + i} href={`/invoices/${b.id}/${i + 1}`}>
      <div><b>{b.couple}</b><div className="mute">{invoiceNo(2026, i + 1)} · {p.date}</div></div><span className="num">{pkr(p.amount)}</span></Link>))}</div></>;
}
