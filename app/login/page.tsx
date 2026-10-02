import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, token } from "@/lib/auth";
async function login(fd: FormData) {
  "use server";
  if (fd.get("password") !== process.env.ADMIN_PASSWORD) redirect("/login?error=1");
  (await cookies()).set(COOKIE, await token(), { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60*60*24*14, path: "/" });
  redirect("/");
}
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <form action={login} className="card" style={{maxWidth:360,margin:"20vh auto"}}>
    <h1 style={{margin:"0 0 16px"}}>RBA Films & Photography</h1>
    <label htmlFor="p">Password</label><input id="p" name="password" type="password" required autoFocus />
    {error && <p className="mute" role="alert">Incorrect password. Try again.</p>}
    <p><button className="btn" style={{width:"100%"}}>Sign in</button></p>
  </form>;
}
