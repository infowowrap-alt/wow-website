import * as THREE from "three";
import { linerTexture } from "../liner";

// La transizione tra i mondi (docs/SPEC-SITO.md §5), in three "puro" su un
// canvas fisso sopra le pagine, fuori dal router.
//
// Fase A, applicazione: la pellicola del mondo d'arrivo entra dall'angolo in
// alto a destra (lo stesso dell'interruttore di mondo) e una spatola la stende
// fino a coprire lo schermo. Davanti alla spatola la pellicola è ancora sollevata.
// Sotto la copertura avviene il cambio di pagina.
// Fase B, stacco: la pellicola si arriccia sul cilindro dall'angolo opposto e si
// ripiega su se stessa mostrando il retro (carta siliconata), con un'ombra
// morbida sulla pagina nuova.
//
// Lo spazio di lavoro è lo schermo: altezza 1, larghezza = aspect, origine al centro.

export type FilmLook = "interior" | "garage";

const VERT = /* glsl */ `
uniform float uAspect;
uniform float uPhase;   // 0 applicazione, 1 stacco
uniform float uFront;   // fase A: distanza del bordo dalla partenza
uniform float uLine;    // fase B: distanza della linea di piega dalla partenza
uniform float uR;       // raggio del cilindro
uniform vec2 uA0;       // angolo di partenza fase A
uniform vec2 uB0;       // angolo di partenza fase B
varying vec2 vScreen;
varying vec3 vNormal;
varying float vAhead;   // fase A: >0 davanti alla spatola
varying float vCurl;    // fase B: 0 piatto, 0..1 sul cilindro, >1 ripiegato

const float PI = 3.141592653589793;
const vec2 DA = vec2(-0.70710678, -0.70710678);
const vec2 DB = vec2(0.70710678, 0.70710678);

void main() {
  vec3 p = vec3(position.x * uAspect, position.y, 0.0);
  vScreen = p.xy;
  vec3 n = vec3(0.0, 0.0, 1.0);
  vAhead = -1.0;
  vCurl = 0.0;

  if (uPhase < 0.5) {
    float e = dot(p.xy - uA0, DA) - uFront;
    vAhead = e;
    if (e > 0.0) {
      // La parte non ancora stesa resta in aria, inclinata verso chi guarda.
      float lift = e * 0.55 + e * e * 1.6;
      p.z = lift;
      n = normalize(vec3(-DA * 0.55, 1.0));
    } else {
      // Una piccola onda subito dietro la spatola: l'aria che esce.
      float w = exp(-pow((e + 0.012) / 0.01, 2.0));
      p.z = w * 0.004;
    }
  } else {
    vec2 P = uB0 + DB * uLine;
    float s = dot(P - p.xy, DB);
    if (s > 0.0) {
      float th = s / uR;
      if (th < PI) {
        p.xy += DB * (s - uR * sin(th));
        p.z = uR * (1.0 - cos(th));
        n = vec3(DB * sin(th), cos(th));
        vCurl = th / PI;
      } else {
        p.xy += DB * (2.0 * s - PI * uR);
        p.z = 2.0 * uR;
        n = vec3(0.0, 0.0, -1.0);
        vCurl = 1.0 + (s - PI * uR);
      }
    }
  }
  vNormal = n;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

const FRAG = /* glsl */ `
uniform float uLook;     // 0 Interior, 1 Garage
uniform float uPhase;
uniform float uTime;
uniform sampler2D uLiner;
uniform float uLinerScale;
uniform vec3 uFilm;
uniform vec3 uSheen;
varying vec2 vScreen;
varying vec3 vNormal;
varying float vAhead;
varying float vCurl;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

