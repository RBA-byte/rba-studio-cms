import Link from "next/link";
import Calendar from "@/components/Calendar";
import { getBookings } from "@/lib/db";
import { netOf } from "@/lib/data";
import { lastEventDate, progressOf } from "@/lib/checklist";
import { shortDate } from "@/lib/brand";
import { logout } from "@/app/actions";
import { pkr } from "@/lib/calc";
import { todayPK } from "@/lib/brand";
const R = (i: number) => ({ "--i": i } as React.CSSProperties);
export default async function Dashboard() {
  const all = await getBookings(), bookings = all.filter(b => !b.cancelled);
  const today = todayPK();
  const next = bookings.flatMap(b => b.events.map(e => ({ b, e }))).filter(x => x.e.date && x.e.date >= today).sort((a, c) => a.e.date.localeCompare(c.e.date))[0];
  const n = next ? Math.round((Date.parse(next.e.date) - Date.parse(today)) / 864e5) : null;
  const when = n === 0 ? "today" : n === 1 ? "tomorrow" : `in ${n} days`;
  const overdue = bookings.map(b => ({ b, last: lastEventDate(b.events), pr: progressOf(b.tasks) })).filter(x => x.last && x.last < today && !(x.pr.total > 0 && x.pr.pending === 0)) as { b: typeof bookings[number]; last: string; pr: ReturnType<typeof progressOf> }[];
  const upcoming = bookings.filter(b => b.events.some(e => e.date && e.date >= today)).length;
  const revenue = all.reduce((s, b) => s + netOf(b), 0), due = bookings.reduce((s, b) => s + b.total - b.payments.reduce((x, p) => x + p.amount, 0), 0);
  const stats: [string, string | number][] = [["Outstanding", pkr(due)], ["Revenue", pkr(revenue)], ["Total bookings", bookings.length], ["Upcoming", upcoming]];
  return <>
    <h1 className="reveal" style={{ margin: 0, fontSize: "clamp(32px,5vw,52px)" }}>Good day, <em>Ammar</em>.</h1>
    <p className="lede reveal" style={R(1)}>{next ? <>Your next event is {when} — <em>{next.b.couple}&apos;s Wedding</em>.</> : "No upcoming events."}</p>
    {overdue.length > 0 && <div className="card notice reveal" style={R(1)}><b>Update project timeline</b>
      {overdue.map(({ b, last, pr }) => <Link className="row" key={b.id} href={`/bookings/${b.id}#timeline`}><div>{b.couple}<div className="mute">Wedding was on {shortDate(last)} · {pr.done}/{pr.total || "–"} steps done</div></div><span className="pill">Open timeline →</span></Link>)}</div>}
    <div className="grid4">{stats.map(([l, v], i) => <div className={`card stat reveal${i === 0 ? " hero" : ""}`} style={R(i + 2)} key={l}><small>{l}</small><div className="num">{v}</div></div>)}</div>
    <div className="reveal" style={R(6)}><Calendar bookings={bookings} /></div>
    <div className="card reveal" style={{ ...R(7), marginTop: 16 }}>
      {bookings.length === 0 && <p className="mute">No bookings yet. Create a quotation and accept it to see your calendar fill up.</p>}
      <div className="row" style={{ border: 0, paddingTop: 0 }}><h2 style={{ margin: 0 }}>Recent bookings</h2><Link className="btn ghost" href="/bookings">View all</Link></div>
      {bookings.slice(0, 5).map(b => <Link className="row" key={b.id} href={`/bookings/${b.id}`}><div><b>{b.couple}</b><div className="mute">{b.events[0]?.name} · {b.events[0]?.date || "Date TBC"}</div></div><span className="pill">{b.status}</span></Link>)}
    </div>
  <div className="ql"><Link className="btn ghost" href="/clients">Clients</Link></div>
  <form action={logout} style={{ marginTop: 24 }}><button className="btn ghost">Sign out</button></form></>;
}