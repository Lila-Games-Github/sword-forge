# Asset payload diet (landscape loop-test)

**Date:** 2026-09-21 · **Build:** `Swordforge_looptest_landscape.html` · **Branch:** `tutorial-phase2`
**Status:** `canon` for how the build's art is sized and encoded.

## Problem

The build downloaded **50.57 MB across 43 images before the player could do anything**, and 70.76 MB
across every screen. If every image stayed decoded, that was **348 MB of RGBA**, which is above the
iOS Safari per-tab ceiling and the most likely cause of the white screens on real phones.

The cause was not the art. It was that almost every file was stored at many times the size it is ever
drawn at. Measured, not guessed:

| Asset | Stored | Drawn at | Over |
|---|---|---|---|
| `forge/iron_ore.png` | 1552x1440, 2.41 MB | **70 css px** | 22x linear |
| `forge/pickaxe.png` | 1984x2140, 2.84 MB | **54 css px** | 37x linear |
| `ui/icon_recipe.png` | 890x898, 1.05 MB | **29 css px** | 31x linear |
| `map/compass.png` | 948x944, 1.81 MB | **62 css px** | 15x linear |
| `forge/diary.png` | 2528x1684, 1.72 MB | 264 css px | 10x linear |
| `map/map_base.png` | 2948x2948, 15.38 MB | 2172 css px | 1.4x, but 33 MB decoded |

## Decision

**Resize each asset to 2x the widest box it is ever drawn in, and store it as WebP.** The art itself
is untouched: same pixels, same composition, no recrop.

**Why 2x.** `#frame` is a fixed 1080x600 CSS box. 2x covers a DPR-2 screen at 1:1 zoom. On a phone the
r134 fit picks a viewport *wider* than 1080, so the frame receives **fewer** device pixels than
1080 x DPR and 2x is already generous.

**Where the widths come from.** A measurement pass in the browser walked every screen, every modal and
every inventory tab, recording the largest box each asset was ever painted into, including CSS
backgrounds and SVG `<image>` hrefs. Elements that are `display:none` by default were forced visible
and measured. The three that still could not be measured carry an explicit reasoned override. Nothing
was read off the stylesheet by eye.

**Six overrides**, each with a reason recorded in `tooling/asset-diet/make-manifest.mjs`:

- `map_base` is a pannable, zoomable SVG world, so "display width" is the whole 2800-unit map rather
  than a box. Capped at **2048**: it is painted parchment under a fog layer and a trait overlay, so the
  softness is invisible, and the decode drops from 33 MB to 16 MB. That is the single biggest RAM win.
- The five full-frame scene backgrounds and `hammer_bg` cap at **1920**, already above 2x of the frame.
- `ui/plaque_stone.png` keeps its natural width. It is 9-slice chrome and its `border-image` slice of
  `64` is in **source** pixels, so resizing the file silently rescales the corners.

**Why not lazy-load per screen as well.** It was on the list, and it is no longer the lever that
matters: first paint is now 1.39 MB, so there is little left to defer. The remaining decode is
dominated by `map_base` alone, which is on the first screen and could not be deferred anyway. Doing it
would add per-screen load state to a single-file build for a small return. Left undone deliberately.

## How it was built, with no image tooling

This machine has no `sharp`, ImageMagick or ffmpeg, and the repo has no `package.json` and is not meant
to gain a toolchain. **The browser is the encoder.** `tooling/asset-diet/convert.html` loads each PNG,
downscales it, encodes WebP via `canvas.toBlob`, and POSTs the bytes to a dev-only `/__save` endpoint
added to `.claude/serve.js`, which writes them inside the repo root. None of this ships in the game.

Downscaling is done by **repeated halving**, not one big `drawImage`. Chrome's scaler samples a 2x2
neighbourhood, so going 1552 to 140 in a single step skips most source pixels and sparkles on detailed
art. Halving until the next halve would overshoot, then one final step, keeps every pixel contributing.

## Results

| | Before | After |
|---|---|---|
| **First paint** | **50.57 MB**, 43 files | **1.39 MB**, 43 files |
| Everything reachable | 70.76 MB | **2.30 MB**, 72 files |
| Decoded RGBA, all resident | 348 MB | **95.5 MB** |
| Masters on disk | 85.50 MB | 3.13 MB of WebP |

Target was "under 8 MB total". Delivered **2.30 MB**.

### Quality, measured

Mean absolute error per channel between each WebP and its PNG master, both drawn at the size the game
actually shows them. Under ~2 is invisible; under ~4 is fine for painted art.

| Asset | at | MAE |
|---|---|---|
| `Diary_base` | 1044x587 | **0.50** |
| `Bram` | 390x734 | 1.07 |
| `plaque_stone` | 426x152 | 1.03 |
| `hammer_bg` | 1080x590 | 1.52 |
| `cave_background` | 1080x600 | 1.57 |
| `shop_background` | 1080x599 | 1.60 |
| `customer_counter_background` | 1080x602 | 1.69 |
| `bedroom_background` | 1080x600 | 1.70 |
| `dragon` | 195x176 | 1.85 |
| `map_base` | 1200x1200 | 2.29 |
| `iron_ore` | 70x65 | 3.09 |

The worst case is a 70 px icon whose master was 1552 px wide.

## The trap: paths the code builds

A measurement sweep only sees the assets that happened to be on screen. Nine sites build their path at
runtime instead of writing it out, for example:

```js
const ddSrc = (k,f) => 'assets/sword-parts/'+DD_DIR[k]+'/'+f+'.png';
```

The first manifest therefore missed **64 files** (every sword-part skin, every customer portrait but
two, two of the three midblades), and the reference rewrite would have left them behind as PNG,
loading fine in the emulator and only breaking for a player who reached a flame grip. The manifest is
now built from whole **families** (directories the build reaches by construction) as well as from the
measurement, and all nine constructed suffixes were rewritten. **A grep for `.png` in the file is not
enough** to prove the rewrite is complete; grep for `+ '...png'` too.

Two `.png` strings remain in the file on purpose: `anchor_cauldron.png` and
`Anchor-images/landscape-scale-ref.png` appear **only inside comments** and are never fetched. They
were counted by the old scan, which overstated the original payload by 1.84 MB.

## Kept

The PNG masters stay in the repo. They are never fetched by the game, and keeping them means the diet
can be re-run at different targets without going back to the source art.

## Verified

- First paint 1.39 MB / 43 requests; all screens and modals 2.30 MB / 72 requests; **every request 200**.
- No broken image anywhere. The three `img` elements with an empty `naturalWidth` are the intentional
  placeholders `#screenArt`, `#dycImg` and `#orb-ore`, which have no `src` until the game sets one.
- A sword forged through the real craft path opens the design desk with **8 part images loaded, 0
  broken**, which exercises the constructed `ddSrc` path.
- `?test` layout self-test GREEN, `node tooling/mobile-fit/fit.test.mjs` GREEN.
- The only console 404 is `/favicon.ico`, which predates this work.

## Reproducing

```
node tooling/asset-diet/make-manifest.mjs          # measure -> targets
# open /tooling/asset-diet/convert.html in the preview, wait for the summary
```

`display.json` is regenerated by the measurement snippet recorded in this round's commit; re-measure
after any layout change that makes an asset bigger on screen, or it will be upscaled from too few
pixels.
