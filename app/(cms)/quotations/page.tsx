import Link from "next/link";
import { getQuotes } from "@/lib/db";
import { pkr } from "@/lib/calc";
export default async function Quotes() {
  const quotes = await getQuotes();
  return <><div className="row reveal" style={{border:0}}><h1 style={{margin:0}}>Quotations</h1><Link className="btn" href="/quotations/new">New quotation</Link></div>
    <div className="card reveal" style={{"--i":1} as React.CSSProperties}>{quotes.length === 0 && <p className="mute">No quotations yet. Create your first one.</p>}
      {quotes.map(q => <Link className="row" key={q.no} href={`/quotations/${q.no}`}>
        <div><b>{q.customer}</b><div className="mute">Quotation #{q.no}</div></div>
        <span style={{textAlign:"right"}}><span className="pill">{q.status}</span> <span className="num">{pkr(q.total)}</span></span></Link>)}</div></>;
}
