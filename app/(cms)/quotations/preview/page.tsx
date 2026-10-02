import { notFound } from "next/navigation";
import { Quote } from "@/lib/doc";
import { BRAND } from "@/lib/brand";
import { QuoteDoc } from "@/components/Doc";
import PrintBar from "@/components/PrintBar";
export default async function Preview({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams; let q: Quote;
  try { q = JSON.parse(d ?? ""); if (!Array.isArray(q.items) || !Array.isArray(q.services)) throw 0; } catch { notFound(); }
  const wa = String(q.phone ?? "").replace(/\D/g, "").replace(/^0/, "92");
  return <><PrintBar phone={wa} text={`Assalam o Alaikum ${q.customer}, please find your quotation from ${BRAND.name}.`} subject={`Quotation — ${BRAND.name}`} />
    <p className="noprint mute">Draft preview. Saving quotations arrives with the database step.</p><QuoteDoc q={q} /></>;
}
