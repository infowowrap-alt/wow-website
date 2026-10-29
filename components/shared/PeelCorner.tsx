import type { World } from "@/lib/contact";

const OTHER: Record<World, { href: string; label: string }> = {
  interior: { href: "/garage/", label: "Passa a Big Sun Garage" },
  garage: { href: "/interior/", label: "Passa a Interior Design" },
};

// L'interruttore di mondo: un angolo di pellicola sollevato. Sotto si vede il
// colore dell'altro mondo, il lembo mostra il retro siliconato. Al passaggio del
// mouse (o con il focus) si solleva di più. La transizione WebGL arriva nella Fase 3:
// qui è il gesto e il link, già accessibile da tastiera.
export function PeelCorner({ world, className = "", href }: { world: World; className?: string; href?: string }) {
  const to = OTHER[world];
  return (
    <a href={href ?? to.href} className={`wow-peel wow-peel--to-${world === "interior" ? "garage" : "interior"} ${className}`} aria-label={to.label}>
      <span className="wow-peel__under" aria-hidden="true" />
      <span className="wow-peel__flap" aria-hidden="true" />
      <span className="wow-peel__hint" aria-hidden="true">{world === "interior" ? "Garage" : "Interior"}</span>
    </a>
  );
}
