# Loop-test layout skeleton (Phase 0)

Status: canon (active build spec for `Swordforge_new_looptest.html`)
Date: 2026-08-13
Branch: `sword-forge/dual-orientation-anchor-rework`

## Goal

Replace the hardcoded-pixel layout of `Swordforge_new_looptest.html` with a **robust,
data-driven skeleton** so props are modular, movable, and reflow between portrait and
landscape. Art sits on top of the skeleton, not baked into it. This Phase 0 is a pure
**structural refactor**: portrait must play and read identically afterward (no visual or
behavioural change). Landscape is architected (defined) but only roughly tuned; the
anchor-match passes come later (Phase 1 portrait, Phase 2 landscape).

Anchors (visual targets for later phases, NOT this phase):
`assets/Anchor-images/sword-forge-anchor-vert.jpg` (portrait),
`assets/Anchor-images/sword-forge-anchor-hori.jpg` (landscape).

## Three layers

1. **Structure** — CSS Grid on `#frame` with named zones. Two `grid-template-areas`
   definitions (portrait / landscape), flipped by an `orientation` class on `#frame`.
2. **Placement** — a JS `LAYOUT` data table: every prop's position as *fractions of its
   containing zone*, with a `portrait` and a `landscape` variant. `resolveLayout()` (pure)
   converts a fraction entry + zone dims → pixel box; `applyLayout(orient)` writes the DOM.
   Moving a prop = editing one number here.
3. **Skin + wireframe** — a `?wire` / toggle debug mode that draws zone boxes + each prop's
   box + label with no art, so the skeleton is tunable before art is placed.

## Zones (portrait)

Grid rows of `#frame` (fractions of frame height, frame base 568×1010):

| Zone | Row size | Notes |
|------|----------|-------|
| `hud`   | `auto`     | ~3.37% (~34px) content-height header |
| `map`   | `33.17%`   | ~335px SVG board |
| `bench` | `1fr`      | remainder, ~63.5% (~641px); the crafting diorama; base **568×641** |

Landscape swaps the frame base to 1010×568 and uses a landscape `grid-template-areas`
(map + bench side-region; ore rail to the right per the hori anchor). Landscape zone
fractions are provisional until Phase 2.

## LAYOUT — portrait (RECORDED GROUND TRUTH)

Fractions of the **bench** zone (568×641), measured from the known-good current build
(`getBoundingClientRect` ÷ bench dims; equals each prop's inline `px ÷ 568|641`). `w` =
width as fraction of bench width; heights are art-aspect-driven (auto), so only `x,y,w`
are recorded. These are the values the drift test asserts `LAYOUT.portrait` equals.

| Prop (id)     | x     | y     | w     |
|---------------|-------|-------|-------|
| `oreShelf`    | 0.162 | 0.009 | 0.609 |
| `stSmelt`     | 0.331 | 0.137 | 0.507 |
| `stMortar`    | 0.172 | 0.306 | 0.155 |
| `pestle`      | 0.197 | 0.150 | 0.081 | rotated 10° — box from inline/CSS (left 112, top 96, w 46), not the rotated AABB |
| `hammerTool`  | 0.412 | 0.605 | 0.092 | rotated -50° — box from inline/CSS (left 234, top 388, w 52), not the rotated AABB |
| `stAnvil`     | 0.356 | 0.799 | 0.271 |
| `bucket`      | 0.655 | 0.702 | 0.187 | (drives bucketBack + mug + bucketFront, same origin) |
| `dragon`      | 0.158 | 0.786 | 0.173 |

## LAYOUT — landscape (PROVISIONAL, parity-only)

Same prop keys (parity required). Values are rough placeholders that satisfy the in-zone
invariant; tuned to the hori anchor in Phase 2. Ore rail sits to the right.

## Bench-relative constants (converted from fixed px)

Scale-independent, computed from bench dims at runtime:

| Constant | Old px | Fraction | Of |
|----------|--------|----------|----|
| `STRIKE_DIST` | 66 | 0.116 | bench width |
| `TOUCH_LIFT`  | 72 | 0.112 | bench height |
| orb size      | 38 | 0.067 | bench width |

## Invariants (the test seam)

`resolveLayout` + `LAYOUT` are the public seam. Behaviour asserted (both orientations):

1. **In-zone**: for every prop, `x ≥ -ε`, `y ≥ -ε`, `x + w ≤ 1 + ε`, `y ≤ 1` (ε = 0.03).
   No prop lands off its zone. (This is the project's core pain — placement off the area
   we want — encoded as a guard.)
2. **Parity**: `keys(LAYOUT.portrait)` === `keys(LAYOUT.landscape)`.
3. **Drift**: `LAYOUT.portrait` deep-equals the RECORDED table above (to 3 dp).

Encoded as `runLayoutSelfTest()` inside the HTML, auto-run when the URL has `?test`
(logs PASS/FAIL to console + returns a result object). Single-file; inert without the flag.

## Non-goals (Phase 0)

- No art/asset changes; no anchor matching; no minigame-feel tuning.
- Landscape is not tuned to the anchor (parity + in-zone only).
- Ore shelf stays a bench-anchored prop (the right-edge *rail zone* is a Phase 1/2 refinement).
