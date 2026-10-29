import type { Metadata } from "next";
import { getMedia } from "@/lib/media";
import { Picture } from "@/components/media/Picture";
import { WorldHeader } from "@/components/site/WorldHeader";
import { WhatsAppButton, WhatsAppFloating } from "@/components/ui/WhatsAppButton";
import { HudTag } from "@/components/garage/HudTag";

export const metadata: Metadata = {
  title: "Big Sun Garage",
  description: "Wrapping auto, moto, barche e flotte, livree custom e oscuramento vetri a norma a Brindisi. Questa non è vernice. È wrapping.",
};

// Landing Garage, prima stesura: la versione completa (officina 3D che si
// accende, Garage files, 70 furgoni) è la Fase 4.
export default function GaragePage() {
  const car = getMedia("garage-bmw-e92-fiancata-raduno");
  return (
    <div data-world="garage" className="min-h-svh bg-bg text-text">
      <WorldHeader world="garage" />
      <main className="relative isolate min-h-svh overflow-hidden">
        <Picture item={car} sizes="100vw" priority className="absolute inset-0 -z-10 h-full w-full opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-bg/60 to-bg/10" />
        <div className="mx-auto grid min-h-svh max-w-7xl content-end gap-6 px-4 pt-32 pb-20 sm:px-8">
          <HudTag>Big Sun Garage · Brindisi</HudTag>
          <h1 className="type-display-xl text-heading">Paint is dead.</h1>
          <p className="type-lead max-w-xl">Auto, moto, barche, flotte. Wrap, livree custom, oscuramento vetri. Questa non è vernice. È wrapping.</p>
          <div>
            <WhatsAppButton world="garage" label="Mandaci una foto del mezzo" />
          </div>
        </div>
      </main>
      <WhatsAppFloating world="garage" />
    </div>
  );
}
