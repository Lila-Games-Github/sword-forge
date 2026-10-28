# Rotated iron and manganese paths: the path test (2026-10-28)

Status: **test build only.** The main build (`Swordforge_looptest_landscape.html`) is unchanged. If the owner accepts
the test, these values move into the main build with tests written first (the `HAZ`, `FTUE` and fire-run checks change).

## The requests

1. Owner: "can we change the path of iron and manganese a bit? If we rotate iron 30 degree anticlockwise and manganese
   30 degree clockwise. I would still want them to reach the balanced and fire traits as they do now. nothing in the
   tutorial should break either."
2. "go with the order choice version. can you make a separate html file where i can test this new pathing first?
   enable only the tutorial for balanced and fire sword in this test version."
3. "the fire trait is in the fog of war when dragon points it out. any solution to that? i am okay increasing the
   visible radius slightly." A one-off fog hole toward Fire at D70 was built (commit db25cd0), then **rejected**:
4. "I do not like this solution. revert it. instead, lets have players use manganese (vs iron) because it avoids the
   hazard. when they travel on the manganese path the fire trait should naturally come in the visible radius. ask them
   to finish with a ground iron at the end." This is the current fire run.

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
Fire spot can serve both as a last ore, and the ladle (it pulls toward the centre only) cannot fix it.

The run now takes 2 iron + 1 manganese (D68 unchanged), then **manganese** (D72 / D72a: iron would cross a hazard,
manganese avoids it; only manganese is taken), then **one ground iron** to finish. The cave's 3 iron + 2 manganese
(D67) are all used; nothing is removed. On the manganese path Fire comes into the sword's view, and D70 plays there.

## Values

| What | Main build | Path test |
|---|---|---|
| Iron path | `ORES.iron` | turned -30 deg (`rot:-30`, in `normalizeOrePaths`) |
| Manganese path | `ORES.manganese` | turned +30 deg (`rot:30`) |
| Balanced | TRAIT_POS (1119.5, 1019.5) | `FTUE.balancedAt` (1163, 1036), moved after the map is built; value kept (24) |
| Fire | `FTUE.fireAt` (824, 1016) | (807, 1113): 17.7 from the route end (790.1, 1118.2) = Fine, on the side the manganese leg passes (100 away at its closest; the best spot inside 18 of the end). Value read at (824, 1016) (48), so prices match |
| `HAZ.clear` | the part 4 island | + the ribbon at (1003.22, 1179.18) |
| `HAZ.move[0]` (fork speck) | speck (917.83, 1003.27) to (866, 1001), 75% | the same speck to (920, 1146), 56.25%: on the 4th ore's iron path only |
| `HAZ.move[1]` (D69 speck) | none | speck (1028.4, 1016.22) to (1054, 1158), 75% |
| `ROUTE_FAST.irons` | 5 | 6 (3 iron + 2 manganese full is 1116 long; 5 irons is 1000, which would double the fire run's speed) |
| `FIRE_SEEN_IN` | none | 15: D70 plays when Fire's centre is `revealR() - 15` (105) or closer to the sword |
| D70a (new, beside D70) | none | "Let's finish it with one ground iron." |
| D71, D72, D72a, D73 | | unchanged from the main build |
| PART jump fire recipe | iron, iron, manganese, manganese | iron, iron, manganese, manganese, iron |

The sight radius (`REVEAL_R` 120) is unchanged.

## Fire-run flow

- `fire-grind` (D68): 2 iron + 1 manganese, ground full. `fire-heat1` (D69): the bellows; the moved D69 speck plays
  D69a-c. At the route's end Fire is out of sight (238 away): **D71 straight away** ("Let's add one more ore."), no D70.
- `fire-mang`: D72 draws the iron path (red, through the fork speck), D72a the manganese one (green). After D72a the
  arrow goes from the manganese to the grindstone. `fireOreWanted()` = 'manganese' only (iron gets the "Not that one"
  toast). Ground full: D73. In the smelter: D74, `fire-heat2`; the last iron stays in the bag.
- `fire-heat2`, on the manganese path: when Fire's centre is within 105 of the sword (`tutFireSeen`, in
  `tutTravelHooks`), the ring goes on Fire and **D70** plays (no pointer: a look-at-this line), then **D70a**. As D70a
  shows, the stage becomes `fire-iron` and the arrow goes from the iron to the grindstone (the fire-grind pointer).
- `fire-iron`: one iron, ground full (`fullGrindOnly`), to the smelter: back to `fire-heat2`, the bellows pointer; at the
  route's end on Fire: D75, as before.

## Checks (2026-10-28, in the browser, the game's own path, hazard and trait functions)

- Balanced: raw 2 iron + 2 manganese in all 6 orders end 2 px from Balanced, full 1 + 1 (both orders) 1 px: Epic,
  as before. TC2's raw 1 + 1 still misses (119 px short). None crosses a hazard (closest 105 px).
- Fire run, driven stage by stage from `fire-grind` to D75: D69a-c on the moved speck; D71 at the first three ores'
  end; D72 / D72a with one-ore previews (iron 199, manganese 256 long); iron refused in `fire-mang`; D73, D74; D70 at
  104 px from Fire on the manganese path, Fire's "?" disc and ring in view at the fog's edge, no pointer; D70a with the
  iron arrow; a half-ground iron refused; the ground iron in; D75 at the route end, 17.7 from Fire: Fine. 1 hazard zone,
  health 95.3, normal speed.
- The sale's Thank you: free play (part 7, `done`). No console errors.
- Copper and nickel routes (Swift, Gale, Durable) pass the new Balanced and Fire by 162 px or more.

## Not checked

- A full player-driven run of parts 1-2 in the test file (the fire run's stages were driven by their functions).
- Parts 3-6 against the new geometry (they are off in the test file); GC8's Weak stop, TC5 and Garric aim at Balanced
  and should follow it, but were not run.
