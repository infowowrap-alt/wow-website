// Stato condiviso tra la hero (DOM) e il canvas: niente React a ogni frame,
// solo un oggetto che il DOM scrive e il render loop legge.
//
// Geometria in px CSS, y verso il basso. Il taglio è la retta x − y = cut:
// Interior sta in basso a sinistra (x − y < cut), il Garage in alto a destra.
// La pellicola Interior sta sopra; il suo angolo acuto (K) si può sollevare:
// `fold` è quanto è ripiegato, lungo la bisettrice `u` dell'angolo.
export type HeroState = {
  w: number;
  h: number;
  cut: number;
  K: [number, number];
  u: [number, number];
  fold: number;
  /** -1 sopra Interior, 1 sopra Garage, 0 nessuno (in modo continuo). */
  lean: number;
  /** Puntatore normalizzato -1..1, per la parallasse delle camere. */
  px: number;
  py: number;
  visible: boolean;
  /** Schermo più alto che largo: le camere si allontanano. */
  narrow: boolean;
};

export function createHeroState(): HeroState {
  return { w: 1, h: 1, cut: 0, K: [0, 0], u: [0, -1], fold: 0, lean: 0, px: 0, py: 0, visible: true, narrow: false };
}

/** Angolo acuto della pellicola Interior sul bordo dello schermo e bisettrice. */
export function cornerOf(cut: number, w: number, h: number): { K: [number, number]; u: [number, number] } {
  const s = Math.SQRT1_2;
  const xb = cut + h;
  if (xb >= 0 && xb <= w) {
    // Sul bordo in basso: i lati sono il bordo (verso sinistra) e il taglio (verso l'alto a sinistra).
    const ux = -1 - s, uy = -s;
    const l = Math.hypot(ux, uy);
    return { K: [xb, h], u: [ux / l, uy / l] };
  }
  // Sul bordo sinistro: i lati sono il bordo (verso il basso) e il taglio (verso il basso a destra).
  const y = Math.min(h, Math.max(0, -cut));
  const ux = s, uy = 1 + s;
  const l = Math.hypot(ux, uy);
  return { K: [0, y], u: [ux / l, uy / l] };
}
