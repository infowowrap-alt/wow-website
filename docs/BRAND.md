# BRAND · WOW, Interior Design e Big Sun Garage

Fonti: Context Brief WOW del 21/10/2026, analisi di 10 reel e 48 caption Instagram (giugno–ottobre 2026), loghi ufficiali. Dove c'è scritto **da confermare**, il dato va verificato con Paolo prima di andare online.

---

## 1. Chi è WOW

WOW è l'officina di pellicole e wrapping di **Paolo Solazzo** a Brindisi. Il valore non è "applicare una pellicola": è **trasformare** superfici e veicoli con un risultato che si riconosce, raccontato con contenuti energici, dettagli veri e prima/dopo.

Paolo è sia grafico sia applicatore: progetta la grafica e la mette sul pezzo. Il sito deve far sentire questa doppia mano. Dietro ogni lavoro c'è un'idea, e chi l'ha avuta è lo stesso che la applica.

Direzione creativa generale: pop culture, cultura dei motori, street, fumetto, videogiochi, motorsport, trasformazioni prima/dopo. Contemporaneo e audace, **mai** il negozio di servizi generico o il sito "corporate".

## 2. Due mondi, un brand

| | **WOW Interior Design** | **WOW Big Sun Garage** |
| --- | --- | --- |
| Cosa fa | Rivestimento di superfici: infissi, porte, cucine, mobili, pareti, pavimenti, specchi; pellicole per vetri (solari, satinate/privacy, specchiate); vetrofanie, vetrine, insegne, interni di negozi, container e chioschi, stand | Wrapping di veicoli: auto (full e parziale), livree custom, grafiche stampate, moto, barche, flotte e furgoni, oscuramento vetri, pellicole per vetri auto |
| Promessa | **Rinnovare senza sostituire.** Niente demolizioni, niente polvere, tempi brevi | **Trasformazione spettacolare e reversibile.** "Questa non è vernice. È wrapping." |
| Cliente | Attività di Brindisi (forni, saloni, bar), privati che vogliono rinnovare casa, organizzatori di eventi, scuole e uffici (pellicole solari) | Appassionati di motori, proprietari di moto e barche, aziende con flotte, eventi motoristici |
| Sensazione | Luce, materia, ordine, artigianato, "editoriale da rivista d'arredo" con il carattere di Paolo | Notte, officina, neon, velocità, gaming, street, racing, fumetto |
| Riferimenti | Riviste d'interni, campionari di materiali, cantiere pulito | Need for Speed, GTA, Tokyo Drift / Fast & Furious, fumetto, tuning, look "garage" viola e giallo fluo (direzione approvata) |
| Dove si gira | Dal cliente: negozio, casa, centro di Brindisi | In officina: pareti nere, luci LED bianche a chevron, logo WOW a parete |
| Ritmo | Racconto, spiegazione, sfida a tempo, prima/dopo | Edit cinematografico di 8–15 s oppure documentario di bottega di circa 100 s |

**Regola d'oro:** i due mondi convivono nel sito ma restano leggibili. Il visitatore deve capire in un secondo in quale dei due si trova.

## 3. Loghi

File in `brand/logo/` (estratti dal sito attuale, PNG con trasparenza, 760 px di larghezza):

- `logo-wow.png`: WOW, bandiera blu con lettere bianche e "W" rossa. È il logo madre.
- `logo-interior.png`: WOW con la scritta "INTERIOR DESIGN" in blu. Va usato per il mondo Interior.
- `logo-bsg.png`: lettering graffiti "BIG SUN GARAGE", giallo con contorno rosa e nero. Va usato per il mondo Garage.

Regole:

- **Mai** ridisegnare, ricolorare, deformare, vettorializzare "a mano", rigenerare con l'AI, mettere in prospettiva o animare lettera per lettera. Si possono animare solo come oggetto intero (fade, maschera, scala uniforme, parallasse).
- Proporzioni sempre bloccate (`height: auto`). Area di rispetto attorno al logo: almeno l'altezza della "O" di WOW.
- Il logo Interior (blu/rosso) e il logo Garage (giallo) **non sono intercambiabili**.
- Su fondo scuro il logo WOW resta com'è (la bandiera blu ha già il suo fondo). Il lettering Big Sun Garage va su fondo scuro o viola, mai su bianco.
- **Mancano** (vedi `TODO-PAOLO`): logo WOW viola della divisione Garage, versioni vettoriali (SVG/PDF/AI) di tutti i loghi, favicon. Finché mancano, usa i PNG e lascia lo spazio.

## 4. Colori

