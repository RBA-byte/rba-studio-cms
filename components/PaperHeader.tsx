import { BRAND } from "@/lib/brand";
export default function PaperHeader({ title, meta }: { title: string; meta: [string, string][] }) {
  return <header style={{display:"flex",justifyContent:"space-between",gap:20,flexWrap:"wrap",alignItems:"flex-start",paddingBottom:20,borderBottom:"1px solid #E5E5E5",marginBottom:24}}>
    <div><img src="/logo.png" alt={BRAND.name} style={{height:54,display:"block"}} />
      <p className="mute" style={{margin:"10px 0 0",fontSize:12,lineHeight:1.6}}>{BRAND.tagline}<br/>{BRAND.services}<br/>{BRAND.address}<br/>{BRAND.cell} · {BRAND.email}</p></div>
    <div style={{textAlign:"right"}}><h1 style={{margin:0,fontSize:34}}>{title}</h1>
      {meta.map(([k, v]) => <div key={k} style={{fontSize:13,marginTop:4}}><span className="mute">{k} </span><b>{v}</b></div>)}</div>
  </header>;
}
