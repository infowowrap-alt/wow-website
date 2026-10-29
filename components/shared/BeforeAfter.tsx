"use client";

import { useId, useState } from "react";
import { Picture } from "@/components/media/Picture";
import type { MediaItem } from "@/lib/media";

type Props = {
  before: MediaItem;
  after: MediaItem;
  sizes: string;
  labels?: [string, string];
  className?: string;
};

// Prima/dopo con la maniglia a spatola. Si trascina, si clicca o si usa la
// tastiera (frecce, Pagina su/giù, Home/Fine): sotto c'è un vero input range.
export function BeforeAfter({ before, after, sizes, labels = ["Prima", "Dopo"], className = "" }: Props) {
  const [pos, setPos] = useState(50);
  const id = useId();
  return (
    <div className={`wow-ba ${className}`} style={{ ["--pos" as string]: `${pos}%`, aspectRatio: `${after.width} / ${after.height}` }}>
      <Picture item={before} sizes={sizes} className="wow-ba__img" />
      <div className="wow-ba__after" aria-hidden="true">
        <Picture item={after} sizes={sizes} className="wow-ba__img" />
      </div>
      <span className="wow-ba__label wow-ba__label--before" aria-hidden="true">{labels[0]}</span>
      <span className="wow-ba__label wow-ba__label--after" aria-hidden="true">{labels[1]}</span>
      <span className="wow-ba__handle" aria-hidden="true">
        <svg viewBox="0 0 40 64" width="40" height="64">
          <path d="M8 6h24l-3 22H11z" fill="currentColor" opacity=".92" />
          <rect x="12" y="28" width="16" height="30" rx="5" fill="currentColor" />
          <path d="M16 36v14M24 36v14" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </span>
      <label htmlFor={id} className="sr-only">
        {labels[0]} e {labels[1]}: sposta per confrontare
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        step={1}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="wow-ba__range"
        aria-valuetext={`${pos}% ${labels[1].toLowerCase()}`}
      />
    </div>
  );
}
