import type { Metadata } from "next";
import { media, type MediaItem } from "@/lib/media";
import { Picture } from "@/components/media/Picture";
import { LoopVideo } from "@/components/media/LoopVideo";

export const metadata: Metadata = {
  title: "Catalogo media",
  robots: { index: false, follow: false },
};

const WORLD_LABEL: Record<string, string> = {
  interior: "WOW Interior Design",
  garage: "WOW Big Sun Garage",
  officina: "Officina",
  campionario: "Campionario",
  eventi: "Eventi",
};

const PEOPLE_LABEL: Record<MediaItem["people"], string> = {
  nessuno: "nessuna persona",
  staff: "staff WOW",
  cliente: "cliente: serve ok",
  "cliente-ok": "cliente, ok volti",
  "da-confermare": "persone da verificare",
};

function groupBy<T>(list: T[], key: (x: T) => string) {
  const map = new Map<string, T[]>();
  for (const x of list) map.set(key(x), [...(map.get(key(x)) ?? []), x]);
  return map;
}

function Chip({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "warn" | "good" }) {
  const tones = {
    neutral: "border-interior-stone text-interior-ink/80",
    warn: "border-interior-red/40 bg-interior-red/5 text-interior-red",
    good: "border-interior-blue/30 bg-interior-blue/5 text-interior-blue",
  };
  return <span className={`rounded-full border px-2 py-0.5 text-[11px] leading-5 ${tones[tone]}`}>{children}</span>;
}

function Card({ item }: { item: MediaItem }) {
  const clip = item.kind === "video" ? item.clips?.[0] : undefined;
  const aspect = clip ? clip.width / clip.height : item.aspect ?? 1;
  const wide = aspect > 1.2;
  return (
    <figure className={`grid content-start gap-2 ${wide ? "sm:col-span-2" : ""}`}>
      <div className="overflow-hidden rounded-sm bg-interior-stone">
        {clip ? (
          <LoopVideo clip={clip} label={item.alt ?? ""} />
        ) : (
          <Picture item={item} sizes={wide ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"} />
        )}
      </div>
      <figcaption className="grid gap-1.5">
        <div className="flex flex-wrap gap-1">
          {item.phase && <Chip tone="good">{item.phase}</Chip>}
          <Chip tone={item.people === "cliente" || item.people === "da-confermare" ? "warn" : "neutral"}>{PEOPLE_LABEL[item.people]}</Chip>
          {item.overlay && <Chip tone="warn">grafica del reel</Chip>}
          {item.quality && <Chip tone={item.quality === "bassa" ? "warn" : "neutral"}>qualità {item.quality}</Chip>}
          {item.score != null && <Chip>{"●".repeat(item.score)}{"○".repeat(5 - item.score)}</Chip>}
          {item.ai && <Chip tone="warn">AI</Chip>}
          {item.review && <Chip tone="warn">da rivedere</Chip>}
        </div>
        <p className="text-sm leading-snug">{item.alt ?? <em className="text-interior-red">Alt mancante</em>}</p>
        <p className="font-mono text-[11px] leading-snug text-interior-ink/60">
          {item.id} · {item.width}×{item.height}
          {clip ? ` · loop ${clip.duration}s` : ""}
          {item.uses?.length ? ` · ${item.uses.join(", ")}` : ""}
        </p>
        {item.credits && <p className="text-xs text-interior-ink/70">{item.credits}</p>}
        {item.derivedNote && <p className="text-xs text-interior-ink/70">{item.derivedNote}</p>}
        {item.note && <p className="text-xs text-interior-red">{item.note}</p>}
        {item.post && (
          <a className="w-fit text-xs text-interior-blue underline" href={item.post} target="_blank" rel="noreferrer">
            Post Instagram
          </a>
        )}
      </figcaption>
    </figure>
  );
}

export default function MediaCatalogPage() {
  const visible = media.filter((m) => m.export !== false);
  const byWorld = groupBy(visible, (m) => m.world);
  const photos = visible.filter((m) => m.kind === "image").length;
  const videos = visible.length - photos;
  const lowRes = visible.filter((m) => m.quality === "bassa").length;
  const needsOk = visible.filter((m) => m.people === "cliente" || m.people === "da-confermare").length;

  return (
    <main className="mx-auto grid max-w-[1400px] gap-12 px-4 py-10 sm:px-8">
      <header className="grid gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-interior-red">Styleguide · solo sviluppo</p>
        <h1 className="text-4xl font-bold tracking-tight text-interior-blue sm:text-5xl">Catalogo media</h1>
        <p className="max-w-prose text-interior-ink/80">
          {photos} foto e {videos} loop video catalogati. {lowRes} sono fotogrammi a bassa risoluzione da Instagram, {needsOk} hanno
          persone da verificare. Gli originali arrivano dall&apos;album iCloud e dalla pagina «Materiale WOW».
        </p>
      </header>

      {[...byWorld].map(([world, items]) => (
        <section key={world} className="grid gap-8">
          <h2 className="border-b border-interior-stone pb-2 text-2xl font-bold">{WORLD_LABEL[world] ?? world}</h2>
          {[...groupBy(items, (m) => m.project)].map(([project, list]) => (
            <div key={project} className="grid gap-4">
              <h3 className="font-mono text-sm text-interior-ink/70">
                {project} · {list.length}
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
                {[...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).map((item) => (
                  <Card key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}
