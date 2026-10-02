import "./globals.css";
import { Instrument_Sans, Newsreader } from "next/font/google";
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--sans" });
const serif = Newsreader({ subsets: ["latin"], variable: "--serif" });
export const metadata = { title: "RBA CMS", robots: { index: false, follow: false } };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${sans.variable} ${serif.variable}`}><body>{children}</body></html>;
}
