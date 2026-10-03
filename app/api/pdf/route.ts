import { createClient } from "@/lib/supabase";
import { renderDoc } from "@/lib/render";
export async function GET(req: Request) {
  const u = new URL(req.url), sb = await createClient();
  if (!(await sb.auth.getUser()).data.user) return new Response("Unauthorized", { status: 401 });
  const r = await renderDoc(u.searchParams.get("kind") === "invoice" ? "invoice" : "quote", u.searchParams.get("ref") ?? "", Number(u.searchParams.get("n") || 1), u.origin);
  if (!r) return new Response("Not found", { status: 404 });
  return new Response(Buffer.from(r.bytes), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${r.filename}"` } });
}
