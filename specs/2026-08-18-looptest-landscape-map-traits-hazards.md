# Loop-test landscape — map rework: flat board, starter traits, real hazards

Status: canon (active build spec for `Swordforge_looptest_landscape.html`)
Date: 2026-08-18
Branch: `sword-forge/anchor-match-tooling`
Scope: **landscape only.** `Swordforge_new_looptest.html` (portrait) is deliberately untouched.
Builds on: [2026-08-14-looptest-phase2-landscape-hori-anchor.md](2026-08-14-looptest-phase2-landscape-hori-anchor.md)

## Why

The landscape map was a **baked painting** (`assets/map/territory_hori.png`) with element icons at fixed
pixel spots, while the real trait and hazard objects lived at unrelated procedural coordinates — so
`traitsG` and `hazG` were both `display:none` to stop the two contradicting each other. The player was
aligning onto invisible targets. Fog was also effectively off (`INIT_REVEAL` 1500 on a 2800-wide world),
and hazards were drawn-but-decorative with no effect at all.

## Changes

### 1. Flat board (the painting is gone)

`<image id="mapArt">` and its `#mapArt` saturation filter are removed. The board is now the flat beige
base rect (`#d8c8a0`). `blobsG` (mottled terrain) stays hidden — the owner asked for flat — but its
520-iteration generation loop **still runs**, because the seeded RNG sequence it consumes determines
trait and hazard placement downstream. Deleting that loop as "dead code" would reshuffle the whole map.

`traitsG` and `hazG` are no longer hidden: the game's own discs **are** the map now.

### 2. Trait placement — 5 near, 19 far

| Where | Traits | How placed |
|---|---|---|
| Inside the opening reveal | Sharp 🔪, Durable 🛡️, Flexible 〰️ | at their ore-path ends (copper / iron / aluminium — short paths) |
| Inside the opening reveal | Heavy ⚓, Balanced ⚖️ | authored at 160° / 20°, r **330** off home (y flattened ×0.72) |
| Far out, under the fog | the other **19** | existing seeded ring, r 820–1360 from centre |

Measured: the 5 near traits are the exact requested set; the nearest far trait is **639** units from home
against a **430** reveal, so nothing straddles the boundary.

⚠️ **Noble 👑 was displaced.** Gold's ore path is short, so its end sits *inside* the reveal — Noble
could not be both "at its ore-path end" and "in the fog". It moved out with the rest, so **the gold ore
no longer terminates at its signature trait**. This is the one mechanic broken by this pass. Fixes, for
the trait rework: lengthen gold's `d` path so it reaches the outer ring, or re-point `ORE_TRAIT.gold`.

### 3. Fog + framing

- `INIT_REVEAL` **1500 → 430** — the old value lit essentially the whole visible band.
- `INIT_W` **2800 → 1100** — at 2800 a trait disc rendered ~6px wide and its `?` was illegible. `MAX_W`
  stays 2800, so the player can still zoom right out.
- **Known read:** the map zone is wide and short (~0.42 aspect). A reveal large enough to light traits at
  r≈220–330 is taller than the viewport, so **fog reads left/right but not up/down** at the opening zoom.
  Inherent to the zone shape — the lever is the `INIT_W` ÷ `INIT_REVEAL` ratio, not a bug to patch.

### 4. Hazards are real

`BLADE_HP_MAX` **100**, `HAZARD_DPS` **26**/second (first-pass tuning).

- `checkHazard(p,dt)` runs from **both** movement paths — `advanceSword` (hammer travel) and the
  dragon-fire pull branch — mirroring where `checkTraitReach` is already called.
- **Damage applies only while the sword moves.** Parking inside a hazard is safe. This was deliberate:
  charging damage continuously would kill the blade during `SMELT_TIME` furnace work the player cannot
  interrupt, which reads as punishment rather than risk.
- Feedback: the hazard ring turns red, `#sword` pulses (`.hurt`), and an integrity bar `#sfHp` sits under
  the acquired-traits strip. Hidden by `?clean`.
- At 0 integrity `shatterBlade()` fires: the run resets and **every trait acquired on that blade is lost**.

Six hazards' edges reach the boundary of the opening reveal — danger starts where the light ends. None
overlap a trait (the placement loop enforces ≥120 clearance).

## r17 — trait catalog + positions redrawn from the owner's sketch (2026-08-18)

