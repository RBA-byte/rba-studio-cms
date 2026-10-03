// Production checklist. Album steps (ord 10-13) are only created when the quotation includes albums.
export const CHECKLIST: [string, boolean][] = [
  ["Wedding shoot completed", false], ["Raw files backed up", false], ["Raw files sent to client", false], ["Client photo selection received", false],
  ["Video songs selected", false], ["Files handed to editor", false], ["Edited photographs completed", false], ["Wedding film and highlights completed", false],
  ["Softcopies delivered", false], ["Album design completed", true], ["Client approved album", true], ["Album printed", true], ["Album delivered", true],
];
export const taskRows = (bookingId: string, withAlbums: boolean) =>
  CHECKLIST.map(([label, album], i) => ({ booking_id: bookingId, ord: i + 1, label, done: false })).filter((_, i) => withAlbums || !CHECKLIST[i][1]);
type T = { ord: number; done: boolean };
// Index into PHASES: 1 Booked, 2 Shoot, 3 Selection, 4 Editing, 5 Albums, 6 Delivered
export function stageOf(tasks: T[]) {
  if (!tasks.length) return 1;
  const open = [...tasks].filter(t => !t.done).sort((a, b) => a.ord - b.ord)[0];
  if (!open) return 6;
  const o = open.ord; return o === 1 ? 1 : o === 2 ? 2 : o <= 5 ? 3 : o <= 9 ? 4 : 5;
}
export const progressOf = (tasks: T[]) => { const done = tasks.filter(t => t.done).length;
  return { done, total: tasks.length, pending: tasks.length - done, pct: tasks.length ? Math.round(done / tasks.length * 100) : 0 }; };
// Steps unlock in order: 1 on/after the last event date, 2 after 1, 3 after 2, everything else after 3.
export function unlocked(tasks: T[], lastDate: string | undefined, today: string) {
  const done = (o: number) => !!tasks.find(t => t.ord === o)?.done, ok = new Set<number>();
  for (const t of tasks) {
    const open = t.ord === 1 ? !lastDate || today >= lastDate : t.ord === 2 ? done(1) : t.ord === 3 ? done(2) : done(3);
    if (open || t.done) ok.add(t.ord);
  }
  return ok;
}
export const lastEventDate = (events: { date: string }[]) => events.map(e => e.date).filter(Boolean).sort().pop();
