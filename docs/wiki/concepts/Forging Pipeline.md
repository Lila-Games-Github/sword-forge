---
type: concept
updated: 2026-08-08
layer: derived
status: current
verified_commit: 0f30699
specs: ["specs/game-design.md"]
anchors:
  - {kind: file, path: index.html, probe: "function forgeSword"}
  - {kind: file, path: index.html, probe: "function quickCraft"}
  - {kind: file, path: index.html, probe: "function openShapeModal"}
  - {kind: file, path: index.html, probe: "function openHammerModal"}
  - {kind: file, path: index.html, probe: "function openCoolModal"}
  - {kind: file, path: index.html, probe: "function openForgeDesign"}
  - {kind: file, path: index.html, probe: "function openSharpenModal"}
  - {kind: file, path: index.html, probe: "function completeForge"}
  - {kind: file, path: index.html, probe: "function closeForge"}
  - {kind: file, path: index.html, probe: "function dropTiers"}
  - {kind: file, path: index.html, probe: "function sharpenTiersFor"}
  - {kind: file, path: swordforgeV2.html, probe: "function forgeSword"}
related: ["[[Trait Heating]]", "[[Recorded Compositions]]", "[[Grid Exploration]]"]
tags: [gameplay, minigame, quality]
---

SUBORDINATE TO `specs/game-design.md` - that spec wins on any conflict with this page.

## What it is

The 4-part pipeline that turns a heated blade into a finished sword: shape select ->
hammer -> quench (skipped for a `flame`-trait blade) -> design fittings -> sharpen. A
manual forge runs `forgeSword`; Auto-Craft (from a recorded composition) runs `quickCraft`,
which prepends a detached heat step - see [[Recorded Compositions]]. Each stage is its own
modal; `closeForge`/`resumeForge` pause and resume the in-progress `forgeCtx` without
discarding it (`specs/game-design.md` §5 has the exact pause/resume guarantees per stage).

The pipeline is also where the last two stages of the quality chain apply: hammer misses
drop tiers via `dropTiers` (`⌊misses/2⌋` tiers), and grinding past the 110% "keen" window
on the sharpen stage drops tiers via `sharpenTiersFor` (`specs/game-design.md` §4 has the
exact formulas - see [[Trait Heating]] for the first two stages of the chain).
`completeForge` folds all of it together and moves the sword into the Vault.

## Where the code lives

- Entry points: `forgeSword` (manual), `quickCraft` (Auto-Craft) - `index.html`.
- Stage modals in order: `openShapeModal`, `openHammerModal`, `openCoolModal`,
  `openForgeDesign`, `openSharpenModal`.
- Completion + quality-chain fold-in: `completeForge`.
- Pause/resume: `closeForge` / `resumeForge`.
- Quality-drop math: `dropTiers`, `sharpenTiersFor`.
- `swordforgeV2.html` has its own `forgeSword` for the parallel V2 build (path-map
  furnace + guided tutorial) - treat as a separate implementation, not a shared function.

## Not covered here

Trait-specific part art (`traitSkins`, `partsFor`) and the value/tier formulas
(`specs/game-design.md` §5 "Sword value & tiers") are downstream of this pipeline but not
separately routed in this pass.
