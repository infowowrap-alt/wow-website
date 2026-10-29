// Loghi ufficiali (brand/logo/, copiati in public/brand/). Mai ridisegnati,
// ricolorati, deformati o filtrati: solo l'immagine originale, proporzioni bloccate,
// con l'area di rispetto data dal padding (circa l'altezza della "O" di WOW).
const LOGOS = {
  wow: { src: "/brand/logo-wow.png", width: 760, height: 365, alt: "WOW – L'Artigiano delle Pellicole" },
  interior: { src: "/brand/logo-interior.png", width: 760, height: 471, alt: "WOW Interior Design" },
  garage: { src: "/brand/logo-bsg.png", width: 760, height: 399, alt: "WOW Big Sun Garage" },
} as const;

type Props = {
  variant: keyof typeof LOGOS;
  /** Larghezza visualizzata in px; l'altezza segue le proporzioni. */
  width: number;
  className?: string;
  priority?: boolean;
};

export function Logo({ variant, width, className, priority = false }: Props) {
  const logo = LOGOS[variant];
  return (
    <img
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
      // Se la classe dà già una larghezza (anche responsive, es. "w-[88px] sm:w-[150px]") vince quella.
      style={{ width: /(^|\s)w-/.test(className ?? "") ? undefined : width, height: "auto", maxWidth: "100%" }}
    />
  );
}

/** Spazio riservato a un logo che Paolo deve ancora mandare. */
export function LogoSlot({ label, width, height }: { label: string; width: number; height: number }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="grid place-items-center border border-dashed border-line text-center type-small text-muted"
      style={{ width, height, maxWidth: "100%" }}
    >
      <span className="px-3">{label}</span>
    </div>
  );
}
