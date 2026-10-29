"use client";

import { useEffect, useRef, useState } from "react";
import type { MediaClip } from "@/lib/media";
import { prefersReducedMotion } from "@/lib/motion";

type Props = {
  clip: MediaClip;
  label: string;
  className?: string;
};

// Loop muto dalla pipeline video (WebM VP9 e MP4 H.264, poster AVIF).
// Parte solo quando è visibile e si ferma quando esce dallo schermo.
// Con prefers-reduced-motion resta fermo sul poster.
export function LoopVideo({ clip, label, className }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (prefersReducedMotion()) {
      setStill(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", aspectRatio: `${clip.width} / ${clip.height}`, backgroundImage: `url(${clip.blur})`, backgroundSize: "cover" }}
      poster={`${clip.poster}.avif`}
      muted
      loop
      playsInline
      preload={still ? "none" : "metadata"}
      aria-label={label}
      width={clip.width}
      height={clip.height}
    >
      {clip.sources.map((s) => (
        <source key={s.src} src={s.src} type={s.type} media={s.width <= 720 ? "(max-width: 768px)" : undefined} />
      ))}
    </video>
  );
}
