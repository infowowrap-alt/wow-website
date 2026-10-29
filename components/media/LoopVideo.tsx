import type { MediaClip } from "@/lib/media";

type Props = {
  clip: MediaClip;
  label: string;
  className?: string;
};

// Loop muto dalla pipeline video: WebM VP9 e MP4 H.264, poster AVIF come
// immagine iniziale. Versione base per il catalogo: la pausa con
// prefers-reduced-motion e l'avvio solo quando è visibile arrivano con il
// design system (Fase 2).
export function LoopVideo({ clip, label, className }: Props) {
  return (
    <video
      className={className}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", aspectRatio: `${clip.width} / ${clip.height}`, backgroundImage: `url(${clip.blur})`, backgroundSize: "cover" }}
      poster={`${clip.poster}.avif`}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
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
