# Come usare questa cartella con Claude Code

Questa cartella è il punto di partenza del nuovo sito WOW. Dentro c'è tutto quello che Claude Code deve sapere: il brand, i contenuti, la mappa del sito, i configuratori, le regole. Manca solo il tuo materiale.

## 1. Prepara la cartella

1. Estrai lo zip dove vuoi tenere il progetto (es. `Documenti/wow-sito`).
2. Copia foto e video dei lavori in `materiale/interior/` e `materiale/garage/`, una cartella per progetto. Le istruzioni sono in `materiale/LEGGIMI.md`.
   - Da iPhone: esporta gli **originali non modificati** (Foto → seleziona → Condividi → Opzioni → "Tutti i dati delle foto"), oppure AirDrop sul Mac.
   - Il MacBook ha 256 GB: se i video sono tanti, tieni gli originali lunghi su un disco esterno e copia qui solo quelli che servono.
3. Se ce le hai, aggiungi: i loghi in vettoriale e il logo WOW viola in `brand/logo/`, le foto del campionario in `materiale/campionario/`.

## 2. Avvia Claude Code

- Dall'app Claude per desktop: apri **Claude Code** e scegli la cartella `wow-sito`.
- Oppure dal Terminale: `cd ~/Documenti/wow-sito` e poi `claude`.

Se Claude Code ti chiede di installare Node.js, ffmpeg o altro, lascialo fare: servono per costruire il sito e preparare foto e video.

## 3. Incolla il prompt

Apri `PROMPT.md`, copia il testo da "Ciao Claude" in giù e incollalo nella chat di Claude Code.

Claude non scriverà subito codice. Prima ti manda:
- un piano breve;
- 3 idee diverse per la home in 3D e per il passaggio tra Interior e Garage;
- la lista di cosa manca;
- al massimo 5 domande.

Rispondi, scegli l'idea che ti piace e scrivi **ok**. Da lì procede per fasi: alla fine di ogni fase ti dice cosa guardare e come aprirlo nel browser.

## 4. Consigli

- Una fase per volta. Guarda il risultato sul computer **e** sul telefono prima di dire ok alla fase dopo.
- Se qualcosa non ti piace, dillo come lo diresti a un grafico: "il nero è troppo piatto", "la transizione è lenta", "questa foto non rende".
- Quello che Claude non sa (prezzi, orari, recensioni, codici delle finiture) finisce in `docs/TODO-PAOLO.md`: riempilo quando puoi.
- Adobe: se in Claude Code hai gli strumenti Adobe collegati, Claude li userà per scontornare, allargare foto e generare sfondi. Se non ci sono, il sito si fa lo stesso.
- Il sito attuale resta online. Il nuovo va prima su un indirizzo di prova; il passaggio lo decidi tu.

## Cosa c'è nella cartella

| File | A cosa serve |
| --- | --- |
| `PROMPT.md` | Il messaggio da incollare per iniziare |
| `CLAUDE.md` | Le regole che Claude Code legge in ogni sessione |
| `docs/BRAND.md` | Identità: due mondi, colori, font, loghi, tono di voce |
| `docs/CONTENUTI.md` | Servizi, progetti veri con i link ai post, contatti, oscuramento a norma, cose da non dire |
| `docs/SPEC-SITO.md` | Mappa del sito, 3D, transizioni, configuratori, SEO, messa online |
| `brand/` | Loghi ufficiali e token di colori e font |
| `materiale/` | Il tuo materiale (e alcuni fotogrammi già presi da Instagram) |
