# Loop-test Phase 1 — portrait match to the vert anchor

Status: canon (active build spec for `Swordforge_new_looptest.html`, portrait)
Date: 2026-08-13
Branch: `sword-forge/dual-orientation-anchor-rework`
Builds on: [2026-08-13-looptest-layout-skeleton.md](2026-08-13-looptest-layout-skeleton.md) (Phase 0 skeleton)
Anchor: `assets/Anchor-images/sword-forge-anchor-vert.jpg`

## Goal

Make the **portrait** loop-test read like the vert anchor, on top of the Phase 0
data-driven skeleton. Two sub-passes:

1. **Structure pass** (no art spend) — new zones (HUD bar + vertical right rail),
   diorama re-composition via the `LAYOUT` table, cozy CSS. Uses existing assets +
   emoji/CSS placeholders for anything missing.
2. **Art pass** (AFK, NB Pro, <= $10) — generate the missing art on a green screen,
   chroma-key to transparent PNG, wire in, replacing placeholders. Show all, then ask.

Scope decisions (owner-approved 2026-08-13):
- **Map**: keep the ore-path fog mechanic; only cozy the parchment + add a compass.
- **HUD**: add the anchor's top bar (Gold, Recipe Book, Star Level, Skill Tree, back) as
  **styled non-functional placeholders** (this is a loop-test).
- **Ore rail**: move the horizontal ore shelf to a **vertical right-edge rail** (makes the
  Phase 0 "rail zone" real for portrait).
- **Art**: NB Pro (`nano-banana-pro`), green-screen elements + opaque backgrounds,
  chroma-keyed. AFK budget **$10**; beyond that, show everything and ask.

## Zones (portrait)

Grid of `#frame` becomes 2-column so the rail runs down the right beside both map and bench:

```
grid-template-columns: 1fr var(--rail-w)      /* --rail-w ~ 15% (~86px @568) */
grid-template-rows:    auto 42% 1fr           /* hud / map / bench */
grid-template-areas:
  "hud  hud"
  "map  rail"
  "bench rail"
```

- `hud` (full width): Gold pill | Recipe Book | Star Level (stars) | Skill Tree | back. The
  heat gauge relocates to a small overlay in the bench near the furnace (loop-test element,
  absent from the anchor).
- `map` (left, ~42%): ore-path map, cozied parchment + compass.
- `bench` (left, remainder): the diorama. Now narrower (rail took the right strip).
- `rail` (right, spans map+bench): `#oreShelf` moves here, becomes a vertical scroll column
  of metal tiles (icon + count). Zone-filling (CSS), not a `LAYOUT` prop.

Landscape stays the Phase 0 stub (parity only); real landscape is Phase 2.

## LAYOUT — portrait (RECORDED, Phase 1 composition)

Fractions of the **bench** zone (bench = left column, rail excluded). These are DESIGN
values chosen to match the anchor composition (cross-checked visually + in-zone), not
measured from the old build. `oreShelf` LEAVES the table (it is now the rail, CSS-filled).
`x,y,w` only (heights art-aspect-driven). Drift test asserts `LAYOUT.portrait` == this table.

Final values after the composition loop (r2). `x,y,w`:

| Prop (id)     | x    | y    | w    | anchor placement |
|---------------|------|------|------|------------------|
| `stSmelt`     | 0.24 | 0.04 | 0.54 | furnace, dominant upper-center |
| `stMortar`    | 0.66 | 0.28 | 0.30 | mortar, right-mid |
| `pestle`      | 0.70 | 0.16 | 0.13 | standing in the mortar |
| `hammerTool`  | 0.28 | 0.52 | 0.13 | near the anvil |
| `stAnvil`     | 0.30 | 0.60 | 0.40 | anvil, LARGE front-center bottom |
| `bucket`      | 0.68 | 0.72 | 0.30 | water bucket, bottom-right corner |
| `dragon`      | 0.01 | 0.74 | 0.24 | dragon whelp, bottom-left corner |

In-zone check (x>=0, y>=0, x+w<=1, y<=1): all pass.

## Composition loop (art-director gated, 2026-08-13)

