# Loop-test Phase 2 — landscape match to the hori anchor

Status: canon (active build spec for `Swordforge_looptest_landscape.html`)
Date: 2026-08-14
Branch: `sword-forge/dual-orientation-anchor-rework`
Builds on: [2026-08-13-looptest-layout-skeleton.md](2026-08-13-looptest-layout-skeleton.md) (Phase 0 skeleton), [2026-08-13-looptest-phase1-vert-anchor-match.md](2026-08-13-looptest-phase1-vert-anchor-match.md) (Phase 1 portrait)
Anchor: `assets/Anchor-images/sword-forge-anchor-hori.jpg`

## Decision: separate file (owner, 2026-08-14)

Landscape ships as its own file **`Swordforge_looptest_landscape.html`** (a copy of
`Swordforge_new_looptest.html`), NOT the one-file orientation flip. Owner chose this to
iterate the landscape freely without touching the shipped portrait build. Portrait
(`Swordforge_new_looptest.html`) is unchanged. The eventual Path-Forge infusion into
`swordforgeV2.html` reconciles the two.

Owner directive: reuse the portrait anchor-cut props (furnace/anvil/dragon/mortar→wheel/
bucket/mug/hammer/bellows); the ONLY new element is the **grinding wheel** on the right of
the hori anchor (the portrait's mortar grinding block is replaced by it). Fresh $10 AFK art cap.

## Structure (landscape)

Wide phone frame: `#frame` is **1080×600** (viewport `width=1080`), `#frame.landscape` grid:

```
grid-template-columns: 1fr var(--rail-w)   /* --rail-w 15% */
grid-template-rows:    52% 1fr             /* map / bench (no hud row) */
grid-template-areas:
  "map  rail"
  "bench rail"
```

- **HUD** floats over the map (anchor style), NOT a grid row: `#frame.landscape > #hud` is an
  absolute vertical **wood-plaque column** top-left (Lv.15 LEVEL, Day 7, Gold, Recipe Book,
  Guide) via `.plaque`; `#skillBtn` is a separate absolute plaque top-right. `.map-tag` and the
  map `#compass` are hidden in landscape.
- **Map**: full-width parchment. Art is the anchor's own map, cut + cleaned (see below), wired as
  `assets/map/territory_hori.png` on `#mapArt` at `x0 y325 w2800 h1310` (so the 2.14:1 map fills
  the world band). The SVG camera is framed full-width: `INIT_W=2800, SWORD_SY=0.50, MAX_W=2800,
  INIT_REVEAL=1500`; **init view bug fixed** — the view was computed with the stale portrait
  `aspect=1.4` before `setView()` updated it (clamped y to 0 → empty parchment band); now
  `setView()` runs once to establish `aspect`, THEN the view is set. Hazard discs (`hazG`) and the
  `?` trait markers (`traitsG`) are `display:none` in landscape (baked map already shows the
  element icons); RNG/logic preserved.
- **Rail**: `#oreShelf` is a 2-column grid on a carved wood-plank panel (`#frame > #rail`
  background), ore icon + small bottom-corner count badge, no name labels.
- **Bench**: the diorama, props spread horizontally (below).

## LAYOUT — landscape (RECORDED, loop r7)

Fractions of the **bench** zone (`x`=left, `y`=top, `w`=width; edge bleeds allowed, self-test
`EPS=0.08`). Drift test in `runLayoutSelfTest()` asserts `LAYOUT.landscape == RECORDED` (key-set +
per-value) and the `bucket` resolveLayout math. Parity: `LAYOUT.portrait` keys == `LAYOUT.landscape` keys.

| Prop (id)     | x     | y     | w    | anchor placement |
|---------------|-------|-------|------|------------------|
| `stSmelt`     | 0.42  | -0.08 | 0.30 | furnace, dominant hero, centre (crucible bleeds up) |
| `stMortar`    | 0.68  | 0.12  | 0.30 | grinding wheel (anchor cut), right |
| `pestle`      | 0.75  | 0.24  | 0.09 | hidden in landscape (parity only) |
| `hammerTool`  | 0.20  | 0.28  | 0.14 | hammer across the anvil |
| `stAnvil`     | 0.10  | 0.34  | 0.27 | anvil, chunky left mass |
| `bucket`      | 0.63  | 0.52  | 0.16 | water bucket, lower-right of the furnace |
| `mug`         | 0.02  | 0.70  | 0.08 | copper pot, bottom-left corner |
| `dragon`      | 0.00  | 0.02  | 0.19 | dragon whelp, far-left, breathing right |

`stMortar` renders `assets/forge/anchor_grindwheel.png` (the cut) instead of the mortar; the
`pestle` is hidden (`#pestle{display:none}`). A glowing **cauldron** (`assets/forge/anchor_cauldron.png`,
cut from the anchor) is seated on the furnace crown as `.cauldron` inside `#stSmelt` (decorative,
not a LAYOUT key — keeps the 8-key parity). Bench floor is cooled toward grey flagstone via
`#bench::before`.

## Anchor-cut assets (this phase)

Same pipeline as Phase 1 (crop → host on the LILA repo `BiswajeetLila/Image-Hosting-for-LILA-Art-Skills`
via `gh api --input` → NB Pro `edit_image` isolate/clean on magenta → `chroma_key.py` → save →
prune the seed; **never base64 inputs**, global policy). New assets:

- `assets/forge/anchor_grindwheel.png` — the grinding-wheel lathe from the hori anchor's right side.
- `assets/forge/anchor_cauldron.png` — the glowing molten cauldron from the furnace crown.
- `assets/map/territory_hori.png` — the anchor's parchment map, cut (x0.135–0.875 × y0–0.63) and
  cleaned (removed the DAY badge / gear / rail edge / furnace crucible / dragon wing, kept terrain +
  dashed routes + element icons). Saved under a NEW name so the portrait build's `territory.png` is untouched.

Art spend this phase: **~$0.55** of the $10 AFK cap (3 NB Pro `nano-banana-pro` edits @ ~$0.14–0.18).

## Composition loop (Opus art-director gated, hori anchor)

A strict Opus art-director subagent blind-scored each headless-Edge render vs the anchor
(0–100 + per-prop fix fractions). Owner gate: **7 loops OR 95%, whichever first**. Renders via
headless MS Edge (`--headless=new --screenshot`, `file://`) — the in-app Browser pane does not
composite here, and the preview server serves the main dir (not the worktree), so the self-test is
also run via headless Edge with `--enable-logging=stderr` and grepped for the GREEN line.

- **r2 → 58** — baseline; bench composition right, map a washed-out watercolor with black corner gaps, props small.
- **r3 → ~65** — HUD gained Guide + dropped the star row; map saturated, hazard discs hidden; bellows shrunk.
- **r4 → 58** (fresh critic) — grinding wheel un-clipped; props still undersized; map still watercolor (biggest miss).
- **r5b → 61** — **anchor map cut** wired (`territory_hori.png`) + init-view bug fixed → map reads as the anchor territory; taller bench + up-scaled props.
- **r6 → 77** — **HUD restructured** to the left wood-plaque column + Skill Tree top-right; **cauldron** on the furnace crown; cooled floor; rail darkened, labels dropped.
- **r7 → 77** (map 87, bench 86, hud 62, rail 64) — rail wood-plank panel + tucked count badges; map torn-edge vignette; compass hidden; dragon un-clipped. **7-loop cap reached → stop.**

Verdict at r7: "reads as the same blacksmith landscape screen." The **ceiling** is the HUD
plate-chrome and the rail wood-grain/gem-cube treatment — bespoke UI *texture* art, not layout,
which would need more image-gen for framed-plate and wood-grain assets. Deferred (see below). This
matches the honest pre-run flag that 95% was unreachable in 7 loops and the cap would land in the low 80s
on the art-heavy regions (map/bench 86–87) with the whole-screen average dragged down by HUD/rail chrome.

## Functional verification

- `?test` self-test **GREEN** (in-zone both orientations, portrait↔landscape parity, landscape drift ==
  RECORDED, bucket resolveLayout math). Run via headless Edge console.
- Pipeline smoke (`?smoke`, temporary hook, since removed): `addOreDirect('copper') → setHeat(100) →
  ready() → openGate() → placeOnAnvil()` reached the anvil with no JS errors. All assets load.

## Look-vs-mechanic tradeoffs (landscape look build; revisit if infused)

- Map hazard discs + `?` trait markers hidden (the baked anchor map shows the element icons instead).
  The fog/RNG logic still runs; only the discs are hidden. `INIT_REVEAL` raised to reveal the whole
  framed band at start (less early-game fog).
- `pestle` grind interaction is dormant in landscape (grinding station is the wheel prop); the direct
  ore→furnace path is unaffected. Proper station minigames are the next task (Phase B, separate branch).

## Non-goals (Phase 2)

- Bespoke HUD plate-chrome art and rail wood-grain/gem-cube textures (the r7 ceiling; needs UI-asset gen).
- Wiring Recipe Book / Guide / Skill Tree functionality (placeholders).
- Station minigame feel (owner's next task — separate branch off this one).
