import Link from "next/link";
import Calendar from "@/components/Calendar";
import { bookings, paidOf } from "@/lib/data";
import { pkr } from "@/lib/calc";
import { todayPK } from "@/lib/brand";
const R = (i: number) => ({ "--i": i } as React.CSSProperties);
export default function Dashboard() {
  const today = todayPK();
  const next = bookings.flatMap(b => b.events.map(e => ({ b, e }))).filter(x => x.e.date >= today).sort((a, c) => a.e.date.localeCompare(c.e.date))[0];
  const n = next ? Math.round((Date.parse(next.e.date) - Date.parse(today)) / 864e5) : null;
  const when = n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`;
  const upcoming = bookings.filter(b => b.events.some(e => e.date >= today)).length;
  const revenue = bookings.reduce((s, b) => s + paidOf(b), 0), due = bookings.reduce((s, b) => s + b.total - paidOf(b), 0);
  const stats: [string, string | number][] = [["Outstanding", pkr(due)], ["Revenue", pkr(revenue)], ["Total bookings", bookings.length], ["Upcoming", upcoming]];
  return <>
    <h1 className="reveal" style={{ margin: 0, fontSize: "clamp(32px,5vw,52px)" }}>Good day, <em>Ammar</em>.</h1>
    <p className="lede reveal" style={R(1)}>{next ? <>Your next event is {when} — <em>{next.b.couple}&apos;s Wedding</em>.</> : "No upcoming events."}</p>
    <div className="grid4">{stats.map(([l, v], i) => <div className={`card stat reveal${i === 0 ? " hero" : ""}`} style={R(i + 2)} key={l}><small>{l}</small><div className="num">{v}</div></div>)}</div>
    <div className="reveal" style={R(6)}><Calendar bookings={bookings} /></div>
    <div className="card reveal" style={{ ...R(7), marginTop: 16 }}>
      <div className="row" style={{ border: 0, paddingTop: 0 }}><h2 style={{ margin: 0 }}>Recent bookings</h2><Link className="btn ghost" href="/bookings">View all</Link></div>
      {bookings.map(b => <div className="row" key={b.id}><div><b>{b.couple}</b><div className="mute">{b.events[0].name} · {b.events[0].date}</div></div><span className="pill">{b.status}</span></div>)}
    </div>
  </>;
}
