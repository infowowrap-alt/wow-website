// Dati di contatto e messaggi WhatsApp precompilati (docs/CONTENUTI.md §1).
export const CONTACT = {
  name: "WOW – L'Artigiano delle Pellicole",
  company: "WOW di Paolo Solazzo",
  vat: "02759550748",
  address: "Via Podgora 23, 72100 Brindisi (BR)",
  phone: "+39 350 020 1288",
  whatsapp: "393500201288",
  email: "wow@lartigianodellepellicole.it",
  instagram: "https://www.instagram.com/wowlartigianodellepellicole/",
  tiktok: "https://www.tiktok.com/@wowrap0",
} as const;

export type World = "interior" | "garage";

export const WHATSAPP_MESSAGES: Record<World | "home", string> = {
  home: "Ciao Paolo! Ti scrivo dal sito. Ti mando una foto di quello che vorrei trasformare.",
  interior: "Ciao Paolo! Ti scrivo dal sito, mondo Interior. Ti mando una foto di quello che vorrei rinnovare.",
  garage: "Ciao Paolo! Ti scrivo dal sito, mondo Big Sun Garage. Ti mando una foto del mezzo.",
};

/** Link wa.me con il prefisso 39 e il testo codificato. */
export function whatsappLink(text: string): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
}
