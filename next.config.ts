import type { NextConfig } from "next";

// Export statico: la cartella out/ va su qualsiasi hosting. Le immagini le
// ottimizza già la pipeline (scripts/media), quindi niente image optimizer.
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default config;
