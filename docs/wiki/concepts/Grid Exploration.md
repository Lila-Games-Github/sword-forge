---
type: concept
updated: 2026-08-08
layer: derived
status: current
verified_commit: 0f30699
specs: ["specs/game-design.md"]
anchors:
  - {kind: file, path: index.html, probe: "function generateLayout"}
  - {kind: file, path: index.html, probe: "function initDOMGrid"}
  - {kind: file, path: index.html, probe: "function move(dx, dy, consumeMetal = true, applyHazard = true)"}
  - {kind: file, path: index.html, probe: "function startInlinePurify"}
  - {kind: file, path: index.html, probe: "function applyHazardAtCurrent"}
  - {kind: file, path: index.html, probe: "function handleDeath"}
  - {kind: file, path: swordforgeV2.html, probe: "function move(dx, dy, consumeMetal = true, applyHazard = true)"}
related: ["[[Trait Heating]]", "[[Forging Pipeline]]"]
tags: [gameplay, map]
---

SUBORDINATE TO `specs/game-design.md` - that spec wins on any conflict with this page.

## What it is

The 50x50 fog-of-war grid the player explores to find traits. Seeded RNG (seed `1337`)
lays out 24 fixed-position traits and hazard tiles (20% of cells) via `generateLayout`;
`initDOMGrid` builds the DOM cells and `renderCell` draws them. `move(dx, dy, ...)` is the
single movement chokepoint every dash routes through - see `specs/game-design.md` §3 for
the metal-per-direction table and the diagonal-unlock cost.

Movement distance is decided by the **Purify mini-game**: holding a direction charges a
bouncing slider (`startInlinePurify`), and where it lands on release maps to a 1/2/3-block
dash (`specs/game-design.md` §3 has the exact slider-zone table). Hazard damage only
triggers on the cell the dash **lands on** (`applyHazardAtCurrent`) - crossing over a
hazard mid-dash is harmless. Hitting 0 HP calls `handleDeath`, which shatters the active
blade (clears traits + used metals) but keeps Gold/Vault.

## Where the code lives

- Layout + grid DOM: `generateLayout`, `initDOMGrid`, `traitCoordinates` (const map inside
  `generateLayout`) - `index.html`.
- Movement chokepoint: `move` - `index.html`.
- Purify dash mini-game: `startInlinePurify` (and its resolve/update helpers alongside it).
- Hazard-on-landing check: `applyHazardAtCurrent`.
- Death: `handleDeath`.
- `swordforgeV2.html` reimplements the same `move` chokepoint for the parallel V2
  path-map-furnace build (see [[Forging Pipeline]] for how V2 diverges downstream).

## Not covered here

Camera/pan/zoom behavior and the minimap (Chart) rendering are UI-only wrapping around
this system; not routed separately in this first pass.
