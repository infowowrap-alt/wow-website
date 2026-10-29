import type { Metadata } from "next";
import { getMedia } from "@/lib/media";
import { Picture } from "@/components/media/Picture";
import { WorldHeader } from "@/components/site/WorldHeader";
import { WhatsAppButton, WhatsAppFloating } from "@/components/ui/WhatsAppButton";
import { MarkerLabel } from "@/components/interior/MarkerLabel";

export const metadata: Metadata = {
  title: "Interior Design",
  description: "Rivestimento di infissi, porte, cucine, mobili, vetrine e pellicole per vetri a Brindisi. Rinnovare senza sostituire.",
};

// Landing Interior, prima stesura: la versione completa (hero 3D con la spatola,
// campionario a ventaglio, sfide a tempo) è la Fase 4.
export default function InteriorPage() {
  const dopo = getMedia("interior-porta-dopo");
  return (
    <div data-world="interior" className="min-h-svh bg-bg text-text">
      <WorldHeader world="interior" />
      <main className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-32 pb-20 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pt-40">
        <div className="grid gap-6">
          <p className="type-eyebrow text-accent">WOW Interior Design · Brindisi</p>
          <h1 className="type-display-xl text-heading">Stesso infisso. Pelle nuova.</h1>
          <p className="type-lead max-w-xl">
            Porte, infissi, cucine, mobili, vetrine. Li rivestiamo con pellicole architettoniche: niente demolizioni, niente polvere, tempi brevi.
          </p>
          <div>
            <WhatsAppButton world="interior" label="Mandaci una foto della tua porta" />
          </div>
        </div>
        {dopo && (
          <figure className="relative">
            <Picture item={dopo} sizes="(min-width: 1024px) 45vw, 100vw" priority className="max-h-[78svh] overflow-hidden" />
            <MarkerLabel className="absolute top-6 left-6">Dopo</MarkerLabel>
          </figure>
        )}
      </main>
      <WhatsAppFloating world="interior" />
    </div>
  );
}
