"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { FeaturedWork } from "@/content/home";
import type { MediaItem, MediaClip } from "@/lib/media-types";
import { Picture } from "@/components/media/Picture";
import { LoopVideo } from "@/components/media/LoopVideo";
import { WorldLink } from "@/components/transition/WorldLink";
import { HudTag } from "@/components/garage/HudTag";

// I lavori migliori dei due mondi in una galleria orizzontale: su desktop la
// sezione si ferma e lo scroll verticale la fa scorrere di lato; su mobile è
// una fila che si sfoglia col dito. Ogni scheda resta nel suo mondo.
export type WorkCard = FeaturedWork & { img: MediaItem; clip?: MediaClip; clipLabel?: string };

export function WorksGallery({ works }: { works: WorkCard[] }) {
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const el = track.current!;
      const distance = () => el.scrollWidth - window.innerWidth + 64;
      gsap.to(el, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: { trigger: ref.current, start: "top top", end: () => `+=${distance()}`, scrub: 0.5, pin: true, invalidateOnRefresh: true },
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-interior-paper py-16 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:py-0" aria-labelledby="lavori-title">
      <div className="mb-8 flex items-end justify-between gap-6 px-4 sm:px-10 lg:px-16">
        <h2 id="lavori-title" className="font-[var(--font-sans-stack)] text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-[850] tracking-[-0.04em] text-interior-ink">
          Lavori veri.
          <br />
          <span className="text-interior-ink/45">Niente rendering.</span>
        </h2>
        <p className="hidden max-w-xs type-body text-interior-ink/70 sm:block">Ogni foto e ogni video è un lavoro fatto in officina o dal cliente, a Brindisi e dintorni.</p>
      </div>
      <ul ref={track} className="wow-works flex gap-4 overflow-x-auto px-4 pb-4 sm:gap-6 sm:px-10 lg:overflow-visible lg:px-16 lg:pb-0">
        {works.map((w, i) => {
          const { img, clip } = w;
          const href = w.world === "interior" ? "/interior/" : "/garage/";
          return (
            <li key={w.id} data-world={w.world} className={`wow-work wow-work--${w.world} shrink-0 bg-bg text-text`}>
              <WorldLink world={w.world} href={href} className="wow-work__link" aria-label={`${w.title}: entra in ${w.world === "interior" ? "Interior" : "Big Sun Garage"}`}>
                <div className="wow-work__media">
                  {clip ? <LoopVideo clip={clip} label={w.clipLabel ?? w.title} /> : <Picture item={img} sizes="(min-width: 1024px) 30vw, 80vw" className="h-full w-full" />}
                </div>
                <div className="wow-work__body">
                  {w.world === "garage" ? <HudTag>{w.tag}</HudTag> : <p className="type-eyebrow text-accent">{w.tag}</p>}
                  <h3 className="wow-work__title">{w.title}</h3>
                  <p className="type-small text-muted">{w.line}</p>
                </div>
                <span className="wow-work__index" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </WorldLink>
              <a href={w.post} target="_blank" rel="noopener noreferrer" className="wow-work__ig type-small">
                Il post su Instagram ↗
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