Supersedes the r16 placement above. The owner supplied a hand-drawn trait map; positions and the catalog
now come from it directly. Ore paths are explicitly **out of scope** for this pass ("ignore the ore paths
for now, change it later"), so the signature-trait-at-path-end derivation is gone.

### Catalog: 24 → 25 traits

- **Added (6):** Swift 🪶, Cloud ☁️, Rainbow 🌈, Magma 🌋, Mist 🌫️, Poison 🧪
- **Renamed (2):** Flame 🔥 → **Fire**, Storm 🌪️ → **Gale**
- **Removed (5):** Sharp, Accurate, Honor, Endurance, Cruel
- **Centre ring is now** Swift · Balanced · Durable · Flexible · Heavy — Sharp (an r16 starter) is gone
  from the catalog entirely, replaced in the centre by Swift.

### Positions

`TRAIT_POS` stores each trait in **the sketch's own pixel space**, converted at load:

```
world = START + (sketch_px - REF_C) * REF_S      REF_C = {1018, 615}   REF_S = 1.5
```

`REF_C` is where the sketch's five sector lines converge (= home); the sketch's circle is the opening
reveal. Keeping sketch coordinates rather than baked world numbers means a redrawn sketch is a
**re-measure, not a rewrite**.

`NEAR_IDS` is no longer a hand-kept list — it is derived at placement time from `INIT_REVEAL`, so
whatever the sketch puts inside the circle *is* the starter set. One source of truth.

### `ORE_TRAIT` is now inert

It no longer drives placement. Its three dead ids were repointed (`sharp→swift`, `flame→fire`,
`storm→gale`) so nothing dangles, and it is kept only so the ore→signature-trait idea survives into the
ore rework. ⚠️ **`gale` is now both an ore id and a trait id** — separate maps, so it works, but it is a
name collision worth resolving.

### Measured (r17)

```
traits=25  NEAR=[balanced,durable,flexible,heavy,swift]  far=20
minFarDist=487  maxFarDist=1236  outOfBounds=[]  dups=[]  minTraitSep=228
selftest=true fails=0   hazards=24   hp=100 -> shatter resets run
```

Nearest outer trait is 487 units out against a 430 reveal, so nothing straddles the fog line. Minimum
separation between any two traits is 228 units against `ALIGN_MAX` 34 — no ambiguous alignment.

### Ripple this creates (not addressed here)

- **Portrait still runs the old 24-trait catalog.** The two loop-tests now differ in catalog, not just
  layout.
- **`swordforgeV2.html` `heatConfigs` keys `sharp`, `cruel`, `endurance`, `flame`** — three of those ids
  no longer exist in landscape, and `flame` is now `fire`.
- **Trait-skinned art is named `flame_*`** (`assets/sword-parts/blades/`), which no longer matches a trait
  id. `ice_*` and `water_*` still do.

## r18 — the four long ore paths halved (2026-08-18)

Owner: halve the routes of the four downward ores (**ember, frost, tide, gale**). Every numeric literal in
each `d` string was scaled ×0.5 programmatically rather than retyped, so the curve shape is identical and
only its size changes. The four original ores (copper/iron/gold/aluminium) are untouched.

| ore | path length before | after | ratio | single-ore reach (end distance from home) |
|-----|------:|------:|------:|------:|
| ember | 706 | **353** | 0.500 | 661 → **331** |
| frost | 795 | **398** | 0.500 | 690 → **343** |
| tide  | 795 | **398** | 0.500 | 690 → **343** |
| gale  | 706 | **353** | 0.500 | 661 → **331** |

Unchanged for reference: copper 244, iron 254, gold 258, aluminium 248.

### Gameplay consequence (flagged, not addressed)

These four were the *reach-far* ores. Before, a single fully-ground ember/frost/tide/gale reached ~661–690
units — past the nearest outer trait at **487**, so one ore could touch the fog ring on its own. Their
maximum single-ore reach is now **343**, which is short of 487, so **no single ore can reach any outer
trait any more** — at least two stacked segments (or a dragon pull) are now required to leave the starter
ring. Their reach is also now close to the four short ores (244–258), so the two ore families no longer
read as "short hop" vs "long haul".

That may be exactly the pacing wanted, but it is a real change to how far the fog opens per ore, and it
interacts with the ore rework that is still pending.

## r19 — the four halved again (2026-08-18)

Second ×0.5 pass on ember/frost/tide/gale, so they now sit at **×0.25 of their original** length. Same
programmatic scaling; curve shapes unchanged.

| ore | length (orig → r18 → r19) | reach (orig → r19) |
|-----|------:|------:|
| ember | 706 → 353 → **176** | 661 → **165** |
| frost | 795 → 398 → **199** | 686 → **172** |
| tide  | 795 → 398 → **199** | 686 → **172** |
| gale  | 706 → 353 → **176** | 661 → **165** |

Unchanged: copper 244, iron 254, gold 258, aluminium 248 (reach 242–256).

### ⚠️ These four ores can no longer reach any trait alone

Trait distances from home: **heavy 197** (nearest) · swift 220 · durable 225 · balanced 231 ·
**flexible 266** (farthest starter) · then the fog ring from **poison 487** outward.

At a reach of 165–172, the four downward ores now fall **short of even the nearest trait**. Every route
that ends on a trait must therefore start with one of the four original ores, or stack two or more
segments. Two further notes:

- **Flexible (266) is out of single-ore range entirely** — the longest single reach across all eight ores
  is gold at **256**. Flexible now always needs a stack or a dragon pull.
- The four downward ores have gone from *the* long-haul routes to the **shortest** in the game
  (165–172 vs 242–256 for the originals), which inverts their role.

Both consequences are stated rather than fixed: the ore rework is still pending, and the owner may want
exactly this pacing. If not, the lever is the same scale factor applied to `ORES[].d`.

## r20 — right-column UI rebuilt from the owner's reference (2026-08-19)

Reference: `Reference/landscape test.png` (byte-identical to `assets/Anchor-images/landscape-scale-ref.png`
— the same sketch that drove the r13 scale match; this pass measures its **right-hand UI**, which r13 did not).
Regions read off a 5% grid overlay, as fractions of the frame:

| element | reference | built | note |
|---|---|---|---|
| right column (`#rail`) | x 0.795 w 0.205 | x 0.790 w 0.210 | `--rail-w` 13% → **21%** |
| stat card (`#statPanel`) | x 0.803 y 0.022 w 0.182 h 0.183 | x 0.803 y 0.020 w 0.187 h 0.195 | DAY tile + gold + popularity |
| materials (`#matPanel`) | x 0.805 y 0.235 w 0.180 h 0.695 | x 0.803 y 0.228 w 0.187 h 0.702 | ends ~0.93, not at the frame bottom |
| map tabs (`#mapTabs`) | x 0.755 y 0.020 w 0.040 h 0.215 | x 0.746 y 0.020 w 0.044 h 0.215 | 4 tabs, wider than tall |

### What was built

- **4 map-selection tabs** — a vertical strip pinned to the map's right edge (`right: var(--rail-w)`),
  overlapping the board as drawn. **Numbered 1–4 placeholders** (owner's choice) with no behaviour yet.
- **Stat card** — `DAY` tile + gold (`#goldVal`) + popularity (`#popVal`), then **SKILL TREE** as a
  full-width button. `#skillBtn` moved out of its absolute top-right position into this card.
- **Materials inventory** — 4 category tabs on the card's top edge, a star + XP bar, a `◆ MATERIALS ◆`
  rule, then a **3×4 grid**: all 8 ores plus 4 empty cells. The old `RAIL_FILLER` (which invented
  duplicate gold/copper/iron slots purely to fill the board) was **removed** — a real inventory should
  not show materials the player does not have. Rows are `minmax(0,1fr)` so all 12 cells are the same
  size and the grid fills the card like the reference.
- **Left HUD column cleared** (owner's choice): the Lv / Day / Gold / Recipe Book / Guide plaques are
  gone, since day and gold now live on the right. The reference puts a **BLADE TRAIT panel** in that
  space — not built, so the area is currently empty.

Palette stays the build's warm parchment/wood: the reference is a greyscale wireframe, so it drives
**structure and proportion, not colour**.

### Prop sizes had to be rebased

`LAYOUT` x/w are fractions of the **bench zone**, which is `frame − rail`. Widening the rail shrank the
bench from 0.87 → 0.79 of the frame, so every prop silently shrank and slid left by ~9%, undoing the
owner-approved r13–r15 sizing. All `x` and `w` values were rescaled ×`0.87/0.79` (=1.1013) to restore
the frame-relative sizes; `y` is a fraction of bench *height*, which did not change, so `y` was left
alone. Re-measured after: furnace 0.190, anvil 0.151, wheel 0.182, dragon 0.180, bucket 0.135, hammer
0.130 — all back to ×1.00 of their approved values.

**Side benefit:** the map is now 0.790 wide against the reference's 0.755 (it was 0.870), so the
map-width gap flagged at r16 is largely closed as a by-product.

### Self-test hardening

The drift guard caught this change: the `resolveLayout` math check hardcoded the bucket's numbers
(`0.017*1000 → 17`) and went stale the moment the layout was rebased. It now derives its expectations
from `LAYOUT.landscape.bucket`, so it still verifies the multiply but cannot rot on a deliberate layout
change — `RECORDED` remains the thing that pins the values.

### Measured (r20)

```
selftest=true fails=[]   pipeline sword=true gate=true   hp=100 -> shatter resets
hotspots grind/bellow/mug/skillBtn/mapTabs all ok
inventory cells=12  distinct cell heights=1  traits=25
```

### Not built

- The **BLADE TRAIT panel** on the left (reference shows trait icons, a sword preview, a material grid,
  ✕ / save buttons and a FORGE button). The left column is empty until it exists.
- Map tabs, category tabs, the XP bar and SKILL TREE are all **inert placeholders**.
- `#hud` is now an empty element, so its `FRAME_BOX_SEL` entry reports a zero-size box.

## r21 — blade-trait panel, top-left (2026-08-19)

The owner revised `Reference/landscape test.png` (new hash): the top-left is no longer the big BLADE
TRAIT card sketched earlier, but a compact panel — **a row of 5 trait slots over a cancel / save pair**.

| element | reference | built |
|---|---|---|
| `#bladePanel` | x 0.012 y 0.020 w 0.161 h 0.170 | x 0.012 y 0.020 w 0.161 h **0.167** |

### The slot rule

```
TIER_PIPS = { Weak: 1, Fine: 2, Epic: 3 }      BLADE_SLOTS = 5
```

Five slots. An empty slot shows a **dot**; an acquired trait of tier N fills **N consecutive slots with
its element icon**, tinted by `tierColor`. This is the owner's rule verbatim — "3 fire element icons for
a tier 3 fire, 2 water icons for a tier 2 water trait" — mapped onto the build's existing
Weak/Fine/Epic quality tiers, which are what `tryAcquire` already records.

The row therefore doubles as the blade's capacity meter: 5 tier-points of traits fill it.

### Buttons

- **✕ cancel crafting** → `resetRun()` plus a hint. Wipes the blade and every trait on it.
- **💾 save** → **placeholder**, as instructed: it only prints a hint, stores nothing.

### Replaced

`#sfTraits` — the old acquired-trait strip floating over the map's top-right — is **removed**; this panel
supersedes it. `updateSfTraits()` now renders the slots instead, so every existing call site
(`tryAcquire`, `resetRun`, init) keeps working. The blade-integrity pill `#sfHp` moved up to `top: 8px`
into the space `#sfTraits` vacated.

### Measured (r21)

```
empty            = . | . | . | . | .
+ fire  (Epic=3) = fire | fire | fire | . | .
+ water (Fine=2) = fire | fire | fire | water | water
cancel clicked   = . | . | . | . | .   (run reset confirmed)
selftest=true fails=[]
```

New debug hooks, in the same spirit as `hp()`/`damage()`: `SFM.pips()` returns the current pip list and
`SFM.grantTrait(id,tier)` pushes a trait so the rule is testable headlessly.

### ⚠️ Open: capacity is display-only

Nothing caps acquisition at 5 tier-points. Granting Epic fire (3) + Fine water (2) + anything else
produces a **6th pip that is silently dropped** from the row — the trait is still on the blade and still
counts toward the sword's value, it just cannot be seen. Needs an owner decision:

1. **Cap acquisition** — refuse to acquire once 5 points are filled (makes the row a real capacity), or
2. **Grow/scroll the row**, or
3. **Show an overflow badge** (e.g. `+2`) and leave the mechanic uncapped.

Left alone deliberately, since capping acquisition is a game-rule change that was not requested.

### Still not built

The earlier sketch's larger BLADE TRAIT card (title, sword preview, material grid, FORGE button) is
**not** part of the revised reference and was not built.

## r22 — dragon / hammer / mug drag to the top of the screen (2026-08-19)

**Symptom:** all three stopped at an invisible line partway up.

**Cause:** every drag handler clamped against the **bench** rect. Since r16 grew the map row to 75.5%,
the bench is only ~24.5% of the frame tall, so the old allowances (`-20`/`-30`/`-40` px above the bench)
put the ceiling at roughly **0.70 of the frame height** — three quarters of the way down the screen.
The clamps were never wrong; the zone they referenced shrank underneath them.

**Fix:** a shared `dragBox(el, benchRect, bleed)` returns the **frame** box translated into bench-local
coordinates, and the three handlers clamp to that. Props already live in `#bench` with
`overflow: visible`, so nothing else had to change. Added `.dragging { z-index: 35 }`, toggled on
pointer down/up, so a prop lifted over the map or the HUD panels stays visible.

Applied to `wireDragon`, `wireHammer`, `wireMug` — and to `makeDraggable` for consistency, though see below.

### Measured reach (element top, as a fraction of frame height; 0 = very top)

| prop | dragged up | dragged down |
|------|-----------:|-------------:|
| dragon | **-0.050** | 0.788 |
| hammer | **-0.033** | 0.807 |
| mug | **-0.089** | 0.907 |

Slightly negative is the intended bleed. Self-test GREEN, pipeline smoke still passes.

### Two things found on the way

- **`makeDraggable` / `wireMovable` are dead code.** `wireMovable()` is never called; the live handlers
  are `wireDragon` (dragon) and `wirePestle` (pestle). The first version of this fix patched only
  `makeDraggable` and the dragon did not move — the other two did. Left in place and updated for
  consistency rather than deleted, but they are candidates for removal.
- **`wireDragon` is a single-line function.** A `//` comment appended inside it silently commented out
  the remainder of the function, taking `window.SFM` down with it. Use `/* */` when annotating inside
  these long single-line handlers.

### Note: the mug still snaps home

The mug can now be dragged to the top, but `homeMug()` on pointer-up returns it to the bucket — existing,
deliberate behaviour (it is a pour tool, not a free prop). If it should stay where it is dropped, that is
a separate one-line change to the release handler.

## r23 — released ingot appears at the smelter door (2026-08-19)

**Symptom:** the orb released from the smelter sat on top of the **bellows**.

**Cause:** `snapToGate()` placed the orb at `stationCenter(stSmelt, 0.72, 0.72)` — **0.72 across** the
smelter, i.e. its far right edge, which is exactly where the bellows sits. `#furnaceGate` (the actual
door hotspot) is centred at **0.27**. It reads like a transposition of 0.27 → 0.72.

**Fix:** `snapToGate()` now derives the orb position from `#furnaceGate`'s live rect rather than a
hardcoded fraction, so a future furnace re-cut moves the hotspot and the ingot together. It places the
orb at gate-fraction **(0.62, 0.70)** rather than dead centre — the painted arch *opening* sits
right-of-and-below the hotspot's centre, so 0.5/0.5 parked the orb on the arch's left pillar. The
hardcoded fallback (used only if the element is missing) was corrected to `0.27, 0.72`.

`#furnaceGate` itself is **unchanged** at `left: 12%; top: 58%; width: 30%; height: 28%`.

### ⚠️ A wrong turn worth recording

An intermediate attempt *moved* `#furnaceGate` to `left: 41%`, on the strength of a pixel scan that
claimed the molten mouth was at furnace-fraction x 0.424–0.582. **That measurement was invalid and the
change was reverted** after the owner pointed at the correct arch.

Two harness faults produced it, both now understood:

1. **Viewport mismatch.** Screenshots ran with `--window-size=1080,600` but `--dump-dom` measurement
   runs had **no** `--window-size`, so they used Edge's default 800×600. The furnace box measured in
   one run was hardcoded into a scan of a render from the other — so the scan swept the wrong region
   entirely and "found lava" that was not the door.
2. **The probe `<div>` took layout space.** Injecting `<div id="__probe">` before `</body>` is an
   in-flow element; it reflowed the page and squashed `#frame` from 1025px to ~460px. Every measurement
   taken that way was of a distorted layout.

**Harness rules going forward:** pin `--window-size` on *both* the screenshot and the dump-dom run, and
give the probe element `position: fixed; left: -9999px` so it cannot affect layout. Never carry pixel
boxes measured in one run into a scan of another — recompute them in the same run.

### Measured (r23, clean harness: 1080×600 both runs, non-layout probe)

```
frameW=1025  furnace=[436,333,631,569]  gate=[460,470,518,536]
gate frac of furnace: x 0.123-0.421  y 0.581-0.860   (the left arch, as drawn)
orbInGate=true  orbOverBellows=false  selftest=true
```

## r24 — cauldron overlay removed from the scene (2026-08-20)

`<img class="cauldron" src="assets/forge/anchor_cauldron.png">` and its CSS (`.cauldron` +
`@keyframes cauldronGlow`) are gone, along with the now-pointless `cauldron` entry in
`FRAME_BOX_SEL`.

**This is a no-op visually.** The overlay had been `display: none` since **r10**, when the smelter was
re-cut as one tall unit with the molten pot **baked into `anchor_furnace.png`**. The glowing pot on the
furnace crown is part of the furnace art and is unaffected — removing the overlay only deletes dead
markup, dead CSS and a dead measurement hook.

If the intent was to remove the **visible** pot, that is a different job: it means editing
`anchor_furnace.png` (masking the pot out of the painted art), not touching the scene markup.

`assets/forge/anchor_cauldron.png` is left on disk but is now **referenced by nothing** — a deletion
candidate alongside the other unreferenced assets tracked in `plan.md`.

### Measured (r24)

```
selftest=true fails=[]   .cauldron element ABSENT
furnace unchanged: w 0.190 h 0.393   pipeline ore->heat->gate->anvil OK
resource load errors: [] both before and after the change
```

## r25 — painted map base (2026-08-25)

The board's flat beige fill (r16) is now backed by `assets/map/map_base.png` — an aged parchment with
tinted quadrants and a decorative skull-edge border.

```html
<rect x="0" y="0" width="2800" height="1960" fill="#d8c8a0"/>          <!-- fallback / load colour -->
<image id="mapBase" x="0" y="0" width="2800" height="1960"
       href="assets/map/map_base.png" preserveAspectRatio="xMidYMid slice"/>
```

**Cover-fit, not stretched.** The asset is square (**2948×2948**) and the world is **2800×1960**, so
`slice` scales it to cover and crops the overflow rather than distorting the border art. The flat rect
stays underneath as the load/fallback colour. It sits below `#terrain` and `#fog`, so trait and hazard
discs still draw over it and the fog still hides it until travel reveals it.

Note this differs from the removed `#mapArt`: that was a *painted territory map* whose icons contradicted
the real trait positions (the reason r16 removed it). `map_base` is **texture only** — no landmarks — so
it does not reintroduce that conflict.

### Measured (r25)

```
selftest=true fails=0   mapBase present, rendered 2061x1443 into an 810x453 board
fog intact, traits=25, no resource load errors
```

### ⚠️ Asset weight

`map_base.png` is **15.4 MB** (2948² RGBA). The board renders at ~810×453 CSS px, so the source is
oversampled by roughly 3.5× in each axis and is by far the heaviest asset in the repo — the next largest
is ~7 MB. Downscaling to ~1200² and re-encoding would cut it to well under 1 MB with no visible loss at
the size it is drawn. Worth doing **before** it lands in git history, since a blob committed once stays
in history even if replaced later.

## r26 — organic hazard blobs, cracked-earth fill (2026-08-25)

Hazards were two concentric `<circle>`s. They are now a single closed `<path>` per zone, filled with
`assets/map/map_hazard.png` (540×960 cracked earth) via a tiling `<pattern>`.

### Shape

Radius varies with angle as a sum of sine harmonics:

```
r(θ) = rr · (1 + 0.13·sin(2θ+p₁) + 0.09·sin(3θ+p₂) + 0.06·sin(5θ+p₃))
```

The harmonics are **integer multiples of θ**, so the curve is periodic by construction and closes at 2π
with no seam — the usual failure mode when radii are jittered randomly. Phases come from the seeded
`rnd()`, so placement stays deterministic. 20 points are sampled and joined as a closed
**Catmull-Rom → cubic Bézier**, so the outline is curvy rather than a faceted polygon.

Measured irregularity (max/min sample radius): **1.47 – 1.62**, median 1.56.

### Collision

`checkHazard` now does a **bounding-radius early-out** on `rMax` (one `hypot`, same cost as the old
circle test) and only then a **ray-cast point-in-polygon** against the same 20 sample points the curve
passes through. Drawn shape and damage area therefore agree to within a couple of world units.
`hazards[]` entries gained `pts` and `rMax`; `r` is kept for the placement spacing check.

### Fill

`<pattern id="hazTex" patternUnits="userSpaceOnUse" width="150" height="267">` — sized in **world**
units so a few crack cells read across each zone (hazard diameters run ~64–160). The source art is
bright tan and would vanish against the parchment, so it is sunk with CSS:
`filter: brightness(0.62) saturate(0.72) contrast(1.22)` (first pass at 0.46 buried the crack detail).

### Measured (r26)

```
selftest=true fails=0
hazards=24  path elements=24  circle elements=0
centre-inside 24/24   false positives beyond rMax: 0
pattern def present, no resource load errors
```

### Note

The wobble consumes extra `rnd()` calls, so hazard **positions** shifted from the previous seed. They are
procedural, so nothing depends on the old layout.

## r27 — hazards become meandering ribbons + fog-of-war cheat (2026-08-25)

Owner reference: Potion Craft's map, where hazards are **winding ribbons with crinkly edges** that form
navigable corridors, not isolated blobs. Supersedes the r26 blobs.

### Ribbon geometry

Each hazard is now a **spine** — a seeded random walk that carries momentum on its *turn rate* (not just
its heading) and damps it (`turn = turn*0.78 + (rnd()-0.5)*0.62`), so the path curves smoothly and
meanders instead of zigzagging. 5–13 segments of 64 units, drawn as an open Catmull-Rom → Bézier curve
and **stroked** at 2×half-width (26–44) with round caps.

The crinkled edge comes from an SVG filter, not from geometry:

```xml
<filter id="hazCrinkle"><feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="3"/>
                        <feDisplacementMap scale="16" .../></filter>
```

`baseFrequency` is in world units, so ~0.028 gives features every ~36u against half-widths of 26–44.
It is static — computed once, not per frame.

### Collision

Now **distance from the sword to the spine polyline ≤ half-width**, with a bbox reject first. Cheaper
than r26's point-in-polygon. Because the crinkle is a *render-time displacement*, the drawn edge can sit
up to `scale/2` = **8 world units** off the collision boundary — that is the accepted visual/damage
tolerance, and the reason `scale` is kept modest.

### Corridors (owner: "generous")

A candidate ribbon is rejected unless every spine point clears every existing ribbon by
`w₁ + w₂ + HAZ_CORRIDOR` with `HAZ_CORRIDOR = 200`, plus ≥110 from any trait and ≥220 from home.

**The constraint binds:** 12 ribbons were requested, **7** placed in 4000 tries — the rest could not fit
without violating the corridor. Measured minimum **edge-to-edge gap: 260 units** against ore reaches of
165–256, so a single ore can always cross a corridor. Lower `HAZ_CORRIDOR` if a denser, more maze-like
map is wanted; that is the dial.

### Hot state

Stroke is now the ribbon *body*, so the red "taking damage" highlight is a second overlay path
(`.hazHot`) faded in by a `.haz.hot` class rather than a stroke swap.

### Fog-of-war cheat

A **👁 button** in the zoom cluster toggles `toggleFogCheat()`, which appends/removes a world-sized rect
in `#fogHoles` under its own id. Removing it restores the fog **without wiping the holes the player
genuinely earned** by travelling. Also on `SFM.fogCheat()`. Hidden by `?clean` with the rest of the
zoom chrome.

### Measured (r27)

```
selftest=true fails=0     ribbons=7  groups=7   spine points 6-12, half-widths 26-43
minEdgeGap=260 (rule >=200)   minTraitClear=110 (rule >=110)   homeClear=352 (rule >=220)
fog cheat: on -> hole added, off -> hole removed, earned holes retained
```

Dead `blobPath`/`inBlob` helpers from r26 removed.

## r28 — replicate the Potion Craft hazard field (2026-08-25)

Owner supplied the full Potion Craft map. Its hazard field is a **mix of scales** — long snaking ribbons,
shorter fat arcs, compact islands and small specks — not the uniform ribbons of r27.

### Four zone kinds

| kind | n | half-width | shape | corridor class |
|------|--:|-----------|-------|---------------|
| ribbon | 16 | 32–54 | 10–18 segment spine, 3 width chunks, filtered | major |
| arc | 20 | 34–52 | 4–8 segment spine, 2 width chunks, filtered | major |
| island | 26 | 26–44 | closed harmonic blob | minor |
| speck | 30 | 16–26 | closed harmonic blob | minor |

Ribbon widths were calibrated off the reference: its ribbons run ~40–60px on a ~1730px map, i.e. ~65–97
world units thick here, so half-width 32–54.

**Variable width** — SVG `stroke-width` is constant per path, so a ribbon that thickens and thins is drawn
as 2–3 overlapping chunks that share an endpoint and use round caps, blending into one mass.

**Corridors** are now class-aware: `CORRIDOR_MAJOR=70` between big masses, `CORRIDOR_MINOR=30` when either
side is an island/speck (small stuff is trivially routed around). Down from r27's flat 200 to reach
reference density.

### ⚠️ The bug that made small zones look like dashes

An SVG **filter region is expressed in objectBoundingBox units, and that bbox EXCLUDES the stroke**. A
speck is a ~8–26u spine painted with a 32–52u stroke, so its bbox is far smaller than what it draws — the
filter region clipped the round caps clean off and left rectangular slivers. Long ribbons were unaffected
because they are long relative to their stroke.

Fix: the small kinds are no longer stroked-and-filtered at all. They are **closed harmonic wobble blobs**
(organic by geometry, nothing to clip). Measured roundness (max/min radius): **1.61 – 1.79** — irregular,
not circles. The now-unused `hazCrinkleSm` filter was removed.

### Collision

`parts` entries carry a `poly` flag. Ribbons/arcs test distance-to-spine ≤ width; islands/specks test
point-in-polygon. `partsClear` returns a signed distance for both so placement clearance works uniformly.

### Measured (r28d)

```
selftest=true fails=0
zones=70  {ribbon:8, arc:6, island:26, speck:30}
coverage=15.6% of the world      blob roundness 1.61-1.79 (n=56)
traits buried: 0                 home inside a hazard: false
```

### Known gap vs the reference

Two things still differ, both structural rather than cosmetic:

1. **Density.** Ours is ~16% coverage against roughly a third in the reference. Ribbons/arcs keep losing
   placement attempts to the corridor rule (8 of 16 and 6 of 20 placed).
2. **Merging.** In Potion Craft the masses *touch and merge* into one connected network, which is what
   makes it read as a maze. Our corridor rule explicitly forbids contact, so zones stay separate islands.

Closing both means inverting the constraint: allow zones to merge freely, and instead guarantee the
**open space** stays connected — a flood fill from home that must reach every trait, rejecting any zone
that would seal a region off. That is the real next step for fidelity, and a bigger change than tuning.

## r28e - hazard texture renders as authored (2026-08-25)

`map_hazard.png` was swapped to a skull-cluster texture, and the `#hazTex image` CSS filter
(`brightness(0.62) saturate(0.72) contrast(1.22)`) was **removed** at the owner's request.

That filter existed because the previous cracked-earth art was bright tan and vanished against the
parchment. It also meant the file on disk looked lighter than what rendered, which is confusing when
iterating on the art. The skull texture carries its own contrast, so the sink is no longer needed and
the pattern now shows exactly what is in the PNG.

Side benefit: the skull stipple gives the fine clustered edge of the Potion Craft reference for free,
and the tan-on-tan value relationship matches it far better than a dark fill did.

Tile size (`<pattern>` 150x267 world units) is the dial if the skulls should read larger or smaller.

## r29 — 7 metal ores replace the 8 elementals (2026-08-25)

From the owner's per-ore path cards. Copper, Iron and Aluminium survive by name; **Gold, Ember, Frost,
Tide and Gale are retired**; **Manganese, Nickel, Tin and Zinc** are new.

### Reading of the cards (owner-confirmed)

- **Potion = the path ORIGIN** — the sword's current position.
- **Mortar = the far end** — where a fully ground ore lands.
- **X = the raw-ore stop.** This needs no data: the existing `tPct = 0.5 + 0.5·grind` already puts an
  un-ground ore at 50% of arc length, so the X *is* the 50% point and falls out for free.

### Path normalisation

Shapes are traced freely and each ore declares a target arc length `len`; `normalizeOrePaths()` rescales
the `d` string at init so the measured length hits it. Uniform coordinate scaling scales arc length by the
same factor, so `k = target/actual` is exact in one pass — no hand-computing scale while drawing.

Lengths were kept in the current band (owner: "roughly the same as the current ones" — the existing set
ran 176–258).

| ore | len | measured | reach | heading | X at |
|-----|----:|---------:|------:|---------|-----:|
| iron | 200 | 200 | 171 | W | 97 |
| manganese | 258 | 258 | **125** | W | 71 |
| copper | 225 | 225 | 224 | NW | 112 |
| aluminium | 250 | 250 | 247 | NW | 125 |
| nickel | 215 | 215 | 213 | N | 107 |
| tin | 185 | 185 | 177 | E | 91 |
| zinc | 230 | 230 | 221 | S | 112 |

### Art

Manganese/Nickel/Tin/Zinc reuse the retiring elementals' PNGs (owner's choice): gale→manganese,
frost→nickel, gold→tin, tide→zinc. The picture does not match the metal — stand-ins until real ore art
exists. Ember's PNG is now unused.

`ORE_TRAIT` was repointed to the new ids so nothing dangles; it remains **inert** (r17) and does not drive
trait placement.

### ⚠️ Two things to look at

1. **Directional coverage is clustered.** Sorted headings: E 1°, S 102°, W 176°, W 186°, NW 226°, NW 227°,
   N 268°. That leaves gaps of **~101° to the SE, ~93° to the NE and ~74° to the SW**, and two
   near-duplicate pairs (iron/manganese 10° apart, copper/aluminium 1° apart). Routes stack so anywhere is
   still reachable by chaining, but single-ore steering toward NE/SE/SW traits is weak. Open question for
   the owner: are the card orientations meant as compass headings, or only as drawings?
2. **Manganese reaches only 125** despite the longest arc (258) — its loop consumes the length. That makes
   it a manoeuvring ore rather than a distance ore. If it is meant to reach as far as the others, either
   the loop tightens or its `len` grows beyond the current band.

### Measured (r29)

```
selftest=true fails=0   ores=7   every path normalised to its target length exactly
rail: 12 slots, 7 with art   pipeline ore->heat->gate->anvil OK
no stale ore ids (remaining gold/gale/ember strings are the currency, trait ids, fx kinds and reused PNG names)
```

## Verification

Run headless (see note below) with a DOM probe:

```
selftest=true fails=0  traits=24
NEAR=[balanced,durable,flexible,heavy,sharp]  WANT=[balanced,durable,flexible,heavy,sharp]  match=true
far=19  minFarDist=639  hazards=24  hazInsideReveal=6  mapArtGone=true
hp=100/60/null  resetAfterShatter=true
```

`?test` layout self-test GREEN. New `SFM` hooks for headless testing: `hp()`, `hazards()`, `damage(d)`;
`SF.NEAR_IDS` exposes the starter set.

**Tooling note:** Edge's stdout/stderr stopped being captured through the Bash tool mid-session
(screenshots still wrote, console output vanished). `--dump-dom` driven from **PowerShell** works and is
the more robust harness — it does not depend on console plumbing. Prefer it for headless assertions.

## Not done / open

- **Portrait untouched.** `TRAITS`, `ORE_TRAIT` and `ORES` remain duplicated verbatim across both loop-test
  files; a trait rework must edit both or portrait should be retired.
- **Gold → Noble link broken** (above).
- **`HAZARD_DPS` 26 is unplaytested.** ~3.8s of continuous travel through a hazard destroys a full blade.
- **No hazard telegraph** beyond the fog: a hazard just outside the light is invisible until entered.
- Trait rework itself (replacements, catalog changes) is deferred by the owner.

## r29b–f — per-ore path corrections, one at a time (2026-08-25)

The r29 pass traced all seven shapes off one small multi-panel sheet and got most of them wrong. The
owner's correction was to redo them **one ore per card**, describing the shape in words. Each entry below
is that description plus what the path now measures.

| ore | owner's description | infl | reach | heading | X at |
|-----|---------------------|-----:|------:|---------|------|
| iron | "upside-down W — up down, up down, in a zigzag" | 2 | 156 | W 180° | (−78, 1) |
| copper | "wavy" | 3 | 195 | NW −134° | (−72, −69) |
| aluminium | "goes in an arc, then comes backwards" | 0 | 69 | NW −120° | (−49, −112) |
| nickel | "north-east, wavy path, like an S" | 1 | 178 | NE −60° | (44, −75) |
| tin | "also wavy, two waves" | 2 | 160 | E −7° | (78, 11) |
| manganese | *pending* | 0 | 125 | W −174° | (−71, 5) |
| zinc | "goes south in a wide wave" | 1 | 160 | S 92° | (0, 91) |

`infl` = curvature sign changes along the arc, i.e. how many times the path visibly switches which way it
bends — the objective read on "wavy" vs "an arc". Every path still normalises to its declared `len`
exactly, so reshaping never changes how far an ore actually carries the sword… except through the
straight-line **reach**, which is what the loop/backtrack shapes trade away.

### Directional coverage, restated

Nickel moving N → NE closed the ~93° north-east gap flagged in r29. What remains:

- **~99° dead between tin (E) and zinc (S)** — nothing heads south-east.
- **~88° dead between zinc (S) and iron (W)** — nothing heads south-west.
- The west side is crowded: iron/manganese 6° apart, copper/aluminium 14° apart.

Still an open question for the owner, not something to infer: if manganese is meant to point south-west
the fan balances, but the cards are drawings and may not be compass headings at all.

## r30 — the hammering step becomes a scene (mockup) (2026-08-27)

Owner brief: *"I have added 5 new assets in the hammer folder… I want to rework it… The dragon at the
top, rotates on a fixed pivot, his head should be movable so he can blow fire on the sword. The sword
rests on the anvil, and it changes from the finished ore… to a rough shape… and finally to hammer_sword…
the hammer hovers in the air and works similar to the other hammer. Just build the mockup for now, add
the gameplay later."*

The old ring-tap minigame (`HAMMER_POINTS`, shrinking rings, hit/miss tally) is **gone**. What replaces it
here is staging only — art, rig and the three interactions asked for. No scoring, no timing windows.

### The assets are pre-registered, and that does most of the work

`hammer_bg`, `hammer_dragon`, `hammer_hammer` and `hammer_sword` are all exported at **1877×1025**. Three
of them are drawn in place on that canvas, so any layer painted at `inset:0` inside a box of the same
aspect lands pixel-for-pixel on the others — no alignment pass needed. `.hm-scene` is therefore
`aspect-ratio: 1877/1025`, which the frame (1080×600) letterboxes by ~10px.

`hammer_dragon` is the exception: its sprite sits mid-canvas rather than where the mockup wants it, so it
is placed by hand — see the rig.

### `HM_RIG` — every number a percent

Nothing is in pixels, so the rig survives any frame size. Values are percents of the stage, or (for the
dragon's own features) of the dragon sprite, which fills the stage 1:1.

| key | value | what it is |
|-----|-------|------------|
| `anvil` | 50.1, 53.5 | anvil top face, where the blade rests |
| `pivot` | 6.1, −26.4 | the dragon's fixed hinge, above the top edge |
| `tail` | 61.3, 7.3 | the point **on the sprite** pinned to that hinge (base of the tail fin) |
| `snout` | 50.9, 83.4 | sprite-space snout — where fire is emitted |
| `scale` / `base` / `swing` | 0.85 / −45° / ±34° | rest pose, and how far the head may sweep |
| `fireW` / `fireRot` | 34% / 70° | flame width, and its aim in the dragon's **local** frame |

`pivot` and `base` were solved rather than eyeballed: pick where the head should land, then invert
`final = O + T + S·R(A)·(P − O)` for the translate. Two rounds of that landed the head within ~1% of the
mockup's snout position.

Two details worth keeping:

- **The fire is a child of the dragon wrapper.** It therefore inherits the head's rotation for free —
  aim the head and the flame follows, with no second transform to keep in sync. Its own transform only
  slides its emission point (4%, 34% of the flame sprite) onto the snout.
- **Head dragging tracks the *change* in pointer angle about the pivot**, not the absolute angle, so the
  head never snaps to meet the cursor wherever you grab it.

### Interactions built

| | how |
|---|---|
| dragon head | press to breathe fire; drag to sweep the head, clamped to −79°…−11° |
| hammer | hovers (idle bob) and drags; lights `striking` within 16% of the stage width of the anvil |
| blade | `hmSetStage(0/1/2)` → molten sphere → `balanced_<shape>_midblade.png` → `hammer_sword.png` |

The hammer and dragon sprites are full-canvas layers, so their transparent pixels would swallow pointer
events. Transparent **grip pads** (`#hmGrip`, `#hmHead`) carry the events instead; the layers only get
translated/rotated.

Stages 0–1 use the 512-square part sprites, which are *not* on the shared canvas — those are laid on the
anvil face by hand, with `roughRot: 18°` tilting the rough blade onto the same −17° axis the finished
sword is drawn on. Stage 2 is back on the shared canvas and just switches on at `inset:0`.

### Reviewing it

`?hammer` opens the scene straight away. A HUD strip along the bottom steps ore → rough → blade and
finishes the run; it is mockup chrome and comes out when the gameplay goes in.

### Still open

- **No gameplay.** Nothing scores, nothing gates progression, and `hmSetStage` is driven only by the HUD
  buttons. The forge result banner lost its "N clean strikes" line rather than print `0` every time.
- **Placeholder art, per the owner.** `hammer_sword.png` is one fixed blade — it does not reflect the
  chosen shape or the acquired traits, so a Broadsword and a Shortsword both finish as the same picture.
- **Landscape only.** The portrait build still runs the old ring-tap minigame.

### r30c — owner pass: smaller dragon, the crafting-screen sphere, one blade size

- **Dragon down to 0.85** (was 1.08). Scale and translate are re-solved together, so shrinking it keeps
  the head tucked in the same corner instead of sliding across the stage. `fireW` went 26 → 34 to keep
  the flame reaching the blade, since the flame is a child of the wrapper and shrank with it.
- **Stage 0 is the molten sphere from the crafting screen**, not `ingot.png`. That orb is a CSS gradient
  (`#orb.hot #orb-sphere`), not an image, so `#hmOrb` rebuilds it from the same values — the two will
  drift apart if only one is edited. `ingot.png` is no longer referenced by the landscape build.
- **The three stages now read at one size.** They were 11% → 30% → full-canvas, which looked like three
  different objects. The target came from measuring `hammer_sword.png`: its **blade proper** (guard to
  tip, ignoring the long thin grip) is **57% of the stage width** — the sword only *looks* full-canvas
  because of the grip and the baked-in glow. The rough blade occupies ~74% of its 512 box, so
  `roughW: 77` puts it at 0.74 × 77 = **57.0%** — an exact match, verified in the browser. `roughRot`
  went 18° → 26° to lay it on the finished sword's −17° axis, which also stops the taller rotated box
  running off the top and bottom.

| stage | rig | visible metal |
|-------|-----|---------------|
| ore | `oreW: 19` | 19% sphere, sits on the anvil face |
| rough | `roughW: 77`, `roughRot: 26` | 57.0% blade |
| finished | fixed canvas layer | 57% blade (plus grip and glow) |

An earlier attempt at `roughW: 108` matched the sword's **full** length instead of its blade, and the
chunky blank sprite came out as a slab wider than the anvil. Measuring the blade rather than the whole
asset is what fixed it.

**Harness note:** the preview tab is hidden, so CSS transitions and `setTimeout` are throttled there —
`getComputedStyle` returns the pre-transition value however long you wait. Set `transition:none`, force
a reflow, then measure. Also, `getBoundingClientRect` on a rotated element is the axis-aligned box, not
the element's own width; the rough blade reads 103% AABB but is 77% wide.

## r31 — the hammer step gets its loop (2026-08-27)

Owner brief: *"we use the dragon to blow fire on the ore first — ore starts glowing — then we hammer it
(strike it) — it slowly changes shape to the rough blade. it gradually cools down (show the heat level
with glow and effects, no ui), then we have to use dragon to heat again and hammer it to the final
shape."* Plus: make the sphere a bit smaller (`oreW` 19 → 15).

So the r30 mockup stops being a mockup. The HUD's stage buttons are gone; shape progress is now earned.

### Two numbers, no UI

`hmHeat` (0…1) and `hmProg` (0…2, one unit per shape change). Neither is ever printed. Heat is read
entirely off the metal, and shape off which render is showing.

| | |
|---|---|
| `heatGain` 0.80/s | while the flame is **on** the metal |
| `heatCool` 0.07/s | always — this is what sends you back to the dragon (r31c: halved) |
| `workMin` 0.35 | below this the metal will not move |
| `strikeBite` 0.09 | heat a landed blow costs |
| `strikeGain` 0.14 | shape a landed blow buys |
| `reach` 0.46 · `cone` 34° | how far and how wide the flame counts as on-target |
| `strikeGap` 170 ms | debounce |

Dry-run with those constants: **15 blows over 3 heat cycles**, 6 blows per heat, ~6.2 s of pure action.
0.54 s of flame makes cold metal workable; walking away takes 6.7 s to go stone cold.

### Making "cold" visible

The first attempt only *brightened* hot metal, which failed: `balanced_*_midblade.png` is painted orange,
so a stone-cold blade still looked hot and there was no cue to reheat. Heat now drives **both** ends —
`brightness 0.70 → 1.60` and `saturate 0.30 → 1.15` — so cold metal is actively drained to dull grey and
hot metal runs to near-white. The sphere needs none of that: the crafting screen already has a cold and a
hot gradient, so `#hmOrb` stacks both and fades `.hot` in with the heat.

### Making the shape change read as shape

A plain 0→1 cross-fade left both renders half-transparent across the whole middle of a stage, which
looked like a ghost, not like metal moving. Three things fixed it:

1. The fade is **short and complementary** — `ramp(t, 0.34, 0.62)`, the two alphas always summing to 1 —
   so the metal spends most of a stage looking solid.
2. **Geometry carries the change**: the sphere is squashed (scale 1 → 0.66 × 0.38) as it is beaten out,
   and the rough blade is drawn to length (0.66 → 1.0) rather than appearing at full size.
3. `#hmMorph`, a bloom of forge-glow over the anvil, peaks exactly mid-swap and hides the moment where
   both layers are semi-transparent.

### Aiming actually matters

Two zero-size markers (`#hmSnout`, `#hmAim`) sit on the flame's axis **inside** the dragon wrapper.
Reading their live rects gives the flame's world direction without re-deriving the wrapper's
rotate-and-scale by hand. Sweeping the head across its full ±34° shows the fire landing on the metal only
between −53° and −28° — the rest pose is on-target, so a player who just presses will heat it, but
sweeping away does stop the heating.

### Striking

A blow fires when the hammer head **enters** the anvil zone, so lifting and dropping repeatedly is the
hammering motion. Verified: three in-and-out swings = three blows; one slow sweep across the anvil while
already inside = one blow, not eight. Cold blows still land (sparks, a sideways shudder) but move nothing.

At `hmProg` 2 the scene finishes itself after 1.7 s. The finish is guarded on the modal still being
open, so a `resetRun()` mid-forge cannot re-show the result banner behind the player's back.

### Still open

- **`hammer_sword.png` is one fixed picture** — a Broadsword and a Shortsword finish identically, and
  acquired traits are not reflected. Owner-flagged as placeholder.
- **The constants are unplaytested.** 15 blows may be too many once real drag time is added; `strikeGain`
  is the one dial to turn.
- **Landscape only.** Portrait still runs the old ring-tap minigame.
- The one line of text at the bottom is guidance ("heat it" / "strike it"), not a heat readout. It is the
  only chrome left in the scene.

### r31c — swing, sparks, slower cooling

- **The hammer rotates on impact.** `transform-origin` is the butt of the handle (92.7%, 59.5% of the
  shared canvas), so rotating swings the *head*: −13° drops it onto the anvil, +7° bounces it back, then
  it settles, over 0.24 s. The keyframes have to restate `translate(var(--hx), var(--hy))` because an
  animation replaces the whole `transform`, and the class is removed-then-reapplied on each blow so a
  fast second strike restarts the swing instead of being swallowed by the first.
- **Impact VFX.** A hot blow now gets a white flash, an expanding shock ring, and 22 sparks that arc out
  and fall (`--sx`/`--sy` for the throw, `--sf` for gravity on the way out, randomised size, glow and
  duration). A cold blow gets 6 dull grey chips and neither flash nor ring, so the two read differently
  with no text.
- **Cooling halved**, 0.15 → 0.07 per second. Owner: "way too fast".

| | before | after |
|---|---:|---:|
| full heat → stone cold | 6.7 s | **14.3 s** |
| full heat → unworkable | 4.3 s | **9.3 s** |
| blows per heat | 6 | **7** |

Worth noting for the next tuning pass: **cooling is not what limits a hammering run** — `strikeBite`
(0.09 per blow) is. Halving the cool rate only bought one extra blow per heat; it bought a lot of idle
time before the metal goes cold, which is what the complaint was actually about. If the ask later
becomes "let me get more hits in per heat", `strikeBite` is the dial, not `heatCool`.

**Harness note:** headless Edge fast-forwards virtual time, so a `setTimeout`-based "freeze the frame"
collapses to zero and every VFX screenshot comes back already finished — three different delays produced
three byte-identical PNGs. Pin the frame with the Web Animations API instead
(`document.getAnimations().forEach(a => { a.currentTime = T; a.pause(); })`), and stub `setTimeout`
beforehand so the sparks' own cleanup timers cannot remove them first.

## r32 — books on the map (2026-08-27)

Owner: *"potioncraft has small book icons all over the map. collecting them, gives us skill points. add
these book icons on the map. a small icon that gives +60 exp. and the bigger one gives +120 exp."*

| kind | count | scale | XP | tint |
|------|------:|------:|---:|------|
| small | 70 | 0.86 | **60** | green `#8ba86e` |
| large | 26 | 1.34 | **120** | amber `#c1904a` |

96 books, **7,320 XP** on the board. They live in `<g id="books">` inside `#terrain`, so they sit under
the fog like everything else — books are *found by travelling*, which is the point of putting them there.
14 fall inside the opening reveal, so the mechanic is legible from the first second.

Collected by moving within `book.r + 30` world units (`checkBooks`, called from both travel paths —
hammer travel and the dragon-fire retreat). Guarded on `melt`, so nothing is collected without a blade
out. The book pops and a `+60`/`+120` floats off it; the running total shows as `📖 n XP` under the
SKILL TREE button, which bumps on each pickup.

### Placement

Generated **after** the hazard loop so the seeded RNG sequence feeding traits and hazards is byte-for-byte
unchanged (verified: 25 traits, 70 hazards, first trait still `swift` at 1247,873). Rules: ≥150 from home,
≥74 from any trait, ≥58 from another book.

**Books are deliberately allowed inside hazard zones** — the reference scatters them through the bone
fields, and it makes a book in a ribbon a real trade: 60 XP against blade integrity. **29 of 96 (30%)**
land inside one by true polygon test (24 small, 5 large).

### Drawing note

The CSS pop animation sits on an **inner** `<g>`. The outer group already carries
`transform="translate(x,y)"` as an attribute, and a CSS `transform` replaces it outright — animating the
outer group teleports the book to the world origin mid-pop. SVG `transform-origin` defaults to `0 0`, so
the inner scale happens about the book's own centre for free.

First pass drew them as bright cream glyphs floating over the parchment; the reference's are stamped
tinted tiles with muted ink. Fixed by enlarging the tint pad past the glyph (30×26 at 0.85 opacity),
dropping the page fill to `#e0d0a6` and darkening the line work.

### Still open

- **XP does not convert to anything yet.** The owner said books give skill points; the values given were
  in XP, so XP is what is banked. The XP → skill-point rate, and the SKILL TREE button itself, are still
  placeholders.
- **XP is not persisted or spent**, and it survives `resetRun()` — a shattered blade does not cost you
  the books you picked up on that run. That seemed the kinder default; say if it should be lost.
- Books do not respawn. A new map (`initMap`) makes a fresh set.
- **Landscape only.**

## r33 — Update Composition popup (2026-09-08)

The blade panel's 💾 button was a stub that only printed a hint. It now opens a modal built from the
owner's torn-paper UI set, laid out to `assets/Anchor-images/Update_composition_wireframe.png`.
**Contents are placeholders** — the two panels hold nothing and Update stores nothing.

| piece | asset | native | used for |
|---|---|---|---|
| window | `Small_paperbox.png` | 849×533 | the sheet |
| panels ×2 | `Small_paperbox_dark.png` | 320×252 | Recorded / New |
| Cancel | `Paper_button_red.png` | 213×97 | closes |
| Update | `Paper_button_wider.png` | 453×97 | closes + placeholder hint |

Each piece is its PNG as a `background` with `aspect-ratio` set to the file's own dimensions, so the art
is never stretched — verified in the browser at **0.00% deviation on all four**. Sizes are percentages of
the parent, so the whole window scales with the frame.

### The percentage-padding trap

`padding: 7% 8.5% 8%` on the box produced 75.6px / 91.8px / 86.4px, not the ~42px expected — **percentage
padding resolves against the containing block's width (the modal, 1080px), not the element's own**. The
box was forced past its aspect-ratio height and the paper texture came out 6.6% vertically stretched.
Fixed with px spacing, which the rest of this file uses anyway since the frame is a fixed 1080×600.

### Wiring

`openComp()` / `closeComp()` / `confirmComp()`. `#saveBlade` opens it; `resetRun()` closes it alongside
every other modal, so it cannot survive a shattered blade.

### Still open

- The two panels are inert. They should eventually show the recorded composition against the current
  blade, which is what `#compositionsModal` already does in V2 (portrait) — port rather than rebuild.
- Update writes nothing. There is no composition store in the landscape build.
- The six paper assets in `assets/ui/` (`Small_paperbox`, `Small_paperbox_dark`, `Paper_button_red`,
  `Paper_button_wide`, `Paper_button_wider`, `bookmark_paper`) were **untracked** until this change and
  must ship with it or the popup renders as bare boxes.

### r33b — sized to the wireframe

The first build was 56% of the frame wide; the owner called it too big. Geometry re-derived by pixel-
scanning `Update_composition_wireframe.png` (1398x775) rather than eyeballing it — the popup is pure
white against the screenshot behind it, so a bbox of near-white pixels gives the window exactly, and the
panels and buttons fall out by hue.

| | wireframe | built | note |
|---|---:|---:|---|
| window, % of frame width | 38.34 | **38.3** | 414x260 px at 1080x600 |
| panel, % of window | 40.9 | **40.9** | each |
| Cancel, % of window | 26.7 | **26.7** | |
| Update, % of window | 60.6 | **60.4** | |

Every piece still renders at its native aspect — measured stretch **0.00–0.02% on all four**.

One deliberate divergence: the wireframe window is AR **1.485**, `Small_paperbox.png` is **1.593**. Matching
the wireframe exactly would stretch the paper 7% vertically, so the window matches the wireframe on
**width** and keeps the paper native, coming out ~19px shorter than a straight proportional scale. That is
why the internal spacing is tighter than the wireframe: there is less vertical room to spend.

**Harness note:** the canvas pixel-scan would not run in the Browser pane — a hidden pane throttles the
work and `javascript_tool` timed out at 45s twice. Running the same scan as a standalone page under
headless Edge with `--dump-dom` returned it instantly.

### r33c — shifted off centre

The wireframe does not centre the window on the frame: its centre sits at **40.95% of the frame width**
(measured), clear of the right rail. Built to match exactly.

First attempt used `padding-right: 18.1%` on the modal. That shifted it correctly but **shrank the window
18%** — the box's own `width: 38.3%` resolves against the flex container, which the padding had narrowed,
and the fixed px spacing inside then forced the paper 3% off its native aspect. Corrected to
`margin-right: 18.1%` on the box itself: a margin on a centred flex item shifts it left by half its
value (9.05% of the frame) while the width still resolves against the full modal.

Verified: centre 40.95% exactly, window back to 414x260 (38.3% of frame), all four pieces at 0.00-0.02%
stretch, clears the rail by 204px, and the other modals are untouched at 50%.

## r34 — main forge screen to the wireframe (2026-09-08)

Built to `assets/Anchor-images/Main_forge_wireframe.png`, which splits the frame into a large **left
section** (map + bench) and the narrow right rail, with every expandable window centred on the left
section — the rule r33c already follows.

### Out

| | was | note |
|---|---|---|
| map tabs 1–4 | `#mapTabs` | never had a handler |
| inventory bar | `#xpRow` | decorative, frozen at 45% |
| bottom hint bar | `#sfHint` | see below |
| XP readout | `#expRow` / `#expVal` | `exp` still banks, it just has no display |

### In

| | id | state |
|---|---|---|
| Recipe book | `#recipeBtn` | placeholder, under the blade panel |
| Reputation | `#repVal` | new third stat: Gold · **Reputation** · Popularity |
| Diary / Quest | `#diaryBtn` `#questBtn` | placeholders, foot of the rail |
| Pan arrows | `#panUp/Down/Left/Right` | **live** — 22% of the view per press |

`#panPad` spans the left section only (`right: var(--rail-w)`), so the arrows sit on that section's edges
as the wireframe places them and follow the rail if its width changes. `setView()` already clamps to the
world, so a press past an edge simply stops — verified clamping at (0,0) and at x+w = 2800.

### Three things the removals dragged with them

1. **`hint()` lost its surface.** It is now a no-op, but all ~20 call sites are left intact — that copy is
   the only guidance the build has, and pointing it at a new surface is a one-line change in `hint()`.
2. **`updateExp()` is gone**, along with its two call sites. `exp` still accumulates in `takeBook`, so
   book XP is not lost, only invisible.
3. **`#frame.clean`** listed `#sfHint` in its hide-list; that slot now hides `#panPad` instead, so the
   clean screenshot mode still strips the floating chrome.

### Watch

The **Down arrow sits over the bench**, per the wireframe — it overlaps the Bellow caption and is close
to the furnace drag targets. It is a small button in dead space now the hint bar is gone, but if bench
dragging near the centre-bottom starts feeling fiddly, this is why.

## r35 — scale and placement matched to the forge wireframe (2026-09-08)

Geometry taken from `Main_forge_wireframe.png` (1045×585) by **hue-segmenting** it into components: a
box's border and its fill share a hue and differ only in lightness, so bucketing by hue and running a
connected-component pass returns each box's true outer bounds in one go. Fifteen boxes, no eyeballing.

Everything below is now within **0.62 percentage points** of the wireframe, most within 0.4 — under 7px
on the 1080×600 frame.

| element | wireframe x / y / w / h (% of frame) | built |
|---|---|---|
| blade panel | 0.96 / 1.20 / 13.11 / 15.04 | 0.93 / 1.17 / 13.15 / 15.50 |
| tier slot | 1.63 / 1.88 / 1.72 / 4.62 | 1.48 / 2.17 / 1.81 / 4.67 |
| cancel · update | — / 7.52 / 5.93 / 3.08 | — / 7.33 / 5.79 / 3.17 |
| recipe book | 1.34 / 11.11 / 12.44 / 4.62 | 1.48 / 11.00 / 12.04 / 4.67 |
| day tile | 80.67 / 3.76 / 5.36 / 10.94 | 81.04 / 3.67 / 5.44 / 11.00 |
| stat pill | 87.27 / 3.76 / 11.96 / 3.25 | 87.68 / 3.67 / 11.49 / 3.33 |
| skill tree | 80.67 / 15.21 / 18.56 / 3.25 | 81.04 / 15.17 / 18.13 / 3.33 |
| tabs | 80.67 / 20.51 / 18.56 / 8.38 | 81.04 / 20.50 / 18.13 / 8.33 |
| inventory | 80.67 / 28.21 / 18.56 / — | 81.04 / 28.83 / 18.13 / — |
| diary | 80.67 / 90.94 / 8.80 / 7.18 | 81.04 / 91.00 / 8.79 / 7.17 |
| quest | 90.33 / 90.94 / 8.90 / 7.18 | 90.38 / 91.00 / 8.79 / 7.17 |

### What changed structurally

- **`#oreShelf` stopped being absolutely positioned.** It was `position:absolute` against `#rail` with a
  `top:11%` offset that existed only to clear the MATERIALS caption. The wireframe has no such caption,
  so the caption is gone and the shelf is an ordinary `flex:1` child of `#matPanel` — which is what lets
  Diary/Quest sit at the true bottom instead of floating.
- **The tabs grew from 23px to 50px** and gained the wireframe's labels (Ingredients / Ingots / Swords /
  Items & Decor). At 23px with no text they read as decoration; the wireframe treats them as real
  category buttons.
- **The rail's own padding does the alignment.** `13px 3px 5px 12px` with `gap: 0` puts the card *inner*
  edges on the wireframe's 80.67% / 99.23% — the wireframe draws the controls, not the card behind them,
  so the inner edge is what has to line up. A first pass with symmetric padding put every rail element
  0.92pp too far right at once, which is the signature of getting this wrong.

### Watch

- **The ✕ and 💾 buttons are now 19px tall**, down from 42px — that is the wireframe's 3.08%, but the
  emoji glyphs are cramped at that size. Real icons would sit better than emoji here.
- **The pan arrows were not touched** and are still off the wireframe: it wants Up/Down at 6.99% × 3.93%
  (≈75×24px) and Left/Right at 5.26% × 7.18% (≈57×43px); the build has 36×24 and 24×36. Left alone since
  this pass was scoped to the top-left panel, Diary/Quest and the rail.

## r36 — forge screen re-matched to the updated wireframe (2026-09-09)

Owner supplied a revised `Main_forge_wireframe.png` plus `Main_forge_wireframe_forge.png` (the same
layout with real art dropped in), both 1200×666. Three asks: match the screen, rework the top-left group
and **make it collapsible**, and re-arrange the bench.

Measured the same way as r35 — hue-segment the flat wireframe into connected components — but this time
on **border strokes only** (`l < 0.74`). Fills bridge adjacent boxes and merged Day + Popularity + Skill
Tree into one blob; the border ring of each box stays separate.

### Layout changes

- **The map grew**: `grid-template-rows` 75.5% → **79.58%**. The bench band is now 20.42% of the frame,
  which every `LAYOUT.landscape` y is a fraction of — so all the bench numbers moved even where the prop
  did not.
- **Skill Tree went from a strip to a block**: 3.25% → **8.26%** tall, and the whole rail stack now
  starts flush with the frame's top edge (Day tile at y 0.45%, was 3.76%).
- **The bench re-arranged.** Dragon off the bench entirely and up into the map band on the left; mug and
  bucket lifted to sit on the frame's bottom edge; anvil, hammer, furnace and grinder all re-centred.

| prop | LAYOUT before | after | frame position now (centre-x / bottom) |
|---|---|---|---|
| dragon | 0.081 / −0.989 | **0.014 / −2.718** | 10.11 / 53.31 |
| stAnvil | 0.187 / −0.249 | **0.199 / −0.597** | 23.26 / 90.25 |
| hammerTool | 0.247 / 0.449 | **0.309 / −0.276** | 30.93 / 99.25 |
| stSmelt | 0.539 / −0.816 | **0.540 / −1.294** | 52.14 / 94.61 |
| stMortar | 0.795 / −0.289 | **0.802 / −0.760** | 72.44 / 91.58 |
| bucket | 0.019 / 0.041 | **0.045 / −0.766** | 10.31 / 100.01 |
| mug | 0.054 / −0.025 | **0.064 / −0.409** | 10.26 / 89.94 |

Sizes untouched — the owner said the *arrangement* changed. Targets were each prop's wireframe box
centre-x and bottom; the deltas were measured off the live build and divided by the new bench zone, so
every prop lands within **0.03pp** of target. UI elements are within **0.74pp**.

### The collapsible group

`#hudToggle` is a 34×20 tab under the blade panel. `#hud.collapsed #bladePanel { display:none }` leaves
only the tab, which flips ▲/▼ and swaps its `title`/`aria-expanded`. `#hud` was already a flex column in
landscape, so the tab needed no positioning of its own.

### Two guards this tripped

1. **`RECORDED` is a second copy of the table** and the drift check compares against it — it has to be
   updated in the same edit or the self-test goes red. The first patch only rewrote the head of that
   one-line object and left the mug/dragon entries stale.
2. **The in-zone guard's `yMin` was −1.30.** With a shorter bench *and* the dragon moved up into the map,
   props now rise up to 2.72 bench-heights above the floor line. Raised to **−2.80**.

### Watch

- **`#heatMini`** (the 🔥 gauge) is bench-positioned and now sits over the anvil. Not in the wireframe;
  needs a home.
- The bench captions (`Hammer anvil`, `Bellow`, `Smelt furnace`, `Grind wheel`) overlap the re-arranged
  props more than before.
- **The pan arrows are still off-scale** (r35 note stands): the wireframe wants ~75×24 and ~57×43.

### r37 — props matched to the reference ART, position and scale

r36 placed the props from the flat wireframe's placeholder boxes. Those boxes are **not** the art bounds —
the dragon's box is 10.17% of the frame where its art is 17.33% — so this pass re-measured against
`Main_forge_wireframe_forge.png`, the version with the real assets dropped in.

**The step that made it work:** the element box `LAYOUT` sets is not the visible art, because the PNGs
carry transparent padding. Measured each asset's opaque box first:

| asset | ox | oy | ow | oh |
|---|---:|---:|---:|---:|
| anchor_furnace | 0 | **0.2284** | 1 | **0.7716** |
| anchor_anvil | .0088 | .0091 | .9824 | .9804 |
| anchor_grindwheel | .0080 | .0108 | .9829 | .9783 |
| anchor_bucket | .0126 | .0085 | .9748 | .9915 |
| anchor_mug | .0089 | .0091 | .9821 | .9817 |
| anchor_hammer | .0099 | .0080 | .9803 | .9829 |

Everything is ~98% opaque except the **furnace, whose top 23% is empty sky** — placing it by its element
box would have hung it 57px too high. With the opaque box known, target art bounds invert cleanly to
element bounds: `W = artW / ow`, `left = artLeft − ox·W`, `top = artBottom − (oy+oh)·H`.

| prop | LAYOUT x / y / w | art now vs reference |
|---|---|---|
| stAnvil | 0.169 / −0.438 / 0.186 | L −0.02, W +0.01, B +0.02 |
| stSmelt | 0.496 / −1.218 / 0.243 | L +0.01, T +0.03, W +0.03 |
| stMortar | 0.728 / −0.744 / 0.243 | L 0.00, W +0.04, B +0.05 |
| bucket | −0.010 / −0.103 / 0.177 | R −0.06, T +0.01 |
| mug | 0.034 / 0.188 / 0.067 | L −0.01, T +0.34, W +0.15, B −0.23 |
| hammerTool | 0.302 / 0.381 / 0.148 | L −0.14, T −0.18, W +0.27 |

All seven within **0.34pp**. The bellows is not a `LAYOUT` prop — it is `.bellowtop` inside `#stSmelt`,
so it rode along with the furnace and needed no separate move (verified still overlapping it).

Two guard changes: **`xMin` −0.02** for landscape, because the bucket deliberately bleeds off the left
edge as the reference does; and the mug and hammer are CSS-rotated, so their rendered bbox is wider than
their element box — they were matched bbox-to-bbox against the reference rather than through the opaque
maths.

**Watch:** the hammer's rest position is now 176px from the anvil's strike point against a 99px strike
radius (was 125px). It is a parked position and dragging still reaches, but there is less slack than
before.

### r38 — furnace smoke: on the crucible, and only while bellowing

The smoke was a bench-positioned overlay pinned at `left:37%; top:2%` with a 6s loop running forever. Two
problems: those bench coordinates were set when the furnace was somewhere else, so r36/r37 left it
adrift; and it puffed away with the forge cold and idle.

- **Re-parented into `#stSmelt`**, so it travels with the furnace and cannot drift again. Placed on the
  crucible mouth — `left: 34%; bottom: 74%; width: 34%` — from the asset: `anchor_furnace.png` (638×775)
  has its pot rim spanning x 200–450 (centre **51%**) with the rim top at y 195 (**25%** down).
- **Gated on the bellows.** Base state is `opacity: 0; animation: none`; `wireBellowGate` adds `.on`
  alongside `bellowing` and removes it on pointer-up/cancel. `resetRun()` clears both as well, so a
  pointer lost mid-pump cannot leave it smoking. The loop tightened 6s → 2.2s, which reads as active
  pumping rather than an idle chimney.
- **`filter: none`.** `.station img` applies a drop-shadow to every image in a station — correct for the
  furnace, wrong for smoke, which was casting a hard shadow.

**Measurement note:** checking the placement right after adding `.on` reads the animation's first
keyframe (`scale(.8) translateY(14px)`), which made the smoke look 20% too small and 5.6% too low. Pin
the animation (`a.currentTime = …; a.pause()`) before measuring anything that animates on entry.

## r39 — idle nudge arrow (2026-09-09)

`assets/ui/arrow.png` shown arcing from the ore on the anvil to the smelter's crucible, to unstick a
player who has run out of route and has not realised the orb needs re-heating.

### When it shows

All four must hold, checked every frame in `tick`:

1. `melt.stage === 'onAnvil'` — the ore is out on the anvil
2. `!melt.reachedTrait` — the sword is not parked on a trait
3. `swordAtRouteEnd()` — `sword.seg` is the last segment and `sword.frac >= tPct`
4. `performance.now() - lastActAt >= 4000`

`lastActAt` is refreshed by `pointerdown`, `pointerup`, `wheel` and `keydown` on `#frame` (capture), plus
`pointermove` **only while a button is held** — a hover is not an action, a drag is. Because any click
resets the timer, "hides when the player clicks something" and the 4-second gate are the same mechanism
rather than two that can disagree.

### Aiming it

The arrow is placed by its own tips, not by a bounding box. Measured off the 409×158 asset:
**tail (3.1%, 98.1%)**, **head (95.4%, 79.7%)** — and the tail→head axis already sits at **−4.404°**
inside the image, which is subtracted from the rotation.

```
W = distance / 0.9257          // axis length as a fraction of the width
left/top  = tail − tip·(W,H)   // put the tail tip on the ore
transform-origin = the tail tip;  rotate(atan2(dy,dx) − (−4.404°))
```

Tail lands on the orb's centre and head on the crucible mouth (51% across, 25% down
`anchor_furnace.png`) to within **0.1px**. It re-places every frame while visible, because both the orb
and the furnace can be dragged.

### The sheen

The art is pure white on transparent, so the sweep is a **band mask**: `mask-size: 320%` with the opaque
band at 42–58% of the mask, animated `mask-position` **100% → 0%**, which travels the band left to right
(an oversized mask offsets by `P × (elementW − maskW)`, so a *falling* percentage moves it right). The
band is centred on the arrow at the animation's midpoint. Opacity ramps 0 → .95 → 0 over the same 2.1s,
so it reads as a fade-in-and-out with the highlight travelling from tail to head.

First attempt used a 300% mask with a 40%-wide band — **1.2× the arrow's own width**, so the whole arrow
lit at once and the direction was invisible. Verified by pinning the animation at three phases.

### Note

`filter: drop-shadow(...)` is needed: pure white on the pale parchment has almost no contrast otherwise.

## r40 — second idle nudge: "tap the ore" (2026-09-09)

`assets/ui/arrow_point_down.png` bobs over the ore once a trait is banked, because the next move —
tapping the orb to open the shape picker — is not signposted anywhere.

### Shows when

`melt.stage === 'onAnvil'` · `melt.traits.length >= 1` · no modal open · idle ≥ 4s. Same `lastActAt`
timer as r39, so any input hides it and it returns after another 4s of quiet.

### The two nudges are now mutually exclusive

This is the part that needed care. Acquiring a trait clears `melt.reachedTrait` and leaves the sword
parked at the end of its route — **exactly r39's condition** — so both arrows would have fired together.
`hintArrowWanted()` now also requires that no trait has been banked:

| state | nudge |
|---|---|
| route spent, nothing acquired | r39 arc → re-heat at the furnace |
| a trait acquired | r40 down-arrow → tap the ore |

Both are additionally suppressed while any `.sf-modal.show` is up, which r39 was missing.

### Placing it

Tip of the asset is **(44.87%, 95.2%)** of its 234×396 box. Sized to twice the orb's height, tip parked
`orbH × 0.25` above the orb's crown and horizontally centred — lands within **0.1px**, re-placed every
frame since the orb moves.

### ⚠️ Harness note — this cost two false "it's broken" readings

**Headless Edge and the hidden Browser pane do not advance CSS animations.** An element whose opacity
lives in a keyframe therefore renders at its 0% value — invisible — no matter how long the virtual-time
budget is. Both the live `getComputedStyle` check and the screenshot reported `opacity: 0` for a working
element. `#hintArrow` (r39) only ever appeared in screenshots because its animation was pinned for a
different reason.

**Always pin every animation that carries opacity before judging whether something renders:**
`a.currentTime = <end>; a.pause();`

Separately, `a.getAnimations()` returns **transitions as well as animations** — pausing the lot freezes
transitions mid-flight and poisons every later reading in that page session.

The fade is a keyframe (`hintFade`) rather than a `transition`, because a transition off
`visibility: hidden` did not fire at all here. Two animations on the element, one per property.

## r41 — Composition Book (2026-09-09)

Opened by **RECIPE BOOK** in the top-left panel (which had no handler until now). Built to
`Composition_book_wireframe.png` (1397×775), hue-segmented for the box geometry.

### Fitting the base art to the wireframe's page

`Composition_book_base.png` is 1920×1080 but the drawn book occupies only `ox .0339 oy .0778 ow .7271
oh .85` of it. `.cb-book` **is** the page area (70.15% × 83.23% of the frame, matching the wireframe's
white panel); the base image is then oversized to `137.53%` and pushed to `left:-4.66% top:-9.15%` so its
opaque region lands exactly on that box. Its aspect (1396:918 = 1.521) matches the wireframe panel
(980:645 = 1.519) to within 0.1%, so nothing is stretched.

Every child is positioned in **% of `.cb-book`**, converted from the wireframe with
`container% = (frame% − origin%) / span% × 100`.

### Contents

| | |
|---|---|
| base | `Composition_book_base.png` — its own gutter replaces the wireframe's divider |
| bookmarks | `bookmark_paper.png` ×10 along the top, ×5 down the right, **behind** the page so only the tab shows; side ones rotated 90° |
| yellow boxes | 8 empty dashed bounding boxes — 5 traits, ores used, recipe, shapes discovered |
| sword | the four default parts stacked (`balanced_longsword_blade` + `guard1` + `grip1` + `pommel1`) |
| change default design | ⚙ icon button at the sword box's bottom-left |
| erase · close | `Paper_button_red.png` |
| craft 5 · craft 1 · continue from here | `Paper_button_wide.png` |

### Two things worth recording

- **The sword parts are pre-registered** — all four are 512×512 and stack at `inset:0`, like the hammer
  scene layers. They are also drawn on a 45° diagonal, so the *wrapper* is rotated −45° to stand the
  blade up in the tall box; rotating the wrapper keeps the four parts aligned. A square turned 45° needs
  ~1/1.41 the room, hence `height: 70%`.
- **Buttons take their width from the wireframe cell's HEIGHT** through the asset's own aspect ratio,
  not from the cell's width. Sizing them by width would have made the red button 69px tall against a
  43px cell and collided the two button rows. All five measure ≤ **0.03%** stretch.

### Placement

Centred on the **left section** (`margin-right: 18.1%` on a centred flex item → centre at 40.95%), per
the owner. The wireframe itself sits at 39.94%, so every element reads **+1.01pp** against it by design;
sizes match to 0.00 and vertical positions to ≤0.13pp.

### Still open

Nothing is wired but open and close. Erase, the two Craft buttons, Continue from here, the gear, and all
eight content boxes are inert, and the bookmark icons are a repeating placeholder set — the real ones
will be each recorded composition's element symbols.

## r42 — Skill Tree (2026-09-09)

Opened by the rail's **SKILL TREE** button, which had no handler until now.

Geometry from `Skilltree_wireframe.png` (1161×644), hue-segmented: the white panel is frame
x 2.07–78.04%, y 3.11–95.66%, and every child is a % of that box.

| | |
|---|---|
| sheet | `Skill_tree_base.png` — near full-bleed (opaque .966 × .955), so it needs only a ~1.5% nudge |
| centre | `icon_skilltree.png` at 16.89% of the sheet width, dead centre (measured 50.05 / 49.91) |
| nodes | 12 placeholder circles: **4 yellow top-left, 4 green top-right, 4 blue bottom** |
| reset talent | `Paper_button_wide.png` |
| close | `Paper_button_red.png` |
| talent points | a dashed bounding box, like the book's slots |

### The wireframe has six nodes; the brief asked for twelve

So the nodes are **laid out, not traced**. Three elliptical arcs about the centre — `rx 260 / ry 175` on
an 820×568 sheet — so the spread follows the sheet's proportions instead of bunching into a circle.
Verified: no node overlaps the core (min gap **80px**) and none runs off the sheet.

### Two deliberate divergences

- **Height is 1.4pp under the wireframe panel.** The base art's opaque aspect is 1.4433 against the
  wireframe panel's 1.478. Matching the panel exactly would stretch the parchment 2.4%, so the sheet
  matches on **width** (Δ 0.00) and keeps its own aspect.
- **x is +0.9pp**, because the window is centred on the **left section** (40.95%) like every other modal,
  where the wireframe sits at ~40.06%.

Buttons take their width from the wireframe cell and their height from the asset's aspect — both measure
≤ **0.03%** stretch. Driving off width (rather than height, as the Composition Book does) keeps RESET
TALENT inside the sheet's left edge; neither button stacks, so nothing can collide.

### Still open

Only open and close are wired. Reset talent, the twelve nodes, the core and the talent-points readout
are all inert.

### Harness note

The Browser pane's viewport collapsed to `innerWidth: 0` this session — every measurement came back
`NaN`, and a resize plus reload did not recover it. Headless Edge with `--dump-dom` and an in-page probe
`<div>` measured fine. That fallback is the reliable one when the pane misbehaves.

## r43 — the arrows navigate between screens (2026-09-09)

The four arrows stop panning the map and become screen navigation. The forge sits at the centre of a
plus; every other screen has exactly one way back.

```
              bedroom
                 |
    customer -- forge -- cave
                 |
             basement
```

| direction from forge | screen | plate |
|---|---|---|
| up | bedroom | `bedroom_background.png` |
| down | basement workstation | `basement_background.png` |
| left | customer counter | `customer_counter_background.png` |
| right | cave | `cave_background.png` |

Driven by both the **on-screen arrows and the keyboard arrow keys** — "arrow keys" was ambiguous between
the two, and wiring both costs one listener.

### Stacking

The plates are 1920×1066 (aspect 1.801 against the frame's 1.800) and **leave their right ~20% blank —
that is the rail's slot**, so the art is authored to sit under it. `#screenLayer` is therefore z-index
40, `#rail` was given **45** so it stays on top, and `#panPad` **50** so the way back is always
clickable. Modals at 1000 are untouched.

### Details worth keeping

- **An arrow with nowhere to go is hidden**, not left dead — on the bedroom only ▼ shows. Verified each
  placeholder exposes exactly one exit and that a dead direction is a no-op.
- **Navigation is blocked while any modal is open**, so you cannot walk out from under the skill tree.
- **Both idle nudges are now forge-only** (`SF_SCREEN !== 'forge'` short-circuits them). Their state
  conditions could otherwise still hold while a placeholder plate was up, and they would have drawn
  over it.
- `panBy()` is gone. The map still pans by **drag** and zooms with **+/−**; only the arrow-key panning
  was displaced.

### Still open

The four screens are inert plates with a corner tag. The rail stays live over them, which is right per
the r30-era mockups, but nothing else on those screens exists yet.

## r44 — bedroom interactions (2026-09-09)

Two clickable things on the bedroom plate, driven by a per-screen hotspot table (`SCREEN_HOTS`) that is
rebuilt on every `goScreen`. Hit areas are % of the frame, read off `bedroom_background.png` — the plate
shares the frame's aspect, so `object-fit: cover` crops nothing and the percentages map straight across.

| | area (% of frame) | on click |
|---|---|---|
| bed | 13.0 / 43.6 / 24.5 / 38.5 | end-day confirmation |
| dragon | 50.8 / 54.9 / 19.8 / 20.1 | six hearts pop and drift up |

Hotspots are invisible until hovered (a faint warm wash + inset ring), so the art stays clean but the
interactions are still findable.

### The dialog

Built from the same paper set as the r33 Update Composition popup, which the wireframe's proportions
already matched. Width **35.25%** of the frame = the wireframe exactly; the box keeps `Small_paperbox`'s
native 1.593 aspect and centres on the left section at **40.95%**.

**Button choice was measured, not guessed:** the wireframe draws Yes ≈ 2.1× the width of No at equal
height. `Paper_button_red` (2.196) with `Paper_button_wider` (4.670) gives 2.13:1; pairing it with
`Paper_button_wide` (2.804) would only give 1.28:1. Both measure ≤ **0.02%** stretch.

- **No** closes and leaves you in the bedroom.
- **Yes** closes, **increments the day tile** and returns to the forge. ⚠️ The increment is *cosmetic* —
  there is no day system behind it, and `#dayNum` was a hardcoded dummy before this.

### Harness note (third time this pattern has bitten)

The hearts screenshot came back empty twice. Headless Edge fast-forwards virtual time, so `popHearts`'
own `setTimeout(…, 1600)` cleanup fired and removed every heart before the frame was captured — and
separately, CSS animations do not advance, so unpinned hearts render at their 0% opacity.

**Both stubs are needed, in this order:** replace `window.setTimeout` *before* triggering the effect (so
cleanup never schedules), then pin each element's animations with `currentTime` + `pause()`. Stubbing
after the trigger is too late.

## r45 — shop screen (2026-09-09)

Added one step left of the customer counter, using `shop_background.png` (1920x1066, same format as the
other plates).

```
                       bedroom
                          |
  shop -- customer --  forge -- cave
                          |
                      basement
```

The counter is now the only screen with **two** exits (left to the shop, right back to the forge); the
arrow-hiding rule surfaces that automatically. Verified the full route out and back by both arrows and
keyboard, that the shop ignores its three dead directions, and that all five screens are still reachable
from the forge.

Inert plate, no hotspots.

## r46 — the wood board behind the rail is gone (2026-09-09)

Owner flagged a sliver of image showing at the rail's left edge on the placeholder screens.

**It was not the screen plate bleeding through.** `#rail` is opaque and `elementFromPoint` confirmed it is
the topmost element right across that strip; `#map-wrap` has `overflow: hidden`, so the map traits whose
bounding boxes reach into the rail are clipped and never painted there.

The culprit was **`rail_wood.png`**, the rail's own background: a wooden ore board with **pale stone caps
top and bottom** and its own grid of slot recesses. The rail's 12px left padding left a strip of it
visible, and the stone cap is what read as a stray image. It was redundant anyway — `#statPanel` and
`#matPanel` sitting on top now carry their own parchment and their own slot grid, so the board underneath
had nothing left to do.

Dropped from `#frame.landscape > #rail`, leaving the flat `#1b120c`. The rail edge is now a clean dark
seam on every screen.

The base `#frame > #rail` rule still references the board, but `#frame` ships with `class="landscape"` in
the markup so that rule never paints in this build — left alone as the portrait-lineage fallback.

## r47 — three racks on the shop screen (2026-09-09)

`assets/Game-elements/rack.png` ×3, placed to `Skilltree`-style measurement rather than by eye.

### Isolating the placement

The owner shipped a **new `shop_background.png` in the same drop** (2770×1536, was 1920×1066 — the wall
swords are gone, leaving a blank wall for these to stand in front of). That made the reference easy to
read: **diff `shop_racks.png` against `shop_background.png`** and everything that differs is the racks.

In the reference's 1324×736 space all three share **bottom y = 544 (73.91%)** and width ≈168, with left
edges **257 / 491 / 744**. The spacing is *not* uniform (pitch 234 then 253) — reproduced as measured,
since the owner placed them by hand.

A first pass merged the leftmost rack into rescaling noise from the window wall; restricting the diff to
x 230–960 / y 225–565 separated all three.

### Props are anchored to the ART, not the frame

`#frame`'s width is **responsive** — it measured **1039×600**, not the 1080×600 the CSS implies, so the
frame's aspect is not fixed. The plate is drawn `object-fit: cover`, so the art is scaled and side-cropped
by an amount that depends on the frame's aspect (at 1039 wide the shop plate renders 1082×600, cropped
22px each side).

Two consequences, both real bugs in the first attempt:

1. A prop pinned in frame-% **drifts off the art** whenever the window changes width.
2. The vertical anchor was **1.55pp out** even at rest, because an element's height derives from its
   *width* (a % of frame WIDTH) while its `top` was a % of frame HEIGHT.

So `SCREEN_PROPS` now stores each prop's **art left / art width / art bottom as a % of the plate image**,
and `layoutScreenProps()` resolves them in px against the plate's cover box, recomputed with the same
maths `object-fit: cover` uses. It re-runs on the plate's `onload` (`naturalWidth` is 0 before the decode)
and on `resize`. Measured back in plate-image space: **dL 0.00, dW 0.00, dB −0.02** on all three, aspect
exactly native.

### Two things this turn also fixed

- **`#screenLayer img` was leaking onto the props**, forcing `height:100%; object-fit:cover` on them — the
  racks rendered as three horizontal slivers. Scoped to `#screenArt`.
- **`rail_wood.png` was deleted from the repo** after r46, leaving the base `#frame > #rail` rule
  pointing at a missing file. Reference dropped (that rule never paints — `#frame` ships with
  `class="landscape"` — but it was a 404 on every load).

## r48 — the Racks window

Clicking any rack on the shop screen opens a window listing the swords on it: `rack.png` as the base,
placeholder swords lying horizontally across it, a Details panel per sword, a Close button, and a
scrollbar. The rail keeps its own light.

Built to `assets/Anchor-images/Racks_window.png` — a **full-frame** capture (1455x798: it carries a 1px
grey border and the green inventory placeholder runs to the right edge), so every number below is a % of
the **left section** (0.79 x 1455 = 1149.45 wide, 798 tall), which is exactly the window's own box.

| element | wireframe px | % of left section |
|---|---|---|
| list viewport | x 113-1096, y 80-720 | left 9.83, top 10.03, w 85.52, h 80.33 |
| sword slot | x 113-850 | left 0, w 75.08 *(of the viewport)* |
| details panel | x 865-1096 | left 76.50, w 23.60 *(of the viewport)* |
| row box / pitch | 738x143, pitch 166 | h 22.31, pitch 25.90 *(of the viewport)* |
| scrollbar | x 1109-1145, y 67-716 | left 96.48, top 8.40, w 3.22, h 81.33 |
| close | x 47-131, y 722-785 | left 4.09, bottom 1.63 |
| rack base | behind the sword column | left 7.83, top 6.89, w 68.12, h 85.21 |

Measured back in the browser at 1039x600: **every one of those lands on its target to 0.00pp**, and at
max scroll the last row's bottom is flush with the viewport bottom (0.0px).

Details panels are `Small_paperbox.png` (849x533) in a 232x143 box — a 1.8% stretch. Close is
`Paper_button_red.png` at its native 213:97; the wireframe draws that slot nearly square, so the button
is anchored by its left edge and bottom and takes its height from the asset.

### The dark overlay stops at the rail

The owner's one explicit constraint. `.sf-modal` is `inset: 0` and would dim the rail (z-index 45) from
z-index 1000, so `#sfRackModal` overrides `right: var(--rail-w)` — the same trick `#panPad` uses.
Verified by diffing a screenshot with the window open against one without: column luminance falls to
**0.44x from x=20 through x=815** and is **exactly 1.000x from x=825 on**, with the rail's left edge at
821. Opening the window also selects the rail's existing SWORDS tab (and restores the previous tab on
close).

