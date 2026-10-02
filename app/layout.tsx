import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
const sans = Inter({ subsets: ["latin"], variable: "--sans" });
const serif = Playfair_Display({ subsets: ["latin"], variable: "--serif", style: ["normal", "italic"] });
export const metadata = { title: "RBA CMS", robots: { index: false, follow: false } };
export default function Root({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={`${sans.variable} ${serif.variable}`}><body>{children}</body></html>;
}
