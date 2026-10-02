import Link from "next/link";
import Calendar from "@/components/Calendar";
import { bookings, paidOf } from "@/lib/data";
import { pkr } from "@/lib/calc";
export default function Dashboard() {
  const today = new Date().toISOString().slice(0,10);
  const upcoming = bookings.filter(b=>b.events.some(e=>e.date>=today)).length;
  const revenue = bookings.reduce((s,b)=>s+paidOf(b),0);
  const due = bookings.reduce((s,b)=>s+b.total-paidOf(b),0);
  const stats: [string, string|number][] = [["Outstanding",pkr(due)],["Revenue",pkr(revenue)],["Total bookings",bookings.length],["Upcoming",upcoming]];
  return <>
    <h1 style={{margin:"0 0 16px"}}>Good day</h1>
    <div className="grid4">{stats.map(([l,v],i)=><div className={`card stat${i===0?" hero":""}`} key={l}><small>{l}</small><div className="num">{v}</div></div>)}</div>
    <Calendar bookings={bookings}/>
    <div className="card" style={{marginTop:16}}>
      <div className="row" style={{border:0,paddingTop:0}}><h2 style={{margin:0}}>Recent bookings</h2><Link className="btn ghost" href="/bookings">View all</Link></div>
      {bookings.map(b=><div className="row" key={b.id}><div><b>{b.couple}</b><div className="mute">{b.events[0].name} · {b.events[0].date}</div></div><span className="pill">{b.status}</span></div>)}
    </div>
  </>;
}
