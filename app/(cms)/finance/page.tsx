import Link from "next/link";
import { getBookings, getExpenses } from "@/lib/db";
import { paidOf } from "@/lib/data";
import { CATEGORIES, Range, crewExpenses, inRange, keyFor, monthLabel, monthOf, shiftMonth } from "@/lib/finance";
import { todayPK } from "@/lib/brand";
import { pkr } from "@/lib/calc";
import { addExpense, deleteExpense } from "@/app/actions";
const R = (i: number) => ({ "--i": i } as React.CSSProperties);
export default async function Finance({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const { r } = await searchParams, range: Range = r === "last" || r === "all" ? r : "month", today = todayPK(), key = keyFor(range, today);
  const [bookings, manual] = await Promise.all([getBookings(), getExpenses()]);
  const expenses = [...manual, ...crewExpenses(bookings, today)].sort((a, b) => b.date.localeCompare(a.date));
  // Income = payments received, minus refunds (dated when the booking was cancelled)
  const flows = bookings.flatMap(b => [...b.payments.map(p => ({ date: p.date, amt: p.amount })), ...(b.refund ? [{ date: b.cancelledAt || today, amt: -b.refund }] : [])]);
  const income = flows.filter(f => inRange(f.date, key)).reduce((s, f) => s + f.amt, 0);
  const spendList = expenses.filter(e => inRange(e.date, key)), spend = spendList.reduce((s, e) => s + e.amount, 0);
  const owed = bookings.filter(b => !b.cancelled).reduce((s, b) => s + b.total - paidOf(b), 0);
  const months = Array.from({ length: 6 }, (_, i) => shiftMonth(monthOf(today), i - 5)).map(m => ({ m,
    inc: flows.filter(f => monthOf(f.date) === m).reduce((s, f) => s + f.amt, 0), exp: expenses.filter(e => monthOf(e.date) === m).reduce((s, e) => s + e.amount, 0) }));
  const top = Math.max(1, ...months.flatMap(x => [x.inc, x.exp]));
  const cats = [...CATEGORIES, "Crew (from bookings)"].map(c => ({ c, v: spendList.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0) })).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
  const perBooking = bookings.filter(b => b.payments.length).map(b => { const net = paidOf(b) - b.refund, ex = expenses.filter(e => e.bookingId === b.id).reduce((s, e) => s + e.amount, 0); return { b, net, ex, profit: net - ex }; });
  const tab = (v: string, l: string) => <Link className={`btn ghost${(r ?? "month") === v ? " sel" : ""}`} href={`/finance?r=${v}`}>{l}</Link>;
  return <><h1 className="reveal">Finance</h1>
    <div className="reveal" style={{ ...R(1), display: "flex", gap: 8, marginBottom: 16 }}>{tab("month", "This month")}{tab("last", "Last month")}{tab("all", "All time")}</div>
    <div className="grid4 reveal" style={R(2)}>
      <div className="card stat hero"><small>Net profit</small><div className="num">{pkr(income - spend)}</div></div>
      <div className="card stat"><small>Income (after refunds)</small><div className="num">{pkr(income)}</div></div>
      <div className="card stat"><small>Expenses</small><div className="num">{pkr(spend)}</div></div>
      <div className="card stat"><small>Still to collect</small><div className="num pending">{pkr(owed)}</div></div></div>
    <div className="cols">
      <div className="card reveal" style={R(3)}><h2 style={{ margin: 0 }}>Last 6 months</h2>
        {months.map(x => <div key={x.m} style={{ marginTop: 14 }}><div className="row" style={{ border: 0, padding: 0 }}><span>{monthLabel(x.m)}</span><span className="mute">{pkr(x.inc)} in · {pkr(x.exp)} out · <b style={{ color: x.inc - x.exp < 0 ? "#E09A7A" : "var(--ink)" }}>{pkr(x.inc - x.exp)}</b></span></div>
          <div className="bar2"><i style={{ width: `${Math.max(0, x.inc) / top * 100}%` }} /></div><div className="bar2 out"><i style={{ width: `${x.exp / top * 100}%` }} /></div></div>)}</div>
      <div className="card reveal" style={R(4)}><h2 style={{ margin: 0 }}>Expenses by category</h2>
        {cats.length === 0 && <p className="mute">No expenses in this period.</p>}
        {cats.map(x => <div className="row" key={x.c}><span>{x.c}</span><span className="mute">{pkr(x.v)} · {Math.round(x.v / spend * 100)}%</span></div>)}
        <form action={addExpense} style={{ display: "grid", gap: 8, marginTop: 18 }}><label>Add expense</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}><input name="amount" type="number" min={1} required placeholder="Amount (PKR)" /><input name="date" type="date" defaultValue={today} aria-label="Date" /></div>
          <select name="category">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
          <select name="booking" defaultValue=""><option value="">Not linked to a wedding</option>{bookings.filter(b => !b.cancelled).map(b => <option key={b.id} value={b.id}>{b.couple}</option>)}</select>
          <input name="note" placeholder="Note (optional)" /><button className="btn">Save expense</button></form></div></div>
    <div className="card reveal" style={{ ...R(5), marginTop: 16 }}><h2 style={{ margin: 0 }}>Profit per wedding</h2>
      {perBooking.length === 0 && <p className="mute">No payments recorded yet.</p>}
      {perBooking.map(({ b, net, ex, profit }) => <Link className="row" key={b.id} href={`/bookings/${b.id}`}><div><b>{b.couple}</b><div className="mute">{pkr(net)} received · {pkr(ex)} expenses</div></div><span className="num" style={{ color: profit < 0 ? "#E09A7A" : "var(--ink)" }}>{pkr(profit)}</span></Link>)}</div>
    <div className="card reveal" style={{ ...R(6), marginTop: 16 }}><h2 style={{ margin: 0 }}>Expenses</h2>
      {spendList.length === 0 && <p className="mute">Nothing recorded for this period.</p>}
      {spendList.map(e => <form action={deleteExpense} className="row" key={e.id}><input type="hidden" name="id" value={e.id} />
        <div><b>{e.category}</b><div className="mute">{e.date}{e.note && ` · ${e.note}`}{e.bookingId && ` · ${bookings.find(b => b.id === e.bookingId)?.couple ?? ""}`}</div></div>
        <span style={{ display: "flex", gap: 12, alignItems: "center" }}>{pkr(e.amount)}{"crew" in e && e.crew ? <small className="mute">edit in booking</small> : <button className="btn ghost" aria-label="Delete expense">Delete</button>}</span></form>)}</div></>;
}
