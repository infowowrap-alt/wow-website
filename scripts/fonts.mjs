// Copia in public/fonts/ solo i file woff2 latini che il sito usa, dai pacchetti
// @fontsource (licenze OFL e Apache 2.0). Niente font da CDN di terzi (GDPR).
// Massimo 4 file per mondo: Inter Tight è in comune.
//   node scripts/fonts.mjs
import fs from "node:fs";
import path from "node:path";

const FILES = {
  // Interior
  "fraunces.woff2": "@fontsource-variable/fraunces/files/fraunces-latin-full-normal.woff2",
  "fraunces-italic.woff2": "@fontsource-variable/fraunces/files/fraunces-latin-full-italic.woff2",
  "permanent-marker.woff2": "@fontsource/permanent-marker/files/permanent-marker-latin-400-normal.woff2",
  // In comune
  "inter-tight.woff2": "@fontsource-variable/inter-tight/files/inter-tight-latin-wght-normal.woff2",
  // Garage
  "big-shoulders-display.woff2": "@fontsource-variable/big-shoulders-display/files/big-shoulders-display-latin-wght-normal.woff2",
  "chakra-petch-500.woff2": "@fontsource/chakra-petch/files/chakra-petch-latin-500-normal.woff2",
  "instrument-serif.woff2": "@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2",
};

const out = path.join(process.cwd(), "public/fonts");
fs.mkdirSync(out, { recursive: true });
for (const [name, src] of Object.entries(FILES)) {
  const from = path.join(process.cwd(), "node_modules", src);
  fs.copyFileSync(from, path.join(out, name));
  console.log(`✓ ${name} ${(fs.statSync(from).size / 1024).toFixed(0)} KB`);
}
