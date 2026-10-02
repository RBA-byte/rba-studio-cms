export type Quote = { no: string | number; date?: string; status?: string; customer: string; phone: string; comments: string;
  items: { title: string; sub: string; amount: number; discount: number }[];
  services: { event: string; crew: string[] }[]; deliverables: string[] };
export const quoteTotal = (q: Quote) => q.items.reduce((s, i) => s + i.amount - i.discount, 0);
