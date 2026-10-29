# Design system WOW

Pagina viva: `/styleguide/` (solo sviluppo, non indicizzata). Catalogo foto e video: `/styleguide/media/`.

## Due mondi, un set di ruoli

Ogni blocco della pagina dichiara il suo mondo con `data-world="interior"` o `data-world="garage"`.
I componenti usano solo i ruoli, così cambiano pelle da soli:

| Ruolo | Interior (giorno) | Garage (notte) |
| --- | --- | --- |
| `bg` fondo | Carta `#F5F2EC` | Viola notte `#21152D` |
| `surface` | Bianco | `#2C2138` |
| `text` | Inchiostro `#0D1B2A` | `#F4F2F7` |
| `muted` | `#4F5966` (6,4:1) | `#B9B1C6` (8,4:1) |
| `heading` | Blu WOW `#044B94` | `#F4F2F7` |
| `accent` | Rosso WOW `#C01818` | Giallo fluo `#E5FF00` |
| `cta-bg / cta-text` | Rosso / bianco (6,2:1) | Fluo / nero (16,8:1) |
| `glow` | nessuno | Viola elettrico `#7C0ED7` (mai testo: 2,4:1) |

Tailwind espone i ruoli come utility: `bg-bg`, `text-heading`, `border-line`, `bg-cta text-cta-text`, `font-display`.

Scelta motivata: in `brand/tokens.json` il ruolo `heading` del Garage era il fluo. Qui i titoli Garage sono bianchi e il fluo resta il «colpo» (numeri, CTA, HUD), come chiede `docs/BRAND.md` §4: titoli enormi tutti fluo stancano e tolgono forza al colpo.

## Tipografia

| | Interior | Garage |
| --- | --- | --- |
| Titoli | Fraunces variabile, assi SOFT 60 e WONK 1 | Big Shoulders Display 850, maiuscolo |
| Testo | Inter Tight | Inter Tight |
| UI | Permanent Marker (solo 1-3 parole) | Chakra Petch 500 (HUD, numeri) |
| Reveal | | Instrument Serif maiuscolo |

Scala fluida uguale nei due mondi: `type-display-xl`, `type-display`, `type-h2`, `type-h3`, `type-lead`, `type-body`, `type-small`, `type-eyebrow`, `type-ui`.

Font self-hosted in `public/fonts/` (copiati da `scripts/fonts.mjs` dai pacchetti @fontsource, licenze OFL e Apache 2.0): 4 file per mondo, solo latino.

## Movimento

| | Interior | Garage |
| --- | --- | --- |
| Durate | 600 / 800 / 1000 ms | 250 / 380 / 500 ms |
| Curve | expo.out, power3.inOut | power4.out, expo.inOut, steps(4) per gli sfarfallii |
| Testo | righe che salgono una alla volta | parole che entrano a scatto |

In CSS: `--dur-fast`, `--dur`, `--dur-slow`, `--ease-out`, `--ease-in-out`. Per GSAP: `lib/motion.ts`.
Con `prefers-reduced-motion` le animazioni si fermano, le frecce compaiono già disegnate e i video restano sul poster.

## Componenti

- `components/ui/Logo` · loghi originali, proporzioni bloccate; `LogoSlot` per quelli in arrivo.
- `components/ui/Button`, `WhatsAppButton`, `WhatsAppFloating` · CTA sempre WhatsApp con messaggio del mondo (`lib/contact.ts`).
- `components/interior/MarkerLabel`, `HandArrow` · etichetta rossa a pennarello, freccia bianca che si disegna.
- `components/garage/HudTag`, `HudSpec`, `RollingNumber`, `Letterbox`, `ChevronLeds` · HUD, contachilometri, reveal 2.39:1, LED a chevron.
- `components/shared/PeelCorner` · interruttore di mondo (lembo di pellicola). Nella Fase 3 lancia la transizione WebGL.
- `components/shared/LinerPaper` · carta siliconata, il retro della pellicola.
- `components/shared/BeforeAfter` · prima/dopo con maniglia a spatola, da tastiera con un vero input range.
- `components/media/Picture`, `LoopVideo` · foto AVIF/WebP con segnaposto; loop che partono solo se visibili.
