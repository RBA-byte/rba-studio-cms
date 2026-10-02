"use client";
import { useRef, useState } from "react";
import { Booking, PHASES } from "@/lib/data";
import { slotLabel } from "@/lib/booking";
import { progressOf } from "@/lib/checklist";
const iso = (y:number,m:number,d:number)=>`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
export default function Calendar({ bookings }: { bookings: Booking[] }) {
  const now = new Date();
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState<string | null>(null);
  const x0 = useRef(0);
  const shift = (n:number)=>setCur(({y,m})=>{const d=new Date(y,m+n,1);return {y:d.getFullYear(),m:d.getMonth()}});
  const map = new Map<string,Booking>();
  bookings.forEach(b=>b.events.forEach(e=>map.set(e.date,b)));
  const first = new Date(cur.y,cur.m,1).getDay(), count = new Date(cur.y,cur.m+1,0).getDate();
  const today = iso(now.getFullYear(),now.getMonth(),now.getDate());
  const b = sel ? map.get(sel) : undefined;
  const ev = b?.events.find(e=>e.date===sel);
  return <div className="cols">
    <div className="card" onTouchStart={e=>x0.current=e.touches[0].clientX}
      onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-x0.current; if(Math.abs(dx)>50) shift(dx<0?1:-1)}}>
      <div className="row" style={{border:0,paddingTop:0}}>
        <button className="btn ghost" aria-label="Previous month" onClick={()=>shift(-1)}>‹</button>
        <h2 style={{margin:0}}>{new Date(cur.y,cur.m).toLocaleString("en",{month:"long",year:"numeric"})}</h2>
        <button className="btn ghost" aria-label="Next month" onClick={()=>shift(1)}>›</button>
      </div>
      <div className="days mute">{"SMTWTFS".split("").map((c,i)=><span key={i}>{c}</span>)}</div>
      <div className="days">
        {Array.from({length:first}).map((_,i)=><span key={"e"+i}/>)}
        {Array.from({length:count},(_,i)=>{const k=iso(cur.y,cur.m,i+1);
          return <button key={k} className={`d${map.has(k)?" on":""}${sel===k?" sel":""}${k===today?" today":""}`}
            onClick={()=>setSel(map.has(k)?k:null)}>{i+1}</button>})}
      </div>
      <p className="mute" style={{marginBottom:0}}>Swipe to change month. Filled dates have events.</p>
    </div>
    <div className="card">
      {b && ev ? <>
        <h2 style={{margin:0}}>{b.couple}</h2>
        <p className="mute">{ev.name} · {new Date(ev.date).toDateString()}{ev.venue && ` · ${ev.venue}`} {ev.outdoor && <span className="pill">Outdoor shoot</span>}</p>
        <b>Crew</b>{b.slots.filter(c=>c.event===ev.name).map(c=><div className="row" key={c.role}><span>{c.role}</span><span className="mute">{slotLabel(c)}</span></div>)}
        <p style={{marginBottom:0}}><b>Project timeline</b> <span className="pill">{PHASES[b.phase]}</span> <span className="mute">{progressOf(b.tasks).pct}% complete</span></p>
        <div className="tl">{PHASES.map((p,i)=><i key={p} className={i<=b.phase?"f":""} title={p}/>)}</div>
      </> : <p className="mute">Select a filled date to see the wedding details.</p>}
    </div>
  </div>;
}