### Why the scrollbar is hand-built

A native bar's width is fixed in px, which would have eaten into the viewport's content box and pushed
the details column off its measured %. So `#rwBar`/`#rwThumb` are plain elements at the wireframe's
coordinates and the row track is moved with `translateY(-RW_SCROLL%)`; because `#rwTrack` is `inset: 0`
its height *is* the viewport height, so a % of scroll and a % of content share one unit. Wheel, thumb
drag and track paging all route through `rwScrollTo`. The wireframe is drawn mid-scroll (its first row is
clipped by 49px); the build opens at scroll 0, which is state rather than layout.

### Sizing the placeholder swords from the art

The part set is drawn along the 45-degree diagonal of a 512 square, so `rotate(45deg)` lays a sword flat
(the Composition Book uses `rotate(-45deg)` to stand one up). One uniform size does not work: after
rotation an assembled sword's **thickness** varies 3x across the set (a slim machete is 0.142 of the
element side, `ice_guard1` 0.402) while its **length** barely moves (0.83-1.19). At `width: 96%` the fat
combos overran the 108px row and were squared off by the slot's `overflow: hidden` — hard rectangular
cuts on the ice and water rows.

So each row carries its own size, computed by rotating the opaque pixels of all four parts by +45 degrees
about the canvas centre and taking the extent:

    s  = min(0.98/len, 0.88/4.88/th)     0.98 leaves a sliver at the tips
                                         4.88 = slot 527 / row 108 at the measured frame
                                         0.88 = 12% headroom, so a wider frame cannot clip
    sx = -cx                             the art's own centre offset, so it sits centred in the slot

`ice_guard1` and `water_guard1` are out of the placeholder set — keeping them would have forced every
sword down to ~40% of its slot. `flame_guard1` is slim and stays.

### Harness note (again)

A first reading said the scroll clamp was 250px short. It was not: the **hidden Browser pane does not
advance CSS transitions**, so `#rwTrack`'s `transition: transform .12s` had not run and the measurement
caught the start value. The inline style and the *computed* matrix were already right; pinning with
`getAnimations()` gave a flush 0.0px. Read the computed transform, not the laid-out box, when a
transition is in flight.

### r48c — the racks were not actually clickable

Shipped broken and the owner caught it. `#screenHots` (z-index 42) sits above `#screenProps` (41) and
is `inset: 0` with default `pointer-events: auto`, so **even with no children** it covered the whole
plate and swallowed every click on the props beneath. `elementsFromPoint` over a rack read
`DIV#screenHots` first, then the rack image. Fixed with `pointer-events: none` on `#screenHots` and
`pointer-events: auto` on `.sc-hot`, so the bedroom's bed and dragon still take clicks.

**Why the r48 verification missed it:** it called `el.click()` on the rack image, which dispatches
straight at the element and skips hit-testing entirely. A click that a user could not make still passed.
Verify clicks with `document.elementFromPoint(x,y).dispatchEvent(new MouseEvent('click',...))` — if the
wrong element comes back from that lookup, the test fails the way the user would. All three racks now
hit-test to `IMG.hot` and open the window.

One more trap in the same check: probing a prop's box in the same tick as `goScreen('shop')` reads a
zero-height rect, because `layoutScreenProps()` bails until the plate has decoded and only the
`art.onload` pass places the props. Wait for it before measuring.

### Known gaps

- **`rack.png` is a portrait asset** (241x427) and the window is landscape, so the base is stretched
  ~2x horizontally. It reads as the window's frame, but its hooks no longer line up with the sword rows;
  a wide rack variant would drop straight in with no code change.
- `RACK_STOCK` is six invented swords. Nothing connects the window to real inventory, all three racks
  open the same list, and Details only toggles between the label and the placeholder stats.

## r49 — Recipe book and Ledger on the shop screen

From `assets/Anchor-images/Shop_wireframe.png`, measured by isolating the wireframe's orange **border**
colour (255,158,66) and taking connected components, so neighbouring fills cannot bridge. In its
1202x671 space:

| element | wireframe px | % of frame |
|---|---|---|
| Recipe book | x 12-110 (99), y 14-70 (57) | left 1.00, top 2.09, w 8.24, h 8.50 |
| Ledger | x 785-927 (143), y 561-635 (75) | left 65.31, top 83.61, w 11.90, h 11.18 |

Measured back in the browser at 1039x600: **0.00pp on all four numbers for both** (86x51 and 124x67 px).

The same pass also read the wireframe's three tall racks (x 143 / 406 / 647) and the rail's Skill tree /
Diary / Quest boxes, which the build already has. Note the wireframe draws **five** racks (three tall,
two wide) where the build has three — the owner asked only for the two icons, so the racks are untouched.

### Frame-anchored, not art-anchored

New `#screenUi` layer (z-index 43, above `#screenProps` 41 and `#screenHots` 42, `pointer-events: none`
with the buttons re-enabling it), populated per screen from `SCREEN_UI`. It lives *inside*
`#screenLayer`, so its percentages are frame percentages and it disappears with the screen.

