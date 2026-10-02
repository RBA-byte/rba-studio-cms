import { notFound } from "next/navigation";
import { quotes } from "@/lib/quotes";
import { quoteTotal } from "@/lib/doc";
import { plan } from "@/lib/invoice";
import { BRAND } from "@/lib/brand";
import { pkr } from "@/lib/calc";
import { QuoteDoc } from "@/components/Doc";
import PrintBar from "@/components/PrintBar";
export default async function Quote({ params }: { params: Promise<{ no: string }> }) {
  const { no } = await params;
  const q = quotes.find(x => String(x.no) === no); if (!q) notFound();
  const total = quoteTotal(q);
  const msg = `Assalam o Alaikum ${q.customer}, please find your quotation #${q.no} from ${BRAND.name}. Total: ${pkr(total)}.`;
  return <><PrintBar phone={q.phone} text={msg} subject={`Quotation #${q.no} — ${BRAND.name}`} />
    <p className="noprint mute">Status: <span className="pill">{q.status}</span> Once the 50% advance ({pkr(plan(total)[0].amount)}) is received, the quotation becomes a confirmed booking and the dates are reserved.</p>
    <QuoteDoc q={q} /></>;
}
