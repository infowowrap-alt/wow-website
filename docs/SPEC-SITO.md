# SPEC · il sito WOW

Questa è la specifica di riferimento. Le idee qui sono il **livello minimo** di ambizione: nella Fase 0 Claude Code può proporre soluzioni migliori, purché rispettino `CLAUDE.md` e `docs/BRAND.md`.

---

## 1. Il concept: "una pellicola tra due mondi"

Tutto il sito è costruito sul gesto del mestiere: **la pellicola che si applica e si stacca**.

- Si entra in un sito che ha già "una pelle".
- Si sceglie un mondo, e il sito **cambia pelle**: la pellicola del mondo nuovo viene stesa con la spatola e quella vecchia si stacca.
- Interior è il giorno (luce, materia, carta, blu e rosso). Garage è la notte (officina, LED a chevron, viola e giallo fluo).
- Il passaggio tra i due è il momento firma del sito.

Il visitatore deve uscire pensando "questi sanno fare cose che gli altri non fanno", e con un messaggio WhatsApp già scritto.

---

## 2. Mappa del sito

| URL | Scopo | Mondo |
| --- | --- | --- |
| `/` | Ingresso, scelta del mondo, lavori migliori, Paolo, contatti | Entrambi |
| `/interior` | Landing Interior: servizi, finiture, prima/dopo, casi | Interior |
| `/interior/configuratore` | Configuratore 3D + "prova sulla tua foto" | Interior |
| `/interior/lavori` | Portfolio Interior | Interior |
| `/interior/lavori/[slug]` | Caso studio (Marangio, Jova Summer Party, Bigodino d'Oro, ...) | Interior |
| `/interior/pellicole-vetri` | Pellicole solari, satinate, a specchio | Interior |
| `/garage` | Landing Big Sun Garage | Garage |
| `/garage/configuratore` | Configuratore 3D veicoli | Garage |
| `/garage/lavori` | Portfolio Garage ("Garage files") | Garage |
| `/garage/lavori/[slug]` | Caso studio (BMW E92, KTM Sdentato, Cigarette, 70 furgoni, ...) | Garage |
| `/garage/oscuramento-vetri` | Oscuramento a norma | Garage |
| `/chi-siamo` | Paolo, l'officina, Brindisi | Entrambi |
| `/contatti` | WhatsApp, telefono, email, indirizzo, orari, come arrivare | Entrambi |
| `/privacy`, `/cookie` | Note legali | Neutro |
| `/styleguide` | Design system (solo sviluppo, `noindex`) | |

I casi studio si generano da file di contenuto (`content/progetti/*.mdx` o `.json`), uno per progetto, con: titolo, mondo, cliente (se nominabile), data, servizi, materiali, durata, testo a episodi, foto/video da `media.json`, crediti, link al post Instagram.

---

## 3. Navigazione e interfaccia comune

- **Header minimo**: logo del mondo corrente, interruttore di mondo (Interior ⇄ Garage) sempre visibile, menu, bottone WhatsApp.
- **Interruttore di mondo**: un "lembo" di pellicola nell'angolo. Al passaggio del mouse l'angolo si solleva un po' e mostra il colore dell'altro mondo sotto. Al clic parte la transizione (§5).
- **Menu a schermo intero**: due colonne, una per mondo, con anteprime video dei lavori al passaggio del mouse.
- **Cursore personalizzato** solo su desktop e solo sulle aree interattive: in Interior una spatola, in Garage un mirino da HUD. Mai al posto del cursore di sistema sui testi.
- **Bottone WhatsApp fisso** in basso, con il testo precompilato del mondo in cui ci si trova.
- **Footer**: dati dell'attività, P.IVA, social, link legali.

---

## 4. Home

Struttura proposta (nella Fase 0 servono 3 alternative per il blocco hero + transizione):

1. **Preloader** (massimo 1,5 s, solo alla prima visita): una spatola passa sullo schermo e "stende" il logo WOW. Il logo resta intatto: si anima solo con una maschera.
2. **Hero: i due mondi.** Lo schermo è diviso in diagonale, come una pellicola tagliata a 45°. A sinistra il mondo Interior in 3D (angolo di una stanza luminosa con un infisso e una porta), a destra il Garage (un'auto nell'officina con i LED a chevron). Il mouse sposta la linea di taglio; al passaggio, il mondo sotto il cursore si allarga e si anima. Su mobile i due mondi sono uno sopra l'altro con uno swipe.
3. **Manifesto**: tipografia cinetica a scroll. Proposta: "Non è vernice. / Non è un mobile nuovo. / È pellicola. / È WOW."
4. **Lavori**: galleria orizzontale a scroll con i progetti migliori dei due mondi, video in loop al passaggio. Effetto WebGL sulle immagini: distorsione morbida (Interior) o RGB split leggero (Garage).
5. **Prima / dopo**: un lavoro Interior (Marangio) con slider a spatola.
6. **Paolo**: ritratto video in officina, la frase della maglietta ("Il wrapping è come avere un filtro di Instagram permanente."), due righe su di lui: progetta e applica.
7. **Brindisi**: mappa illustrata in SVG (niente Google Maps incorporato), pin su Via Podgora 23, link esterno "Apri in Maps".
8. **CTA finale**: "Mandaci una foto. Ti diciamo cosa si può fare." con due bottoni WhatsApp (Interior e Garage).

---

## 5. La transizione tra i mondi (WebGL "peel")

È l'elemento più importante del sito. Requisiti:

- Durata totale circa 1,2–1,6 s. Deve sembrare fisica: la pellicola ha peso, si curva, ha un riflesso.
- **Fase A, "applicazione"**: una pellicola con il colore e la texture del mondo di arrivo entra da un angolo e viene stesa sullo schermo da una spatola (bordo con riflesso speculare che avanza).
- Sotto la pellicola, mentre è coperto, avviene il cambio di pagina (route di Next.js).
- **Fase B, "stacco"**: la pellicola si stacca dall'angolo opposto con una deformazione a cilindro (page curl), mostrando il retro (carta siliconata grigio chiaro con il pattern "WOW" ripetuto, come le carte di supporto vere), e rivela la nuova pagina.
- Implementazione consigliata: un **canvas WebGL persistente** sopra le pagine (fuori dal router), un piano suddiviso con vertex shader per la curvatura, normale ricalcolata per la luce, ombra morbida sul contenuto sotto.
- Non fotografare il DOM con html2canvas (è lento e fragile): la pellicola è un materiale proprio, non una foto della pagina.
- Varianti: la stessa transizione, più breve (0,6 s), per l'apertura dei casi studio dentro un mondo.
- Fallback: senza WebGL o con `prefers-reduced-motion`, una dissolvenza con maschera diagonale in CSS.
- Audio opzionale (spento di default): il suono vero di una pellicola che si stacca, **registrato da Paolo in officina**. Niente suoni da librerie senza licenza.

---

## 6. Landing Interior (`/interior`)

Mood: rivista d'interni con le mani sporche di colla. Fondo carta, molto bianco, foto grandi, lentezza.

1. **Hero 3D: "rinnova senza sostituire".** Una porta (o un infisso) in 3D, luce naturale da una finestra. Con lo scroll una spatola 3D passa sulla superficie e la finitura cambia sotto la spatola (maschera nello shader che avanza). Ogni scroll successivo: un'altra finitura (legno, cemento, stucco, bianco opaco). Testo: "Stesso infisso. Pelle nuova."
2. **Il campionario a ventaglio**: le finiture come mazzetta 3D che si apre a ventaglio trascinandola. Al clic su una finitura, la superficie dell'hero la indossa. Le finiture sono quelle **vere** fotografate da Paolo (`materiale/campionario/`), con il nome del catalogo se c'è.
3. **Cosa rivestiamo**: infissi, cucine, porte, mobili, pareti, vetrine, container. Ogni voce è una scena o una foto che "si riveste" al passaggio del mouse.
4. **Sfida a tempo**: il caso Marangio raccontato come timeline "7 GIORNI" (prima → lavorazione → dopo, solo con foto vere), e il Jova Summer Party con un contatore "36 ORE" che scorre con lo scroll.
5. **Etichette e frecce a mano**: sulle foto dei lavori, etichette rosse con testo bianco e frecce disegnate (SVG animato con `stroke-dashoffset`) che indicano la parte rivestita, come nei reel.
6. **Pellicole per vetri**: una vetrata in 3D con interruttore giorno/notte. Di giorno la pellicola a specchio fa privacy; di notte, con la luce accesa dentro, l'effetto si inverte. È vero ed è onesto: va mostrato. Niente numeri di temperatura.
7. **Come funziona** (i 5 passi di Paolo, se confermati) e CTA "Mandaci una foto della tua cucina / porta / vetrina".

## 7. Landing Big Sun Garage (`/garage`)

Mood: notte in officina, videogioco di corse, fumetto. Veloce, contrasto alto.

1. **Hero 3D: l'officina si accende.** Buio. I tubi LED a chevron si accendono uno dopo l'altro (con un piccolo sfarfallio), la luce disegna la carrozzeria di un'auto. Il lettering Big Sun Garage appare. Con lo scroll la camera gira attorno all'auto e il wrap cambia colore e finitura a ogni sezione. Testo: "Paint is dead."
2. **"Questa non è vernice. È wrapping."**: sezione che spiega in tre colpi: si applica, protegge la vernice, si toglie. Tipografia condensata grande, giallo fluo.
3. **Garage files**: i casi studio come schermata di selezione di un videogioco (garage di Need for Speed): card a scorrimento, dati veri del lavoro (mezzo, servizio, materiali, durata se nota), niente statistiche inventate. Al clic: transizione breve e caso studio.
4. **Reveal cinematografico**: un video del lavoro migliore con bande nere 2.39:1 e una parola per stacco in serif maiuscolo bianco, come negli edit di Paolo.
5. **70 furgoni**: scena 3D con 70 furgoni in istanze (InstancedMesh) schierati; con lo scroll la livrea passa da un furgone all'altro come un'onda. "70 furgoni. Non 1."
6. **Tutto ciò che ha un motore**: auto, moto, barche, moto d'acqua, flotte. Card con video in loop.
7. **Oscuramento vetri**: anteprima del configuratore vetri (§8.1) con link alla pagina dedicata.
8. CTA "Mandaci una foto del mezzo" e "Configura il tuo wrap".

---

## 8. I configuratori

Regole comuni:
- Stato in **Zustand**, serializzato nell'URL (`#cfg=` in base64url compatto): ogni configurazione è un link condivisibile.
- Interfaccia a passi, tutti raggiungibili da tastiera, con riepilogo sempre visibile. Su mobile: canvas in alto, pannello in basso a cassetto.
- **Uscita**: bottone "Invia a Paolo su WhatsApp" con il riepilogo testuale + il link alla configurazione. Bottone "Scarica immagine" (render PNG). Su mobile, se `navigator.canShare({ files })` è disponibile, condivisione diretta dell'immagine (si può mandare su WhatsApp con la foto).
- **Prezzi**: nessun prezzo, a meno che Paolo fornisca `content/prezzi.json`. In quel caso solo fasce indicative ("da ... €") con la nota "Il prezzo vero lo fa Paolo dopo aver visto il mezzo/la superficie".
- Nessun dato lascia il browser: niente upload su server.
- Fallback senza WebGL: versione 2D con le foto dei lavori e la scelta di finiture e opzioni, stessa uscita su WhatsApp.

### 8.1 Configuratore Big Sun Garage (`/garage/configuratore`)

**Passi**
1. **Mezzo**: auto (coupé/berlina), SUV, furgone, moto. Barca come estensione futura.
2. **Colore e finitura**: tavolozza di colori proposti (stile campionario) + selettore libero. Finiture realizzate con `MeshPhysicalMaterial`:
   - lucido: clearcoat 1, roughness bassa;
   - satinato: roughness media, clearcoat basso;
   - opaco: roughness alta, niente clearcoat;
   - metallizzato: metalness alta con normal map di "flake";
   - cromato: metalness 1, roughness quasi 0;
   - carbonio: texture a trama (normal + roughness);
   - cangiante: `iridescence` con spessore variabile (color flip).
   Se Paolo fornisce il catalogo delle pellicole (marca, codice, nome), il configuratore mostra quei nomi; altrimenti i colori sono "esempi" senza codici.
3. **Parti**: carrozzeria completa, tetto, cofano, specchietti, dechrome (cromature in nero lucido o opaco), parti a contrasto, strisce racing.
4. **Vetri**: oscuramento **solo** laterali posteriori e lunotto, con livelli indicativi di trasmissione luminosa (es. 50%, 35%, 20%, 5%: **da allineare al catalogo APA di Paolo**). Parabrezza e laterali anteriori bloccati con la nota di legge (vedi `CONTENUTI.md` §5). Resa del vetro credibile: trasmissione e tinta neutra, niente gradienti decorativi.
5. **Livrea**: caricamento di un logo (PNG o SVG) applicato come decalcomania sulla carrozzeria (`Decal` di drei), con posizione, scala, rotazione e opzione "specchia sull'altro lato". Numero di gara con il font Garage. Una riga: "Carichi un logo di cui hai i diritti." Nessuna livrea a tema film già pronta.
6. **Riepilogo** e invio.

**Scena**
- Officina ricostruita: pareti scure, LED a chevron fatti con `Lightformer` di drei, così **i riflessi sulla carrozzeria sono quelli dei LED di WOW**: è il dettaglio che rende il configuratore unico. Pavimento con riflesso morbido (`MeshReflectorMaterial`), ombre a contatto.
- Interruttore luce: officina / esterno giorno (HDRI CC0, es. Poly Haven).
- Camere predefinite: 3/4 anteriore, lato, posteriore, alto; giro automatico (turntable) quando l'utente è inattivo.
- Animazione al cambio di colore: la nuova pellicola "corre" sulla carrozzeria da un punto (maschera nello shader), non uno scatto istantaneo.

**Modelli 3D**
- Veicoli **generici, senza marchi** (niente BMW, Fiat, ecc. riconoscibili: problemi di marchio). Licenza CC0 o royalty-free commerciale; se servono modelli a pagamento, chiedi a Paolo prima di comprarli.
- Ogni modello ha un file di mappatura `public/models/<id>.map.json` che associa le mesh ai ruoli: `body`, `roof`, `hood`, `mirrors`, `chrome`, `glass_windshield`, `glass_front_side`, `glass_rear_side`, `glass_rear`, `wheels`, `lights`, `interior`. Il configuratore legge solo i ruoli: per sostituire un modello basta cambiare il file e la mappa.
- Ottimizzazione con gltf-transform (Meshopt o Draco, texture KTX2/WebP), obiettivo ≤ 3 MB per modello, caricamento progressivo con anteprima.
- Fonte e licenza di ogni modello in `public/models/CREDITS.md`.

### 8.2 Configuratore Interior (`/interior/configuratore`)

**Modalità 1: 3D**
1. **Elemento**: infisso (1 o 2 ante), porta interna (liscia o pannellata), cucina (basi + pensili), mobile (cassettiera o armadio), vetrata. Geometrie **procedurali** in three.js con parametri (misure, numero di ante, maniglie): niente modelli presi a caso.
2. **Stato attuale**: "com'è adesso" (legno scuro, bianco ingiallito, arancione, laminato rovinato...), per il prima/dopo.
3. **Finitura**: dal campionario vero (`content/finiture.json`): nome, categoria (legni, tinte unite, cemento/stucco, marmi, metalli, specchiate), foto. Le texture PBR si ricavano dalle foto del campionario nella pipeline: tile senza giunte, roughness per categoria (opaco/satinato/lucido), normal map leggera dalla luminanza. Per le vetrate: solare, satinata, a specchio, con `transmission` e `roughness` del materiale fisico.
4. **Ambiente**: stanza stilizzata e luminosa (sfondo e arredi possono essere generati con Adobe Firefly o modellati semplici; marcati come AI). Luce giorno / tramonto.
5. **Prima / dopo**: slider o interruttore; il passaggio avviene con la stessa animazione della spatola dell'hero.

**Modalità 2: "Prova sulla tua foto"**
1. L'utente carica o scatta una foto (`<input type="file" accept="image/*" capture="environment">`), si corregge l'orientamento EXIF.
2. Sceglie la superficie trascinando **4 angoli** (maniglie grandi, lente d'ingrandimento sotto il dito su mobile). Può aggiungere più superfici (es. tutte le ante).
3. La finitura viene proiettata con omografia in WebGL e **mantiene le ombre della foto**: il colore della finitura si moltiplica per la luminanza normalizzata dell'originale, così la luce vera della stanza resta.
4. Slider prima/dopo, regolazione dell'intensità delle ombre, cambio finitura in tempo reale.
5. Scarica l'immagine o la invia su WhatsApp come sopra. La foto non lascia mai il dispositivo.
6. Nota onesta in pagina: "È una simulazione. Il risultato vero te lo mostra Paolo con il campionario in mano."

---

## 9. Pagine dei casi studio

- Raccontate **a episodi** (EP. 1, EP. 2, ...) quando il progetto è stato raccontato così sui social.
- Struttura: titolo cinetico, scheda (mezzo/luogo, servizio, materiali, durata), prima, lavorazione (dettagli: spatola, pistola termica, scaglie), dopo, reazione del cliente se c'è il video, crediti foto, link al post Instagram, CTA WhatsApp con testo legato al progetto ("Ciao Paolo, ho visto la KTM Sdentato...").
- Galleria con zoom a schermo intero, video con controlli e sottotitoli se c'è parlato.
- Prossimo progetto con transizione breve.

---

## 10. Movimento e microinterazioni

| | Interior | Garage |
| --- | --- | --- |
| Tempi | 600–1000 ms, morbido | 250–500 ms, secco |
| Curve | `expo.out`, `power3.inOut` | `power4.out`, `steps()` per gli sfarfallii |
| Effetti | Parallasse lenta, grana carta leggera, maschere a spatola, frecce che si disegnano | Sfarfallio LED, speed lines, RGB split breve al passaggio, numeri che scorrono tipo contachilometri |
| Testo | Righe che salgono una alla volta | Parole che entrano a scatto, una per volta |

- Scroll morbido con Lenis, animazioni con GSAP ScrollTrigger, sincronizzati con il render loop di R3F.
- Con `prefers-reduced-motion`: niente parallasse né effetti continui, transizioni brevi, video in pausa con poster.
- Il 3D si mette in pausa quando non è visibile (`frameloop="demand"` o IntersectionObserver).

---

## 11. Pipeline media e Adobe

**Foto**
- Lettura di tutto `materiale/`, con classificazione per: mondo, progetto, fase (prima / lavorazione / dopo / dettaglio / ambientazione / persone), orientamento, qualità. Catalogo in `content/media.json` (id, file, mondo, progetto, fase, alt in italiano, crediti, `ai`, `ai_note`).
- Esportazione in `public/media/` con sharp: AVIF + WebP, misure 640/1280/1920/2560, placeholder sfocato (base64 o blurhash), metadati di dimensione per evitare layout shift.
- Volti di clienti e passanti: si possono mostrare (ok di Paolo del 29/10/2026).

**Video**
- Con ffmpeg: loop muti di 6–10 s per hero e sezioni (H.264 MP4 + WebM VP9/AV1, 1080p e 720p, bitrate contenuto), poster AVIF, eventuale versione verticale per mobile.
- Video lunghi dei casi studio: compressi, con sottotitoli `.vtt` se c'è parlato.

**Adobe (se il connettore Adobe è disponibile in Claude Code)**
- Scontorno: `image_remove_background` per veicoli e oggetti nelle card e nelle scene.
- Allargamento: `image_generative_expand` per trasformare foto verticali in orizzontali da hero, **solo** estendendo lo sfondo; in `media.json` segna `"ai_note": "sfondo esteso"`.
- Correzioni: `image_apply_auto_tone`, `image_auto_straighten`, regolazioni di esposizione e temperatura per uniformare le foto di un progetto (senza cambiare il colore del lavoro).
- Video: `video_create_quick_cut` per montare clip brevi dai girati, `video_resize` per i formati.
- Generazione (Firefly): sfondi, texture decorative, stanze del configuratore Interior, ambientazioni. Mai lavori, mai loghi, mai persone reali.
- Adobe Stock: **chiedi a Paolo prima di licenziare** qualsiasi asset (può costare).
- Se Adobe non c'è: sharp, ffmpeg e generazione procedurale.

---

## 12. Prestazioni

- JS iniziale della home ≤ 250 KB compressi; il 3D in chunk separati caricati dopo l'LCP.
- LCP < 2,5 s su 4G simulato: l'elemento LCP è un poster/immagine, non il canvas.
- DPR del canvas limitato (max 1,5 su mobile, 2 su desktop), qualità adattiva con `PerformanceMonitor` di drei.
- Modelli ≤ 3 MB, texture KTX2/WebP, HDRI ≤ 2 MB (o Lightformer al posto dell'HDRI).
- Video hero ≤ 3 MB, `preload="metadata"`, partono solo se visibili.
- Font: massimo 4 file per mondo, subset latino, `preload` solo dei font del primo schermo.

---

## 13. SEO locale

- Titoli e descrizioni per pagina, in italiano, con le parole che la gente cerca: wrapping auto Brindisi, car wrapping Puglia, oscuramento vetri Brindisi, wrapping moto, wrapping barche Puglia, wrapping furgoni e flotte, PPF Brindisi, wrapping cucine Brindisi, wrapping infissi, rivestimento mobili con pellicola, pellicole solari Brindisi, pellicole satinate per uffici, vetrofanie Brindisi.
- schema.org: `LocalBusiness` (nome, indirizzo, telefono, email, `sameAs` Instagram e TikTok, `geo` **TODO-PAOLO**: coordinate esatte dell'officina, orari quando ci sono), `Service` per ogni servizio, `BreadcrumbList`, `CreativeWork` per i casi studio.
- `sitemap.xml`, `robots.txt`, canonical, Open Graph e Twitter card con immagini vere per ogni pagina.
- Contenuti testuali veri nelle pagine (non solo 3D): Google deve leggere cosa fa WOW.

---

## 14. Legale e privacy

- Font self-hosted, nessuna risorsa da CDN di terzi, nessun embed (YouTube, Instagram, Google Maps) senza consenso esplicito: per Instagram e Maps solo link esterni.
- Se non ci sono cookie non tecnici, niente banner invasivo: basta la cookie policy. Se Paolo vuole statistiche, solo soluzioni cookieless (Plausible o Umami), con evento sui clic WhatsApp per mondo e per configuratore.
- Privacy policy con i dati dell'attività. I configuratori non raccolgono dati.
- P.IVA e ragione sociale nel footer.

---

## 15. Messa online

- Build statica (`next build` con `output: 'export'`), cartella `out/` pronta per qualsiasi hosting (Netlify, Cloudflare Pages, Vercel o l'hosting attuale).
- Prima un'**anteprima** su un indirizzo provvisorio: il sito attuale resta online finché Paolo non approva.
- Reindirizzamenti 301 dagli URL del vecchio WordPress (es. `/dove-siamo/` → `/contatti`): Claude Code ricostruisce la lista dalla sitemap del sito attuale (`https://lartigianodellepellicole.it/sitemap_index.xml` o `/wp-sitemap.xml`) se la rete lo permette, altrimenti la chiede a Paolo. File `_redirects` (Netlify/Cloudflare) o `.htaccess` (Apache).
- **Attenzione all'email**: wow@lartigianodellepellicole.it deve continuare a funzionare. Quando si cambiano i DNS non toccare i record MX e quelli della posta.
- Checklist finale prima del passaggio: Lighthouse mobile e desktop, test su iPhone e Android veri, test senza WebGL, link WhatsApp provati, form/upload del configuratore provati, 404, redirect.
