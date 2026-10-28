# wow-website

Sito ufficiale di WOW: **Interior Design** e **Big Sun Garage**.

- `CLAUDE.md`: regole del progetto (valgono in ogni sessione).
- `docs/`: brand, contenuti, specifica del sito, piano della Fase 0, `TODO-PAOLO.md`.
- `brand/`: loghi ufficiali e token di colori e font.
- `materiale/`: foto e video originali dei lavori (sola lettura).
- `content/media.json`: catalogo di foto e video. `public/media/`: le versioni ottimizzate.

## Comandi

Servono Node 22 e ffmpeg (`brew install ffmpeg` sul Mac).

```sh
npm install
npm run dev                 # sito in sviluppo su http://localhost:3000
npm run media               # foto: AVIF + WebP 640-2560, segnaposto sfocato
npm run video               # video: loop muti MP4 + WebM, poster
npm run build               # export statico in out/
npm run shots -- / /styleguide/media/   # screenshot 1440 e 390 (sito avviato su :3000)
```

Il catalogo media si vede in `/styleguide/media/` (solo sviluppo, non indicizzato).

## Come arriva il materiale

Paolo carica foto e video dalla galleria del telefono nella pagina privata
[Materiale WOW](https://claude.ai/artifact/GPgPzJtK23GuwpAarBCzRC), scegliendo mondo,
progetto, fase e volti. Claude scarica le schede e i file, poi:

```sh
npm run import:uploads -- --db <cartella-schede> --assets <cartella-file>
npm run media && npm run video
```

L'import ricompone i video caricati a pezzi, scrive gli originali in
`materiale/<mondo>/<progetto>/` con le note in `_caricamenti.json`, e le voci nuove
del catalogo nascono già con fase e volti indicati da Paolo (`"review": true` finché
alt e punteggio non sono scritti a mano).
