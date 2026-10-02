import { notFound } from "next/navigation";
import { getBookings } from "@/lib/db";
import { buildInvoice, invoiceNo } from "@/lib/invoice";
import { pkr } from "@/lib/calc";
import { BRAND } from "@/lib/brand";
import { InvoiceDoc } from "@/components/Doc";
import PrintBar from "@/components/PrintBar";
export default async function Invoice({ params }: { params: Promise<{ id: string; n: string }> }) {
  const { id, n } = await params;
  const b = (await getBookings()).find(x => x.id === id); if (!b || !b.payments[+n - 1]) notFound();
  const i = buildInvoice(b, +n), no = invoiceNo(+i.pay.date.slice(0, 4), i.pay.seq);
  const msg = `Assalam o Alaikum ${b.couple}, we received ${pkr(i.pay.amount)} (${i.phase}). Remaining balance: ${pkr(i.remaining)}. Invoice ${no} — ${BRAND.name}`;
  return <><PrintBar phone={b.phone.replace(/\D/g, "").replace(/^0/, "92")} text={msg} subject={`Invoice ${no}`} /><InvoiceDoc b={b} n={+n} /></>;
}
