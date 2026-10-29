// Porta le foto scelte dall'album iCloud (content/album-icloud.json → "select")
// dentro materiale/<mondo>/<progetto>/ e nel catalogo content/media.json.
//
//   npm run album                       scarica le foto scelte e le importa
//   npm run album -- --from <cartella>  usa un download già fatto con icloud-album.mjs
//
// I campi scritti a mano nella selezione (fase, alt, persone, punteggio, usi, note)
// diventano la voce del catalogo; misure e varianti le aggiunge poi npm run media.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { ROOT, MATERIALE, loadCatalog, saveCatalog, slug } from "./catalog.mjs";

const MANIFEST = path.join(ROOT, "content/album-icloud.json");
const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const fromArg = process.argv.indexOf("--from");
const dir = fromArg > 0 ? process.argv[fromArg + 1] : path.join(ROOT, ".cache/album");

const select = manifest.select ?? [];
if (fromArg < 0) {
  // Scarica solo le foto scelte (gli URL dell'album scadono: si rileggono ogni volta).
  execFileSync(process.execPath, [
    path.join(ROOT, "scripts/media/icloud-album.mjs"), manifest.album, dir, "--only", select.map((s) => s.n).join(","),
  ], { stdio: "inherit", env: { ...process.env, NODE_USE_ENV_PROXY: "1" } });
}
const album = JSON.parse(fs.readFileSync(path.join(dir, "_album.json"), "utf8"));
const byN = new Map(album.items.map((x) => [x.n, x]));

// HEIF riconosciuto dal contenuto (alcuni file arrivano con estensione .jpg).
function isHeif(file) {
  const head = Buffer.alloc(12);
  const fd = fs.openSync(file, "r");
  fs.readSync(fd, head, 0, 12, 0);
  fs.closeSync(fd);
  return head.toString("latin1", 4, 8) === "ftyp" && /hei|mif1|msf1/.test(head.toString("latin1", 8, 12));
}
function decodes(file) {
  try {
    execFileSync("convert", [`${file}[0]`, "-resize", "64x64", "png:-"], { stdio: ["ignore", "pipe", "ignore"] });
    return true;
  } catch {
    return false;
  }
}

function place(n) {
  let best = null;
  for (const p of manifest.projects) {
    const [a, b] = p.range;
    if (n >= a && n <= b && (!best || b - a < best.range[1] - best.range[0])) best = p;
  }
  return best;
}

const catalog = loadCatalog();
const byId = new Map(catalog.items.map((i) => [i.id, i]));
let added = 0, updated = 0;
const problems = [];
for (const sel of select) {
  if (manifest.exclude?.[sel.n]) {
    problems.push(`${sel.n}: escluso (${manifest.exclude[sel.n]})`);
    continue;
  }
  const item = byN.get(sel.n);
  const where = sel.world && sel.project ? sel : place(sel.n);
  if (!item || !where) {
    problems.push(`${sel.n}: non trovato nell'album o senza progetto`);
    continue;
  }
  const source = path.join(dir, item.file);
  if (!fs.existsSync(source)) {
    problems.push(`${sel.n}: file non scaricato (${item.file})`);
    continue;
  }
  // Alcuni HEIC dell'iPhone (con mappa di profondità) non si decodificano con libheif:
  // in quel caso si usa l'anteprima JPEG che iCloud genera (circa 2048 px).
  let from = source;
  let ext = isHeif(source) ? ".heic" : path.extname(item.file).toLowerCase();
  let fallback = false;
  if (ext === ".heic" && !decodes(source)) {
    from = path.join(dir, "_anteprime", `${path.parse(item.file).name}.jpg`);
    ext = ".jpg";
    fallback = true;
    if (!fs.existsSync(from)) {
      problems.push(`${sel.n}: HEIC non decodificabile e anteprima mancante (lancia icloud-album.mjs --thumbs)`);
      continue;
    }
  }
  const name = `icloud-${String(sel.n).padStart(4, "0")}-${slug(path.parse(item.originalName).name)}${fallback ? "-anteprima" : ""}${ext}`;
  const destDir = path.join(MATERIALE, where.world, where.project);
  const dest = path.join(destDir, name);
  fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(dest) || fs.statSync(dest).size !== fs.statSync(from).size) fs.copyFileSync(from, dest);

  const { n, id, world, project, ...hand } = sel;
  const entry = {
    id, world: where.world, project: where.project, kind: "image", source: "originale",
    album: { n, takenAt: item.takenAt, originalName: item.originalName },
    src: path.relative(ROOT, dest).split(path.sep).join("/"),
    phase: null, alt: null, credits: null, people: "da-confermare", overlay: false, quality: fallback ? "media" : "alta", score: null, uses: [], ai: false,
    ...hand,
  };
  if (fallback) entry.note = [hand.note, "Originale HEIC non decodificabile: usata l'anteprima JPEG di iCloud (circa 2048 px)."].filter(Boolean).join(" ");
  const prev = byId.get(id);
  if (prev) {
    // Tiene i campi calcolati dalla pipeline, aggiorna quelli scritti a mano.
    Object.assign(prev, entry);
    updated++;
  } else {
    catalog.items.push(entry);
    byId.set(id, entry);
    added++;
  }
}
saveCatalog(catalog);
console.log(`Album: ${added} voci nuove, ${updated} aggiornate.`);
if (problems.length) {
  console.log("Problemi:");
  for (const p of problems) console.log(`  - ${p}`);
  process.exitCode = 1;
}
