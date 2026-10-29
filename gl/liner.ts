import * as THREE from "three";

// Carta siliconata, il retro della pellicola: grigio chiaro, griglia di taglio
// e la scritta del produttore ripetuta a righe sfalsate, come le carte di
// supporto vere. È tipografia (Inter Tight), non il logo. La texture si ripete
// senza giunte: righe e scritte hanno un periodo che divide il lato del canvas.
const TEXT = "WOW · L’ARTIGIANO DELLE PELLICOLE · ";
const SIZE = 1024;
const ROWS = 8;
const GRID = 32;

let cached: Promise<THREE.CanvasTexture> | null = null;

export function linerTexture(): Promise<THREE.CanvasTexture> {
  cached ??= draw();
  return cached;
}

async function draw(): Promise<THREE.CanvasTexture> {
  try {
    await document.fonts.load('700 24px "Inter Tight"');
  } catch {
    // Senza font si usa il sans di sistema: la carta resta credibile.
  }
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const g = c.getContext("2d")!;
  g.fillStyle = "#e9e7e3";
  g.fillRect(0, 0, SIZE, SIZE);

  for (let i = 0; i < SIZE; i += GRID) {
    const major = i % (GRID * 4) === 0;
    g.fillStyle = major ? "rgba(150,144,136,0.40)" : "rgba(150,144,136,0.15)";
    g.fillRect(i, 0, major ? 2 : 1, SIZE);
    g.fillRect(0, i, SIZE, major ? 2 : 1);
  }

  g.font = '700 24px "Inter Tight", Arial, sans-serif';
  g.textBaseline = "middle";
  g.fillStyle = "#c2bdb5";
  const w = g.measureText(TEXT).width;
  const reps = Math.max(1, Math.round(SIZE / w));
  const sx = SIZE / (reps * w);
  const rowH = SIZE / ROWS;
  for (let r = 0; r < ROWS; r++) {
    g.save();
    g.translate(r % 2 ? -SIZE / reps / 2 : 0, rowH * (r + 0.5));
    g.scale(sx, 1);
    for (let k = -1; k <= reps + 1; k++) g.fillText(TEXT, k * w, 0);
    g.restore();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}
