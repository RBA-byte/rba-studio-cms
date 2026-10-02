import Link from "next/link";
import { getBookings } from "@/lib/db";
import { paidOf, PHASES } from "@/lib/data";
import { crewProgress, isConfirmed } from "@/lib/booking";
import { pkr } from "@/lib/calc";
export default async function Bookings() {
  const bookings = await getBookings();
  return <><h1 className="reveal">Bookings</h1><div className="card reveal" style={{"--i":1} as React.CSSProperties}>
    {bookings.length === 0 && <p className="mute">No bookings yet. Accept a quotation to create one.</p>}
    {bookings.map(b => { const c = crewProgress(b); return <Link className="row" key={b.id} href={`/bookings/${b.id}`}>
    <div><b>{b.couple}</b><div className="mute">#{b.ref} · {b.events.length} event(s) · {PHASES[b.phase]} · Crew {c.done}/{c.total}</div></div>
    <div style={{textAlign:"right"}}><span className={`pill ${isConfirmed(b) ? "ok" : "warn"}`}>{isConfirmed(b) ? "Confirmed" : "Awaiting advance"}</span><div className="mute">Due {pkr(b.total - paidOf(b))}</div></div></Link>; })}</div></>;
}
