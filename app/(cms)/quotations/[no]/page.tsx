import { quotes } from "@/lib/quotes";
import { plan } from "@/lib/invoice";
import { TERMS } from "@/lib/terms";
import { BRAND, longDate } from "@/lib/brand";
import { pkr } from "@/lib/calc";
import PaperHeader from "@/components/PaperHeader";
import PrintBar from "@/components/PrintBar";
export default async function Quote({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const q = quotes.find(x => String(x.no) === no)!;
  const total = q.items.reduce((s, i) => s + i.amount - i.discount, 0);
  const msg = `Assalam o Alaikum ${q.customer}, please find your quotation #${q.no} from ${BRAND.name}. Total: ${pkr(total)}.`;
  return <><PrintBar phone={q.phone} text={msg} subject={`Quotation #${q.no} — ${BRAND.name}`} />
    <p className="noprint mute">Status: <span className="pill">{q.status}</span> Once the 50% advance ({pkr(plan(total)[0].amount)}) is received, the quotation becomes a confirmed booking and the dates are reserved.</p>
    <article className="paper reveal">
      <PaperHeader title="Quotation" meta={[["Date", longDate()], ["Quotation #", String(q.no)]]} />
      <p className="mute" style={{margin:0}}>Bill to</p><p style={{margin:"2px 0 4px"}}><b>{q.customer}</b> · {q.phone.replace(/^92/, "+92 ")}</p>
      <p className="mute" style={{marginTop:0}}>Comments: {q.comments}</p>
      <table><thead><tr><th>Sr</th><th>Package details</th><th>Amount</th><th>Discount</th><th>Total</th></tr></thead><tbody>
        {q.items.map((it, i) => <tr key={i}><td>{i + 1}</td><td><b>{it.title}</b><div className="mute">{it.sub}</div></td><td>{pkr(it.amount)}</td><td>{pkr(it.discount)}</td><td>{pkr(it.amount - it.discount)}</td></tr>)}
      </tbody></table>
      <h2>Services included</h2>
      {q.services.map(s => <p key={s.event} style={{margin:"6px 0"}}><b>{s.event}:</b> <span className="mute">{s.crew.join(" · ")}</span></p>)}
      <h2>Deliverables</h2><ul className="mute" style={{marginTop:0}}>{q.deliverables.map(d => <li key={d}>{d}</li>)}</ul>
      <h2>Payment schedule</h2>
      <table><tbody>{plan(total).map(m => <tr key={m.name}><td>{m.name} ({m.pct}%)<div className="mute">{m.note}</div></td><td>{pkr(m.amount)}</td></tr>)}
        <tr><td><b>Total</b></td><td><b>{pkr(total)}</b></td></tr></tbody></table>
      <p style={{textAlign:"center",letterSpacing:".2em",fontSize:12}} className="mute">THANK YOU FOR YOUR BUSINESS</p>
      <section className="pb"><h2>Terms and conditions</h2><ol className="mute" style={{fontSize:12.5,lineHeight:1.65,paddingLeft:18}}>{TERMS.map((t, i) => <li key={i}>{t}</li>)}</ol></section>
    </article></>;
}
