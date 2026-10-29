import { getMedia } from "@/lib/media";
import { CONTACT, WHATSAPP_MESSAGES, whatsappLink } from "@/lib/contact";
import { Picture } from "@/components/media/Picture";
import { BeforeAfter } from "@/components/shared/BeforeAfter";
import { MarkerLabel } from "@/components/interior/MarkerLabel";
import { WhatsAppButton, WhatsAppIcon } from "@/components/ui/WhatsAppButton";
import { Logo } from "@/components/ui/Logo";
import { TodoPaolo } from "@/components/ui/TodoPaolo";

const MAPS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("WOW Via Podgora 23 72100 Brindisi")}`;

/** Prima/dopo del Panificio Marangio, stessa inquadratura. Mondo Interior. */
export function MarangioBeforeAfter() {
  return (
    <section data-world="interior" className="bg-bg px-4 py-24 text-text sm:px-10 lg:px-16 lg:py-32" aria-labelledby="marangio-title">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <div className="grid gap-6">
          <p className="type-eyebrow text-accent">Panificio Marangio · Brindisi</p>
          <h2 id="marangio-title" className="type-display text-heading">
            Stessi scaffali.
            <br />
            Un altro forno.
          </h2>
          <p className="type-lead max-w-lg">
            Uno dei forni storici di Brindisi: il banco vendita passa dall&apos;effetto legno allo stucco bianco e grigio. Nessun mobile sostituito, nessuna
            demolizione.
          </p>
          <p className="w-fit pt-2">
            <MarkerLabel>Non è magia, è WOW.</MarkerLabel>
          </p>
          <div>
            <WhatsAppButton world="interior" label="Mandaci una foto del tuo negozio" />
          </div>
        </div>
        <BeforeAfter
          before={getMedia("interior-marangio-prima-scaffali")}
          after={getMedia("interior-marangio-dopo-scaffali")}
          sizes="(min-width: 1024px) 26rem, 92vw"
          className="mx-auto w-full max-w-[26rem] shadow-[0_30px_60px_-30px_rgb(13_27_42/0.45)]"
        />
      </div>
    </section>
  );
}

/** Paolo: progetta e applica. */
export function Paolo() {
  return (
    <section className="bg-interior-ink px-4 py-24 text-white sm:px-10 lg:px-16 lg:py-32" aria-labelledby="paolo-title">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,28rem)_1fr]">
        <figure className="relative">
          <Picture item={getMedia("officina-lucidatura-chevron")} sizes="(min-width: 1024px) 28rem, 92vw" className="overflow-hidden" />
          <figcaption className="mt-3 type-small text-white/60">Paolo in officina, sotto i LED a chevron.</figcaption>
        </figure>
        <div className="grid gap-6">
          <p className="type-eyebrow text-white/60">Chi c&apos;è dietro</p>
          <h2 id="paolo-title" className="text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-[850] tracking-[-0.04em]">
            Paolo Solazzo.
            <br />
            <span className="text-white/50">Disegna. Taglia. Applica.</span>
          </h2>
          <p className="type-lead max-w-xl text-white/85">
            Grafico e applicatore: la grafica che vedi l&apos;ha progettata lui, e la stessa mano la mette sul pezzo. Dalla vetrina di un forno storico alla
            livrea per gli stuntman.
          </p>
          <blockquote className="max-w-xl border-l-4 border-white/30 pl-5 font-[family-name:var(--font-cinematic)] text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight">
            “Il wrapping è come avere un filtro di Instagram permanente.”
            <footer className="mt-2 font-[var(--font-sans-stack)] type-small text-white/60">dalla maglietta di Paolo</footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

/** Dove siamo: mappa disegnata (niente mappe di terzi incorporate) e link esterno. */
export function Brindisi() {
  return (
    <section className="wow-liner px-4 py-24 sm:px-10 lg:px-16 lg:py-32" aria-labelledby="dove-title">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <div className="grid gap-5">
          <p className="type-eyebrow text-interior-ink/60">Dove siamo</p>
          <h2 id="dove-title" className="text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-[850] tracking-[-0.04em] text-interior-ink">
            Via Podgora 23,
            <br />
            Brindisi.
          </h2>
          <p className="type-lead max-w-md text-interior-ink/80">L&apos;officina è qui. Per Interior veniamo noi da te: casa, negozio, ufficio, fiera.</p>
          <dl className="grid gap-2 type-body text-interior-ink">
            <div className="flex flex-wrap gap-x-3">
              <dt className="font-semibold">Orari</dt>
              <dd>
                <TodoPaolo>orari di apertura</TodoPaolo>
              </dd>
            </div>
            <div className="flex flex-wrap gap-x-3">
              <dt className="font-semibold">Telefono e WhatsApp</dt>
              <dd>
                <a className="underline underline-offset-4" href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}>
                  {CONTACT.phone}
                </a>
              </dd>
            </div>
          </dl>
          <p>
            <a href={MAPS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-b-2 border-interior-ink pb-1 font-semibold text-interior-ink">
              Apri in Maps <span aria-hidden="true">↗</span>
            </a>
          </p>
        </div>
        <BrindisiMap />
      </div>
    </section>
  );
}

// Mappa schematica: non una mappa stradale (niente vie inventate), ma un
// bersaglio con il pin, la rosa dei venti e il mare a nord-est, come una tavola da officina.
function BrindisiMap() {
  return (
    <figure className="relative mx-auto w-full max-w-md">
      <svg viewBox="0 0 400 400" className="w-full" role="img" aria-label="WOW si trova in Via Podgora 23 a Brindisi, in Puglia, sul mare Adriatico.">
        <defs>
          <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#c9c5bf" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="400" fill="url(#map-grid)" />
        <path d="M250 0 C 270 70, 330 120, 400 140 L400 0Z" fill="#0d1b2a" opacity="0.08" />
        <text x="388" y="40" textAnchor="end" fontSize="13" fontWeight="700" letterSpacing="3" fill="#0d1b2a" opacity="0.55">
          MARE ADRIATICO
        </text>
        {[150, 110, 70, 34].map((r, i) => (
          <circle key={r} cx="200" cy="215" r={r} fill="none" stroke="#0d1b2a" strokeOpacity={0.12 + i * 0.08} strokeWidth="1.5" strokeDasharray={i % 2 ? "4 6" : undefined} />
        ))}
        <g transform="translate(58 330)" fill="#0d1b2a">
          <path d="M0 -26 L6 0 L0 -6 L-6 0Z" />
          <text y="-32" textAnchor="middle" fontSize="12" fontWeight="800">N</text>
        </g>
        <g transform="translate(200 215)">
          <circle r="10" fill="#c01818" />
          <circle r="22" fill="none" stroke="#c01818" strokeWidth="2" opacity="0.5" />
          <path d="M0 -10 L0 -60" stroke="#0d1b2a" strokeWidth="2" />
          <rect x="-80" y="-92" width="160" height="32" fill="#0d1b2a" />
          <text y="-71" textAnchor="middle" fontSize="13" fontWeight="800" letterSpacing="1.5" fill="#fff">
            VIA PODGORA 23
          </text>
        </g>
        <text x="200" y="300" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="2.5" fill="#0d1b2a" opacity="0.6">
          BRINDISI · 72100
        </text>
      </svg>
    </figure>
  );
}

/** La chiusa: due bottoni WhatsApp, uno per mondo, ognuno col suo messaggio. */
export function FinalCta() {
  return (
    <section className="wow-final relative isolate overflow-hidden" aria-labelledby="cta-title">
      <div className="wow-final__interior" data-world="interior" />
      <div className="wow-final__garage" data-world="garage" />
      <div className="relative mx-auto grid min-h-[80svh] max-w-6xl content-center gap-10 px-4 py-24 sm:px-10">
        <h2 id="cta-title" className="max-w-4xl text-[clamp(2.5rem,6.5vw,6rem)] leading-[0.92] font-[850] tracking-[-0.045em] text-white mix-blend-difference">
          Mandaci una foto.
          <br />
          Ti diciamo cosa si può fare.
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <div data-world="interior" className="grid gap-3 bg-bg p-6 text-text shadow-xl">
            <Logo variant="interior" width={120} />
            <p className="type-body">Porte, infissi, cucine, mobili, vetrine, vetri.</p>
            <WhatsAppButton world="interior" label="Scrivici per la casa o il negozio" />
          </div>
          <div data-world="garage" className="grid gap-3 bg-bg p-6 text-text shadow-xl">
            <Logo variant="garage" width={130} />
            <p className="type-body">Auto, moto, barche, flotte, oscuramento vetri.</p>
            <WhatsAppButton world="garage" label="Scrivici per il tuo mezzo" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#0b0b0d] px-4 py-14 text-white/75 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[auto_1fr_auto] sm:items-start">
        <Logo variant="wow" width={110} />
        <address className="grid gap-1 type-small not-italic">
          <span className="font-semibold text-white">{CONTACT.company}</span>
          <span>{CONTACT.address}</span>
          <span>P.IVA {CONTACT.vat}</span>
          <a className="hover:text-white" href={`mailto:${CONTACT.email}`}>
            {CONTACT.email}
          </a>
        </address>
        <nav className="grid gap-2 type-small" aria-label="Social e contatti">
          <a className="inline-flex items-center gap-2 hover:text-white" href={whatsappLink(WHATSAPP_MESSAGES.home)} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon size={16} /> WhatsApp {CONTACT.phone}
          </a>
          <a className="hover:text-white" href={CONTACT.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a className="hover:text-white" href={CONTACT.tiktok} target="_blank" rel="noopener noreferrer">
            TikTok
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-10 max-w-6xl type-small text-white/45">
        Modello 3D dell&apos;auto: “Car Concept” di Eric Chadwick (Darmstadt Graphics Group), basato su un modello di Unity Fan, licenza CC BY 4.0, loghi rimossi.
      </p>
    </footer>
  );
}
