import { getSettings } from "@/lib/settings";
import { saveSettings } from "@/app/actions";
export default async function Settings({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams, s = await getSettings(), b = s.brand;
  return <><h1 className="reveal">Settings</h1>
    <form action={saveSettings} className="cols" style={{ alignItems: "start" }}>
      <div className="card reveal" style={{ "--i": 1, display: "grid", gap: 12 } as React.CSSProperties}><h2 style={{ margin: 0 }}>Default rates</h2>
        <p className="mute" style={{ margin: 0 }}>Used when you start a new quotation. Saved quotations keep the rates they were created with.</p>
        <div><label>Crew rate per person per day (PKR)</label><input name="crewRate" type="number" min={0} defaultValue={s.crewRate} /></div>
        <div><label>Album rate (PKR)</label><input name="albumRate" type="number" min={0} defaultValue={s.albumRate} /></div>
        <div><label>Outdoor shoot per day (PKR)</label><input name="outdoorCost" type="number" min={0} defaultValue={s.outdoorCost} /></div></div>
      <div className="card reveal" style={{ "--i": 2, display: "grid", gap: 12 } as React.CSSProperties}><h2 style={{ margin: 0 }}>Business details</h2>
        <p className="mute" style={{ margin: 0 }}>Shown on quotations, invoices, PDFs and messages.</p>
        <div><label>Studio name</label><input name="name" defaultValue={b.name} required /></div>
        <div><label>Tagline</label><input name="tagline" defaultValue={b.tagline} /></div>
        <div><label>Address</label><input name="address" defaultValue={b.address} /></div>
        <div><label>Phone</label><input name="cell" defaultValue={b.cell} /></div>
        <div><label>Email</label><input name="email" type="email" defaultValue={b.email} /></div>
        <button className="btn">Save settings</button>{saved && <small role="status" style={{ color: "#8FD1A8" }}>Saved.</small>}</div></form></>;
}