I valori in grassetto vengono dal brand book (Context Brief). Gli altri sono proposte di supporto: Claude Code può affinarle, ma deve restare dentro questa direzione.

### Interior Design: chiaro, blu, rosso, bianco

| Ruolo | HEX | Note |
| --- | --- | --- |
| Blu WOW | **#044B94** | Colore principale. Nel PNG del logo misura circa #014B93 |
| Rosso WOW | **#C01818** | Accento: CTA, etichette, frecce, numeri. Nel PNG circa #B01C22 |
| Bianco | **#FFFFFF** | |
| Carta | #F5F2EC | Proposta: fondo caldo, da campionario |
| Inchiostro | #0D1B2A | Proposta: testo principale |
| Pietra | #D9D4CB | Proposta: linee, card, divisori |

Uso: tanto bianco e carta, fotografie grandi e luminose, blu per titoli e superfici, rosso **solo** come accento (etichetta, freccia, numero, bottone). Le texture delle finiture (legno, marmo, stucco, cemento) sono il "colore" vero di questo mondo.

### Big Sun Garage: viola notte, giallo fluo, nero

| Ruolo | HEX | Note |
| --- | --- | --- |
| Viola notte | #21152D | Fondo principale. **Da confermare** |
| Viola elettrico | #7C0ED7 | Glow, luci, gradienti. **Da confermare** |
| Giallo fluo | #E5FF00 | Accento: CTA, numeri, HUD. Nel lettering del logo circa #EFF300. **Da confermare** |
| Rosa logo | #FD66AE | Solo come richiamo al contorno del lettering, con parsimonia |
| Nero | #111111 | |
| Grafite | #38343E | Superfici, card, pannelli del configuratore |

Uso: fondo scuro, luce che viene dalle cose (neon, LED a chevron, riflessi sulle carrozzerie), giallo fluo come "colpo" (numeri, CTA, linee HUD), viola per atmosfera e glow. Le foto dei progetti mantengono i colori del soggetto (rosso e giallo Cars, blu e verde Night Fury): non vanno ricolorate col viola.

### Divieti di colore

