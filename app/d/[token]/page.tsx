import { notFound } from "next/navigation";
import { verifyShare } from "@/lib/share";
import { adminClient } from "@/lib/supabase-admin";
import { getBookings, getQuote } from "@/lib/db";
import { InvoiceDoc, QuoteDoc } from "@/components/Doc";
import PrintBtn from "@/components/PrintBtn";
import { getSettings } from "@/lib/settings";
export const metadata = { title: "Document — RBA Films and Photography", robots: { index: false, follow: false } };
export default async function Shared({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params, p = verifyShare(token); if (!p) notFound();
  const sb = adminClient(), [kind, a, n] = p.split(":");
  const { brand } = await getSettings(sb);
  let doc;
  if (kind === "q") { const d = await getQuote(+a, sb); if (!d) notFound(); doc = <QuoteDoc q={d.quote} brand={brand} />; }
  else { const b = (await getBookings(sb)).find(x => x.id === a); if (!b || !b.payments[+n - 1]) notFound(); doc = <InvoiceDoc b={b} n={+n} brand={brand} />; }
  return <div style={{ padding: "16px 12px" }}><div className="noprint" style={{ textAlign: "center", marginBottom: 12 }}><PrintBtn /></div>{doc}</div>;
}
