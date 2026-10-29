import * as THREE from "three";

// Texture procedurali per le scene: finiture d'esempio per la porta della hero
// (legno, cemento, stucco, bianco opaco) e il parquet. Sono generiche, non
// prodotti di catalogo: nessun nome o codice di finitura (quelli veri li dà Paolo).

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** Rumore a valori su griglia, ripetibile, con interpolazione morbida. */
function makeNoise(seed: number) {
  const r = rng(seed);
  const N = 256;
  const perm = new Float32Array(N * N).map(() => r());
  const at = (x: number, y: number) => perm[(((y % N) + N) % N) * N + (((x % N) + N) % N)];
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

function fbm(n: (x: number, y: number) => number, x: number, y: number, oct = 4) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) {
    s += a * n(x * f, y * f);
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}

function canvasTexture(w: number, h: number, paint: (x: number, y: number) => [number, number, number]) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  const img = g.createImageData(w, h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const [r, gg, b] = paint(x, y);
      const i = (y * w + x) * 4;
      img.data[i] = r;
      img.data[i + 1] = gg;
      img.data[i + 2] = b;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number) => Math.max(0, Math.min(255, v));
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

export type Finish = { id: string; label: string; texture: THREE.Texture; roughness: number };

/** Le finiture d'esempio della porta, nell'ordine in cui la spatola le stende. */
export function doorFinishes(): Finish[] {
  const W = 384, H = 768;
  const n1 = makeNoise(7), n2 = makeNoise(19), n3 = makeNoise(31);

  const wood = canvasTexture(W, H, (x, y) => {
    // Venatura verticale di un noce: anelli deformati dal rumore, fiamme lente.
    const warp = fbm(n1, x * 0.012, y * 0.002, 4) * 36;
    const ring = Math.sin((x + warp) * 0.19 + fbm(n2, x * 0.02, y * 0.01) * 3);
    const fine = fbm(n3, x * 0.6, y * 0.02, 2);
    const t = 0.5 + 0.5 * ring;
    const [a, b] = [hex("#5a3b26"), hex("#8a6040")];
    const k = mix(0.82, 1.08, fine);
    return [clamp(mix(a[0], b[0], t) * k), clamp(mix(a[1], b[1], t) * k), clamp(mix(a[2], b[2], t) * k)];
  });

  const concrete = canvasTexture(W, H, (x, y) => {
    const base = fbm(n1, x * 0.01, y * 0.01, 5);
    const pores = n2(x * 0.9, y * 0.9) > 0.93 ? -38 : 0;
    const v = 120 + base * 70 + (n3(x * 0.25, y * 0.25) - 0.5) * 18 + pores;
    return [clamp(v), clamp(v - 3), clamp(v - 8)];
  });

  const stucco = canvasTexture(W, H, (x, y) => {
    // Stucco a spatola: nuvole morbide e qualche passata più chiara.
    const cloud = fbm(n2, x * 0.006, y * 0.006, 5);
    const pass = Math.pow(Math.abs(Math.sin(fbm(n1, x * 0.004, y * 0.012, 3) * 9)), 8) * 0.25;
    const [a, b] = [hex("#cbbda8"), hex("#ece4d6")];
    const t = Math.min(1, cloud * 1.1 + pass);
    return [clamp(mix(a[0], b[0], t)), clamp(mix(a[1], b[1], t)), clamp(mix(a[2], b[2], t))];
  });

  const white = canvasTexture(W / 2, H / 2, (x, y) => {
    const v = 236 + (n3(x * 0.8, y * 0.8) - 0.5) * 5;
    return [clamp(v), clamp(v - 1), clamp(v - 4)];
  });

  return [
    { id: "legno", label: "Legno", texture: wood, roughness: 0.62 },
    { id: "cemento", label: "Cemento", texture: concrete, roughness: 0.9 },
    { id: "stucco", label: "Stucco", texture: stucco, roughness: 0.45 },
    { id: "bianco", label: "Bianco opaco", texture: white, roughness: 0.85 },
  ];
}

/** Parquet di rovere chiaro a doghe, per il pavimento della stanza. */
export function oakFloor(): THREE.Texture {
  const W = 1024, H = 1024, plank = 128;
  const n1 = makeNoise(3), n2 = makeNoise(11);
  const r = rng(5);
  const shades = Array.from({ length: 64 }, () => 0.9 + r() * 0.18);
  const offsets = Array.from({ length: 64 }, () => Math.floor(r() * H));
  const t = canvasTexture(W, H, (x, y) => {
    const col = Math.floor(x / plank);
    const yy = (y + offsets[col]) % H;
    const row = Math.floor(yy / 512);
    const id = (col * 7 + row * 3) % 64;
    const warp = fbm(n1, x * 0.02, yy * 0.003, 3) * 20;
    const grain = 0.5 + 0.5 * Math.sin((x + warp) * 0.35 + id);
    const fine = fbm(n2, x * 0.4, yy * 0.01, 2);
    const seam = x % plank < 2 || yy % 512 < 2 ? 0.72 : 1;
    const [a, b] = [hex("#b89468"), hex("#d6b78c")];
    const k = shades[id] * mix(0.9, 1.06, fine) * seam;
    return [clamp(mix(a[0], b[0], grain) * k), clamp(mix(a[1], b[1], grain) * k), clamp(mix(a[2], b[2], grain) * k)];
  });
  return t;
}

/** Sfumatura radiale (alone delle luci, ombra sotto l'auto). */
export function radialTexture(inner = "rgba(255,255,255,1)", outer = "rgba(255,255,255,0)"): THREE.Texture {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, inner);
  grd.addColorStop(1, outer);
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
