"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const items = [["/", "Home"], ["/bookings", "Bookings"], ["/quotations/new", "Quotes"], ["/invoices", "Invoices"]];
export default function Nav() {
  const p = usePathname();
  const on = (h: string) => (h === "/" ? p === "/" : p.startsWith(h));
  const links = items.map(([h, l]) => <Link key={h} href={h} className={on(h) ? "on" : ""}>{l}</Link>);
  return <><aside className="side"><b>RBA</b><small>Films & Photography</small>{links}</aside><nav className="tabs">{links}</nav></>;
}
