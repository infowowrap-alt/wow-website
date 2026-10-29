"use client";

import { useEffect, useRef, useState } from "react";

const PATHS = {
  // Freccia curva verso il basso a destra, come quelle disegnate nei reel.
  curve: { d: "M8 14 C 48 6, 92 22, 104 70", head: "M88 58 L104 72 L110 52", viewBox: "0 0 120 84" },
  // Freccia corta e decisa verso sinistra.
  short: { d: "M112 30 C 82 18, 46 22, 14 40", head: "M30 26 L12 41 L32 52", viewBox: "0 0 120 64" },
} as const;

type Props = { shape?: keyof typeof PATHS; width?: number; className?: string; label?: string };

// Freccia bianca "fatta a mano" che si disegna quando entra nello schermo
// (stroke-dashoffset). Con prefers-reduced-motion compare già disegnata.
export function HandArrow({ shape = "curve", width = 120, className = "", label }: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setDrawn(true), io.disconnect()), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const p = PATHS[shape];
  return (
    <svg
      ref={ref}
      viewBox={p.viewBox}
      width={width}
      className={`wow-arrow ${drawn ? "is-drawn" : ""} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={p.d} pathLength={1} />
      <path d={p.head} pathLength={1} className="wow-arrow__head" />
    </svg>
  );
}
