import { PDFDocument, PDFFont, PDFImage, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { BRAND, longDate, shortDate } from "./brand";
type Brand = typeof BRAND;
import { TERMS_CLOSING, termsFor } from "./terms";
import { buildInvoice, invoiceNo, plan } from "./invoice";
import { Quote, quoteTotal } from "./doc";
import type { Booking } from "./data";

// Server-side A4 PDF builder (same layout as the on-screen documents). Used for downloads and email attachments.
const W = 595.28, H = 841.89, M = 36, CW = W - 2 * M, INK = rgb(0.07, 0.07, 0.08), GREY = rgb(0.35, 0.37, 0.4);
type Ln = { t: string; b?: boolean; s?: number };
type Cell = { w: number; lines: Ln[]; a?: "l" | "r" | "c" };
const num = (x: number) => x.toLocaleString("en-PK");

class P {
  page: PDFPage; y = H - M;
  private constructor(public doc: PDFDocument, public f: PDFFont, public fb: PDFFont, public logo: PDFImage | null, public brand: Brand) { this.page = doc.addPage([W, H]); }
  static async create(logo: ArrayBuffer | null, brand: Brand = BRAND) {
    const doc = await PDFDocument.create();
    return new P(doc, await doc.embedFont(StandardFonts.Helvetica), await doc.embedFont(StandardFonts.HelveticaBold), logo ? await doc.embedPng(logo).catch(() => null) : null, brand);
  }
  safe(s: string, f: PDFFont) { const ok = new Set(f.getCharacterSet()); return Array.from(s.replace(/[\u00a0\u202f\u2009]/g, " ")).map(c => (ok.has(c.codePointAt(0)!) ? c : "?")).join(""); }
  width(s: string, f: PDFFont, sz: number) { return f.widthOfTextAtSize(this.safe(s, f), sz); }
  wrap(s: string, f: PDFFont, sz: number, mw: number) {
    const out: string[] = [];
    for (const para of s.split("\n")) {
      let line = "";
      for (let word of para.split(" ")) {
        while (this.width(word, f, sz) > mw) { let k = word.length; while (k > 1 && this.width(word.slice(0, k), f, sz) > mw) k--; if (line) { out.push(line); line = ""; } out.push(word.slice(0, k)); word = word.slice(k); }
        const t = line ? line + " " + word : word;
        if (this.width(t, f, sz) <= mw || !line) line = t; else { out.push(line); line = word; }
      }
      out.push(line);
    }
    return out;
  }
  newPage() { this.page = this.doc.addPage([W, H]); this.y = H - M; }
  put(t: string, x: number, y: number, sz: number, bold = false, color = INK) { const f = bold ? this.fb : this.f; this.page.drawText(this.safe(t, f), { x, y, size: sz, font: f, color }); }
  header(title?: string, meta: [string, string][] = []) {
    const top = this.y; let left = top;
    if (this.logo) { const h = 42, w = (this.logo.width * h) / this.logo.height; this.page.drawImage(this.logo, { x: M, y: top - h, width: w, height: h }); left = top - h - 7; }
    else { this.put(this.brand.name, M, top - 16, 15, true); left = top - 24; }
    for (const l of [this.brand.tagline, this.brand.address, `Cell: ${this.brand.cell}`, `Email: ${this.brand.email}`]) { this.put(l, M, left - 8, 8, false, GREY); left -= 11; }
    let right = top;
    if (title) {
      this.put(title, W - M - this.width(title, this.f, 26), top - 24, 26);
      meta.forEach(([k, v], i) => { const yy = top - 42 - i * 13, xv = W - M - this.width(v, this.f, 9.5); this.put(v, xv, yy, 9.5); this.put(k, xv - this.width(k, this.fb, 9.5) - 7, yy, 9.5, true); });
      right = top - 42 - meta.length * 13;
    }
    this.y = Math.min(left, right) - 6;
    this.page.drawLine({ start: { x: M, y: this.y }, end: { x: W - M, y: this.y }, thickness: 0.6, color: rgb(0.8, 0.8, 0.8) }); this.y -= 16;
  }
  line(t: string, o: { bold?: boolean; size?: number; gap?: number } = {}) { const s = o.size ?? 9.5; this.put(t, M, this.y - s, s, o.bold); this.y -= s * 1.35 + (o.gap ?? 0); }
  billTo(name: string, phone: string, note?: string) {
    this.line("Bill To:", { bold: true }); this.line(name); this.line(phone.replace(/^92/, "+92 "), { gap: note ? 3 : 10 });
    if (note) { this.put("Comments or special instructions:", M, this.y - 9.5, 9.5, true); this.put(note, M + this.width("Comments or special instructions:", this.fb, 9.5) + 5, this.y - 9.5, 9.5); this.y -= 22; }
  }
  row(cells: Cell[], pad = 5) {
    const laid = cells.map(c => c.lines.flatMap(l => this.wrap(l.t, l.b ? this.fb : this.f, l.s ?? 9.5, c.w - 2 * pad).map(t => ({ t, b: l.b, s: l.s ?? 9.5 }))));
    const h = Math.max(...laid.map(ls => ls.reduce((s, l) => s + l.s * 1.32, 0))) + 2 * pad;
    if (this.y - h < M) this.newPage();
    let x = M;
    cells.forEach((c, i) => {
      this.page.drawRectangle({ x, y: this.y - h, width: c.w, height: h, borderColor: INK, borderWidth: 0.7 });
      let ty = this.y - pad;
      for (const l of laid[i]) { ty -= l.s; const f = l.b ? this.fb : this.f, tw = this.width(l.t, f, l.s);
        this.put(l.t, c.a === "r" ? x + c.w - pad - tw : c.a === "c" ? x + (c.w - tw) / 2 : x + pad, ty, l.s, l.b); ty -= l.s * 0.32; }
      x += c.w;
    });
    this.y -= h;
  }
  banner() { this.y -= 14; if (this.y - 30 < M) this.newPage(); this.page.drawRectangle({ x: M, y: this.y - 28, width: CW, height: 28, borderColor: INK, borderWidth: 0.7 });
    const t = "THANK YOU FOR YOUR BUSINESS!"; this.put(t, M + (CW - this.width(t, this.fb, 12)) / 2, this.y - 19, 12, true); this.y -= 28; }
  // Two-column terms page; picks the largest font size that fits under the header.
  terms() {
    this.newPage(); this.header(); this.put("Terms & Conditions", M, this.y - 13, 13, true); this.y -= 24;
    const avail = this.y - M, gap = 16, colW = (CW - gap) / 2;
    type L = { t: string; b?: boolean; x: number; gap?: number };
    const build = (sz: number) => {
      const lh = sz * 1.3, blocks: { lines: L[]; h: number }[] = [], mk = (lines: L[]) => ({ lines, h: lines.length * lh + lines.reduce((s, l) => s + (l.gap ?? 0), 0) });
      termsFor().forEach(sec => sec.items.forEach((it, k) => {
        const ls: L[] = k === 0 ? [{ t: sec.title.toUpperCase(), b: true, x: 0, gap: 1 }] : [];
        this.wrap(it, this.f, sz, colW - 9).forEach((t, i) => ls.push({ t: i === 0 ? "\u2022 " + t : t, x: i === 0 ? 0 : 9, gap: 0 }));
        ls[ls.length - 1].gap = 2.5; blocks.push(mk(ls));
      }));
      blocks.push(mk(this.wrap(TERMS_CLOSING, this.fb, sz, colW).map(t => ({ t, b: true, x: 0 }))));
      return { blocks, lh };
    };
    const place = (blocks: { h: number }[]) => { const cols: number[] = []; let c = 0, used = 0; blocks.forEach(b => { if (used + b.h > avail && c === 0) { c = 1; used = 0; } used += b.h; cols.push(c); }); return { cols, used }; };
    let sz = 9; for (; sz > 5.5; sz -= 0.1) { const { blocks } = build(sz), { cols } = place(blocks); const h1 = blocks.filter((_, i) => cols[i] === 1).reduce((s, b) => s + b.h, 0), h0 = blocks.filter((_, i) => cols[i] === 0).reduce((s, b) => s + b.h, 0);
      if (h0 <= avail && h1 <= avail) break; }
    const { blocks, lh } = build(sz), { cols } = place(blocks), ys = [this.y, this.y];
    blocks.forEach((b, i) => { const c = cols[i]; for (const l of b.lines) { this.put(l.t, M + c * (colW + gap) + l.x, ys[c] - sz, sz, l.b); ys[c] -= lh + (l.gap ?? 0); } });
    this.fitSize = sz;
  }
  fitSize = 0;
}
const col = (r: number[]) => r.map(x => x * CW);
function packageTable(p: P, items: Quote["items"], q: Quote | undefined, dates: string[] | null, first: number, compact = false) {
  const c = col([0.07, 0.43, 0.17, 0.15, 0.18]);
  p.row(["Sr", "Package Details", "Amount (PKR)", "Discount", "Total (PKR)"].map((t, i) => ({ w: c[i], a: "c" as const, lines: [{ t, b: true }] })));
  items.forEach((it, i) => p.row([{ w: c[0], lines: [{ t: String(first + i) }] }, { w: c[1], lines: [{ t: it.title, b: true }, { t: i === 0 && dates?.length ? `Event dates: ${dates.map(shortDate).join(", ")}` : it.sub }] },
    { w: c[2], a: "r", lines: [{ t: num(it.amount) }] }, { w: c[3], a: "r", lines: [{ t: num(it.discount) }] }, { w: c[4], a: "r", lines: [{ t: num(it.amount - it.discount) }] }]));
  if (q) {
    const ls: Ln[] = [{ t: "SERVICES INCLUDED", b: true }];
    if (compact) { q.services.forEach(s => ls.push({ t: `(${s.event}): ${s.crew.join(" · ")}` })); ls.push({ t: `DELIVERABLES: ${q.deliverables.join(" · ")}` }); }
    else { q.services.forEach(s => { ls.push({ t: " ", s: 4 }, { t: `(${s.event}):`, b: true }, ...s.crew.map(t => ({ t }))); });
      ls.push({ t: " ", s: 6 }, { t: "DELIVERABLES:", b: true }, ...q.deliverables.map(t => ({ t }))); }
    p.row([{ w: CW, lines: ls }]);
  }
  return c;
}
async function done(p: P) { p.terms(); return p.doc.save(); }

export async function quotePdf(q: Quote, logo: ArrayBuffer | null, brand: Brand = BRAND) {
  const p = await P.create(logo, brand), total = quoteTotal(q), pl = plan(total);
  p.header("Quotation", [["DATE", longDate(q.date)], ["Quotation #", String(q.no)], ["Customer ID", "NA"], ...(q.revision && q.revision > 1 ? [["Revision", `R${q.revision}`] as [string, string]] : [])]);
  p.billTo(q.customer, q.phone, q.comments);
  const c = packageTable(p, q.items, q, null, 1);
  p.row([{ w: CW, lines: [{ t: "Payment T&C:", b: true }, { t: `- 50% Advance is to be paid for booking confirmation*. (PKR ${num(pl[0].amount)})` }, { t: "*No Booking Without Advance" },
    { t: `- 25% is to be paid on the day of the event. (PKR ${num(pl[1].amount)})` }, { t: `- 25% is to be paid on the collection of unedited images for selection purposes. (PKR ${num(pl[2].amount)})` }] }]);
  p.row([{ w: c[0] + c[1] + c[2] + c[3], a: "r", lines: [{ t: "Total", b: true }] }, { w: c[4], a: "r", lines: [{ t: num(total), b: true }] }]);
  p.banner();
  return done(p);
}
export async function invoicePdf(b: Booking, n: number, logo: ArrayBuffer | null, brand: Brand = BRAND) {
  const p = await P.create(logo, brand), i = buildInvoice(b, n), dates = b.events.map(e => e.date).filter(Boolean).sort(), first = dates[0], last = dates[dates.length - 1];
  p.header("Invoice", [["DATE", longDate(i.pay.date)], ["Invoice #", invoiceNo(+i.pay.date.slice(0, 4), i.pay.seq)], ["Quotation #", b.ref]]);
  p.billTo(b.couple, b.phone, "None");
  if (b.quote?.items[0]) packageTable(p, [b.quote.items[0], ...b.addons.map(a => ({ title: a.description, sub: "Added after acceptance", amount: a.amount, discount: 0 }))], b.quote, dates, 1, true);
  p.y -= 12; p.line("Payment details", { bold: true, size: 10.5, gap: 4 });
  const c = col([0.07, 0.46, 0.2, 0.27]);
  const status = (k: number) => (k < i.mi ? `Paid on ${shortDate(b.payments[k].date)}` : k === i.mi ? `Paid now - ${shortDate(i.pay.date)}` : `Due ${shortDate(k === 1 ? first : last)}`);
  p.row(["Sr", "Payment Details", "Amount (PKR)", "Status"].map((t, k) => ({ w: c[k], a: "c" as const, lines: [{ t, b: true }] })));
  i.rows.forEach((m, k) => p.row([{ w: c[0], lines: [{ t: String(k + 1) }] }, { w: c[1], lines: [{ t: m.name, b: true }, { t: m.note }] }, { w: c[2], a: "r", lines: [{ t: num(m.amount) }] }, { w: c[3], a: "r", lines: [{ t: status(k) }] }]));
  const sum = (label: string, v: number, bold = false) => p.row([{ w: c[0] + c[1] + c[2], a: "r", lines: [{ t: label, b: bold }] }, { w: c[3], a: "r", lines: [{ t: num(v), b: bold }] }]);
  sum("Total agreed", b.total); sum("Previously paid", i.before); sum(`Payment received (${i.phase})`, i.pay.amount, true); sum("Remaining balance", i.remaining, true);
  if (i.next) { p.y -= 8; p.line(`Next payment: ${i.next.name}, PKR ${num(i.next.amount)} (${i.next.note.toLowerCase()}).`); }
  p.banner();
  return done(p);
}
