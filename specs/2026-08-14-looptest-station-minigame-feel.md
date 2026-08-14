# Loop-test — station minigame feel (Phase B)

Status: canon (feel pass on `Swordforge_looptest_landscape.html`)
Date: 2026-08-14
Branch: `sword-forge/looptest-minigame-feel` (off `sword-forge/dual-orientation-anchor-rework` @ fe3ea75)
Builds on: [2026-08-14-looptest-phase2-landscape-hori-anchor.md](2026-08-14-looptest-phase2-landscape-hori-anchor.md)

## Goal

Make each forge station **feel** good (juice, feedback, clear timing), per the game-design
5-component filter (Clarity / Motivation / Response / Satisfaction / Fit). AFK autonomous pass on
the landscape build.

## The one real functional gap (fixed)

**Grind station was dead in landscape.** Phase 2 hid the `#pestle` (the grind station became the
wheel prop) but never wired an interaction — so there was no way to grind. **Response failure.**
Fix: `wireGrindWheel()` + a `#grindHot` hit-zone over the wheel. Hold the wheel (while an ore is
prepped on it) → `pestleGrinding=true` → the existing grind loop runs (`prep.grind += GRIND_RATE*dt`,
extends the ore's path). The wheel judders (`.mortar.grinding`) and throws sparks while grinding.
Mirrors the proven `wireBellowGate` hold-pattern. Hint updated ("Hold the wheel to grind").

## Juice added (all stations)

Shared lightweight particle emitter `fxBurst(x,y,{n,kind,ang,spread,dist,size,dur})` — DOM dots
animated + self-removed via the Web Animations API (same pattern as `floatAcquired`). Kinds:
`spark` (white→orange), `ember` (warm), `steam` (cool white). Emission is rate-limited per station
via `fxAcc` accumulators in the main `tick` (so it scales with frame time, not frame count).

| Station | Feedback added | Component |
|---------|----------------|-----------|
| **Grind / wheel** | wheel juddering + spark shower while grinding | Response + Satisfaction |
| **Smelt / bellows** | ember bursts from the furnace mouth while pumping; `#furnaceGlow` opacity ramps live with the heat gauge (0→0.9) | Satisfaction + Clarity |
| **Hammer / anvil** | spark burst + `.anvil.recoil` nudge on each strike beat (~0.28 s, matched to the hammer-strike anim) while the sword advances | Satisfaction |
| **Quench / pour** | `#quenchFlash` white pop + rising steam puff at the blade on pour | Satisfaction |
| **Dragon** | ember trail off the flame tip while breathing | Fit |

No new art, no new LAYOUT keys (the cauldron glow was added in Phase 2). Furnace glow + cauldron
glow persist; sparks/embers/steam are transient (they render in-browser; a single headless frame
won't reliably freeze mid-flight particles).

## Numbers (starting values — tune on a real playtest)

- Grind sparks: 3 dots every 0.05 s while grinding, life 0.34 s. `GRIND_RATE=0.5` (full grind in 2 s) unchanged.
- Bellows embers: 3 dots every 0.13 s while pumping, life 0.66 s. `HEAT_RISE=42/s` unchanged.
- Strike: 5 sparks + recoil every 0.28 s while striking (≈ the 0.3 s `hammerStrike` cadence).
- Quench: 12 steam dots, life 0.92 s, one white flash (0.5 s).
- Dragon: 2 embers every 0.08 s while breathing.

Test plan: on a real device, each action should read as "it did something" within one frame
(Satisfaction: ≥2 channels — motion + particles — fire per action). If a burst reads as noise,
halve `n`; if too weak, raise `dist`/`size`.

## Verification

- `?test` self-test **GREEN**; no console errors after wiring `wireGrindWheel` + the `tick` hooks.
- `?fxdemo` (temporary, removed) forced grind+bellows+dragon on at once — confirmed the wheel seats
  the prepped orb, the furnace glow ramps with heat, the dragon flame + hint all fire, no errors.
- Portrait build (`Swordforge_new_looptest.html`) untouched (this branch only edits the landscape file).

## Non-goals / next

- Porting the juice + wheel-grind back into the portrait build and `swordforgeV2` (do at infusion).
- Audio (no audio layer in the loop-test) — the "2 feedback channels" here are motion + particles.
- A rhythm-timing layer on the bellows/grind (currently hold-to-fill); revisit if the hold feels flat.
