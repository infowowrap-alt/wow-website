import type { CSSProperties } from "react";
import { type MediaItem, srcSet, fallbackSrc } from "@/lib/media";

type Props = {
  item: MediaItem;
  sizes: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

// <picture> con AVIF e WebP dalla pipeline. Il segnaposto sfocato sta sotto
// l'immagine come sfondo, e il rapporto d'aspetto fisso evita i salti di layout.
export function Picture({ item, sizes, className, imgClassName, priority = false }: Props) {
  const style: CSSProperties = {
    aspectRatio: item.width && item.height ? `${item.width} / ${item.height}` : undefined,
    backgroundImage: item.blur ? `url(${item.blur})` : undefined,
    backgroundSize: "cover",
    backgroundColor: item.color,
  };
  return (
    <picture className={className} style={{ display: "block", ...style }}>
      <source type="image/avif" srcSet={srcSet(item, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(item, "webp")} sizes={sizes} />
      <img
        src={fallbackSrc(item)}
        alt={item.alt ?? ""}
        width={item.width}
        height={item.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={imgClassName}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </picture>
  );
}
