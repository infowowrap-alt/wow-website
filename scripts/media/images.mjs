// Pipeline immagini: legge materiale/, aggiorna content/media.json e scrive
// public/media/<id>/<larghezza>.avif|.webp più un segnaposto sfocato.
// Gli originali in materiale/ non vengono mai modificati.
//
//   npm run media            elabora solo ciò che è cambiato
//   npm run media -- --force rigenera tutto
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import {
  ROOT, MATERIALE, OUT, IMAGE_EXT, loadCatalog, saveCatalog, walk, placeOf, slug, sourcesOf, hashOf, uniqueId, uploadInfo,
} from "./catalog.mjs";

const WIDTHS = [640, 1280, 1920, 2560];
const PIPELINE = 2; // da incrementare quando cambiano qualità o misure
const force = process.argv.includes("--force");

const catalog = loadCatalog();
const byId = new Map(catalog.items.map((i) => [i.id, i]));
const taken = new Set(byId.keys());

// 1. Voci nuove per i file non ancora catalogati (da rivedere a mano).
const covered = new Set();
for (const item of catalog.items) for (const s of sourcesOf(item, byId)) covered.add(s);
const added = [];
for (const abs of walk(MATERIALE)) {
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  if (!IMAGE_EXT.has(path.extname(rel).toLowerCase()) || covered.has(rel)) continue;
  const { world, project, source } = placeOf(rel);
  const id = uniqueId(slug(`${world}-${project}-${path.basename(rel, path.extname(rel))}`), taken);
  const item = {
    id, world, project, kind: "image", source, post: null, src: rel,
    phase: null, alt: null, credits: null, people: "da-confermare", overlay: false,
    quality: source === "instagram" ? "bassa" : "alta", score: null, uses: [], review: true, ai: false,
    ...uploadInfo(rel),
  };
  catalog.items.push(item);
  byId.set(id, item);
  added.push(id);
}

// 2. Elaborazione.
// sharp non decodifica HEIC (HEVC) né DNG: per quelli passa da ImageMagick.
const VIA_MAGICK = new Set([".heic", ".heif", ".dng"]);
function open(file) {
  const abs = path.join(ROOT, file);
  const head = fs.readFileSync(abs).subarray(4, 12).toString("latin1");
  const heif = head.startsWith("ftyp") && /hei|mif1|msf1/.test(head.slice(4));
  if (!heif && !VIA_MAGICK.has(path.extname(file).toLowerCase())) return sharp(abs).rotate();
  const png = execFileSync("convert", [abs, "-auto-orient", "-depth", "8", "png:-"], { maxBuffer: 1 << 30 });
  return sharp(png);
}

async function render(item) {
  const files = sourcesOf(item, byId);
  let img;
  if (item.derive?.type === "hstack") {
    const height = item.derive.height ?? 1250;
    const panels = await Promise.all(
      files.map((f) => open(f).resize({ height }).toBuffer({ resolveWithObject: true })),
    );
    const width = panels.reduce((s, p) => s + p.info.width, 0);
    let x = 0;
    const composite = panels.map((p) => {
      const c = { input: p.data, left: x, top: 0 };
      x += p.info.width;
      return c;
    });
    const buf = await sharp({ create: { width, height, channels: 3, background: "#ffffff" } })
      .composite(composite).png().toBuffer();
    img = sharp(buf);
  } else {
    img = open(files[0]);
  }
  if (item.crop) {
    const [left, top, width, height] = item.crop;
    img = sharp(await img.extract({ left, top, width, height }).toBuffer());
  }
  if (item.trim) img = sharp(await img.trim({ threshold: 24 }).toBuffer());
  const buf = await img.toColourspace("srgb").toBuffer();
  const meta = await sharp(buf).metadata();
  return { buf, width: meta.width, height: meta.height };
}

// AVIF fino a 1920 (2560 solo per le foto da hero e copertina); WebP è la riserva
// per i pochi browser senza AVIF, quindi basta fino a 1280.
const HERO_USES = /^(hero|case-cover)/;
function widthsFor(w, max) {
  const list = WIDTHS.filter((x) => x < w && x <= max);
  list.push(Math.min(w, max));
  return [...new Set(list)];
}

let done = 0, skipped = 0;
async function processItem(item) {
  const files = sourcesOf(item, byId);
  const missing = files.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length) {
    console.warn(`! ${item.id}: file mancanti ${missing.join(", ")}`);
    return;
  }
  const hero = (item.uses ?? []).some((u) => HERO_USES.test(u));
  const hash = hashOf(files, { derive: item.derive, crop: item.crop, trim: item.trim, hero, PIPELINE });
  const dir = path.join(OUT, item.id);
  const complete = item.variants?.every((w) => fs.existsSync(path.join(dir, `${w}.avif`)))
    && item.webp?.every((w) => fs.existsSync(path.join(dir, `${w}.webp`)));
  if (!force && item.hash === hash && complete) {
    skipped++;
    return;
  }
  const { buf, width, height } = await render(item);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const variants = widthsFor(width, hero ? 2560 : 1920);
  const webp = widthsFor(width, 1280);
  await Promise.all([
    ...variants.map((w) => sharp(buf).resize({ width: w, withoutEnlargement: true }).avif({ quality: 52, effort: 3 }).toFile(path.join(dir, `${w}.avif`))),
    ...webp.map((w) => sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 4 }).toFile(path.join(dir, `${w}.webp`))),
  ]);
  const blur = await sharp(buf).resize({ width: 24 }).webp({ quality: 45 }).toBuffer();
  const { dominant } = await sharp(buf).stats();
  const hex = "#" + [dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, "0")).join("");
  Object.assign(item, {
    width, height,
    aspect: Math.round((width / height) * 1000) / 1000,
    orientation: width > height * 1.05 ? "orizzontale" : height > width * 1.05 ? "verticale" : "quadrata",
    color: hex,
    blur: `data:image/webp;base64,${blur.toString("base64")}`,
    variants,
    webp,
    hash,
  });
  done++;
  console.log(`✓ ${item.id} ${width}×${height} → ${variants.join(", ")}`);
}

const queue = catalog.items.filter((i) => i.kind === "image" && i.export !== false);
const failed = [];
const workers = Array.from({ length: Math.max(1, os.availableParallelism() - 1) }, async () => {
  while (queue.length) {
    const item = queue.shift();
    try {
      await processItem(item);
    } catch (e) {
      failed.push(item.id);
      console.warn(`✗ ${item.id}: ${String(e.message).split("\n")[0]}`);
    }
  }
});
await Promise.all(workers);
if (failed.length) process.exitCode = 1;

// 3. Uscite delle voci non più pubblicate, e cartelle senza voce nel catalogo.
for (const item of catalog.items.filter((i) => i.export === false)) {
  fs.rmSync(path.join(OUT, item.id), { recursive: true, force: true });
}
if (fs.existsSync(OUT)) {
  const ids = new Set(catalog.items.map((i) => i.id));
  for (const clip of catalog.items.flatMap((i) => i.clips ?? [])) ids.add(clip.id);
  const orphans = fs.readdirSync(OUT).filter((d) => !d.startsWith(".") && !ids.has(d));
  if (orphans.length) console.warn(`! cartelle in public/media senza voce: ${orphans.join(", ")}`);
}

saveCatalog(catalog);
const review = catalog.items.filter((i) => i.review).map((i) => i.id);
console.log(`\nImmagini elaborate: ${done}, invariate: ${skipped}, nuove voci: ${added.length}.`);
if (review.length) console.log(`Da rivedere a mano (fase, alt, persone): ${review.join(", ")}`);
