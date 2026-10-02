import { bookings } from "@/lib/data";
import { buildInvoice, invoiceNo } from "@/lib/invoice";
import { pkr } from "@/lib/calc";
import { BRAND, longDate } from "@/lib/brand";
import PaperHeader from "@/components/PaperHeader";
import PrintBar from "@/components/PrintBar";
export default async function Invoice({ params }: { params: Promise<{ id: string; n: string }> }) {
  const { id, n } = await params;
  const b = bookings.find(x => x.id === id)!, i = buildInvoice(b, +n);
  const no = invoiceNo(2026, +n);
  const msg = `Assalam o Alaikum ${b.couple}, we received ${pkr(i.pay.amount)} (${i.phase}). Remaining balance: ${pkr(i.remaining)}. Invoice ${no} — ${BRAND.name}`;
  return <><PrintBar phone={b.phone} text={msg} subject={`Invoice ${no}`} />
    <article className="paper reveal">
      <PaperHeader title="Invoice" meta={[["Invoice #", no], ["Date", longDate(i.pay.date)], ["Quotation", b.id]]} />
      <p className="mute" style={{margin:0}}>Billed to</p><p style={{margin:"2px 0 16px"}}><b>{b.couple}</b></p>
      <div style={{border:"1px solid #E5E5E5",borderRadius:10,padding:"14px 18px",margin:"0 0 18px"}}><span className="mute">Payment received · {i.phase}</span><div className="num" style={{fontSize:34}}>{pkr(i.pay.amount)}</div></div>
      <table><tbody>{i.planned.map((m, k) => <tr key={m.name}><td>{m.name} ({m.pct}%)<div className="mute">{m.note}</div></td><td>{pkr(m.amount)}</td>
        <td><span className="pill">{k + 1 < +n ? "Paid" : k + 1 === +n ? "This invoice" : "Due"}</span></td></tr>)}</tbody></table>
      <table><tbody>
        <tr><td>Total agreed</td><td>{pkr(b.total)}</td></tr><tr><td>Previously paid</td><td>{pkr(i.before)}</td></tr>
        <tr><td>Total received</td><td>{pkr(i.received)}</td></tr><tr><td><b>Remaining balance</b></td><td><b>{pkr(i.remaining)}</b></td></tr>
      </tbody></table>
      {i.next && <p className="mute">Next: {i.next.name}, {pkr(i.next.amount)} — {i.next.note.toLowerCase()}.</p>}
    </article></>;
}
