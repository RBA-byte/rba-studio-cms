import { getClients } from "@/lib/db";
export default async function Clients() {
  const clients = await getClients();
  return <><h1 className="reveal">Clients</h1><div className="card reveal" style={{ "--i": 1 } as React.CSSProperties}>
    {clients.length === 0 && <p className="mute">Clients are added automatically when you save a quotation with a phone number.</p>}
    {clients.map(c => <div className="row" key={c.id}><div><b>{c.name}</b><div className="mute">{c.phone || "No phone"}{c.email && ` · ${c.email}`}</div></div>
      <span style={{ display: "flex", gap: 10, alignItems: "center" }}><span className="mute">{c.quotes} quotation{c.quotes === 1 ? "" : "s"}</span>
        {c.phone && <a className="btn ghost" href={`https://wa.me/${c.phone.replace(/\D/g, "").replace(/^0/, "92")}`} target="_blank">WhatsApp</a>}</span></div>)}</div></>;
}
