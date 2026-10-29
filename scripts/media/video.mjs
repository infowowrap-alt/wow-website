// Pipeline video: dai video in materiale/ ricava loop muti di 6-10 s per hero e
// sezioni. Per ogni clip: MP4 H.264 e WebM VP9 a 1080 e 720 (lato corto),
// poster AVIF/WebP e segnaposto sfocato, in public/media/<id-clip>/.
//
// Le clip si definiscono a mano nel catalogo, dentro la voce del video:
//   "clips": [{ "id": "garage-ktm-reveal-loop", "start": 12.5, "duration": 8, "crop": "16:9" }]
// crop: "16:9", "9:16", "4:5" o assente (inquadratura originale).
// grade: filtro ffmpeg facoltativo per correggere riprese piatte.
// Se una voce nuova non ha clip, ne propone una da 8 s presa al 10% del video.
//
//   npm run video            elabora solo ciò che è cambiato
//   npm run video -- --force rigenera tutto
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
import {
  ROOT, MATERIALE, OUT, VIDEO_EXT, loadCatalog, saveCatalog, walk, placeOf, slug, hashOf, uniqueId, uploadInfo,
} from "./catalog.mjs";

const FFMPEG = process.env.FFMPEG ?? "ffmpeg";
const FFPROBE = process.env.FFPROBE ?? "ffprobe";
const MAX_HERO_BYTES = 3 * 1024 * 1024;
const PIPELINE = 1;
const force = process.argv.includes("--force");

function probe(file) {
  const out = execFileSync(FFPROBE, [
    "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation:format=duration",
    "-of", "json", file,
  ]).toString();
  const j = JSON.parse(out);
  const s = j.streams?.[0] ?? {};
  const rotation = Math.abs(Number(s.side_data_list?.find((d) => "rotation" in d)?.rotation ?? 0));
  const [w, h] = rotation === 90 || rotation === 270 ? [s.height, s.width] : [s.width, s.height];
  return { width: w, height: h, duration: Number(j.format?.duration ?? 0) };
}

function cropFilter(crop, w, h) {
  if (!crop) return null;
  const [a, b] = crop.split(":").map(Number);
  const target = a / b;
  if (Math.abs(w / h - target) < 0.01) return null;
  return w / h > target
    ? `crop=trunc(ih*${target}/2)*2:ih`
    : `crop=iw:trunc(iw/${target}/2)*2`;
}

function encode(input, clip, short, format, crf, outFile) {
  const { width, height } = clip._src;
  // grade: correzione facoltativa per riprese piatte (es. "eq=contrast=1.2:saturation=1.3"),
  // mai per cambiare i colori del lavoro.
  const filters = [cropFilter(clip.crop, width, height), clip.grade].filter(Boolean);
  const landscape = clip.crop ? Number(clip.crop.split(":")[0]) >= Number(clip.crop.split(":")[1]) : width >= height;
  filters.push(landscape ? `scale=-2:${short}` : `scale=${short}:-2`, "fps=30", "format=yuv420p");
  const codec = format === "mp4"
    ? ["-c:v", "libx264", "-preset", "slow", "-crf", String(crf), "-profile:v", "high", "-movflags", "+faststart"]
    : ["-c:v", "libvpx-vp9", "-b:v", "0", "-crf", String(crf + 10), "-row-mt", "1", "-deadline", "good", "-cpu-used", "2"];
  execFileSync(FFMPEG, [
    "-y", "-v", "error", "-ss", String(clip.start), "-t", String(clip.duration), "-i", input,
    "-an", "-vf", filters.join(","), ...codec, outFile,
  ]);
  return fs.statSync(outFile).size;
}

const catalog = loadCatalog();
const taken = new Set(catalog.items.flatMap((i) => [i.id, ...(i.clips ?? []).map((c) => c.id)]));
const known = new Set(catalog.items.filter((i) => i.kind === "video").map((i) => i.src));