void main() {
  if (uPhase < 0.5 && vAhead > 0.16) discard;
  vec3 L = normalize(vec3(-0.45, 0.65, 0.9));
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 n = normalize(gl_FrontFacing ? vNormal : -vNormal);
  vec3 H = normalize(L + V);
  float diff = clamp(dot(n, L), 0.0, 1.0);
  vec3 col;

  if (gl_FrontFacing) {
    // Fronte: la pellicola del mondo d'arrivo.
    vec3 base = uFilm;
    if (uLook < 0.5) {
      // Interior: carta opaca, grana fine.
      float grain = noise(vScreen * 900.0) * 0.035 + noise(vScreen * 60.0) * 0.02;
      base *= 0.97 + grain;
      float spec = pow(max(dot(n, H), 0.0), 24.0) * 0.18;
      col = base * (0.82 + 0.18 * diff) + spec;
    } else {
      // Garage: lucido profondo con scaglie metalliche.
      float flake = step(0.985, hash(floor(vScreen * 700.0))) * 0.35;
      float spec = pow(max(dot(n, H), 0.0), 90.0) * 0.9;
      float sheen = pow(1.0 - abs(n.z), 2.0);
      col = base * (0.7 + 0.3 * diff) + uSheen * (sheen * 0.6 + flake * 0.25) + spec;
    }
    if (uPhase < 0.5) {
      // Riflesso speculare della spatola che avanza.
      float edge = exp(-pow((vAhead + 0.004) / 0.006, 2.0));
      col += edge * 0.55;
      if (vAhead > 0.0) col *= mix(1.0, 0.82, smoothstep(0.0, 0.16, vAhead));
    }
    if (vCurl > 0.0 && vCurl <= 1.0) {
      // Sul cilindro la luce scivola: riflesso lungo la piega.
      col += pow(sin(vCurl * 3.14159), 6.0) * (uLook < 0.5 ? 0.12 : 0.35);
    }
  } else {
    // Retro: la carta siliconata.
    // Il lembo è ribaltato sulla diagonale: si campiona già ribaltato, così la scritta si legge dritta.
    vec3 liner = texture2D(uLiner, vec2(-vScreen.y, -vScreen.x) * uLinerScale).rgb;
    float shade = 0.78 + 0.22 * diff;
    if (vCurl <= 1.0) shade *= 0.85 + 0.15 * sin(vCurl * 3.14159);
    col = liner * shade;
  }
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

const SHADOW_VERT = /* glsl */ `
uniform float uAspect;
varying vec2 vScreen;
void main() {
  vScreen = vec2(position.x * uAspect, position.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(vScreen, -0.001, 1.0);
}
`;

const SHADOW_FRAG = /* glsl */ `
uniform float uLine;
uniform float uR;
uniform vec2 uB0;
varying vec2 vScreen;
const vec2 DB = vec2(0.70710678, 0.70710678);
void main() {
  vec2 P = uB0 + DB * uLine;
  float s = dot(P - vScreen, DB);
  // Ombra della piega sulla pagina appena scoperta, più forte vicino al cilindro.
  float a = s > 0.0 ? (1.0 - smoothstep(uR * 0.6, uR * 3.2, s)) * 0.32 : 0.0;
  gl_FragColor = vec4(0.0, 0.0, 0.0, a);
}
`;

// La spatola: plastica con il feltro sul bordo che lavora.
const SPATULA_VERT = /* glsl */ `
varying vec3 vLocal;
varying vec3 vN;
void main() {
  vLocal = position;
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const SPATULA_FRAG = /* glsl */ `
uniform vec3 uBody;
uniform vec3 uFelt;
uniform float uHalfW;
varying vec3 vLocal;
varying vec3 vN;
void main() {
  vec3 L = normalize(vec3(-0.45, 0.65, 0.9));
  float diff = 0.55 + 0.45 * clamp(dot(normalize(vN), L), 0.0, 1.0);
  float felt = 1.0 - step(-uHalfW * 0.55, vLocal.y);
  vec3 c = mix(uBody, uFelt, felt) * diff;
  float spec = pow(max(dot(normalize(vN), normalize(L + vec3(0, 0, 1))), 0.0), 40.0) * (1.0 - felt) * 0.5;
  gl_FragColor = vec4(c + spec, 1.0);
  #include <colorspace_fragment>
}
`;

const LOOKS: Record<FilmLook, { film: string; sheen: string; body: string; felt: string }> = {
  // Interior: carta calda; spatola bianca con feltro rosso.
  interior: { film: "#f5f2ec", sheen: "#ffffff", body: "#f2f2f2", felt: "#c01818" },
  // Garage: viola notte lucido con riflesso viola elettrico; spatola nera con feltro fluo.
  garage: { film: "#21152d", sheen: "#7c0ed7", body: "#1a1a1a", felt: "#e5ff00" },
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeIn = (t: number) => t * t * (1.4 - 0.4 * t);

// Solo per i controlli: ?filmslow=20 rallenta la pellicola di 20 volte.
const SLOW = typeof location !== "undefined" ? Number(new URLSearchParams(location.search).get("filmslow")) || 1 : 1;

function tween(ms: number, ease: (t: number) => number, step: (v: number) => void): Promise<void> {
  ms *= SLOW;
  return new Promise((resolve) => {
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      step(ease(t));
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
}

export class FilmTransition {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private uniforms: Record<string, THREE.IUniform>;
  private shadowUniforms: Record<string, THREE.IUniform>;
  private spatula: THREE.Mesh<THREE.BoxGeometry, THREE.ShaderMaterial>;
  private film: THREE.Mesh;
  private shadow: THREE.Mesh;
  private aspect = 1;
  private running = false;
  private raf = 0;

  constructor(private canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    const dist = 2;
    this.camera = new THREE.PerspectiveCamera((2 * Math.atan(0.5 / dist) * 180) / Math.PI, 1, 0.05, 10);
    this.camera.position.set(0, 0, dist);

    this.uniforms = {
      uAspect: { value: 1 },
      uPhase: { value: 0 },
      uFront: { value: 0 },
      uLine: { value: 0 },
      uR: { value: 0.085 },
      uA0: { value: new THREE.Vector2() },
      uB0: { value: new THREE.Vector2() },
      uLook: { value: 0 },
      uTime: { value: 0 },
      uLiner: { value: null },
      uLinerScale: { value: 1.25 },
      uFilm: { value: new THREE.Color() },
      uSheen: { value: new THREE.Color() },
    };
    const geo = new THREE.PlaneGeometry(1, 1, 220, 140);
    this.film = new THREE.Mesh(
      geo,
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: this.uniforms, side: THREE.DoubleSide }),
    );
    this.film.frustumCulled = false;

    this.shadowUniforms = { uAspect: this.uniforms.uAspect, uLine: this.uniforms.uLine, uR: this.uniforms.uR, uB0: this.uniforms.uB0 };
    this.shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      new THREE.ShaderMaterial({ vertexShader: SHADOW_VERT, fragmentShader: SHADOW_FRAG, uniforms: this.shadowUniforms, transparent: true, depthWrite: false }),
    );
    this.shadow.frustumCulled = false;
    this.shadow.renderOrder = -1;

    const halfW = 0.026;
    this.spatula = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, halfW * 2, 0.012, 1, 1, 1),
      new THREE.ShaderMaterial({
        vertexShader: SPATULA_VERT,
        fragmentShader: SPATULA_FRAG,
        uniforms: { uBody: { value: new THREE.Color() }, uFelt: { value: new THREE.Color() }, uHalfW: { value: halfW } },
      }),
    );
    this.scene.add(this.shadow, this.film, this.spatula);
    void linerTexture().then((t) => (this.uniforms.uLiner.value = t));
    this.resize();
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.aspect = w / h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();
    this.uniforms.uAspect.value = this.aspect;
    this.uniforms.uA0.value.set(this.aspect / 2, 0.5);
    this.uniforms.uB0.value.set(-this.aspect / 2, -0.5);
    // Il raggio della piega e la scala della carta seguono l'altezza dello schermo.
    this.uniforms.uLinerScale.value = h / 1024 / 1.1;
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private loop = () => {
    if (!this.running) return;
    this.uniforms.uTime.value = performance.now() / 1000;
    this.render();
    this.raf = requestAnimationFrame(this.loop);
  };

  /** Stende la pellicola, chiama `covered` (il cambio di pagina) e poi la stacca. */
  async play(look: FilmLook, covered: () => Promise<void>) {
    this.resize();
    const L = LOOKS[look];
    const u = this.uniforms;
    u.uLook.value = look === "garage" ? 1 : 0;
    (u.uFilm.value as THREE.Color).set(L.film);
    (u.uSheen.value as THREE.Color).set(L.sheen);
    const sm = this.spatula.material.uniforms;
    (sm.uBody.value as THREE.Color).set(L.body);
    (sm.uFelt.value as THREE.Color).set(L.felt);

    const diag = (this.aspect + 1) / Math.SQRT2; // da angolo ad angolo lungo la diagonale a 45°
    const DA = new THREE.Vector2(-Math.SQRT1_2, -Math.SQRT1_2);
    const T = new THREE.Vector2(Math.SQRT1_2, -Math.SQRT1_2);
    const A0 = u.uA0.value as THREE.Vector2;

    this.canvas.style.visibility = "visible";
    this.running = true;
    this.loop();

    // Fase A.
    u.uPhase.value = 0;
    this.spatula.visible = true;
    this.shadow.visible = false;
    await tween(720, easeInOut, (v) => {
      const f = -0.02 + v * (diag + 0.2);
      u.uFront.value = f;
      // La spatola sta sul bordo, nel punto più vicino al centro dello schermo, e scorre un po'.
      const onLine = A0.clone().addScaledVector(DA, f);
      const t = -onLine.dot(T) + Math.sin(v * Math.PI * 3) * 0.12;
      const pos = onLine.addScaledVector(T, t).addScaledVector(DA, -0.028);
      this.spatula.position.set(pos.x, pos.y, 0.03);
      this.spatula.rotation.set(0, 0, 0);
      this.spatula.rotateZ(-Math.PI / 4);
      this.spatula.rotateX(0.9);
    });
    this.spatula.visible = false;

    await covered();

    // Fase B.
    u.uPhase.value = 1;
    this.shadow.visible = true;
    const R = u.uR.value as number;
    await tween(940, easeIn, (v) => {
      u.uLine.value = -0.01 + v * (diag + Math.PI * R + 0.1);
    });

    this.running = false;
    cancelAnimationFrame(this.raf);
    this.renderer.clear();
    this.canvas.style.visibility = "hidden";
  }

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.renderer.dispose();
  }
}

/** Vero se il browser regge WebGL: altrimenti si usa la maschera CSS. */
export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
