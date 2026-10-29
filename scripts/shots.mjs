// Screenshot di controllo con Playwright, desktop 1440 e mobile 390.
//   npm run shots -- /styleguide/media/ /   (con il sito avviato su :3000)
// Le immagini finiscono in screenshots/ (ignorata da git). Esce con errore se
// la pagina scrive errori in console.
import fs from "node:fs";
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:3000";
const routes = process.argv.slice(2).length ? process.argv.slice(2) : ["/"];
const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
];
fs.mkdirSync("screenshots", { recursive: true });
const browser = await chromium.launch();
let failed = false;
for (const route of routes) {
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, deviceScaleFactor: vp.deviceScaleFactor ?? 1 });
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base + route, { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    const file = `screenshots/${route.replace(/\W+/g, "_").replace(/^_|_$/g, "") || "home"}-${vp.name}.png`;
    // Le pagine lunghissime (il catalogo media) si fermano a 12000 px: oltre,
    // Chromium impiega minuti e il PNG diventa difficile da guardare.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.screenshot(height > 12000
      ? { path: file, clip: { x: 0, y: 0, width: vp.width, height: 12000 }, captureBeyondViewport: true }
      : { path: file, fullPage: true });
    console.log(`${errors.length ? "✗" : "✓"} ${file}${errors.length ? `\n    ${errors.join("\n    ")}` : ""}`);
    if (errors.length) failed = true;
    await page.close();
  }
}
await browser.close();
process.exitCode = failed ? 1 : 0;
