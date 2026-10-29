"use client";

import type { World } from "@/lib/contact";
import { WorldLink } from "@/components/transition/WorldLink";

const OTHER: Record<World, { world: World; href: string; label: string }> = {
  interior: { world: "garage", href: "/garage/", label: "Passa a Big Sun Garage" },
  garage: { world: "interior", href: "/interior/", label: "Passa a Interior Design" },
};

// L'interruttore di mondo: un angolo di pellicola sollevato. Sotto si vede il
// colore dell'altro mondo, il lembo mostra il retro siliconato. Al passaggio del
// mouse (o con il focus) si solleva di più; al clic parte la pellicola.
export function PeelCorner({ world, className = "", href }: { world: World; className?: string; href?: string }) {
  const to = OTHER[world];
  return (
    <WorldLink world={to.world} href={href ?? to.href} className={`wow-peel wow-peel--to-${to.world} ${className}`} aria-label={to.label}>
      <span className="wow-peel__under" aria-hidden="true" />
      <span className="wow-peel__flap" aria-hidden="true" />
      <span className="wow-peel__hint" aria-hidden="true">{world === "interior" ? "Garage" : "Interior"}</span>
    </WorldLink>
  );
}