A visual art-director subagent (Sonnet, per Model-Selection SSOT for bounded visual review)
scored each headless-Edge render of the live page against the vert anchor; gate = >=80% or
5 rounds. Renders via headless MS Edge (`--headless=new --screenshot`, file://) since the
in-app Browser pane does not composite here.

- **Baseline 55%** — macro zones right, but forge props too small/high (empty floor), map bare.
- **Round 1 -> 70%** — scaled up + packed the diorama (furnace dominant, anvil/mortar/bucket/
  dragon larger); added `xNN` count badges to the rail.
- **Round 2 -> 80% (gate met)** — painted territory map (`assets/map/territory.png`, NB Pro
  ~$0.24) wired into the SVG world under the ore-path markers/fog (mottled blobs hidden,
  RNG sequence preserved); lowered bucket + dragon into the bottom corners.

Director verdict at 80%: "clearly the same composition as the anchor." Remaining items are
either mechanic-intentional (the `?` markers are the hidden-trait reveal; dashed routes are
the procedural ore-paths, fogged until explored) or optional polish (standalone bellows,
relocating the tutorial hint box). Stopped at the gate per the owner's rule.

### Rounds 3-5 — exact anchor-cut props + Opus art director (owner-directed 2026-08-14)

Owner directed literal element extraction from the anchor (not style-match) + a stricter
element-level director. Element art now comes FROM the anchor:

- Anchor regions cropped locally, **uploaded to the LILA image-host repo** (owner authorized
  anchors/seeds there 2026-08-14) and passed to NB Pro `edit_image` by raw URL to redraw each
  element isolated + completed on magenta, then chroma-keyed. **No base64 inputs** (global
  policy updated: always host, never base64). Assets: `assets/forge/anchor_{furnace,bellows,
  anvil,hammer,mortar,pestle,bucket,mug}.png`, `assets/backgrounds/anchor_bench_bg.png`
  (thin dark wall + stone floor), map re-toned to `assets/map/territory.png` (parchment).
- Mechanics preserved through the art swap: bellows is now a standalone left prop (pump anim +
  `#bellowHot` moved); `#furnaceGate` re-aimed at the anchor furnace's lava mouth; the mug is a
  separate cut with its own `LAYOUT.mug` key and CSS tip, bucket is a single cut (front layer
  hidden); hammer/pestle pre-posed.
- **Opus** art director (Model-Selection SSOT: judgment task) scored element identity + composition
  each round; **Sonnet** did the earlier composition rounds. r3 62% -> r4 81% (PASS: >=80 and no
  element < 60) -> r5 polish (closed the empty mid-floor band by lifting the anvil group, un-clipped
  the mortar, cleared the furnace crown, steepened the pestle, moved the hint box to the bottom).
- In-zone EPS relaxed to 0.08 to allow intentional edge bleeds (furnace crown, dragon/anvil off-left).

Phase 1 art spend ~$4.9 of the $10 budget. Anchor seed crops pruned from the host repo after use.

## LAYOUT — landscape (PROVISIONAL, parity-only)

Same 7 keys (drop `oreShelf`). Values rough, in-zone; tuned in Phase 2.

## Invariants (self-test, unchanged from Phase 0 + updated RECORDED)

`?test` self-test: in-zone (both orientations), parity (portrait keys == landscape keys),
drift (portrait == RECORDED table above, key-set + per-value). `oreShelf` removed from
RECORDED. `?wire` overlay still draws zone + prop boxes.

## Art pass — generation plan (NB Pro, green-screen, chroma-keyed)

Model: `nano-banana-pro` (owner-named this turn; overrides the default-nano cost policy for
this task). Verify the id via `list_models` before the first call. Generate on a solid
**green** background for foreground elements (chroma-key green -> alpha -> PNG); backgrounds
are opaque full images. Save to `assets/` sub-folders; wire by relative path.

Candidate assets (finalize + cost before spending; est ~8-12 imgs x ~$0.24 ~= $2-3):

1. Background panel: wooden wall + stone floor behind the diorama (opaque). `assets/backgrounds/`
2. HUD icons: Recipe Book, Skill Tree, gear, back arrow (green-screen). `assets/ui/`
3. Compass rose (green-screen) for the map. `assets/map/`
4. Metal icons: ember / frost / tide / gale (green-screen), replacing the SVG placeholders. `assets/forge/`
5. Furnace smoke / steam puff (green-screen). `assets/forge/`

### Ref-lock constraint (recorded decision)

The image-hosting policy forbids uploading proprietary/unreleased art to the PUBLIC GitHub
host. The anchor + existing game assets are proprietary, so they are **NOT** uploaded as
generation seeds. Generations are **text-prompt-driven** to match a described style (cozy
hand-illustrated, warm ember-lit, painterly parchment). Style match is close, **not
pixel-locked**. Tighter lock would need a private host (owner can provide one later).

### Budget / AFK rule

Autonomous generation + wiring up to **$10** total. On reaching it (or finishing the list
under it), stop, present every generated asset in full, and ask before any further spend.
Chroma-key pipeline: green -> alpha via a local script (PIL/ImageMagick), verified per asset.

## Art pass — DONE (actuals, 2026-08-13)

Model `nano-banana-pro` (google/gemini-3-pro-image-preview), owner-authorised. Generated on
magenta chroma (#FF00FF — safe for green/blue/orange/grey subjects, unlike green), keyed to
transparent PNG via `scratchpad/chroma_key.py` (magenta metric = min(r,b)-g, despill + autocrop).
Text-prompt only (no proprietary seed uploaded, per the ref-lock decision). Spend: **~$2.18**
(8-icon batch $1.94 + bg $0.24) of the $10 AFK budget — well under, list complete.

Wired assets:
- `assets/backgrounds/forge_room_bg.png` — bench background (opaque).
- `assets/ui/icon_recipe.png`, `assets/ui/icon_skilltree.png` — HUD buttons.
- `assets/map/compass.png` — map corner.
- `assets/forge/ember_ore.png` / `frost_ore.png` / `tide_ore.png` / `gale_ore.png` — ORES[].img,
  replacing the SVG placeholders in the rail + map.
- `assets/forge/smoke.png` — furnace smoke (CSS rise animation, decorative).

Verified: all load (naturalWidth > 0, no 404), self-test GREEN, no console errors. Visual match
to the anchor is the owner's call (no in-harness screenshot).

## Sequence

1. **Structure pass** (this spec, no spend): zones + rail + HUD + LAYOUT recomposition + CSS.
   Verify (self-test GREEN, ore tray builds in the rail, drag targeting + pipeline intact,
   no console errors). Commit.
2. **Art pass** (AFK <= $10): generate -> chroma-key -> wire -> show all -> ask. Commit.

## Verification

Blind visual critic can't run in-harness (Browser pane does not composite here). Owner is
the visual judge. In-harness: self-test, geometry/in-zone via `javascript_tool`, console
errors, ore-tray + drag + pipeline smoke.

## Non-goals (Phase 1)

- Landscape tuning (Phase 2).
- Wiring Recipe Book / Skill Tree / Star Level functionality (placeholders only).
- Reworking the ore-path map mechanic (kept; parchment cozied only).
- Minigame-feel tuning (Task 2, separate).
