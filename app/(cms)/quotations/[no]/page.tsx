import Link from "next/link";
import { notFound } from "next/navigation";
import { getClientEmail, getQuote } from "@/lib/db";
import { plan } from "@/lib/invoice";
import { getSettings } from "@/lib/settings";
import { pkr } from "@/lib/calc";
import { QuoteDoc } from "@/components/Doc";
import PrintBar from "@/components/PrintBar";
import { shareLink } from "@/lib/share";
import { acceptQuotation, setQuotationStatus } from "@/app/actions";
const STATUSES = ["Draft", "Sent", "Revision requested", "Accepted", "Rejected", "Expired"];
export default async function Quote({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const d = await getQuote(+no); if (!d) notFound();
  const { brand } = await getSettings();
  const q = d.quote, msg = `Assalam o Alaikum ${q.customer}, please find your quotation #${q.no} from ${brand.name}. Total: ${pkr(d.total)}.`;
  const wa = q.phone.replace(/\D/g, "").replace(/^0/, "92");
  return <><PrintBar pdf={`/api/pdf?kind=quote&ref=${d.no}`} email={{ kind: "quote", ref: String(d.no), to: await getClientEmail(q.phone) }} link={shareLink(`q:${d.no}`)} phone={wa} text={msg} subject={`Quotation #${q.no} — ${brand.name}`} />
    <div className="card noprint" style={{ marginBottom: 16, display: "grid", gap: 12 }}>
      <div className="row" style={{ border: 0, padding: 0, flexWrap: "wrap", gap: 10 }}>
        <span>Status <span className="pill">{d.status}</span> · Revision {d.revision}</span>
        {d.bookingId ? <Link className="btn" href={`/bookings/${d.bookingId}`}>View booking</Link> : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link className="btn ghost" href={`/quotations/new?from=${d.no}`}>Revise</Link>
          <form action={acceptQuotation}><input type="hidden" name="no" value={d.no} /><button className="btn">Accept &amp; create booking</button></form></div>}</div>
      {!d.bookingId && <form action={setQuotationStatus} style={{ display: "flex", gap: 8 }}><input type="hidden" name="no" value={d.no} />
        <select name="status" defaultValue={d.status}>{STATUSES.filter(s => s !== "Accepted").map(s => <option key={s}>{s}</option>)}</select><button className="btn ghost">Update status</button></form>}
      <small className="mute">Accepting creates the booking, reserves the dates and adds crew slots. The 50% advance ({pkr(plan(d.total)[0].amount)}) confirms it. Extra services after acceptance are added from the booking (Add to offer) and appear on this quotation.</small>
      {d.revisions.length > 1 && <small className="mute">History: {d.revisions.map(r => `R${r.revision} ${pkr(r.total)} (${r.date})`).join(" · ")}</small>}</div>
    <QuoteDoc q={q} brand={brand} /></>;
}
