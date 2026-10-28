# Rotated iron and manganese paths: the path test (2026-10-28)

Status: **test build only.** The main build (`Swordforge_looptest_landscape.html`) is unchanged. If the owner accepts
the test, these values move into the main build with tests written first (the `HAZ`, `FTUE` and fire-run checks change).

## The request

Owner: "can we change the path of iron and manganese a bit? If we rotate iron 30 degree anticlockwise and manganese 30
degree clockwise. I would still want them to reach the balanced and fire traits as they do now. nothing in the tutorial
should break either." Then: "go with the order choice version. can you make a separate html file where i can test this
new pathing first? enable only the tutorial for balanced and fire sword in this test version."

## The file

- `Swordforge_looptest_landscape_pathtest.html`, generated from the main build by `node tooling/pathtest/make-pathtest.mjs`
  (every change is an anchored replace that fails if its anchor is not found exactly once). Regenerate after the main
  build changes; do not edit the test file by hand.
- Cheat bar: PART 1, PART 2 and FIRE RUN (`ftuePart(3)`: TC3 at the bell, the fire sword's run). PARTS 4-6 are gone.
- The fire sword's sale (`tutThankYou3`) ends the tutorial: `smFreePlay()` and a toast. Parts 3-6 do not play.

## Why the fire run changes

Full ore ends (from the ore's origin): iron (-156.0, 0) becomes (-135.1, 78.0) (down-left on screen); manganese
(-125.1, -12.0) becomes (-102.3, -72.9) (up-left). Before, the two pointed 5 degrees apart, so after 2 iron + 1
manganese "one more iron" and "one more manganese" ended 33 px apart and Fire sat between them (both Fine). After the
rotation they point 65 degrees apart and those two ends are 154 px apart. Fine needs 20 or less, Weak 34 or less, so no
Fire spot can serve both, and the ladle (it pulls toward the centre only) cannot fix it.

The fork becomes **the order of the last two ores**: after 2 iron + 1 manganese (D68 unchanged), the last iron AND the
last manganese go in, and the player picks which goes first. The same ores in any order end on the same point; the two
orders run along the two sides of a 154 px wide diamond, so a hazard can sit on one side only. The cave's 3 iron + 2
manganese (D67) are all used now; nothing is removed.

## Values

| What | Main build | Path test |
|---|---|---|
| Iron path | `ORES.iron` | turned -30 deg (`rot:-30`, in `normalizeOrePaths`) |
| Manganese path | `ORES.manganese` | turned +30 deg (`rot:30`) |
| Balanced | TRAIT_POS (1119.5, 1019.5) | `FTUE.balancedAt` (1163, 1036), moved after the map is built; value kept (24) |
| Fire | `FTUE.fireAt` (824, 1016) | (790, 1103); value read at (824, 1016) (48), so prices match |
| `HAZ.clear` | the part 4 island | + the ribbon at (1003.22, 1179.18) |
| `HAZ.move[0]` (fork speck) | speck (917.83, 1003.27) to (866, 1001), 75% | the same speck to (920, 1146), 56.25% |
| `HAZ.move[1]` (D69 speck) | none | speck (1028.4, 1016.22) to (1054, 1158), 75% |
| `ROUTE_FAST.irons` | 5 | 6 (3 iron + 2 manganese full is 1116 long; 5 irons is 1000, which would double the fire run's speed) |
| D71 | "Let's add one more ore." | "Let's add two more ores." |
| D72 | "If we use iron, we will cross another hazard zone." | "If we add the iron first, we will cross another hazard zone." |
| D72a | "But the manganese can avoid it." | "But if the manganese goes first, it can avoid it." |
| PART jump fire recipe | iron, iron, manganese, manganese | iron, iron, manganese, iron, manganese |

## Fire-run flow (`fire-mang`)

- `fireOreWanted()`: 'iron/manganese' until one of the last two is in, then the other one, then nothing.
- D72 and D72a each draw their order's full two-leg path (red iron first, green manganese first).
- The first ore, fully ground: no line, the arrow to the smelter. In the smelter: the arrow to the other ore.
- The second ore, fully ground: D73 "Enough! Now add this to the smelter.", then D74 and the bellows as before.

## D70: a glimpse of Fire (owner, 2026-10-28)

Owner: "the fire trait is in the fog of war when dragon points it out. any solution to that? i am okay increasing the
visible radius slightly." Fire is 238 from the first three ores' end and the sword sees `revealR()` = 120, so a slight
radius increase cannot reach it (it would need about 210-240, nearly double, everywhere on the map). Instead, at D70
(`tutFireSpot`) one fog hole of the sword's own size (key 'firespot') opens on the line from Fire to the sword, its
centre `revealR() - TRAIT_R - 24` (66) from Fire: the whole disc and the fog's soft edge (24) are clear, and the hole
overlaps the sword's own, so the two read as one view. Checked in the browser: at D70 the ringed "?" disc shows in full.
The main build has the same gap at D70 (HANDOFF: "fire's disc is now fully under the fog"); this is the candidate fix.

## Checks (2026-10-28, in the browser, the game's own path, hazard and trait functions)

- Balanced: raw 2 iron + 2 manganese in all 6 orders end 2 px from Balanced, full 1 + 1 (both orders) 1 px: Epic,
  as before. TC2's raw 1 + 1 still misses (119 px short). None crosses a hazard (closest 105 px).
- Fire run, played through `fire-grind` to D75: the first three ores cross the moved D69 speck (D69a-c play there) and
  end 238 px from Fire, where D70 plays.
- Manganese first: 1 zone, ends 15.1 from Fire (Fine), health 95.3. Iron first: 2 zones (free, no tier loss), 15.1
  (Fine), health 86.5. Normal speed (`routeSpeedMul()` 1). Both fork previews are 456 long and end at (790, 1118).
- The sale's Thank you: free play (part 7, `done`). No console errors.
- Copper and nickel routes (Swift, Gale, Durable) pass the new Balanced and Fire by 162 px or more.

## Not checked

- A full player-driven run of parts 1-2 in the test file (the fire run's stages were driven by their functions).
- Parts 3-6 against the new geometry (they are off in the test file); GC8's Weak stop, TC5 and Garric aim at Balanced
  and should follow it, but were not run.
