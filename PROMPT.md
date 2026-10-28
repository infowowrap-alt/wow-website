# Prompt da incollare in Claude Code

Copia tutto il testo qui sotto (dalla riga "Ciao Claude" in giù) nella prima chat di Claude Code, aperta nella cartella del progetto.

---

Ciao Claude. Devi costruire da zero il nuovo sito di WOW, la mia officina di pellicole e wrapping a Brindisi. Io sono Paolo.

**Prima leggi tutto:** `CLAUDE.md`, poi `docs/BRAND.md`, `docs/CONTENUTI.md`, `docs/SPEC-SITO.md` e `materiale/LEGGIMI.md`. Lì ci sono identità del brand, contenuti veri, mappa del sito, configuratori e regole. Le regole di `CLAUDE.md` valgono sempre.

**Cosa voglio.** Un sito che sembri fatto da uno studio da premio, non un template. Un brand con due mondi:

- **WOW Interior Design** (casa e negozi): chiaro, editoriale, materico, blu e rosso.
- **WOW Big Sun Garage** (veicoli): scuro, street, racing, gaming, viola notte e giallo fluo.

Il passaggio tra i due mondi deve essere il momento "wow" del sito: una transizione WebGL in cui la pagina si stacca come una pellicola. Voglio parti in 3D vere, scroll narrativo, video dei lavori, microinterazioni. E due configuratori:

1. **Big Sun Garage**: mezzo in 3D (auto, SUV, furgone, moto), colore e finitura del wrap, parti da wrappare, oscuramento vetri a norma, livrea con il proprio logo.
2. **Interior**: infisso, porta, cucina o mobile in 3D con le finiture, prima/dopo, e "prova sulla tua foto".

Entrambi finiscono con "Invia la configurazione su WhatsApp".

**Materiale.** In `materiale/` trovi le mie foto e i video dei lavori, divisi per sottobrand e progetto. Guardali davvero, uno per uno, prima di progettare. Classificali (progetto, prima/durante/dopo, dettaglio, ambientazione) e scegli i migliori. Scrivi il catalogo in `content/media.json`. Ottimizzali in `public/media/` (AVIF + WebP, più misure, placeholder sfocato). Dai video ricava loop muti di 6-10 secondi per hero e sezioni (MP4 H.264 + WebM, con poster).

**Adobe.** Se in questa sessione hai gli strumenti Adobe collegati (connettore Adobe / Firefly), puoi usarli per:
- scontornare veicoli e oggetti dalle foto;
- allargare foto verticali in orizzontale per gli hero (generative expand), solo sullo sfondo, mai sul lavoro;
- generare texture, sfondi e ambientazioni per i configuratori (stanze, officina, luci);
- montare clip brevi dai video.

Ogni immagine generata va segnata in `content/media.json` con `"ai": true`, e non deve mai sembrare un lavoro reale. I loghi non passano mai da strumenti AI. Se Adobe non c'è, usa sharp e ffmpeg.

**Modelli 3D.** Per i veicoli usa modelli con licenza chiara: CC0, oppure CC-BY con il credito in pagina. Scrivi fonte e licenza in `public/models/CREDITS.md`. Il configuratore deve leggere i modelli da un file di mappatura delle mesh (carrozzeria, vetri, cromature, cerchi), così posso sostituirli con modelli migliori senza riscrivere il codice. Per Interior costruisci i modelli (infisso, porta, cucina, mobile) in modo procedurale con three.js: niente modelli presi a caso.

**Come procediamo.**

**Fase 0, prima di scrivere codice.** Mandami:
- un piano di massimo 20 righe: stack, struttura delle cartelle, fasi;
- 3 proposte diverse per l'esperienza 3D della home e della transizione tra i mondi, 3-4 righe ciascuna;
- la lista dei file che ti mancano (loghi, foto, modelli);
- massimo 5 domande bloccanti.

Poi aspetta il mio ok.

**Le fasi, dopo il mio ok:**

1. Pipeline media e catalogo foto/video.
2. Design system: token, tipografia, componenti, regole di movimento, pagina `/styleguide`.
3. Home 3D e transizione tra i mondi.
4. Landing Interior e Landing Garage.
5. Configuratore Garage.
6. Configuratore Interior (3D + prova sulla tua foto).
7. Portfolio e pagine dei progetti.
8. Pagine servizio, chi siamo, contatti, privacy.
9. SEO, accessibilità, performance, fallback mobile; build statica pronta per il deploy.

A fine fase:
- avvia il sito;
- fai gli screenshot desktop e mobile con Playwright e guardali;
- correggi quello che non è all'altezza;
- fai commit;
- scrivimi in 5 righe cosa vedo di nuovo e come provarlo.

Tieni in `docs/TODO-PAOLO.md` tutto quello che devo darti o confermare (prezzi, recensioni, codici delle finiture, orari, link).

Inizia dalla Fase 0.
