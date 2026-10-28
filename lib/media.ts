import catalog from "@/content/media.json";

export type World = "interior" | "garage" | "officina" | "campionario" | "eventi";
export type Phase = "prima" | "durante" | "dopo" | "dettaglio" | "ambiente" | "persone";

export type MediaClip = {
  id: string;
  start: number;
  duration: number;
  width: number;
  height: number;
  poster: string;
  blur: string;
  sources: { src: string; type: string; width: number }[];
};

export type MediaItem = {
  id: string;
  world: World;
  project: string;
  kind: "image" | "video";
  source: "instagram" | "originale";
  post?: string | null;
  phase: Phase | null;
  alt: string | null;
  credits?: string | null;
  people: "nessuno" | "staff" | "cliente" | "cliente-ok" | "da-confermare";
  overlay?: boolean;
  quality?: "bassa" | "media" | "alta";
  score?: number | null;
  uses?: string[];
  note?: string;
  derivedNote?: string;
  export?: boolean;
  review?: boolean;
  ai: boolean;
  ai_note?: string;
  width?: number;
  height?: number;
  aspect?: number;
  orientation?: "orizzontale" | "verticale" | "quadrata";
  color?: string;
  blur?: string;
  variants?: number[];
  clips?: MediaClip[];
};

export const media = (catalog as { items: MediaItem[] }).items;

export function getMedia(id: string): MediaItem {
  const item = media.find((m) => m.id === id);
  if (!item) throw new Error(`Media non trovato: ${id}`);
  return item;
}

export function srcSet(item: MediaItem, format: "avif" | "webp"): string {
  return (item.variants ?? []).map((w) => `/media/${item.id}/${w}.${format} ${w}w`).join(", ");
}

export function fallbackSrc(item: MediaItem): string {
  const variants = item.variants ?? [];
  const w = variants.find((v) => v >= 1280) ?? variants.at(-1);
  return `/media/${item.id}/${w}.webp`;
}
