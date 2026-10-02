import Link from "next/link";
import { notFound } from "next/navigation";
import { bookings, paidOf, PHASES } from "@/lib/data";
import { advanceDue, conflicts, crewProgress, isConfirmed, slotLabel } from "@/lib/booking";
import { invNo, plan } from "@/lib/invoice";
import { pkr } from "@/lib/calc";
const R = (i: number) => ({ "--i": i } as React.CSSProperties);
export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = bookings.find(x => x.id === id); if (!b) notFound();
  const ok = isConfirmed(b), c = crewProgress(b), clash = conflicts(b), paid = paidOf(b);
  let run = 0;
  const sched = plan(b.total).map(m => { run += m.amount; return { ...m, done: paid >= run }; });
  return <>
    <Link href="/bookings" className="mute">← All bookings</Link>
    <h1 className="reveal" style={{margin:"8px 0 6px",fontSize:"clamp(30px,4.5vw,46px)"}}>{b.couple}</h1>
    <p className="reveal" style={{...R(1),display:"flex",gap:8,flexWrap:"wrap",margin:"0 0 24px"}}>
      <span className="mute">{b.id}</span><span className={`pill ${ok ? "ok" : "warn"}`}>{ok ? "Booking confirmed" : `Awaiting advance ${pkr(advanceDue(b) - paid)}`}</span>
      <span className={`pill ${c.done === c.total ? "ok" : "warn"}`}>Crew {c.done}/{c.total} assigned</span><span className="pill">{PHASES[b.phase]}</span></p>
    {clash.length > 0 && <div className="card reveal" style={{...R(2),marginBottom:16,borderColor:"rgba(224,120,86,.4)"}}>Date clash: {clash.map(x => `${x.date} also reserved for ${x.other}`).join("; ")}.</div>}
    <div className="cols">
      <div className="card reveal" style={R(3)}><h2 style={{margin:0}}>Reserved dates and crew</h2>
        {b.events.map(e => <div key={e.name} style={{marginTop:18}}>
          <div className="row" style={{border:0,padding:"0 0 6px"}}><b>{e.name}</b><span className="mute">{e.date} · {e.venue}</span></div>
          {b.slots.filter(s => s.event === e.name).map(s => <div className="row" key={s.role}><span>{s.role}</span>
            <span className={s.status === "assigned" ? "mute" : "pill warn"}>{slotLabel(s)}</span></div>)}</div>)}</div>
      <div className="card reveal" style={R(4)}><h2 style={{margin:0}}>Payments</h2><p className="mute">Total agreed {pkr(b.total)} · received {pkr(paid)}</p>
        {sched.map(m => <div className="row" key={m.name}><div>{m.name} ({m.pct}%)<div className="mute">{m.note}</div></div>
          <div style={{textAlign:"right"}}>{pkr(m.amount)}<div><span className={`pill ${m.done ? "ok" : "warn"}`}>{m.done ? "Paid" : "Due"}</span></div></div></div>)}
        <p className="mute" style={{marginBottom:6}}>Invoices</p>
        {b.payments.map((p, i) => <Link key={i} className="row" href={`/invoices/${b.id}/${i + 1}`}><span>{invNo(b.id, i + 1)}</span><span className="mute">{p.date} · {pkr(p.amount)}</span></Link>)}</div>
    </div></>;
}
