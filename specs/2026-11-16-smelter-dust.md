# Dust when ore goes into the smelter (R126, 2026-11-16)

Build: `Swordforge_looptest_landscape.html`. Tracker: R126 in `specs/2026-10-23-ftue-smelter-rework-plan.md`. Test:
`node tooling/smelter/smelter.test.mjs` (the R126 checks; the build keeps the values between the `SM-DUST` markers).

Owner (2026-11-16): "I want visual feedback when adding ores to the smelter, some kind of dust particles going up, with a puff
of dust."

## When

Every time the player puts an ore in the smelter: a raw ore dropped straight in (`addOreDirect`) or a ground ore from the
grindstone (`addPrep`). Not when a craft book page fills the smelter by itself (CONTINUE FROM HERE), nor when a save loads.

## What

Both start at the crucible's mouth: 51% across and 26% down the smelter station (`#stSmelt`; the furnace smoke uses the
same spot, r38). They are drawn inside the station, so they follow it and rise with it under the tutorial's dark overlay.

- **The puff:** soft round clouds burst out over the mouth (upward and to the sides), swell and fade: they keep most of
  their opacity for the first third, then fade (R126 first faded them from the start, and the puff was barely seen).
- **The rising dust:** small specks rise from the mouth, drift a little sideways and fade.
- **The colour (R127):** soot brown (`#3e352e`) moved a fifth of the way toward the ore's own colour (`ORE_BY[id].color`), so
  copper dust is warmer than manganese dust. Owner (2026-11-16): "darken the color of the dust puff, and particle. right now it
  blends with the yellow map". Against the map picture (`assets/map/map_base.webp`, sampled by brightness: median `#ea9e4f`,
  90th percentile `#d7be7b`, 98th `#f6c366`) every ore's dust reads at 3:1 or better (3.3:1 at the least, nickel on the
  palest yellow); R126's light ash (`#e2d9cc` at 0.35) read at 1.0:1 and its first tan (`#a89880` at 0.5) also vanished. `smDustTint(ore, grey, t)` mixes each channel: grey + (ore - grey) x t.

Nothing waits on the effect; it removes itself when the last speck has faded.

## Values (`SM_DUST`)

| Key | Value | Meaning |
| --- | --- | --- |
| `at` | `{ x:51, y:26 }` | the crucible's mouth, % of the station |
| `grey`, `tint` | `#3e352e`, 0.2 (R127; was `#e2d9cc`, 0.35) | the dust colour, and how far it moves toward the ore's colour |
| `puffs` | 8 | clouds in the puff |
| `puffSize` | `[16, 30]` | a cloud's size, px (random in the range) |
| `puffDist` | `[14, 32]` | how far a cloud travels, px |
| `puffMs` | 600 | the puff's length |
| `specks` | 16 | specks of rising dust |
| `speckSize` | `[2.5, 5]` | a speck's size, px |
| `rise` | `[45, 95]` | how high a speck rises, px |
| `drift` | 22 | the most a speck drifts sideways, px (either way) |
| `riseMs` | `[900, 1500]` | a speck's flight |
| `delay` | 220 | the latest a speck starts, ms after the ore lands |
