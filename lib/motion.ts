// Regole di movimento dei due mondi (docs/SPEC-SITO.md §10), per GSAP.
// Gli stessi valori esistono come variabili CSS in app/globals.css
// (--dur-fast, --dur, --dur-slow, --ease-out, --ease-in-out).
import type { World } from "./contact";

export const MOTION: Record<World, {
  duration: { fast: number; base: number; slow: number };
  ease: { out: string; inOut: string; flicker?: string };
  stagger: number;
  text: string;
}> = {
  interior: {
    duration: { fast: 0.6, base: 0.8, slow: 1.0 },
    ease: { out: "expo.out", inOut: "power3.inOut" },
    stagger: 0.12,
    text: "Righe che salgono una alla volta, parallasse lenta, maschere a spatola, frecce che si disegnano.",
  },
  garage: {
    duration: { fast: 0.25, base: 0.38, slow: 0.5 },
    ease: { out: "power4.out", inOut: "expo.inOut", flicker: "steps(4)" },
    stagger: 0.06,
    text: "Parole che entrano a scatto, sfarfallio dei LED, RGB split breve, numeri che scorrono come un contachilometri.",
  },
};

/** Vero se l'utente ha chiesto meno movimento: niente parallasse né effetti continui. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
