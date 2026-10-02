import Link from "next/link";
import { bookings, paidOf, PHASES } from "@/lib/data";
import { crewProgress, isConfirmed } from "@/lib/booking";
import { pkr } from "@/lib/calc";
export default function Bookings() {
  return <><h1 className="reveal">Bookings</h1><div className="card reveal" style={{"--i":1} as React.CSSProperties}>{bookings.map(b => { const c = crewProgress(b); return <Link className="row" key={b.id} href={`/bookings/${b.id}`}>
    <div><b>{b.couple}</b><div className="mute">{b.id} · {b.events.length} event(s) · {PHASES[b.phase]} · Crew {c.done}/{c.total}</div></div>
    <div style={{textAlign:"right"}}><span className={`pill ${isConfirmed(b) ? "ok" : "warn"}`}>{isConfirmed(b) ? "Confirmed" : "Awaiting advance"}</span><div className="mute">Due {pkr(b.total - paidOf(b))}</div></div></Link>; })}</div></>;
}
