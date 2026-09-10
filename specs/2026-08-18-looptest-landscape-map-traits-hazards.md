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
