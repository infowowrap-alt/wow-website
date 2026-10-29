"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import { Logo } from "@/components/ui/Logo";

// Il manifesto: quattro righe, ognuna su una striscia di pellicola che la
// spatola stende mentre scorri. La prima parla al Garage, la seconda a
// Interior, le ultime due sono di tutti e due.
const LINES = [
  { text: "Non è vernice.", world: "garage" as const },
  { text: "Non è un mobile nuovo.", world: "interior" as const },
  { text: "È pellicola.", world: null },
];

export function Manifesto() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    gsap.registerPlugin(ScrollTrigger);
    const el = ref.current!;
    el.classList.add("is-animated");
    const ctx = gsap.context(() => {
      const strips = gsap.utils.toArray<HTMLElement>(".wow-manifesto__strip");
      const lay = (tl: gsap.core.Timeline, s: HTMLElement, at: number) => {
        // La striscia entra come una pellicola stesa da sinistra, con la spatola sul bordo.
        tl.fromTo(s, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "power2.inOut", duration: 1 }, at);
        tl.fromTo(s.querySelector(".wow-manifesto__squeegee"), { left: "0%" }, { left: "100%", ease: "power2.inOut", duration: 1 }, at);
      };
      // La prima riga si stende mentre la sezione entra: lo schermo non è mai vuoto.
      lay(gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%", end: "top 20%", scrub: 0.6 } }), strips[0], 0);
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: () => `+=${window.innerHeight * 1.6}`, scrub: 0.6, pin: true, anticipatePin: 1 },
      });
      strips.slice(1).forEach((s, i) => lay(tl, s, i * 0.8));
      tl.fromTo(".wow-manifesto__final", { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, ease: "back.out(1.6)", duration: 0.7 }, (strips.length - 1) * 0.8 + 0.1);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="wow-liner relative grid min-h-svh place-items-center overflow-hidden px-4 py-24" aria-label="Manifesto">
      <div className="grid w-full max-w-6xl gap-3 sm:gap-4">
        {LINES.map((l) => (
          <p key={l.text} data-world={l.world ?? undefined} className={`wow-manifesto__strip ${l.world ? "bg-bg text-heading" : "bg-interior-ink text-white"}`}>
            <span className={l.world === "interior" ? "type-display" : l.world === "garage" ? "type-display" : "wow-manifesto__neutral"}>{l.text}</span>
            <span className="wow-manifesto__squeegee" aria-hidden="true" />
          </p>
        ))}
        <p className="wow-manifesto__final mt-4 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-8">
          <span className="wow-manifesto__neutral text-interior-ink">È</span>
          <Logo variant="wow" width={300} className="w-[150px] sm:w-[260px] lg:w-[300px]" />
          <span className="sr-only">WOW.</span>
        </p>
      </div>
    </section>
  );
}
