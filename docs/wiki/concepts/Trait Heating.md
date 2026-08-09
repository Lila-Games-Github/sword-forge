---
type: concept
updated: 2026-08-08
layer: derived
status: current
verified_commit: 0f30699
specs: ["specs/game-design.md"]
anchors:
  - {kind: file, path: index.html, probe: "function initiateHeatSequence"}
  - {kind: file, path: index.html, probe: "function handlePulleyClick"}
  - {kind: file, path: index.html, probe: "function handleBellowClick"}
  - {kind: file, path: index.html, probe: "function updateInteractiveHeatLoop"}
  - {kind: file, path: index.html, probe: "const heatConfigs"}
  - {kind: file, path: index.html, probe: "function resolveInteractiveHeatMinigame"}
  - {kind: file, path: index.html, probe: "const QUALITY_ORDER"}
  - {kind: file, path: index.html, probe: "function healthQualityCap"}
related: ["[[Grid Exploration]]", "[[Forging Pipeline]]"]
tags: [gameplay, minigame, quality]
---

SUBORDINATE TO `specs/game-design.md` - that spec wins on any conflict with this page.

## What it is

The heating mini-game that fuses a discovered trait onto the active blade, plus the
quality-tier system it feeds. Triggered by the Heat button: `initiateHeatSequence` runs
the pulley (`handlePulleyClick`) then the bellows/stabilize loop (`handleBellowClick`,
`updateInteractiveHeatLoop`). Every one of the 24 traits has its own band/timing variant
defined in `heatConfigs` - `specs/game-design.md` §4 has the full per-trait table (static
tweaks, dynamic/random bands, sequential/hidden stages).

Stabilizing before a per-trait countdown expires resolves at `Epic`; timing out still
fuses the trait but one tier down at `Fine` (`resolveInteractiveHeatMinigame`). Quality
tiers are `QUALITY_ORDER = ['Weak','Fine','Epic']`. The heat outcome is the **first** stage
of a four-stage quality chain (heat -> HP cap -> hammer penalty -> sharpen over-hone,
`specs/game-design.md` §4): `healthQualityCap` implements the HP-cap stage (>=80 Epic,
40-79 Fine, <40 Weak), applied only to manual forges.

## Where the code lives

- Sequence entry + pulley/bellows: `initiateHeatSequence`, `handlePulleyClick`,
  `handleBellowClick` - `index.html`.
- Band/loop update: `updateInteractiveHeatLoop`.
- Per-trait variants: `heatConfigs` (const object).
- Outcome resolution: `resolveInteractiveHeatMinigame`.
- Quality tier constants + HP cap: `QUALITY_ORDER`, `healthQualityCap`.
- The remaining two stages of the quality chain (hammer penalty, sharpen over-hone) live
  in [[Forging Pipeline]] (`dropTiers`, `sharpenTiersFor`).

## Not covered here

The "New Trait Discovered!" modal and record-composition reminder are UI/tutorial glue
around a successful heat, not part of the minigame mechanics - see [[Tutorial Flow]].
