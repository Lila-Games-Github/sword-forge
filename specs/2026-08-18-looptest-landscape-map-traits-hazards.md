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
