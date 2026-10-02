import LoginScene from "@/components/LoginScene";
import { login } from "@/app/actions";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <LoginScene><form action={login} className="glass reveal">
    <small className="eyebrow">RBA Films and Photography</small>
    <h1 style={{margin:"6px 0 22px"}}>Welcome <em>back</em></h1>
    <label htmlFor="e">Email</label><input id="e" name="email" type="email" required autoFocus autoComplete="username" />
    <label htmlFor="p" style={{marginTop:12}}>Password</label><input id="p" name="password" type="password" required autoComplete="current-password" />
{error && <p className="mute" role="alert">{error}</p>} 
    <p><button className="btn" style={{width:"100%"}}>Enter</button></p>
  </form></LoginScene>;
}
