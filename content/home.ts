// Contenuti della home: i lavori in vetrina (solo progetti veri, docs/CONTENUTI.md §3).
// `video` è l'id di un loop in content/media.json; `image` è il poster di riserva.
import type { World } from "@/lib/contact";

export type FeaturedWork = {
  id: string;
  world: World;
  title: string;
  line: string;
  tag: string;
  image: string;
  video?: string;
  post: string;
};

export const FEATURED: FeaturedWork[] = [
  {
    id: "bmw-e92",
    world: "garage",
    title: "BMW E92 × Saetta McQueen",
    line: "Saetta McQueen, ma stavolta è vera.",
    tag: "Full wrap · livrea custom",
    image: "garage-bmw-e92-fiancata-raduno",
    video: "garage-bmw-e92-video-fiancata",
    post: "https://www.instagram.com/reel/DeRh6RiI2h2/",
  },
  {
    id: "marangio",
    world: "interior",
    title: "Panificio Marangio",
    line: "Da legno a stucco bianco. Senza cambiare un mobile.",
    tag: "Area vendita · 7 giorni",
    image: "interior-marangio-vetrofania",
    video: "interior-marangio-video-negozio",
    post: "https://www.instagram.com/reel/DdBeLIGoNdd/",
  },
  {
    id: "ktm-790",
    world: "garage",
    title: "KTM 790 × Sdentato",
    line: "Tu credi nei draghi?",
    tag: "Wrap completo · squame in rilievo",
    image: "garage-ktm-790-castello",
    video: "garage-ktm-790-video-pini",
    post: "https://www.instagram.com/reel/Dd3ycNNIAXH/",
  },
  {
    id: "jova",
    world: "interior",
    title: "Jova Summer Party",
    line: "Un container bianco, un chiosco brandizzato. In 36 ore.",
    tag: "Grafica → stampa → applicazione",
    image: "interior-jova-container-pini",
    post: "https://www.instagram.com/reel/DdLskPgosBj/",
  },
  {
    id: "furgoni-70",
    world: "garage",
    title: "70 furgoni",
    line: "70 furgoni. Non 1.",
    tag: "Flotte aziendali",
    image: "garage-furgoni-70-fila",
    video: "garage-furgoni-70-video-fila",
    post: "https://www.instagram.com/reel/DfCb7FYRufl/",
  },
  {
    id: "bigodino",
    world: "interior",
    title: "Bigodino d'Oro",
    line: "Il vetro era vuoto. Ora ha personalità.",
    tag: "Vetrina · pellicola intagliata oro",
    image: "interior-bigodino-vetrina-dopo",
    post: "https://www.instagram.com/reel/Dck79S3NSjL/",
  },
  {
    id: "cigarette",
    world: "garage",
    title: "Scafo Cigarette",
    line: "EP. 1 grigio pieno. EP. 3 Miami vibes.",
    tag: "Full wrap · grafiche",
    image: "garage-cigarette-porto",
    post: "https://www.instagram.com/reel/DbsQ025tj68/",
  },
  {
    id: "infissi",
    world: "interior",
    title: "Infissi wrappati",
    line: "15.000 € per cambiare gli infissi? Anche no.",
    tag: "Infissi · a casa del cliente",
    image: "interior-infissi-portafinestra",
    post: "https://www.instagram.com/reel/De1fn1iIQC1/",
  },
];
