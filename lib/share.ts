import { createHmac, timingSafeEqual } from "crypto";
// Signed, unguessable links so a client can open one quotation/invoice without logging in.
const secret = () => { const s = process.env.SHARE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY; if (!s) throw new Error("Missing SHARE_SECRET or SUPABASE_SERVICE_ROLE_KEY"); return s; };
const sign = (p: string) => createHmac("sha256", secret()).update(p).digest("base64url");
export const shareLink = (payload: string) => { const p = Buffer.from(payload).toString("base64url"); return `/d/${p}.${sign(p)}`; };
export function verifyShare(token: string): string | null {
  const [p, sig] = token.split("."); if (!p || !sig) return null;
  const a = Buffer.from(sig), b = Buffer.from(sign(p)); if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return Buffer.from(p, "base64url").toString();
}
