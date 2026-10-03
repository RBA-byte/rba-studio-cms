import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookings } from "@/lib/db";
import { paidOf, PHASES } from "@/lib/data";
import { conflicts, crewProgress, isConfirmed, slotLabel } from "@/lib/booking";
import { lastEventDate, progressOf, unlocked } from "@/lib/checklist";
import { invoiceNo, schedule } from "@/lib/invoice";
import { pkr } from "@/lib/calc";
import { shortDate, todayPK } from "@/lib/brand";
import { confirmationText, dueLabel, nextDue, reminderText } from "@/lib/reminders";
import MsgButtons from "@/components/MsgButtons";
import { cancelBooking, createTasks, recordPayment, restoreBooking, saveBooking, toggleTask } from "@/app/actions";
const R = (i: number) => ({ "--i": i } as React.CSSProperties);
export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params, all = await getBookings(), today = todayPK();
  const b = all.find(x => x.id === id); if (!b) notFound();
  const ok = isConfirmed(b), c = crewProgress(b), clash = b.cancelled ? [] : conflicts(b, all.filter(x => !x.cancelled)), paid = paidOf(b), left = b.total - paid;
  const adv = b.payments[0]?.amount ?? 0, rows = schedule(b), next = rows.find(r => r.state !== "paid"), pr = progressOf(b.tasks);
  const suggest = next ? Math.min(left, next.state === "part" ? left : next.amount) : "";
  const last = lastEventDate(b.events), open = unlocked(b.tasks, last, today), crewCost = b.slots.reduce((s, x) => s + x.cost, 0);
  const dueNow = nextDue(b, today);
  const sig = b.events.map(e => e.date + e.venue).join() + b.slots.map(s => s.status + s.person + s.cost).join();
  return <>
    <Link href="/bookings" className="mute">← All bookings</Link>
    <h1 className="reveal" style={{margin:"8px 0 6px",fontSize:"clamp(30px,4.5vw,46px)"}}>{b.couple}</h1>
    <p className="reveal" style={{...R(1),display:"flex",gap:8,flexWrap:"wrap",margin:"0 0 24px",alignItems:"center"}}>
      <span className="mute">#{b.ref}</span>
      {b.cancelled ? <span className="pill warn">Cancelled</span> : <span className={`pill ${ok ? "ok" : "warn"}`}>{ok ? "Booking confirmed" : "Awaiting advance"}</span>}
      {!b.cancelled && <span className={`pill ${c.done === c.total ? "ok" : "warn"}`}>Crew {c.done}/{c.total}</span>}<span className="pill">{PHASES[b.phase]}</span></p>
    {b.cancelled && <div className="card reveal" style={{...R(2),marginBottom:16,borderColor:"rgba(224,120,86,.4)"}}>
      <b>Booking cancelled.</b> Received {pkr(paid)} · refunded {pkr(b.refund)} · kept {pkr(paid - b.refund)}.{b.cancelReason && <div className="mute">Reason: {b.cancelReason}</div>}
      <form action={restoreBooking} style={{marginTop:12}}><input type="hidden" name="booking" value={b.id} /><button className="btn ghost">Restore booking</button></form></div>}
    {clash.length > 0 && <div className="card reveal" style={{...R(2),marginBottom:16,borderColor:"rgba(224,120,86,.4)"}}>Date clash: {clash.map(x => `${x.date} also reserved for ${x.other}`).join("; ")}.</div>}
    <div className="cols">
      <div className="card reveal" style={R(3)}><h2 style={{margin:0}}>Dates and crew</h2>
        {b.cancelled ? b.events.map(e => <div className="row" key={e.id}><b>{e.name}</b><span className="mute">{e.date ? shortDate(e.date) : "Date TBC"}</span></div>) :
        <form action={saveBooking} key={sig}>
          {b.events.map(e => <div key={e.id} style={{marginTop:18}}>
            <div className="evform"><b>{e.name}{e.outdoor && <span className="pill" style={{marginLeft:8}}>Outdoor</span>}</b>
              <input type="date" name={`event_${e.id}_date`} defaultValue={e.date} aria-label="Date" /><input name={`event_${e.id}_venue`} defaultValue={e.venue} placeholder="Venue" aria-label="Venue" /></div>
            {b.slots.filter(s => s.event === e.name).map(s => <div className="slot" key={s.id}><span>{s.role}</span>
              <select name={`slot_${s.id}_status`} defaultValue={s.status} aria-label="Status"><option value="pending">Not assigned</option><option value="assigned">Assigned</option></select>
              <input name={`slot_${s.id}_person`} defaultValue={s.person} placeholder="Name (or Self)" aria-label="Name" />
              <input name={`slot_${s.id}_cost`} type="number" min={0} defaultValue={s.cost || ""} placeholder="Expense (PKR)" aria-label="Crew expense" /></div>)}</div>)}
          <div className="row" style={{border:0,paddingBottom:0}}><small className="mute">Crew expenses {pkr(crewCost)} · count as project expenses. “Self” = no expense.</small><button className="btn">Save changes</button></div></form>}</div>
      <div className="card reveal" style={R(4)}><h2 style={{margin:0}}>Payments</h2><p className="mute">Total agreed {pkr(b.total)} · received {pkr(paid)} · balance {pkr(left)}</p>
        {rows.map(m => <div className="row" key={m.name}><div>{m.name}<div className="mute">{m.note}</div></div>
          <div style={{textAlign:"right"}}>{pkr(m.amount)}<div><span className={`pill ${m.state === "paid" ? "ok" : "warn"}`}>{m.state === "paid" ? "Paid" : m.state === "part" ? "Part paid" : "Due"}</span></div></div></div>)}
        <p className="mute">Any advance amount confirms the booking. A shortfall or extra moves into the next instalment; the final amount is whatever remains.</p>
        {!b.cancelled && left > 0 && <form action={recordPayment} style={{display:"grid",gap:8,margin:"14px 0"}}><input type="hidden" name="booking" value={b.id} />
          <label>Record payment (PKR)</label><input name="amount" type="number" min={1} max={left} required defaultValue={suggest} />
          <input name="date" type="date" defaultValue={today} aria-label="Payment date" /><button className="btn">Save &amp; create invoice</button></form>}
        {!b.cancelled && (ok || dueNow) && <div style={{display:"grid",gap:12,margin:"6px 0 14px"}}>
          {ok && <div><small className="mute">Booking confirmation message</small><div style={{marginTop:6}}><MsgButtons phone={b.phone} text={confirmationText(b)} /></div></div>}
          {dueNow && <div><small className="mute">Payment reminder · {dueNow.name} {dueLabel(dueNow.days)}</small><div style={{marginTop:6}}><MsgButtons phone={b.phone} text={reminderText(b, dueNow)} /></div></div>}</div>}
        <p className="mute" style={{marginBottom:6}}>Invoices</p>
        {b.payments.map((p, i) => <Link key={i} className="row" href={`/invoices/${b.id}/${i + 1}`}><span>{invoiceNo(+p.date.slice(0, 4), p.seq)}</span><span className="mute">{p.date} · {pkr(p.amount)}</span></Link>)}</div>
    </div>
    {!b.cancelled && <div id="timeline" className="card reveal" style={{...R(5),marginTop:16}}>
      <div className="row" style={{border:0,padding:0}}><h2 style={{margin:0}}>Project timeline</h2>{b.tasks.length > 0 && <span className="mute">{pr.pct}% complete · {pr.done} done · {pr.pending} pending</span>}</div>
      {b.tasks.length > 0 ? <><div className="bar"><i style={{width:`${pr.pct}%`}} /></div>
        {b.tasks.map(t => <form action={toggleTask} key={t.id}><input type="hidden" name="id" value={t.id} /><input type="hidden" name="done" value={String(t.done)} />
          <button className={`task${t.done ? " done" : ""}`} disabled={!open.has(t.ord)}><span className="box">{t.done ? "✓" : ""}</span><span>{t.label}</span>
            <small>{t.doneOn ?? (t.ord === 1 && !open.has(1) && last ? `Unlocks ${shortDate(last)}` : "")}</small></button></form>)}</> :
        <form action={createTasks} style={{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap",marginTop:12}}><input type="hidden" name="booking" value={b.id} />
          <label style={{display:"flex",gap:8,alignItems:"center",margin:0,color:"var(--ink)"}}><input type="checkbox" name="albums" style={{width:18,height:18}} /> Albums included</label><button className="btn">Start production checklist</button></form>}</div>}
    {!b.cancelled && <details className="card reveal" style={{...R(6),marginTop:16}}><summary style={{cursor:"pointer"}}>Cancel this booking</summary>
      <form action={cancelBooking} style={{display:"grid",gap:10,marginTop:14}}><input type="hidden" name="booking" value={b.id} />
        <label className="opt"><input type="radio" name="refund" value="policy" defaultChecked /> Refund 25% of the advance ({pkr(Math.round(adv * .25))})</label>
        <label className="opt"><input type="radio" name="refund" value="full" /> Refund 100% of the advance ({pkr(adv)})</label>
        <label className="opt"><input type="radio" name="refund" value="none" /> No refund</label>
        <label className="opt"><input type="radio" name="refund" value="custom" /> Custom refund (PKR)</label>
        <input name="custom" type="number" min={0} max={paid} placeholder="Custom amount" /><input name="reason" placeholder="Reason (optional)" />
        <button className="btn">Cancel booking</button><small className="mute">Dates are released from the calendar. You can restore the booking later.</small></form></details>}
  </>;
}
