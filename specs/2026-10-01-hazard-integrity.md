# Hazard integrity (2026-10-01), r215

Design record for the hazard penalty in `Swordforge_looptest_landscape.html`.
`tooling/hazard/hazard.test.mjs` asserts the `HAZ` object (between the `HAZARD-CONFIG` markers) and the
pure rules (between the `HAZARD-PURE` markers) against this record.

## Before r215

A hazard zone drains the travelling blade's health (`melt.hp`, 0-100) by `HAZARD_DPS` (26) a second
while the sword **moves** through it; at 0 the blade shatters. Above 0 the damage changed nothing: the
finished sword did not keep its health, so a 5% blade sold like a perfect one.

## Owner decisions (2026-10-01)

- The sword's **health lowers its value**.
- **Too many hazard zones lower the quality**, and the quality is the **trait tier** (option B:
  Epic / Fine / Weak, the craft window's "Quality" row), not the forging band.
- **Recipe crafts inherit** the health and zone count of the route they recorded.
- The numbers are Claude's to set ("can rework it later").
- Tutorial: change **D69b**, add **D69d** at the fire sword's craft window, and **remove the hazard zone
  on the part 4 gale route**. The "too many zones" line is left out for now.

## Values (Claude's choice; one place to change: `HAZ`)

| Key | Value | Meaning |
| --- | --- | --- |
| `floor` | 0.5 | price x (floor + (1 - floor) x health/100): full health = full price, near 0 = half |
| `free` | 2 | zones a run may cross with no tier loss |
| `steps` | [3, 5] | 3 or more zones: every trait drops 1 tier; 5 or more: 2 tiers (Weak is the floor) |
| `clear` | [{ x:1154, y:748, kind:'island' }] | tutorial clearing: the zone the part 4 gale route crossed |

- **A zone counts once per run**, by its index, however often the sword re-enters it. Moving
  through it is what counts (`checkHazard` only runs while the sword moves).
- **What the sword keeps:** `w.hp` (health at the finish, rounded) and `w.haz` (zones crossed).
  Stored ingots keep `hazSeen` as well as `hp`. Old swords and ingots count as full health, 0 zones.
- **Where the price changes:** `swordBase()` multiplies by the health factor (with the forging band);
  the sharpening and design bonuses are not touched.
- **Where the tier drops:** `finishBlade()`, on every trait of the new sword. The run's own tiers
  (before the drop) go to `LAST_CRAFT` and to recipes, with `hp` and `haz`, and `cbCraft` applies the
  same drop to each sword it makes, so a recipe can never be used to dodge the rule.
- **Shown:** the craft window gets an **Integrity** row ("64%"), and, when tiers dropped, the row
  says so ("64%, 3 hazards: -1 tier").
- **Tutorial clearing:** the zone is removed after the map is placed, the way r175 removed the speck
  by gale, so no other zone moves. Measured 2026-10-01 on the seeded map: the gale route (5 ground
  copper) crossed only this island; the swift route crosses none; the part 3 fire route crosses one
  speck at (1028, 1016), which stays (it is D69's zone). No tutorial route reaches 3 zones.

## Tutorial lines (owner approved the text)

- **D69b** (changed): "The sword will take damage if we force it through the hazards, and a damaged
  sword sells for less."
- **D69d** (new, after D69c in the map): "See the integrity? That hazard scratched it, so it will sell
  for a little less." Said over the fire sword's craft window in part 3, only when the sword lost
  health; the Integrity row blinks with it.

## When the hazard lines play (owner, 2026-10-01), r216

The owner did not see D69a-D69c: the fire sword crossed its speck with no pause and no line. Two causes:

1. `ftuePart(n)` (the PART 2-6 buttons) set `TUT_SAIDHAZ` for every part from 2 on, so a run started
   with PART 2 or PART 3 could never play the lines.
2. The lines played on the **first hazard crossing ever** (r179). A crossing before the fire sword
   (a free craft in parts 1-2) spent them, and the fire sword then crossed in silence.

**Rule now (owner):** D69a, D69b, D69c play the first time the sword crosses a hazard **while the fire
sword is being built**: `TUT_STAGE` in `TUT_FIRE_BUILD` = fire-grind, fire-heat1, fire-spot,
fire-reheat, fire-mang, fire-heat2. A crossing before that stays silent and does not spend them. The
game still pauses for the three lines. `ftuePart(n)` marks them said only from part 4 (after the fire
sword). Verified with real `tick()` frames: a crossing at stage null stays silent (the blade still
loses health); at fire-heat1 the game pauses on entry at full health, then D69a, D69b, D69c, and the run
goes on. Asserted by `tooling/hazard/hazard.test.mjs` (31 checks).

## Health, in gold (owner, 2026-10-01), r217

To the player the value is **Health**, not integrity: the craft window row is "Health", the health bar tooltip
is "Blade health: hazard zones damage the active sword", and the hazard toast says "it is losing health". The
row shows the **gold the damage cost, in red** ("-4g": the base price at full health minus the real base
price), not a percentage; full health shows "No loss". The tier note stays (", 3 hazards: -1 tier").
D69d is now "See its health? That hazard scratched it, so it will sell for a little less." (owner approved, 2026-10-06).
