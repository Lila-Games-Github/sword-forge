---
type: concept
updated: 2026-08-08
layer: derived
status: current
verified_commit: 0f30699
specs: ["specs/game-design.md"]
anchors:
  - {kind: file, path: index.html, probe: "function setRandomRequest"}
  - {kind: file, path: index.html, probe: "function presentCustomerDialogue"}
  - {kind: file, path: index.html, probe: "function presentCustomerDialogueSequence"}
  - {kind: file, path: index.html, probe: "function searchInventory"}
  - {kind: file, path: index.html, probe: "function refuseCustomer"}
  - {kind: file, path: index.html, probe: "function sellSword"}
related: ["[[Day System]]", "[[Recorded Compositions]]", "[[Forging Pipeline]]"]
tags: [gameplay, economy, narrative]
---

SUBORDINATE TO `specs/game-design.md` - that spec wins on any conflict with this page.

## What it is

The active-selling loop at the Counter screen: NPC customers request a trait (sometimes a
shape too), the player either sells a matching sword (`searchInventory` -> `sellSword`) or
refuses (`refuseCustomer`). Requests #1-3 are scripted (any weapon, then Flame, then an
"ice-dragon" trait-inference customer teaching Recorded Compositions); #4+ are random, with
named story customers (Bram, June, Roland) slotted in on specific days/slots via
`presentCustomerDialogueSequence` - full scripted lines and trigger conditions are in
`specs/game-design.md` §6.

Payout is `max(1, reputation-adjusted value + craftsmanship bonus - hazard penalty)`
(`specs/game-design.md` §6 has the exact reputation multipliers and the craft-bonus /
hazard-loss formulas, which are stamped onto the sword during [[Forging Pipeline]]'s
`completeForge`). A sale bumps Reputation +1; a refusal -1. Refuse is disabled for the
first 3 customers so the scripted tutorial flow can't be broken.

## Where the code lives

- Request generation + scripted lines: `setRandomRequest` - `index.html`.
- Dialogue reveal (typewriter + multi-beat story customers): `presentCustomerDialogue`,
  `presentCustomerDialogueSequence`.
- Response handlers: `searchInventory` ("I have something for you."), `refuseCustomer`
  ("I don't have what you need."), `sellSword` (completes a sale).

## Not covered here

The 7-per-day pacing and End Day flow are a distinct system - see [[Day System]]. The
passive shopfront (separate income channel) is covered in [[Passive Shop]]. Quests and the
Diary (story-progress UI) are not separately routed in this pass.
