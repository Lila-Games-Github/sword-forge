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
   s3 (owner, 2026-10-21): "the movement of the sword on the path, controlled by the bellow is very jittery, smoothen it so
   it feels nice." The handle no longer moves the sword itself: each movement adds its travel to a store (`SM_OWED`, in
   full-speed seconds), and every frame the sword glides out part of it (`smEase`: an exponential ease with time constant
   `easeSec`, the last `flush` s at once). The total travel is unchanged; it arrives over about half a second, one step a
   frame, instead of one jump per pointer event. Opening the gate, the metal leaving the smelter or the route ending
   drops what is left.
4. **The minigame closes when the blade is shaped.** After the last hit point, `SMELT.shapedHold` ms later the minigame
   closes and the finished blade lies on the anvil. Drag it into the bucket: the quench steam and mist play, then the
   "Sword crafted!" window, as the minigame's mug did before.

## The ladle: tier alignment (owner, 2026-10-21, s4)

Owner: "I have added two new images, ladle_base and ladle_head. refer to ladle_placement.png for placement. it stays
behind the smelter. This ladle will be used for tier alignment. It can be tilted. Tilting it activated it, and it slowly
drags the active sword to the centre. The speed of the active sword towards the centre depends on the degree of the
tilt." Answer (owner, 2026-10-21): on release it tips back upright, like the bellows (recommended).

