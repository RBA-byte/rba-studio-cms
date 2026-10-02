"use client";
import { useState } from "react";
import Link from "next/link";
import { calcQuotation, DEFAULT_RATES, pkr } from "@/lib/calc";
import type { Quote } from "@/lib/doc";
type Day = { event: string; date: string; p: number; v: number; d: number };
const NAMES = ["Mehndi", "Baraat", "Waleema"];
const mk = (i: number): Day => ({ event: NAMES[i] ?? `Day ${i + 1}`, date: "", p: 1, v: 1, d: 0 });
const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
function Num({ l, v, set }: { l: string; v: number; set: (n: number) => void }) {
  return <div><label>{l}</label><input type="number" min={0} value={v} onChange={e => set(Math.max(0, +e.target.value || 0))} /></div>;
}
export default function NewQuotation() {
  const [customer, setCustomer] = useState(""), [phone, setPhone] = useState(""), [comments, setComments] = useState("None");
  const [days, setDays] = useState<Day[]>([mk(0), mk(1), mk(2)]);
  const [outdoor, setOutdoor] = useState(false), [outdoorCost, setOutdoorCost] = useState(15000);
  const [albums, setAlbums] = useState(2), [crewRate, setCrewRate] = useState(DEFAULT_RATES.photographer), [albumRate, setAlbumRate] = useState(DEFAULT_RATES.album);
  const [profit, setProfit] = useState(0), [discount, setDiscount] = useState(0), [pct, setPct] = useState(false);
  const [deliv, setDeliv] = useState("3 × Event coverage videos (30–45 min)\n1 × Event Highlights\nUnlimited RAW softcopies");
  const setN = (n: number) => setDays(d => n > d.length ? [...d, ...Array.from({ length: n - d.length }, (_, k) => mk(d.length + k))] : d.slice(0, n));
  const upd = (i: number, patch: Partial<Day>) => setDays(d => d.map((x, k) => (k === i ? { ...x, ...patch } : x)));
  const sum = (k: "p" | "v" | "d") => days.reduce((s, x) => s + x[k], 0);
  const out = outdoor ? outdoorCost : 0;
  const base = crewRate * (sum("p") + sum("v") + sum("d")) + albums * albumRate + profit + out;
  const disc = Math.min(base, pct ? Math.round(base * discount / 100) : discount);
  const r = calcQuotation([{ label: "crew", qty: sum("p") + sum("v") + sum("d"), days: 1, rate: crewRate }], { qty: albums, rate: albumRate }, profit + out, disc);
  const dates = days.map(x => x.date).filter(Boolean).map(fmt);
  const quote: Quote = { no: "DRAFT", customer: customer || "Customer name", phone, comments, deliverables: [...deliv.split("\n").map(x => x.trim()).filter(Boolean), ...(albums ? [`${albums} × Album${albums > 1 ? "s" : ""}`] : [])],
    items: [{ title: days.map(x => x.event || "Event").join(" + ") + " Coverage", sub: dates.length ? `Event dates: ${dates.join(", ")}` : "Event dates: to be confirmed", amount: base, discount: disc }],
    services: [...days.map(x => ({ event: x.event || "Event", crew: [x.p && `${x.p} × Photographer`, x.v && `${x.v} × Videographer`, x.d && `${x.d} × Drone`].filter(Boolean) as string[] })),
      ...(outdoor ? [{ event: "Outdoor shoot", crew: ["Included"] }] : [])] };
  return <><h1 className="reveal">New quotation</h1>
    <div className="cols" style={{ gridTemplateColumns: "1.5fr 1fr", alignItems: "start" }}>
      <div style={{ display: "grid", gap: 14 }}>
        <div className="card reveal" style={{ display: "grid", gap: 12 }}>
          <div><label>Customer name</label><input value={customer} onChange={e => setCustomer(e.target.value)} /></div>
          <div><label>Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 3xx xxxxxxx" /></div>
          <div><label>Wedding days</label><div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button className="btn ghost" aria-label="Fewer days" onClick={() => setN(Math.max(1, days.length - 1))}>−</button>
            <b className="num" style={{ fontSize: 24, minWidth: 30, textAlign: "center" }}>{days.length}</b>
            <button className="btn ghost" aria-label="More days" onClick={() => setN(Math.min(7, days.length + 1))}>+</button></div></div></div>
        {days.map((x, i) => <div className="card reveal" style={{ display: "grid", gap: 12 }} key={i}>
          <b className="num" style={{ fontSize: 20 }}>Day {i + 1}</b>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
            <div><label>Event name</label><input list="events" value={x.event} onChange={e => upd(i, { event: e.target.value })} /></div>
            <div><label>Date</label><input type="date" value={x.date} onChange={e => upd(i, { date: e.target.value })} /></div></div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            <Num l="Photographers" v={x.p} set={n => upd(i, { p: n })} /><Num l="Videographers" v={x.v} set={n => upd(i, { v: n })} /><Num l="Drone operators" v={x.d} set={n => upd(i, { d: n })} /></div></div>)}
        <datalist id="events">{["Mehndi", "Baraat", "Waleema", "Dholki", "Nikah", "Rukhsati"].map(n => <option key={n} value={n} />)}</datalist>
        <div className="card reveal" style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--ink)", fontSize: 15, margin: 0 }}>
            <input type="checkbox" style={{ width: 18, height: 18 }} checked={outdoor} onChange={e => setOutdoor(e.target.checked)} /> Optional outdoor shoot</label>
          {outdoor && <Num l="Outdoor shoot cost (PKR)" v={outdoorCost} set={setOutdoorCost} />}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
            <Num l="Albums" v={albums} set={setAlbums} /><Num l="Crew rate per person per day" v={crewRate} set={setCrewRate} /><Num l="Album rate" v={albumRate} set={setAlbumRate} />
            <Num l="Additional profit (PKR)" v={profit} set={setProfit} />
            <div><label>Discount ({pct ? "%" : "PKR"})</label><div style={{ display: "flex", gap: 8 }}><input type="number" min={0} value={discount} onChange={e => setDiscount(Math.max(0, +e.target.value || 0))} />
              <button className="btn ghost" onClick={() => setPct(!pct)} aria-label="Switch discount type">{pct ? "%" : "PKR"}</button></div></div></div>
          <div><label>Deliverables (one per line)</label><textarea value={deliv} onChange={e => setDeliv(e.target.value)} rows={4} /></div>
          <div><label>Comments or special instructions</label><input value={comments} onChange={e => setComments(e.target.value)} /></div></div></div>
      <div className="card reveal" style={{ position: "sticky", top: 20 }}>
        <small>Final total</small><div className="num" style={{ fontSize: 38, color: "var(--gold)" }}>{pkr(r.total)}</div>
        <table><tbody>
          <tr><td>Crew ({sum("p")} photo · {sum("v")} video · {sum("d")} drone)</td><td>{pkr(crewRate * (sum("p") + sum("v") + sum("d")))}</td></tr>
          <tr><td>Albums</td><td>{pkr(r.albumTotal)}</td></tr>{outdoor && <tr><td>Outdoor shoot</td><td>{pkr(out)}</td></tr>}
          {profit > 0 && <tr><td>Additional profit</td><td>{pkr(profit)}</td></tr>}{disc > 0 && <tr><td>Discount</td><td>− {pkr(disc)}</td></tr>}
          {r.schedule.map(s => <tr key={s.milestone}><td>{s.milestone} ({s.pct}%)</td><td>{pkr(s.amount)}</td></tr>)}</tbody></table>
        <Link prefetch={false} className="btn" style={{ display: "block", textAlign: "center" }} href={`/quotations/preview?d=${encodeURIComponent(JSON.stringify(quote))}`}>Preview &amp; download PDF</Link></div>
    </div></>;
}
