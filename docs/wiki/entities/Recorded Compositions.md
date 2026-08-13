---
type: entity
updated: 2026-08-08
layer: derived
status: current
verified_commit: 0f30699
specs: ["specs/game-design.md"]
anchors:
  - {kind: file, path: index.html, probe: "let savedBlueprints"}
  - {kind: file, path: index.html, probe: "function saveRecipe"}
  - {kind: file, path: index.html, probe: "function openRecordModal"}
  - {kind: file, path: index.html, probe: "function confirmRecord"}
  - {kind: file, path: index.html, probe: "function keepBothRecord"}
  - {kind: file, path: index.html, probe: "function openCompositionsModal"}
  - {kind: file, path: index.html, probe: "function renderBlueprints"}
  - {kind: file, path: index.html, probe: "function selectBlueprint"}
  - {kind: file, path: index.html, probe: "function deleteBlueprint"}
related: ["[[Forging Pipeline]]", "[[Trait Heating]]"]
tags: [gameplay, economy]
---

SUBORDINATE TO `specs/game-design.md` - that spec wins on any conflict with this page.

## What it is

`savedBlueprints` is the array backing "Recorded Compositions" - named saves of a trait
set + the metal composition used to build it, keyed by trait set (not by name). Recording
is never silent: `saveRecipe` opens a confirmation box (`openRecordModal`) that branches on
whether the trait set is new (`confirmRecord`) or already recorded, in which case the
player chooses Update (replace in place) or Keep Both (`keepBothRecord`, saves a second
entry with the same traits but a different metal recipe) - `specs/game-design.md` §6 has
the exact box copy and behavior.

The Counter's "Recorded Compositions" button opens a tile-grid -> drill-in-detail modal
(`openCompositionsModal`/`renderBlueprints`/`selectBlueprint`/`deleteBlueprint`). Each
detail view's **Auto-Craft** button feeds a saved composition straight into
[[Forging Pipeline]]'s `quickCraft` entry point, which runs a detached heat using the
composition's last-acquired trait before continuing the normal shape/hammer/design/sharpen
stages.

## Where the code lives

- Backing store: `savedBlueprints` (module-level array) - `index.html`.
- Record flow: `saveRecipe`, `openRecordModal`, `confirmRecord`, `keepBothRecord`.
- Browse/manage modal: `openCompositionsModal`, `renderBlueprints`, `selectBlueprint`,
  `deleteBlueprint`.
- Auto-Craft consumer: `quickCraft` in [[Forging Pipeline]].

## Not covered here

`findValidBlueprintIndex` is defined in `index.html` but currently dead code (per
`specs/game-design.md` §5) - not a live part of this system; noted for awareness only.
