import type { ReactNode } from "react";

// L'etichetta rossa scritta a pennarello dei reel Interior. Solo 1-3 parole.
export function MarkerLabel({ children, tilt = -3, className = "" }: { children: ReactNode; tilt?: number; className?: string }) {
  return (
    <span className={`wow-marker ${className}`} style={{ rotate: `${tilt}deg` }}>
      {children}
    </span>
  );
}
