"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [["/", "Home"], ["/bookings", "Bookings"], ["/quotations", "Quotes"], ["/invoices", "Invoices"], ["/finance", "Finance"], ["/reports", "Reports"], ["/crew", "Crew"]];
const extra = [["/clients", "Clients"], ["/settings", "Settings"]]; // sidebar only (phone: button on the dashboard)
export default function Nav() {
  const p = usePathname();
  const on = (h: string) => (h === "/" ? p === "/" : p.startsWith(h));
  const mk = (list: string[][]) => list.map(([h, l]) => <Link key={h} href={h} className={on(h) ? "on" : ""}>{l}</Link>);
  return <><aside className="side"><b>RBA<span>.</span></b><small>Films & Photography</small>{mk([...items, ...extra])}</aside><nav className="tabs">{mk(items)}</nav></>;
}
