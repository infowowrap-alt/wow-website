// Porta le foto Instagram scelte (content/instagram.json → "select") dentro
// materiale/da-instagram/<mondo>/<progetto>/ e nel catalogo content/media.json.
// Servono per i lavori che non hanno originali (soprattutto 2024-2025).
//
//   npm run instagram -- --from <cartella>   (cartella scritta da instagram-download.mjs)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { ROOT, MATERIALE, loadCatalog, saveCatalog } from "./catalog.mjs";

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "content/instagram.json"), "utf8"));
const fromArg = process.argv.indexOf("--from");
if (fromArg < 0) {
  console.error("Uso: npm run instagram -- --from <cartella di instagram-download.mjs>");
  process.exit(1);
}
const dir = process.argv[fromArg + 1];
const index = JSON.parse(fs.readFileSync(path.join(dir, "_instagram.json"), "utf8"));

const catalog = loadCatalog();
const byId = new Map(catalog.items.map((i) => [i.id, i]));
let added = 0, updated = 0;
const problems = [];
for (const sel of manifest.select) {
  const source = path.join(dir, sel.file);
  if (!fs.existsSync(source)) {
    problems.push(`${sel.file}: non scaricato`);
    continue;
  }
  const code = sel.file.split("-").slice(3, -1).join("-");
  const post = index[code]?.post ?? null;
  const destDir = path.join(MATERIALE, "da-instagram", sel.world, sel.project);
  const dest = path.join(destDir, `ig-${sel.file}`);
  fs.mkdirSync(destDir, { recursive: true });
  if (!fs.existsSync(dest)) fs.copyFileSync(source, dest);
  const { width = 0 } = await sharp(dest).metadata();

  const { file, ...hand } = sel;
  const entry = {
    kind: "image", source: "instagram", post,
    src: path.relative(ROOT, dest).split(path.sep).join("/"),
    phase: null, alt: null, credits: null, people: "da-confermare", overlay: false,
    quality: width >= 1400 ? "media" : "bassa", score: null, uses: [], ai: false,
    ...hand,
  };
  const prev = byId.get(sel.id);
  if (prev) {
    Object.assign(prev, entry);
    updated++;
  } else {
    catalog.items.push(entry);
    byId.set(sel.id, entry);
    added++;
  }
}
saveCatalog(catalog);
console.log(`Instagram: ${added} voci nuove, ${updated} aggiornate.`);
if (problems.length) {
  console.log("Problemi:");
  for (const p of problems) console.log(`  - ${p}`);
  process.exitCode = 1;
}
