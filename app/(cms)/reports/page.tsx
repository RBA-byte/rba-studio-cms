import { Fragment } from "react";
import { getBookings, getExpenses } from "@/lib/db";
import { buildReport, defaultRange } from "@/lib/report";
import { shortDate, todayPK } from "@/lib/brand";
import { pkr } from "@/lib/calc";
import PrintBtn from "@/components/PrintBtn";
export default async function Reports({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const sp = await searchParams, d = defaultRange(todayPK()), from = sp.from || d.from, to = sp.to || d.to;
  const { weds, total } = buildReport(await getBookings(), await getExpenses(), from, to);
  let sr = 0;
  return <div className="rep"><h1 className="reveal">Reports</h1>
    <form className="card noprint reveal" style={{ "--i": 1, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end", marginBottom: 16 } as React.CSSProperties}>
      <div><label>From</label><input type="date" name="from" defaultValue={from} /></div><div><label>To</label><input type="date" name="to" defaultValue={to} /></div>
      <button className="btn">Apply</button><a className="btn ghost" href={`/reports/csv?from=${from}&to=${to}`}>Download Excel (CSV)</a><PrintBtn /></form>
    <p className="mute">Weddings with an event between {shortDate(from)} and {shortDate(to)}.</p>
    <div className="xlscroll card reveal" style={{ "--i": 2, padding: 0 } as React.CSSProperties}><table className="xlr">
      <thead><tr><th>Sr#</th><th>Event name</th><th>Event day</th><th>Venue</th><th>Crew member</th><th>Crew expense</th><th>Misc. expense</th><th>Total expense</th><th>Paid by client</th><th>Pending</th><th>Profit</th></tr></thead>
      <tbody>{weds.length === 0 && <tr><td colSpan={11} className="mute">No weddings in this range.</td></tr>}
        {weds.map((w, wi) => { const total = w.days.reduce((s, x) => s + Math.max(1, x.crew.length), 0); let first = true;
          return <Fragment key={w.b.id}><tr className="wed"><td colSpan={11}>{w.b.couple} · #{w.b.ref}</td></tr>
            {w.days.map(day => { sr++; const n = Math.max(1, day.crew.length);
              return Array.from({ length: n }, (_, i) => { const c = day.crew[i], lead = first && i === 0; if (lead) first = false;
                return <tr key={`${wi}-${day.event}-${i}`}>
                  {i === 0 && <><td rowSpan={n}>{sr}</td><td rowSpan={n}>{day.event}</td><td rowSpan={n}>{shortDate(day.date)}</td><td rowSpan={n}>{day.venue || "—"}</td></>}
                  <td>{c ? c.label : "—"}</td><td className="n">{c ? pkr(c.cost) : "—"}</td>
                  {lead && <><td rowSpan={total} className="n">{pkr(w.misc)}</td><td rowSpan={total} className="n">{pkr(w.totalExp)}</td><td rowSpan={total} className="n">{pkr(w.paid)}</td>
                    <td rowSpan={total} className={`n${w.pending > 0 ? " pending" : ""}`}>{pkr(w.pending)}</td><td rowSpan={total} className="n"><b>{pkr(w.profit)}</b></td></>}</tr>; }); })}</Fragment>; })}</tbody>
      <tfoot><tr><td colSpan={10}>Total profit</td><td className="n">{pkr(total)}</td></tr></tfoot></table></div></div>;
}
