"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { radialTexture } from "../textures";
import type { HeroState } from "./state";

// Garage: l'officina di WOW di notte, ricostruita dalle foto vere. Pareti nere,
// una linea LED orizzontale con sotto una fila di chevron ">", il telaio LED a
// soffitto. Gli stessi tubi illuminano l'ambiente (mappa d'ambiente), quindi
// sulla carrozzeria si riflettono i chevron di WOW. All'avvio i tubi si
// accendono uno dopo l'altro con un piccolo sfarfallio.

export const CAR_URL = "/models/car-coupe.glb";

type Tube = { a: [number, number, number]; b: [number, number, number]; delay: number };

/** I tubi LED dell'officina (metri). Parete di fondo a z = −3,2, soffitto a 3,4 m. */
function tubes(): Tube[] {
  const list: Tube[] = [];
  const wz = -3.15;
  // Linea orizzontale alta.
  list.push({ a: [-6.5, 2.75, wz], b: [6.5, 2.75, wz], delay: 0 });
  // Chevron ">": due tubi per ognuno, punta a destra.
  for (let i = 0; i < 7; i++) {
    const x = -5.4 + i * 1.55;
    const d = 0.12 + i * 0.09;
    list.push({ a: [x, 2.35, wz], b: [x + 0.55, 1.6, wz], delay: d });
    list.push({ a: [x + 0.55, 1.6, wz], b: [x, 0.85, wz], delay: d + 0.03 });
  }
  // Telaio a soffitto: due longheroni e tre traversi.
  const y = 3.35;
  list.push({ a: [-2.2, y, -2.6], b: [-2.2, y, 2.6], delay: 0.75 });
  list.push({ a: [2.2, y, -2.6], b: [2.2, y, 2.6], delay: 0.75 });
  for (const z of [-2.6, 0, 2.6]) list.push({ a: [-2.2, y, z], b: [2.2, y, z], delay: 0.85 + (z + 2.6) * 0.03 });
  return list;
}

function tubeMatrix(t: Tube, radius: number) {
  const a = new THREE.Vector3(...t.a), b = new THREE.Vector3(...t.b);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const len = a.distanceTo(b);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return new THREE.Matrix4().compose(mid, q, new THREE.Vector3(radius, len, radius));
}

/** Mappa d'ambiente fatta con gli stessi tubi, più grandi e luminosi: i riflessi sono i LED di WOW. */
function useWorkshopEnvironment(list: Tube[], floor: THREE.MeshStandardMaterial) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const env = new THREE.Scene();
    env.background = new THREE.Color("#050307");
    const geo = new THREE.CylinderGeometry(1, 1, 1, 8);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 9, 9.4) });
    for (const t of list) {
      const m = new THREE.Mesh(geo, mat);
      tubeMatrix(t, 0.07).decompose(m.position, m.quaternion, m.scale);
      env.add(m);
    }
    // Un pannello viola tenue di lato: il glow dell'atmosfera Garage.
    const side = new THREE.Mesh(new THREE.PlaneGeometry(8, 3), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.28, 0.05, 0.6) }));
    side.position.set(7, 1.5, 0);
    side.rotation.y = -Math.PI / 2;
    env.add(side);
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(env, 0.02, 0.1, 40);
    scene.environment = rt.texture;
    scene.environmentIntensity = 1;
    // Il pavimento prende la stessa luce ma molto più debole, se no diventa grigio.
    floor.envMap = rt.texture;
    floor.envMapIntensity = 0.12;
    floor.needsUpdate = true;
    scene.background = new THREE.Color("#07050a");
    return () => {
      rt.dispose();
      pmrem.dispose();
      geo.dispose();
      mat.dispose();
    };
  }, [gl, scene, list, floor]);
}

function Car() {
  const { scene } = useGLTF(CAR_URL);
  const car = useMemo(() => {
    const root = scene.clone(true);
    // Wrap della hero: viola notte lucido metallizzato, tetto e parti a contrasto nero lucido.
    const paint = new THREE.MeshPhysicalMaterial({
      color: "#3b1766",
      metalness: 0.55,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    });
    const black = new THREE.MeshPhysicalMaterial({ color: "#0b0b0d", metalness: 0.2, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.03 });
    const rim = new THREE.MeshStandardMaterial({ color: "#1c1b20", metalness: 0.9, roughness: 0.35 });
    const glass = new THREE.MeshPhysicalMaterial({ color: "#0a0a0f", metalness: 0, roughness: 0.03, transparent: true, opacity: 0.82, envMapIntensity: 1.4 });
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      m.castShadow = true;
      const name = (m.material as THREE.Material).name;
      if (name === "paint_body") m.material = paint;
      else if (name === "paint_accent") m.material = black;
      else if (name === "rim" || name === "rim_detail") m.material = rim;
      else if (name === "glass") m.material = glass;
    });
    return root;
  }, [scene]);
  return <primitive object={car} rotation-y={-0.62} />;
}

