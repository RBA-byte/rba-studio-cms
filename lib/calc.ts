export type Line = { label: string; qty: number; days: number; rate: number };
export const DEFAULT_RATES = { photographer: 10000, videographer: 10000, drone: 10000, album: 10000 };
export function calcQuotation(resources: Line[], albums: { qty: number; rate: number }, profit: number, discount: number) {
  const resourceTotal = resources.reduce((s, r) => s + r.qty * r.days * r.rate, 0);
  const albumTotal = albums.qty * albums.rate;
  const subtotal = resourceTotal + albumTotal;
  const total = Math.max(0, subtotal + profit - discount);
  const advance = Math.round(total * 0.5);
  const wedding = Math.round(total * 0.25);
  return { resourceTotal, albumTotal, subtotal, total, schedule: [
    { milestone: "Booking confirmation", pct: 50, amount: advance },
    { milestone: "Wedding day", pct: 25, amount: wedding },
    { milestone: "Pictures sent for selection", pct: 25, amount: total - advance - wedding },
  ]};
}
export const pkr = (n: number) => "PKR " + n.toLocaleString("en-PK");
