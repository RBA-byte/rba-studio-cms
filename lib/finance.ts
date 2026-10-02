export const CATEGORIES = ["Editing", "Printing & albums", "Travel", "Crew / agency", "Equipment", "Marketing", "Other"];
export type Range = "month" | "last" | "all";
export const monthOf = (d: string) => d.slice(0, 7);
export const shiftMonth = (key: string, n: number) => { const d = new Date(key + "-01T00:00:00Z"); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 7); };
export const keyFor = (r: Range, today: string) => (r === "all" ? null : r === "last" ? shiftMonth(monthOf(today), -1) : monthOf(today));
export const inRange = (date: string, key: string | null) => key === null || monthOf(date) === key;
export const monthLabel = (key: string) => new Date(key + "-01T00:00:00Z").toLocaleString("en", { month: "short", year: "numeric", timeZone: "UTC" });
