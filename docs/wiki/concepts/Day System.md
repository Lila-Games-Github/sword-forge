---
type: concept
updated: 2026-08-08
layer: derived
status: current
verified_commit: 0f30699
specs: ["specs/game-design.md"]
anchors:
  - {kind: file, path: index.html, probe: "const CUSTOMERS_PER_DAY"}
  - {kind: file, path: index.html, probe: "function onDayFull"}
  - {kind: file, path: index.html, probe: "function requestEndDay"}
  - {kind: file, path: index.html, probe: "function runDayTransition"}
  - {kind: file, path: swordforgeV2.html, probe: "const CUSTOMERS_PER_DAY"}
related: ["[[Customer Economy]]", "[[Passive Shop]]"]
tags: [gameplay, economy]
---

SUBORDINATE TO `specs/game-design.md` - that spec wins on any conflict with this page.

## What it is

The pacing wrapper around [[Customer Economy]]: exactly `CUSTOMERS_PER_DAY` (7) customers
are handled per day (a sale or a refusal both count), after which the Counter clears and
no more arrive until the player taps End Day (`onDayFull`/`requestEndDay`). Day 1 requires
all 7 served before End Day is enabled; day 2+ enables it after `EARLY_END_MIN` (3) -
`specs/game-design.md` §6 "Day system" has the exact confirm-box copy for early vs. full
endings.

Confirming End Day runs a fade transition (`runDayTransition`) that advances the day,
resets the per-day customer count, restocks every unlocked metal by `DAY_METAL_BONUS`
(7), and summons the new day's first customer (day 2's opener is always Bram, per
`specs/game-design.md` §6). Gold, Vault, Reputation, Shop, and Blueprints persist across
the transition.

## Where the code lives

- Per-day constants + counters: `CUSTOMERS_PER_DAY`, `EARLY_END_MIN` (consts near
  `currentDay`/`customersToday`) - `index.html`.
- Day-full handling + End Day button: `onDayFull`, `requestEndDay`.
- Day rollover: `runDayTransition`.
- `swordforgeV2.html` defines its own `CUSTOMERS_PER_DAY` for the parallel V2 build.

## Not covered here

The five one-off quests (`specs/game-design.md` §6 "Quests") and the Diary panel are UI
layered on top of day/customer events; not separately routed in this pass.
