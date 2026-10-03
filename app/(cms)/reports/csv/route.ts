import { getBookings, getExpenses } from "@/lib/db";
import { buildReport, defaultRange } from "@/lib/report";
import { todayPK } from "@/lib/brand";
export async function GET(req: Request) {
  const u = new URL(req.url), d = defaultRange(todayPK()), from = u.searchParams.get("from") || d.from, to = u.searchParams.get("to") || d.to;
  const { weds, total } = buildReport(await getBookings(), await getExpenses(), from, to);
  const rows: (string | number)[][] = [["Sr#", "Wedding", "Event name", "Event day", "Venue", "Crew member", "Crew expense", "Misc. expense", "Total expense", "Paid by client", "Pending", "Profit"]];
  let sr = 0;
  for (const w of weds) { let lead = true; for (const day of w.days) { sr++; const crew = day.crew.length ? day.crew : [{ label: "", cost: 0 }];
    crew.forEach((c, i) => { rows.push([i === 0 ? sr : "", w.b.couple, day.event, day.date, day.venue, c.label, c.cost || "", ...(lead ? [w.misc, w.totalExp, w.paid, w.pending, w.profit] : ["", "", "", "", ""])]); lead = false; }); } }
  rows.push(["", "", "", "", "", "", "", "", "", "", "Total profit", total]);
  const csv = "\ufeff" + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="rba-report-${from}_to_${to}.csv"` } });
}
