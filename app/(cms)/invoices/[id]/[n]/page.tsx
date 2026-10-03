import { notFound } from "next/navigation";
import { getBookings, getClientEmail } from "@/lib/db";
import { buildInvoice, invoiceNo } from "@/lib/invoice";
import { pkr } from "@/lib/calc";
import { getSettings } from "@/lib/settings";
import { InvoiceDoc } from "@/components/Doc";
import PrintBar from "@/components/PrintBar";
import { shareLink } from "@/lib/share";
export default async function Invoice({ params }: { params: Promise<{ id: string; n: string }> }) {
  const { id, n } = await params;
  const b = (await getBookings()).find(x => x.id === id); if (!b || !b.payments[+n - 1]) notFound();
  const { brand } = await getSettings();
  const i = buildInvoice(b, +n), no = invoiceNo(+i.pay.date.slice(0, 4), i.pay.seq);
  const msg = `Assalam o Alaikum ${b.couple}, we received ${pkr(i.pay.amount)} (${i.phase}). Remaining balance: ${pkr(i.remaining)}. Invoice ${no} — ${brand.name}`;
  return <><PrintBar pdf={`/api/pdf?kind=invoice&ref=${b.id}&n=${n}`} email={{ kind: "invoice", ref: b.id, n: +n, to: await getClientEmail(b.phone) }} link={shareLink(`i:${b.id}:${n}`)} phone={b.phone.replace(/\D/g, "").replace(/^0/, "92")} text={msg} subject={`Invoice ${no}`} /><InvoiceDoc b={b} n={+n} brand={brand} /></>;
}
