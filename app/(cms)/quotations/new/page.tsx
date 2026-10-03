import Builder from "@/components/Builder";
import { getQuote } from "@/lib/db";
import { getSettings } from "@/lib/settings";
export default async function NewQuotation({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const q = from ? await getQuote(+from) : null, st = await getSettings();
  return <Builder initial={q?.form} no={q?.no} defaults={{ crewRate: st.crewRate, albumRate: st.albumRate, outdoorCost: st.outdoorCost }} />;
}
