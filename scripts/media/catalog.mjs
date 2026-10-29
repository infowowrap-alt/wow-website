// Funzioni comuni a images.mjs, video.mjs e import-uploads.mjs:
// lettura e scrittura di content/media.json e scansione di materiale/.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const ROOT = process.cwd();
export const CATALOG = path.join(ROOT, "content/media.json");
export const MATERIALE = path.join(ROOT, "materiale");
export const OUT = path.join(ROOT, "public/media");

export const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".avif", ".heic", ".heif"]);
export const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".webm"]);
const WORLD_ORDER = ["interior", "garage", "officina", "campionario", "eventi"];

// Campi scritti a mano, nell'ordine in cui compaiono nel file.
const HAND_FIELDS = [
  "id", "world", "project", "kind", "source", "post", "src", "srcs", "derive", "crop", "trim", "derivedNote",
  "phase", "alt", "credits", "people", "overlay", "quality", "score", "uses", "note", "export", "review", "ai", "ai_note",
  "upload", "clips",
];

export function loadCatalog() {
  if (!fs.existsSync(CATALOG)) return { $note: "", items: [] };
  return JSON.parse(fs.readFileSync(CATALOG, "utf8"));
}

export function saveCatalog(catalog) {
  const rank = (w) => (WORLD_ORDER.includes(w) ? WORLD_ORDER.indexOf(w) : 99);
  catalog.items.sort((a, b) => rank(a.world) - rank(b.world) || String(a.project).localeCompare(String(b.project)));
  const ordered = catalog.items.map((item) => {
    const out = {};
    for (const k of HAND_FIELDS) if (k in item) out[k] = item[k];
    for (const k of Object.keys(item)) if (!(k in out)) out[k] = item[k];
    return out;
  });
  fs.writeFileSync(CATALOG, JSON.stringify({ ...catalog, items: ordered }, null, 2) + "\n");
}

export function slug(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out.sort();
}

// materiale/<mondo>/<progetto>/file oppure materiale/da-instagram/<mondo>/<progetto>/file
export function placeOf(rel) {
  const parts = rel.split("/");
  const fromIg = parts[1] === "da-instagram";
  const [world, project] = fromIg ? [parts[2], parts[3]] : [parts[1], parts[2]];
  return { world, project: parts.length > (fromIg ? 4 : 3) ? project : "vari", source: fromIg ? "instagram" : "originale" };
}

// Risolve "srcs": "@altro-id" nell'elenco di file dell'altra voce.
export function sourcesOf(item, byId) {
  let srcs = item.srcs ?? (item.src ? [item.src] : []);
  if (typeof srcs === "string" && srcs.startsWith("@")) {
    const ref = byId.get(srcs.slice(1));
    if (!ref) throw new Error(`${item.id}: riferimento ${srcs} non trovato`);
    srcs = sourcesOf(ref, byId);
  }
  return srcs;
}

export function hashOf(files, extra) {
  const h = crypto.createHash("sha1");
  for (const f of files) h.update(fs.readFileSync(path.join(ROOT, f)));
  h.update(JSON.stringify(extra));
  return h.digest("hex").slice(0, 16);
}

// Dati inseriti da Paolo nella pagina di caricamento (scritti da import-uploads.mjs
// in materiale/<mondo>/<progetto>/_caricamenti.json), per precompilare le voci nuove.
const PEOPLE_FROM_UPLOAD = { nessuno: "nessuno", ok: "cliente-ok", no: "cliente" };
export function uploadInfo(rel) {
  const sidecar = path.join(ROOT, path.dirname(rel), "_caricamenti.json");
  if (!fs.existsSync(sidecar)) return null;
  const entry = JSON.parse(fs.readFileSync(sidecar, "utf8")).find((e) => e.file === path.basename(rel));
  if (!entry) return null;
  return {
    phase: entry.phase && entry.phase !== "misto" ? entry.phase : null,
    people: PEOPLE_FROM_UPLOAD[entry.faces] ?? "da-confermare",
    note: entry.note || undefined,
    upload: { id: entry.uploadId, at: entry.uploadedAt, takenAt: entry.lastModified ?? null },
  };
}

export function uniqueId(base, taken) {
  let id = base;
  for (let i = 2; taken.has(id); i++) id = `${base}-${i}`;
  taken.add(id);
  return id;
}
