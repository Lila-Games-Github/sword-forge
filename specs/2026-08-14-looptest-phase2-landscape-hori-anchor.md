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

## LAYOUT — landscape (RECORDED, loop r15)

Fractions of the **bench** zone (`x`=left, `y`=top, `w`=width; edge bleeds allowed). Drift test in
`runLayoutSelfTest()` asserts `LAYOUT.landscape == RECORDED` (key-set + per-value) and the `bucket`
resolveLayout math. Parity: `LAYOUT.portrait` keys == `LAYOUT.landscape` keys.

**r13 supersedes the r11-r12 owner-directed hero sizing.** Those rounds scaled the heroes past the
anchor (furnace/anvil/hammer 1.5x, dragon/mug 2x) on the owner's call. The owner's 2026-08-18 greyscale
scale reference walks that back: measured against it, the build was **furnace 1.44x, anvil 2.09x,
grinder 1.87x, dragon 2.07x** too big, with the bucket (never given a hero bump) the only element
already correct. r13 re-derives every width from that reference, so the objective `element_size` gate
applies again.

| Prop (id)     | x     | y      | w    | placement (r15 = r13 scale match + owner sizing r14-r15) |
|---------------|-------|--------|------|------------------|
| `stSmelt`     | 0.489 | -0.816 | 0.218| furnace at the reference 0.190 of frame width; base on the floor, bleeds up over the map (r13, unchanged) |
| `stMortar`    | 0.722 | -0.289 | 0.209| grinding wheel 2x (r14) then **-30%** (owner r15); grounded |
| `pestle`      | 0.760 | 0.300  | 0.048| hidden in landscape (parity only) |
| `hammerTool`  | 0.224 | 0.449  | 0.150| hammer 0.5x (r14) then **+75%** (owner r15); anchored by its box top - its box runs off the frame bottom |
| `stAnvil`     | 0.170 | -0.249 | 0.173| anvil 1.5x (r14) then **-20%** (owner r15); grounded |
| `bucket`      | 0.017 | 0.041  | 0.155| water bucket - already on-scale at r13 (0.97x); unchanged |
| `mug`         | 0.049 | -0.025 | 0.100| mug **2x** (owner r14); scaled about its centre so it stays seated in the bucket |
| `dragon`      | 0.074 | -0.989 | 0.207| dragon **1.5x** (owner r14); grounded, rises further over the map |

**Map row 54% -> 75.5%.** In the reference the parchment is the backdrop for the whole upper screen and
the floor is only the bottom band; the build's map ended at 54%. Growing it shrinks the bench zone from
46% to 24.5% of the frame, which is why every `y` above is large and negative - props stand on the floor
line and rise up to ~0.8 bench-heights over the map. The self-test landscape `yMin` was widened from a
two-prop `-0.35` exemption to a blanket `-0.95` to match, still catching gross off-zone errors.

**`.dragoncrop` was hardcoded `255px x 230px`**, so `LAYOUT.dragon.w` had only ever *positioned* the
dragon, never sized it - a latent violation of this file's own "sized by the LAYOUT table, never by
hardcoded pixels" rule, and the reason the dragon alone ignored the first r13 pass. It is now
`width:100%; aspect-ratio:255/230`, so it scales with the table like every other prop.

`hammer:'#hammerTool'` was added to `FRAME_BOX_SEL` - the hammer had no measurement hook, so `?bbox`
could not gate it.

### Measured result (`?bbox` vs `spec.landscape-scale-ref.json`)

| element | ref | before | after |
|---------|----:|-------:|------:|
| smelter | 0.190 | 0.274 (1.44x) | **0.190 (1.00x)** |
| anvil   | 0.125 | 0.261 (2.09x) | **0.125 (1.00x)** |
| grinder | 0.130 | 0.244 (1.87x) | **0.130 (1.00x)** |
| dragon  | 0.120 | 0.249 (2.07x) | **0.120 (1.00x)** |
| hammer  | 0.140 | 0.160 (1.14x) | **0.149 (1.06x)** |
| bucket  | 0.135 | 0.131 (0.97x) | **0.135 (1.00x)** |
| map (h) | 0.755 | 0.540 | **0.755** |

All six props within 8% of the reference; `?test` self-test GREEN.

### r14 — owner-directed sizing over the r13 scale match (2026-08-18)

The owner re-sized five props on top of the measured r13 baseline. Verified by `?bbox` diff
(before -> after, factor): grinder 0.130 -> 0.259 (**2.00x**), anvil 0.125 -> 0.188 (**1.50x**),
hammer 0.149 -> 0.075 (**0.50x**), dragon 0.120 -> 0.180 (**1.50x**), mug 0.059 -> 0.119 (**2.00x**).
Smelter (0.190) and bucket (0.135) untouched, so those two remain at the reference 1.00x.

Each prop was scaled about a per-prop anchor rather than its top-left, so nothing sinks through the
floor or drifts sideways: **base + horizontal centre** for the props that stand on the floor
(grinder, anvil, dragon), **box top + centre** for the hammer (its DOM box runs off the frame bottom,
so pinning the base would have pushed it out of the zone), and **box centre** for the mug (it nests in
the bucket and its box carries heavy transparent padding). The landscape `yMin` guard was widened
`-0.95` -> `-1.30` because the 1.5x dragon now rises further over the map.

Note: the 2x grinder now overlaps the bellows (which was not in the owner's list and keeps its r12
position, right of the furnace). Self-test GREEN; pipeline smoke and all station hotspots
(`grindHot`, `bellowHot`, mug, hammer) still hit-testable.

### r15 — owner sizing follow-up (2026-08-18)

Verified by `?bbox` diff (before -> after, factor): grinder 0.259 -> 0.182 (**0.70x**),
anvil 0.188 -> 0.150 (**0.80x**), hammer 0.075 -> 0.131 (**1.75x**). Smelter (0.190), bucket (0.135),
dragon (0.180) and mug (0.119) untouched. Same per-prop anchors as r14 (base+centre for grinder/anvil,
box-top+centre for the hammer). The smaller grinder also mostly clears the bellows overlap r14
introduced. Self-test GREEN; pipeline smoke and all station hotspots still pass.

Net vs the measured reference after r14-r15: smelter 1.00x, bucket 1.00x, grinder 1.40x, anvil 1.20x,
dragon 1.50x, hammer 0.94x — i.e. the owner's composition deliberately sits above the reference on
grinder/anvil/dragon.

### Known gaps after r13

- **Map width** is still 0.870 vs the reference 0.755. Closing it means widening the ore rail from 13%
  to ~24.5%, which resizes the rail + materials panel - outside the owner's element list, so left alone.
- **Silhouettes still differ** (owner decision 2026-08-18: keep the current props, scale guide only). The
  reference grinder is a mortar+pestle vs the build's grinding wheel, and its smelter is a squat stone
  tower vs the A-frame + hanging cauldron. Widths match; heights cannot (the grinder is 1.00x wide but
  0.63x the reference height). Closing that needs an art re-cut, not a resize.
- **Bellows position** is unchanged (right of the furnace; the reference has it left, between anvil and
  furnace). It was not in the owner's element list.


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
