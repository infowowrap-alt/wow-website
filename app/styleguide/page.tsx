import type { Metadata } from "next";
import Link from "next/link";
import { getMedia } from "@/lib/media";
import { contrast, wcag } from "@/lib/contrast";
import { MOTION } from "@/lib/motion";
import { Logo, LogoSlot } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { WhatsAppButton, WhatsAppIcon } from "@/components/ui/WhatsAppButton";
import { MarkerLabel } from "@/components/interior/MarkerLabel";
import { HandArrow } from "@/components/interior/HandArrow";
import { HudTag, HudSpec } from "@/components/garage/HudTag";
import { RollingNumber } from "@/components/garage/RollingNumber";
import { Letterbox } from "@/components/garage/Letterbox";
import { ChevronLeds } from "@/components/garage/ChevronLeds";
import { PeelCorner } from "@/components/shared/PeelCorner";
import { LinerPaper } from "@/components/shared/LinerPaper";
import { BeforeAfter } from "@/components/shared/BeforeAfter";
import { Picture } from "@/components/media/Picture";
import { LoopVideo } from "@/components/media/LoopVideo";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

type Swatch = { name: string; hex: string; role: string; source: string };

const INTERIOR: { bg: string; text: string; swatches: Swatch[] } = {
  bg: "#f5f2ec",
  text: "#0d1b2a",
  swatches: [
    { name: "Blu WOW", hex: "#044b94", role: "Titoli, superfici", source: "brand book" },
    { name: "Rosso WOW", hex: "#c01818", role: "Solo accenti: CTA, etichette, numeri", source: "brand book" },
    { name: "Carta", hex: "#f5f2ec", role: "Fondo", source: "proposta" },
    { name: "Bianco", hex: "#ffffff", role: "Superfici, card", source: "brand book" },
    { name: "Inchiostro", hex: "#0d1b2a", role: "Testo", source: "proposta" },
    { name: "Pietra", hex: "#d9d4cb", role: "Linee, divisori", source: "proposta" },
  ],
};

const GARAGE: { bg: string; text: string; swatches: Swatch[] } = {
  bg: "#21152d",
  text: "#f4f2f7",
  swatches: [
    { name: "Viola notte", hex: "#21152d", role: "Fondo", source: "da confermare" },
    { name: "Giallo fluo", hex: "#e5ff00", role: "Colpo: CTA, numeri, HUD", source: "da confermare" },
    { name: "Viola elettrico", hex: "#7c0ed7", role: "Solo glow e luci, mai testo", source: "da confermare" },
    { name: "Grafite", hex: "#38343e", role: "Pannelli del configuratore", source: "da confermare" },
    { name: "Nero", hex: "#111111", role: "Testo sui bottoni fluo", source: "da confermare" },
    { name: "Rosa logo", hex: "#fd66ae", role: "Richiamo al lettering, con parsimonia", source: "dal logo" },
  ],
};

