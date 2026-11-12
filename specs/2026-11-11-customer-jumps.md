# Customer jumps (R109, 2026-11-11)

A test aid: start a new game at any tutorial customer, waiting at the bell. Build:
`Swordforge_looptest_landscape.html`. Tracker: R109 in `specs/2026-10-23-ftue-smelter-rework-plan.md`.

Owner: "for console helper, can you make a separate part for each customer?" Proposal accepted: one jump per customer
(18), a console call `ftueCust('<id>')` beside `ftuePart(n)`, and a CUSTOMER dropdown in the cheat bar beside the PART
buttons ("Dropdown picker"). Like the PART jumps, the state is approximate (gold and exp are guesses): a test aid, not a
save. All of it leaves the external tester copy with the other cheats (see the external build plan, when built).

## How a jump works

`ftueCust(id)` finds the row in `CUST_JUMPS` and calls `ftuePart(base, row)`: the PART jump builds its state, then the
row's `set` changes it (before the HUD, the counter and the bell are drawn). The customer waits at the bell; ringing it
starts that customer as in play, with its ore window (R108). Unknown id: a message naming the valid ids, nothing starts.

## The jumps (play order)

| Id | Base | Changes after the base |
| --- | --- | --- |
| TC1 | PART 1 | none (a new game) |
| GC1 | PART 2 | part 1, order 0, stage `p1-bell`; no blueprints; the craft book lesson and the craft frame not yet seen (`bookSeen`, `craftFrame` false); the market not yet seen |
| GC2 | PART 2 | part 1, order 1, stage `p1-bell`; blueprint balanced Longsword; book lesson and craft frame not yet seen |
| GC3 | PART 2 | part 1, order 2, stage `p1-bell`; blueprints balanced Longsword, Broadsword |
| TC2 | PART 2 | none |
| TC3 | PART 3 | none |
| GC4 | PART 4 | part 3, order 0, stage `p3-bell`; Durable not discovered; the basic-vs-elemental map window not yet seen (`seenParts2` false); no fire blueprints; design parts balanced 1; Day 2's cave stocked (`FTUE.day2Cave`), the pickaxe home |
| GC5 | PART 4 | part 3, order 1, stage `p3-bell`; no fire blueprints; design parts balanced 1 |
| GC6 | PART 4 | part 3, order 2, stage `p3-bell`; blueprint fire Longsword; design parts balanced 1, flame 1 |
| GC7 | PART 4 | part 3, order 3, stage `p3-bell`; blueprints fire Longsword, Broadsword |
| TC4 | PART 4 | none |
| GC8 | PART 4 | part 4, order 0, stage `p4-bell`; TC4's lessons seen (`pipsSeen`, the tiers window); the ladle shown |
| TC5 | PART 4 | part 4, order 1, stage `d2-bell`; as GC8 |
| WC (the waiting customer) | PART 5 | part 4, order 1, stage `p4-bell`; no waiting order, COME LATER and the market not yet introduced (`waiting` empty, `laterOn`, `seenMarket` false); gold 300 (under the 750 that calls the dragon's ledger guide) |
| BRAM2 | PART 5 | none |
| GC9 | PART 6 | part 5, order 0, stage `p5-bell`; no gale Longsword blueprint |
| GARRIC | PART 6 | none |
| GAME | GAME (7) | none |

Ids are matched without case (`ftueCust('gc5')` works). The dropdown lists the same 18 in this order, labelled with the
id and the order ("GC5 fire Longsword"). TC1 and GAME answer with the PART message (a new game; just after the tutorial).

## Found while checking (fixed in R109)

- A new game (every PART jump) kept the last game's scripted customers: after TC3 had arrived, the next jump showed her
  request panel over the bell, and the tap hit the panel. `tutReset` now clears `TUT_FIRE_STATE`, `TUT_FIRE_RUN`,
  `TUT_BRAM2_STATE`, `TUT_GARRIC_STATE`.
- A new game kept an open window: GC8's ore window stayed over the next jump's bell. `newGame` now closes every open
  window (`.sf-modal.show`), drops the reward window's pending step and the order hook (`RW_THEN`, `SAY_THEN`).

## Checked

In the browser, each of the 18 picked from the dropdown, then the bell tapped: every jump brought its own customer
(GC1-GC3 the balanced Longsword, Broadsword, Katana; TC2; TC3; GC4 Durable Shortsword with Durable hidden, 2 nickel in
the cave, the map window unseen; GC5-GC7 the fire orders; TC4; GC8 the Weak order; TC5 the gale order; WC the two-sword
order at 300 gold; Bram's Dagger; GC9 the gale Longsword; Garric). TC1 starts D1; GAME is Day 3 with the tutorial done;
`ftueCust('gc4')` works; an unknown id lists the valid ones.
