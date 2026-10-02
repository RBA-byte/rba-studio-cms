import Builder from "@/components/Builder";
import { getQuote } from "@/lib/db";
export default async function NewQuotation({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { from } = await searchParams;
  const q = from ? await getQuote(+from) : null;
  return <Builder initial={q?.form} no={q?.no} />;
}
