// Scarica un album condiviso di iCloud Foto (link https://photos.icloud.com/shared/album/TOKEN
// o https://www.icloud.com/photos/#/TOKEN) nella cartella indicata, con un indice
// JSON (_album.json) di data, misure e durata di ogni elemento.
//
// Foto: la versione JPEG a piena risoluzione (quella modificata, se esiste; per RAW
// e HEIC il JPEG che iCloud ricava dall'originale, se c'è). Video: l'originale.
// I file già scaricati vengono saltati, quindi si può rilanciare.
//
//   node scripts/media/icloud-album.mjs <link-o-token> <cartella> [opzioni]
//     --list            solo l'elenco, senza scaricare
//     --photos          solo le foto
//     --thumbs          solo le anteprime JPEG di tutto (in <cartella>/_anteprime/)
//     --only a,b,c      solo gli elementi con questi numeri (es. --only 12,340,1650)
//   (dietro un proxy: NODE_USE_ENV_PROXY=1)
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const listOnly = args.includes("--list");
const photosOnly = args.includes("--photos");
const thumbsOnly = args.includes("--thumbs");
const onlyArg = args.indexOf("--only");
const only = onlyArg > 0 ? new Set(args[onlyArg + 1].split(",").map(Number)) : null;
const [input, outDir] = args.filter((a, i) => !a.startsWith("--") && !(onlyArg >= 0 && i === onlyArg + 1));
if (!input || !outDir) {
  console.error("Uso: node scripts/media/icloud-album.mjs <link-o-token> <cartella> [--list]");
  process.exit(1);
}
const shortGUID = input.split(/[#/]/).filter(Boolean).at(-1);
const CONTAINER = "database/1/com.apple.photos.cloud/production";
const HEADERS = { "Content-Type": "text/plain", Origin: "https://photos.icloud.com" };

async function postJSON(url, body) {
  const res = await fetch(url, { method: "POST", headers: HEADERS, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`HTTP ${res.status} ${json.reason ?? ""}`);
  return json;
}

// 1. Il link breve dà la zona dell'album e un permesso di lettura anonimo (20 minuti).
let session;
async function resolve() {
  const r = await postJSON(`https://ckdatabasews.icloud.com/${CONTAINER}/public/records/resolve?remapEnums=true`, {
    shortGUIDs: [{ value: shortGUID }],
  });
  const res = r.results?.[0];
  if (!res?.anonymousPublicAccess) throw new Error("Album non pubblico o link non valido");
  session = {
    zoneID: res.zoneID,
    base: res.anonymousPublicAccess.databasePartition,
    token: res.anonymousPublicAccess.token,
    expires: Date.now() + res.anonymousPublicAccess.tokenTTL - 60_000,
    title: res.share?.fields?.["cloudkit.title"]?.value ?? "",
  };
}
async function query(body) {
  if (!session || Date.now() > session.expires) await resolve();
  const url = `${session.base}/${CONTAINER}/shared/records/query?remapEnums=true&publicAccessAuthToken=${encodeURIComponent(session.token)}`;
  return postJSON(url, { ...body, zoneID: session.zoneID });
}

// 2. Elenco completo: ogni foto è una coppia CPLAsset (modifiche) + CPLMaster (originale).
await resolve();
const assets = [];
const masters = new Map();
let marker;
do {
  const page = await query({
    query: {
      recordType: "CPLAssetAndMasterByAssetDateWithoutHiddenOrDeleted",
      filterBy: [
        { fieldName: "direction", comparator: "EQUALS", fieldValue: { value: "ASCENDING", type: "STRING" } },
        { fieldName: "startRank", comparator: "EQUALS", fieldValue: { value: 0, type: "INT64" } },
      ],
    },
    resultsLimit: 400,
    ...(marker ? { continuationMarker: marker } : {}),
  });
  for (const r of page.records ?? []) {
    if (r.recordType === "CPLAsset") assets.push(r);
    else if (r.recordType === "CPLMaster") masters.set(r.recordName, r);
  }
  marker = page.continuationMarker;
} while (marker);

const VIDEO_TYPES = /quicktime|mpeg-4|movie|video/i;
const decode = (b64) => (b64 ? Buffer.from(b64, "base64").toString("utf8") : "");
const items = assets.map((a, i) => {
  const masterName = a.fields.masterRef?.value?.recordName;
  const m = masters.get(masterName);
  const f = m?.fields ?? {};
  const isVideo = VIDEO_TYPES.test(f.itemType?.value ?? "");
  const res = isVideo
    ? f.resOriginalRes
    : a.fields.resJPEGFullRes ?? f.resJPEGFullRes ?? f.resOriginalRes;
  const width = Number((isVideo ? f.resOriginalWidth : a.fields.resJPEGFullRes ? a.fields.resJPEGFullWidth : f.resJPEGFullRes ? f.resJPEGFullWidth : f.resOriginalWidth)?.value) || null;
  const height = Number((isVideo ? f.resOriginalHeight : a.fields.resJPEGFullRes ? a.fields.resJPEGFullHeight : f.resJPEGFullRes ? f.resJPEGFullHeight : f.resOriginalHeight)?.value) || null;
  const original = decode(f.filenameEnc?.value) || `${masterName}`;
  const date = new Date(Number(a.fields.assetDate?.value ?? f.originalCreationDate?.value ?? 0));
  const ext = isVideo ? path.extname(original).toLowerCase() || ".mov" : res === f.resOriginalRes ? path.extname(original).toLowerCase() || ".jpg" : ".jpg";
  const stamp = date.toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
  return {
    n: i + 1,
    file: `${String(i + 1).padStart(4, "0")}-${stamp}-${path.basename(original, path.extname(original))}${ext}`,
    kind: isVideo ? "video" : "image",
    originalName: original,
    takenAt: date.toISOString(),
    width, height,
    duration: Number(a.fields.duration?.value) ? Number(a.fields.duration.value) / 1000 : null,
    size: res?.value?.size ?? null,
    edited: Boolean(a.fields.resJPEGFullRes),
    url: res?.value?.downloadURL ?? null,
    thumbUrl: (f.resJPEGMedRes ?? f.resJPEGThumbRes)?.value?.downloadURL ?? null,
  };
});

const total = items.reduce((s, x) => s + (x.size ?? 0), 0);
console.log(`Album «${session.title}»: ${items.filter((x) => x.kind === "image").length} foto, ${items.filter((x) => x.kind === "video").length} video, ${(total / 1048576).toFixed(0)} MB`);
if (listOnly) {
  for (const x of items) console.log(`${x.file}  ${x.width}×${x.height}  ${((x.size ?? 0) / 1048576).toFixed(1)} MB${x.duration ? `  ${x.duration}s` : ""}`);
  process.exit(0);
}

// 3. Download (gli URL sono già firmati), quattro alla volta.
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "_album.json"),
  JSON.stringify({ shortGUID, title: session.title, items: items.map(({ url, thumbUrl, ...rest }) => rest) }, null, 2) + "\n",
);
const thumbDir = path.join(outDir, "_anteprime");
if (thumbsOnly) fs.mkdirSync(thumbDir, { recursive: true });
const queue = items.filter((x) => (!only || only.has(x.n)) && (!photosOnly || x.kind === "image"));
let done = 0;
async function download(x) {
  const url = thumbsOnly ? x.thumbUrl : x.url;
  const dest = thumbsOnly ? path.join(thumbDir, `${path.parse(x.file).name}.jpg`) : path.join(outDir, x.file);
  if (fs.existsSync(dest) && (thumbsOnly || fs.statSync(dest).size === x.size)) return;
  if (!url) return console.warn(`! ${x.file}: nessun URL`);
  const name = thumbsOnly ? `${path.parse(x.originalName).name}.jpg` : x.originalName;
  const res = await fetch(url.replace("${f}", encodeURIComponent(name)));
  if (!res.ok) return console.warn(`! ${x.file}: HTTP ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  fs.utimesSync(dest, new Date(x.takenAt), new Date(x.takenAt));
  done++;
  if (!thumbsOnly) console.log(`✓ ${x.file} ${x.width}×${x.height} ${((x.size ?? 0) / 1048576).toFixed(1)} MB`);
}
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) await download(queue.shift());
}));
console.log(`\nScaricati ${done} file nuovi in ${thumbsOnly ? thumbDir : outDir}`);
