"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { doorFinishes, oakFloor } from "../textures";
import type { HeroState } from "./state";

// Interior: l'angolo di una stanza luminosa. Dalla finestra entra il sole e
// disegna le ombre del telaio; sulla porta una spatola stende una finitura
// dopo l'altra (legno, cemento, stucco, bianco opaco). "Stesso infisso. Pelle nuova."

const WALL = "#ece5d9";
const DOOR = { x: -0.75, w: 0.92, h: 2.1, z: -1.98 };

function wipeMaterial(finishes: ReturnType<typeof doorFinishes>) {
  const uniforms = {
    mapB: { value: finishes[1].texture },
    uWipe: { value: 0 },
    uRoughA: { value: finishes[0].roughness },
    uRoughB: { value: finishes[1].roughness },
  };
  const mat = new THREE.MeshStandardMaterial({ map: finishes[0].texture, roughness: finishes[0].roughness });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform sampler2D mapB;\nuniform float uWipe;\nuniform float uRoughA;\nuniform float uRoughB;\nfloat wipeK;",
      )
      .replace(
        "#include <map_fragment>",
        /* glsl */ `
        float along = (vMapUv.x + (1.0 - vMapUv.y)) * 0.5;
        wipeK = smoothstep(uWipe - 0.004, uWipe + 0.004, along);
        vec4 fA = texture2D(map, vMapUv);
        vec4 fB = texture2D(mapB, vMapUv);
        diffuseColor *= mix(fB, fA, wipeK);
        `,
      )
      .replace("#include <roughnessmap_fragment>", "float roughnessFactor = mix(uRoughB, uRoughA, wipeK);")
      .replace(
        "#include <emissivemap_fragment>",
        // Il bordo della pellicola appena stesa prende la luce.
        "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.5) * exp(-pow((along - uWipe) / 0.003, 2.0)) * step(0.001, uWipe) * step(uWipe, 0.999);",
      );
  };
  return { mat, uniforms };
}

