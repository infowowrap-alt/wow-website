import catalog from "@/content/media.json";
import type { MediaItem } from "./media-types";

export * from "./media-types";

export const media = (catalog as { items: MediaItem[] }).items;

export function getMedia(id: string): MediaItem {
  const item = media.find((m) => m.id === id);
  if (!item) throw new Error(`Media non trovato: ${id}`);
  return item;
}
