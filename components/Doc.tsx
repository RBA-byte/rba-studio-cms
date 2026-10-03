import { BRAND, longDate, shortDate } from "@/lib/brand";
import { TERMS_CLOSING, TERMS_PT, termsFor } from "@/lib/terms";
type Brand = typeof BRAND;
import { pkr } from "@/lib/calc";
import { buildInvoice, invoiceNo, plan } from "@/lib/invoice";
import { Booking } from "@/lib/data";
import { Quote, quoteTotal } from "@/lib/doc";

const Sheet = ({ children }: { children: React.ReactNode }) => <section className="sheet">{children}</section>;
const Contact = ({ brand }: { brand: Brand }) => <div className="doc-contact">{brand.tagline}<br />{brand.address}<br />Cell: {brand.cell}<br />Email: {brand.email}</div>;
function Letterhead({ title, meta, brand }: { title?: string; meta?: [string, string][]; brand: Brand }) {
  return <header className="lh">
    <div><img src="/logo.png" alt={brand.name} style={{ height: "17mm", display: "block", marginBottom: 6 }} /><Contact brand={brand} /></div>
    {title && <div style={{ textAlign: "right" }}><div className="doc-title">{title}</div>
      {meta?.map(([k, v]) => <div key={k} style={{ marginTop: 3 }}><b>{k}</b> &nbsp; {v}</div>)}</div>}
  </header>;
}
function BillTo({ name, phone, note }: { name: string; phone: string; note?: string }) {
  return <div style={{ margin: "16px 0" }}><b>Bill To:</b><div>{name}</div><div>{phone.replace(/^92/, "+92 ")}</div>
    {note && <div style={{ marginTop: 6 }}><b>Comments or special instructions:</b> {note}</div>}</div>;
}
export function TermsSheet({ brand }: { brand: Brand }) {
  return <Sheet><Letterhead brand={brand} /><h2 className="doc-h" style={{ margin: "8px 0 6px" }}>Terms &amp; Conditions</h2>
    <div className="terms2" style={{ fontSize: `${TERMS_PT}pt` }}>{termsFor().map(sec => <div className="tsec" key={sec.title}><h3>{sec.title}</h3><ul>{sec.items.map((t, i) => <li key={i}>{t}</li>)}</ul></div>)}
      <p className="tclose">{TERMS_CLOSING}</p></div></Sheet>;
}
export function QuoteDoc({ q, brand = BRAND }: { q: Quote; brand?: Brand }) {
  const total = quoteTotal(q), p = plan(total);
  return <div className="sheets">
    <Sheet><Letterhead brand={brand} title="Quotation" meta={[["DATE", longDate(q.date)], ["Quotation #", String(q.no)], ["Customer ID", "NA"], ...(q.revision && q.revision > 1 ? [["Revision", `R${q.revision}`] as [string, string]] : [])]} />
      <BillTo name={q.customer} phone={q.phone} note={q.comments} />
      <table className="xl"><thead><tr><th style={{ width: "7%" }}>Sr</th><th>Package Details</th><th className="r">Amount (PKR)</th><th className="r">Discount</th><th className="r">Total (PKR)</th></tr></thead>
        <tbody>{q.items.map((it, i) => <tr key={i}><td>{i + 1}</td><td><b>{it.title}</b><div>{it.sub}</div></td>
          <td className="r">{it.amount.toLocaleString("en-PK")}</td><td className="r">{it.discount.toLocaleString("en-PK")}</td><td className="r">{(it.amount - it.discount).toLocaleString("en-PK")}</td></tr>)}
          <tr><td colSpan={5}><b>SERVICES INCLUDED</b>
            {q.services.map(s => <div key={s.event} style={{ marginTop: 8 }}><b>({s.event}):</b>{s.crew.map(c => <div key={c}>{c}</div>)}</div>)}
            <div style={{ marginTop: 10 }}><b>DELIVERABLES:</b>{q.deliverables.map(d => <div key={d}>{d}</div>)}</div></td></tr>
          <tr><td colSpan={5}><b>Payment T&amp;C:</b>
            <div>- 50% Advance is to be paid for booking confirmation*. (PKR {p[0].amount.toLocaleString("en-PK")})</div><div>*No Booking Without Advance</div>
            <div>- 25% is to be paid on the day of the event. (PKR {p[1].amount.toLocaleString("en-PK")})</div>
            <div>- 25% is to be paid on the collection of unedited images for selection purposes. (PKR {p[2].amount.toLocaleString("en-PK")})</div></td></tr>
          <tr><td colSpan={4} className="r"><b>Total</b></td><td className="r"><b>{total.toLocaleString("en-PK")}</b></td></tr></tbody></table>
      <div className="thanks">THANK YOU FOR YOUR BUSINESS!</div></Sheet>
    <TermsSheet brand={brand} /></div>;
}
export function InvoiceDoc({ b, n, brand = BRAND }: { b: Booking; n: number; brand?: Brand }) {
  const i = buildInvoice(b, n), dates = b.events.map(e => e.date).filter(Boolean).sort(), first = dates[0], last = dates[dates.length - 1];
  const q = b.quote, it = q?.items[0];
  const status = (k: number) => k < i.mi ? `Paid on ${shortDate(b.payments[k].date)}` : k === i.mi ? `Paid now · ${shortDate(i.pay.date)}` : `Due ${shortDate(k === 1 ? first : last)}`;
  return <div className="sheets">
    <Sheet><Letterhead brand={brand} title="Invoice" meta={[["DATE", longDate(i.pay.date)], ["Invoice #", invoiceNo(+i.pay.date.slice(0, 4), i.pay.seq)], ["Quotation #", b.ref]]} />
      <BillTo name={b.couple} phone={b.phone} note="None" />
      {q && it && <table className="xl"><thead><tr><th style={{ width: "7%" }}>Sr</th><th>Package Details</th><th className="r">Amount (PKR)</th><th className="r">Discount</th><th className="r">Total (PKR)</th></tr></thead>
        <tbody><tr><td>1</td><td><b>{it.title}</b><div>{dates.length ? `Event dates: ${dates.map(shortDate).join(", ")}` : it.sub}</div></td>
          <td className="r">{it.amount.toLocaleString("en-PK")}</td><td className="r">{it.discount.toLocaleString("en-PK")}</td><td className="r">{(it.amount - it.discount).toLocaleString("en-PK")}</td></tr>
          {b.addons.map((x, k) => <tr key={x.id}><td>{k + 2}</td><td><b>{x.description}</b><div>Added after acceptance</div></td><td className="r">{x.amount.toLocaleString("en-PK")}</td><td className="r">0</td><td className="r">{x.amount.toLocaleString("en-PK")}</td></tr>)}
          <tr><td colSpan={5}><b>SERVICES INCLUDED</b>
            {q.services.map(s => <div key={s.event} style={{ marginTop: 6 }}><b>({s.event}):</b> {s.crew.join(" · ")}</div>)}
            <div style={{ marginTop: 8 }}><b>DELIVERABLES:</b> {q.deliverables.join(" · ")}</div></td></tr></tbody></table>}
      <div className="doc-sub">Payment details</div>
      <table className="xl"><thead><tr><th style={{ width: "7%" }}>Sr</th><th>Payment Details</th><th className="r">Amount (PKR)</th><th className="r" style={{ width: "27%" }}>Status</th></tr></thead>
        <tbody>{i.rows.map((m, k) => <tr key={m.name}><td>{k + 1}</td><td><b>{m.name}</b><div>{m.note}</div></td>
          <td className="r">{m.amount.toLocaleString("en-PK")}</td><td className="r">{status(k)}</td></tr>)}
          <tr><td colSpan={3} className="r">Total agreed</td><td className="r">{b.total.toLocaleString("en-PK")}</td></tr>
          <tr><td colSpan={3} className="r">Previously paid</td><td className="r">{i.before.toLocaleString("en-PK")}</td></tr>
          <tr><td colSpan={3} className="r"><b>Payment received ({i.phase})</b></td><td className="r"><b>{i.pay.amount.toLocaleString("en-PK")}</b></td></tr>
          <tr><td colSpan={3} className="r"><b>Remaining balance</b></td><td className="r"><b>{i.remaining.toLocaleString("en-PK")}</b></td></tr></tbody></table>
      {i.next && <p style={{ margin: "8px 0" }}>Next payment: {i.next.name}, {pkr(i.next.amount)} ({i.next.note.toLowerCase()}).</p>}
      <div className="thanks">THANK YOU FOR YOUR BUSINESS!</div></Sheet>
    <TermsSheet brand={brand} /></div>;
}