export function InteriorScene({ state, camera }: { state: HeroState; camera: THREE.PerspectiveCamera }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const finishes = useMemo(() => doorFinishes(), []);
  const floor = useMemo(() => {
    const t = oakFloor();
    t.repeat.set(7, 7);
    return t;
  }, []);
  const { mat: doorMat, uniforms } = useMemo(() => wipeMaterial(finishes), [finishes]);
  const spatula = useRef<THREE.Group>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const cycle = useRef({ index: 0, t0: -1 });

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.2;
    scene.background = new THREE.Color(WALL);
    return () => {
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  useEffect(() => {
    const target = sun.current?.target;
    if (target) {
      target.position.set(-0.7, 0.2, -1.1);
      scene.add(target);
      return () => void scene.remove(target);
    }
  }, [scene]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // Parallasse lenta, stile Interior.
    camera.position.x += (0.9 + state.px * 0.18 - camera.position.x) * 0.04;
    camera.position.y += (1.38 - state.py * 0.08 - camera.position.y) * 0.04;
    camera.position.z = 4.3;
    camera.lookAt(DOOR.x, 1.05, DOOR.z);

    // Ciclo della spatola: 1,6 s di stesura, 2 s di pausa (più veloce se ci passi sopra).
    const c = cycle.current;
    if (c.t0 < 0) c.t0 = t + 0.8;
    const speed = state.lean < -0.2 ? 1.5 : 1;
    const p = Math.max(0, Math.min(1, ((t - c.t0) * speed) / 1.6));
    const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    uniforms.uWipe.value = eased;
    if (t - c.t0 > 3.6 / speed) {
      c.index = (c.index + 1) % finishes.length;
      const a = finishes[c.index], b = finishes[(c.index + 1) % finishes.length];
      doorMat.map = a.texture;
      uniforms.mapB.value = b.texture;
      uniforms.uRoughA.value = a.roughness;
      uniforms.uRoughB.value = b.roughness;
      uniforms.uWipe.value = 0;
      c.t0 = t;
    }
    // La spatola segue il bordo, inclinata a 45°, e sparisce a fine passata.
    const g = spatula.current;
    if (g) {
      const on = p > 0 && p < 1;
      g.visible = on;
      const along = eased * 2; // u + (1 − v) = 2 · along
      const off = Math.sin(p * Math.PI * 2.5) * 0.22;
      const u = Math.min(1.2, Math.max(-0.2, along / 2 + off));
      const v = 1 - (along - u);
      g.position.set(DOOR.x - DOOR.w / 2 + u * DOOR.w, v * DOOR.h, DOOR.z + 0.07);
    }
  });

  return (
    <>
      <hemisphereLight args={["#fff8ee", "#b9a68c", 0.2]} />
      <directionalLight
        ref={sun}
        position={[-6.5, 4.2, 1.8]}
        intensity={6.5}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-camera-near={1}
        shadow-camera-far={16}
      />

      {/* Pavimento in rovere */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial map={floor} roughness={0.5} />
      </mesh>

      {/* Parete di fondo con il vano della porta */}
      <WallWithHole width={9} height={3.2} hole={{ x: DOOR.x, w: DOOR.w + 0.02, h: DOOR.h + 0.01 }} position={[0, 0, -2]} />
      {/* Parete sinistra con la finestra */}
      <group position={[-2.6, 0, 1.5]} rotation-y={Math.PI / 2}>
        <WallWithHole width={9} height={3.2} hole={{ x: 1.55, w: 1.5, h: 1.55, y: 0.85 }} position={[0, 0, 0]} />
        <WindowFrame x={1.55} y={0.85} w={1.5} h={1.55} />
      </group>
      {/* La luce fuori dalla finestra */}
      <mesh position={[-3.4, 1.8, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[6, 4]} />
        <meshBasicMaterial color="#fffaf0" toneMapped={false} />
      </mesh>

      {/* Battiscopa */}
      <mesh position={[0.5, 0.05, -1.985]} receiveShadow castShadow>
        <boxGeometry args={[8, 0.1, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>

      {/* Porta: stipiti, anta con la finitura, maniglia */}
      <group>
        <DoorCasing />
        <mesh position={[DOOR.x, DOOR.h / 2, DOOR.z + 0.02]} castShadow receiveShadow material={doorMat}>
          <boxGeometry args={[DOOR.w, DOOR.h, 0.04]} />
        </mesh>
        <mesh position={[DOOR.x + DOOR.w / 2 - 0.1, 1.02, DOOR.z + 0.07]} rotation-z={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.13, 16]} />
          <meshStandardMaterial color="#c9c4bb" metalness={1} roughness={0.25} />
        </mesh>
        <mesh position={[DOOR.x + DOOR.w / 2 - 0.1, 1.02, DOOR.z + 0.045]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.012, 24]} />
          <meshStandardMaterial color="#c9c4bb" metalness={1} roughness={0.3} />
        </mesh>
      </group>

      {/* Spatola: plastica bianca con feltro rosso, come quelle di WOW */}
      <group ref={spatula} rotation={[0.35, 0.25, Math.PI / 4]} visible={false}>
        <mesh castShadow>
          <boxGeometry args={[0.32, 0.11, 0.014]} />
          <meshPhysicalMaterial color="#fafafa" roughness={0.25} clearcoat={0.6} transmission={0.15} thickness={0.01} />
        </mesh>
        <mesh position={[0, -0.058, 0]}>
          <boxGeometry args={[0.32, 0.012, 0.016]} />
          <meshStandardMaterial color="#c01818" roughness={0.95} />
        </mesh>
      </group>

      {/* Una panca bassa sotto la finestra, per dare scala */}
      <mesh position={[-2.1, 0.22, 0.6]} castShadow receiveShadow>
        <boxGeometry args={[0.45, 0.44, 1.4]} />
        <meshStandardMaterial color="#e4ddd2" roughness={0.8} />
      </mesh>
    </>
  );
}

function WallWithHole({
  width,
  height,
  hole,
  position,
}: {
  width: number;
  height: number;
  hole: { x: number; w: number; h: number; y?: number };
  position: [number, number, number];
}) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(width / 2, height);
    s.lineTo(-width / 2, height);
    s.closePath();
    const y0 = hole.y ?? 0;
    const h = new THREE.Path();
    h.moveTo(hole.x - hole.w / 2, y0);
    h.lineTo(hole.x - hole.w / 2, y0 + hole.h);
    h.lineTo(hole.x + hole.w / 2, y0 + hole.h);
    h.lineTo(hole.x + hole.w / 2, y0);
    h.closePath();
    s.holes.push(h);
    return new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
  }, [width, height, hole.x, hole.w, hole.h, hole.y]);
  return (
    <mesh geometry={geo} position={[position[0], position[1], position[2] - 0.12]} castShadow receiveShadow>
      <meshStandardMaterial color={WALL} roughness={0.95} />
    </mesh>
  );
}

function WindowFrame({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const bar = 0.05;
  const mat = <meshStandardMaterial color="#ffffff" roughness={0.4} />;
  const pieces: [number, number, number, number][] = [
    [x, y + bar / 2, w, bar],
    [x, y + h - bar / 2, w, bar],
    [x - w / 2 + bar / 2, y + h / 2, bar, h],
    [x + w / 2 - bar / 2, y + h / 2, bar, h],
    [x, y + h / 2, 0.04, h],
    [x, y + h * 0.62, w, 0.035],
  ];
  return (
    <group position={[0, 0, -0.06]}>
      {pieces.map(([px, py, pw, ph], i) => (
        <mesh key={i} position={[px, py, 0]} castShadow receiveShadow>
          <boxGeometry args={[pw, ph, 0.07]} />
          {mat}
        </mesh>
      ))}
      <mesh position={[x - w / 2 - 0.03, y + h + 0.03, 0.08]} castShadow>
        <boxGeometry args={[0.02, 0.02, 0.02]} />
        {mat}
      </mesh>
    </group>
  );
}

function DoorCasing() {
  const t = 0.075;
  const mat = <meshStandardMaterial color="#ffffff" roughness={0.45} />;
  return (
    <group position={[DOOR.x, 0, DOOR.z + 0.01]}>
      <mesh position={[-DOOR.w / 2 - t / 2, DOOR.h / 2 + t / 2, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[t, DOOR.h + t, 0.03]} />
        {mat}
      </mesh>
      <mesh position={[DOOR.w / 2 + t / 2, DOOR.h / 2 + t / 2, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[t, DOOR.h + t, 0.03]} />
        {mat}
      </mesh>
      <mesh position={[0, DOOR.h + t / 2, 0.01]} castShadow receiveShadow>
        <boxGeometry args={[DOOR.w + t * 2, t, 0.03]} />
        {mat}
      </mesh>
    </group>
  );
}
