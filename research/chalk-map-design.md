# Chalk-Map Redesign — Design Notes & Prototype

**Status: exploration / prototype only. NOT wired into the shipped game (`index.html`).**
This captures an in-progress redesign of Sword Forge's exploration half and the standalone
prototype that tests its feel. The shipped game still uses the 50×50 grid (see
`specs/game-design.md`). Nothing here has been ported.

Files:
- `research/map_test.html` — the standalone prototype (open via a served origin, not `file://`).
- `research/map_test.png` — a hand-authored 1890×1890 "chart" (terrain + baked-in markers).
- `research/chalk.png` — the chalk sprite (1065×1397; its **lower-right end is the writing tip**… in the
  prototype the **upper-left tip** is used as the draw point — see "Chalk tool" below).

Live prototype (auto-deploys with the repo): https://lila-games-github.github.io/sword-forge/research/map_test.html

---

## 1. The vision (why change the map)

Replace the current metal-fuelled, tile-by-tile grid movement with a **chalk-drawing** metaphor:
the blacksmith draws lines on a **chart** to discover traits and the sword-crafting process. This
reframes exploration as planning a route on a chart rather than walking a dungeon.

**Intended core loop (day/night):**
1. **Dawn** — the smith wakes with **one piece of chalk** = a fixed daily **distance budget**.
2. **Draw on the chart** — hold the chalk and drag; the tip traces a path, revealing fog and
   discovering markers along the line. Dark zones are hazards.
3. **Gather / craft / sell** during the day.
4. **End Day** (player taps a button) → **night → sleep → reset**: wake up next day with fresh chalk.
   The day/night cycle is a **reset**, not a real-time clock.

## 2. Systems (as discussed with the owner)

- **Charts (multiple):** a **main chart** holds the **24 traits**. Then **24 more charts**, one per trait,
  hold the different **shapes** for that trait. Charts don't change between days (the layout is fixed;
  fog/discoveries persist as you explore across days).
- **Chalk = movement budget:** metals no longer move anything. One chalk per day limits distance drawn.
  When the smith is exhausted (budget spent) the chalk is put down; a new day gives fresh chalk.
- **Ores → ingots:** ores (iron, magnesium, silver) are gathered **from caves** — a **separate activity,
  not part of chart exploration** — then **smelted into ingots via the heating minigame**. Ingots feed forging.
  (This dissolves the current 8-metals-as-movement system; reconciling recorded compositions, which store
  metal counts, is an open task.)
- **Markers on the chart:**
  - **Red `?`** = a hidden **trait**. Reaching it (when unlocked) gathers/discovers it.
  - **3 purple dots around each trait** must all be gathered to **unlock that trait for gathering**.
  - **Green dots** = **XP**; each has a **5% chance to also yield a sword-part design**.
- **Hazard (dark zones):** entering drains HP. When HP is depleted the smith is **exhausted and rests in
  place for 10 seconds** (drawing blocked), then recovers to full — **no reset/teleport**.
- **XP → skill tree:** green-dot XP feeds a skill tree (nodes TBD — e.g. longer chalk, wider vision,
  cheaper unlocks). **Design deferred.**

## 3. How it maps onto the shipped game

- **Replaces:** the grid, `move()`, the Purify dash, hazard-on-landing, the 8 metals as directional fuel,
  and the tile art (spec §3). The "Chart" stops being a minimap and becomes the exploration surface.
- **Keeps (largely intact):** the heating minigame (now also used to smelt ore→ingot), the forge pipeline
  (shape → hammer → quench → design → sharpen), traits → quality → value, customers, shop, compositions
  (recipes re-denominated in ingots).
- **New:** day/night reset, chalk budget, ore/cave gathering + smelting, XP + skill tree, per-trait shape charts.

## 4. Prototype (`research/map_test.html`) — how it works

A single self-contained HTML file. Same spirit as the game (vanilla, no deps), but **canvas-based**:
- **Render:** one `<canvas>` draws the chart via a camera transform (`translate(pan)·scale(zoom)`); an
  **offscreen fog canvas** is composited *inside* that transform so fog tracks zoom/pan.
- **Input:** Pointer Events (touch + mouse). `touch-action:none`. **One finger** = grab the chalk (if the
  touch lands on the chalk sprite) and draw, else **pan**; **two fingers** = pinch-zoom + pan; **± buttons** zoom too.
- **Chalk tool:** the chalk sprite's **upper tip** is the draw point. You **grab anywhere on the chalk**
  (records the finger↔tip offset) and it **only draws while you move** (a relative drag — the path stays
  **offset from your finger**, so the finger never covers the drawing point). A pure tap draws nothing.
- **Hazard:** the map is read into an offscreen pixel buffer; a point is hazardous when the **tan terrain**
  under it is dark (light bg ≈ luminance 200, dark squiggle ≈ 150; threshold `HAZ_LUM`). Coloured dots are
  excluded by hue. `findSpawn` puts the smith on walkable ground.
- **Markers auto-detected from the art:** red/green/purple pixels are colour-classified and clustered into
  blobs. Red clusters (merging each `?` glyph with its dot) → trait positions; the 3 nearest purple blobs
  per trait → its unlock dots; green blobs → XP pickups. So the interactive markers **sit on the baked-in
  art**. (Note: the hand-drawn `map_test.png` doesn't have exactly 3 purples near every `?`, so some
  traits unlock with fewer — real charts should place a consistent 3.)
- **Fog of war** reveals a small radius around the tip as you draw.
- **HP + Chalk bars**, **Day** counter, **Parts** counter, **End Day** button (refills chalk + HP, wakes
  the smith at spawn, keeps fog/discoveries).

### Current tuning constants (top of `map_test.html`)
`CHALK_MAX = 1300` (daily distance), `HAZ_DMG = 70`/s, `FOG_REVEAL = 20`, `DISCOVER_R = 55`, `DOT_R = 46`,
`GREEN_PART_CHANCE = 0.05`, `ZOOM_MIN/MAX = 1/9`, `MARKER_FONT = 8`, `CHALK_TIP = {fx:0.10, fy:0.08}` (upper tip).

### Verifying the prototype
Serve it (don't open `file://` — `getImageData` taints on file origin). The `requestAnimationFrame` loop is
**throttled in a background/headless tab (~1 fps)**, so movement can't be exercised via headless automation —
open it in a foreground tab / on a phone to judge feel. `window._t` exposes state for debugging
(`sword`, `cam`, `traits`, `greens`, `isHazard`, `chalkRect`, …).

## 5. Open questions / not yet decided
- **Ore/ingot material system** — how it replaces the 8 metals; how recorded compositions (metal counts) migrate.
- **Skill-tree nodes** and XP costs.
- **Per-trait shape charts** — how the 24 sub-charts are authored/generated and navigated.
- **Chart authoring** — markers are currently detected from baked-in colours; a data file of `{x,y,type}`
  may be cleaner for precise placement.
- **Higher-res chart** — at 9× zoom the 1890px image softens; deep zoom needs a bigger source.
- Whether ore gathering is its own mini-map/screen or a simple action.
