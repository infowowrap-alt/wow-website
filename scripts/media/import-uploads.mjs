// Importa in materiale/ quello che Paolo ha caricato dalla pagina "Materiale WOW".
//
//   npm run import:uploads -- --db <cartella> --assets <cartella>
//
// --db      le schede scaricate dalla raccolta "uploads" della pagina
//           (un file JSON per caricamento)
// --assets  i file scaricati dalla pagina, chiamati con l'id dell'asset
//           (es. 3f2a...e1.mp4)
//
// I video grandi arrivano a pezzi: li ricompone nell'ordine giusto e controlla
// la dimensione. Scrive l'originale in materiale/<mondo>/<progetto>/ e le note
// di Paolo (fase, volti, note) in _caricamenti.json nella stessa cartella.
import fs from "node:fs";
import path from "node:path";
import { ROOT, MATERIALE, walk, slug } from "./catalog.mjs";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : null;
}
const dbDir = arg("--db");
const assetsDir = arg("--assets");
if (!dbDir || !assetsDir) {
  console.error("Uso: npm run import:uploads -- --db <cartella-schede> --assets <cartella-file>");
  process.exit(1);
}

const assetFiles = new Map();
for (const f of walk(assetsDir)) assetFiles.set(path.basename(f).split(".")[0], f);

const EXT_BY_TYPE = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif", "video/mp4": ".mp4", "video/webm": ".webm" };
const SAFE_WORLDS = new Set(["interior", "garage", "officina", "campionario", "eventi"]);

let imported = 0, skipped = 0;
const problems = [];
for (const file of walk(dbDir).filter((f) => f.endsWith(".json"))) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  const doc = raw.data && typeof raw.data === "object" ? raw.data : raw;
  const uploadId = raw.id ?? path.basename(file, ".json");
  const world = SAFE_WORLDS.has(doc.world) ? doc.world : "vari";
  const project = slug(doc.project || "senza-progetto") || "senza-progetto";

  const parts = (doc.parts ?? []).map((id) => assetFiles.get(id));
  if (!parts.length || parts.some((p) => !p)) {
    problems.push(`${doc.name}: mancano dei pezzi (${(doc.parts ?? []).length} attesi)`);
    continue;
  }
  const buf = Buffer.concat(parts.map((p) => fs.readFileSync(p)));
  if (doc.storedSize && buf.length !== doc.storedSize) {
    problems.push(`${doc.name}: ${buf.length} byte invece di ${doc.storedSize}`);
    continue;
  }

  // Nome: quello originale, con l'estensione giusta se la pagina l'ha convertito (HEIC → JPEG).
  const original = path.basename(String(doc.name || uploadId));
  let ext = path.extname(original).toLowerCase();
  if (doc.converted || !ext) ext = EXT_BY_TYPE[doc.type] ?? ext;
  const base = slug(path.basename(original, path.extname(original))) || uploadId;
  const dir = path.join(MATERIALE, world, project);
  fs.mkdirSync(dir, { recursive: true });

  const sidecarPath = path.join(dir, "_caricamenti.json");
  const sidecar = fs.existsSync(sidecarPath) ? JSON.parse(fs.readFileSync(sidecarPath, "utf8")) : [];
  if (sidecar.some((e) => e.uploadId === uploadId)) {
    skipped++;
    continue;
  }
  let name = `${base}${ext}`;
  for (let i = 2; fs.existsSync(path.join(dir, name)); i++) name = `${base}-${i}${ext}`;
  fs.writeFileSync(path.join(dir, name), buf);
  if (doc.lastModified) {
    const t = new Date(doc.lastModified);
    if (!Number.isNaN(t.getTime())) fs.utimesSync(path.join(dir, name), t, t);
  }
  sidecar.push({
    file: name, uploadId, originalName: doc.name, kind: doc.kind, phase: doc.phase ?? null, faces: doc.faces ?? null,
    note: doc.note || null, uploadedAt: doc.uploadedAt ?? null, lastModified: doc.lastModified ?? null,
    width: doc.width ?? null, height: doc.height ?? null, duration: doc.duration ?? null, converted: !!doc.converted,
  });
  fs.writeFileSync(sidecarPath, JSON.stringify(sidecar, null, 2) + "\n");
  imported++;
  console.log(`✓ ${path.relative(ROOT, path.join(dir, name))} (${(buf.length / 1048576).toFixed(1)} MB${parts.length > 1 ? `, ${parts.length} pezzi` : ""})`);
}

console.log(`\nImportati: ${imported}, già presenti: ${skipped}.`);
if (problems.length) {
  console.log("Problemi:");
  for (const p of problems) console.log(`  - ${p}`);
  process.exitCode = 1;
}