This is deliberately **not** the `SCREEN_PROPS` treatment: the wireframe places these against the frame's
top-left corner and against the rail (its rail column starts at 80.3%, the build's at 79%), not against
anything in the scene art, so they should not follow the plate's `object-fit: cover` crop.

Recipe book uses `assets/ui/icon_recipe.png` and opens the existing Composition Book (`openBook`), the
same window the forge's own RECIPE BOOK button opens. Ledger is inert — no ledger window exists yet — and
carries a glyph placeholder, since there is no `icon_ledger` asset. Both wear the carved-wood treatment
of `#recipeBtn` / `#railBtns` so they read as one family. Racks still open the Racks window (all three
verified after this layer went in).

### r49b/r49c — a class-name collision, and a wrong diagnosis on the way

The icon and caption came out **stacked**, with the caption hanging 15px below the button. Cause:
**`.cap` is already taken** — the bench stations' caption class, `position: absolute; left: 50%;
transform: translateX(-50%); bottom: -17px`. `.sc-btn .cap` only set font-size and line-height, so the
existing rule's `position: absolute` won and the caption left the flex flow entirely.
(`#frame.clean .cap { display: none !important }` would have hidden it in clean mode too.) Renamed to
`.sc-cap` / `.sc-gl`.

r49b had blamed something else first — that `display: flex` on a `<button>` never reaches its children
because the UA wraps them in an anonymous content box — and added an inner wrapper that changed nothing.
A controlled probe in the live page settled it: a `<button>` with `display: flex` puts its children side
by side, with or without a wrapper. The wrapper is gone again and the flex row is back on the button.

**The lesson worth keeping:** when a computed `display: flex` demonstrably is not flexing, read the
computed style of the *children*, not the container. `position: absolute` on one child from an unrelated
rule looks exactly like a broken flex container. And in a single-file build with ~200 short class names,
check a new class name against the file before using it.

## r50 — the Ledger window

The shop screen's LEDGER button opens it. `ledger_book_base.png` is the base, the left page lists the
day's sold swords with their gold, the right page carries the wireframe's placeholder text, and there is
a Close button.

### The asset shares the Composition Book's canvas

`ledger_book_base.png` has **exactly** the same opaque fractions as `Composition_book_base.png` —
ox .0339, oy .0778, ow .7271, oh .8500 of a 1920x1080 sheet, art 1396x918 = 1.5207 — so it is built with
the r41 construction verbatim: `.lb-book` *is* the drawn page area, and the base PNG is scaled to
`1/ow = 137.53%` and pushed out by `-ox/ow = -4.66%` and `-oy/oh = -9.15%` so its opaque region lands on
that box. Measured back: the art's opaque region hits the page box to within **0.03px** on all four edges.

The spine needs no element — it is part of the art. The wireframe's spine sits at 48.6% of its panel
width and the asset's at 48.7%, which is how we know the wireframe was drawn over this exact sheet.

### Geometry

Measured off `Ledger_wireframe.png` (1239x676) by exact-colour components, converted against the drawn
panel (x 67-989 = 923 wide, y 38-637 = 600 tall):

| element | wireframe px | % of the page box | measured back |
|---|---|---|---|
| Day bar | x 124-473, y 52-124 | 6.18 / 2.33 / 37.92 / 12.17 | **0.00pp** |
| Swords sold | x 124-473, y 136-596 | 6.18 / 16.33 / 37.92 / 76.83 | **0.00pp** |
| sold rows | x 143-454, y 178/251/323 | 8.23 / 23.33 / 33.80 / 10.50, pitch 12.08 | **0.00pp** x3 |
| row split | sword x 143-382, gold x 383-454 | 76.92% / 23.08%, abutting | 76.92 / 23.08 |
| Details | x 606-899, y 144-529 | 58.40 / 17.67 / 31.85 / 64.33 | **0.00pp** |
| Close | x 54-125, y 613-666 | left -1.41, bottom -4.67 | **0.00pp** (89x41 px) |

The page box is **width**-anchored (74.50% of the frame, left 5.41% — both exactly the wireframe's) so the
art is never stretched. Its height then follows the art's aspect and comes out 84.83% of the frame height
against the wireframe's 88.76%: the wireframe frame is 1239x676 (aspect 1.833) and the build's is
1039x600 (1.732), so the same width-% cannot also be the same height-%. It stays vertically centred —
measured top 7.58% / bottom 7.59% — which is what the wireframe does too (5.62 / 5.77).

Close is `Paper_button_red.png` at its native 213:97. The wireframe draws that slot nearly square
(72x54), so as with the Racks window the button is anchored by its left edge and bottom and takes a
readable width (11.5% of the page box) from the asset.

### Contents

- **Day** reads the live `#dayNum`, so it tracks the end-day counter rather than being a constant.
- **Sold rows** are three placeholder swords, laid flat with the same `rotate(45deg)` technique and the
  same measured per-combo `sx` offsets as the Racks window. `s` is recomputed for this slot's 3.79
  aspect, where every combo is **length**-limited (all their length:thickness ratios exceed 3.79), so
  `s = 0.98/len` throughout — no thickness clipping is possible here.
- **Details** is the wireframe's text verbatim (Amount sold and value / Total sale / Gold spent / Total
  profit) inside a dashed bounding box. Nothing is computed.
- The scrim is a plain `.sf-modal`, so it dims the whole frame including the rail — the same as its
  sibling the Composition Book, and unlike the Racks window, where the owner asked for the rail to stay
  lit. Verified: the rail dims to 0.449x and the shop's own Recipe book button to 0.550x.

### Known gaps

Nothing behind it. `LEDGER_SOLD` is three invented sales, the Details figures are labels rather than
numbers, and the day's sales are not recorded anywhere for it to read.

## r51 — design_desk and sharpening_stone as basement props

The owner repainted `basement_background.png` with both objects removed and supplied them as separate
PNGs, so they can carry the rack's hover sheen and drop shadow instead of being baked into the plate.
Placed to `assets/Anchor-images/Basement_design.png`.

### Located by template matching, not by diffing

The racks (r47) were found by diffing the reference against the bare plate. That does not work here: the
inpainting that removed these two objects left grey/white clouds **bigger than the objects**, plus their
old cast shadows, so a diff mask would have been far larger than either prop.

Instead each prop PNG is matched against the reference by coarse-to-fine RGB template matching,
parameterised by the prop's rendered **art width** in reference pixels: a full search on an 8x pyramid,
refined at 2x and then 1:1, scoring mean |dRGB| over the template's opaque pixels only. Whole run: 6s.

Confirmed by compositing each prop back onto the resampled plate and scoring against the reference
*inside its own box* — the placement has to explain the pixels, not merely look right:

| prop | MAD, plate alone | MAD, with the prop |
|---|---|---|
| design_desk | 25.31 | **8.91** |
| sharpening_stone | 43.49 | **6.88** |

Reference 1327x735, plate 1920x1066 cover-fitted into it at scale 0.69115 (offset 0, -0.88), which
converts the art-space hits straight into the plate-% form `SCREEN_PROPS` stores:

| prop | art box in the reference | plate-% (l / w / b) | measured back in-browser |
|---|---|---|---|
| design_desk | 2,287  320x341.4 | 0.15 / 24.11 / 85.41 | dl 0.003, dw 0.004, db 0.004, stretch 0 |
| sharpening_stone | 437,286  266x307.6 | 32.93 / 20.05 / 80.68 | dl -0.003, dw 0.001, db -0.008, stretch 0.0001 |

### `PROP_OPQ.ar` is the CANVAS aspect, not the art aspect

First pass put `ar: 464/495` for the desk — its *art* aspect — and the prop came out **2.30pp low with a
5% stretch**. `layoutScreenProps()` uses `ar` to derive the **element** height from the element width
(`eH = eW/ar`), and the element is the whole PNG; the `ox/oy/ow/oh` fractions then place the art inside
it. `design_desk.png` is the first prop with a meaningfully non-opaque canvas (23 transparent px down
its right edge, ow .9528), which is why the rack never exposed the ambiguity — its `ar: 241/427` was
already the canvas aspect. Corrected to `487/495`, and the field is now commented.

### Prop actions are generic now

`buildScreenProps` used to hard-code `if(p.act==='rack')`. It now adds the `hot` class (hover brighten +
pointer) to **any** prop with an `act` and looks the handler up in a new `PROP_ACTS` map, so a prop can
have the sheen before it has a window. The basement's two workstations are exactly that case: they hover
and take a title, and clicking them does nothing yet — no design-desk or sharpening window exists.
Verified that a click on them throws nothing and opens nothing, and that all three shop racks still land
to within 0.02pp and still open the Racks window.

### Known gap

The desk sits at plate-% left 0.15, i.e. flush against the plate's left edge, so `object-fit: cover`
crops it. The reference frame is 1327x735 (aspect 1.805) and crops nothing; the build's 1039x600 (1.732)
crops 20.8px each side, so in-game the desk loses about 1.9pp of art width off its left. That is correct
behaviour for an art-anchored prop — it stays glued to its spot on the wall — and the reference already
shows the desk running off the frame edge, but it is more cropped in the build than in the reference.

## r52 — the Design Desk window

Clicking the basement's assembly bench opens it. Full-frame window: a stage with the assembled sword
laid flat across the top, a row of Cancel / Handle / Guard / Pommel / Done, and a scrolling grid of part
tiles below with a slider on the right.

### Geometry

Measured by exact-colour components in `Designdesk_wireframe.png` (1209x675, no rail drawn - hence
full-frame), as % of the frame:

| element | wireframe px | % of frame | measured back |
|---|---|---|---|
| stage | x 0-1209, y 0-398 | 0 / 0 / 100 / 58.96 | **0.00pp** |
| sword box | x 169-1072, y 71-280 | 13.98 / 10.52 / 74.77 / 31.11 | 0.00 / 0.00 / 0.00 / -0.01 |
| button row | y 347-399 | top 51.41 | **0.00pp** |
| Cancel | x -2-151 | left -0.17 | 0.00 (103x47 px) |
| Handle / Guard / Pommel | x 348 / 526 / 697 | 28.78 / 43.51 / 57.65, w 12.74-12.82 | **0.00pp** |
| Done | x 1055-1208 | left 87.26, w 12.74 | 0.00 |
| parts panel | y 399-675 | 0 / 59.11 / 100 / 40.89 | **0.00pp** |
| tiles (of the panel) | 155x135, pitch 165 / 146 | w 12.82, h 48.91, lefts 1.41-83.29, tops 4.35 / 57.25 | **0.00pp** |
| slider | x 1171-1202 | left 96.86, w 2.65 | **0.00pp** |

Cancel is `Paper_button_red.png` and the other four are `Paper_button_wide.png`. The wide asset's 143:51
lands the row at 47px against the wireframe's 46.2 — a 0.9px match, so the buttons take their height
from the asset and keep the drawn lefts. Red is 213:97, so Cancel is narrowed to 9.96% (103px) to sit at
the same height as the rest rather than standing 13px taller than its row.

### Two departures from the greybox

1. The flat grey / white / green are a **greybox, not a colour spec**, so the stage and panel take the
   game's own treatments — a dark forge gradient and `.ore-slot` tan tiles — as every previous round has.
2. The drawn slider starts **29% down the panel** (y 480 of 399-675) with white above it, which reads as
   a mock artefact rather than intent, so the track spans the grid (top 4.35%, height 94.20%). Its **x is
   exactly as drawn**.

### The art is measured at runtime, not tabulated

Two canvas passes, both cached, both with fallbacks if `getImageData` throws (it does over `file://` —
tainted canvas):

- `partBox(src)` finds a part PNG's opaque box on a 64px canvas, so each tile **crops to the part**
  instead of showing a mostly-empty 512 canvas. The part sits in a square holder inside the (non-square)
  tile, so the % offsets that centre its opaque box mean the same length in both axes.
- `comboFit(list, ratio)` unions the four selected parts on a 96px canvas and takes the **+45 degree
  rotated extent**, then sizes with `min(0.98/len, 0.90/ratio/th)` — the same maths as the Racks window's
  per-row sizing, but for a combo that changes while the window is open. Picking `guard4` moved the
  preview from 86.3% to 89.3% of its box on its own.

A table would have gone stale the moment a part was added; this way new part files just work.

### Behaviour

Tabs swap the grid (9 grips / 11 guards / 9 pommels — `sparkle.png` is excluded, it is a quality
overlay, not a pommel). Clicking a tile selects it and re-renders the preview. **Cancel** restores the
selection as it was on open, **Done** keeps it — verified: pick `flame_grip2`, Cancel -> `grip1`;
pick again, Done -> `flame_grip2`. Wheel, thumb drag and the clamp all work (at max scroll the last
tile's bottom is flush with the panel, 0.0px).

### Bug caught in verification

`.dd-swordbox` was first given the wireframe's `top: 10.52%` / `height: 31.11%` verbatim, but those
percentages resolve against `#ddStage` (58.96% of the frame tall), not the frame — the box came out
**4.32pp high and 12.77pp short**, and `comboFit` then honestly sized the sword to fill a box that was
the wrong shape (50.9% instead of 86.3%). Re-based to 10.52/58.96 and 31.11/58.96. Worth remembering
whenever a wireframe number is measured against the frame but applied inside a nested panel.

### Known gaps

- The blade is a fixed `balanced_longsword_blade` placeholder; nothing connects the window to the blade
  the player actually forged, and `DD_SEL` is not read by anything outside this window.
- The stage's lower half is empty, exactly as the wireframe leaves it — that is where desk art or a
  stats readout would go.

## r53 — the Sharpening window

Clicking the basement's grindstone opens it. Full-frame window: a sharpness meter with a green target
band across the top, the stone left of centre, and a sword you drag across it by the handle.

### Geometry

Measured by exact-colour components in `Sharpening_wireframe.png` (1177x657):

| element | wireframe px | target | measured back |
|---|---|---|---|
| meter | x 258-919, y 21-51 | 21.92 / 3.20 / 56.16 / 4.57 (% of frame) | **0.00pp** |
| green zone | x 786-852 of the track x 262-916 | **80.00% - 90.10% of the track** | 80.00 - 90.10 |
| marker | x 705-734, y 34-63 | apex at 69.80% of the track | 69.80 |
| stone | x 185-479, y 135-545 | left 15.72, w 25.06, centred on y 51.75 | dl 0.00, dw 0.00, cy 51.75, stretch 0 |
| sword at rest | x 148-1028, y 199-377 | centre 49.96 / 43.84, length 74.85% of the frame | 49.96 / 43.83, len 74.85 |
| Cancel | x 31-181, y 576-628 | left 2.63, top 87.67 | 0.00 / 0.00 (104x47) |
| Done | x 989-1139, y 576-628 | left 84.03, top 87.67, w 12.83 | **0.00pp** (133x48) |

The green band is the spec for the "correct sharpness percentage range": **80-90%**, read straight off
the wireframe rather than chosen.

The two grey boxes become the real `sharpening_stone.png`, as every greybox this far has become the
matching asset. Its 384:444 does not match the drawn 295x411, so it is **width**-anchored to the drawn
295 and centred on the drawn shape's vertical centre; `translateY(-50%)` keeps that true at any frame
aspect, so the art is never stretched (measured 0.0000). Note the two boxes each appear as two
components in the segmentation — the sword lies across them, splitting the wide rect (x 185-479) into
y 180-198 + y 379-545 and the pale upright rect (x 289-375) into y 135-198 + y 379-446.

Done is `Paper_button_wide`, whose 143:51 matches the drawn 151x53 to within a pixel. Cancel is
`Paper_button_red` narrowed to 10.03% so it stands at the same height as Done instead of 13px taller.

### The sword's box hugs the sword

Everything else in the build that lays a sword flat rotates a square element 45 degrees and clips it.
That will not do here, because the sword has to be **grabbable**: a rotated square's bounding box is
mostly empty, so a pointerdown in the corner would count as grabbing the blade.

So `#shSword` is a **non-rotated wrapper** sized to the flat sword (`len x th` of the measured extent)
with only the inner `.sh-art` rotated, offset so the art's own centre lands on the wrapper's centre.
Pointer hits then land on the sword.

The numbers come from `comboExtent()`, factored out of r52's `comboFit()` in this round: one canvas pass
that unions the four part PNGs and takes the **+45 degree rotated extent**, returning `len`, `th`, `cx`,
`cy` in units of the element side. Four windows now share it (r48 racks, r50 ledger, r52 design desk,
r53 sharpening), and `comboFit` is a thin wrapper over it.

### Grabbing by the handle

The handle sits 4% in from the flat sword's left end, on its centre line, so its offset from the
wrapper's centre is `(-0.46 * len * W, 0)`. `pointerdown` **anywhere** on the sword sets the wrapper's
position so that point lands under the cursor — which is what the owner asked for. Verified by grabbing
30px from the tip: the handle moved under the cursor to **0.0px in both axes**.

Sharpness rises only while the middle of the blade is over the stone and the pointer is moving:
60px of travel on the stone gave **+3.3**, the same travel off it gave **+0.00**, and the marker tracks
the value. Cancel restores the value as it was on open, Done keeps it (50 -> 50 and 52.75 -> 52.75).

### r53b — two things hardening the drag

- **`setPointerCapture` threw** on a pointerId with no active pointer, and because it ran before
  `shPlace()` the whole grab aborted. Now wrapped in try/catch: verified that an unknown pointerId
  throws nothing and the handle still snaps.
- **One event's travel is capped at 40px.** A pointer that jumps — leaving the window and re-entering,
  or a synthetic teleport — banked a whole screen's width of sharpening in a single move (0 to 100 in
  one event during testing). Verified: a 900px jump onto the stone now grants exactly 40 x 0.055 = 2.2.

### Known gaps

- The **contact test is the stone's whole bounding box**, not its wheel. The wireframe's pale upright
  rect is the surface the author drew, but it does not map cleanly onto the asset's wheel (it sticks
  above where the art box starts), and segmenting the wheel out of the art by colour caught wood
  highlights and sparks too. Worth revisiting when the mechanic is designed.
- `SH_GAIN` (0.055 per px) and the resting value (69.8, the wireframe's marker) are unplaytested, and
  nothing outside the window reads `SH_VAL`. Over-sharpening past 90% has no consequence yet.
- The blade is the same fixed `DD_BLADE` placeholder as the design desk, and the window shows whatever
  parts the design desk last selected.

## r54 — the real grindstone, a flipped sword, and sparks

Owner's revision of r53: use `assets/forge/grindstone.png` + `grindstone_spin.png` instead of
`sharpening_stone.png`, base plus motion frame on top with a slight jitter; turn the sword round so the
handle is on the right; throw sparks while sharpening.

### Registering the two frames

The pair shares ONE 1701x1536 canvas (CLAUDE.md), but their opaque boxes are **different** — base
ox .3004 oy .1790 ow .5091 oh .7259 (art 866x1115), spin ox .4239 oy .1497 ow .1458 oh .5007 (art
248x769, just the wheel). So they must be stacked at the **same canvas-sized box** (`inset: 0` inside one
container), never at their own art boxes, or the motion frame lands off the wheel. Measured back: the two
`<img>` boxes agree to **0.0px on all four edges**.

The container is then placed so the BASE's art lands on the wireframe's grey shape:

    W    = artW / ow      = 25.06% / .5091 = 49.23% of the frame
    left = artLeft - ox*W = 15.72 - .3004 x 49.23 = 0.93%
    the art's vertical centre is (oy + oh/2) = 54.195% down the container, so top: 51.75% with
    translateY(-54.195%) holds it on the drawn shape's centre at any frame aspect

Measured back: base art **dl 0.00, dw 0.00, centre y 0.00** against r53's targets. `shStoneRect()` now
derives the contact box from those opaque fractions, so the blade is tested against the *stone*, not
against the much larger sheet.

Idle jitter is `shJit` (.42s, ~0.1% translate); while the blade is cutting, `#sfSharpModal.grinding`
swaps in `shJitOn` (.07s, steps(3), ~0.28%). The class is held 150ms past the last move so the wheel does
not strobe on and off, and is cleared on release and on close.

### Flipping the sword

`rotate(225deg)` instead of `45deg` — a 180 degree turn rather than a mirror, so no bevel or highlight
is flipped. Since R(225) = -R(45), `comboExtent`'s `len` and `th` are unchanged while `cx`/`cy` negate:
the art-centring offsets change sign, the handle moves from -0.46*len to **+0.46*len** (the right-hand
end) and the blade middle from +0.65 to **-0.65** of the length off the handle.

Verified: handle at 84.4% of the frame against the tip at 15.5%, and grabbing 25px from the *tip* still
snaps the handle under the cursor to **0.0px in both axes**.

### Sparks

Reuse `.hm-spark` and `@keyframes hmSpark` from the hammering scene rather than a second spark
implementation; only `#shFx` (a positioned layer) is new. 2-4 sparks per burst at the blade/stone
contact point, throttled to one burst per 45ms while cutting, self-removing after 900ms and cleared
wholesale on close. Verified a spark's centre lands **inside** `shStoneRect()`, and a driven drag moved
the meter 69.8 -> 73.3 with sparks on screen.

### Two harness notes

- **Top-level `let`/`const` are not properties of the window.** A probe page reading
  `iframe.contentWindow.SH_GEO` got `null` and the whole driven drag silently did nothing — twice —
  because `SH_GEO` is a `let`. Function declarations *are* window properties, which is why
  `w.shStoneRect()` worked and masked the problem. Drive the page with `contentWindow.eval(...)`, which
  runs in the page's own scope. (The Browser pane's `javascript_tool` never hit this: it already
  evaluates inside the page.)
- **The file has mixed line endings.** r53b was applied with a `node -e` one-liner whose replacement
  text carried bare LFs, so a handful of lines in an otherwise CRLF file end in LF alone, and r54's
  multi-line anchors failed against them. The patch helper now tries the CRLF form of an anchor, then
  the raw LF form, and always inserts CRLF so the file converges back.

### Still open

The contact test is the stone's whole art box rather than its wheel, `SH_GAIN` is unplaytested, and
over-sharpening past the 80-90% band has no consequence yet — all unchanged from r53.

## r55 — the customer counter screen

Built to `Customer_screen_wireframe.png` on the owner's new `customer_counter_background.png`
(2754x1536, aspect 1.7930 against the wireframe's 1.7924), so the cover fit into the wireframe crops
essentially nothing (art 1269.4x708.0, offset -0.2, 0) and wireframe pixels convert straight to plate
percentages.

### Art-anchored: customer, counter, stand, sword

`SCREEN_PROPS.customer`, all measured back in-browser to within **0.015pp** with zero stretch:

| prop | drawn | plate-% (l / w / b) |
|---|---|---|
| customer (`man1.png`) | x 80-388, y 150-584 | 7.97 / 20.99 / 86.16 |
| counter (`counter.png`) | x 1-1021, y 589-704 | 0 / 100 / 110.70 |
| stand (`stand.png`) | not in the wireframe | 33.20 / 14.18 / 98.87 |
| sword (built, not a PNG) | x 220-803, y 606-675 | 17.35 / 46.00 / 95.34, h 9.89 |

**The customer sits behind the counter**, which the owner asked for explicitly. DOM order is paint order,
so listing the customer first in the table puts the counter over it — no z-index needed. It is
height-anchored to the drawn 435 and centred on the drawn box, then pushed down to `b 86.16` so its base
actually disappears behind the counter's top surface rather than stopping 5px short of it.

**`counter.png` cannot be both full-width and as short as drawn.** Its art is 2235x343 (aspect 6.52)
while the drawn box is 8.8:1. Spanning the full plate width and letting the lower front face run off the
bottom (`b 110.70`, i.e. below the plate) keeps its **top edge on the drawn y 589** and guarantees no gap
at either frame edge when `object-fit: cover` crops the sides — verified: it overhangs **18.4px past each
frame edge** at 1039x600. Stopping it at the drawn x 1021 would have left a 1.6pp gap on the left.

The stand is not in the wireframe. It is centred under the sword and sized so the blade lands on its
cradle: measured, the sword's centre line sits **33.6% down the stand**, which is where the carved arms are.

### A prop can now be a box, not just a PNG

The display sword is assembled from four part images, so `SCREEN_PROPS` gained a `kind:'sword'` entry
whose `l/w/b/h` describe the **box itself** (no opaque-box maths), and `layoutScreenProps` grew a branch
for it. It stays art-anchored like every other prop, which is what keeps the sword on the counter as the
frame resizes.

### Frame-anchored: the dialogue cluster

A screen's panel cluster lives in the page as `#csPanel` and is shown by an `sc-<name>` class that
`goScreen()` now puts on `#screenLayer` — verified `display: block` on customer and `none` on all five
other screens. Every element landed **0.00pp** on its target:

| element | drawn | % of frame | asset |
|---|---|---|---|
| recipe book | x 10-113, y 6-65 | 0.79 / 0.85 / 8.20 / 8.47 | `icon_recipe.png` (opens the Composition Book) |
| dialogues | x 402-972, y 45-279 | left 31.68, top 6.36, w 44.92 | **`Dialogue_box.png`** (1074x425) |
| response | x 402-972, y 279-401 | left 31.68, top 39.41, w 44.92 | `Paper_button_wider` - its 453/97 = 4.67 *is* the drawn 570/122 = 4.67 |
| sell | x 759-871, y 399-449 | left 59.81, w 8.90, bottom 36.58 | `Paper_button_wide` |
| deny | x 868-972, y 399-449 | left 68.40, w 8.27, bottom 36.58 | `Paper_button_red` (2.196 vs the drawn 2.10) |

### r55b/r55c — two things verification caught

- **The dialogue text was invisible.** I gave it the parchment-on-dark colour (`#f0e0bb`) used elsewhere,
  but `Dialogue_box.png` is *pale* parchment. Darkened to `#4a3623`.
- **The display sword filled 47% of its box.** `comboFit()` fits both axes, and the drawn box is 8.34:1
  while a sword laid flat is ~4.4:1, so the box's *height* was binding and the blade came out 234px long
  in a 495px box. For a sword resting in a stand the **length** is what should match the drawing and its
  guard reaching past a notional box is correct, so that box now sizes by length alone
  (`s = 0.98/len`) and no longer clips. Measured: **98% of the drawn box width**.

### Not built

- The two **waiting benches** in the wireframe — there is no asset for them.
- The rail column and the Left/Right arrows, which the build already has.
- SELL renders 92x33 and DENY 86x39: the two paper assets have different aspects, so at the drawn widths
  their heights differ by 6px. They are bottom-aligned on the row. Matching them exactly would mean
  giving DENY the non-red asset, which loses the wireframe's colour coding.
- Nothing behind any of it: the dialogue line is invented, Response is a label, and SELL/DENY are inert.

## r56 — the Diary

The rail's DIARY button opens it (it was inert until now). `Diary_base.png` is the base, the first page
lists characters the player has met, and four bookmark tabs run down the outside edge.

### The third book on the same sheet

`Diary_base.png` has the same canvas fractions as `Composition_book_base.png` and `ledger_book_base.png`
— ox .0339, oy .0778, ow .7271, oh .8500 of a 1920x1080 sheet, art 1396x918 — so it uses the r41/r50
construction verbatim. Measured back: the art's opaque region hits the page box to within **0.03px** on
all four edges. The spine is part of the art; the wireframe's hand-drawn spine sits at 49.9% of its
panel against the asset's 48.7%.

### Geometry

Measured by exact-colour components in `Diary_wireframe.png` (1330x742), converted against the drawn
page panel (x 47-980 = 934 wide, y 47-689 = 643 tall). Everything landed **0.00pp**:

| element | drawn | % of the page box |
|---|---|---|
| character slots | 178x170 | w 19.06, h 26.44 |
| slot columns | x 85 / 297 / 543 / 755 | 4.07 / 26.77 / 53.10 / 75.80 |
| slot rows | y 161 / 372 | 17.73 / 50.54 |
| title | centred x 280, y 76 | 24.95 / 4.51 |
| tabs | x 997-1045, tops y 16 / 57 / 98 / 138 | left 101.71, w 5.25, tops -4.82 / 1.56 / 7.93 / 14.15 |
| close | x 28-106, y 653-711 | left -2.03, bottom -3.42 (91x42 px) |

Seven slots, four across the top and three below, exactly as drawn — two per page on the top row and
the seventh alone on the lower left page.

### Turning a portrait bookmark into a side tab

`bookmark_paper.png` is **portrait** (91x124) and these tabs are landscape, so each tab is a landscape
wrapper (`aspect-ratio: 124/91`) holding the image rotated 90 degrees — the same trick
`.cb-marks-side` uses in the Composition Book.

Rotating a w x h box by 90 degrees swaps its visual extents, so for the image to end up exactly filling
the wrapper it must be sized **73.39% of the wrapper's WIDTH** with `aspect-ratio: 91/124`: that makes
it 0.7339W wide and 1.0W tall before the turn, hence W wide and 0.7339W = H tall after it. Verified: the
rotated image fills its tab to **0.0px in both axes** on all four tabs.

### Behaviour

Tab 1 holds the Characters page and is active on open; tabs 2-4 show an empty page, as the owner asked.
Verified by hit-tested clicks: the rail's DIARY button opens the window, each tab switches both the
active marker and the visible sheet, and Close closes it.

### Note on the names

The wireframe's two filled slots read "Bran" and "Garric", neither of which exists in the build. They
are placeholders for "a character you have met", so the two filled slots use the game's own first two
story customers instead — **Bram** and **June** (`assets/customer/`). Say the word if the wireframe's
names are meant literally.

### Known gaps

Nothing behind it: `DIARY_SLOTS` is a fixed list, no slot unlocks as the player meets someone, clicking
a character does nothing, and pages 2-4 have no content planned yet.

## r57 — the Quests window

The rail's QUEST button opens it (it was inert until now). Title, five quests with their gold reward,
a page slider with left/right controls, and a close button.

### The base asset, and why the parchment is the content area

The owner named no base, so this uses **`Chart_background.png`** — a framed parchment board that had
been sitting unused in `assets/ui`. Its outer aspect (0.755) is within 1.2% of the wireframe's plain
white panel (461x618 = 0.746), which is what pointed at it.

Its **parchment interior**, though, is 0.851 — measured by scanning outward from the board's centre
until the stone frame goes dark: x 9.55%-90.65%, y 13.45%-84.75% of the 979x1309 canvas, which as
fractions of the asset's opaque box is **left 8.866%, top 12.926%, w 82.36%, h 73.06%**.

So the wireframe's white rectangle is read as the **content area** (the parchment), not the whole board:
the content keeps the drawn proportions and the frame is added around it. Everything the wireframe draws
is then a % of `.qs-page`, and the board's `margin-right` is derived so the **content's** centre lands
on the drawn 38.98% of the frame — measured back at exactly **38.98%**.

### Geometry

Measured by exact-colour components in `Quests_wireframe.png` (1275x708), as % of the drawn panel
(x 267-727 = 461 wide, y 44-661 = 618 tall). All ten boxes landed **0.00pp**:

| element | drawn | % of the page box |
|---|---|---|
| quest box | x 290-545, tops y 123/206/289/373/456 | 4.99 / 12.78 / 55.53 / 12.30, pitch 13.47 |
| reward box | x 556-703 | left 62.69, w 32.10 |
| title | centred x 497, y 70 | 49.89 / 4.21 |
| pager chips | centres x 330 / 351.5 / 391.5 / 438.5 / 497 / 555.5 / 602.5 / 643 / 664 | widths 3.69-10.20, heights 2.75-9.22, row centre 92.56 |
| left / right | x 256-302 / 693-738 | left -2.39 w 10.20 / left 92.41 w 9.98 |

The "slider" is the wireframe's nine-chip carousel: the **current page is the big centre chip** and
pages shrink outward, numbered on the centre and its two neighbours, a middot at plus/minus two, and
blank chips beyond.

### The quests

The five one-off goals lifted from the older builds (`const quests` in `index.html` and
`swordforgeV2.html`), with their real goals and the same `QUEST_REWARD` of 20g:

| quest | goal |
|---|---|
| Craft 5 Epic swords | 5 |
| Survive a day without turning any customer away | 1 |
| Discover 3 new traits | 3 |
| Update 3 recorded compositions | 3 |
| Open the shop front | 1 |

(The wireframe's uniform "progress 0/5" was filler; each row shows its own goal.)

### r58 — Quest_base.png replaces Chart_background

The owner supplied a base for this window after the fact: `Quest_base.png`, a plain parchment sheet
(645x934, art filling the canvas at ox 0, oy .0011, ow .9984, oh .9989).

That removes the whole complication r57 worked around. `Chart_background` is a FRAMED board whose
parchment interior is inset 9% at the sides and 13%/15% top and bottom, so the wireframe's white panel
had to be mapped onto that interior with the frame added around it. The new sheet **is** the content
area, so the drawn panel maps straight onto it: `.qs-board` is the drawn panel (left 20.94%, width
36.16% of the frame) and `.qs-page` is simply `inset: 0`.

Measured back: board **dl 0.00 / dw 0.00**, 376x544 px with 28px clear top and bottom, the sheet's art
on the board box to within **0.01px**, and all ten quest/reward boxes still **0.00pp**.

Two consequences worth noting:

- The sheet's aspect is 0.6902 against the drawn panel's 0.7460, so width-anchoring makes the page 8%
  taller than drawn. Children are fractions of the drawn panel, so their relative layout is unchanged -
  the rows just get slightly more vertical room.
- Close returns to the wireframe's own spot off the panel's bottom-left, but at **-3.5%** rather than
  the drawn -6.63%: the drawn overhang is 36px and the sheet leaves only 28px before the frame's edge,
  so the full drop would clip it.

### r57b — three things the first render got wrong

- **The board was taller than the frame.** Sizing it so the parchment kept the drawn content width made
  it 43.9% of the frame wide = **604px tall in a 600px frame**, clipping its top and pushing anything
  anchored below it off-screen. Narrowed to 40.10% — 417x552 with 24px clear top and bottom.
- **Close used the page's percentages but is a child of the board**, so -5.21% / -6.63% resolved against
  the board and put it off the bottom of the frame. Re-anchored to the board's own bottom-left corner,
  which is where the wireframe hangs it relative to its white panel.
- **LEFT / RIGHT were `Paper_button_wide` at the drawn 38px width**, which its 2.8:1 aspect turns into
  a 13px-tall strip with the words spilling out. They are the pager's own controls, so they now wear the
  pager chip's look at exactly the drawn box, with arrow glyphs instead of the words.

### Verified

Hit-tested: the rail's QUEST button opens it, the right arrow walks 1 to 2 to 3 and **clamps** (its
button disables at the last page, the left one at the first), the centre chip tracks the page, page 1
holds the five quests and 2-3 read "No quests on this page yet.", and Close closes it. `resetRun`
clears it. The Diary still opens.

### Known gaps

Three pages exist only so the pager is demonstrably live — page 1 is the real content and 2-3 are
empty. Nothing advances a quest (`progress` is fixed at 0 and there is no `bumpQuest` wired into the
loop yet), and completing one pays nothing.

## r59 — the Diary's character page

Clicking a named character on the Diary's tab 1 opens it, from `Diary_character_page.png`.

### Not a fifth tab

The owner was explicit that this is not one of the four tabs, so it is **another sheet in the same
book**, shown with every tab deselected. That keeps the four tabs visible exactly as the wireframe draws
them, and clicking any of them goes back to that page. `dyTab()` and the new `dyChar()` both route
through one `dyShow(id)` helper, so only ever one sheet is on. Close is the Diary's own button.

### Geometry

The wireframe (1386x767) draws the same book in the same place as `Diary_wireframe` — its page panel is
x 51-1024 (974) y 50-720 (671), **70.27%** of the frame wide against the Diary's 70.23% — so `.dy-book`
is reused untouched. Children as % of that panel; all nine boxes measured back at **0.00pp**:

| element | drawn | % of the page box |
|---|---|---|
| character image | x 94-332, y 136-433 | 4.41 / 12.82 / 24.54 / 44.41 |
| last visited | x 362-506, y 241-330 | 31.93 / 28.47 / 14.89 / 13.41 |
| swords requested | x 94-506, y 461-550 | 4.41 / 61.25 / 42.40 / 13.41 |
| relationship | x 94-506, y 569-658 | 4.41 / 77.35 / 42.40 / 13.41 |
| gift | x 583-743, y 136-286 | 54.62 / 12.82 / 16.53 / 22.50 |
| reward text | x 804-964, y 136-286 | 77.31 / 12.82 / 16.53 / 22.50 |
| three "?" boxes | x 583 / 804 y 331-481, x 686 y 525-675 | 54.62 & 77.31 / 41.88, 65.20 / 70.79 |

### Crop-fitting the portrait

The customer portraits are **1504x2832 canvases with the figure in a sub-region** (Bram ow .5785
oh .5102, June .5625/.4650), so `object-fit: contain` would have sized the empty canvas rather than the
person and left them tiny and off-centre. `dycPortrait()` instead scales the whole canvas so the
**opaque box** fills the frame box and offsets it so that box's centre lands on the box's centre:

    wc = min(0.92/ow, 0.96 * boxH/boxW * canvasAR / oh)     canvas width, in box widths
    left = 50% - (ox + ow/2) * wc
    top  = 50% - (oy + oh/2) * (wc/canvasAR) / (boxH/boxW)

with `overflow: hidden` clipping the surrounding empty canvas. Everything is a percentage of the box,
so it survives a resize. The opaque box comes from `partBox()` — r52's runtime canvas measurement — so
a portrait added later needs no table entry. Measured: Bram renders at 117.66% canvas width, filling
96% of the box height.

### Verified

Hit-tested: Bram and June each open their own page with their own portrait and reward line; an unknown
"?" slot does nothing; clicking tab 1 or tab 3 from a character page returns to that page with the tab
selected; Close closes the Diary.

### r59b — a class that never existed

The gift emoji rendered at 11px. The rule was written `.dyc-box.gift` but the element carries
`dyc-gift`, not `gift`, so it never matched and the base `.dyc-box` font-size won. Folded the size into
the `.dyc-gift` rule. Worth remembering: in this file the positional class and the modifier class are
often near-homographs, and a mis-typed compound selector fails silently.

### Known gaps

Last visited, Swords requested, the gift and the three "?" boxes are placeholders; Relationship is a
fixed 3-of-5. Only the two named slots open a page, and nothing writes to any of these fields yet.

## r60 — the inventory works

The rail's four tabs switch, crafted swords land in SWORDS, and an ingot taken out of the smelter can be
dropped back into the rail and picked up again later. This is the first change that makes anything the
player does **persist** past the run that made it.

### An ingot is three globals, not one object

This is the fact the whole feature turns on:

| global | holds |
|---|---|
| `melt` | `{heat, hp, stage, traits:[{t,tier}]}` — what the metal is |
| `segs` | `[{ore,d,len,origin,tPct}]` — the ores used, in order, with each one's grind level. This *is* the route they trace on the map |
| `sword` | `{seg,frac}` — how far along that route the blade has got |

So a stash is a snapshot of those three and a restore puts them back. Trait objects go in **by id**
(`TRAIT_BY` re-resolves them on the way out) so the record is plain data, and the transient
`reachedTrait`/`alignDist` are dropped because the tick recomputes them from the restored position on
the next frame.

Verified round-trip: two ores `[iron, copper]`, one `durable:Epic` trait, position `{seg:1, frac:0.4}`,
100 HP, stage `onAnvil` — all identical coming out, with the trait re-resolved to a live object.

### The owner's three calls

- **Unlimited storage, but retrieval is refused while the bench is busy** rather than swapping. Verified:
  with a second ingot in progress, pulling a stored one out leaves both where they were and shows a hint.
- **A stored ingot cools gradually** at `STASH_COOL = 3.5` heat/sec of real time, so a quick swap keeps
  most of its heat and a long one means a trip back to the furnace. Everything else survives untouched.
  Verified: 80 heat, 6 s in the rack, came out at exactly 59.0. The slot's orb is drawn hot or cold to
  match, so the state is readable at a glance.
- **Ore counts stay decorative.** Nothing is spent yet.

### The rest

- `benchClear()` is new: it resets melt/segs/sword/orb/route/marker **without** touching the modals or
  the inventory, which is what `resetRun` does and why it could not be reused.
- Dropping the orb anywhere over the rail stores it; the shelf shows a dashed drop target while an ingot
  is over it, and the tab switches to INGOTS on release.
- A finished blade pushes `{shape, blade, design:{...DD_SEL}, traits:[{tid,tier}]}` and the rail switches
  to SWORDS so you see it land. The default design is whatever the Design Desk currently has selected;
  the slot composites the four part images and stands them up with `rotate(-45deg)`, the Composition
  Book's trick, which fills a squarish slot far better than laying the sword flat.
- The shelf's rows now clamp at 44px and scroll past that, so a tab can hold more than twelve. Verified:
  40 swords give 42 cells and a scrolling shelf (681px of content in 370px).
- The Racks window's borrowing of the SWORDS tab now routes through `invTab`, so the shelf follows the
  tab instead of only the highlight moving.

### r60b — another selector swallowing a new element

The trait badge did not render. `.ore-slot span:not(.ore-count) { display: none }` — the rule that hides
ore *name* labels in the rail — was hiding it too, silently. Exempted `.inv-tag`.

That is the second time this round-family that an existing broad rule ate a new element (r59's
`.dyc-box.gift` was the other). **When adding a child to an existing container in this file, grep the
container's descendant selectors first** — several of them are `display: none` catch-alls.

### Known gaps

Clicking a sword in the inventory does nothing yet, and nothing consumes the list — no selling, no
value, no gold. ITEMS & DECOR is deliberately empty. The stash has no cap.

## r61 — the workstation table

Drag a sword out of the inventory onto the basement's bottom table, and the Design Desk and Sharpening
windows work on **that** sword. The first thing in the build where a station operates on a real object
rather than a placeholder.

### Placement

From `Basement_workstation_wireframe.png` (1240x691). The plate is 1920x1066, so its cover fit into the
wireframe crops 2.25px each side (art 1244.5x691):

| element | drawn | plate-% |
|---|---|---|
| table | x 328-685, y 552-691 (clipped) | l 26.54, w 28.77, t 79.88, h 20.12 |
| sword | x 271-738, y 589-637 | l 21.96, w 37.60, b 92.19, h 7.09 |

The sword box is wider than the table, exactly as drawn — the blade overhangs.

**The drop zone is the sword's footprint, not the wireframe's table box.** The wireframe's box covers
only the left ~80% of the plank as it is actually painted, and the plank's left/right edges cannot be
segmented out of the art (the floor around it is mid-tone, not dark — luminance walks and hue masks both
fragment on the grain). So the zone takes the sword's horizontal extent, which is the one span provably
on the table: "drop where the sword will land". The wireframe's table **top** is confirmed independently
— the plank's top edge measures 80.50% off a render against the drawn 79.88%, 0.6pp apart.

### The owner's three calls

- **A second sword swaps**: the new one lands and the old goes back to the inventory, carrying its edits.
  Verified: after a swap the displaced Longsword still had its edited `guard4` and 44.5 sharpness.
- **An empty table refuses both stations** with a hint. Verified: neither modal opens and the toast reads
  "Put a sword on the workstation table first".
- **Both windows really change the sword.** Design Desk's Done writes `design` onto it, Sharpening's Done
  writes `sharp`, Cancel reverts either. Verified all four paths, including that Sharpening then renders
  the guard the Design Desk had just saved.

### Pieces

- `WORK` is the sword on the table. It is *out* of `INV.swords` while there, so it cannot be in two
  places; clicking it on the table sends it back.
- The table's sword is a `kind:'sword'` prop, appended to the basement's list when `WORK` is set — the
  same art-anchored box the customer counter uses, so it stays glued to the plank at any frame size. The
  prop entry gained an optional `parts` array so it can render a specific sword rather than the globals.
- `plateBox()` factors out the cover maths `layoutScreenProps` was doing inline, so the drop zone can be
  resolved in screen coordinates.
- **`#sfToast`** is new. `hint()` has been a no-op since r34 and `#forgeResult` is z-index 30, below the
  screen layer, so a refusal on the basement screen had no surface at all. The toast sits at z-index 60 —
  above the screens (40-44), below the modals (1000).
- Forged swords now carry `sharp: 0`, and the inventory tooltip shows sharpness once it is above zero.
- Dragging a sword while not on the basement screen is refused with a hint rather than silently failing.

### Known gaps

The Polish desk in the wireframe has no window yet. Sharpening starts a forged blade at 0 and
`SH_GAIN` is unplaytested, so reaching the 80-90% band is a long drag. Nothing reads `sharp` outside the
sharpening window. The table holds one sword and there is no visual cue that it is a drop target until
you start dragging.

## r62 — the design preview follows the selection, and the sword drags home

### r61 froze the Design Desk preview

r61 pointed `ddRenderSword()` at `swordParts(WORK)`, which reads `WORK.design` — the **committed**
design, only written on Done. So with a sword on the table the preview froze at whatever it had on open
and picking a part changed nothing on screen.

The right split, and the one now in place:

| | source |
|---|---|
| the preview's **parts** | `DD_SEL` — the live working copy, seeded from `WORK.design` on open and written back on Done |
| the preview's **blade** | the workpiece (the desk cannot change a blade) |

Verified across all three tabs: picking a guard, then a grip, then a pommel updated the preview each
time, the blade stayed the workpiece's, Done wrote all three onto the sword (and the sword **on the
table** re-rendered with them), and Cancel left the committed design alone.

