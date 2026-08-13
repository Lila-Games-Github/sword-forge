---
type: entity
updated: 2026-08-08
layer: derived
status: current
verified_commit: 0f30699
specs: ["specs/game-design.md"]
anchors:
  - {kind: file, path: index.html, probe: "const tutorialFlow"}
  - {kind: file, path: index.html, probe: "function playTutorialStep"}
  - {kind: file, path: index.html, probe: "function skipTutorial"}
  - {kind: file, path: index.html, probe: "function openTutorialReview"}
  - {kind: file, path: index.html, probe: "function showHands"}
  - {kind: file, path: swordforgeV2.html, probe: "const tutorialFlow"}
related: ["[[Grid Exploration]]", "[[Trait Heating]]", "[[Forging Pipeline]]", "[[Customer Economy]]"]
tags: [onboarding, architecture]
---

SUBORDINATE TO `specs/game-design.md` - that spec wins on any conflict with this page.

## What it is

The data-driven onboarding engine. `tutorialFlow` is an array of steps, each either a
dialogue (`text`/`title`/`frame`), an `action` (`highlight`/`delay`/`afterCustomer`), or a
`waitAction` gate that blocks progress until the matching gameplay function reports the
action happened (per `CLAUDE.md`: "gameplay functions advance it by checking
`tutorialFlow[tutorialStep].waitAction`"). Gates can carry a `hand` spec rendered by
`showHands` - the bouncing pointer that guides the player to the next UI element.
`playTutorialStep` drives the array forward; `skipTutorial` unlocks everything and ends
the flow early; `openTutorialReview` re-opens past dialogue boxes from the info button
after the tutorial ends. The full scripted step-by-step sequence (metals -> heat -> forge
-> sell -> chart -> Purify unlock -> shop guide) is canon in `specs/game-design.md` §8
"Onboarding".

This is the load-bearing integration point across [[Grid Exploration]], [[Trait Heating]],
[[Forging Pipeline]], and [[Customer Economy]] - the tutorial gates and hand-pointers touch
all four systems in sequence, and each of those systems' functions has tutorial-specific
branches (e.g. easier heat timers, slower hammer rings) that only make sense in light of
this state machine.

## Where the code lives

- Step data: `tutorialFlow` (const array) - `index.html`.
- Driver: `playTutorialStep`.
- Early-exit: `skipTutorial`.
- Review UI: `openTutorialReview`.
- Hand-pointer rendering: `showHands`.
- `swordforgeV2.html` defines its own parallel `tutorialFlow` for the V2 guided-tutorial
  build; not the same array, do not assume parity.

## Not covered here

The individual gameplay-side `waitAction` checks living inside each system's own functions
(e.g. the heat/forge/move functions) are covered on their respective pages, not restated
here.
