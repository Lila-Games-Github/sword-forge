# Smelter version: a separate crafting loop (owner, 2026-10-21)

**Status:** canon. **Since 2026-10-23 this is the main game's loop:** the smelter version became
`Swordforge_looptest_landscape.html`, and the old main build is kept as `Swordforge_looptest_landscape_hammerloop.html`
(owner's decision 1 in `specs/2026-10-23-ftue-smelter-rework-plan.md`). Decision 1 below (free play, tutorial off) is
superseded there: the tutorial is back, reworked to this loop; free play is the `?freeplay` test aid.

**Test:** `node tooling/smelter/smelter.test.mjs` reads the smelter version and asserts the `SMELT` object, its pure
rules (between the `SMELT-PURE` markers) and the wiring below. It also asserts the old hammer loop carries none of it.

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

- **In the tutorial (R29, owner, 2026-10-29: "Same as grinder, the ladle should appear only after the tutorial of it begins,
  when TC4 arrives."):** `ftueLadleUi()` hides the ladle and its drag area (`ftue-lock`: not seen, no touch) until part 4,
  which TC4's arrival starts, or once the tutorial is over (free play has it). It is refreshed with the grindstone's
  `ftueGrindUi()` (load, new game, PART jumps, free play, start) and at TC4's arrival.
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
- **Values:** `bladeG` 2600 px/s2, `bladeCom` 0.5, `bladeDamp` **2.5** /s (R98, owner 2026-11-10: "lower the swinging a bit";
  was 1.2), `bladeFollow` 700 /s2, `bladeGrab` 24 px, `bladeDropPx` 70, `bladeDropMs` 320. With a 160 px blade (2 anvils wide
  box) L is about 80 px: a swing of about 1.1 s, its size halving in about 0.55 s (was 1.2 s). A 300 px sideways drag in
  0.25 s with a held sword (`swingW` 317) swings it at most 61 degrees (was 74) and it is within 2 degrees after 2.9 s (was
  over 6 s); the smelter test checks this.
- **Pure rules:** `smPendStep(th, om, ax, ay, L, dt)`, `smFollow(p, v, target, dt)` (one axis; returns p, v and the
  acceleration a), `smBladeEnds(rgba, w, h)`, `smRot(th, artDeg)` = the picture's rotation in degrees for a swing angle
  th (rad), the art's own tang-to-tip angle being artDeg: (90 - th in degrees) - artDeg.

## Every dragged sword swings (owner, 2026-10-28, s7)

Owner: "i like how the blade swings around when we pick it up from the anvil. I want the same for the swords in all
screens. so, if i drag a sword out of the inventory on any screen, it should have the same movement and swings physics."

- **Which drags:** a sword dragged out of the Swords tab on any screen (`startSwordDrag`: to the counter, the workstation
  table or the shop's racks) and one dragged off the counter or the table back to the inventory (`wireWorkDrag`). Where it
  can be dropped is unchanged (the pointer decides, as before).
- **The same swing:** the sword (its four part pictures, as the drag ghost always showed it) hangs from its grip and swings
  with s5's physics and values: the grip follows the finger (`smFollow`, `bladeFollow`), the sword swings about it
  (`smPendStep`, `bladeG`, `bladeDamp`, L = `bladeCom` x the grip-to-tip length), four substeps a frame. The grip and the
  tip are the blade picture's own ends (`smBladeEndsOf`, as for the anvil's blade; the part pictures share its canvas).
  It starts from the angle the anvil's blade lies at (`SM_REST_DEG`), so it turns and drops the same way.
- **The same size:** held, the sword is drawn `swingW` 317 px wide, the anvil blade's box (2 anvils, measured in the
  1080 x 600 frame), so the swing has the same length and pace (about 1.1 s). At the drag ghost's old 74 px it would
  swing about twice as fast.
- **Its own frame loop** for the length of the drag (`swSwingFrame`, dt held to 0.05 s): the game's `tick` holds during a
  tutorial pause, and a sword can be dragged then.

## Hot blade, quenched in the bucket (owner, 2026-10-21, s6)

Owner: "the blade should get quenched near the bucket. Keep it glowing hot on the anvil, then when it is quenched, it is
finalized. We should be able to hold it, and dip it in the bucket as well. Dropping the blade in the bucket is also fine
(what we have now)"

- **Hot:** the shaped blade glows hot (`#smBlade.hot`: the metal tinted orange, with an orange glow) on the anvil and while it is held.
- **Dip:** held, the moment its tip touches the bucket's water (`smInWater`: the tip inside the water's part of the bucket
  picture, x `waterX0`..`waterX1` of its width, from `waterY0` of its height down to its bottom) it is quenched where it
  is. It must enter from above (`smDipped`: in the water now, above the surface the frame before): hanging from the
  anvil's height the tip is as low as the water, and carried left it swung in through the bucket's side (found in the
  browser check). Then: the hold ends, it goes behind the bucket's rim (the tip reads as under the water), the glow fades out (0.7 s), the
  steam and mist rise at the tip, then the "Sword crafted!" window: the blade is finalized.
