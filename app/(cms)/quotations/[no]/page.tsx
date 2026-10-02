import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuote } from "@/lib/db";
import { plan } from "@/lib/invoice";
import { BRAND } from "@/lib/brand";
import { pkr } from "@/lib/calc";
import { QuoteDoc } from "@/components/Doc";
import PrintBar from "@/components/PrintBar";
import { acceptQuotation, setQuotationStatus } from "@/app/actions";
const STATUSES = ["Draft", "Sent", "Revision requested", "Accepted", "Rejected", "Expired"];
export default async function Quote({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const d = await getQuote(+no); if (!d) notFound();
  const q = d.quote, msg = `Assalam o Alaikum ${q.customer}, please find your quotation #${q.no} from ${BRAND.name}. Total: ${pkr(d.total)}.`;
  const wa = q.phone.replace(/\D/g, "").replace(/^0/, "92");
  return <><PrintBar phone={wa} text={msg} subject={`Quotation #${q.no} — ${BRAND.name}`} />
    <div className="card noprint" style={{ marginBottom: 16, display: "grid", gap: 12 }}>
      <div className="row" style={{ border: 0, padding: 0, flexWrap: "wrap", gap: 10 }}>
        <span>Status <span className="pill">{d.status}</span> · Revision {d.revision}</span>
        {d.bookingId ? <Link className="btn" href={`/bookings/${d.bookingId}`}>View booking</Link> : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn ghost" href={`/quotations/new?from=${d.no}`}>Revise</Link>
          <form action={acceptQuotation}><input type="hidden" name="no" value={d.no} /><button className="btn">Accept &amp; create booking</button></form></div>}</div>
      {!d.bookingId && <form action={setQuotationStatus} style={{ display: "flex", gap: 8 }}><input type="hidden" name="no" value={d.no} />
        <select name="status" defaultValue={d.status}>{STATUSES.filter(s => s !== "Accepted").map(s => <option key={s}>{s}</option>)}</select><button className="btn ghost">Update status</button></form>}
      <small className="mute">Accepting creates the booking, reserves the dates and adds crew slots. The 50% advance ({pkr(plan(d.total)[0].amount)}) confirms it.</small>
      {d.revisions.length > 1 && <small className="mute">History: {d.revisions.map(r => `R${r.revision} ${pkr(r.total)} (${r.date})`).join(" · ")}</small>}</div>
    <QuoteDoc q={q} /></>;
}
