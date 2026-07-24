# Variation A — Prototype Handoff

**Branch:** `variation-a-prototype` · **Base:** `main @ f5a32f8` · **Date:** 2026-07-25
**Status:** playable prototype. Not merged, not deployed. `main` is untouched.

This document is the entry point. Read it first, then the design specs it links.

---

## 1. What this is

A working implementation of **Variation A** of the Sword Forge loop redesign — the "Mine" model, for a
**mobile F2P** target. It reclassifies a trait from *a fact you learn once* into *a material you spend every
craft*, which closes the resource loop the current game doesn't have.

> **A sword is an alloy you walked for, a charge you extracted, and a craft you performed.**

It was built by a multi-agent workflow (5 recon → 1 plan → 7 serial implementation passes → 4 verify → 1
repair) against the design specs. It is a **prototype to feel, not shippable code** — see §6.

## 2. How to run it

```
git checkout variation-a-prototype
open index.html            # no server needed; single self-contained file
```

To start over from a clean state, use the **Reset Save 🗑️** button (bottom-right, with the cheats) or clear
`localStorage` key `swordforge_save_v1`. A save auto-loads on boot and skips the intro/tutorial once one exists.

## 3. The design, in one screen

| Axis | Source | Player skill |
|---|---|---|
| **Alloy** — what the blade is made of | the metals your route spends (`usedMetals`) | route planning |
| **Charge** — what it's infused with | essence extracted at trait nodes, **spent per craft** | node choice + heat |
| **Craft** — how well it's made | hammer / quench / design / sharpen performance | execution |

**The core loop:** plan a route on the Chart → dash out (metals spent = alloy; hazards cost HP + impurity)
→ heat a node (performance = essence yield, ring = purity) → forge (spend essence into charge; alloy grade
caps quality) → sell (paid for the requested trait + capped extras). Claims automate *volume* at low purity;
**peak purity always requires a hand-dig** — that one rule keeps it a crafting game, not an idle spreadsheet.

Full design: `specs/variation-a-the-mine.md` (supply) and `specs/variation-a-demand-and-towns.md` (demand).
Diagnosis that motivated it: `specs/loop-progression-teardown.md`. Options considered:
`specs/loop-redesign-options.md`. Visual walkthrough: the "first-pass" artifact.

## 4. What changed in the code

All in `index.html` (single file, ~847 lines of diff). Grouped by the 7 implementation passes:

| Pass | System | Key identifiers |
|---|---|---|
| I1 | Ringed node instances replace fixed trait coords | `mapNodes`, `nodesByIndex`, `ringOf()`, node `{ring,purity,charges,claimed,banked,surveyed}` |
| I2 | Heat outcome → essence **yield**; ring → **purity** | `essence{}`, `addEssence()`, `spendEssence()`, `essenceTotal()`, `heatYield` |
| I3 | Tap = dense alloy / hold = thin; impurity | `alloyGrade()`, `alloyGradeFor()`, `alloyImpurity` (replaced `hazardGoldLost`) |
| I4 | Forge spends essence; charge+alloy+craft = value | Part-0 essence stepper (`#essenceModal`), `CRAFT_MULT`, `ALLOY_MULT`, re-derived `getSwordTier` (25/60/120/200) |
| I5 | Requests ask intensity; capped sale; Auto-Craft repriced | `requestedCharge`, sale `rv + min(other, 0.25*rv)`, `quickCraft` now spends essence + caps a tier down |
| I6 | Claims — the idle layer | `claimNode()`, `collectClaim()`, `upgradeClaimRate/Capacity/Purity()`, purity locked at ≤1 |
| I7 | Chart fog · tutorial reconciliation · persistence | `buildMinimapStatic` draws surveyed-only + rumours; `saveGame()`/`loadGame()`/`resetSave()`, `SAVE_KEY='swordforge_save_v1'` |

**Deleted:** `healthQualityCap()` (HP no longer caps quality — it's the expedition budget), `traitCoordinates`
(replaced by nodes), `SUM(traits)` pricing, the auto-disable on "I have something for you."

**Specs updated in the same change** (repo rule): `specs/game-design.md` rewritten to current behaviour;
`plan.md` has a Variation-A note.

## 5. What was verified — and what wasn't

**Verified** (static + workflow's own checks): `node --check` clean on all extracted script; essence is
genuinely consumed on forge *and* Auto-Craft; sale uses the capped formula; alloy grade caps quality; claims
can never reach purity 3; tier thresholds span the range; no dangling inline-`onclick` references.

**3 blocker/major issues were found and fixed** during the run:
1. Tutorial gate desync — a multi-block dash advanced the tutorial on pass-through cells → gate now checked
   once against the landing cell (`checkTutorialMoveGate()`).
2. `quickCraft` clobbered a paused `forgeCtx` → added the `resumeForge()` guard.
3. Claims UI rendered behind the Chart modal → `#nodePanelModal { z-index:1016 }`.

**NOT verified:** nobody has watched a full human playthrough. Browser automation was declined during
handoff, so runtime feel, balance, and the full tutorial path are unconfirmed by direct observation.

## 6. Known issues / next steps

- **[minor, open]** The post-tutorial "record composition" reminder reuses `#tutorialModal` (z 1010) and can
  land over `#essenceModal` (z 1005) if you reach Forge within 400ms of dismissing the New-Trait popup.
  Recoverable (its OK button works). Left for a play-first decision.
- **Balance is a first pass.** All economy constants (essence yields, claim rates/costs, value multipliers,
  tier thresholds) are placeholders. The diagnostic from the design: **if a 10-min session drifts toward
  collect→upgrade→collect, the purity caps are wrong and the crafting game is dying.**
- **Cheats still ship** (`+100 Gold/Metals`, `Skip Stage`, `Reset Save`) — intended for prototype testing;
  gate or remove before any real build.
- **Deliberately deferred** (not in this MVP): shape/alloy affinity (spec §4.2b), the order-board generator,
  standing/Diary wiring, Town 2 + cross-town recipes. These assume the core loop holds first.
- **Highest open risk:** does the expedition survive hundreds of repetitions? Prototype and feel this before
  building more on top of it.

## 7. If you want to keep or discard

- **Keep going:** work on this branch; the specs in `specs/variation-a-*.md` are the source of truth.
- **Discard:** `git checkout main` — nothing here has touched it.
- **Compare:** `git diff main variation-a-prototype -- index.html`.
