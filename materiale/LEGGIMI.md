# materiale/ · le foto e i video di WOW

Qui vanno **gli originali** di Paolo: foto e video dei lavori, così come escono dal telefono o dalla macchina fotografica. Claude Code non li modifica mai: li legge, li cataloga e crea le copie ottimizzate in `public/media/`.

## Come organizzarli (per Paolo)

Una cartella per progetto, dentro il mondo giusto. Il nome della cartella è il nome del progetto, in minuscolo, con i trattini.

```
materiale/
├── interior/
│   ├── panificio-marangio/
│   ├── jova-summer-party-container/
│   ├── bigodino-doro/
│   ├── wrapping-infissi-<cliente-o-zona>/
│   ├── cucina-arancione-avorio/
│   ├── international-school-brindisi/
│   ├── ohana-park/
│   ├── tt-engineering-lecce/
│   └── ...
├── garage/
│   ├── bmw-e92-saetta-mcqueen/
│   ├── ktm-790-sdentato/
│   ├── cigarette/
│   ├── furgoni-70/
│   ├── oscuramento-vetri/
│   ├── sea-doo/
│   └── ...
├── officina/          ← foto e video dell'officina vuota, dei LED a chevron, degli attrezzi, di Paolo al lavoro
├── campionario/       ← una foto per ogni finitura (vedi sotto)
├── video/             ← video originali lunghi, se non stanno in una cartella di progetto
└── da-instagram/      ← fotogrammi presi dai post, già messi da Claude (vedi sotto)
```

Non serve rinominare i singoli file: bastano le cartelle. Se vuoi aiutare, metti nel nome `prima`, `dopo` o `dettaglio` (es. `IMG_1234-prima.jpg`).

Se in una cartella c'è qualcosa da sapere (cliente da non nominare, foto di un fotografo da citare, data del lavoro), aggiungi un file `note.txt` con due righe, per esempio:

```
Cliente: si può nominare
Foto di: @_denicola.simone_
Fatto a: settembre 2026
Materiali: Metamark
```

## Il campionario (per il configuratore Interior)

Per ogni finitura che vuoi far provare nel configuratore:

- una foto **dritta**, dall'alto, del campione intero, con luce diffusa (vicino a una finestra, senza sole diretto e senza flash);
- un foglio bianco accanto, così si possono correggere i colori;
- il nome del file = marca e codice o nome della finitura (es. `coverstyl-XX00-rovere-naturale.jpg`).

Più finiture fotografi, più il configuratore è vero. Meglio 15 finiture vere che 100 inventate.

## Video

- Gli originali (non quelli scaricati da Instagram, che sono compressi). Vanno bene anche girati lunghi: Claude Code ne ricava loop brevi.
- I video dell'officina che si accende, della pellicola che si stacca e della spatola sono oro per il sito.
- Se puoi, registra anche **l'audio** di una pellicola che si stacca, vicino al microfono, in silenzio: diventa il suono del sito.

## Persone nelle foto

I clienti e i passanti si riconoscono? Il sito li mostra in grande solo se hai il loro permesso. Scrivilo in `note.txt` ("ok volti" oppure "niente volti").

## da-instagram/

Fotogrammi e immagini presi dai post Instagram di settembre e ottobre 2026, a bassa risoluzione (720×1280 per i video, circa 1000×1250 per le foto). Servono come **riserva** e come riferimento per capire i progetti. Quando c'è l'originale in `interior/` o `garage/`, usa l'originale.

| Cartella | Post di origine | Crediti |
| --- | --- | --- |
| `garage/bmw-e92-saetta-mcqueen/` | instagram.com/p/Dd80-xyiAwR · instagram.com/reel/DeRh6RiI2h2 · instagram.com/reel/DdwJjHeIdfe | Foto `bmw_car_*`: ph @_denicola.simone_ e @desalvatorealan (crediti da mostrare) |
| `garage/ktm-790-sdentato/` | instagram.com/reel/DdelaTzIBGi · instagram.com/reel/Dd3ycNNIAXH | Fotogrammi dei reel WOW. Nei reveal c'è la proprietaria: chiedere il permesso per i volti |
| `garage/oscuramento-vetri/` | instagram.com/p/DcVxjbCDV6e e reel sull'oscuramento | WOW |
| `garage/furgoni-flotte/` | instagram.com/reel/DfCb7FYRufl | WOW |
| `interior/panificio-marangio/` | instagram.com/reel/DdBeLIGoNdd · instagram.com/reel/DeZFE8Io0uJ | WOW. I nomi `before`/`after` indicano il reel, non la fase: dentro il reel "after" ci sono anche fotogrammi del prima |
| `interior/jova-summer-party-container/` | instagram.com/reel/DdLskPgosBj | WOW |
| `interior/bigodino-doro/` | instagram.com/reel/Dck79S3NSjL | WOW |
| `interior/wrapping-infissi/` | instagram.com/reel/De1fn1iIQC1 | WOW. Le etichette ("PRIMA", "APPROVED") sono grafiche del reel, non vanno ritagliate e riusate come foto pulite |

Attenzione: sulla BMW ci sono decalcomanie che riproducono marchi del film Cars. Le foto del lavoro si possono mostrare, ma quei marchi non vanno usati come elementi grafici del sito (vedi `docs/BRAND.md` §9).
