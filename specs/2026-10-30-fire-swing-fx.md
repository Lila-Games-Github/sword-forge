# Fire sword swing effect (2026-10-30)

**Status:** canon. **Build:** `Swordforge_looptest_landscape.html`, step R40 of
`specs/2026-10-23-ftue-smelter-rework-plan.md`. **Test:** `tooling/smelter/smelter.test.mjs` reads `SWING_FX` and the rules
between the FIREFX-PURE markers out of the build and asserts them against this record.

## Source

Owner, 2026-10-30: "can we add some flame effect for the fire sword, while we swing it around?" After the proposal (ideas
A-E): "go with A + B + C, fire only, while dragging."

## Scope

- **When:** while a sword is dragged and swings from its grip (s7: the inventory, the counter and the work table drags,
  `swSwingStart` / `swSwingFrame`). Not the anvil blade before the quench (s5), not the hammer minigame.
- **Which swords:** a sword with the fire trait (`swordHasTrait(w, 'fire')`). Every other sword is unchanged.
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
