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

## LAYOUT — landscape (RECORDED, loop r12)

Fractions of the **bench** zone (`x`=left, `y`=top, `w`=width; edge bleeds allowed, self-test
`EPS=0.08`, with a `-0.35` up-bleed exemption for `stSmelt`+`dragon`). Drift test in
`runLayoutSelfTest()` asserts `LAYOUT.landscape == RECORDED` (key-set + per-value) and the `bucket`
resolveLayout math. Parity: `LAYOUT.portrait` keys == `LAYOUT.landscape` keys. **r11–r12 sizes are
owner-directed and deliberately exceed the anchor element-% (bigger hero props) — the objective
element_size gate no longer applies to these; the owner's composition wins.**

| Prop (id)     | x     | y     | w    | placement (owner-directed r11–r12) |
|---------------|-------|-------|------|------------------|
| `stSmelt`     | 0.43  | -0.30 | 0.315| furnace **1.5× hero** + moved 5% left; bleeds up into the map, base on the floor |
| `stMortar`    | 0.72  | 0.12  | 0.28 | grinding wheel (anchor cut), right; bleeds into the rail |
| `pestle`      | 0.75  | 0.24  | 0.09 | hidden in landscape (parity only) |
| `hammerTool`  | 0.22  | 0.28  | 0.195| hammer **1.5×**, across the anvil |
| `stAnvil`     | 0.15  | 0.34  | 0.30 | anvil **1.5×**, chunky left mass |
| `bucket`      | 0.01  | 0.50  | 0.15 | water bucket, bottom-left, moved up so it reads; z9 |
| `mug`         | 0.03  | 0.55  | 0.12 | copper mug **2× + flipped**, in FRONT of the bucket resting on the water (z10) |
| `dragon`      | -0.04 | -0.18 | 0.19 | dragon whelp, moved up-left (clips off the edge), **layered above everything** (z30); art 2×−15% via `.dragoncrop` |

`stMortar` renders `assets/forge/anchor_grindwheel.png` (the cut) instead of the mortar; the
`pestle` is hidden (`#pestle{display:none}`). The smelter (`assets/forge/anchor_furnace.png`) was
**re-cut from the anchor** (r10) as one tall unit — tapered stone tower + crossed A-frame + the
molten **pot baked into the flared rim** — so the separate `.cauldron` overlay is now
`display:none` (Opus art-director audit 38→71→80/100). Element-size widths matched to the anchor's
own element-% (furnace/anvil/wheel ≈ 1.0×). Bench floor warmed back toward the anchor's brown
flagstone (`#bench::before` wash reduced to 0.09). Map palette fixed by neutralising the
over-saturation filter (0.325 FAIL → 0.155) + a torn parchment deckle (`#board` clip-path) on a
dark forge-wall backing (`#map-wrap`).

**Owner-directed polish (r11–r12).** Sizes bumped past the anchor for a bigger hero read (furnace/
anvil/hammer 1.5×, mug 2×, dragon 2× then −15%); furnace moved 5% left and its base anchored to the
floor while it bleeds up into the map; map row extended 52% → **54%**. The **bellows was re-cut from
the anchor** (`assets/forge/anchor_bellows.png`) — the prior asset was a flat paddle; the new cut is
the full leather+wood accordion (nozzle + ring handle), placed front-right with the nozzle into the
furnace (Opus audit **79/100 SHIP** after adding a `#stSmelt{z-index:3}` so the wheel stops occluding
the ring). Layering: **dragon z30** (above everything), **furnace z3** (above the wheel), **mug z10 >
bucket z9** (mug rests in front on the water). Removed a faint seam across the furnace at the map/
bench boundary — three overlapping causes: `#map-wrap` `border-bottom`, the `#bench::before` grey
wash (only covered the bench half of the crossing prop), and the `#map-wrap::after` bottom inset
band; all cleared. **`?clean`** URL flag hides loop-test/tutorial chrome (badges, hint bar, gauge,
station captions, zoom) for anchor-match renders — gameplay untouched.

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

### Objective-gate era (r8–r10) — subjective Opus score retired

Owner rejected the drifting subjective 0–100 ("not matching"). Replaced it with **deterministic gates**
(`tooling/anchor-match/`: `screen_gate` per-region palette histogram distance + `element_size` pixel-%),
the subjective score kept only as an art-director tie-breaker. See that folder's README.

- **r8** — pixel-% size fix: `element_size` exposed the earlier critic's overshoot (furnace 1.42×, anvil
  1.35× too big; bellows 0.77× too small) → widths matched to the anchor's element-% (≈1.0×). Rail bg =
  **anchor-cut wood board** (`assets/ui/rail_wood.png`, rail region 0.552→0.197). `#bench overflow:visible`
  → cauldron/wheel cross-zone bleed. Furnace flipped.
- **r9** — bellows enlarged (height ratio 0.54→0.99).
- **r10** — map over-saturation filter neutralised (**map palette 0.325 FAIL → 0.155**); torn parchment
  deckle on a dark-wall backing; HUD chrome = **anchor-cut grey-stone plaque** (9-slice `border-image`,
  `assets/ui/plaque_stone.png`) + gold gear on Skill Tree; rail narrowed + dark wall gutter + filled board;
  floor warmed; **bucket moved bottom-left** (mug seats in it); **smelter re-cut** as one tall seated-pot
  unit (Opus audit 38→71→**80/100**); **dragon re-cut** to the anchor's winged whelp; **`?clean` render
  mode** hides loop-test/tutorial chrome. **Overall palette 78→~81, all 9 regions PASS.**

Verdict at r10: reads as the anchor blacksmith screen with objective per-region backing. Residual harsh-eye
nits (not gated): HUD icons are emoji vs the anchor's shield/pouch/scroll; rail right column is ore vs the
anchor's polished gems; the smelter pot reads slightly large vs the anchor's tower. Each needs a bespoke cut.

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
