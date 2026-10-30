# Fire sword swing effect (2026-10-30)

**Status:** canon. **Build:** `Swordforge_looptest_landscape.html`, step R40 of
`specs/2026-10-23-ftue-smelter-rework-plan.md`. **Test:** `tooling/smelter/smelter.test.mjs` reads `SWING_FX` and the rules
between the FIREFX-PURE markers out of the build and asserts them against this record.

## Source

Owner, 2026-10-30: "can we add some flame effect for the fire sword, while we swing it around?" After the proposal (ideas
A-E): "go with A + B + C, fire only, while dragging."

## Scope

- **When:** while a sword is dragged and swings from its grip (s7: the inventory, the counter and the work table drags,
  `swSwingStart` / `swSwingFrame`), and since R44 while the forge's blade is held before the quench (s5). Not the hammer minigame.
- **Which swords:** a sword with the fire trait (`swordHasTrait(w, 'fire')`). Since R45 the base swords (balanced, durable) get a white slash; see R45.
- **After the drop:** the embers already in the air finish their short life; nothing new is made.

## The three parts

| Part | What | Rule |
|---|---|---|
| A. Glow | An orange glow cut to the blade's outline (masked by the blade picture), flickering, over the blade. | Opacity `rest` (0.35) when still, rising with the tip's speed to `full` (1) at `speed` (1600 px/s) and above. |
| B. Embers | Glowing specks along the blade, more near the tip, that trail behind it, rise like heat and fade. | Made at `rest` (14) per second plus `perPx` (0.09) per px/s of tip speed; at most `max` (180) alive. Each starts at a point along the blade (`1 - (1-u)^tipBias`, `tipBias` 2: tip-heavy) with `inherit` (0.3) of that point's velocity plus up to `jitter` (35 px/s) each way; it slows by `drag` (3 /s), rises at `rise` (420 px/s^2), lives `life` (0.25-0.55 s) and is `size` (12-26 px) wide, shrinking to 40%. |
| C. Ribbon | A flame strip over the swept path, between the tip and a point `inner` (65%) along the blade (R41, owner: "make the slash a bit thicker so it covers more area"; it was 80%), orange at the tip edge fading inward. | Drawn only while the tip moves at `speed` (900 px/s) or more; each piece fades out over `keep` (0.12 s); peak opacity `alpha` (0.65), painted over the scene (not added light, which washes out on the bright wall); a piece whose tip jumped more than `gap` (140 px) since the last is skipped (a slow frame would draw a huge wedge). |

**Speed:** the tip's speed in frame px per second, smoothed (35% of the new reading each frame).

**Ember colour** by age (0 = new, 1 = gone): white-yellow `[255,244,200]` at 0, yellow-orange `[255,190,70]` at 0.2,
orange `[245,110,25]` at 0.5, red `[170,40,15]` at 0.75, smoke `[70,50,45]` at 1, linear between. Opacity fades in over
the first 10% of its life, then falls as `1 - age`. Drawn from 16 pre-made glow sprites (one per colour step), added
light on light (`lighter`), so overlapping specks read as flame.

## Values (`SWING_FX.fire`)

| Key | Value |
|---|---|
| glow | rest 0.35, full 1, speed 1600 |
| embers | rest 14, perPx 0.09, max 180, life 0.25-0.55, size 12-26, inherit 0.3, drag 3, rise 420, jitter 35, tipBias 2 |
| ribbon | speed 900, keep 0.12, inner 0.65, alpha 0.65, gap 140 |

## Drawing

One canvas over the frame (`#swingFx`, above the dragged sword, taps pass through), sized to the frame in CSS (100% by 100%) and drawn at the screen's pixel ratio (R41: without the CSS size, a screen at 125% or 150% showed the canvas that much larger, so the slash landed mid-blade instead of at the tip), its own frame loop while anything is
alive. Visual only: no game state depends on it (a hidden page freezes its frames, which only pauses the picture).

## R42: the blade ends stored in the game (2026-10-30)

Owner, with a picture of the slash near the grip: "the slice is closer to the centre on my screen". Cause: every swing
(s5 the anvil blade, s7 a dragged sword, and this effect) needs each blade picture's tang and tip; the game measured them
by reading the picture's pixels (`smBladeEndsOf`, `smBladeEnds`). A page opened as a file (`file://`) may not read picture
pixels, so it used `SM_ENDS_DEFAULT`, a 157 px blade for a 277 px one: the slash landed mid-blade. Reproduced in the
browser by blocking the pixel read.

