"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import type { MediaItem } from "@/lib/media-types";
import { prefersReducedMotion } from "@/lib/motion";
import { Picture } from "@/components/media/Picture";
import { Logo } from "@/components/ui/Logo";
import { WorldLink } from "@/components/transition/WorldLink";
import { useWorldTransition } from "@/components/transition/TransitionProvider";
import { MarkerLabel } from "@/components/interior/MarkerLabel";
import { createHeroState, cornerOf } from "@/gl/hero/state";

const HeroCanvas = dynamic(() => import("@/gl/hero/HeroCanvas"), { ssr: false });

/** 3D solo se il dispositivo lo regge e nessuno ha chiesto meno movimento. */
function canUse3D(): boolean {
  if (prefersReducedMotion()) return false;
  // ?no3d forza la versione con le foto (per i controlli e per confrontare).
  if (new URLSearchParams(location.search).has("no3d")) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if ((nav.hardwareConcurrency ?? 4) < 4 || (nav.deviceMemory ?? 4) < 4) return false;
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

const REST_FOLD = 38;
const HOVER_FOLD = 74;

// La hero: i due mondi tagliati a 45° come una pellicola. Interior (in basso a
// sinistra) è la pellicola sopra; il Garage (in alto a destra) sta sotto.
// Il puntatore sposta il taglio verso il mondo su cui passa; l'angolo della
// pellicola Interior si afferra e si tira: staccato abbastanza, si entra nel Garage.
export function Hero({ interior, garage }: { interior: MediaItem; garage: MediaItem }) {
  const ref = useRef<HTMLElement>(null);
  const state = useRef(createHeroState()).current;
  const go = useWorldTransition();
  const [use3D, setUse3D] = useState(false);
  const [live, setLive] = useState(false);
  const drag = useRef<{ active: boolean; fold: number; target: number; leanTarget: number; hover: boolean }>({ active: false, fold: 0, target: REST_FOLD, leanTarget: 0, hover: false });

  useEffect(() => {
    if (!canUse3D()) return;
    // Il 3D parte dopo il primo disegno della pagina (le foto restano l'LCP).
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 300));
    const id = idle(() => setUse3D(true), { timeout: 1500 });
    return () => {
      if (typeof id === "number" && window.cancelIdleCallback) window.cancelIdleCallback(id);
    };
  }, []);

  useEffect(() => {
    const el = ref.current!;
    const reduced = prefersReducedMotion();
    let raf = 0;
    let cutTarget = 0;
    const measure = () => {
      state.w = el.clientWidth;
      state.h = el.clientHeight;
    };
    measure();
    const mid = () => (state.w - state.h) / 2;
    state.cut = cutTarget = mid();
    const io = new IntersectionObserver(([e]) => (state.visible = e.isIntersecting));
    io.observe(el);
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      state.px = (x / r.width) * 2 - 1;
      state.py = (y / r.height) * 2 - 1;
      // Il mondo sotto il puntatore si allarga.
      const span = state.w + state.h;
      const side = x - y - mid(); // < 0 sopra Interior
      cutTarget = mid() + Math.max(-0.17, Math.min(0.17, (-side / span) * 0.6)) * span;
      drag.current.leanTarget = Math.max(-1, Math.min(1, side / (span * 0.25)));
    };
    const onLeave = () => {
      cutTarget = mid();
      drag.current.leanTarget = 0;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    const tick = (now: number) => {
      const d = drag.current;
      if (!reduced) {
        state.cut += (cutTarget - state.cut) * 0.07;
        state.lean += (d.leanTarget - state.lean) * 0.08;
      } else {
        state.cut = cutTarget;
      }
      const c = cornerOf(state.cut, state.w, state.h);
      state.K = c.K;
      state.u = c.u;
      if (!d.active) {
        const breathe = reduced ? 0 : Math.sin(now / 700) * 4;
        d.target = (d.hover ? HOVER_FOLD : REST_FOLD) + breathe;
        d.fold += (d.target - d.fold) * 0.12;
      }
      state.fold = d.fold;
      el.style.setProperty("--cut", `${state.cut}px`);
      el.style.setProperty("--kx", `${state.K[0]}px`);
      el.style.setProperty("--ky", `${state.K[1]}px`);
      el.style.setProperty("--ux", `${state.u[0]}`);
      el.style.setProperty("--uy", `${state.u[1]}`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [state]);

  // L'angolo afferrato segue il puntatore: la punta sta a 2·fold dall'angolo.
  const onFlapDown = (e: RPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current.active = true;
  };
  const onFlapMove = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!drag.current.active) return;
    const r = ref.current!.getBoundingClientRect();
    const x = e.clientX - r.left - state.K[0], y = e.clientY - r.top - state.K[1];
    drag.current.fold = Math.max(REST_FOLD, (x * state.u[0] + y * state.u[1]) / 2);
  };
  const onFlapUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (d.fold > Math.min(state.w, state.h) * 0.2) go("/garage/", "garage");
  };

  return (
    <section ref={ref} className="wow-hero relative h-svh min-h-[560px] overflow-hidden bg-garage-night" aria-labelledby="hero-title">
      {/* Poster: foto vere dei lavori, tagliate come la scena 3D. */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`} aria-hidden="true">
        <div className="wow-hero__garage absolute inset-0">
          <Picture item={garage} sizes="100vw" priority className="h-full w-full" />
          <div className="absolute inset-0 bg-garage-night/45" />
        </div>
        <div className="wow-hero__interior absolute inset-0">
          <Picture item={interior} sizes="100vw" priority className="h-full w-full" />
          <div className="absolute inset-0 bg-interior-paper/25" />
        </div>
      </div>

      {use3D && <HeroCanvas state={state} onReady={() => setLive(true)} />}

      <h1 id="hero-title" className="sr-only">
        WOW, l&apos;artigiano delle pellicole: Interior Design e Big Sun Garage a Brindisi
      </h1>

      {/* Garage, in alto a destra */}
      <div data-world="garage" className="wow-hero__garage pointer-events-none absolute inset-0 bg-transparent">
        <div className="wow-hero__garage-copy absolute top-20 right-4 isolate grid max-w-[min(32rem,70vw)] justify-items-end gap-3 text-right sm:top-24 sm:right-10 lg:top-28 lg:right-16">
          <Logo variant="garage" width={150} className="w-[96px] sm:w-[150px]" priority />
          <p className="type-display text-[clamp(2.4rem,5vw,5rem)] text-heading [text-shadow:0_2px_30px_rgb(0_0_0/0.6)]">Paint is dead.</p>
          <p className="hidden type-body text-muted sm:block">Auto, moto, barche, flotte.</p>
          <WorldLink world="garage" href="/garage/" className="wow-button wow-button--primary pointer-events-auto">
            <span>Entra nel Garage</span>
            <span aria-hidden="true">→</span>
          </WorldLink>
        </div>
      </div>

      {/* Interior, in basso a sinistra */}
      <div data-world="interior" className="wow-hero__interior pointer-events-none absolute inset-0 bg-transparent">
        <div className="absolute bottom-8 left-4 grid max-w-[min(27rem,80vw)] justify-items-start gap-3 sm:bottom-12 sm:left-10 lg:bottom-16 lg:left-16">
          <Logo variant="interior" width={150} className="w-[88px] sm:w-[150px]" priority />
          <p className="type-display text-[clamp(2.25rem,4.4vw,4.4rem)] text-heading">Stesso infisso. Pelle nuova.</p>
          <p className="hidden type-body text-muted sm:block">Casa, negozi, uffici, vetrine.</p>
          <WorldLink world="interior" href="/interior/" className="wow-button wow-button--primary pointer-events-auto">
            <span>Entra in Interior</span>
            <span aria-hidden="true">→</span>
          </WorldLink>
        </div>
      </div>

      {/* L'angolo della pellicola: si afferra e si tira (o si preme Invio). */}
      <button
        type="button"
        className="wow-hero__flap"
        aria-label="Stacca la pellicola Interior ed entra nel Garage"
        onPointerDown={onFlapDown}
        onPointerMove={onFlapMove}
        onPointerUp={onFlapUp}
        onPointerCancel={onFlapUp}
        onPointerEnter={() => (drag.current.hover = true)}
        onPointerLeave={() => (drag.current.hover = false)}
        onFocus={() => (drag.current.hover = true)}
        onBlur={() => (drag.current.hover = false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            go("/garage/", "garage");
          }
        }}
      >
        <MarkerLabel tilt={-4} className="wow-hero__flap-hint">
          Tira qui
        </MarkerLabel>
      </button>
    </section>
  );
}
