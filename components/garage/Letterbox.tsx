import type { ReactNode } from "react";

// Il reveal cinematografico degli edit di Paolo: formato 2.39:1, bande nere,
// una parola in serif maiuscolo bianco.
export function Letterbox({ word, children, className = "" }: { word: string; children?: ReactNode; className?: string }) {
  return (
    <figure className={`wow-letterbox ${className}`}>
      <div className="wow-letterbox__frame">
        {children}
        <figcaption className="wow-letterbox__word">{word}</figcaption>
      </div>
    </figure>
  );
}
