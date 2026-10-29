# FASE 0 · piano, proposte, cosa manca, domande

Scritta il 28/10/2026 dopo aver letto `CLAUDE.md`, `docs/BRAND.md`, `docs/CONTENUTI.md`, `docs/SPEC-SITO.md`, `materiale/LEGGIMI.md`, i loghi, i 46 fotogrammi in `materiale/da-instagram/`, l'indice dei 218 post del tuo Instagram e alcune tue generazioni Firefly.

## 1. Piano (stack, cartelle, fasi)

1. **Stack** (versioni stabili di oggi, fissate nel `package.json`): Next.js 16.4 (App Router, `output: 'export'`) + TypeScript, React 19.3, Tailwind 4.3 con i token di `brand/tokens.json`.
2. **3D**: three 0.186 + @react-three/fiber 9.8 + drei 10.7 + postprocessing 3.2. **Un solo canvas WebGL persistente** nel layout radice, fuori dal router: ospita la pellicola della transizione e, tramite le `View` di drei, tutte le scene. Un solo contesto GL, niente perdite di contesto quando si cambia pagina.
3. **Movimento**: GSAP 3.15 + ScrollTrigger, Lenis 1.3, tutti agganciati al render loop di R3F. **Stato** dei configuratori in Zustand 5, serializzato in `#cfg=`.
4. **Pipeline**: sharp 0.35 (AVIF/WebP 640-2560 + blur), ffmpeg (loop MP4 H.264 + WebM, poster), gltf-transform 4.5 (Meshopt, KTX2/WebP). Playwright 1.64 per gli screenshot.
5. **Font self-hosted** da @fontsource (OFL/Apache), copiati in `public/fonts/`. Interior: Fraunces Variable (display: gli assi `SOFT` e `WONK` gli danno carattere), Inter Tight (testo), Permanent Marker (etichette). Garage: Big Shoulders Display Variable (al posto di Anton: più racing, ed essendo variabile basta un file per tutti i pesi), Chakra Petch (HUD), Instrument Serif (reveal).
6. **Cartelle**
   - `app/` (route `/`, `/interior/**`, `/garage/**`, `/chi-siamo`, `/contatti`, `/privacy`, `/cookie`, `/styleguide`)
   - `components/{ui,interior,garage,shared}`, `gl/{transition,scenes,materials,shaders}`
   - `configurator/{garage,interior}/{store,steps,scene}`
   - `content/{media.json,finiture.json,progetti/*.json}`, `scripts/{media,video,models}`
   - `public/{media,fonts,models,textures}`, `docs/`, `materiale/` (originali, sola lettura)
7. **Fasi**: 1 media e catalogo · 2 design system + `/styleguide` · 3 home 3D e transizione · 4 landing Interior e Garage · 5 configuratore Garage · 6 configuratore Interior · 7 portfolio e casi studio · 8 servizi, chi siamo, contatti, privacy · 9 SEO, a11y, performance, fallback, build statica.
8. **A fine fase**: dev server, screenshot Playwright 1440 e 390, correzioni, commit, 5 righe per te.

## 2. Tre proposte per la home 3D e la transizione tra i mondi

**A · "Il taglio a 45°"** (lo spec, portato al massimo). Schermo tagliato in diagonale: a sinistra una stanza luminosa con infisso e porta, a destra l'officina con i LED a chevron e un'auto; tutte e due girano dal vivo nello stesso canvas. Il taglio è un vero bordo di pellicola, con spessore e riflesso, e segue il mouse. Al clic il bordo diventa una spatola che stende la pellicola del mondo scelto, poi la pellicola si arriccia dall'angolo opposto e mostra il retro (carta siliconata con il pattern WOW). Si capisce in un secondo; è anche la più "attesa".

**B · "Il rotolo"**. In alto c'è un rotolo di pellicola in 3D: con lo scroll si srotola e diventa la pagina, e i contenuti ci stanno sopra. Prima finiture Interior (legno, stucco, marmo, la mazzetta che si apre), poi a metà il rotolo si gira e diventa wrap Garage (viola lucido, carbonio, cromo, con i riflessi dei chevron). Nel cambio di mondo il rotolo attraversa lo schermo in 1,3 s e stende la pelle nuova, mentre la vecchia si arriccia via. È il gesto del mestiere; serve però un bottone di scelta molto chiaro nel primo schermo.

**C · "Lo squarcio"** (nasce dalle tue prove Firefly: il fondo blu a raggi contro il muro scuro con lo squarcio viola). Si entra nel mondo Interior, chiaro e ordinato; al centro c'è un angolo di pellicola sollevato. Lo afferri come con la spatola (o scorri) e lo tiri: la pellicola si apre e sotto c'è l'officina buia, i chevron si accendono uno dopo l'altro a scatti e disegnano l'auto. Il bordo del taglio è netto, da taglierino, non uno strappo, con un riflesso viola dalla parte del Garage. È la più pop e fumetto; va dosata perché Interior resti editoriale.

