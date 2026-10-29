import type { ReactNode } from "react";

// Carta siliconata: il retro della pellicola, grigio chiaro con la scritta del
// produttore ripetuta in diagonale. È il "dietro" della transizione tra i mondi.
// La scritta è tipografica (Inter Tight), non il logo: i loghi non si ridisegnano.
export function LinerPaper({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <div className={`wow-liner ${className}`}>{children}</div>;
}