- **The table (`SM_ENDS_ART`):** each blade picture's tang and tip as fractions of the picture (tang x, tang y, tip x,
  tip y), measured with `smBladeEnds` through the dev server on 2026-10-30, four decimals, for all 21 blade pictures in
  `assets/sword-parts/blades/`. `SM_ENDS` starts filled from it; a picture missing from it is still measured at run time.
- **Upkeep:** a blade picture added or redrawn needs its row (the test fails on a picture with no row). Measure it as on
  2026-10-30: in the game served by the dev server, `smBladeEndsOf(file)`, then read `SM_ENDS[file]`.

## R43: the canvas cleared whole (2026-10-30)

Owner, with a picture of flame patterns piling up along the frame's right and bottom edges: "there is some weird effect at
the right and bottom side now. what is all this flame patters? it appears when i swing the sword. fix it." Cause: the canvas
is drawn at the screen's pixel ratio (R41) and each frame cleared with that scale applied. Below a ratio of 1 (a browser
zoomed out, as on the owner's screen) the cleared area was that much smaller than the canvas, so the right and bottom
bands were never cleared and every flame drawn there stayed. Reproduced at a ratio of 0.8: about 113,000 lit pixels left
in the outer 20% with no ember there.

- **Clear:** each frame clears the whole canvas in its own pixels (the scale reset for the clear).
- **Ratio:** the canvas is drawn at the screen's ratio held to 1-2 (it was up to 2 only), so it is never coarser than the
  frame.

## R44: the forge's blade burns too (2026-10-30)

Owner: "i want the same effects for the blades in the forge screen as well." The forge's blade is the shaped blade on the
anvil, picked up by its handle and swung into the bucket (s5, `SM_BL`).

- **When:** while that blade is held (`SM_BL.live`) and its metal carries the fire trait (`swordHasTrait(melt, 'fire')`).
  It stops when the blade is let go (back to the anvil, or dropped into the bucket) or its tip is quenched in the water;
  embers in the air finish their life.
- **The same effect, the same values** (`SWING_FX.fire`): A the glow (`#smBladeGlow`, laid over the blade picture with its
  place, size and turn each frame), B the embers, C the slash, on the one canvas (`#swingFx`).
- **One code path:** `fxSwing` takes the swing's picture width (`W`: the anvil blade's own width; the dragged sword's
  `SMELT.swingW` when absent) and its offset in the frame (`off`: the bench's place in the frame; none for the dragged
  sword, which already uses frame px).

## R45: the base swords slash white (2026-10-30)

Owner: "I want the same slash effect on the base swords- balanced and durable as well. Give it is generic white slash, no
particles."

