export type DayPlan = { event: string; date: string; venue: string; p: number; v: number; d: number };
export type Quote = { no: string | number; revision?: number; days?: DayPlan[]; date?: string; status?: string; customer: string; phone: string; comments: string;
  items: { title: string; sub: string; amount: number; discount: number }[];
  services: { event: string; crew: string[] }[]; deliverables: string[] };
export const quoteTotal = (q: Quote) => q.items.reduce((s, i) => s + i.amount - i.discount, 0);
