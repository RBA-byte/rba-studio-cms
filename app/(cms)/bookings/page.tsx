import { bookings, paidOf, PHASES } from "@/lib/data";
import { pkr } from "@/lib/calc";
export default function Bookings() {
  return <><h1>Bookings</h1><div className="card">{bookings.map(b => <div className="row" key={b.id}>
    <div><b>{b.couple}</b><div className="mute">{b.id} · {b.events.length} event(s) · {PHASES[b.phase]}</div></div>
    <div style={{textAlign:"right"}}><span className="pill">{b.status}</span><div className="mute">Due {pkr(b.total - paidOf(b))}</div></div></div>)}</div></>;
}
