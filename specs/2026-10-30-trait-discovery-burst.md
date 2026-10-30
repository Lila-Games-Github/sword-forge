# Trait discovery burst (2026-10-30)

**Status:** canon. **Build:** `Swordforge_looptest_landscape.html`, step R58 of
`specs/2026-10-23-ftue-smelter-rework-plan.md`. **Test:** `tooling/smelter/smelter.test.mjs` reads `ACQ_FX` and the rules
between the ACQFX-PURE markers out of the build and asserts them against this record.

## Source

Owner, 2026-10-30, with a picture of the "New trait discovered - Balanced" window (Epic tier): "when this window pops up,
have some kind of a vfx particle burst radiating out. like, a celebration".

## Scope

- **When:** each time the trait window opens (`showAcquire`; since R12 it opens on a first discovery only). Visual only: no
  game state hangs on it, and the window's continue works at once.
- **Where:** one canvas (`#acqFx`) over the window's dark, behind the window's box, taps passing through. The particles start on
  the box's edge (an ellipse round it, so none is hidden behind it at the start) and the ring grows from its centre, so the
  burst radiates out from the window.

## The burst

| Part | What | Rule |
|---|---|---|
| Ring | One ring of the tier's colour, expanding from the centre. | Radius 0 to `ring.r` (px) over `ring.time` (s), easing out; opacity and line (`ring.width` to 1 px) fade with it. |
| Particles | `count`, spread evenly round the box (starting on its edge) (each angle jittered by up to 0.6 of a step). Half are glowing **sparks** (a short streak along their flight), half spinning **confetti** (a small rectangle that flips as it turns). | Speed `speed` (px/s), slowed by `drag` (/s), falling at `fall` (px/s^2); life `life` (s); size `size` (px); confetti turns at up to `spin` (rad/s) either way. Opacity in over the first 8% of its life, then out (`1 - k^2`). |
| Colour | The tier's burst colour (`tint`: Weak, Fine, Epic), gold and white. | Of the particles: `mix[0]` the tier's colour, `mix[1]` gold, the rest white. |

Sparks and the ring are added light; confetti is painted.

## Values (`ACQ_FX`)

| Key | Value |
|---|---|
| count | 70 |
| speed | 380-820 |
| drag | 1.8 |
| fall | 260 |
| life | 0.7-1.3 |
| size | 5-10 |
| spin | 12 |
| mix | 0.5, 0.85 |
| ring | r 320, time 0.55, width 6 |
| tint | Weak 210,210,210; Fine 90,170,255; Epic 190,120,255 |
| gold, white | 255,214,90; 255,250,232 |
| big (R59) | Epic: n 1.6, sp 1.35, ring 1.3 (Weak, Fine: 1) |
| after (R59) | delay 0.35, n 0.45, sp 0.6, ring 0.6 |

## Tuning in the browser (2026-10-30, before the owner saw it)

The first values (speed 260-620, drag 2.2, ring 240, from the box's centre) left 40 of the 70 particles behind the window
half a second in: the burst barely cleared the box. Now they start on its edge and fly further (380-820, drag 1.8: 176 to 380
px out at 1 s), and the ring reaches 320 px.

## R59: Epic bigger, and a second, smaller burst (2026-10-30)

Owner: "make the burst bigger for epic tier, and have a smaller burst after the main."

- **Epic** (`big.Epic`): `n` times the particles, `sp` times their speed, `ring` times the ring's size: 112 particles at
  513-1107 px/s and a 416 px ring. Weak and Fine are unchanged (70, 380-820, 320).
- **The second burst** (`after`), every tier: `delay` s after the first, from the same window, `n` of the first's
  particles at `sp` of its speed with a ring `ring` of its size: 32 particles and a 192 px ring for Weak and Fine, 50 and
  250 px for Epic. Its particles and ring follow the same rules as the first's.
- One rule gives each burst's size (`acqWave(F, tier, second)`: count, speed scale, ring radius); the particles of a burst
  are spread evenly round the window by that burst's own count.
