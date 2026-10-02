import { NextRequest, NextResponse } from "next/server";
import { COOKIE, token } from "@/lib/auth";
export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/login")) return NextResponse.next();
  if (req.cookies.get(COOKIE)?.value === (await token())) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", req.url));
}
export const config = { matcher: ["/((?!_next|favicon.ico).*)"] };