for (const abs of walk(MATERIALE)) {
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  if (!VIDEO_EXT.has(path.extname(rel).toLowerCase()) || known.has(rel)) continue;
  const { world, project, source } = placeOf(rel);
  const id = uniqueId(slug(`${world}-${project}-${path.basename(rel, path.extname(rel))}`), taken);
  catalog.items.push({
    id, world, project, kind: "video", source, post: null, src: rel,
    phase: null, alt: null, credits: null, people: "da-confermare", overlay: false,
    quality: source === "instagram" ? "bassa" : "alta", score: null, uses: [], review: true, ai: false,
    ...uploadInfo(rel), clips: [],
  });
}

let done = 0, skipped = 0;
for (const item of catalog.items) {
  if (item.kind !== "video" || item.export === false) continue;
  const input = path.join(ROOT, item.src);
  if (!fs.existsSync(input)) {
    console.warn(`! ${item.id}: file mancante ${item.src}`);
    continue;
  }
  const src = probe(input);
  Object.assign(item, { width: src.width, height: src.height, duration: Math.round(src.duration * 10) / 10 });
  if (!item.clips?.length) {
    const duration = Math.min(8, Math.max(1, src.duration));
    const start = Math.max(0, Math.min(src.duration * 0.1, src.duration - duration));
    item.clips = [{ id: uniqueId(`${item.id}-loop`, taken), start: Math.round(start * 10) / 10, duration, review: true }];
  }
  for (const clip of item.clips) {
    const hash = hashOf([item.src], { start: clip.start, duration: clip.duration, crop: clip.crop, grade: clip.grade, PIPELINE });
    const dir = path.join(OUT, clip.id);
    if (!force && clip.hash === hash && fs.existsSync(path.join(dir, "1080.mp4"))) {
      skipped++;
      continue;
    }
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    clip._src = src;
    const shortSide = Math.min(src.width, src.height);
    const sizes = [1080, 720].filter((s) => s <= shortSide);
    if (!sizes.length) sizes.push(shortSide - (shortSide % 2));
    const sources = [];
    for (const s of sizes) {
      let crf = 23;
      let bytes = encode(input, clip, s, "mp4", crf, path.join(dir, `${s}.mp4`));
      while (s === sizes[0] && bytes > MAX_HERO_BYTES && crf < 32) {
        crf += 3;
        bytes = encode(input, clip, s, "mp4", crf, path.join(dir, `${s}.mp4`));
      }
      let wcrf = crf;
      bytes = encode(input, clip, s, "webm", wcrf, path.join(dir, `${s}.webm`));
      while (s === sizes[0] && bytes > MAX_HERO_BYTES && wcrf < crf + 12) {
        wcrf += 4;
        bytes = encode(input, clip, s, "webm", wcrf, path.join(dir, `${s}.webm`));
      }
      sources.push({ src: `/media/${clip.id}/${s}.webm`, type: "video/webm", width: s });
      sources.push({ src: `/media/${clip.id}/${s}.mp4`, type: "video/mp4", width: s });
    }
    delete clip._src;
    const posterPng = path.join(dir, "poster.png");
    execFileSync(FFMPEG, ["-y", "-v", "error", "-ss", String(clip.start + 0.4), "-i", path.join(dir, `${sizes[0]}.mp4`), "-frames:v", "1", posterPng]);
    const meta = await sharp(posterPng).metadata();
    await sharp(posterPng).avif({ quality: 50, effort: 4 }).toFile(path.join(dir, "poster.avif"));
    await sharp(posterPng).webp({ quality: 78 }).toFile(path.join(dir, "poster.webp"));
    const blur = await sharp(posterPng).resize({ width: 24 }).webp({ quality: 45 }).toBuffer();
    fs.rmSync(posterPng);
    Object.assign(clip, {
      width: meta.width, height: meta.height,
      poster: `/media/${clip.id}/poster`,
      blur: `data:image/webp;base64,${blur.toString("base64")}`,
      sources, hash,
    });
    done++;
    const mb = (fs.statSync(path.join(dir, `${sizes[0]}.mp4`)).size / 1048576).toFixed(1);
    console.log(`✓ ${clip.id} ${meta.width}×${meta.height} ${clip.duration}s, mp4 ${mb} MB`);
  }
}

saveCatalog(catalog);
console.log(`\nClip elaborate: ${done}, invariate: ${skipped}.`);
