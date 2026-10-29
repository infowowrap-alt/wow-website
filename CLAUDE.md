# WOW · Sito ufficiale (Interior Design + Big Sun Garage)

Questo file vale per ogni sessione di Claude Code in questa cartella. Leggilo tutto prima di toccare il codice. I dettagli sono in `docs/`.

## Cosa stiamo costruendo

Il nuovo sito di **WOW**, officina di pellicole e wrapping di Paolo Solazzo a Brindisi (Via Podgora 23). Sostituirà il sito WordPress attuale su lartigianodellepellicole.it.

Un solo brand, **due mondi** con identità visive separate:

- **WOW Interior Design**: casa, negozi, uffici. Rivestimento di infissi, cucine, porte, mobili, pareti, vetrine; pellicole per vetri (solari, satinate, specchiate); vetrofanie, insegne, stand per fiere.
- **WOW Big Sun Garage**: veicoli. Wrapping auto, livree custom, moto, barche, flotte e furgoni, oscuramento vetri, PPF.

Il sito deve essere **di livello premio (Awwwards/FWA)**: 3D, transizioni WebGL, scroll narrativo, video, microinterazioni. Un primo tentativo "pulito ma semplice" è stato scartato da Paolo perché troppo basico: **non rifare un sito a sezioni e card**.

Due funzioni chiave, oltre al portfolio:

1. **Configuratore Big Sun Garage** (3D): scegli il mezzo, colore e finitura del wrap, parti, oscuramento vetri, livrea con il tuo logo. Invii la configurazione su WhatsApp.
2. **Configuratore Interior** (3D + "prova sulla tua foto"): scegli l'elemento (infisso, porta, cucina, mobile, vetrata) e la finitura; vedi prima e dopo; puoi applicare la finitura su una foto di casa tua. Invii su WhatsApp.

## Regole che non si discutono

- **Loghi originali, sempre.** Usa solo i file in `brand/logo/`. Mai ridisegnarli, deformarli, ricolorarli, rigenerarli con l'AI, né applicarci filtri che ne cambiano i colori. Se manca un file, lascia lo spazio e chiedilo.
- **Due identità che non si mescolano.** Interior: blu, rosso, bianco. Garage: viola notte, giallo fluo, nero. Niente viola/giallo su Interior, niente blu/rosso dominanti su Garage (vedi `docs/BRAND.md`).
- **Niente inventato.** Nessuna recensione, cifra, prezzo, cliente, codice di finitura o certificazione inventati. Dove manca un dato metti `TODO-PAOLO:` e un segnaposto visibile solo in sviluppo. Le recensioni vanno inserite solo con testo originale fornito da Paolo.
- **Foto vere per il portfolio.** I lavori mostrati sono solo quelli reali in `materiale/`. Le immagini generate con l'AI (Adobe Firefly o altro) si usano solo per sfondi, texture, ambientazioni dei configuratori, mai spacciate per lavori fatti. Mai togliere watermark. I fotografi non si citano nel sito (decisione di Paolo del 29/10/2026). Clienti e volti si possono nominare e mostrare tutti (stessa decisione).
- **CTA = WhatsApp e Instagram.** Numero `+39 350 020 1288`, link `https://wa.me/393500201288` con messaggio precompilato (prefisso 39 obbligatorio). Non usare "Richiedi preventivo" come CTA principale: "Mandaci una foto su WhatsApp", "Invia la configurazione".
- **Oscuramento vetri a norma.** Nel configuratore si possono oscurare solo vetri laterali posteriori e lunotto. Parabrezza e laterali anteriori restano disattivati con una nota (dettagli in `docs/CONTENUTI.md`).
- **Marchi di terzi.** Alcuni lavori si ispirano a film (Cars, Dragon Trainer): si mostrano le foto del lavoro, ma loghi, personaggi e font dei film non diventano elementi grafici del sito, e i veicoli 3D del configuratore sono generici, senza marchi.
- **Italiano**, tono WOW: diretto, breve, sicuro, un po' pungente, riferimenti pop. Vedi `docs/BRAND.md`.
- **GDPR.** Font self-hosted (niente Google Fonts da CDN), nessuna mappa o video di terzi incorporato senza consenso, analytics solo cookieless se richiesti. Le foto caricate nei configuratori restano nel browser: nessun upload.

## Stack (salvo motivi forti, da spiegare prima)

- **Next.js (App Router) + TypeScript**, export statico (`output: 'export'`) per poterlo ospitare ovunque.
- **Tailwind CSS** con i token di `brand/tokens.json`.
- **three.js + @react-three/fiber + @react-three/drei** (+ `@react-three/postprocessing` dove serve) per 3D e configuratori.
- **GSAP + ScrollTrigger** per le animazioni a scroll, **Lenis** per lo scroll morbido.
- **Zustand** per lo stato dei configuratori, stato serializzato nell'URL (`#cfg=...`) per link condivisibili.
- **sharp** e **ffmpeg** per la pipeline immagini e video; **gltf-transform** per comprimere i modelli 3D (Draco/Meshopt, texture KTX2/WebP).
- **Playwright** per gli screenshot di controllo.

Usa le ultime versioni stabili. Fissa le versioni nel `package.json`.

## Qualità (definizione di "fatto")

- Ogni pagina è controllata con screenshot desktop (1440) e mobile (390) via Playwright, senza errori in console.
- 3D caricato in modo lazy e progressivo; su mobile poco potente, con `prefers-reduced-motion` o senza WebGL si vede una versione con video o immagini che resta bella.
- LCP della home sotto 2,5 s su 4G simulato; nessun layout shift visibile; JS iniziale contenuto (3D in chunk separati).
- Accessibile: navigazione da tastiera, focus visibile, alt in italiano, contrasti AA, configuratori utilizzabili senza mouse.
- SEO locale: metadati per pagina, schema.org `LocalBusiness` (+ `Service`), sitemap.xml, robots.txt, Open Graph con immagini vere.
- Contenuto completo: nessun lorem ipsum.

## Come lavorare

1. Prima di scrivere codice, proponi un piano breve e aspetta l'ok (vedi `PROMPT.md`).
2. Lavora per fasi; a fine fase avvia il dev server, fai gli screenshot, verificali, fai commit con un messaggio chiaro.
3. Fai domande a Paolo solo se bloccanti, massimo 5 per volta, e raccogli i `TODO-PAOLO` in `docs/TODO-PAOLO.md` (all'avvio crealo copiando la lista di `docs/CONTENUTI.md` §7).
4. Non cancellare né modificare i file originali in `materiale/`: lavora su copie in `public/media/`.

## Dove sono le cose

- `PROMPT.md`: il brief di avvio. `ISTRUZIONI.md`: la guida per Paolo (non serve a te).
- `docs/BRAND.md`: identità, colori, font, loghi, tono di voce, frasi.
- `docs/CONTENUTI.md`: servizi, progetti veri, clienti, contatti, note legali, cose da confermare.
- `docs/SPEC-SITO.md`: mappa del sito, esperienza 3D, transizioni, configuratori, SEO, deploy.
- `brand/logo/`: loghi ufficiali. `brand/tokens.json`: colori e font.
- `materiale/`: foto e video originali di Paolo (vedi `materiale/LEGGIMI.md`). `materiale/da-instagram/`: fotogrammi a bassa risoluzione dai post, solo di riserva.
