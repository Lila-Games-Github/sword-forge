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
