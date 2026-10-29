// Scarica foto e video dei post Instagram pubblici di WOW, leggendo la pagina
// pubblica di ogni post (embed) per avere indirizzi sempre validi.
// L'elenco dei post viene da materiale/da-instagram/indice-post.json (o da un
// altro file con "posts": [{ permalink, date, caption }]). Scrive in <uscita>/:
//   <data>-<codice>-<n>.jpg|webp   (foto, o anteprima dei video)
//   <data>-<codice>-<n>.mp4   (video, solo con --videos)
//   _instagram.json           (indice: post, didascalia, file)
// I file già presenti vengono saltati, quindi si può rilanciare.
//
//   node scripts/media/instagram-download.mjs <uscita> [--videos] [--index file.json] [--only codice,codice]
//   (dietro un proxy: NODE_USE_ENV_PROXY=1)
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};
const withVideos = args.includes("--videos");
const indexFile = opt("--index") ?? "materiale/da-instagram/indice-post.json";
const only = opt("--only")?.split(",");
const outDir = args.find((a, i) => !a.startsWith("--") && !["--index", "--only"].includes(args[i - 1]));
if (!outDir) {
  console.error("Uso: node scripts/media/instagram-download.mjs <uscita> [--videos] [--index file.json] [--only codice,codice]");
  process.exit(1);
}
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// I dati del post sono in contextJSON (stringa JSON dentro un'altra stringa JSON).
// Per alcuni post con una sola foto i dati mancano: si prende la misura più
// grande dallo srcset dell'immagine incorporata.
function parseEmbed(html) {
  const m = html.match(/"contextJSON":("(?:[^"\\]|\\.)*")/);
  const ctx = m ? JSON.parse(JSON.parse(m[1])) : null;
  const media = ctx?.gql_data?.shortcode_media;
  if (!media) {
    const srcset = html.match(/class="EmbeddedMediaImage"[^>]*srcset="([^"]+)"/)?.[1];
    if (!srcset) return null;
    const best = srcset.replace(/&amp;/g, "&").split(",").map((s) => s.trim().split(/\s+/))
      .sort((a, b) => parseInt(b[1]) - parseInt(a[1]))[0];
    return [{ image: best[0], video: null, width: parseInt(best[1]) || null, height: null }];
  }
  const nodes = media.edge_sidecar_to_children?.edges?.map((e) => e.node) ?? [media];
  return nodes.map((n) => ({ image: n.display_url, video: n.is_video ? n.video_url : null, width: n.dimensions?.width, height: n.dimensions?.height }));
}

const posts = JSON.parse(fs.readFileSync(indexFile, "utf8")).posts.filter((p) => {
  const code = p.permalink.split("/").filter(Boolean).at(-1);
  return !only || only.includes(code);
});
fs.mkdirSync(outDir, { recursive: true });
const indexPath = path.join(outDir, "_instagram.json");
const index = fs.existsSync(indexPath) ? JSON.parse(fs.readFileSync(indexPath, "utf8")) : {};

async function download(url, dest) {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return true;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return false;
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return true;
}

let files = 0, missing = 0;
for (const p of posts) {
  const code = p.permalink.split("/").filter(Boolean).at(-1);
  const kind = p.permalink.includes("/reel/") ? "reel" : "p";
  let items = null;
  for (let attempt = 0; attempt < 3 && !items; attempt++) {
    const res = await fetch(`https://www.instagram.com/${kind}/${code}/embed/captioned/`, { headers: { "User-Agent": UA } });
    if (res.ok) items = parseEmbed(await res.text());
    if (!items) await sleep(2000 * (attempt + 1));
  }
  if (!items) {
    missing++;
    console.warn(`! ${code}: post non leggibile`);
    continue;
  }
  const entry = { post: p.permalink, date: p.date, caption: p.caption, world: p.world, project: p.project, media: [] };
  for (const [i, it] of items.entries()) {
    const base = `${p.date}-${code}-${String(i + 1).padStart(2, "0")}`;
    const m = { image: null, video: null, width: it.width ?? null, height: it.height ?? null };
    const ext = /\.webp(\?|$)/.test(new URL(it.image ?? "https://x/").pathname) ? ".webp" : ".jpg";
    if (it.image && (await download(it.image, path.join(outDir, `${base}${ext}`)))) m.image = `${base}${ext}`, files++;
    if (withVideos && it.video && (await download(it.video, path.join(outDir, `${base}.mp4`)))) m.video = `${base}.mp4`, files++;
    entry.media.push(m);
  }
  index[code] = entry;
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 1) + "\n");
  await sleep(700);
}
console.log(`Post letti: ${posts.length - missing}/${posts.length}, file: ${files}. Indice in ${indexPath}`);