**Consiglio**: la A come struttura (si legge subito, funziona su mobile con lo swipe), con dentro il gesto della C: l'angolo sollevato che si afferra e si tira, sia nell'hero sia nell'interruttore di mondo nell'header. Il retro siliconato col pattern WOW resta in tutte e tre.

## 3. Cosa manca

- **Rete**: questa sessione non può scaricare da Instagram (`*.cdninstagram.com`) né da Adobe (`*.adobe.io`, `at.adobe.com`), e nemmeno da Poly Haven (`dl.polyhaven.org`). Il tuo Instagram lo vedo (218 post, 355 foto e 89 video, indice in `materiale/da-instagram/indice-post.json`), ma non posso prendere i file. Adobe funziona per lavorare sulle immagini, ma i risultati non si scaricano finché quei domini sono bloccati. Inoltre qui la generazione Firefly da testo non è attiva: c'è solo l'allargamento (generative expand). Per HDRI e texture CC0 uso pacchetti npm (es. `@pmndrs/assets`) e luci procedurali.
- **Originali**: `materiale/interior/` e `materiale/garage/` sono vuote. Ho solo 46 fotogrammi a bassa risoluzione e quasi tutti verticali. Niente in locale per Cigarette, Sea-Doo, Idea 80, PPF Panda, International School, Ohana Park, T&T, Paradiso della Carta, cucine, mobili, San Teodoro.
- **Loghi**: WOW viola del Garage (esiste: è sulla targa della BMW e nei reel delle flotte), vettoriali di tutti i loghi, favicon, versione bianca.
- **Officina**: foto frontale dei chevron e misure a occhio della stanza (per rifarla in 3D uguale), il tuo video ritratto, l'audio della pellicola che si stacca.
- **Campionario**: foto delle finiture Interior con i codici (Cover Styl', APA), catalogo delle pellicole auto, livelli APA per l'oscuramento.
- **Modelli 3D dei veicoli**: non ci sono modelli CC0 realistici e generici raggiungibili da qui. I CC0 sono low-poly e stilizzati (Kenney, Quaternius): vanno bene per partire, ma non sono "da premio".
- Il resto (orari, recensioni, prezzi, hosting...) è in `docs/TODO-PAOLO.md`.

## 4. Domande bloccanti

1. **Proposta**: A, B, C o il mio mix A+C?
2. **Materiale**: sblocchi nelle impostazioni dell'ambiente `*.cdninstagram.com`, `*.adobe.io` e `at.adobe.com`, oppure mi carichi gli originali in chat come zip? Senza originali la Fase 1 si fa con i fotogrammi da 720 px, e sui grandi schermi si vede.
3. **Veicoli 3D**: c'è un budget per modelli realistici royalty-free (4 mezzi, indicativamente 30-150 € l'uno, li scelgo io e te li faccio approvare), o parto con CC0 stilizzati da sostituire dopo? La mappa delle mesh rende il cambio indolore.
4. **Logo viola e palette Garage**: mi mandi il logo WOW viola? I colori Garage li confermi così (`#21152D` / `#7C0ED7` / `#E5FF00`) o li ricavo dal logo?
5. **Volti**: chi posso mostrare in grande? Tu (immagino di sì) e i clienti che compaiono nei reel, per esempio la proprietaria della KTM.

## 5. Risposte di Paolo (28/10/2026)

- **Proposta**: mix A+C. Hero col taglio a 45° tra i due mondi; il gesto è l'angolo di pellicola sollevato che si afferra e si tira (anche nell'interruttore di mondo); transizione spatola + stacco con il retro siliconato.
- **Materiale**: i domini non si possono sbloccare. Foto e video arrivano dalla galleria del telefono tramite la pagina privata "Materiale WOW" (https://claude.ai/artifact/GPgPzJtK23GuwpAarBCzRC): Paolo carica per mondo e progetto, Claude scarica e mette gli originali in `materiale/<mondo>/<progetto>/`.
- **Budget**: 0 €. Veicoli 3D solo CC0 (o CC-BY con credito); niente acquisti.
- **Loghi vettoriali**: arriveranno più avanti. Fino ad allora si usano i PNG.
- **Ancora aperte**: logo WOW viola e conferma dei colori Garage; chi si può mostrare in volto (nel frattempo: Paolo sì, clienti riconoscibili mai in grande finché non c'è l'ok).

## 6. Decisioni del 29/10/2026

- Fotografi: non si citano nel sito.
- Clienti: si possono nominare tutti.
- Volti: si possono mostrare tutti.