- Niente viola/giallo nel mondo Interior. Niente blu/rosso dominanti nel mondo Garage (la direzione blu/rossa per il Garage è già stata **rifiutata**).
- Il rose gold/oro esiste solo come colore di **singoli progetti** (portali di negozi, Bigodino d'Oro), non come palette del sito.
- Niente gradienti decorativi per rappresentare l'oscuramento vetri: il vetro oscurato si mostra con una resa credibile (vedi `docs/SPEC-SITO.md`).

## 5. Tipografia

Tutti i font **self-hosted** (file in `public/fonts/`, `font-display: swap`, subset latino). Niente Google Fonts da CDN e niente Adobe Fonts da Typekit (sono server di terzi: problema GDPR). Solo licenze che permettono l'uso web: SIL OFL, Apache 2.0 o licenza commerciale fornita da Paolo.

Proposta di partenza (Claude Code può proporre alternative migliori nella Fase 0, motivandole):

| Ruolo | Interior | Garage |
| --- | --- | --- |
| Display / titoli | Un serif editoriale con carattere (es. Fraunces, Instrument Serif) | Un grotesk condensato e aggressivo (es. Anton, Big Shoulders Display, Bebas Neue) |
| Testo | Un grotesk pulito (es. Inter Tight, Manrope) | Lo stesso del testo Interior, per coerenza del brand madre |
| Dettagli / UI | Note "a pennarello" per etichette e frecce (es. Permanent Marker), solo per parole singole | Un font tecnico da HUD per numeri, specifiche e configuratore (es. Chakra Petch, JetBrains Mono) |
| Reveal cinematografico | | Serif maiuscolo bianco, una parola per volta, come negli edit dei reel |

Il lettering graffiti è **solo** quello del logo Big Sun Garage: non usare font graffiti finti per i titoli.

## 6. Tono di voce

Giovane, rapido, sicuro, un po' pungente. WOW ha un punto di vista e lo dice senza giri.

**Come si scrive**
- Si apre con una frase che crea curiosità, contrasto o una domanda semplice.
- Frasi brevi, parole concrete: wrapping, pellicola, livrea, finitura, risultato, giorni, ore.
- Ironia asciutta e riferimenti pop riconoscibili, senza spiegare la battuta.
- Numeri e tempi come gancio: "7 GIORNI.", "36 ORE.", "15.000 €?".
- Frasi a scalino, una per riga: "Migliaia di dettagli. / Ore di lavorazione. / Decine di applicazioni."
- Frecce di processo: "Grafica → stampa → applicazione."
- Inglese quando è naturale nel settore (wrap, custom livery, reveal, Cars edition), soprattutto nel mondo Garage. Il messaggio resta comprensibile a un brindisino.

**Cosa evitare**
- Tono istituzionale, corporate, da volantino o da "negozio di famiglia".
- Aggettivi vuoti: "bellissimo", "incredibile", "top", "eccellenza", "qualità e professionalità".
- Testi lunghi che arrivano al punto dopo tre righe.
- "Richiedi un preventivo" come CTA principale. Si usa: "Mandaci una foto su WhatsApp", "Scrivici su WhatsApp", "Invia la configurazione", "Ricevi il catalogo su WhatsApp".
- Promesse tecniche non verificate (gradi in meno, anni di durata, garanzie) senza dati di Paolo o del produttore.

**Frasi già approvate o usate** (sono direzioni, non slogan da ripetere ovunque)
- "Paint is dead." (Garage)
- "Questa non è vernice. È wrapping." (Garage)
- "Non è magia, è WOW." (firma per prima/dopo)
- "Saetta McQueen, ma stavolta è vera." (caption BMW E92)
- "Tu credi nei draghi?" (teaser KTM)
- "Il wrapping è come avere un filtro di Instagram permanente." (dalla maglietta di Paolo, ottima per Interior)
- "Verniciarli tutti? Un bagno di sangue." (flotte)
- "Noi ci abbiamo messo il wrap. Loro ci metteranno gli stunt."

**Esempi di microcopy nel tono giusto** (proposte, da validare)
- Bottone configuratore: "Fallo mio" / "Manda a Paolo"
- Stato vuoto upload: "Scatta una foto della tua porta. Al resto pensiamo noi."
- Errore WebGL: "Il tuo browser non regge il 3D. Le foto però sì."
- 404: "Questa pagina l'abbiamo wrappata così bene che non si trova più."

## 7. Elementi visivi propri di WOW (da usare nel sito)

- **La pellicola che si stacca.** È il gesto del mestiere: angolo che si solleva, riflesso, retro della pellicola con la carta siliconata. È la metafora centrale delle transizioni.
- **L'officina con i LED a chevron.** Pareti nere e tubi LED bianchi a "V" ripetuti: è la firma visiva del Garage. Ricostruibile in 3D come set del configuratore e della hero.
- **Etichette rosse e frecce bianche fatte a mano.** Il linguaggio grafico dei reel Interior: etichetta rossa con testo bianco "a pennarello", freccia disegnata che indica la parte rivestita.
- **Il campionario a ventaglio.** Le mazzette di finiture aperte a ventaglio: perfetto come selettore di finiture nel configuratore Interior.
- **Gli strumenti.** Spatola, pistola termica, taglierino, rotolo: oggetti 3D o icone di microinterazione (es. cursore a spatola nel prima/dopo).
- **Bande nere cinematografiche.** Nei reveal Garage: formato 2.39:1, parola singola in serif bianco.
- **La serialità.** "EP. 1", "Il prossimo episodio", "CONTINUA". I casi studio possono essere raccontati a episodi.
- **Brindisi.** Il centro, le attività storiche, la festa di San Teodoro. È il vantaggio che nessun concorrente nazionale ha.

## 8. Fotografia e video

- Si mostrano **solo lavori veri** (cartella `materiale/`). I crediti dei fotografi restano visibili (es. BMW E92: ph @_denicola.simone_ e @desalvatorealan).
- Il prima/dopo deve essere onesto: stessa inquadratura quando possibile, niente ritocchi che cambiano il risultato.
- Garage: grade scuro, contrasto alto, dettagli ravvicinati (cerchi, scaglie, riflessi), mezzi in movimento.
- Interior: luce naturale, toni caldi, dettagli della materia (venatura, bordo rifinito, angolo), ambiente intero dopo.
- Le immagini AI (Adobe Firefly o altro) sono ammesse **solo** per sfondi, texture, stanze del configuratore e ambientazioni, e vanno marcate `"ai": true` in `content/media.json`. Mai un'immagine AI spacciata per un lavoro.

## 9. Proprietà intellettuale

Alcuni lavori reali si ispirano a film (Cars, Dragon Trainer). Nel sito si mostrano le **foto del lavoro**; il riferimento al film si cita nel testo come descrizione del progetto (es. "BMW E92, livrea ispirata a Cars"). **Non** usare loghi, personaggi, font o immagini ufficiali dei film come elementi grafici del sito, e non proporre livree a tema film già pronte nel configuratore. Chi carica il proprio logo nel configuratore dichiara di averne i diritti (una riga di testo basta).