- **Which swords** (`fxFor(w)`, the sword or the forge's metal): a fire sword burns (`SWING_FX.fire`, unchanged). A sword whose
  traits are all base traits (`FX_PLAIN_TRAITS`: balanced, durable), or that has none, slashes white (`SWING_FX.plain`). A sword
  with any other trait (swift, gale, ice, water, ...) has no effect yet; each waits for its own.
- **What:** the slash (C) only: no glow (A), no embers (B). The same shape and timing as the fire slash, white.
- **Where:** both swings, as R44: the dragged sword and the forge's held blade.
- **Colour:** each slash takes its colour stops from its own values (`ribbon.stops`: offset from the tip edge, rgb, opacity).
  Each slash piece and each ember keeps the values it was made with, so a fire swing's embers still finish their life when a
  white swing starts.

| Key | fire | plain |
|---|---|---|
| ribbon | speed 900, keep 0.12, inner 0.65, alpha 0.65, gap 140 | speed 900, keep 0.12, inner 0.65, alpha 0.7, gap 140 |
| ribbon.stops | 0: 255,200,90 at 1; 0.45: 255,95,20 at 0.8; 1: 190,35,8 at 0 | 0: 255,255,255 at 1; 0.45: 235,242,255 at 0.55; 1: 220,230,250 at 0 |
| glow, embers | as Values above | none |

## R46: the swift sword slashes white too (2026-10-30)

Owner: "give me the same slash for the swift sword as well."

- **Which swords:** swift joins the white-slash traits: `FX_PLAIN_TRAITS` is balanced, durable, swift. A sword whose traits are
  all among them (or none) slashes white (`SWING_FX.plain`, unchanged); fire still burns, also with swift (fire first); any
  other trait (gale, ice, water, ...) still has no effect, also when mixed with swift.
- **Where:** both swings, as R45.

## R47: the gale sword's winds (2026-10-30)

Owner: "I want something for the gale sword as well. Use the same slash, but instead of particles, I want swirling winds
around the blade and the sword. use slightly cyan color for this."

- **Which swords** (`fxFor`): fire first, then gale: a sword with the gale trait (and no fire) gets `SWING_FX.gale`, whatever
  else it carries. Then the white slash (R45-R46), else none.
- **C. The slash:** the same white slash as the base swords (the same values).
- **D. Wind rings (replaced by R48):** flat rings wrapped around the sword, drawn across it at points `at` along it (fractions of the blade from
  the grip, the first one negative: over the hilt), each an open arc `arc` (rad) of an ellipse `rx` across by `ry` along,
  spinning around the sword at `spin` (rad/s, from still to `speed` and above), each ring's arc started 1.7 rad on from the
  last. Opacity `alpha` from still to `speed`. Shown while the sword is held, also still.
- **E. Gusts** (instead of embers): small wind curls made like embers (`rest` per second plus `perPx` per px/s of tip speed,
  at most `max` alive) at a random point on the sword (from the hilt, -0.15, to the tip), with `inherit` of that point's
  velocity plus up to `jitter` px/s each way, slowed by `drag` (/s), not rising. Each is an open spiral of `sweep` (rad)
  turning at `spin` (rad/s), its radius growing from 40% to its full `r` over its `life`, its line `width` thinning to 40%;
  it fades in over the first 15% and out after.
- **Colour:** slightly cyan (`color`): each wind line is drawn twice, a wider soft `edge` stroke at 35% then a thin bright
  `core` stroke, so it reads on the light walls and the dark forge alike. Painted over the scene (not added light).
- **Where:** both swings, as R44-R46. No glow (A) on a gale sword.

| Key | Value |
|---|---|
| ribbon | as plain (R45): speed 900, keep 0.12, inner 0.65, alpha 0.7, gap 140, white stops |
| wind | at -0.15, 0.2, 0.5, 0.8; rx 20, ry 6, arc 4, spin 5-16, speed 1600, alpha 0.4-0.9, width 3 |
| gusts (R49: see R49) | rest 5, perPx 0.025, max 40, life 0.45-0.8, r 8-26, sweep 3-4.5, spin 7, inherit 0.35, jitter 30, drag 2.5, width 3, alpha 0.85 |
| color | edge 80,195,225; core 200,250,255 |

## R48: the gale winds swirl when still, trail when moving (2026-10-30)

Owner, on R47's rings: "I didn't want them to be rings. I like that they swirl around when the sword is still, but in
motion, they should act more like the slash, like a trail following the sword." The rings (R47 D) are gone; the slash (C)
and the curls (E) are unchanged.

- **D1. The swirl (still):** `orbit.n` wind streaks circling the whole sword on one flat ellipse round it (from the hilt,
  -0.15 of the blade, to the tip; `pad` px past each end, `ry` px out to each side), turning at `spin` (rad/s). Each
  streak is an arc of `arc` (rad) that thickens and brightens from its tail to its head (6 steps). Its opacity is
  `orbit.alpha` when still, falling to 0 at the tip speed `wind.speed` (900 px/s, the speed the slash starts at), so in a
  swing the swirl gives way to the trails.
- **D2. The trails (moving):** wind lines left by points on the sword (`trail.at`: [fraction of the blade from the grip,
  px to the side]): one over the hilt, two beside the blade (one each side), one near the tip under the slash. Each frame
  each point's place is kept for `keep` (s), as the slash keeps the tip's; a piece fades and thins (to 40%) over that time
  from `alpha`; a piece whose ends are more than `gap` px or 60 ms apart is skipped, one under 0.5 px is not drawn (a still
  sword leaves no dots). They show at any speed, so they grow with the swing.
- **Colour:** as R47 (a soft `edge` stroke under a bright `core`, slightly cyan).

| Key | Value |
|---|---|
| wind | speed 900 |
| wind.orbit | n 3, ry 28, pad 14, arc 1.4, spin 4, alpha 0.85, width 3 |
| wind.trail | at [-0.1, 0], [0.3, -9], [0.6, 9], [0.9, 0]; keep 0.2, gap 140, alpha 0.85, width 3 |

## R49: the curls larger and fewer (2026-10-30)

Owner: "make the swirls larger and fewer" (the wind curls, E). About 2.5 times fewer and about 1.8 times larger; the rest of
the gale effect is unchanged.

| Key | Was (R47) | Now |
|---|---|---|
| gusts.rest | 5 | 2 |
| gusts.perPx | 0.025 | 0.01 |
| gusts.max | 40 | 15 |
| gusts.r | 8-26 | 18-44 |
| gusts.width | 3 | 4 |