function Swatches({ data }: { data: typeof INTERIOR }) {
  return (
    <ul className="grid grid-cols-2 gap-px bg-line sm:grid-cols-3">
      {data.swatches.map((s) => {
        const onBg = contrast(s.hex, data.bg);
        const asText = contrast(data.text, s.hex);
        return (
          <li key={s.hex} className="grid content-start gap-1 bg-bg p-4">
            <span className="relative mb-3 block h-20 border border-line" style={{ background: s.hex }} aria-hidden="true">
              <span className="absolute top-0 right-0 size-5 bg-liner [clip-path:polygon(0_0,0_100%,100%_100%)]" />
            </span>
            <span className="type-small font-semibold text-text">{s.name}</span>
            <span className="font-mono text-xs text-muted">
              {s.hex.toUpperCase()} · {s.source}
            </span>
            <span className="type-small text-muted">{s.role}</span>
            <span className="font-mono text-[11px] text-muted">
              sul fondo {onBg.toFixed(1)}:1 ({wcag(onBg)}) · testo sopra {asText.toFixed(1)}:1
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function Specimen({ world }: { world: "interior" | "garage" }) {
  const t = world === "interior"
    ? { xl: "Stesso infisso.", d: "Pelle nuova.", h2: "Rinnovare senza sostituire", lead: "Niente demolizioni, niente polvere. La porta resta la tua, cambia solo la superficie." }
    : { xl: "Paint is dead.", d: "È wrapping.", h2: "Garage files", lead: "Si applica, protegge la vernice, si toglie. Il colore lo scegli tu, non il catalogo della casa." };
  return (
    <div className="grid gap-6">
      <p className="type-display-xl text-heading">{t.xl}</p>
      <p className="type-display text-heading">
        {world === "interior" ? <em className="not-italic text-accent">{t.d}</em> : <span className="text-accent">{t.d}</span>}
      </p>
      <p className="type-h2 text-heading">{t.h2}</p>
      <p className="type-h3">Titolo di sezione in Inter Tight</p>
      <p className="type-lead max-w-[38ch] text-text">{t.lead}</p>
      <p className="type-body max-w-[62ch] text-muted">
        Testo corrente in Inter Tight, 17 px, interlinea 1,6. È lo stesso nei due mondi: tiene insieme il brand madre mentre i titoli cambiano carattere.
      </p>
      <p className="type-ui text-xl text-accent">{world === "interior" ? "Fatto a mano" : "LVL 03 · WRAP SATIN"}</p>
    </div>
  );
}

function ChapterHead({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <header className="grid gap-4">
      <p className="type-eyebrow text-accent">{eyebrow}</p>
      <h2 className="type-display text-heading">{title}</h2>
      <p className="type-lead max-w-[48ch] text-muted">{intro}</p>
    </header>
  );
}

function Block({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5 border-t border-line pt-6">
      <div className="grid gap-1">
        <h3 className="type-h3 text-heading">{title}</h3>
        {note && <p className="type-small max-w-[60ch] text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  const camPrima = getMedia("interior-cameretta-prima");
  const camDopo = getMedia("interior-cameretta-dopo");
  const porta = getMedia("interior-porta-dopo");
  const ktm = getMedia("garage-ktm-790-scogli");
  const pista = getMedia("garage-bmw-e92-video-pista");
  const flottePrima = getMedia("garage-flotte-van-prima");
  const flotteDopo = getMedia("garage-flotte-van-dopo");

  return (
    <main className="overflow-x-clip">
      {/* Apertura sulla carta siliconata: il retro comune ai due mondi */}
      <LinerPaper className="px-[max(16px,env(safe-area-inset-left))] py-16 sm:py-24">
        <div className="mx-auto grid max-w-[1320px] gap-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <p className="type-eyebrow text-interior-red">Styleguide · solo sviluppo</p>
            <Link href="/styleguide/media/" className="type-small font-semibold text-interior-blue underline underline-offset-4">
              Catalogo media →
            </Link>
          </div>
          <h1 className="font-[Fraunces] text-[clamp(3rem,9vw,8.5rem)] leading-[0.92] font-[560] tracking-[-0.03em] text-interior-ink [font-variation-settings:'SOFT'_60,'WONK'_1]">
            Un brand,
            <br />
            due pelli.
          </h1>
          <p className="type-lead max-w-[54ch] text-interior-ink">
            Ogni elemento del sito vive in uno dei due mondi. I componenti leggono solo i ruoli (fondo, testo, titolo, accento, CTA): basta cambiare
            <code className="mx-1 font-mono text-[0.85em]">data-world</code>e la pagina cambia pelle. Questo grigio a scritte è la carta siliconata, il retro della
            pellicola: è quello che si vede quando un mondo si stacca dall&apos;altro.
          </p>
          <div className="flex flex-wrap items-end gap-8">
            <Logo variant="wow" width={180} />
            <Logo variant="interior" width={170} />
            <div className="bg-garage-night p-4">
              <Logo variant="garage" width={190} />
            </div>
            <LogoSlot label="Logo WOW viola (Garage): in arrivo da Paolo" width={190} height={92} />
          </div>
        </div>
      </LinerPaper>

      {/* ── Interior ───────────────────────────────────────────────────── */}
      <div id="interior" data-world="interior" className="bg-bg text-text">
        <div className="mx-auto grid max-w-[1320px] gap-14 px-[max(16px,env(safe-area-inset-left))] py-20 sm:py-28">
          <div className="flex items-start justify-between gap-6">
            <ChapterHead
              eyebrow="WOW Interior Design · il giorno"
              title="Carta, materia, un colpo di rosso."
              intro="Rivista d'interni con le mani sporche di colla. Tanta carta, foto grandi e luminose, blu per i titoli, il rosso solo dove serve indicare qualcosa."
            />
            <PeelCorner world="interior" href="#garage" className="hidden shrink-0 sm:block" />
          </div>

          <Block title="Colori" note="Il contrasto è calcolato sul fondo carta e con il testo inchiostro sopra al colore. Il rosso regge il testo bianco (6,2:1).">
            <Swatches data={INTERIOR} />
          </Block>

          <Block title="Tipografia" note="Fraunces (assi SOFT e WONK) per i titoli, Inter Tight per il testo, Permanent Marker solo per etichette di 1-3 parole.">
            <Specimen world="interior" />
          </Block>

          <Block title="Etichette e frecce a mano" note="Il linguaggio dei reel Interior: etichetta rossa a pennarello e freccia bianca che indica la parte rivestita. La freccia si disegna quando entra nello schermo.">
            <div className="relative max-w-[560px]">
              <Picture item={porta} sizes="(min-width: 640px) 560px, 100vw" />
              <div className="absolute top-[18%] left-[6%] flex items-start gap-1">
                <MarkerLabel>Effetto pietra</MarkerLabel>
                <HandArrow width={110} className="mt-6" />
              </div>
              <div className="absolute bottom-[8%] left-[8%]">
                <MarkerLabel tilt={2}>Stessa porta</MarkerLabel>
              </div>
            </div>
          </Block>

          <Block title="Prima / dopo con la spatola" note="Si trascina la spatola o si usano le frecce della tastiera. Stessa inquadratura quando c'è: qui la cameretta, da verde acido a bianco.">
            <BeforeAfter before={camPrima} after={camDopo} sizes="(min-width: 1024px) 760px, 100vw" className="max-w-[760px]" />
          </Block>

          <Block title="Bottoni" note="La CTA principale è sempre WhatsApp. Mai «Richiedi preventivo».">
            <div className="flex flex-wrap items-center gap-4">
              <WhatsAppButton world="interior" label="Mandaci una foto della tua cucina" />
              <Button href="/interior/configuratore/" variant="ghost">Prova le finiture</Button>
            </div>
          </Block>
        </div>
      </div>

      {/* ── Big Sun Garage ─────────────────────────────────────────────── */}
      <div id="garage" data-world="garage" className="relative bg-bg text-text">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-70"
          style={{ background: "radial-gradient(60% 70% at 70% 0%, color-mix(in srgb, var(--glow) 45%, transparent), transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-[1320px] gap-14 px-[max(16px,env(safe-area-inset-left))] py-20 sm:py-28">
          <div className="flex items-start justify-between gap-6">
            <ChapterHead
              eyebrow="WOW Big Sun Garage · la notte"
              title="La luce viene dalle cose."
              intro="Notte in officina, videogioco di corse, fumetto. Fondo viola notte, LED a chevron, giallo fluo come colpo. Le foto dei lavori tengono i loro colori."
            />
            <PeelCorner world="garage" href="#interior" className="hidden shrink-0 sm:block" />
          </div>

          <ChevronLeds count={9} ignite className="max-w-[720px]" />

          <Block title="Colori" note="Il viola elettrico non regge il testo (2,4:1): si usa solo per glow e luci. Sul giallo fluo il testo è nero.">
            <Swatches data={GARAGE} />
          </Block>

          <Block title="Tipografia" note="Big Shoulders Display al posto di Anton: più racing e variabile (un file per tutti i pesi). Chakra Petch per HUD e numeri, Instrument Serif per i reveal.">
            <Specimen world="garage" />
          </Block>

          <Block title="Garage files" note="La scheda di un lavoro come la selezione di un'auto in un videogioco: solo dati veri, niente statistiche inventate.">
            <article className="grid max-w-[920px] gap-0 border border-line bg-surface sm:grid-cols-[1.1fr_1fr]">
              <div className="relative min-w-0 overflow-hidden max-sm:aspect-[4/3]">
                <Picture item={ktm} sizes="(min-width: 640px) 500px, 100vw" className="absolute! inset-0 size-full! aspect-auto!" />
              </div>
              <div className="grid content-start gap-5 p-6">
                <HudTag>File 02 · Moto</HudTag>
                <h4 className="type-h2 text-heading">KTM 790 Adventure</h4>
                <dl>
                  <HudSpec label="Servizio" value="Wrapping completo, squame in rilievo" />
                  <HudSpec label="Ispirazione" value="Dragon Trainer" />
                  <HudSpec label="Dove" value="Brindisi, settembre 2026" />
                </dl>
                <p className="type-ui text-[clamp(3rem,7vw,5rem)] leading-none text-accent">
                  <RollingNumber value={36} suffix="ORE" />
                </p>
                <p className="type-small text-muted">Contachilometri di esempio (il valore 36 ore è del container del Jova Summer Party).</p>
              </div>
            </article>
          </Block>

          <Block title="Reveal cinematografico" note="Formato 2.39:1, bande nere, una parola per stacco in serif maiuscolo bianco, come negli edit di Paolo.">
            <Letterbox word="Saetta" className="max-w-[1000px]">
              {pista.clips?.[0] && <LoopVideo clip={pista.clips[0]} label={pista.alt ?? ""} />}
            </Letterbox>
          </Block>

          <Block title="Prima / dopo" note="Stessa maniglia a spatola, pelle Garage. Le porte posteriori di un furgone della flotta, prima e dopo il rivestimento rosso.">
            <BeforeAfter before={flottePrima} after={flotteDopo} sizes="(min-width: 1024px) 520px, 100vw" className="max-w-[460px]" labels={["Prima", "Dopo"]} />
          </Block>

          <Block title="Bottoni" note="Angolo tagliato da HUD, testo in Chakra Petch maiuscolo.">
            <div className="flex flex-wrap items-center gap-4">
              <WhatsAppButton world="garage" label="Mandaci una foto del mezzo" />
              <Button href="/garage/configuratore/" variant="ghost">Configura il tuo wrap</Button>
            </div>
          </Block>
        </div>
      </div>

      {/* ── In comune ──────────────────────────────────────────────────── */}
      <div data-world="interior" className="bg-surface">
        <div className="mx-auto grid max-w-[1320px] gap-14 px-[max(16px,env(safe-area-inset-left))] py-20 sm:py-28">
          <ChapterHead
            eyebrow="In comune"
            title="Il gesto che li unisce."
            intro="Il lembo di pellicola è l'interruttore di mondo: sotto si vede l'altro mondo, il retro è la carta siliconata. Nella Fase 3 diventa la transizione WebGL."
          />

          <Block title="Lembo di pellicola" note="Passa il mouse o arriva con il tasto Tab: l'angolo si solleva di più e dice dove porta.">
            <div className="flex flex-wrap gap-6">
              <div data-world="interior" className="grid h-48 w-72 justify-end bg-bg p-0">
                <PeelCorner world="interior" href="#garage" />
              </div>
              <div data-world="garage" className="grid h-48 w-72 justify-end bg-bg p-0">
                <PeelCorner world="garage" href="#interior" />
              </div>
            </div>
          </Block>

          <Block title="Movimento" note="Stessi componenti, ritmo diverso. Con «riduci movimento» attivo: niente parallasse né effetti continui, video fermi sul poster.">
            <div className="grid gap-px bg-line md:grid-cols-2">
              {(["interior", "garage"] as const).map((w) => (
                <div key={w} data-world={w} className="grid content-start gap-3 bg-bg p-6 text-text">
                  <p className="type-eyebrow text-accent">{w === "interior" ? "Interior" : "Big Sun Garage"}</p>
                  <p className="font-mono text-sm">
                    {MOTION[w].duration.fast * 1000}–{MOTION[w].duration.slow * 1000} ms · {MOTION[w].ease.out} / {MOTION[w].ease.inOut}
                    {MOTION[w].ease.flicker ? ` · ${MOTION[w].ease.flicker}` : ""}
                  </p>
                  <p className="type-small text-muted">{MOTION[w].text}</p>
                </div>
              ))}
            </div>
          </Block>

          <Block title="WhatsApp fisso" note="In basso a destra su ogni pagina, con il messaggio precompilato del mondo in cui ti trovi. Qui è mostrato fuori posizione.">
            <div className="flex gap-6">
              <span data-world="interior" className="grid size-[58px] place-items-center rounded-full bg-cta text-cta-text"><WhatsAppIcon size={26} /></span>
              <span data-world="garage" className="grid size-[58px] place-items-center rounded-full bg-cta text-cta-text"><WhatsAppIcon size={26} /></span>
            </div>
          </Block>

          <Block title="Regole che non si discutono">
            <ul className="grid gap-3 type-body md:grid-cols-2">
              {[
                "Loghi solo dai file originali: mai ridisegnati, ricolorati, deformati o animati lettera per lettera.",
                "Niente viola o giallo nel mondo Interior; niente blu o rosso dominanti nel Garage.",
                "Lavori mostrati: solo foto vere. Le immagini AI solo per sfondi e ambientazioni, segnate nel catalogo.",
                "Il giallo fluo non è un colore di testo lungo: numeri, CTA, linee HUD.",
                "Il rosso Interior indica qualcosa: etichetta, freccia, numero, bottone. Non riempie.",
                "Oscuramento vetri: solo posteriori e lunotto, il configuratore lo rispetta.",
              ].map((r) => (
                <li key={r} className="border-l-2 border-accent pl-4 text-text">{r}</li>
              ))}
            </ul>
          </Block>
        </div>
      </div>
    </main>
  );
}
