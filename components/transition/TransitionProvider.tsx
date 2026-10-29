"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { World } from "@/lib/contact";
import { prefersReducedMotion } from "@/lib/motion";
import type { FilmTransition } from "@/gl/transition/FilmTransition";

type Go = (href: string, world: World) => void;
const Ctx = createContext<Go | null>(null);

const norm = (p: string) => (p.endsWith("/") ? p : p + "/");

/** Il mondo di una pagina, dal percorso: tutto il resto è "neutro" (home, contatti…). */
export function worldOf(path: string): World | null {
  if (path.startsWith("/interior")) return "interior";
  if (path.startsWith("/garage")) return "garage";
  return null;
}

// Tiene il canvas della pellicola sopra tutte le pagine e fa il cambio di
// pagina mentre lo schermo è coperto. Senza WebGL o con "riduci movimento"
// la pellicola è una maschera diagonale in CSS (o una dissolvenza breve).
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const film = useRef<FilmTransition | null>(null);
  const busy = useRef(false);
  const waiters = useRef<{ path: string; resolve: () => void }[]>([]);

  useEffect(() => {
    const p = norm(pathname);
    waiters.current = waiters.current.filter((w) => {
      if (w.path !== p) return true;
      // Due frame: la pagina nuova è stata dipinta sotto la pellicola.
      requestAnimationFrame(() => requestAnimationFrame(w.resolve));
      return false;
    });
  }, [pathname]);

  // Il modulo WebGL si scarica quando il browser è libero, non al primo clic.
  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1200));
    const id = idle(() => void import("@/gl/transition/FilmTransition"));
    const onResize = () => film.current?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (typeof id === "number" && window.cancelIdleCallback) window.cancelIdleCallback(id);
    };
  }, []);

  const navigate = useCallback(
    (href: string) =>
      new Promise<void>((resolve) => {
        const url = new URL(href, location.href);
        const path = norm(url.pathname);
        if (path === norm(location.pathname)) {
          // Stessa pagina (es. lo styleguide): sotto la pellicola si salta all'ancora.
          if (url.hash) document.getElementById(url.hash.slice(1))?.scrollIntoView({ behavior: "instant" });
          return requestAnimationFrame(() => resolve());
        }
        waiters.current.push({ path, resolve });
        router.push(href);
        // Rete lenta o errore: la pellicola non resta mai ferma sullo schermo.
        setTimeout(resolve, 5000);
      }),
    [router],
  );

  const go = useCallback<Go>(
    async (href, world) => {
      if (busy.current) return;
      busy.current = true;
      const lenis = (window as unknown as { __lenis?: { stop(): void; start(): void } }).__lenis;
      lenis?.stop();
      document.documentElement.dataset.transition = world;
      try {
        const reduced = prefersReducedMotion();
        let webgl: typeof import("@/gl/transition/FilmTransition") | null = null;
        if (!reduced) {
          webgl = await import("@/gl/transition/FilmTransition");
          if (!webgl.hasWebGL()) webgl = null;
        }
        if (webgl && canvasRef.current) {
          film.current ??= new webgl.FilmTransition(canvasRef.current);
          await film.current.play(world, () => navigate(href));
        } else {
          await cssMask(maskRef.current!, world, reduced, () => navigate(href));
        }
      } finally {
        delete document.documentElement.dataset.transition;
        lenis?.start();
        busy.current = false;
      }
    },
    [navigate],
  );

  return (
    <Ctx.Provider value={go}>
      {children}
      <canvas ref={canvasRef} className="wow-transition-canvas" aria-hidden="true" />
      <div ref={maskRef} className="wow-transition-mask" aria-hidden="true" />
    </Ctx.Provider>
  );
}

async function cssMask(el: HTMLDivElement, world: World, reduced: boolean, covered: () => Promise<void>) {
  el.dataset.world = world;
  el.style.visibility = "visible";
  if (reduced) {
    await el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: "forwards" }).finished;
    await covered();
    await el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }).finished;
  } else {
    // Un triangolo che parte dall'angolo in alto a destra e copre tutto, poi si ritira.
    const tri = (l: number) => `polygon(${100 - l}% 0, 100% 0, 100% ${l}%)`;
    el.style.opacity = "1";
    await el.animate([{ clipPath: tri(0) }, { clipPath: tri(200) }], { duration: 560, easing: "cubic-bezier(0.65,0,0.35,1)", fill: "forwards" }).finished;
    await covered();
    await el.animate([{ clipPath: tri(200) }, { clipPath: tri(0) }], { duration: 620, easing: "cubic-bezier(0.65,0,0.35,1)", fill: "forwards" }).finished;
  }
  el.style.visibility = "hidden";
}

export function useWorldTransition(): Go {
  const go = useContext(Ctx);
  if (!go) throw new Error("useWorldTransition fuori da TransitionProvider");
  return go;
}