- **Art:** `assets/forge/ladle_base.webp` and `ladle_head.webp` (512 wide, quality 0.86, from the owner's PNGs). Both sit
  in the smelter's station behind the furnace (`#ladle`, z -1 in the station), placed to
  `assets/Anchor-images/ladle_placement.png`: matched by drawing the two images over the reference at full size. Positions
  are % of the station box (`SMELT.ladleHead`, `SMELT.ladleBase`); in frame terms the head is x 34.9%, y 56.8%, 11.0%
  wide, the base x 39.7%, y 65.9%, 5.1% wide.
- **Tilt:** drag on the ladle's bowl (`#ladleHot`, the head's upright box, over the furnace's top): the head turns about
  its foot (`SMELT.ladlePivot`, % of the head image) by the change in the pointer's angle around that point, clockwise
  (toward the smelter), from 0 to `ladleMax` degrees. On release it tips back to 0 in `springMs` and the pull stops.
- **Pull:** while the metal is in the smelter (stage smelting) and tilted past `ladleDead`, every frame the sword, its
  remaining route and the X move straight toward the map's centre (START), as the main game's dragon fire did (the same
  `pull`, so books, hazards and trait spots are checked on the way). Speed: `ladlePull` map px/s at full tilt, falling
  linearly to 0 at `ladleDead` (`smLadleSpeed`). It stops at the centre. The bowl glows while it pulls.
- **Values:** `ladleMax` 45 deg, `ladleDead` 4 deg, `ladlePull` 24 px/s (the dragon's fire pulled at 20), `ladleHead`
  { x -22.2, y 4.9, w 57.3 }, `ladleBase` { x 2.8, y 26.7, w 26.5 }, `ladlePivot` { x 66.7, y 90.6 }.
- **Pure rules:** `smLadleTilt(tilt, dDeg)` = the tilt plus the turn, clamped to 0..`ladleMax`; `smLadleSpeed(tilt)` as above.

## The blade on a string: pendulum physics (owner, 2026-10-21, s5)

Owner: "can we give some physics to the blade? i want it to rotate and drop when we pick it by the handle on the anvil. so
it can also go straight down in the bucket. Moving it left and right should make it swing around like a pendulum. keep
the pivot point on the handle."

- **The handle:** the blade art is the bare blade on a diagonal, its tang (the handle end) at the bottom left. Each blade
  picture's two ends are found from its pixels (`smBladeEnds`: the opaque pixels furthest along the art's diagonal, x - y,
  averaged over a thin band at each end; the low end is the tang, the high end the tip), so curved blades work too.
- **Picking it up:** a press within `bladeGrab` px of the blade's line (tang to tip, on screen) takes it, anywhere along
  it. The blade's picture no longer takes taps itself (its transparent box covered the map). The tang is the pivot: it
  follows the finger through a critically damped spring (`smFollow`, stiffness `bladeFollow`), so the handle comes under
  the finger and the spring gives a smooth pivot acceleration. The blade swings from the angle it lay at, so it turns and
  drops to hang tip down.
- **The swing:** a rigid pendulum on a moving pivot (`smPendStep`, screen px, y down, angle from straight down, + = tip to
  the right): angle'' = ((-ax) cos angle - (g - ay) sin angle) / L - damp x angle'. g = `bladeG`, L = `bladeCom` x the
  blade's on-screen length (pivot to the centre of mass), damp = `bladeDamp`. Four substeps a frame. Moving left and right
  swings it; it settles hanging down.
- **The bucket:** released with the tip over the bucket (its box, `bladeGrab` wider each side, from 60 px above it), the
  blade drops straight down `bladeDropPx` in `bladeDropMs`, fading, then the steam and mist, then the "Sword crafted!"
  window. Released anywhere else, it goes back onto the anvil.
- **Values:** `bladeG` 2600 px/s2, `bladeCom` 0.5, `bladeDamp` 1.2 /s, `bladeFollow` 700 /s2, `bladeGrab` 24 px,
  `bladeDropPx` 70, `bladeDropMs` 320. With a 160 px blade (2 anvils wide box) L is about 80 px: a swing of about 1.1 s,
  its size halving in about 1.2 s.
- **Pure rules:** `smPendStep(th, om, ax, ay, L, dt)`, `smFollow(p, v, target, dt)` (one axis; returns p, v and the
  acceleration a), `smBladeEnds(rgba, w, h)`, `smRot(th, artDeg)` = the picture's rotation in degrees for a swing angle
  th (rad), the art's own tang-to-tip angle being artDeg: (90 - th in degrees) - artDeg.

## The loop

1. Ore to the smelter, or to the grindstone and then the smelter (unchanged). The route draws on the map.
2. Drag the bellows handle up and down: the sword travels the route (books, hazards and trait spots as before). Tilt the
   ladle to pull the sword toward the centre and line it up on a trait's centre (the tier).
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
| `easeSec` | 0.15 | the glide's time constant: each frame releases 1 - e^(-dt/easeSec) of the stored travel (s3) |
| `flush` | 0.002 | stored travel at or below this (s) is released at once, so the glide ends (s3) |
| `bladeW` | 2 | the shaped blade on the anvil, as a multiple of the anvil's width (s3; was 1.25) |
| `shapedHold` | 700 | ms between the last strike and the minigame closing, so the finished blade is seen |
| `freeOres` | 20 | of every ore at the start of free play |
| `freeGold` | 500 | gold at the start of free play |

Full-speed travel is the main game's `SWORD_SPEED` (0.5 of a segment a second) times `routeSpeedMul()` (the long-route
x2). Hazard damage keeps its per-distance rate (the bellows pass the same equivalent time to `checkHazard`).

## Pure rules (`SMELT-PURE`)

- `smHandle(pos, dyPx)`: the handle at `pos` (0..1) dragged `dyPx` (screen down is positive, so up raises it) returns
  `{ pos, moved }`: the new position clamped to 0..1, and how far it actually moved (0..1).
- `smTravelDt(moved)`: the equivalent full-speed seconds for a handle movement, `moved x strokeSec`.
- `smEase(owed, dt)`: how much of the stored travel `owed` the sword glides out in a frame of `dt` s (s3).

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
- 2026-10-21: s3 the bellows' travel glides out frame by frame (`smEase`, `easeSec` 0.15); the blade on the anvil is 2x the anvil's width (was 1.25).
- 2026-10-21: s4 the ladle: tilt it to pull the sword toward the centre (tier alignment); speed by the tilt; tips back on release.
- 2026-10-21: s5 the blade hangs from its handle: picked up, it swings down and swings like a pendulum when moved; dropped straight down into the bucket.
