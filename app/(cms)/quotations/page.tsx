import Link from "next/link";
import { quotes } from "@/lib/quotes";
import { pkr } from "@/lib/calc";
export default function Quotes() {
  return <><div className="row reveal" style={{border:0}}><h1 style={{margin:0}}>Quotations</h1><Link className="btn" href="/quotations/new">New quotation</Link></div>
    <div className="card reveal" style={{"--i":1} as React.CSSProperties}>{quotes.map(q => <Link className="row" key={q.no} href={`/quotations/${q.no}`}>
      <div><b>{q.customer}</b><div className="mute">Quotation #{q.no}</div></div><span style={{textAlign:"right"}}><span className="pill">{q.status}</span> <span className="num">{pkr(q.items.reduce((s,i)=>s+i.amount-i.discount,0))}</span></span></Link>)}</div></>;
}
