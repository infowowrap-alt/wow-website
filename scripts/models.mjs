// Pipeline dei modelli 3D dei veicoli: scarica il sorgente (licenza in
// public/models/CREDITS.md), toglie marchi e loghi di terzi, comprime
// (Meshopt + texture WebP) e scrive public/models/<id>.glb. La mappa dei ruoli
// (carrozzeria, vetri, cromature, cerchi…) sta in public/models/<id>.map.json:
// il configuratore legge solo i ruoli, quindi per cambiare modello basta
// cambiare il file e la mappa.
//
//   node scripts/models.mjs            (scarica in .cache/models se manca)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import { NodeIO, getBounds, Logger } from "@gltf-transform/core";
import { ALL_EXTENSIONS, KHRMaterialsVariants } from "@gltf-transform/extensions";
import { dedup, prune, weld, meshopt, textureCompress, simplify } from "@gltf-transform/functions";

const ROOT = process.cwd();
const CACHE = path.join(ROOT, ".cache/models");
const OUT = path.join(ROOT, "public/models");

const MODELS = [
  {
    id: "car-coupe",
    url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CarConcept/glTF-Binary/CarConcept.glb",
    file: "CarConcept.glb",
    // Texture con loghi di terzi (Khronos, 3D Commerce), per materiale e slot:
    // diventano tinta unita. Il logo Khronos è anche la texture emissiva di
    // targa, cerchi e specchi: nera = nessuna emissione.
    scrub: [
      { material: "License", slot: "baseColor", color: "#111111" },
      { material: "Hardware", slot: "emissive", color: "#000000" },
      { material: "Tireside", slot: "baseColor", color: "#1e1e1e" },
    ],
    // Materiali rinominati per ruolo: il configuratore cerca questi nomi.
    materials: {
      "Paint 1 Carmine": "paint_body",
      "Paint 2 Carmine": "paint_accent",
      Glass: "glass",
      Rim1: "rim",
      Rim2: "rim_detail",
      Mirror: "mirror",
      Headlight: "light_head",
      Brakelight: "light_tail",
      Signallight: "light_signal",
      Tireside: "tire_side",
      Tiretread: "tire_tread",
      License: "plate",
      Brake: "brake",
      Disc: "brake_disc",
      Hardware: "hardware",
      Mechanical: "mechanical",
      "": "trim",
      Dashboard: "interior_dash",
      "Interior 1": "interior_1",
      "Interior 2": "interior_2",
      "Interior 3 Carmine": "interior_3",
      Floormat: "interior_floor",
      "Panel Sides": "interior_panels",
    },
    // Ruoli per il configuratore: materiali interi o singole maglie (per nome).
    roles: {
      body: { materials: ["paint_body"] },
      accent: { materials: ["paint_accent"] },
      mirrors: { meshes: ["BodyDoorRMirrorColor1", "BodyDoorLMirrorColor1"] },
      roof: { meshes: ["BodyRoofPanel"] },
      hood: { meshes: ["BodyHood"] },
      wheels: { materials: ["rim", "tire_side", "tire_tread"] },
      chrome: { materials: ["mirror", "rim_detail"] },
      trim: { materials: ["trim"] },
      // Oscuramento vetri: solo laterali posteriori e lunotto sono modificabili.
      glass_windshield: { meshes: ["BodyWindshield"], tintable: false },
      glass_front_side: { meshes: ["BodyDoorRWindow", "BodyDoorLWindow"], tintable: false },
      glass_rear_side: { meshes: ["BodyWindowsRearSides"], tintable: true },
      glass_rear: { meshes: ["BodyRearwindow"], tintable: true },
      lights: { materials: ["light_head", "light_tail", "light_signal"] },
      plate: { materials: ["plate"] },
      interior: { materials: ["interior_dash", "interior_1", "interior_2", "interior_3", "interior_floor", "interior_panels"] },
    },
  },
];

const getters = {
  baseColor: (m) => m.getBaseColorTexture(),
  emissive: (m) => m.getEmissiveTexture(),
};

async function solid(w, h, hex) {
  return sharp({ create: { width: w, height: h, channels: 3, background: hex } }).png().toBuffer();
}

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO().setLogger(new Logger(Logger.Verbosity.WARN)).registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

for (const m of MODELS) {
  const src = path.join(CACHE, m.file);
  if (!fs.existsSync(src)) {
    const res = await fetch(m.url);
    if (!res.ok) throw new Error(`${m.id}: download HTTP ${res.status}`);
    fs.writeFileSync(src, Buffer.from(await res.arrayBuffer()));
  }
  const doc = await io.read(src);
  const root = doc.getRoot();

  // 1. Loghi di terzi via.
  for (const s of m.scrub) {
    const mat = root.listMaterials().find((x) => x.getName() === s.material);
    const tex = mat && getters[s.slot](mat);
    if (!tex) throw new Error(`${m.id}: texture ${s.material}.${s.slot} non trovata`);
    const [w, h] = tex.getSize();
    tex.setImage(await solid(w, h, s.color)).setMimeType("image/png");
  }

  // 2. Niente varianti di materiale: il colore lo decide il configuratore.
  root.listExtensionsUsed().find((e) => e.extensionName === KHRMaterialsVariants.EXTENSION_NAME)?.dispose();
  for (const mat of root.listMaterials()) {
    const name = m.materials[mat.getName()];
    if (name) mat.setName(name);
  }

  // 3. Peso: saldatura, semplificazione leggera (errore < 0,5 mm), texture ≤ 1024 in WebP, Meshopt.
  await doc.transform(
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.0005, lockBorder: true }),
    dedup(),
    prune({ keepAttributes: false }),
    textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 82 }),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );

  const out = path.join(OUT, `${m.id}.glb`);
  await io.write(out, doc);

  // Mappa dei ruoli, con controllo che ogni nome esista davvero nel file.
  const matNames = new Set(root.listMaterials().map((x) => x.getName()));
  const meshNames = new Set(root.listMeshes().map((x) => x.getName()));
  for (const [role, r] of Object.entries(m.roles)) {
    for (const n of r.materials ?? []) if (!matNames.has(n)) throw new Error(`${m.id}: ruolo ${role}, materiale ${n} assente`);
    for (const n of r.meshes ?? []) if (!meshNames.has(n)) throw new Error(`${m.id}: ruolo ${role}, maglia ${n} assente`);
  }
  const bbox = getBounds(root.listScenes()[0]);
  fs.writeFileSync(path.join(OUT, `${m.id}.map.json`), JSON.stringify({ id: m.id, file: `/models/${m.id}.glb`, bounds: bbox, roles: m.roles }, null, 2) + "\n");

  let tris = 0;
  for (const mesh of root.listMeshes()) for (const p of mesh.listPrimitives()) tris += (p.getIndices()?.getCount() ?? 0) / 3;
  console.log(`✓ ${m.id}.glb ${(fs.statSync(out).size / 1048576).toFixed(2)} MB, ${Math.round(tris / 1000)}k triangoli, ${root.listMaterials().length} materiali`);
}
