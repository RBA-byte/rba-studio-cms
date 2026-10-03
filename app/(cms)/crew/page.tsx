import { getBookings } from "@/lib/db";
import { shortDate } from "@/lib/brand";
import { pkr } from "@/lib/calc";
export default async function Crew() {
  const live = (await getBookings()).filter(b => !b.cancelled), people = new Map<string, { name: string; jobs: { couple: string; event: string; date: string; role: string; cost: number }[] }>();
  live.forEach(b => b.slots.filter(s => s.person).forEach(s => { const k = s.person!.trim().toLowerCase(), p = people.get(k) ?? { name: s.person!.trim(), jobs: [] };
    p.jobs.push({ couple: b.couple, event: s.event, date: b.events.find(e => e.name === s.event)?.date ?? "", role: s.role, cost: s.cost }); people.set(k, p); }));
  const list = [...people.values()].sort((a, b) => b.jobs.length - a.jobs.length);
  return <><h1 className="reveal">Crew</h1>
    {list.length === 0 && <div className="card reveal"><p className="mute" style={{ margin: 0 }}>Assign names to crew slots on a booking and they will appear here.</p></div>}
    {list.map((p, i) => <details className="card dropd reveal" style={{ "--i": i + 1, marginBottom: 14 } as React.CSSProperties} key={p.name}>
      <summary><div><h2 style={{ margin: 0 }}>{p.name}</h2><span className="mute">{p.jobs.length} day{p.jobs.length > 1 ? "s" : ""} assigned · paid {pkr(p.jobs.reduce((s, j) => s + j.cost, 0))}</span></div><span className="chev" aria-hidden><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6.5 9.5 12 15l5.5-5.5" /></svg></span></summary>
      <div className="dd">{[...p.jobs].sort((a, b) => b.date.localeCompare(a.date)).map((j, k) => <div className="row" key={k}><div>{j.couple} · {j.event}<div className="mute">{j.role} · {j.date ? shortDate(j.date) : "Date TBC"}</div></div><span>{j.cost ? pkr(j.cost) : "—"}</span></div>)}</div></details>)}</>;
}
