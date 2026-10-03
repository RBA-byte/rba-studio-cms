import Link from "next/link";
import { getBookings, getExpenses } from "@/lib/db";
import { paidOf } from "@/lib/data";
import { shortDate, todayPK } from "@/lib/brand";
import { pkr } from "@/lib/calc";
import PrintBtn from "@/components/PrintBtn";
export default async function Reports({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const today = todayPK(), sp = await searchParams, ym = today.slice(0, 7);
  const from = sp.from || `${ym}-01`, to = sp.to || new Date(Date.UTC(+ym.slice(0, 4), +ym.slice(5), 0)).toISOString().slice(0, 10);
  const [bookings, manual] = await Promise.all([getBookings(), getExpenses()]);
  const linked = (id: string) => manual.filter(e => e.bookingId === id).reduce((s, e) => s + e.amount, 0);
  const weds = bookings.filter(b => !b.cancelled && b.events.some(e => e.date && e.date >= from && e.date <= to)).sort((a, b) => (a.events[0]?.date ?? "").localeCompare(b.events[0]?.date ?? ""))
    .map(b => { const crew = b.slots.reduce((s, x) => s + x.cost, 0), other = linked(b.id), paid = paidOf(b); return { b, paid, pending: b.total - paid, crew, other, profit: paid - b.refund - crew - other }; });
  const total = weds.reduce((s, w) => s + w.profit, 0);
  return <div className="rep"><h1 className="reveal">Reports</h1>
    <form className="card noprint reveal" style={{ "--i": 1, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end", marginBottom: 16 } as React.CSSProperties}>
      <div><label>From</label><input type="date" name="from" defaultValue={from} /></div><div><label>To</label><input type="date" name="to" defaultValue={to} /></div>
      <button className="btn">Apply</button><PrintBtn /></form>
    <p className="mute">Weddings with an event between {shortDate(from)} and {shortDate(to)}.</p>
    {weds.length === 0 && <div className="card"><p className="mute" style={{ margin: 0 }}>No weddings in this range.</p></div>}
    {weds.map(({ b, paid, pending, crew, other, profit }, i) => <div className="card reveal" style={{ "--i": i + 2, marginBottom: 14 } as React.CSSProperties} key={b.id}>
      <div className="row" style={{ border: 0, padding: 0, alignItems: "flex-start" }}><div><Link href={`/bookings/${b.id}`}><h2 style={{ margin: 0 }}>{b.couple}</h2></Link>
        <div className="mute">{[...new Set(b.events.map(e => e.venue).filter(Boolean))].join(" · ") || "Venue TBC"}</div></div>
        <div style={{ textAlign: "right" }}><div>Paid {pkr(paid)}</div><div className={pending > 0 ? "pending" : "mute"}>Pending {pkr(pending)}</div></div></div>
      {b.events.map(e => <div key={e.id} style={{ marginTop: 14 }}><b>{e.name}</b> <span className="mute">· {shortDate(e.date)}{e.venue && ` · ${e.venue}`}</span>
        {b.slots.filter(s => s.event === e.name).map(s => <div className="row" key={s.id} style={{ padding: "8px 0" }}><span>{s.role}: {s.person || <span className="mute">Not assigned</span>}</span><span className="mute">{s.cost ? pkr(s.cost) : "—"}</span></div>)}</div>)}
      <div className="row"><span className="mute">Crew {pkr(crew)} · other expenses {pkr(other)}{b.refund > 0 && ` · refunded ${pkr(b.refund)}`}</span><b className="num" style={{ color: profit < 0 ? "#E09A7A" : undefined }}>Profit {pkr(profit)}</b></div></div>)}
    {weds.length > 0 && <div className="card hero reveal"><small>Total profit · {weds.length} wedding{weds.length > 1 ? "s" : ""}</small><div className="num" style={{ fontSize: 34 }}>{pkr(total)}</div></div>}</div>;
}
