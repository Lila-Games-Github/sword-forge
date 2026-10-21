# Smelter version: a separate crafting loop (owner, 2026-10-21)

**Status:** canon for `Swordforge_looptest_landscape_smelterversion.html` only. The main build
(`Swordforge_looptest_landscape.html`) is not changed by anything here.

**Test:** `node tooling/smelter/smelter.test.mjs` reads the smelter version and asserts the `SMELT` object, its pure
rules (between the `SMELT-PURE` markers) and the wiring below. It also asserts the main build carries none of it.

## The request

Owner: "the new crafting loop - ores go to smelter (or grinder, then smelter) - bellowing moves the active sword on the
path (we drag the bellow up and down) - then we open the gate of the smelter to acquire the trait. the anvil in this
version opens the hammering minigame. there is no splashing water in the hammering minigame. we get the sword on the
anvil after the hammering minigame, we can then dip this sword in the bucket to finish the craft process. the dragon does
not do the tier alignment. a different equipment placed on the side of the smelter is used for tier alignment (will do
this later)"

## Decisions (owner, 2026-10-21, the four recommended answers)

1. **Tutorial off.** The smelter version starts in free play: no dialogue, the tutorial marked done, every station and the
   market open, `SMELT.freeOres` of every ore and `SMELT.freeGold` gold. The intro still plays first. A new game from the
   menu starts the same free play. The PART buttons are hidden (they build tutorial states); SKIP HAMMER stays.
   Free play sets the tutorial part to 7 (past the six): part 1 caps the first sword at 2 iron + 2 manganese and greys every
   other ore on the shelf.
2. **The gate gives the trait and releases the metal.** It opens only while the sword sits on a trait (it glows then).
   Opening it acquires that trait (the tier from the sword's distance to the trait's centre, as before) and puts the hot
   metal at the gate. For another trait, drag the metal back into the smelter, pump on, open the gate again.
3. **The bellows handle moves the sword.** Drag the handle up and down; the sword moves only while the handle moves, as
   far as the handle travels, either direction. Stop and the sword stops. Heat no longer sets the sword's speed.
   s2 (owner, 2026-10-21): "make the bellows handle spring back when released. also, make the movement much slower,
   maybe 0.2". Released, the handle springs back to closed in `SMELT.springMs`; the spring moves nothing. `strokeSec`
   0.5 -> 0.2.
4. **The minigame closes when the blade is shaped.** After the last hit point, `SMELT.shapedHold` ms later the minigame
   closes and the finished blade lies on the anvil. Drag it into the bucket: the quench steam and mist play, then the
   "Sword crafted!" window, as the minigame's mug did before.

## The loop

1. Ore to the smelter, or to the grindstone and then the smelter (unchanged). The route draws on the map.
2. Drag the bellows handle up and down: the sword travels the route (books, hazards and trait spots as before).
3. On a trait the gate glows; tap it: the trait is acquired (the trait window opens), the hot metal comes out at the gate.
4. Drag the metal to the anvil: the shape window opens (cancel it and tap the metal to reopen it). Pick a shape.
5. The hammering minigame: the dragon heats, the hammer strikes the hit points (unchanged), no mug.
6. Shaped: the minigame closes, the blade lies on the anvil. Drag it into the bucket to finish.

## What is gone from the forge

- The forge hammer (`#hammerTool`): it moved the sword; the bellows do now. Hidden.
- The forge mug (`#mug`): it locked a trait in; the gate does now. Hidden. The bucket stays, as the blade's dip.
- The dragon's fire on the forge (tier alignment): a press on the dragon never breathes there. The alignment tool beside
  the smelter comes later.
- The minigame's mug (`#hmMug`): hidden.

## Values (`SMELT`)

| Key | Value | Meaning |
|---|---|---|
| `rangePx` | 40 | handle travel, in frame px, from closed (0) to fully raised (1) |
| `lift` | 12 | the handle's tilt in degrees when fully raised (the old pump animation went to 10) |
| `strokeSec` | 0.2 | one full stroke (0 to 1) moves the sword as far as 0.2 s of full-speed travel; a down-and-up pump is 0.4 s (s2; was 0.5) |
| `springMs` | 250 | released, the handle springs back to closed in this time; the spring does not move the sword (s2) |
| `shapedHold` | 700 | ms between the last strike and the minigame closing, so the finished blade is seen |
| `freeOres` | 20 | of every ore at the start of free play |
| `freeGold` | 500 | gold at the start of free play |

Full-speed travel is the main game's `SWORD_SPEED` (0.5 of a segment a second) times `routeSpeedMul()` (the long-route
x2). Hazard damage keeps its per-distance rate (the bellows pass the same equivalent time to `checkHazard`).

## Pure rules (`SMELT-PURE`)

- `smHandle(pos, dyPx)`: the handle at `pos` (0..1) dragged `dyPx` (screen down is positive, so up raises it) returns
  `{ pos, moved }`: the new position clamped to 0..1, and how far it actually moved (0..1).
- `smTravelDt(moved)`: the equivalent full-speed seconds for a handle movement, `moved x strokeSec`.

## Build log

- 2026-10-21: s1 the loop above, built test first (`tooling/smelter/smelter.test.mjs`, GREEN at 26). Found on the way:
  free play started at tutorial part 1, so the first-sword ore cap greyed the shelf; it is part 7 now (test first). The
  shaped blade art is drawn on a diagonal, so it lies on the anvil turned 40 degrees, 1.25x the anvil's width. Checked in
  the browser (1280x720):
  - load and the intro's SKIP give free play: no dialogue, 20 of every ore, 500 gold, no grey ore, the forge hammer, mug
    and PART buttons hidden, SKIP HAMMER shown; the menu's new game gives the same;
  - 2 iron + 2 manganese in the smelter, the bellows handle pumped (pointer events on its hotspot): 4 pumps carry the sword
    onto Balanced, the gate glows (one frame run by hand: the hidden preview pane stops the frame loop), and not off a trait;
  - the gate: Balanced acquired, the trait window, the hot metal at the gate, no mist; with 1 iron + 2 manganese (no
    trait reached) it refuses;
  - the metal dragged to the anvil opens the shape window; Shortsword; the minigame shows no mug; six strikes, the line
    "Blade shaped!", 0.7 s later it closes and the blade lies on the anvil (hit-tested);
  - the blade dragged into the bucket: it goes, the steam and mist play, the "Sword crafted!" window opens, the sword is in
    the Swords tab (Shortsword, Balanced Epic, Masterwork);
  - the hot metal dragged back into the smelter keeps its trait and takes more ore;
  - no console errors.
- 2026-10-21: s2 the handle springs back when released (`springMs` 250, no travel); the sword 2.5x slower (`strokeSec` 0.2).
