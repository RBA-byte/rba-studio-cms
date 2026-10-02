"use client";
import { useState } from "react";
import { calcQuotation, DEFAULT_RATES, pkr } from "@/lib/calc";
const Num = ({l,v,set}:{l:string;v:number;set:(n:number)=>void}) =>
  <div><label>{l}</label><input type="number" min={0} value={v} onChange={e=>set(+e.target.value)}/></div>;
export default function NewQuotation() {
  const [days,setDays]=useState(3);
  const [crew,setCrew]=useState({photographer:2,videographer:1,drone:1});
  const [rates,setRates]=useState(DEFAULT_RATES);
  const [albums,setAlbums]=useState(2), [profit,setProfit]=useState(0), [discount,setDiscount]=useState(0);
  const lines=(Object.keys(crew) as (keyof typeof crew)[]).map(k=>({label:k,qty:crew[k],days,rate:rates[k]}));
  const r=calcQuotation(lines,{qty:albums,rate:rates.album},profit,discount);
  return <div className="cols">
    <div className="card" style={{display:"grid",gap:12}}>
      <h2 style={{margin:0}}>New quotation</h2>
      <Num l="Wedding days" v={days} set={setDays}/>
      <Num l="Photographers per day" v={crew.photographer} set={n=>setCrew({...crew,photographer:n})}/>
      <Num l="Videographers per day" v={crew.videographer} set={n=>setCrew({...crew,videographer:n})}/>
      <Num l="Drone operators per day" v={crew.drone} set={n=>setCrew({...crew,drone:n})}/>
      <Num l="Albums" v={albums} set={setAlbums}/>
      <Num l="Day rate (PKR)" v={rates.photographer} set={n=>setRates({...rates,photographer:n,videographer:n,drone:n})}/>
      <Num l="Additional profit (PKR)" v={profit} set={setProfit}/>
      <Num l="Discount (PKR)" v={discount} set={setDiscount}/>
    </div>
    <div className="card">
      <p className="mute">Final total</p><div className="num" style={{fontSize:36}}>{pkr(r.total)}</div>
      <table><tbody>
        <tr><td>Resources</td><td>{pkr(r.resourceTotal)}</td></tr>
        <tr><td>Albums</td><td>{pkr(r.albumTotal)}</td></tr>
        {r.schedule.map(s=><tr key={s.milestone}><td>{s.milestone} ({s.pct}%)</td><td>{pkr(s.amount)}</td></tr>)}
      </tbody></table>
      <p className="noprint"><button className="btn" onClick={()=>window.print()}>Download PDF</button></p>
    </div>
  </div>;
}