- **Drop:** released with the tip over the bucket but not in the water, it drops straight down into it, as in s5, cooling
  the same way.
- **Values:** `waterX0` 0.23, `waterX1` 0.80, `waterY0` 0.30 (read off `assets/forge/anchor_bucket.webp`: the water's
  surface spans about 23%-80% across, from 30% down).

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
| `swingW` | 317 | a dragged sword's width in frame px while held: the anvil blade's box, so it swings the same (s7) |

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
- 2026-10-21: s6 the blade glows hot until quenched; held, dipping its tip in the bucket's water quenches and finalizes it; dropping it in still works.
- 2026-10-28: s7 every dragged sword (out of the inventory on any screen, off the counter or the table) hangs from its grip and swings with s5's physics, at the anvil blade's size (`swingW` 317). Smelter test 66 -> 71 (written first). Checked in the browser (1280x720, free
  play, real pointer events; the hidden pane froze the frame loop, so `swSwingFrame` was stepped by hand at 60 fps): from
  the Swords tab on the counter screen the sword is 317 px, starts at 95 deg (the anvil's lying angle), its grip 0 px from
  the finger; held still it swings about 1 s a period, dying down (45, -44, -54, 7, 43, 11, -27, -18 deg every 250 ms);
  dropped on the counter it is placed, the ghost and the loop gone. The counter's sword dragged to the inventory in 0.8 s
  swings within about 120 deg and settles; dropped, it is back in the bag. A fast flick (600 px in 0.33 s) spins it over
  the top, as the anvil's blade would. On the shop screen the drag swings the same. No console errors.

## R64: the gate's ready highlight, a circle (2026-11-03)

Owner, with a picture of the gate's faint rounded box: "make this a circle highlight, and more intense. right now it is
barely visible." While the gate is ready (the sword on a trait, `#furnaceGate.ready`):

| Part | Was | Now |
|---|---|---|
| Shape | the gate's rounded box (62 x 70 px), a 2 px inner line and a 16 px glow | a ring, 130% of the gate's width (about 80 px), centred on it |
| Ring | - | 4 px, rgb(255,222,120) |
| Glow | 16 px, 0.7 opacity | 24 px spread 10 outside at 0.95, 20 px spread 7 inside at 0.8 |
| Pulse | the opacity 0.55 to 1, 0.95 s | size 0.94 to 1.08 and opacity 0.8 to 1, 0.95 s |
| Ripple | - | a second 3 px ring growing to 1.6x and fading out, every 1.2 s |

The rings take no taps (the gate under them does).

## R65: the shape window wider, its text bigger (2026-11-03)

Owner, with a picture of "Choose a Blade Shape": "can we also make this wider, currently it covers only 1/3rd of the screen.
make it wider, increase the text size."

| Part | Was | Now |
|---|---|---|
| Window | max 320 px wide (a third of the 1080 px frame) | max 720 px, 67% of the frame; padding 22 x 26 px |
| Shapes a row | 4 (10 shapes in 3 rows) | 5 (10 shapes in 2 rows), 12 px apart |
| Heading | 16 px | 24 px |
| Sub-line | 11 px | 16 px |
| Shape icon / name | 26 px / 10 px | 40 px / 15 px |
| BUY | 10 px | 14 px |
| Cancel | 44% of the row | 30% (the row is wider) |

## R82: the shape window on a tap (2026-11-05)

Owner: "on placing the metal on the anvil, the shape selection is poping up instantly. It is supposed to come up when we click on
the metal, only." The hot metal dropped on the anvil lies there; a tap on it (no drag) opens the shape window. Dragging it back to
the smelter works as before. In the tutorial the metal glows as the next tap.
