import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { Manifesto } from "@/components/home/Manifesto";
import { WorksGallery, type WorkCard } from "@/components/home/WorksGallery";
import { FEATURED } from "@/content/home";
import { getMedia } from "@/lib/media";
import { Preloader } from "@/components/home/Preloader";
import { Brindisi, FinalCta, MarangioBeforeAfter, Paolo, SiteFooter } from "@/components/home/HomeSections";
import { Logo } from "@/components/ui/Logo";
import { WhatsAppFloating } from "@/components/ui/WhatsAppButton";

// La home: scegli il mondo (hero tagliata a 45°), il manifesto, i lavori veri,
// un prima/dopo, chi c'è dietro, dove siamo e la chiusa su WhatsApp.
export default function Home() {
  // Le foto si scelgono qui, lato server: nel JavaScript del browser finiscono
  // solo quelle che servono, non tutto il catalogo.
  const works: WorkCard[] = FEATURED.map((w) => {
    const video = w.video ? getMedia(w.video) : undefined;
    return { ...w, img: getMedia(w.image), clip: video?.clips?.[0], clipLabel: video?.alt ?? undefined };
  });
  return (
    <>
      <Preloader />
      <header className="pointer-events-none absolute inset-x-0 top-0 z-40 flex items-start justify-between p-4 sm:p-6">
        <Link href="/" className="pointer-events-auto block" aria-label="WOW, home">
          <Logo variant="wow" width={104} className="w-[84px] sm:w-[104px]" priority />
        </Link>
      </header>
      <main>
        <Hero interior={getMedia("interior-cucina-avorio-dopo")} garage={getMedia("garage-bmw-e92-fiancata-raduno")} />
        <Manifesto />
        <WorksGallery works={works} />
        <MarangioBeforeAfter />
        <Paolo />
        <Brindisi />
        <FinalCta />
      </main>
      <SiteFooter />
      <WhatsAppFloating world="home" />
    </>
  );
}
