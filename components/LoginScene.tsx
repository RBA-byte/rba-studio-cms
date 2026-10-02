"use client";
import { useEffect, useRef } from "react";
export default function LoginScene({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current!, blobs = Array.from(el.querySelectorAll<HTMLElement>(".blob"));
    const put = (b: HTMLElement, x: number, y: number) => (b.style.transform = `translate(${x}px,${y}px)`);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (matchMedia("(pointer: coarse)").matches) { // phones: blobs wander randomly
      const drift = () => blobs.forEach(b => put(b, (Math.random() - .5) * innerWidth, (Math.random() - .5) * innerHeight * .8));
      drift(); const t = setInterval(drift, 4500); return () => clearInterval(t);
    }
    const move = (e: PointerEvent) => { // desktop: spotlight + blobs follow the cursor
      el.style.setProperty("--mx", e.clientX + "px"); el.style.setProperty("--my", e.clientY + "px");
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      blobs.forEach((b, i) => put(b, nx * (i + 1) * 180 * (i % 2 ? -1 : 1), ny * (i + 1) * 130));
    };
    addEventListener("pointermove", move); return () => removeEventListener("pointermove", move);
  }, []);
  return <div ref={root} className="scene"><div className="bgimg" /><i className="blob b1" /><i className="blob b2" /><i className="blob b3" />
    <div className="spot" /><div className="grain" /><div className="center">{children}</div></div>;
}
