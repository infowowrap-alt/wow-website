import Link from "next/link";
import type { World } from "@/lib/contact";
import { Logo } from "@/components/ui/Logo";
import { PeelCorner } from "@/components/shared/PeelCorner";

// Header minimo di un mondo: logo del mondo (torna alla home), interruttore di
// mondo a lembo di pellicola nell'angolo in alto a destra.
export function WorldHeader({ world }: { world: World }) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex items-start justify-between">
      <Link href="/" className="pointer-events-auto m-4 block sm:m-6" aria-label="WOW, torna alla home">
        <Logo variant={world === "interior" ? "interior" : "garage"} width={world === "interior" ? 112 : 132} priority />
      </Link>
      <PeelCorner world={world} className="pointer-events-auto" />
    </header>
  );
}