Sharpening is deliberately unchanged — it shows the committed sword, which is correct there since it
cannot change parts.

### The table's sword drags back to the inventory

Same gesture as the ingot: pick it up, drag it over the rail, release. The shelf shows its drop
highlight, the sword hides while a ghost follows the cursor, and releasing anywhere else snaps it back
to the table. A tap with no movement still takes it back, so the r61 behaviour is intact.

Verified: drop on the rail returns it with its edits intact; drop in mid-air restores it to the table
with the ghost cleaned up; a tap returns it.

### Harness note — a deferred reset can close a modal

A probe screenshot came back with the Design Desk missing even though its picks had demonstrably
landed. Not a rendering problem: **`finishBlade()` queues its own `resetRun` at +2.6s**, and `resetRun`
clears `.show` from every modal. The probe forged a sword and opened the desk inside that window, so
the reset closed it. The live page with the same call ordering is fine.

It is a real edge case, just an unreachable one in play (you would have to forge, cross to the basement
and open a station in under 2.6 seconds). Worth remembering when scripting: **wait out the 2.6s after
`finishBlade` before opening anything.**

## r63 — the settings gear, the game menu, and a real save

### Layout

`#statPanel` gains a **second row mirroring the first**: the gear takes `flex: 0 0 30%` — the day
tile's exact width — so it sits squarely beneath it, and SKILL TREE becomes `flex: 1 1 auto` beside it.
The skill tree therefore shrinks in **width only** (100% -> ~70%); the row keeps the old button's 50px,
so `#matPanel` still starts at y 116 exactly as before. **Nothing below moves by a pixel** — verified.

(A first pass made the row 44px, which pulled the inventory up 6px. Right by the letter of the request,
wrong by its intent.)

The menu is the r33 paper popup: `Small_paperbox` with six `Paper_button_wide` rows in **two columns of
three**, which fits the asset's landscape 849x533 instead of stretching it. Reading order is the
owner's: Resume / Save, New Game / Load Game, Settings / Quit.

### Save

There was **no persistence in the build at all** — the only three `JSON.stringify` calls were in the
layout self-test. Now: one versioned blob in `localStorage` under `swordforge.save.v1`, one slot,
~2KB for a busy session.

Three things the schema had to handle:

1. **Live object references.** `melt.traits[].t` points into `TRAITS`; `melt.reachedTrait` into a live
   map object. Neither survives JSON. r60 had already solved this for stashed ingots (store trait ids,
   re-resolve through `TRAIT_BY`), so the bench reuses `ingotSnapshot()` verbatim.
2. **`performance.now()` restarts on reload.** A stored ingot's timestamp is a `performance.now()`
   stamp, so after a reload `invCooled()` would run off a clock that no longer exists — the difference
   goes negative and the ingot comes back **hotter than it went in**. Cooling is baked into `heat` at
   save time and the stamp is refreshed on load. Verified: a 70-heat ingot came back at 64, not 70+.
3. **The HUD is hard-coded HTML.** Day, gold, reputation and popularity are literal text in the markup
   with no variables behind them, so they are saved as strings until the economy lands.

**The map is regenerated, not serialised.** `initMap()` turns out to be re-entrant — it resets `seed`,
`traits`, `hazards`, `books`, `revLast`, clears `fogHoles` and re-adds the opening reveal — so load
rebuilds the world and then replays progress onto it: the **fog circles** (cx/cy/r), the `discovered`
flags (re-setting each symbol) and the taken books. Only `<circle>` children are read back, because
`toggleFogCheat` appends a `<rect>` that has no cx/cy.

### Verified across a real page reload

| field | saved | loaded |
|---|---|---|
| screen | basement | basement |
| swords / ingots | 1 / 1 | 1 / 1 |
| workpiece | Shortsword + design | Shortsword + design |
| exp | 60 | 60 |
| fog circles | 8 | 8 |
| discovered traits | 1 | 1, symbol restored |
| books taken | 1 | 1 |
| ingot ores / traits | [tin, zinc] / grace:Fine | identical |
| ingot heat | 70 at stash | 64 (cooled, not inflated) |

The workpiece re-rendered on the table and the Design Desk opened on it.

### Destructive buttons arm before they fire

New Game, and Load when there is unsaved progress, turn red and relabel on the first click and only act
on the second, disarming after 4s or on any other click. No extra modal, no new art.

### Two bugs caught in verification

- **New Game left `exp` behind.** `initMap()` rebuilds the books but does not zero the XP they banked.
- **The armed label printed its HTML entity raw** — set with `textContent`, which does not decode
  `&mdash;`. Switched to `innerHTML`.

### Known gaps

`localStorage` is per-browser and per-origin, and a page opened straight off disk (`file://`) gets an
opaque origin in Chrome, so a save may not persist there; every access is wrapped in try/catch and the
menu says so. One slot only. Settings and Quit are inert. `seed` is saved but `initMap()` hard-codes
it, so it is informational until the map is seeded per-game.

## r64 — selling: gold, reputation and popularity

The counter starts empty; drag a sword from the inventory onto it and SELL pays out. The first change
where the crafting loop produces something the game measures.

### The value model ports cleanly

`index.html` and this build already agreed:

| | old | new |
|---|---|---|
| trait base value | distance from map centre, normalised 0-100 | `traitValue(x,y)` = distance from CENTER, clamped 5-100 |
| quality bonus | `QUALITY_BONUS` Weak 0 / Fine 10 / Epic 20 | same constant, copied verbatim |
| sword value | sum of trait values, 5 if traitless | identical |

A trait's map value is now **stamped onto it when acquired**, so a sword carries its own worth rather
than looking the map up at sale time; `traitMapValue()` remains as a fallback for anything forged
before this change. Verified: an Epic `fire` (map value 50) prices at exactly 50 + 20 = 70.

### Gold and reputation, verbatim from index.html

Price = value, then **rep < 0 -> x0.8**, **rep > 10 -> x1.2**, floored, minimum 1g. Reputation is
**+1 per sale**, unbounded. Verified at rep 11 -> 84, rep -1 -> 56, rep 0 -> 70 on the same 70g sword.

### Popularity is new

The old build has none, so these are the owner's rules:

- a sale adds **0 / 1 / 2** by the sword's best tier (Weak / Fine / Epic);
- the bar runs **0..20** at every level, starting at Lv1 0/20;
- filling it **levels up** and raises the gold value of every sword by **10%**.

The multiplier **compounds** (`1.1^(level-1)`), which is the literal reading of "+10% per level".
`POP_STEP` is the one constant to change if linear is wanted instead. Overflow **carries** into the
next level rather than being lost. Verified: 19 + an Epic sale gives Lv2 with 1 carried, and the same
sword then prices at 77 (70 x 1.1).

Starting values are the old build's: **0 gold, 0 reputation**, popularity Lv1 0/20. The rail's
246 / 72 / 9-of-15 were invented placeholders and are gone — `updateHud()` writes the real numbers at
boot, so nothing in the HUD is hard-coded text any more.

### What SELL does not do

It does **not** check a customer request. There is no customer system yet, so any sword sells — the
owner's call. The refusal lines and DENY costing reputation come with the customer loop. DENY stays a
placeholder; drag the sword back to the rail to take it off the counter.

### The counter is a second drop target

r61 hard-coded the basement. `zoneRect()` / `zonePlace()` now pick the target by screen, and
`wireWorkDrag(el, kind)` takes a kind so the table's and the counter's swords share one drag
implementation. The placeholder sword that used to sit on the counter is gone.

### The Ledger is real

`LEDGER_SOLD`'s three invented rows are replaced by the live `SALES` list — the most recent five,
which is what the panel fits — each with its actual gold, plus "N sold" and "Total sale Ng" in the
Details box. Gold spent and Total profit stay placeholders because nothing spends gold yet. An empty
ledger reads "Nothing sold yet."

### Save

`SAVE_V` is **2**: the blob gained `econ` (gold / rep / popularity / level), `sales` and `counter`, and
the old `hud` string hack shrank to just the day. A v1 save is rejected by the version guard rather
than half-loading. Verified across a page reload: 250 gold, rep 1, Lv2 1/20, five sales totalling 320g
and a Broadsword still on the counter at its level-2 price of 77g.

### Known gaps

Nothing spends gold. Popularity levels raise prices but unlock nothing else. The five-row ledger drops
older sales from view (they stay in `SALES`). No customer, so no request matching, no refusals, and the
dialogue box above the counter is still placeholder text.

## r65 — the recipe book, and ore stock goes live

### A recipe is one trait

`{ tid, tier, ores:[oreId], grinds:[tPct] }`, recorded **automatically** in `tryAcquire` — the only
moment where the trait and the ore route that reached it are both in hand, since `segs` holds the ores
in order with their grind levels. Re-acquiring the same trait at a **better** tier overwrites the
recipe; a worse one is ignored. A new one toasts.

### The eight boxes already matched the description

The r41 book's `cb-slot` boxes are filled in place, no re-measuring:

| box | contents |
|---|---|
| five small, left | the trait's tier as **pips** — the same rule as the top-left panel (`TIER_PIPS`: Weak 1, Fine 2, Epic 3 copies of the icon) |
| wide, bottom left | the ores used, with x2 tallies for repeats |
| big, top right | the craft process: `Iron + Zinc -> heat -> hammer -> quench -> hammer` |
| bottom right | the shapes the hammer stage can actually make |

The **top row of bookmarks is the recipe list** — one per recorded trait, showing its icon, clicking to
select, the active one highlighted. The side row was decorative placeholder icons and is now hidden;
showing random icons beside real recipes would have read as data. Ten bookmark slots, so the eleventh
recipe onward is recorded but not listed — worth revisiting.

The **gear** opens the Design Desk on the **default** look.

### Ore stock is real now

`ORE_COUNT` went from a decorative table to spendable stock (`ORE_START` keeps the opening amounts).
A drag is refused at 0 and the slot dims. The spend happens in `addPrep` / `addOreDirect` — the two
player-initiated paths — **not** in `addSegment`, which `restoreIngot`, `applyState` and
"continue from here" also call with ore that is already paid for.

### The three action buttons

- **CRAFT 1 / CRAFT 5** ask for a shape first. A new `SHAPE_CB` hook makes the existing shape picker
  hand the shape back instead of opening the hammer. Then they spend the recipe's ores **per sword** and
  drop finished blades straight into the inventory at the recorded tier. Short of ore, the picker never
  opens and the toast names what is needed. Verified: Craft 5 took 5 iron + 5 zinc and made five
  Broadswords; Craft 1 took one of each.
- **CONTINUE FROM HERE** spends one set of ores, rebuilds the route on the bench and parks the sword at
  its end with the trait already banked and heat at 0, so the next step is a trip to the furnace.
  Verified: three pips appear in the top-left panel and the route is `[iron, zinc]`. Refuses with a
  hint when the bench is busy (the owner's call, matching the ingot rack and the workstation table).
- **ERASE** deletes the recipe and falls through to the next one; with none left the page reads
  "No Recipe" and all four buttons disable.

### r65c — the gear was editing the wrong sword

`openDesign` / `closeDesign` / `ddRenderSword` all consult `WORK`, so opening the desk from the book
while a sword sat on the workstation table would have edited **that sword** rather than the default
look. A `DD_FORCE_DEFAULT` flag, cleared on close, makes those three behave as if the table were empty
for that one visit. Verified: the book's gear changed `DD_SEL` and left the table's sword untouched,
while the table's own desk still edits the sword.

### Save

`SAVE_V` is **3** — the blob gained `recipes` and `ore`. Verified across a page reload: both recipes
came back with their ores and tiers, the book listed two bookmarks, and the rail showed the spent
counts (iron 98, zinc 17, tin 32).

### Known gaps

Auto-crafted swords use the **current** default design, not the design at record time. The bookmark row
holds ten. Nothing checks that an auto-craft is reachable — a recipe records the ores that worked, so
it always will be, but a future ore rework could invalidate one. Sharpening is not part of a recipe.

### r65d — the bookmarks were not clickable

Reported: "I am not able to switch between saved traits in the recipe book." `elementFromPoint` on a
bookmark returned `DIV.sf-modal show` — the click was landing on the scrim, not the tab.

Cause: r41 deliberately put the bookmark strip **behind** the page image with
`.cb-marks { pointer-events: none }` so it could not block the page, and `.cb-mark` inherits that. The
recipe tabs are the first bookmarks that ever needed a click, so they have to opt back in:

```css
.cb-mark.rec { cursor: pointer; pointer-events: auto; }
```

Verified with **hit-tested** clicks (`document.elementFromPoint(x,y).dispatchEvent(new MouseEvent('click',{bubbles:true}))`)
on three recorded recipes — clicking bookmarks 1, 2, 0 in turn switched selection, title, pip count, ore
list and the highlighted tab every time:

| clicked | selection | title | pips | ores |
|---|---|---|---|---|
| 1 | grace | Grace Sword | 2 | tin, copper |
| 2 | durable | Durable Sword | 1 | nickel |
| 0 | fire | Fire Sword | 3 | iron, zinc |

**This is the second time an `el.click()` verification let a hit-testing bug reach the owner** — the
first was r48c, where an invisible `#screenHots` layer swallowed every click on the shop props, and the
spec already carried a note about it. `el.click()` dispatches on the node directly and never consults
the compositor, so it cannot see a covering layer or a `pointer-events` chain. **Any check that a
control works must go through `elementFromPoint` at the control's own centre.**

A sweep of every other modal (book, diary, quests, ledger, menu, skills) for controls buried under a
`pointer-events: none` ancestor came back clean. The only self-`none` elements are `.qs-chip.blank`,
the out-of-range quest pager numbers, which are meant to be dead.

### r66 — the shape picker opened behind the book

Craft 1 / Craft 5 borrow the forge's shape picker through `SHAPE_CB`, but `#sfShapeModal` is declared
**earlier** in the DOM than `#sfBookModal` and both are plain `.sf-modal` at `z-index: 1000` — so the
open book painted straight over it. The picker was there and live; it just wasn't visible.

```css
#sfShapeModal { z-index: 1010; }
```

The picker's own scrim now dims the book behind it, which is the usual stacked-modal read.

**A cancel, but only for the borrowed picker.** The forge flow has no way out on purpose — the metal is
on the anvil and a shape has to be chosen. Stacked over the book with no escape, that would have been a
trap, so `openShapeSelect()` toggles a Cancel row on `!!SHAPE_CB`: it shows when the book borrowed the
picker, stays hidden in the forge flow. `cancelShape()` clears `SHAPE_CB` and closes the picker,
leaving the book open and **spending nothing** — the ore is spent inside the callback, per sword.

Verified with hit-tested clicks: the picker resolves at `z-index` 1010 over the book's 1000, its shape
buttons and the Cancel button both hit-test to themselves, Cancel leaves the book open with 0 swords
made and ore untouched, Craft 5 + Shortsword spent 5 iron + 5 zinc and made five, and the forge-flow
picker shows no Cancel (`offsetHeight` 0). Console clean.

## r67 — Update Composition

The blade panel's disk stopped being a placeholder. It compares what the book has **recorded** for this
blade's trait(s) against the ore route that actually produced it, and writes the new one over the old.

### A recipe page holds a LIST of traits

r65 keyed `RECIPES` by a single trait id. A multi-trait blade needs its own page, so a page is now
`{ key, traits:[{tid,tier}], ores, grinds, at }` and the key is the trait ids **sorted and joined**
(`fire`, `fire+grace`). A one-trait page's key is still just the tid, so r65's keys survive untouched.
`recipeTraits(r)` reads either shape, which also carries a v3 blob through the loader.

Everything downstream generalised: the title joins the names (`Fire + Grace Sword`), the five boxes pip
**every** trait's tier the way the blade panel does, the bookmark shows every symbol (`.multi` shrinks
the type), CRAFT and CONTINUE FROM HERE build a sword carrying all of them, ERASE names the page.

### Automatic recording is first-discovery only

The owner's call, and it replaces r65's "a better tier overwrites" rule:

```js
if(RECIPES[k]) return false;   // every later change is the player's, through this window
```

A page is written the first time a trait is acquired and never again on its own. That also means
auto-recording only ever produces **single-trait** pages; combinations exist because someone pressed
Record.

### Update vs Record

| blade | heading | button | what it writes |
|---|---|---|---|
| one trait | Update Composition | **Update** | replaces that trait's page |
| several traits | Record Composition | **Record** | a page for the whole combination, keyed by the set |

The Recorded box shows the existing page for that exact key, or "Not recorded yet" — which is the
normal state for a combination the first time. Update always wins: it is a deliberate press, and both
routes are on screen before you commit.

### Reading the two boxes

Heading, then the traits, then the ore route with `+` between and `xN` tallies. The tier shows as
**pips** — the same `TIER_PIPS` rule as the blade panel and the recipe page — so a Weak run and an Epic
one are one glance apart instead of differing only by icon colour. Capped at `BLADE_SLOTS` with a `+N`
tail. At the worst case the boxes hold (4 traits, a 6-ore route) neither slot overflows its 162x127.

### The window still works after the bench resets

`finishBlade` stamps `ores` / `grinds` onto the finished sword and keeps the route in `LAST_CRAFT`,
because `resetRun` fires 2.6s later and wipes `segs`. With no craft live the New box reads
**Last crafted** and uses that route; with neither, it reads "Nothing crafted yet" and the button
disables. Auto-crafted swords carry their page's route too.

### Save

`SAVE_V` is **4** — pages hold trait lists and `lastCraft` joined the blob. Load normalises every page
through `recipeTraits` so a page written before this round still opens.

### Verified

Hit-tested clicks throughout. Empty state disables the button; a live single-trait blade showed
Recorded `iron+zinc` against New `iron+zinc+copper` and Update rewrote the page; re-acquiring `fire` at
Epic did **not** overwrite on its own (`recordRecipe` returned false); adding a second trait flipped
the window to Record and wrote `fire+grace` as a second page leaving `fire` alone; the book showed
`Fire + Grace Sword` with pips `🔥✨✨✨`, a two-symbol bookmark, and switching between the single and
combo tabs worked both ways; CRAFT 1 off the combo made a sword with both traits; CONTINUE FROM HERE
put both on the bench with the route `iron+zinc+copper`; after `finishBlade` + `resetRun` the window
fell back to "Last crafted" with the right route; a save/reload round trip brought both pages, the
combo's tiers and `lastCraft` back. Console clean.

### Known gaps

A blade with more than five pips shows `+N` rather than scrolling. There is still no way to record a
combination that was never crafted in one run. Nothing prunes pages, so the ten-bookmark limit now
fills faster with combinations in the mix.

## r68 — the cave, and ore you actually have to go and get

The first source of ore in the build. Until now `ORE_START` handed out a fixed opening stock that r65
made spendable and nothing ever replenished.

### Five seams a day, one per metal

`Cave_wireframe.png` marks **ten** spots. Five seams spawn a day — one each of iron, copper, manganese,
aluminium and nickel — on five of the ten, shuffled. Seven ore per seam, one per swing, so a full day's
cave is 35 ore. A worked-out seam fades and is gone until tomorrow; a new day (the bed's END DAY, the
only rollover that exists) reseeds all five in fresh places. Twenty consecutive rolls were checked: always
five seams, five distinct metals, five distinct spots.

### The spots, measured not guessed

The wireframe is 1015x565 with its rail edge at **x=820** (found by scanning for the rail panels'
leftmost pixel, not assumed from `--rail-w`, which is 21% and would have put it at 802). So the play
area is 820x565, the cave plate is 1920x1066, and `object-fit: cover` gives s=.5300, aw=1017.6,
ax=-98.8, ay=0. Every spot converts to plate-art %:

| # | wireframe centre | art % |
|---|---|---|
| 0 | 271, 330 | 36.34, 58.41 |
| 1 | 321.5, 330 | 41.30, 58.41 |
| 2 | 506.5, 353 | 59.47, 62.48 |
| 3 | 75.5, 400 | 17.12, 70.80 |
| 4 | 110, 494 | 20.52, 87.43 |
| 5 | 266.5, 494 | 35.90, 87.43 |
| 6 | 372.5, 494 | 46.32, 87.43 |
| 7 | 535, 494 | 62.28, 87.43 |
| 8 | 160.5, 513 | 25.48, 90.80 |
| 9 | 484.5, 513 | 57.31, 90.80 |

Art-anchored, like `SCREEN_PROPS` — verified identical to 0.00pp at layer widths 845 and 1039, which are
different crops of the same plate. The cave entry and the bridge are ignored, as asked.

### Its own layer, not `#screenProps`

A seam is centred on a spot; `SCREEN_PROPS` anchors visible-art left/bottom through a hand-measured
`PROP_OPQ` entry per image. Rather than add five, `#caveLayer` positions by centre and the whole
mining system stays in one place.

### The pickaxe is a real object

It lives in **ITEMS & DECOR** (the tab was empty by design since r60) and is **absent from the shelf
while it is out** — it is in one place or the other, never both. Drag it onto the cave floor and the
seams light up; click one and the pickaxe walks to it, swings, and a chip of ore comes off. Drag it
back onto the rail to put it away. Away from the cave the drag is refused with a hint, and clicking a
seam bare-handed is refused too.

### The ore's flight is decoration, and deliberately so

One ore pops out of the rock, hangs, then arcs to its slot in the rail and flashes it. **The stock
moves on the swing, not on landing.** The first cut chained `buildShelf()` off `animation.onfinish`,
which ties the inventory to a timeline the browser is free to throttle or pause — a backgrounded tab
would never have fired it. Everything is `setTimeout` now, so a paused timeline costs a flourish and
never an ore. Verified by mining a seam dry: seven swings, seven ore, the rail's count and the seam's
counter both stepping on every single swing, the seam gone on the seventh, no orphaned fly elements.