export function GarageScene({ state, camera, onReady }: { state: HeroState; camera: THREE.PerspectiveCamera; onReady: () => void }) {
  const list = useMemo(tubes, []);
  const floorMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0c0b0f", roughness: 0.34, metalness: 0 }), []);
  useWorkshopEnvironment(list, floorMat);
  const tubesRef = useRef<THREE.InstancedMesh>(null);
  const glowRef = useRef<THREE.InstancedMesh>(null);
  const start = useRef(-1);
  const lit = useRef(false);
  const glow = useMemo(() => radialTexture("rgba(255,255,255,0.35)", "rgba(255,255,255,0)"), []);
  const blob = useMemo(() => radialTexture("rgba(0,0,0,0.85)", "rgba(0,0,0,0)"), []);
  const tubeMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4, 4.2), toneMapped: false }), []);
  const glowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: glow, color: new THREE.Color(0.9, 0.9, 1), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    [glow],
  );

  useEffect(() => {
    const tm = tubesRef.current, gm = glowRef.current;
    if (!tm || !gm) return;
    list.forEach((t, i) => {
      tm.setMatrixAt(i, tubeMatrix(t, 0.022));
      // L'alone: un piano lungo quanto il tubo, largo una spanna.
      const a = new THREE.Vector3(...t.a), b = new THREE.Vector3(...t.b);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const dir = b.clone().sub(a);
      const len = dir.length();
      const ceiling = Math.abs(dir.y) < 0.01 && Math.abs(a.y - 3.35) < 0.01;
      const m = new THREE.Object3D();
      m.position.copy(mid);
      if (ceiling) {
        m.rotation.set(Math.PI / 2, 0, Math.atan2(dir.x, dir.z) * -1 + (Math.abs(dir.x) > 0.01 ? Math.PI / 2 : 0));
        m.position.y -= 0.02;
      } else {
        m.position.z += 0.02;
        m.rotation.z = Math.atan2(dir.y, dir.x);
      }
      m.scale.set(len + 0.28, 0.3, 1);
      m.updateMatrix();
      gm.setMatrixAt(i, m.matrix);
      tm.setColorAt(i, new THREE.Color(0, 0, 0));
      gm.setColorAt(i, new THREE.Color(0, 0, 0));
    });
    tm.instanceMatrix.needsUpdate = true;
    gm.instanceMatrix.needsUpdate = true;
    onReady();
  }, [list, onReady]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (start.current < 0) start.current = t;
    const since = t - start.current;
    // Accensione in sequenza con sfarfallio a scatti, poi luce piena (più forte se ci passi sopra).
    const tm = tubesRef.current, gm = glowRef.current;
    if (tm && gm && !lit.current) {
      // A fine sequenza tutti accesi: anche se i frame sono pochi, nessun tubo resta a metà.
      if (since > 2.6) lit.current = true;
      const c = new THREE.Color();
      list.forEach((tube, i) => {
        const k = since - tube.delay * 1.4;
        let v = 0;
        if (k > 0.22 || lit.current) v = 1;
        else if (k > 0) v = Math.floor(k * 40) % 3 === 0 ? 0.15 : 0.9;
        tm.setColorAt(i, c.setScalar(v));
        gm.setColorAt(i, c.setScalar(v));
      });
      tm.instanceColor!.needsUpdate = true;
      gm.instanceColor!.needsUpdate = true;
    }
    const boost = 1 + Math.max(0, state.lean) * 0.25;
    tubeMat.color.setRGB(4 * boost, 4 * boost, 4.2 * boost);
    // Camera: giro lento attorno all'auto più la parallasse del puntatore.
    const ang = 0.5 + Math.sin(t * 0.08) * 0.12 + state.px * 0.1;
    const r = 10.5;
    camera.position.set(Math.sin(ang) * r, 1.7 - state.py * 0.15, Math.cos(ang) * r);
    camera.lookAt(0, 0.62, 0.2);
  });

  return (
    <>
      <instancedMesh ref={tubesRef} args={[undefined, undefined, list.length]} material={tubeMat}>
        <cylinderGeometry args={[1, 1, 1, 10]} />
      </instancedMesh>
      <instancedMesh ref={glowRef} args={[undefined, undefined, list.length]} material={glowMat}>
        <planeGeometry args={[1, 1]} />
      </instancedMesh>

      {/* Pareti e soffitto neri, pavimento grafite lucido */}
      <mesh position={[0, 1.8, -3.2]}>
        <planeGeometry args={[40, 3.6]} />
        <meshStandardMaterial color="#0c0b0e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 3.6, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0a090c" roughness={0.9} />
      </mesh>
      <mesh position={[-6.5, 1.8, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[40, 3.6]} />
        <meshStandardMaterial color="#0c0b0e" roughness={0.85} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} receiveShadow material={floorMat}>
        <planeGeometry args={[40, 40]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.004} scale={[3.4, 5.6, 1]} rotation-z={0.62}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={blob} transparent depthWrite={false} />
      </mesh>

      <Car />
    </>
  );
}

useGLTF.preload(CAR_URL);
