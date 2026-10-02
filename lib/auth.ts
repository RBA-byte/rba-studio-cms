export const COOKIE = "rba_session";
export async function token() {
  const data = new TextEncoder().encode(`${process.env.ADMIN_PASSWORD}:${process.env.SESSION_SECRET}`);
  const h = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