### r68c — the pickaxe was eating clicks

`pickaxe.png` is 1984x2140 with wide transparent margins, so its element box covers far more ground
than its art. Parked on a seam, it won the hit test and that seam went dead — the same shape of bug as
r48c and r65d, except this time the **hit-tested** check caught it before the owner did. The seam is
the target and the pickaxe is the tool, so seams stack above it. Even parked in the most crowded corner
the pickaxe is still grabbable over 32 of 81 sampled points, and 60 of 81 after a normal swing.

### Save

`SAVE_V` is **5** — the blob gained `cave: { nodes, pick }`. Verified across a reload: five seams with
their metals, spots and partial counts, the pickaxe still lying where it was left, and mining still
working afterwards. NEW GAME reseeds the cave and puts the pickaxe back in the bag.

### A note on a change that was made and then taken out

A resize during verification left the seams 1.90pp off, and a second relayout pass on the next frame
was added for it. That was wrong: instrumenting the page showed the Browser pane's emulated viewport
changes `innerWidth` **without dispatching `resize`** — a `ResizeObserver` on the layer does not fire
either — so the game was never told to relayout at all. A harness artefact, not a product bug; the
change was reverted rather than shipped on a cause that could not be demonstrated.

### Known gaps

**Tin and zinc have no seam**, so those two deplete with no way to replenish — five metals for five
nodes was the brief, but the other two now need a source. A seam is a scaled ore icon; there is no rock
art. Mining costs nothing but clicks — no stamina, no tool wear, no hazard. Seams only reseed through
END DAY, so a player who never sleeps never gets more ore. The pickaxe cannot be lost or upgraded, and
ITEMS & DECOR holds nothing else.

## r69 — the pickaxe strikes like the hammer

Clicking a seam is gone. The pickaxe now works exactly the way `#hammerTool` works on the anvil:
**proximity decides**, the swing repeats on its own, and letting go leaves it working.

| | forge hammer | cave pickaxe |
|---|---|---|
| trigger | head within `strikeDist()` = 11.6% of the bench width | head within 5.2% of the plate's art width |
| while near | `.striking`, a repeating animation, and a pulsing spark at the contact point | the same, with `#cvSpark` copied from `#hammerSpark` |
| on release | `check()` re-tests position, so it keeps striking | `pickCheck()` does the same |
| effect | cosmetic | one ore per swing, every `PICK_SWING` = 340ms, matching the animation period |

`pickHead()` puts the head at 66% / 26% of the pickaxe's box — the art's corner, not the box's centre,
which is what the transparent margins on a 1984x2140 sheet would have given. `pickSeam()` takes the
nearest seam inside reach and ignores worked-out ones.

Stopping is handled in one place, `stopStriking()`: dragged away, stowed, seam exhausted, or the player
leaves the cave. Verified that none of those keeps mining in the background.

### One relayout path

`goScreen` builds the cave **before** the plate decodes, so the first `pickCheck()` runs with
`plateBox()` still null and finds nothing; the art's `onload` then relaid out without re-checking,
which would have left a pickaxe parked on a seam standing idle after a load. `layoutCave()` re-checks
now and is the only thing that does — `buildCave` and the drag handler both go through it.

### Ten of every ore, and day one

`ORE_START` was `iron:100, manganese:12, copper:100, aluminium:5, nickel:8, tin:33, zinc:18` — invented
placeholders, and with 100 iron there was no reason to ever visit the cave. It is **10 of each** now,
which makes a day's 35 mined ore the main supply rather than a top-up. The day tile started on a
hard-coded **4**; it starts on 1, and NEW GAME puts it back.

### Verified

Parked by a real drag, the pickaxe struck 3 times in 1.2s and kept going after release; run to the end
it took the seam from 7 to 0 and iron from 10 to exactly 17, then stopped itself, cleared its interval
and the seam vanished. Dragging onto a different seam started work there; dragging to bare floor
stopped it with no further gain; stowing cleared everything. Leaving for the forge stopped it and
coming back resumed. A save/reload with the pickaxe parked resumed striking on the right seam and kept
mining. NEW GAME gives day 1, ten of each ore, five full seams and the pickaxe back in the bag.
Console clean.

### Known gaps

Resting the head dead-centre on one of the four bottom-row seams hangs the pickaxe about 22px below
the frame and it gets clipped — the same thing `LAYOUT.landscape.hammerTool` already accepts ("handle
cut by the frame"), and the player can park it slightly higher. Mining still costs nothing but time,
and tin and zinc still have no seam.

## r70 — the shop racks hold real swords

`RACK_STOCK` was six invented swords with invented prices, the same on every rack. The three racks are
real storage now: **five swords each**, dragged out of the rail, and each rack's window lists what is
actually on **that** rack.

### The hooks, measured off the art

`rack.png` is 241x427 with six hook pairs down its posts. Scanning for the bluish metal against the warm
wood found bands at 16.6 / 28.0 / 40.1 / 50.9 / 62.7 / 74.0% of the height — evenly pitched at 11.47%,
so the table is the fitted set and a sword hangs on the **top five**:

```js
const RK_HOOKS=[16.63,28.10,39.58,51.05,62.53];
const RK_SPAN=74.0, RK_MID=49.5;
```

Walking each hook row for runs of opaque pixels puts the opening between the posts at **17.84%..81%**
of the width, so a blade resting *on* the hooks spans a little wider than the gap (74%) and is centred
at 49.5%. Verified in place: every hung sword lands on its hook row to within **0.02pp**, spans exactly
74.00% of the rack and sits at 49.47%, with nothing crossing the posts.

### Sizing a flat sword, once

The r48 rack window carried a hand-tuned `s`/`sx` per row. `sizeFlat()` replaces that with the runtime
`comboExtent` and fits **whichever axis runs out first** — length against the box, thickness against the
hook pitch (28.4px on the shop screen):

```js
const side=Math.min(fillL*boxW/e.len, fillT*boxH/e.th);
```

The three test shapes came out at 89.3 / 100.9 / 95.0%, which is the per-shape variation the old table
was encoding by hand. `flatArt()` builds the four-image stack and measures it; both the shop racks and
the window use it.

### Its own layer

`#rackLayer` is `pointer-events: none` throughout, so the rack underneath still takes the click that
opens its window — the r68c lesson applied up front rather than after the fact.

### Dragging and taking back

`startSwordDrag` had one drop zone per screen. On the shop there are three, so `rackAt()` hit-tests the
pointer against each rack's box and the hovered one lights up. A full rack refuses the drop and hands
the sword back to the rail rather than eating it. Taking a sword off was not asked for, but without it
anything placed is stranded, so the opened Details panel carries a **TAKE** button.

Each rack prop now carries its index and wires its own click, so `openRacks(i)` opens that rack. The
window is shown *before* it is built, because the rows measure the viewport to size their swords. An
empty rack reads "Rack N is empty — drag a sword here from your inventory".

### Verified

Six drags onto rack 1: five landed, the sixth was refused and the sword stayed in the bag; two more
onto rack 3. Each rack's window opened with its own contents (5 rows / empty message / 2 rows) and the
rail stayed on SWORDS. Details showed trait, tier, sharpness and price; **TAKE** hit-tested to itself
and moved the sword back, updating the rack, the window and the swords hanging on the shop screen
together. `SAVE_V` is **6** — verified across a reload that 4/0/2 came back with the right shapes, and
NEW GAME clears all three. The r61 workstation table and the r64 counter both still take a sword, and a
screen with no target still refuses the drag with a hint. Console clean.

### Known gaps

Nothing sells off a rack — this is display and storage only, so a sword on a rack is out of reach of
the counter until it is taken back. The window's scroll survives from r48 but five rows barely need it.
Rack order is placement order; there is no sorting or reordering.

## r71 — the shop costs money, and gold finally has somewhere to go

The first **gold sink** in the build. r64 made selling pay and nothing ever spent the takings.

| | price | comes with |
|---|---|---|
| the shopfront | **500g** | rack 1, unlocked |
| rack 2 | **200g** | |
| rack 3 | **300g** | |

### Locked, not hidden

The shop screen is still reachable while it is shut — you can see the racks you are buying. A
`SHOPFRONT CLOSED` panel sits over them with the price on its button; behind it the racks take no
clicks and no drops. Once the shopfront is open the panel goes and racks 2 and 3 keep a dimmed overlay
with a **🔒 200g** / **🔒 300g** button until they are bought.

Every purchase **arms on the first click and buys on the second** — `wireBuy()`, the same guard the
menu's destructive buttons use, so a mis-tap cannot spend 500g. Short of gold the button greys out and
says what it costs against what you have, and never arms.

`rackUnlocked(i)` is the single gate: `rackAt()` skips locked racks so a drag will not even highlight
one, `openRacks()` refuses with the price, and `buildRackSwords()` hangs nothing on them.

`#shopLocks` is `pointer-events: none` with only the buy buttons taking the pointer, so a click on the
locked rack's body still reaches the rack underneath and gets told the price.

### The ledger reaches the counter

`SCREEN_UI.customer` gained the same ledger entry the shop has, mirrored to the bottom-left at
`x 1.00, y 83.61` — verified to clear both the counter's drop zone and the SELL/DENY buttons.

### SETTINGS stops being a placeholder

It swaps the menu's grid for a second one holding **+1000 GOLD** and **BACK**. The menu always opens on
the main page. The cheat writes straight to `GOLD`, refreshes the HUD and re-renders the shop's buy
buttons so one stops being greyed out the moment you can afford it. Real settings still have nowhere to
live; the page is labelled "Cheats — for testing."

### Verified

From 0 gold: the panel showed, its button was greyed, clicking it refused with "That costs 500g — you
have 0g", and a rack click was refused. The cheat took gold 0 → 1000 → 2000 through the real menu.
Buying armed then charged 500 and left 1500, the panel went and two rack locks appeared. Rack 1 opened
its window; rack 2 clicked away from its button refused with "Rack 2 costs 200g"; a sword dragged over
it drew no highlight, was not accepted, and stayed in the bag. Buying rack 2 took 1500 → 1300. The
counter's ledger button hit-tests to itself, overlaps neither the drop zone nor SELL/DENY, and opens
the ledger. `SAVE_V` is **7** — `{open:true, racks:[true,true,false]}` came back across a reload, the
300g lock still in place; buying it then accepted a sword. NEW GAME re-locks everything. Console clean.

### Known gaps

Racks are still display only — nothing sells off them, so 1000g of rack buys you shelf space and
nothing else yet. The unlock prices are not tuned against what selling actually earns. QUIT is still a
placeholder, and the settings page holds only the cheat.

## r72 — the shopfront sells on its own

Ported from `index.html`'s `startShopLoop`, which rolled every racked sword at **5% every 10s** and paid
`value + craftBonus - hazardLoss` with no reputation or popularity change. Four calls from the owner
changed three of those:

| | old build | here |
|---|---|---|
| runs when you are elsewhere | yes | **yes** — the timer never cares what screen you are on |
| roll | 5% per sword per **10s** | 5% per sword per **30s** |
| price | raw value, no modifiers | **80% of `swordPrice()`** — the counter's price, popularity and reputation included, then the shop's cut |
| reputation / popularity | neither | **neither** — gold only |

```js
const SHOP_TICK=30000, SHOP_CHANCE=0.05, SHOP_CUT=0.80;
function shopPrice(w){ return Math.max(1, Math.floor(swordPrice(w)*SHOP_CUT)); }
```

The 80% cut is the point of the counter: an Epic fire Longsword is **70g** sold in person and **56g**
left on a rack. Racks are convenience; serving someone yourself pays more. `SHOP_CUT` is the one
constant to change.

### It has to be noticeable from anywhere

A sale can land while you are swinging a pickaxe two screens away, so the gold pill itself flashes
green (`#goldVal.gained`) and a toast names the take. The shop screen, the rack window and the ledger
all re-render if they happen to be open when a sale lands.

### The ledger tells them apart

A passive row carries `shop:true` and shows a 🏪 marker, with the tooltip saying "sold from the shop
racks" against the counter's "sold at the counter". The rack window's Details quotes the **shop price**
with the label, not the counter price, so what a racked sword will actually fetch is on screen.

### Verified

With every roll forced to fire, a full 15-sword shop cleared for exactly 840g = 15 x 56, reputation
and popularity untouched, all 15 logged and flagged, the racks emptied and the swords un-hung. A shut
shopfront sold nothing and kept its stock; with only rack 1 unlocked, its three sold and rack 2's four
were not touched. Standing in the **cave**, a tick still sold five for 280g, flashed the gold and
toasted. Unforced, 15 sales fell out of 378 rolls — **3.97%** against the 5% rule, inside sampling
noise. The real interval fires by itself. A counter sale still pays the full 70g and still moves
reputation and popularity. Across a save/reload the racked stock, the 43 flagged passive sales and the
gold all came back and the loop kept selling; NEW GAME empties it and the loop idles. Console clean.

### Known gaps

Nothing models demand — a rack of six identical Broadswords sells as readily as a varied one, and
popularity changes the price but not the rate. Sales do not pause when the game is idle in a background
tab, so time away still earns (the browser throttles the timer but does not stop it). The ledger still
shows only the five most recent sales and has no per-day grouping, which the old build had.

## r73 — experience, levels and talent points

`exp` has banked silently since r34, with no readout and nothing reading it. It is a system now.

### The curve

Running totals, flat 100 a level: **level N starts at (N-1) x 100**. Verified across the boundaries —
99 is still level 1, 100 is level 2 at 0/100, 200 is level 3, 300 is level 4, 999 is level 10 at 99/100.
Every level grants **one talent point**; nothing spends them yet, so `TALENT` only grows.

### What pays

| source | exp | where |
|---|---|---|
| forging a blade | 5 | `finishBlade` |
| auto-crafting from a recipe | 5 each | `cbCraft`, per sword |
| selling at the counter | 5 | `sellCounter` |
| working an ore seam out | 5 | `mineNode`, when the seam hits 0 |
| small book | 50 | was 60 |
| large book | 75 | was 120 |
| completing a quest | 25 | `bumpQuest` |

Four owner's calls shaped these: totals not per-level costs; the ore exp is for the **seam**, not the
swing (six swings pay nothing, the seventh pays 5); **counter sales only**, so a rack selling on its own
still pays gold alone; and quest tracking got built rather than stubbed.

At 5 exp a sword a level is 20 swords, and a day's five seams is 25 exp — a quarter of a level.

### The readout goes inside the skill button

No new row: `#skillBtn` keeps its 50px height and now holds three things — SKILL TREE, a line reading
`Lv 3 · 65/100 · 2 pt`, and a 3px xp bar pinned to its bottom edge. A level-up rings the button green
and toasts. The skill window's `Talent points – X` placeholder shows the real count.

### Quests track now

`bumpQuest(id)` advances a goal, and the moment it is met pays **20g + 25 exp**, once. Four of the five
are wired to things the build can actually measure:

| quest | fires on |
|---|---|
| Craft 5 Epic swords | a finished or auto-crafted blade whose best tier is Epic |
| Discover 3 new traits | `tryAcquire`, only when the trait was **not** already discovered |
| Update 3 recorded compositions | `confirmComp` |
| Open the shop front | the r71 purchase going through |

**"Survive a day without turning any customer away" stays at 0/1** — there is no customer to refuse and
no day system to survive. It is the one quest with nothing behind it, deliberately.

A finished quest strikes through in the window and reads "✓ complete".

### Verified

The boundaries above; 4 Epic swords paid 20 exp and sat at 4/5, the fifth brought the run to 50 total
(25 craft + 25 quest) and turned the quest in for 20g; a Fine sword paid its 5 without advancing the
Epic count. A small book 50, a large 75. Six pickaxe swings 0, the seventh 5. A counter sale 5; a
passive rack sale 280g and **0 exp**. Discovering two traits paid nothing, the third paid 25 + 20g, and
re-acquiring a known trait did not count. Three compositions, then the shop purchase, each turned in.
Across a save/reload: 210 exp, level 3, 2 points, the bar at 10%, both finished quests still finished —
and re-bumping a finished quest paid **0 gold and 0 exp**. NEW GAME returns to Lv 1, 0 exp, 0 points,
all quests at 0. `SAVE_V` is **8**. The skill button is still exactly 50px, so nothing below it moved.
Console clean.

### Known gaps

Talent points accumulate and buy nothing — the twelve skill-tree nodes are still the r42 placeholders
with no click handlers, and RESET TALENT does nothing. The curve is flat forever, so level 50 is as
cheap as level 2. Hazards and blade loss pay no exp, and neither does grinding or sharpening.

## r74 — the four blue skills

Talent points buy something. The four blue nodes at the bottom of the r42 tree are live controls now:
each shows `rank/max`, names itself underneath, rings amber when affordable and green when maxed, and
spends on click. RESET TALENT refunds every point.

| skill | ranks | cost | effect |
|---|---|---|---|
| Bulk Craft | 7 | **7** each (49 total) | auto-craft uses 10% less ore a rank, to a flat 70% |
| Sword Master | 10 | 1 each | ranks 1-5 scatter +10% more books; ranks 6-10 scatter great tomes worth 100-200 exp |
| Far Vision | 20 | 1 each | +5% sight radius a rank, doubling it at rank 20 |
| Restore Ore | 3 | 1 each | 10/20/30% of your ore back when a blade is lost |

### Bulk Craft discounts the batch, not the sword

The owner's call was **auto-craft only** — hand-crafting spends ore one drag at a time and has no
per-sword ingredient count to discount. So `bulkNeed(list,n)` tallies what a Craft-N order costs,
scales it, and rounds **up**, never below one of each:

```js
t[o] = Math.max(1, Math.ceil(t[o] * (1 - cut)));
```

Which makes it a genuine *bulk* skill. On a 2-iron/1-zinc recipe at rank 7, Craft 1 still costs 1+1
(the rounding floor) while **Craft 5 falls from 10+5 to 4+2** — verified through the real recipe-book
buttons, still producing five swords.

### Sword Master's books land immediately, in the fog

Buying a rank scatters right away rather than waiting for a new map, so the point pays off this run.
`inFog(x,y)` tests the point against every fog hole, so new books only ever land in the dark and still
have to be travelled to. Ranks 1-5 add `round(K.n * 10%)` of each kind — **10 books a rank**, verified
96 -> 146. Ranks 6-10 add `SM_BIG_PER_RANK = 3` great tomes each, **15 in all**, rolled 100-200 exp;
that count is the one number the brief did not give, and it is a single constant.

### Restore Ore rolls per ore

Each ore on the lost route rolls independently at 10/20/30%, which beats a rounded fraction — a
two-ore route at 10% would otherwise always refund nothing. Measured over 600 runs of a five-ore route:
**0.502 / 0.977 / 1.445** against the 0.5 / 1.0 / 1.5 the rule predicts. It fires from `shatterBlade`
and from the blade panel's cancel button, both **before** `resetRun` clears `segs` — and deliberately
not from `finishBlade`, where the ore bought a sword.

### Far Vision

`REVEAL_R` stopped being a constant at the call site: `revealR()` returns `REVEAL_R * (1 + 0.05*rank)`.
Verified 120 -> 240 at rank 20, and back to 120 after a reset.

### Save

`SAVE_V` is **9**. Two changes: `skills` joined the blob, and **the book list is now saved in full**
(`{x,y,xp,k,t}`) instead of a taken-flag array matched by index — Sword Master adds books `initMap()`
knows nothing about, so index alignment could not survive. A taken book is simply not re-added.
Verified: 217 books saved with 21 tomes, reloading to 215 with 20 (the two taken gone), every tome's
rolled exp intact, the sight radius back at 132 and the bulk cut at 10%.

### Verified

Every rank boundary, over-max refused by name, and a purchase refused with the shortfall when points
are short. Far Vision 20 ranks for 20 points, doubling the radius. Bulk Craft 7 points a rank, 49 for
the tree, Craft 5 falling to 4+2 ore. Sword Master 10 books a rank then 3 tomes a rank, all in fog, all
100-200 exp. Restore Ore's three rates inside sampling noise, firing on both a real cancel and a real
shatter. RESET TALENT refunded exactly 13 of 13 spent, zeroed every rank and restored the base radius —
**books already scattered stay**, which the toast says. NEW GAME clears ranks and the map returns to 96
books. Console clean.

### Known gaps

The eight yellow and green nodes are still bare placeholders. Nothing gates the ranks — any skill can be
taken first, there are no prerequisites and no tree structure behind the layout. RESET TALENT is a
single click with no confirmation, unlike the menu's destructive buttons. Sword Master's tomes cannot
be un-spawned by a reset, so the skill is effectively permanent once bought.

## r75 — the dragon's dialogue box, and the tutorial script

The tutorial copy lives in **`specs/2026-09-15-looptest-landscape-tutorial-script.md`**: the id
convention, the speakers, the dialogue box spec, and **D1**. The owner has their own script for the rest,
so the draft flow that first went into that file was removed rather than left to compete with it. None of
the flow is implemented.

### The bubble

`#dragonSay` is a speech bubble, not the counter's `Dialogue_box.png` panel: pale parchment, dark border,
and a **tail** built from two stacked CSS triangles — the back one the border colour, the front one the
body colour offset by a pixel, so the join reads as one shape rather than a triangle sitting on a box.
Dark body text, because the parchment is pale (the r55 trap). Click anywhere to dismiss.

It is **anchored to the dragon**, not placed: `sayLayout()` reads the dragon's live rect each time and
puts the tail's tip on its head. Verified the tip lands within 5px of the head, and that dragging the
dragon 160x80 moves the bubble exactly 160x80 with the tail still on target.

D1 is the owner's line, kept verbatim — including "hasn't be used", which is flagged in the script for a
proofing pass rather than silently corrected.

### Two wrong turns worth recording

1. **Clamped to the wrong box.** The first `sayLayout()` worked in bench-relative coordinates and clamped
   the bubble inside the bench. The dragon is placed with a large negative `top` and renders well *above*
   the bench, so the clamp shoved the bubble to the bench's top edge — 340px below the head it was
   pointing at. It works in viewport coordinates now and clamps to the frame.
2. **Hooked dead code.** The follow-the-dragon call went into `makeDraggable`, which the file itself
   labels dead: *"wireDragon is the LIVE dragon handler (makeDraggable/wireMovable are dead code)"*. The
   measurement caught it — the dragon moved 140px and the bubble moved 0. It sits in `wireDragon`'s
   pointermove now, beside `updateFirePos()`.

### Known gaps

`say('D1')` fires on a 600ms boot timer as a placeholder; nothing sequences the lines and `DIALOGUE`
holds only D1. There is no hand pointer, no gating, no skip control and no tutorial state in the save.

## r76-r78 — the dragon talks

**r76** added **D2** and gave the bubble a run to walk: `SAY_SEQ = ['D1','D2']`, a click advances, the
last line closes it, and the footer label switches from "click to continue" to "click to close" so the
final beat is honest about what the click does.

**r77** doubled the dialogue text, 11.5px -> 23px. The bubble had to grow with it — at 23px in the old
210px box D1 wrapped to eighteen lines. Width doubled to 420px, which holds it at four lines, and the
tail, padding, speaker label (9 -> 12px) and footer (9 -> 11px) went up with it so nothing reads broken
beside the bigger type.

**r78** split what a press on the dragon means:

| where the dragon is | press | drag |
|---|---|---|
| within reach of the anvil | breathes fire, as before | moves it |
| anywhere else | brings its last line back | moves it |

"Within reach" is `dragonAtAnvil()`: the distance from its **mouth** (0.92 / 0.40 of its box, the point
`updateFirePos` already uses) to the anvil's box, against `benchDims().w * 0.20` — about the length of
the fire art, so the rule reads as "close enough that the fire would land on it". At its starting
position that distance is 228px against a 124px reach, so a fresh game taps to talk.

`SAY_LAST` outlives dismissal and `sayAgain()` brings it back, re-seating `SAY_I` so the run does not
restart from D1. The caption is live: **🐉 tap to talk · drag me** away from the anvil,
**🔥 breathe · fire resets the sword** within reach, updated on every drag frame.

### r78b — a comment ate half a function

`wireDragon` is one very long single line. r78 inserted an inline `//` comment into the middle of it,
which commented out **the rest of the line** — the `pointermove` handler and `end`'s definition. The
next line's `addEventListener('pointerup', end)` then threw `ReferenceError: end is not defined`,
`wireDragon` aborted, and `initMechanics` never reached the boot timers, so the dragon stopped speaking
at startup entirely.

The symptom that caught it was not an exception in view — it was `SAY_I` sitting at `-1` a second after
load when the boot timer should have moved it. **Never put an inline `//` comment mid-line in this
file**; block comments or real newlines only. `wireDragon` is now written over real lines, and the
patch script syntax-checks the whole `<script>` with `new Function` before writing.

### Verified

Boot shows D1; two clicks walk to D2 and close. A press away from the anvil produces no fire
(`dragonFire` stays `none`) and brings D2 back with "click to close". Dragged so its mouth sits over
the anvil, `dragonAtAnvil()` flips true, the caption changes, and a press there breathes
(`dragonBreathing` true, fire `block`) and does **not** open the dialogue. Release stops the fire.
Console clean on a fresh load.

## r79 — D3, and the opening hand

**D3**: *"Add 2 Iron and 2 Manganese to the smelter. Note the path it creates on the trait map."*
Manganese was lowercase in the owner's draft against a capitalised Iron; both are capitalised now, which
is how the ore slots and every window name them.

### Two metals, and nothing else

`ORE_START` is **`{ iron:2, manganese:2 }`**, every other metal zero. This **supersedes r69's
ten-of-each** — the owner's call, and the tutorial's opening line now names the entire inventory. The
other five slots still show on the shelf, dimmed at x0, so the player can see what exists and that they
have none of it; the cave is the only way to get more.

Verified the line is followable: 2 Iron + 2 Manganese build a four-segment route, the path draws, and
the shelf then refuses everything ("No Copper left", "No Tin left") because nothing is left to give.

### r79b — the spend sites trusted their caller

`addPrep` and `addOreDirect` called `spendOre` without checking there was any. No player could reach it
— the shelf refuses the drag at zero and that is the only door — but with the opening hand down to four
ore, a leak is worth closing at the source rather than at one of the doors. Both return early now.

Worth recording how this surfaced: the first check called `addOreDirect('copper')` directly and got a
free segment, which **looked** like a live bug. Driving the shelf instead showed the guard working. The
lesson is the r48c/r65d one in a different coat — a check that bypasses the real input path can invent a
bug as easily as it can miss one.

## r80 — the tutorial route lands on Balanced, both ways

D3 asks for 2 Iron + 2 Manganese; the loop also has to work from 1 ground Iron + 1 ground Manganese.
Both had to end on the same trait. Neither did.

### What was wrong

A raw ore travels **half** its path (`tPct = 0.5 + 0.5*grind`), a fully ground one travels all of it, and
each segment is the ore's path re-rooted at the previous segment's end. So the two routes agree only if
`P(1) = 2*P(0.5)` for each ore — the half-arc displacement is exactly half the net.

| | half-arc x2 | full | agrees? |
|---|---|---|---|
| iron (an upside-down W) | (-156.2, 3.0) | (-156, 0) | within 3 units |
| manganese (a curl) | (-141.8, 10.6) | (-124.6, -12.5) | **28 units out** |

The two routes landed **31.4 apart**, and Balanced was 534 units north of both.

### The fix

A cubic whose second control is `E - C1` is **point-symmetric about its own midpoint**, so its half-arc
point is exactly `E/2` — the property the whole thing needs. Manganese became one such cubic, solved by
binary search on the perpendicular control offset to hold `chord/arclength` at 0.487:

```
M0,0 C 17,-177.3 -142,165.3 -125,-12
```

Net displacement **(-125, -12)** against the old (-124.6, -12.5), and `len` still 258 — so **every other
manganese route lands where it always did**. The old path self-intersected (a genuine curl); the new one
is a clean S, no crossings, staying inside its own span. Iron's r29 card is untouched.

Result: the two routes now land **2.96 apart** instead of 31.4.

### Where the traits went

**Balanced** moved onto the landing point and **Durable** took its old seat, keeping the y=510 row's
shape. Both routes now reach Balanced at **Epic** (1.66 and 1.61 from centre, against an Epic radius of
9), and order does not matter — the route is a vector sum. Balanced also falls inside the opening reveal
now, so the player can see the target D3 tells them to note.

### A correction worth recording

`TRAIT_POS` is **sketch space**, not world: `wx = START.x + (p.x - REF_C.x) * 1.5`. Two mistakes came out
of forgetting that. The first wrote a world coordinate straight into the table, putting Balanced at
world (1551, 1636) — caught because the verification asked where the trait actually *was* rather than
trusting the value written. The second is worse, because it reached the owner: the value figures quoted
before the decision ("45 dropping to 24") were `traitValue()` fed sketch coordinates. The real numbers:

| | world | value |
|---|---|---|
| Balanced, before | 1569.5, 872.5 | 17 |
| Balanced, after | 1119.5, 1019.5 | **24** |
| Durable, before | 1184, 1091.5 | 20 |
| Durable, after | 1569.5, 872.5 | **17** |

Balanced is worth **more**, not half. Durable loses 3. The owner accepted a drop and got a rise, so the
decision stands, but the figures they were given were wrong.

## r81 — tutorial pointers, and D4

### The pointer

One SVG at `z-index 70` spanning the whole frame, so an arrow can run from the **rail** into the
**bench** — no other overlay in the build crosses that boundary. `tutArrow(from, to, opt)` takes either
two anchors (a curve between them) or a target plus an offset (a stub pointing at it). Both ends are
given as fractions of the anchor's box, the tip stops short of the target so the head points *at* the
thing rather than covering it, and the dashes flow toward it. Anchors can be functions, so the ore arrow
tracks the Iron slot even though the rail rebuilds its shelf constantly.

`tutGlow(sel, on)` is the pulsing highlight — a drop-shadow animation, which reads properly on
transparent PNGs like the bellows.

### The two steps

| | |
|---|---|
| **D3 shows** | arrow from the Iron slot to the crucible, up as long as the line is |
| **4th ore lands** | `tutCheckOre()` sees 2 iron + 2 manganese in `segs` -> **D4** fires on its own, arrow points down at the bellows, bellows glows |
| **first pump** | both clear |

D4 is pushed onto `SAY_SEQ` when it fires, so it closes through the same path every other line does.

### Aim

The first cut aimed at the furnace image's top sixth, which is empty roof — the arrow appeared to point
at nothing. The thing the player actually drops onto is the crucible, `#furnaceGlow`, **56% down** the
furnace image. Both arrows are now anchored to real elements rather than guessed fractions of a station,
and the bellows arrow comes in from the open space up-right instead of crossing the furnace.

### D4's wording

The owner wrote "bellow"; the tool is a **bellows**. The game was already inconsistent — the station
caption read "Bellow" while its tooltip and every hint said "bellows" — so the caption changed to match
the rest.

### Verified

Caption reads "Bellows". At D3 the arrow starts within 40px of the Iron slot's centre and ends within
45px of the crucible, and survives the bubble closing. Feeding ore one at a time, nothing fires on the
first three; the fourth flips the stage to `bellows`, shows D4 with the right text, raises the arrow and
turns the glow on. A real press on `#bellowHot` (hit-tested to itself) clears both. Redrawing is stable.
Console clean.

### Known gaps

Nothing sequences past D4. The pointer is not in the save, so a reload mid-tutorial loses it. Separately
and pre-existing: `.bellow-tag` is positioned at `left:-6%` of the smelter station, which puts the word
"Bellows" about 120px left of the bellows it names, under the furnace instead.

## r82 — D5, and a New Game that replayed the tutorial's tail

**D5**: *"Tap on the smelter gate to open it."* Fires from `markGateReady()` — the first moment tapping
the gate does anything; before that it only answers "Still heating". An arrow comes in from the left; the
**glow is the gate's own**, because `#furnaceGate.ready` already pulses and is the more specific
selector, so stacking `tut-glow` on top would have been overridden anyway. Both clear when the gate opens.

The owner wrote "smelted door": "smelted" is what happens to the metal, so that was a typo for "smelter",
and the game calls it a **gate** in both places it names it — "door" would have been a third word for one
object, after "furnace" and "smelter".

### r82b — the tail replayed on a New Game

D4 and D5 are **appended to `SAY_SEQ` when they fire**, which is what keeps them closing through the same
path as every other line. But `newGame()` only called `tutDone()`, which clears the pointer and nothing
else — so the array still ended `...D3, D4, D5` and `SAY_I` was left mid-run. A new game replayed "heat
up the smelter" and "tap the gate" straight after the intro, and because `SAY_I` never returned to -1 the
ore step never armed.

`tutReset()` rewinds the run to `SAY_OPENING` and clears `SAY_I` / `SAY_LAST`, and `newGame` starts the
intro again.

Worth noting how it surfaced: the check that found it was not looking for it. A second pass through the
flow was added only to confirm that tapping the gate early does nothing, and it came back reporting
`said: "D2"` where D1 was expected — the run had not rewound. Re-running a whole flow rather than the one
step under test is what caught it.

### Verified

First pass walks D1, D2, D3, then D4 on the fourth ore and D5 on heat-ready, leaving `SAY_SEQ` five long.
NEW GAME rewinds it to exactly `['D1','D2','D3']` with `SAY_I` 0 and the pointer down; the second pass
walks the same three and arms the ore step again. A hit-tested tap on the gate when ready clears the
pointer and moves the melt to `hot` with the orb out. Console clean.

---

## r83 — the smelter gate waits on heat, not on a clock

**Ask:** "do not fire d5 till player clicks on the bellow and heats up the smelter. The smelter door
should only open after it is heated."

**What was actually wrong.** The gate never checked the heat. `tick()` readied it purely on elapsed
time — `(now - melt.smeltT0)/1000 >= SMELT_TIME`, five seconds from when the ore went in — while the
bellows only raised `melt.heat`, which feeds the sword's travel speed and nothing else. So the bellows
was the one station a player could skip outright: wait five seconds on a cold smelter and the gate
opened anyway, with D5 arriving on schedule to congratulate them for heating nothing.

**The rule now.**

| | before | after |
|---|---|---|
| gate unlocks when | 5 s since the ore landed | `melt.heat >= HEAT_READY` (70 of 100) |
| bellows | optional; sets travel speed | required; the only way to reach 70 |
| `SMELT_TIME` | 5 | retired |
| time to ready | 5 s of waiting | ~1.05 s of pumping, from `BASE_HEAT` 26 at `HEAT_RISE` 42/s |

Applies to every smelt, not only the tutorial one. Two rules for one station would have had the
tutorial teaching something that stops being true the moment it ends.

`HEAT_READY` is published to CSS as `--heat-ready`, and `#heatMini .track::after` draws a notch there,
so the mark on the gauge is the constant itself and cannot drift from the rule it describes.

**A trap the fix opened, closed in the same round.** The bellows arrow and glow cleared on the first
`pointerdown`. That was harmless while the gate was on a timer; with heat required, one tap would have
left a player with no pointer, a cold smelter and no next line. The pointer now stays up until
`markGateReady()` — `tutGateStep()` already drops it — so it clears exactly when the job is done.

**Knock-on, deliberate.** The orb now always leaves the furnace at 70+ heat instead of possibly 26, and
heat is the hammer's travel speed (`advanceSword`). The sword therefore starts its route ~2.7× faster
in the worst case than it could before. The ceiling is unchanged at 100; only the floor moved, and the
floor was the behaviour of a player ignoring a station.

**Verification, and a check that proved nothing.** The first pass "waited 7 seconds without pumping"
and reported the gate still shut — but the Browser pane was hidden, so `requestAnimationFrame` never
fired and `tick()` had not run at all. The result was real and meaningless at once. Re-run driving
`tick()` by hand at 50 ms a step, with the bellows and the gate still operated through hit-tested
`elementFromPoint` pointer events:

- 8 simulated seconds idle → `gateReady` false, no pulse, D5 unfired, bellows pointer still up;
- a hit-tested tap on the cold gate → refused, melt still `smelting`, orb hidden;
- `pointerdown` on `#bellowHot` → `bellowing` true, `pumping` class on, heat 26 → 70 in 1.05 s;
- at 70 → `markGateReady()`, gate pulses, bellows glow off, arrow swings to the gate, bubble reads
  "Tap on the smelter gate to open it.", `SAY_SEQ` = D1…D5;
- hit-tested tap on the ready gate → melt `hot`, orb out, pointer cleared, `TUT_STAGE` null;
- reinsert at heat 60 → not ready, a short re-pump needed; the gauge notch measures 35 px of the
  50 px track content box = 70.0%.

---

## r84 — D6, the carry to the anvil, and one name for the thing being carried

**Ask:** "'Nice! Let's take this hot metal to the anvil' is the next dialogue. show arrows guiding from
gate to the anvil." Then, on the naming question: "Call it metal...hot metal and metal ingot when it is
cold."

### The name

The build had been calling it **the glowing orb** in two hints — the heat-ready one and the one that
fires the instant the gate opens. That second hint is on screen at the exact moment D6 speaks, so a
player would have read two names for one object in the same breath. The owner's rule settles it:

| state | name |
|---|---|
| glowing, out of the smelter | **hot metal** |
| cooled, on the bench or in the inventory | **metal ingot** |

Three hints changed: heat-ready, gate-open, and the post-quench one (which is a cold state, so it reads
"metal ingot" / "tap the ingot"). The inventory tooltip was already `Ingot — 3 ores, 1 trait, cold`, so
the cold name needed nothing. **Only player-facing text moved.** `#orb`, `orbEl`, `handleOrbDrop`,
`wireOrbDrag` and the rest keep their names; renaming them would be a large mechanical edit across the
file for no player-visible gain.

### The step

`tutAnvilStep()` fires from `openGate()`, taking the handover directly from D5 — the same tap that
releases the metal raises the next line, so there is never a moment with no instruction on screen.

- **Arrow:** `#furnaceGate` → `#stAnvil .anvil`, the full width of the bench. It starts at the gate the
  metal is sitting at, not at some neutral offset, and the head stops 26px short of the anvil's landing
  face (`tfy: 0.20`, which is where `placeOnAnvil` actually puts it).
- **Glow:** the anvil, as the destination. Measured: arrow tail (469, 507) against a gate at (479, 510)
  and an orb at (487, 524); head at (249, 456) against a target point of (223, 451) on an anvil box of
  (144, 424, 159×134).
- **Clears:** `placeOnAnvil()`. Dropping the metal back into the furnace deliberately does **not** clear
  it — verified: the melt returns to `smelting` with `gateReady` false, and the arrow and glow stay up,
  because the instruction is still the right one.

`tutGlow` now records what it lit (`TUT_GLOWED`) and `tutDone()` calls `tutUnglow()`. Until this round
`tutDone` cleared `#bellowtop` by name, which was fine while exactly one thing ever glowed; the anvil is
the second, and the next one would have been left lit.

### Verification

Full run on hit-tested input, with `tick()` driven by hand because the hidden pane freezes `rAF`:
D1→D2→D3 on bubble clicks, D4 on the fourth ore, D5 at heat 70, and the gate tap giving `TUT_STAGE`
`anvil`, the bubble reading "Nice! Let's take this hot metal to the anvil.", the anvil lit and the
bellows dark. A real press-drag-release on the orb (dispatched on the orb itself — it takes pointer
capture, so events sent to `window` never reach it) lands the metal at (224, 444), the anvil's 50%/15%
point, with the arrow off, no glows left and `TUT_STAGE` null. New Game rewinds `SAY_SEQ` to D1–D3.
Console clean.

---

## r85 — D7–D9: the hammer, the freeze, and two books on the route

**Ask:** D7 "Pick up the hammer and strike the hot metal on the anvil", hammer glowing; on the first
hammering, pause and darken everything until the player clicks through D8 "Look, the sword icon moves on
the trait map with each strike. Keep hammering till we reach the '?'"; two small pickups on the path to
the first Balanced sword; D9 on reaching one.

### The freeze

`TUT_PAUSE` returns out of `tick()` before `dt` is used (`lastT=now` first, so the resume does not eat a
two-second frame), and `#tutDim` covers the frame at z-index 45 — under `#dragonSay` (46), over
everything else. It is a real element, not a filter, so it also **swallows clicks**: with the dim up the
only live control on screen is the bubble. `sayNext()` lifts both, which is the right hook because the
inline `onclick="sayNext()"` on the bubble is the only way to advance while the dim is eating input.

Timed at **0.7s of striking**, not on contact. The sword travels ~46 world units first, so D8's "Look,
the sword icon moves" describes something the player has already seen. Measured (1400, 1030) → (1364,
1002) over 14 ticks, then frozen — stepping 40 more ticks with the hammer still on the anvil moved it
zero units.

