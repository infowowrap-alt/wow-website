import type { ReactNode } from "react";

// Etichetta da HUD di videogioco: font tecnico, angoli a staffa, giallo fluo.
export function HudTag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`wow-hud ${className}`}>{children}</span>;
}

/** Riga di specifica "chiave · valore" per le schede dei Garage files. */
export function HudSpec({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="wow-hud-spec">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
