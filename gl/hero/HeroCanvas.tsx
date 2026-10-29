"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor, useFBO } from "@react-three/drei";
import * as THREE from "three";
import { InteriorScene } from "./InteriorScene";
import { GarageScene } from "./GarageScene";
import { compositeMaterial } from "./composite";
import type { HeroState } from "./state";
import { linerTexture } from "../liner";

// Il canvas della hero: due scene renderizzate ciascuna nel suo buffer e poi
// composte con il taglio a 45° (gl/hero/composite.ts). Un solo contesto WebGL.

function Compositor({ state, onReady }: { state: HeroState; onReady: () => void }) {
  const size = useThree((s) => s.size);
  const sceneI = useMemo(() => new THREE.Scene(), []);
  const sceneG = useMemo(() => new THREE.Scene(), []);
  const camI = useMemo(() => new THREE.PerspectiveCamera(34, 1, 0.1, 40), []);
  const camG = useMemo(() => new THREE.PerspectiveCamera(30, 1, 0.1, 60), []);
  const opts = { type: THREE.HalfFloatType, samples: 4 } as const;
  const fboI = useFBO(opts);
  const fboG = useFBO(opts);
  const blank = useMemo(() => new THREE.Texture(), []);
  const mat = useMemo(() => compositeMaterial(blank), [blank]);
  const quad = useMemo(() => {
    const s = new THREE.Scene();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    m.frustumCulled = false;
    s.add(m);
    return s;
  }, [mat]);
  const ortho = useMemo(() => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), []);
  const ready = useRef({ garage: false, frames: 0, fade: 0, sent: false });

  useEffect(() => {
    void linerTexture().then((t) => (mat.uniforms.tLiner.value = t));
  }, [mat]);

  useEffect(() => {
    const { width: W, height: H } = size;
    camI.aspect = camG.aspect = W / H;
    // Ogni soggetto va nel suo triangolo: la porta in basso a sinistra, l'auto in
    // alto a destra (su mobile: auto sopra, porta sotto). Lo spostamento si fa con
    // la finestra di vista, così le camere guardano sempre il soggetto.
    const narrow = W / H < 1;
    camI.fov = narrow ? 62 : 42;
    camG.fov = narrow ? 58 : 34;
    if (narrow) {
      camI.setViewOffset(W, H, 0.19 * W, -0.035 * H, W, H);
      camG.setViewOffset(W, H, -0.16 * W, 0.07 * H, W, H);
    } else {
      camI.setViewOffset(W, H, 0.14 * W, -0.1 * H, W, H);
      camG.setViewOffset(W, H, -0.26 * W, -0.12 * H, W, H);
    }
    state.narrow = narrow;
    camI.updateProjectionMatrix();
    camG.updateProjectionMatrix();
  }, [size, camI, camG]);

  const garageReady = useCallback(() => {
    ready.current.garage = true;
  }, []);

  useFrame(({ gl }, delta) => {
    if (!state.visible) return;
    const r = ready.current;
    gl.setRenderTarget(fboI);
    gl.render(sceneI, camI);
    if (r.garage) {
      gl.setRenderTarget(fboG);
      gl.render(sceneG, camG);
    }
    gl.setRenderTarget(null);
    const u = mat.uniforms;
    u.tI.value = fboI.texture;
    u.tG.value = fboG.texture;
    u.uRes.value.set(size.width, size.height);
    u.uCut.value = state.cut;
    u.uK.value.set(state.K[0], state.K[1]);
    u.uU.value.set(state.u[0], state.u[1]);
    u.uFold.value = state.fold;
    u.uExpI.value = 1.12;
    u.uExpG.value = 1.0;
    // Comparsa morbida sopra il poster solo quando anche l'officina è pronta.
    if (r.garage) r.frames++;
    if (r.frames > 2) r.fade = Math.min(1, r.fade + delta / 0.7);
    u.uFade.value = r.fade;
    gl.render(quad, ortho);
    if (r.fade >= 1 && !r.sent) {
      r.sent = true;
      onReady();
    }
  }, 1);

  return (
    <>
      {createPortal(<InteriorScene state={state} camera={camI} />, sceneI)}
      {createPortal(
        <Suspense fallback={null}>
          <GarageScene state={state} camera={camG} onReady={garageReady} />
        </Suspense>,
        sceneG,
      )}
    </>
  );
}

export default function HeroCanvas({ state, onReady }: { state: HeroState; onReady: () => void }) {
  // Se il dispositivo arranca, la risoluzione scende (prima di tutto il resto).
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio, 1.5));
  return (
    <Canvas
      className="!absolute inset-0"
      flat
      shadows="percentage"
      dpr={dpr}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      frameloop="always"
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))} />
      <Compositor state={state} onReady={onReady} />
    </Canvas>
  );
}