### The books

Placed by `tutPlaceBooks()` the moment the fourth ore lands, because that is when the route stops
changing. `tutRoutePoint(f)` walks the segments by **traversable** length (`len * tPct`, since a raw ore
only travels half its path) and samples with the game's own `segPointLocal`, so the books sit exactly on
the line the sword will walk rather than near it. At 0.38 and 0.72 they landed at (1262, 1015) and
(1181, 1026), between START (1400, 1030) and Balanced (1119, 1021).

Two `small` books, 50 exp each. **That is exactly 100** — the tutorial ends the run at level 2 with one
talent point, so D9's "Collect them to level up" is literal. Verified: first book at exp 50 fires D9,
second takes exp to 100, `LEVEL` 2, `TALENT` 1.

### Departures from the ask, and why

- **"2 small skill points"** → two small exp books. *Skill points* would collide with **talent points**,
  which is what a level-up already awards and what the skill tree already spends. D9 calls them
  experience points, which is what they actually give.
- **D9 wording.** "Hammer allows you to collect…" had a bare noun as subject, and strictly the hammer
  does not collect anything — the sword's travel does, and hammering drives it. The owner chose
  "Hammering also allows you to collect experience points scattered all over the map. Collect them to
  level up."
- **D7 got an arrow** as well as the glow that was asked for, matching D4 and D6. The line names two
  objects (hammer, anvil) and the arrow is what joins them.

### Verification

Full run on hit-tested input, `tick()` driven by hand (a hidden pane freezes `rAF`): D1→D9 in order,
`SAY_SEQ` nine long. At the freeze, `elementFromPoint` over the anvil returns `tutDim` and over the
bubble returns `dragonSayText` — the dim is genuinely on top of the game and genuinely under the
dialogue, at the frame's full 1080×600. After the click the sword resumes, takes both books, and runs on
to reach **Balanced** — the `?` D8 names. New Game rewinds `SAY_SEQ` to D1–D3, clears the dim, the
strike beat, the books and the exp; a second run re-places both books at the same two points. Console
clean.

---

## r86 — D10–D12: the quench, the acquire popup, and a hammer that would not get out of the way

**Ask:** D10 on reaching the `?`, D11 pointing the mug at the metal, a popup naming the trait with its
icon and a continue button, then D12 "Click on the metal to select the shape of the sword blade."

### The popup already existed

`#sfAcquireModal` was already built — icon, name, tier, `continue ›`. The work was a retitle, not a
build. The name moved into the heading (and out of the body, which was showing it twice) to read
**"New trait discovered — Balanced"**.

`tryAcquire` already computed `firstFind` for r73's quest counter, so the heading tells the truth: a
re-acquisition reads **"Trait locked in — Balanced"**, because nothing was discovered. Both branches
rendered through the real function; the `firstFind` computation itself is pre-existing and unchanged.

### The steps

| stage | line | pointer | raised by | cleared by |
|---|---|---|---|---|
| `quench` | D10, then D11 | arrow `#mug` → `#orb`, mug glows (with D11 only) | `checkTraitReach` | the pour |
| `acquired` | — | none | `tryAcquire` | — |
| `shape` | D12 | the metal glows | `closeAcquire` | `openShapeSelect` |

D10 explains and D11 instructs, so the arrow is hung off D11's appearance in `say()` rather than going
up with the first of the pair.

### r86b — the bug the tutorial walked into

`.dragging` is a global `z-index: 35 !important`. Every draggable prop drops the class on release —
except the hammer, whose `end` handler only cleared its own `drag` flag. So from the first time a player
picked the hammer up, it stayed pinned at 35 for the rest of the run, above the metal at 9.

Until this round that was invisible: nothing asked you to click the metal while the hammer sat on it.
D12 asks exactly that, and the metal is directly under where the hammer was just used. The tap hit
`hammerTool` and the shape picker never opened. One line: `h.classList.remove('dragging')` on release.

Caught because the check tapped through `elementFromPoint` rather than calling `openShapeSelect()`
directly — the same discipline that caught r48c and r65d, and the third time it has paid for itself.

### Verification

Full run, hit-tested throughout, `tick()` driven by hand: D1→D12 in order, `SAY_SEQ` twelve long. At
D10 the sword is on **Balanced** with exp 100 / level 2 from the two route books. D11 draws (72, 525) →
(203, 453), mug to metal, mug lit. The pour clears both and opens the popup on "New trait discovered —
Balanced", ⚖️, Weak tier (the automated hammering overshoots the alignment; a player would nudge with
the dragon). Continue → D12 with the metal lit. A tap on the metal now returns `orb` from
`elementFromPoint`, opens the shape picker on Shortsword / Longsword / Broadsword, and ends the run:
`TUT_STAGE` null, no arrow, no glow. Hammer back to z-index 8 on release. New Game rewinds to D1–D3
with every modal, glow, dim and counter clear. Console clean.

---

## r87 — the minigame's flame is aimed by holding the metal; the dragon talks, then is petted

**Ask:** in the hammering minigame, stop steering the flame by dragging the dragon's head. Press the
sword / metal ingot instead and the head turns there and breathes. Clicking the dragon shows the
tutorial dialogue; once the tutorial is over, clicking it pops hearts like the bedroom. Hammer
unchanged.

### The control

`#hmAimPad` is a transparent pad on the anvil — 30% × 28% of the stage centred on `HM_RIG.anvil`, laid
out from the rig itself so it tracks any re-rig. Press and hold aims and breathes; dragging inside it
re-aims; release stops. Identical loop to before (heat still decays, so heating and hammering still
compete for the one pointer) — only the thing you press has moved.

It sits **after `#hmGrip` in the DOM at the same z-index**, so where the hammer's very large grip pad
(53–97% × 3–69%) overlaps the anvil, aiming wins and the hammer keeps the rest. Measured:

| point (% of stage) | hits |
|---|---|
| 50,53 · 40,50 · 37,60 (the metal) | `hmAimPad` |
| 58,45 · 60,55 · 64,66 (overlap strip) | `hmAimPad` |
| 70,55 · 77,30 · 85,20 (hammer's own area) | `hmGrip` |
| 10,20 (dragon) | `hmHead` |

### Aiming: the obvious method does not work

First attempt measured the flame's live axis off `#hmSnout`/`#hmAim`, rotated by the difference and
repeated. It **diverged** — residual error 8° to 80° across six targets. The reason is in the rig: the
snout is a long way from the hinge and travels ~300px across the head's 68° range (measured: (492,150)
at −70° to (207,321) at −20°), so moving the head moves the target's bearing about as fast as the
correction closes it.

Solved instead. The rig is a rigid body, so the snout orbits `HM_RIG.pivot` at radius
`scale · |snout − tail|` and the flame's world direction is exactly `angle + fireRot`. Both were
checked against the live DOM at −70/−45/−20°: **snout to the pixel, direction to the degree.** So
`hmAimAt` scans the swing at 1° and bisects the best bracket, in pure arithmetic — no layout reads, so
a pointermove costs no reflow.

**Residual error at six targets across the pad: 0.000° every time**, measured from the DOM rather than
from the model that set it.

### Consequence, deliberate

Aiming *at* the metal means `hmFireOnWork()` effectively always passes. The aiming difficulty is gone;
what is left is that you cannot heat and hammer at once. That is the point of the change, but it does
mean the minigame is now easier, and `HM_FORGE.cone` / `reach` no longer do much work.

### The dragon: guide, then pet

`dragonTap(e, layer)` replaces the bare `sayAgain()` on both dragons. While the script still has
something to say it replays the last line; afterwards it calls `popHearts` into whichever layer it was
given — `#screenLayer` on the bench, `#hmScene` in the minigame.

"Afterwards" is **the last line in `DIALOGUE` having been shown** (`lastLine()` is simply the final key,
so this moves on its own as D13, D14… are written — there is no flag to remember to update). `tutReset`
clears it, so a new game gets the guide back.

Inside the minigame the bubble would be behind a z-1000 panel, so `sayLayout` now picks its anchor
(`#hmHead` vs `#dragon`) and its clamp box (`#hmScene` vs the frame) from whether the hammer modal is
open, and adds `.above` (z-index 1100). Position stays relative to `#bench`, which owns the element.

### r87b — two bugs found in verification

- **The bench dragon's tap handler takes no event.** `const end=()=>{…}` was fine for `sayAgain()`; the
  new `dragonTap(e, …)` threw `ReferenceError: e is not defined`, so tapping the bench dragon did
  nothing at all. Caught because the check exercised *both* dragons, not just the one the round was
  about. `popHearts` also now tolerates a missing event (a `pointercancel` reaches the handler without
  coordinates) and bursts from the layer's middle.
- Console still showed that error on the next load: it was stamped with the **previous** URL. Worth
  re-reading — the pane retains errors across loads and they read as current.

### Verification

Minigame: press at six points across the pad → six different head angles, flame on, on-target, 0.000°
error each; heat 0 → 0.997 in 1.5s while held; release stops the flame. Hammer unchanged — grip still
drags, `striking` still sets, one strike moves progress 0 → 0.14. Dragon head during the tutorial →
bubble at z-index 1100, inside the scene, `elementFromPoint` at its centre returns the bubble's own
text. After the last line → 6 hearts in the scene, no bubble. Bench dragon: talks during, 6 hearts
after, guide restored by New Game. Bubble on the bench still lands inside the frame (109, 15, 407×181).
Console clean on the current load.

---

## r88 — the quench mug ends the minigame, a cancel backs out of it, and D13–D16

**Ask:** four minigame lines; a water mug on the right that finishes the blade when splashed on it,
usable only once the blade has taken its shape; a cancel button bottom-left.

### The mug replaces the automatic finish

The minigame used to finish **itself**: 1.7s after the last strike, `finishBlade()` fired on a timer.
That had to go, or the mug would never get a chance — the panel would close while the player was still
reaching for it. Now `hmProg>=2` only lights the mug.

`#hmMug` sits at 86%/54% of the stage, dimmed and inert (`.off`, `cursor:not-allowed`) until the blade
is shaped, then pulses (`.ready`). Dragging it over the anvil pours: heat to 0, a flash, a ring and
seven steam puffs, then `finishBlade()` 780ms later. Verified that a drag while unshaped moves it **0
px** — the guard is on `pointerdown`, so it never even picks up.

### Cancel

Bottom-left, inside the HUD bar so it cannot collide with the title. **It does not destroy the blade.**
The bench is untouched while the minigame runs — the metal and its traits are still on the anvil — so
cancelling is just closing the panel, and the player can tap the metal again and pick a different
shape. Only the shaping progress of that session is lost.

### The lines

| line | fires on |
|---|---|
| D13, then D14 on a click | opening the minigame |
| D15 | heat crossing `workMin` (0.35) upward, first time |
| D16 | heat crossing back below it, once |

D16 is currently the last line in `DIALOGUE`, so showing it is what flips the dragon from guide to pet
(r87's rule). Both crossings hang off the check `hmTick` already made for its own HUD line.

### Three things verification caught

- **The mug rendered at 794×785px.** `#hmMug` had no width, so once `anchor_mug.png` loaded the box
  took the image's natural size and swallowed most of the scene — and the hit test, which measures the
  mug's centre, was therefore hundreds of pixels off and never registered. The first measurement said
  17.5% only because it was taken before the image loaded. Fixed with an explicit `width: 11%`.
- **`hint()` has been a no-op since r34.** The cancel's "the metal is still on the anvil" message went
  nowhere. Switched to `toast()`, which renders. Worth noting separately: **19 `hint()` calls** remain
  in the file, all silent — including r83's "Still heating — keep pumping the bellows", which is the
  only feedback a player gets for tapping a cold gate.
- **A strike gate that is real-time.** 20 scripted strikes produced one hit: `HM_FORGE.strikeGap` is
  170 **ms of wall clock**, and synthetic strikes all landed in the same millisecond. A test artefact,
  not a bug — but it would have read as "hammering is broken" if taken at face value.

### Verification

Full minigame run on hit-tested input: D13 on open → D14 on click; mug inert while unshaped; holding
the metal raises heat to 0.365 and fires D15 exactly at the 0.35 crossing; cooling back through it
fires D16 and sets `tutOver()`; 22 spaced heat-and-strike cycles take `hmProg` to 2, at which point the
mug loses `.off`, gains `.ready` and the HUD reads "Blade shaped — splash it with the mug to finish"
**with the panel still open and no sword forged**. Dragging the mug in registers over the work at step
9 of 14, pours, and 780ms later closes the panel with a Longsword in the inventory and +5 exp. Cancel
closes the panel, stops the flame, forges nothing and toasts. New Game clears both minigame flags and
rewinds the run. Console clean on the current load.

---

## r89 — D16 fired after the blade was finished, because half the heat changes were unwatched

**Report:** "d16 currently appears after the shape is forged. I want it to appear after the very first
time it is cold."

**Cause.** The heat crosses `HM_FORGE.workMin` in two places, and only one was watched:

1. `hmTick`, where it decays — this compared the heat before and after the frame, and was the only
   place the tutorial heard about;
2. `hmStrike`, which takes `strikeBite` (0.09) straight out of the heat and told nobody.

A strike that carried the heat from 0.40 to 0.31 therefore crossed the line silently, and by the next
frame both sides of the tick's comparison were already below it — the crossing no longer existed to be
found. In real play striking is exactly how the heat comes down, so D16 sat unfired until some later
decay-driven crossing, long after the blade was done.

**Fix.** One watcher, `hmHeatWatch()`, holding the workable/not-workable state (`HM_WASHOT`) and called
after **every** heat change — the tick and the strike both report through it. It also owns the HUD line
that used to hang off the tick's inline comparison, so the two can no longer disagree. The deliberate
final quench is excluded (`hmQuenching`): zeroing the heat to finish a blade is not "it went cold, heat
it again".

**Why my own verification missed it.** r88's check let the metal cool by *sitting still*, which is the
decay path — the one branch that worked. The player's path is to hammer. A check that exercises the
mechanism by the route the player will not take can pass on a broken build.

**Verification.** Heat once to 0.997, then hammer without re-heating: D16 lands on strike 7 as the heat
goes 0.415 → 0.318, with `hmProg` at 0.98 of 2 — mid-shaping, as asked. Opposite case: keeping the
metal hot the whole way and finishing with the mug forges the sword with D16 never fired and
`TUT_HMCOLD` still false. Console clean.

---

## r90 — D17 and the Sword Crafted window

**Ask:** D17 guiding the splash; on splashing, the minigame closes and a window shows the crafted sword
— "Sword Crafted!", a preview, quality, shape, value, ores used, trait, and a close button. The sword
flies from the preview into the inventory. Every craft path uses it, manual or recipe; a bulk craft
sends five swords flying.

### The window

`#sfCraftModal`, built on the same shell as the acquire popup. The blade is drawn with the same
`flatArt` + `sizeFlat` pair the racks use, so a sword is rendered one way everywhere in the build.

| row | source |
|---|---|
| Quality | `swordBestTier` — the best tier among the sword's traits, in that tier's colour |
| Shape | `w.shape` |
| Value | `swordPrice` — the **sale price**, popularity and reputation included, so it matches what the counter quotes. Bulk shows "24 g each · 120 g total" |
| Ores used | `tallyText` over the sword's own ore list — "Iron x2 + Manganese x2" |
| Trait(s) | symbol, name and tier per trait, tier-coloured |

Bulk adds a `×5` badge over the preview.

**The swords are in `INV` before the window opens.** The flight on close is decoration and never the
thing that stores them — the r68b rule, so a throttled or dropped animation cannot cost the player a
sword. Five blades leave in a fanned spread (measured 577/593/609/625/641) with a 95ms stagger and are
removed on a timer.

### Both craft paths, and when the bench resets

`finishBlade` and `cbCraft`'s shape callback both end in `showCraft`. The old `#forgeResult` banner and
its `setTimeout(resetRun, 2600)` are gone: with a window that waits for a click, a timed reset would
wipe the bench underneath it. `finishBlade` now passes `resetRun` as the window's `after`, so the bench
clears exactly when the player closes. Verified: with the window open the bench still holds `melt` and
4 segments; after close, both are clear.

### The bug: transparent art swallowing clicks

The part images are full-canvas squares with the blade running along the diagonal, so at the size that
makes the *blade* fill the row, the square's corners reach 79px above the card and over the title. They
are invisible but they hit-test: `elementFromPoint` over the title and the first row both returned
`IMG`. The close button escaped only by where the geometry happened to fall — a longer blade would have
covered it too, which is a dead-ended window.

Fixed with `pointer-events: none` on `.cr-art` and its children; nothing in there is interactive.
Re-measured: title and close button both return their own elements.

### Verification

Full manual craft through the whole tutorial: window opens on the splash reading Weak / Longsword /
24 g / Iron x2 + Manganese x2 / ⚖️ Balanced · Weak, with the hammer panel closed and the bench still
loaded. Close → one sword flies from (609, 282) toward the SWORDS tab at (1075, 202), the bench resets,
the inventory holds it and the SWORDS tab is showing, no leftover fliers. Recipe path, Craft 5 → one
window with the `×5` badge and "24 g each · 120 g total", 5 fliers, 6 swords banked, 10 iron and 10
manganese spent from 20 each. D17 fires as the blade reaches full shape and sets `tutOver()`. Console
clean on the current load.

---

## r91 — the counter tutorial (documented retroactively), four fixes, and one asset set per trait

### What landed on 2026-09-17

A round by another agent went in without a section here, so it is recorded now from the diff and from
playing it. `specs/2026-09-15-…-tutorial-script.md` already carries the copy.

- **D18–D26, the counter and Bram branch.** D18 on closing the first Sword Crafted window, with an
  arrow at `#panLeft`; D19 on arriving at the counter, spoken from a new counter-side dragon
  (`#screenDragon` / `#screenDragonSay`, draggable, tap-to-talk); then Bram: D20, a two-way response
  (D21/D22), D23–D24 for the first sale, D25 from Bram and D26 to close. New `chooseBram`, `takeCare`,
  `wireScreenDragon`, `updateTutorialCounterUi`, and `TUT_BRAM_STATE`.
- **An encoding repair.** The file had become mojibake — `â€”` for `—`, `Ã—` for `×`, `0â†’1` for
  `0→1` — plus a BOM. The corruption appeared after r90 and was repaired in the same session; the
  current file is clean (0 mojibake markers, no BOM, emoji intact). Almost certainly a tool reading
  UTF-8 as the ANSI codepage and writing it back, which is the trap the PowerShell tooling notes call
  out.
- **`cbCraft` hardened** — `n` is coerced with `Math.max(1, Math.floor(Number(n)||1))` and the recipe's
  ores/grinds/traits are hoisted out of the loop. This is what fixed Craft 5.

Verified end to end: SELL is visible but disabled until the sword is placed, DENY stays disabled,
placing enables SELL and fires D24, the sale pays exactly once (24g, +1 rep, +5 exp, one ledger row),
and New Game clears the whole branch.

### The four fixes

1. **`lastLine()` was hardcoded to `'D19'`** — see the tutorial script spec. Restored to the final key
   of `DIALOGUE`, so the dragon guides through D26 and the switch needs no maintenance.
2. **The tutorial script spec contradicted the code** on that point, and named D12 as the last line.
   Corrected, with the regression recorded.
3. **This file had no section for the 2026-09-17 round.** Written above.
4. **Working files left in the repo root** — two ~380KB `.bak` copies and `__bram_apply.patch`, none of
   them ignored. Deleted, and `.gitignore` now carries `*.bak` and `__*.patch`.

### One asset set per trait

The Design Desk was showing every trait's parts in one list (`DD_PARTS` mixed `grip1`, `flame_grip1`,
`ice_grip1`, `water_grip1`), so a sword could wear a pick-and-mix. It now shows **only the set belonging
to the sword being designed**.

| trait | prefix | grips | guards | pommels | blades |
|---|---|---|---|---|---|
| — (default) | *(none)* | 4 | 4 | 5 | all 10 shapes |
| fire | **flame_** | 3 | 5 | 2 | broadsword, longsword, shortsword |
| swift | swift_ | 5 | 5 | 5 | dagger, longsword, shortsword |
| ice | ice_ | 1 | 1 | 1 | longsword |
| water | water_ | 1 | 1 | 1 | longsword |

`fire` is the one trait whose art is not named after it — the files are `flame_*`. Every other trait,
and a sword with no traits, falls back to the unprefixed **balanced** set, which is the owner's
placeholder default.

- `skinOf(w)` takes the first of a sword's traits that has a set; `ddSkin()` reads it off whatever the
  desk is editing.
- `ddCoerce(sel, skin)` drops a pick that does not exist in the new set back to that set's first part,
  so the desk can never open on a part the sword cannot wear.
- `bladeFor(skin, shape)` uses the skinned blade when the art exists and the balanced blade otherwise.
  **A swift Broadsword is the one visible seam today**: swift grip, guard and pommel on a balanced
  broadsword blade, because `swift_broadsword_blade.png` does not exist.
- Both craft paths (`finishBlade`, `cbCraft`) stamp the skin onto the sword at creation.

### Verification

`lastLine()` → D26 over 26 keys. Desk probed against a real `WORK` sword per trait: fire shows only the
5 flame parts, swift only the 15 swift parts, ice its 3, and `heavy` (no art) and a traitless sword both
fall back to balanced — with `DD_SEL` coerced into the right set every time. All **59** asset paths the
tables can produce were checked against the filesystem: none missing. Six swords crafted through the
real recipe path came out wearing their own trait's parts, the swift Broadsword correctly falling back
to the balanced blade alone. Tapping the dragon replays at D19/D23/D24 and pets at D26. Console clean.

---

## r92 — the Sword Crafted window stands alone

**Ask:** the dragon's dialogue should be off while the crafted-sword window is on screen; the next line
comes in only on **close**.

`showCraft()` now calls `sayHide()`. D18 already fired from the window's close callback, so nothing
about the ordering changed — only that D17 no longer sits over the result. `SAY_LAST` is untouched, so
tapping the dragon afterwards still brings the line back.

**A second thing the screenshot showed.** The bubble was sitting *over* the window rather than behind
it, because r87's `.above` class (z-index 1100, which lets the bubble clear the hammer panel) was still
on it. The class was only ever cleared by the next `sayLayout`, so a bubble left showing when the
hammer panel closed kept the raised level and floated over every later modal. `sayHide()` now drops
`above` along with `show`.

**Verification.** Straight after the splash, D17 is up with `above: true` — matching the reported
screenshot. The instant the window opens the bubble is `display: none` with both classes cleared, and
`SAY_LAST` is still D17. Clicking close brings D18 in at the normal level with its arrow up, one sword
banked. Console clean.

---

## r93 — the opening screen: card closed, dragon in the corner, bubble beside his face

**Ask:** start with the recipe collapsible box closed, the dragon in the top-left corner, and the
dialogue off his face — on his right.

### The recipe card

`#bladePanel` is the card holding RECIPE BOOK (and the ✕ / 💾 blade buttons); `#hudToggle` opens and
closes it through `#hud.collapsed`. `#hud` now carries `collapsed` in the markup and the toggle ships
in its closed state (`▼`, `aria-expanded="false"`), so the toggle's glyph and the panel can never
disagree on the first frame.

### The dragon

`LAYOUT.landscape.dragon.y` is a fraction of the **bench** height, and the bench sits at y 477 of the
600-tall frame with a height of 123 — so `-2.718` put his box top at 144, a third of the way down the
map rather than in the corner. Now **−3.683**, which puts it at 24.

Not 12: his box is 195 wide and takes the pointer across all of it, transparent corners included, so a
higher home would have parked it over the collapse toggle at y 1–21 and swallowed the clicks.
Confirmed after the move — `elementFromPoint` on the toggle still returns `hudToggle`.

### The bubble

