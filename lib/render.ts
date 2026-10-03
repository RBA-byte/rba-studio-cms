import { getBookings, getQuote } from "./db";
import { invoicePdf, quotePdf } from "./pdf";
import { invoiceNo, buildInvoice } from "./invoice";
import { BRAND } from "./brand";
export async function renderDoc(kind: "quote" | "invoice", ref: string, n: number, origin: string) {
  const logo = await fetch(`${origin}/logo.png`).then(r => (r.ok ? r.arrayBuffer() : null)).catch(() => null);
  if (kind === "quote") {
    const d = await getQuote(+ref); if (!d) return null;
    return { bytes: await quotePdf(d.quote, logo), filename: `RBA-Quotation-${d.no}.pdf`, subject: `Quotation #${d.no} - ${BRAND.name}`, name: d.quote.customer, phone: d.quote.phone, label: `quotation #${d.no}` };
  }
  const b = (await getBookings()).find(x => x.id === ref); if (!b || !b.payments[n - 1]) return null;
  const i = buildInvoice(b, n), no = invoiceNo(+i.pay.date.slice(0, 4), i.pay.seq);
  return { bytes: await invoicePdf(b, n, logo), filename: `RBA-Invoice-${no}.pdf`, subject: `Invoice ${no} - ${BRAND.name}`, name: b.couple, phone: b.phone, label: `invoice ${no}` };
}
