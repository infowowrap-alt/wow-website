"use client";

import { useEffect, useRef, useState } from "react";

// Numero che scorre come un contachilometri quando entra nello schermo
// ("36 ORE", "70 FURGONI"). Il valore finale è sempre nel DOM per screen reader e SEO.
export function RollingNumber({ value, suffix, className = "" }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setGo(true), io.disconnect()), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const digits = String(value).split("");
  return (
    <span ref={ref} className={`wow-odometer ${go ? "is-rolling" : ""} ${className}`}>
      <span className="sr-only">{value}{suffix ? ` ${suffix}` : ""}</span>
      <span aria-hidden="true" className="wow-odometer__digits">
        {digits.map((d, i) => (
          <span key={i} className="wow-odometer__col" style={{ ["--d" as string]: Number(d), ["--i" as string]: i }}>
            <span className="wow-odometer__strip">
              {Array.from({ length: 10 }, (_, n) => <span key={n}>{n}</span>)}
            </span>
          </span>
        ))}
      </span>
      {suffix && <span aria-hidden="true" className="wow-odometer__suffix">{suffix}</span>}
    </span>
  );
}