Speaking from above needs headroom the corner does not have; clamped to the frame, the box landed on
his face. On the bench the bubble now sits **beside** him when the line fits there
(`dr.right - 6 + w + 10 <= fr.right`), and the tail turns to point left at his head, positioned down
the bubble's own edge by `--tailY`. Where it does not fit, the old above-and-left placement and the
downward tail are used unchanged — as they still are inside the hammer panel and at the counter, which
this does not touch.

| dragon at | bubble | tail | head covered |
|---|---|---|---|
| home, top-left corner | (200, 19) | left | no |
| dragged low-left | (206, 407) | left | no |
| dragged far right | (427, 315) | down (fallback) | no |

In all three the bubble stays inside the frame.

### Verification

Fresh load: recipe card `display:none`, hud collapsed, toggle reads `▼` and still hit-tests to itself;
dragon box at (12, 26); bubble at (206, 28) with `tail-left` and `--tailY: 37px`; the head point
(133, 72) is outside the bubble. Clicking the toggle opens the card and RECIPE BOOK is reachable again.
D1→D5 still walk in order after a New Game. Console clean.

---

## r94 — the dialogue box, 25% smaller

Every dimension of both bubbles scaled by 0.75, not just the frame — otherwise the type would have
grown relative to the box.

| | before | after |
|---|---|---|
| width | 420px | 315px |
| padding | 15/20/18 | 11/15/14 |
| radius | 14px | 11px |
| body text | 23px | 17px |
| speaker label | 12px | 9px |
| "click to…" | 11px | 8px |
| down-tail | 21/18, bottom −21 | 16/14, bottom −16 |
| side-tail (r93) | 15/20, left −20 | 11/15, left −15 |

`#screenDragonSay` (the counter bubble the Bram branch uses) carries the same geometry and was scaled
with it, so the two cannot drift apart.

`sayLayout`'s pre-measurement fallbacks went with them — `offsetWidth||420` → `||315` and
`offsetHeight||110` → `||83`. Left alone they would have placed the box by the old size on the frame
before it has been measured.

**Verification.** Rendered box 306×137 against the previous 420×187 — 0.73 on both axes rather than an
exact 0.75, because the height follows where the text wraps rather than scaling cleanly. **All 26
lines** were shown in turn: none clipped horizontally or vertically, all inside the frame, the tallest
being D1 at 315×141. The bubble still sits beside the dragon with the left tail and his head clear.
Console clean.

---

## r95 — the counter dragon speaks from the side, the customer types, and his last button leaves with him

### Same placement on both screens

r93 gave the bench dragon a beside-placement with a left-pointing tail, but excluded the counter
(`!inHm && !onScreen`). The exclusion is gone and `#screenDragonSay` carries the same `tail-left`
rules, so a dragon reads the same wherever the player meets him. Measured on the counter: dragon box
(27, 310, 248×224), bubble (274, 324), `tail-left` on, `--tailY: 37px`, head clear.

The hammer panel still uses the above-placement — its head sits at the top-left of its own scene with
the panel's full width to the right, and it was already correct.

### The customer types

`typeLine(el, text)` reveals a line **one word at a time** at `TYPE_MS` = 70ms, so Bram's longest line
lands in about a second. `typeDone()` jumps to the finished text and is wired to a click on his
dialogue box, and to choosing a response (which would otherwise type a new line over an unfinished
one). `typeStop()` is called by `takeCare` and `tutReset`, so a pending timer can never write into a
screen that has moved on.

Only the **customer** types. The dragon's bubble is instructional and reads better all at once; it also
walks a sequence on click, which a per-word reveal would fight.

### The Take care box

The sale borrows the counter's own `.cs-resp` box — it sets the text to "Take care", shows it and
hangs `takeCare` on it. `takeCare` hid Bram's panel but never put that box back, so the button stayed
on screen after he left, still holding his handler. It now hides the box, clears the handler and
restores the placeholder copy; `tutReset` does the same, so New Game cannot inherit it either.

### Verification

Full tutorial run to the counter. D20 sampled while typing: 1 → 3 → 5 → 6 → 8 → 10 → 12 → 13 → 15
words, settling on exactly `DIALOGUE.D20`; D21 and D25 likewise (`"A blacksmith?"` and `"Thanks! If"`
caught mid-type, both settling on the full line). After Take care: box `display: none`, not visible, no
handler, text back to the placeholder, Bram's panel gone, D26 up in the counter bubble with the side
tail. New Game leaves the box with its placeholder text, no handler and no inline display. Console
clean.

---

## r96 — the counter bell, D27–D31, and customers who ask for a trait

### The bell

`assets/forge/bell.png` (898×1048, art edge to edge, so its `PROP_BOX` is the whole canvas) sits at
plate **l 72.0, w 5.2, b 96.5** — on the counter, at the right-hand end of the table the player can
actually see. The rail covers the plate from **79%** across, so 72% is the right corner on screen even
though the plate itself runs to 100%. The table's top edge measures 82.83%, and the bell's box lands at
85.8–96.7%, sitting on it.

It is a prop with `act:'bell'`, so it gets the existing hover sheen and pointer for free. Ringing it
swings the bell about its crown (`transform-origin: 50% 18%`) and sends three expanding rings out.

**r96b — the ring was being wiped.** Whoever answers the bell calls `buildScreenProps`, which empties
the prop layer; the shaking bell was replaced a frame after the class went on, and the ripples, parented
to that same layer, went with it. The ripples now live on `#screenLayer`, which survives a rebuild, and
`ringBell` rings **after** the arrival rather than before it.

### The customer pool

The counter no longer has a customer as a fixture — `man1` was a static prop and is now placed by
`CUSTOMER`, so an unrung counter is empty. All seven portraits share one 304×572 canvas and each got a
measured `PROP_BOX`.

A summoned customer asks for a trait: **80% from traits the player has discovered, 20% from those still
unfound**, phrased through one of four templates. Whichever pool is empty, the other one answers, so a
fresh save still works. Measured over 400 draws: **81.3%** discovered, all seven portraits appearing
roughly evenly. The bell refuses to stack a second customer on the first, and a sale clears `CUSTOMER`
so the next ring works.

**Not built:** customers arriving on their own, and any consequence for the request. The sale still pays
for whatever sword is on the counter, whether or not it matches what was asked for — matching, refusal,
patience and price effects are a customer system, not a bell.

### The lines

D26 now opens a run of three (D26, D27, D28). Showing **D27** places the bell and lights it; **D28**
waits for the tap; ringing brings man1, who speaks **D29** typed in his own panel; **D30** fires when
that line lands, and **D31** points at the right-hand screen arrow, which clears on arrival at the
forge. D31 is the last key in `DIALOGUE`, so the dragon turns to a pet exactly there.

### Verification

D26 → D27 (bell appears, glowing) → D28, all in the counter bubble. A hit-tested click on the bell:
shake class on and 3 ripples alive 140ms later, both gone by 1.6s; man1 on screen; D29 typed to exactly
`DIALOGUE.D29`; D30 on completion; D31 with the arrow at `#panRight`; clicking it lands on the forge
with the arrow cleared and `tutOver()` true. Post-tutorial rings produce lines like "Do you have a Swift
sword?" and "I hear you make a fine blade. A Fire one, if you can." Console clean.

---

## r97 — the second customer was speaking into a hidden box

**Report:** "the second customer's dialogues are not showing."

**Cause.** Bram's intro hides the counter's own furniture so his panel can stand alone:

```
if(old) old.style.display='none';                       /* #csPanel .cs-dlg  */
document.querySelectorAll('#csPanel > .cs-btn').forEach(x=>x.style.display='none');
```

Nothing ever put them back. `takeCare` dismissed Bram and handed the counter to normal play with
`.cs-dlg` still at `display:none`, so r96's customer typed D29 into an element that was in the DOM and
invisible on screen — 158 characters, zero height.

**Fix.** `takeCare` restores the dialogue box and the SELL/DENY buttons (cleared of the `disabled` flag
the Bram flow set). The response box stays hidden deliberately — r95's ask — and will need unhiding when
generic customers get responses of their own. `custLine` also unhides whatever box it is about to write
into, so no future path can silently swallow a customer's words.

**Why r96's verification missed it.** The check asserted on `p.textContent`, which returns the text
whether or not anything is on screen. Content is not visibility. The check now also asserts
`offsetParent !== null`, a non-zero box, containment in the frame, and that `elementFromPoint` at the
line's centre returns the line itself rather than something covering it.

**Verification.** Replaying the exact hide Bram's intro performs, then `takeCare`: `.cs-dlg` back to
`flex`, SELL visible and enabled, response box still hidden. Ringing the bell: D29 matches
`DIALOGUE.D29` exactly, box 192px tall, `offsetParent` set, inside the frame, hit-testing to its own
`<p>`; D30 follows. Confirmed on screen in a screenshot. Console clean.

---

## r98 — the counter panel follows the customer, and the dragon waits his turn

Three reports off one pair of screenshots.

### The counter's panel belongs to a customer, not to the tutorial

r97 restored `.cs-dlg` and SELL/DENY the moment Bram left, which is the over-correction the second
screenshot caught: a placeholder line — *"I need a blade by sundown, smith"* — and two buttons sitting on
an empty counter with nobody there.

`counterUi()` now decides from state: the dialogue box and the buttons show when `CUSTOMER` is set and
hide when it is not. It is called on Bram's exit, on a customer arriving (bell or script), on a sale,
and on entering the counter screen. The Bram run has its own panel and drives these itself, so
`counterUi` leaves it alone while he is there. The response box stays hidden throughout — r95's ask.

### The sell instruction goes when the sale does

D24 is *"Tap the sell button to confirm the trade."* It was still on screen after the trade, next to
Bram thanking the player for it. The sale branch now calls `sayHide()`.

### The dragon speaks after the customer, not over him

`custLine()` — every customer line goes through it — now hides the dragon's bubble as the customer
starts talking, and Bram's lines were routed through it. `chooseBram` had `say('D23')` on the same line
as the state change, firing it over Bram's reply; it is now deferred with `typeAfter`, and the
immediate call removed so D23 cannot fire twice.

### Verification

Bram run driven from `finishD19`: choosing a response leaves the dragon's bubble hidden and empty while
D21 types, and D23 appears only once the line has landed. Placing the sword raises D24; clicking SELL
hides it the same tick while Bram begins D25. After Take care, the dialogue box, SELL, DENY and the
response box are all `display:none` with `offsetParent` null, and only D26 is on screen. Ringing the
bell brings them back — box and SELL visible, the customer typing, the dragon silent — and D30 follows
once the line completes. Console clean.

---

## r99 — D32–D38, the what-if path, and a wheel that has to be turned

### The wheel

Grinding was a **hold**: `pointerdown` set `pestleGrinding` and the tick advanced `prep.grind` by
`GRIND_RATE * dt` for as long as the button was down. It is now driven by the **angle swept** around the
wheel's centre, either direction, at `GRIND_TURNS` (2) full turns for a complete grind. A still hand
grinds nothing; the wheel's spin class is held on a 140ms idle timer so it coasts to a stop when the
hand does, and the spark burst moved out of the tick and onto the sweep.

Measured: ten stationary pointermoves over 400ms leave the grind at **0**; one clockwise turn gives
**0.5**; a second, anticlockwise, gives **1.0**.

The pestle's own time-based path is left alone — it is vestigial and hidden in landscape, and it is the
portrait build's mechanism.

### The what-if path

A second `<path>` (`#fakepath`) drawn from the same ore curves as the real route, with each raw ore
covering half its own path (`tPct 0.5`), blinking on a 1.05s cycle. It borrows the route's ✕ for its
endpoint — the owner's sketch ends it that way, and nothing is on the bench at that moment to want the
mark. Raised by **D33**, cleared with its ✕ by **D35**. No state reads it.

### The chapter

Arriving at the forge after D31 sets the stock to exactly 1 iron and 1 manganese and opens D32–D35 as
one run. Then it waits on the player at each step: a **full** grind (1.0, not merely ground) raises D36;
the ground iron entering the smelter raises D37; the ground manganese raises D38.

`addPrep` now reports what went in — it captured neither the ore nor the grind before clearing `prep`,
so the two load steps had nothing to key on.

### Verification

Whole chapter on hit-tested input: arrival gives Iron x1 / Manganese x1 on the shelf and D32; D33 shows
the path (369-character `d`) and its ✕ at (1259, 1025); D34 holds it; D35 clears both and arms the
grind. Wheel as measured above. Full iron → D36; iron into the smelter → D37 with the route at
`iron@1.00`; manganese ground and loaded → D38 with the route `iron@1.00, manganese@1.00` ending at
**(1119, 1018)** against Balanced at **(1120, 1020)** — so D38's claim is true, not flavour. Console
clean.

---

## r100 — D39–D43, idle guidance, the Craft Book, and "record new"

- **Cooldowns halved, both of them**: `HEAT_DECAY` 10 → 5 (full heat now drains in 20s, not 10) and
  `HM_FORGE.heatCool` 0.07 → 0.035.
- **Recipe book → Craft Book** everywhere the player can read it: the rail button, both screen buttons,
  and the two toasts.
- **The 💾 button is now `💾 RECORD CRAFT`** on its own full-width row, because D42 tells the player to
  tap something by that name. The ✕ keeps the row above it.
- **Record new** (`recordNewComp`) writes a second page instead of replacing. `RECIPES` is keyed by the
  trait set, so a duplicate needs its own key — `balanced`, then `balanced#2`. The name still resolves,
  because it is read off the record's own trait list, not the key.
- **The shape picker refuses to open** while the record step is live, with a toast naming the button.
- **Idle guidance**: the build already had a 4-second idle timer (`HINT_IDLE_MS`, `lastActAt`). The
  second run hangs an arrow resolver off it — one function that answers "what now?" from the live state
  rather than a script, so it stays right if the player wanders. `noteAction` clears the arrow.

### Two bugs found in verification

**A knife-edge equality.** `tutGrindCheck` waited for `prep.grind >= 1`. The grind is a running float
sum, so a player who lands exactly on the final increment sits at 0.9999999999999999 — which
`Math.min(1, x)` never rounds up, and the step waits forever. r99's verification passed on the same
edge **by luck**; this run hit the other side of it and D36 never fired. Now `>= 0.999`, matching the
tolerance the smelter check already used.

**The dragon was eating the blade panel.** r93 moved him into the top-left corner, where his box
(12, 26, 195×175) overlaps the open panel (6, 1, 142×199) — and his box takes the pointer across its
transparent parts. He is z-index 30, the panel 20, so with the panel open he swallowed RECORD CRAFT and
CRAFT BOOK. r93 checked only that he cleared the **collapse toggle**, because the panel starts closed;
this round is the first thing to ask the player to open it. `#frame.landscape > #hud` is now z-index 31:
the panel is UI and wins where they overlap, and he is still above the map and bench everywhere else.

### Verification

Second run end to end on hit-tested input: D32→D38 as before, then D39 and D40 on clicks; the idle arrow
appears at every stage (wheel, smelter, bellows, gate, anvil, hammer, mug) and clears on interaction;
D41 at heat 70; hammering reaches **Balanced**; the pour gives D42 and stage `record`. Tapping the metal
there is refused with a toast and the picker stays shut. With the panel open all four of its controls
hit-test to themselves, and the dragon is still grabbable outside it. RECORD CRAFT opens the window with
D43; **Record new** leaves `['balanced', 'balanced#2']` and selects the new page; **Update** leaves
`['balanced']`. Both clear the stage and unblock the picker. Console clean.

---

## r101 — the ore leaves the shelf at the wheel, and three pointers corrected

### The shelf counts what you still have

An ore was spent at the **smelter**, not at the wheel — so an ore sitting on the grinding wheel was
still counted on the shelf. Once it is on the wheel it is committed (nothing puts it back), so the count
was simply wrong. `startPrep` now spends it, and `addPrep` no longer spends it a second time.

That second half matters: `addPrep` also guarded on `oreLeft(prep.ore)`, so spending at the wheel
without removing that guard would have made the smelter **refuse the last ore of a kind** — the count
being zero is exactly the state you are in after putting it on the wheel. Verified: iron goes to x0 at
the wheel, the smelter still accepts it, and the stock stays at 0 rather than going negative.

### "Turn it" is drawn as a turn

With the ore already on the wheel, another straight line from the shelf says nothing. `#tutSpin` is an
open ring with the same arrowhead, rotating over the wheel, sized to 78% of it. Measured centre
(725, 474) against a wheel centre of (724.5, 473). The straight shelf→wheel arrow is now only for
fetching the ore; every nudge branch sets the turn arrow explicitly so it cannot be left behind.

### Two pointers at the record step

- **The white down-arrow pointed at a blocked tap.** `hintDownWanted` fires on "trait banked, on the
  anvil, idle" — precisely the D42 state — and points at the metal to shape it, which the record step
  refuses. It now returns false during `record`.
- **The arrow to the panel toggle was invisible.** The toggle sits at (6, 4) and the arrow started at
  `oy: -62` — above the frame, which clips. It now approaches from below-right (`ox: 128, oy: 104`),
  measured fully inside the frame at (37, 25, 106×86). The save-button arrow keeps its old offset,
  which was already inside.

### Verification

Iron x1 → x0 the moment it lands on the wheel, with the turn arrow centred on it and the straight arrow
off; two turns and a drag put it in the smelter with the stock still 0 and D37 firing; manganese the
same, ending D38. At the record step with the panel closed: no down-arrow, no hint arrow, and the
toggle arrow fully inside the frame; with it open the arrow moves to RECORD CRAFT, still inside.
Confirmed in screenshots. Console clean.

---

## r102 — D44–D47: the second craft is shaped, and the copy says "tap"

Owner-supplied beat (2026-09-18), taken from Figma and checked line by line before implementing. It
picks up where r100 stopped: the composition has just been recorded, and the second sword still has to
be shaped, hammered and quenched.

### The four new lines

| id | line | fires |
| --- | --- | --- |
| **D44** | "Tap on the metal to select a shape." | the moment the craft is recorded (`tutRecorded`) |
| **D45** | "You remember what to do, right? Go ahead, I'm ready!" | the hammering minigame opening for the second time |
| **D46** | "Tell me where to FIRE, and hammer the blade." | 4 s idle inside the minigame, before the mug is live |
| **D47** | "Splash water to cool the blade and finish crafting." | 4 s idle once the mug is live, with a pointer at the mug |

Wording corrected with the owner before writing: the tag question took a comma
("what to do, right?"); `FIRE` is capitalised to agree with **D16**, which already says "Tell me where
to FIRE!"; the mug line got sentence case, a full stop, and "and finish crafting" so it does not clash
with **D10** ("lock it in") and **D17** ("to finish"); "blade" was kept over "metal" on the owner's
call, even though the art is still at the mid-blade stage.

### The second hammering run teaches nothing up front

D13–D17 explained the minigame during the first craft and are all one-shot (`TUT_HMHOT`, `TUT_HMCOLD`,
`TUT_SAIDMUG`), so they cannot repeat. The second run therefore speaks **only when the player stalls**.
`tutHm2Idle()` runs from `hmTick` and fires on two clocks, both `HINT_IDLE_MS` (4000 ms): time since the
last player action, and time since the last prompt. So the line **re-fires on every further 4 s of
inactivity**, per the owner, but cannot repeat while the player is doing anything. Any interaction
clears the pointer through `noteAction`, which now covers the `forge2` stage.

`TUT_HM2` is a flag, not a stage, because the shape picker and the minigame each clear the stage on
their own; the flag is what tells `tutHmStep` to say D45 instead of re-running D13.

### The arrow had to be lifted over the modal

`#tutArrow` sits at `z-index: 70` and the hammer modal at `1000`, so the mug pointer drew *underneath*
the minigame. It now takes an `.above` class at `1090` while pointing at the mug — just under the
dialogue bubble's own `1100`, which r87 had already solved the same way. Measured: the arrow runs from
`#hmMug` to `#hmWork` and is visible over the scene.

### D47 is optional, so it cannot own the guide-to-pet switch

`say()` sets `TUT_SEEN_END` when the id equals `lastLine()`, and `lastLine()` is now **D47** — a line an
attentive player never sees. Left alone, the dragon would stay a guide forever for anyone who does not
stall. `tutHm2Done()`, called from `finishBlade`, ends the run explicitly when the second sword is
crafted. This will stop mattering as soon as more lines land after D47, but it is correct either way.

### "Click" is gone

This is a mobile game. **D12** said "Click on the metal…" for the same action D44 now describes, and
the dialogue bubble's own affordance read "click to continue" / "click to close". All three now say
**tap**, which is what every other line in the script already used (D5, D24, D42).

### Verification

Driven in the preview at `http://localhost:5678/Swordforge_looptest_landscape.html`:
`tutRecorded()` → D44 with `#orb` glowing; opening the picker clears the pointer and keeps `TUT_HM2`;
`selectShape` → the minigame opens on `forge2` saying D45; a forced 4 s idle gives D46 with no arrow; a
second call in the same window does **not** re-fire; pushing both clocks back re-fires D46; with
`hmProg = 2` the prompt becomes D47 and draws the mug→work arrow at `z-index: 1090` over the
`z-index: 1000` modal (screenshot); `noteAction()` clears it. `Object.keys(DIALOGUE).length === 47`,
`lastLine() === "D47"`. Script body parses. Console clean.

---

## r103 — the basement beat (D48–D55), sharpening and design worth gold, and two locks broken

Owner-supplied beat (2026-09-18), checked line by line before implementing. The second sword leaves the
forge, is sharpened in the basement and is sold at the counter, which closes the guided script.

### The run

`tutBasementStep` → `tutScreenArrived('basement')` → `tutWorkPlaced` → `tutSharpOpen` →
`tutSharpGreen` → `tutSharpDone` → `tutWorkTaken` → `tutScreenArrived('forge'/'customer')` →
`tutSold2`. Every step points an arrow and every step is driven by the gameplay function that already
did the work (`placeWork`, `openSharpen`, `closeSharpen`, `takeWork`, `goScreen`, `sellCounter`), so
nothing new polls.

`TUT_SCREEN_STAGES` is the list of stages during which the dragon stands on a screen rather than at the
bench; adding a stage to it is all it takes to bring him to a new screen. `onScreenDragon()` replaces
the predicate that `say()` and `sayLayout()` each carried a private copy of.

### A third dialogue surface

The dragon cannot stand inside the sharpening panel, so `assets/ui/dragon_icon.png` speaks for him:
top-left, line to its right, advancing on a tap. This is the file HANDOFF listed as committed but
referenced nowhere. `say()` now picks between three surfaces through `sayWhere()`/`SAY_BOXES` instead of
a two-way ternary.

### Sharpening and a custom design are worth real gold

`swordValue()` summed traits and nothing else — `WORK.sharp` and `w.design` never reached the price, so
both stations were cosmetic. Now `swordPriceParts()` returns `{base, sharp, design, total}`:
**+7g** for an edge in the green band (`SH_ZONE_LO`, 80% — the same threshold D52 reacts to) and **+7g**
for a sword the player actually took through the Design Desk (`closeDesign` sets `designed`). Both are
flat and added **after** the popularity/reputation multipliers, so the sell button can print them as
separate terms, and each term is absent rather than `0g` when unearned.

The SELL button, which read the single word SELL, now reads **"Sell for 44g + 7g + 7g"**. Its width goes
8.90% → 16.50% with the aspect-ratio stretched to match (143/51 → 265/51), so the paper widens at an
unchanged rendered height and its right edge stays at 68.71%, clear of DENY. Measured at 169×33 px.

### The tutorial caps the edge at the green band

`SH_VAL` is clamped to `SH_ZONE_HI` (90.1) while `TUT_STAGE==='base-sharp'`. Without it a player who
kept grinding would sail past the band the beat is about. Outside the tutorial the cap is 100, as before.

### Two locks this beat walked straight into

- **No counter sale was possible after Bram's.** `sellCounter()` opened with `if(TUT_BRAM_SOLD) return;`,
  so from the moment Bram was served every customer the bell brought could be handed a sword but never
  sold one. It was never noticed because the scripted path had no second sale until now. Bram's own
  states still gate his scripted sale; `'done'` now means he has left and the counter is ordinary.
  Verified: with `TUT_BRAM_SOLD` true a sale pays out, where it previously paid nothing.
- **Bram's intro panel came back every visit.** `updateTutorialCounterUi` toggled it on `!!TUT_BRAM_STATE`,
  and that state ends at the truthy string `'done'` — so returning to the counter re-showed his dialogue
  and his two response buttons with no Bram behind them. `takeCare()` had hidden the panel by hand and
  the next `updateTutorialCounterUi()` undid it. Now excluded explicitly.

### Three smaller faults found by driving it

- **`#workZone` has no box until something is dragged over it**, so an arrow aimed at it drew nothing.
  `tutRect` now accepts a plain viewport rect as well as an element, and the table/counter arrows aim at
  `zoneRect()`.
- **`sayHide()` ran after `tutSharpDone()`** in `closeSharpen`, wiping the D54 it had just put up.
- **The DONE pointer was under the panel** — `#tutArrow` at z-70 against a z-1000 modal, the same trap
  r102 hit with the mug. It takes the same `.above` lift, dropped when the panel closes.

`goScreen` also redraws the arrow on the plate's `onload`, because the props it may be aiming at move
when the art decodes.

### Verification

Driven end to end in the preview: crafted → D48 with the down arrow → basement arrival shows the dragon
(`tut-dragon`) with D49 and the inventory→table arrow → `placeWork` gives D50 and the wheel arrow →
`openSharpen` gives D51 on the icon surface → the edge crossing 80 gives D52 and the DONE arrow over the
panel → DONE gives D54 with `WORK.sharp === 84` → `takeWork` gives D55 and the up arrow → forge shows the
left arrow → counter gives D23 → the sale pays **58g** (44 + 7 + 7) and ends the run
(`tutOver() === true`, stage null). `Object.keys(DIALOGUE).length === 55`, `lastLine() === "D55"`.
Screenshots of the basement, the sharpening panel and the counter. Console clean.

### Open

The sell button and the dragon's speech bubble can overlap at the counter while a line is still up; the
bubble closes on a tap, so the price is readable before the player acts. "Polishing", named by the owner
alongside sharpening and designing, has no system yet and adds nothing.

---

## r104 — the sale reaction, the adventurer, the fire route, and the cave (D56–D65)

Owner-supplied beat (2026-09-18). The sale that r103 ended the script on now continues: the customer
reacts to the price, the dragon counts the bonus, the bell brings an adventurer who wants a **fire
sword**, and the cave is stocked for it.

### Copy that quotes computed numbers

D56 ("...{g}g for your efforts.") and D57 ("We got {b}g bonus this time!") are the first lines carrying
a value the game works out. `say()` now fills `{...}` tokens from `SAY_VARS`, which `sellCounter()` sets
from `swordPriceParts()`. The owner's draft said 51g; the tutorial blade is Balanced (map value 24), so
it actually sells for **31g or 41g** depending on the tier it lands, plus the 7g sharpening — a literal
number would have been wrong nearly always. Verified: a Fine tutorial sword paid 41g and the two lines
read "41g" and "7g".

### The fire route, measured

The cave for this stage holds only iron and manganese, but the customer asks for fire. The owner's call
was that **2 fully ground iron + 2 manganese at about three quarters** should reach it, with the
manganese capped so the route cannot run past, and fire nudged "slightly up and right". Measuring the
route (`tPct = 0.5 + 0.5·grind`) put its end at:

| manganese grind | route end | note |
| --- | --- | --- |
| 100% | (838, 1006) | **inside** the `island` hazard at (839, 1011) — 5 units from its centre |
| 90% | (837, 1032) | still inside that hazard |
| 80% | (835, 1057) | clear |
| 75% | (836, 1070) | clear |
| 70% | (837, 1083) | clear |
| 60% | (847, 1107) | clear |

Fire was at (821, 1129). It moves to the **75% end, (836, 1070)** — up 59 and right 15, exactly the
direction the owner predicted. In sketch space, which is where `TRAIT_POS` is authored, that is
`{x:632,y:681}` → `{x:642,y:642}`; world = `START + (p − REF_C)·REF_S` still reproduces it.

Nothing else is disturbed: the nearest other trait is Balanced at 288 units, and 65–85% of grind is
clear of every hazard.

`GRIND_FIRE_CAP = 0.80` holds the grind while `TUT_FIRE_RUN` is on, and **only for manganese** —
a blanket cap would break the other half of the same recipe, which needs iron ground fully.
Against `ALIGN_MAX` 34 / `ALIGN_FINE` 20 that gives an acquiring band of roughly **63% to the cap**,
so the player is not hunting one exact percentage.

### The scripted cave

`setTutorialCave()` replaces the usual five random seams of seven with **one iron seam and one
manganese seam of 2 each**, and puts the pickaxe on the floor (`PICK_OUT`) rather than in ITEMS & DECOR.
The seams sit on the right half of the plate and the pickaxe low centre, because the dragon and his
speech bubble own the left: at the first placement the line described a pickaxe the line itself covered.

### The customer panel is no longer Bram's alone

The two-choice panel was hardwired to Bram — his name in the markup, his two buttons, his state machine.
It now rebuilds its buttons for whoever is standing there and sets the speaker label (`#custWho`), and
the sell/deny pair stays disabled until the customer has actually asked for something.

The second line of each branch **waits for a tap**. Chained through `typeAfter` it replaced the first
line the instant that finished typing, so the branch the player had just chosen was unreadable.

### Verification

Driven end to end in the preview: sale pays 41g → D56 with "41g" and a **Thank you.** response → the
customer leaves → D57 with "7g" → D58 lights the bell → ringing it brings `woman1` under the label
CUSTOMER with both replies and SELL disabled → either branch holds its first line until tapped, then
gives the fire request → D64 with arrows counter → forge → cave → arrival gives D65, the pickaxe on the
floor and the arrow from it to a seam. The grind cap holds manganese at 0.80 during the run, leaves iron
at 1.0, and lifts outside the run. `Object.keys(DIALOGUE).length === 65`, `lastLine() === "D65"`.
Screenshots of the counter and the cave. Console clean.

### Open

- **The dragon becomes a pet at D65**, since that is now the script's last line, while the player still
  has to mine, forge and sell the fire sword. This resolves itself when the next lines land.
- **The customer has no name.** The panel says CUSTOMER; `woman1` needs one if she is to be a character.
- **Nothing still enforces the trait request** — she asks for fire and will buy anything.

---

## r105 — one owner for the counter's dialogue boxes

Reported by the owner from a play session: the previous customer's line ("Hmm. I see. Not bad. 51g for
your efforts.") was still on screen underneath the next customer's panel, and showed with nobody
standing at the counter.

### One cause, both symptoms

`#bramIntro` — the scripted panel that carries the speaker's name and the reply buttons — sits **inside**
`#csPanel`, directly over `.cs-dlg`, the counter's own dialogue box. Nothing hid one for the other, and
nothing emptied `.cs-dlg` when a customer left. So the last line spoken stayed in the box, the box kept
its `display` from the last time `counterUi()` ran, and the next customer's panel simply landed on top
of it.

`counterUi()` could not have fixed it: it returns early for the whole of a scripted customer's visit
(`if(TUT_BRAM_STATE && TUT_BRAM_STATE!=='done') return;`), which is exactly when the two boxes coincide.

**This predates the r104 customer.** Bram's panel has stacked over the counter's placeholder line
("I need a blade by sundown, smith…") since r97 — visible in r103's own verification screenshot. It was
only noticed once a second customer reused the panel and put a *real* stale line behind it.

### The fix

`counterBoxes()` is now the single owner of those boxes, and unlike `counterUi()` it runs for scripted
customers too:

- the scripted panel wins while it is up — `.cs-dlg` is hidden behind it;
- with no customer the box is hidden **and emptied**, so a stale line cannot reappear with the next one;
- SELL and DENY are hidden, not merely disabled, while a scripted customer is still saying what they
  want, and come back when the order is made.

### Verification

Three states asserted directly. During the greeting: one box, `.cs-dlg` hidden, SELL hidden. After the
request: `.cs-dlg` back and empty, SELL live. With no customer: everything hidden, nothing retained.
Bram's whole visit re-run to make sure the shared panel still works — intro, either reply, the sword on
the counter, the sale (34g) and his departure — and his panel no longer stacks over the placeholder
line either. Screenshot of the reported sequence. Console clean.
