# The design desk after the tutorial (R141, 2026-11-18)

Build: `Swordforge_looptest_landscape.html`. Tracker: R141 in `specs/2026-10-23-ftue-smelter-rework-plan.md`. Test:
`node tooling/ftue/ftue.test.mjs` (the R141 checks).

Owner (2026-11-18): "design desk should be available in game after tutorial".

## Cause

- The desk unlocks only through Garric's reward window (D130b, `{ kind:'unlock', id:'designDesk' }`, `FTUE_ST.desk=true`).
- The GAME jump (`ftuePart(7)`) builds on the part 6 jump, which sets `FTUE_ST.desk=false`, and never unlocks it; free play
  (`smFreePlay`, `?freeplay`) starts from `ftueFresh()` (`desk:false`) and never unlocks it. So after the tutorial the desk
  showed locked ("The design desk is locked", the grey prop) in both.

## Rule

- **`deskOn()` = `FTUE_ST.desk || FTUE_ST.done`.** In the tutorial the desk stays locked until Garric's reward, as before; once
  the tutorial is done it is open, however the game got there (a full play, the GAME jump, free play, an older save).
- Every desk gate reads `deskOn()`: the basement prop's tap, the prop's locked look, and `openDesign()` (the craft book's gear
  goes through it too).
- The basement arrow needs no change: after the tutorial every arrow is known (R70, `exitKnown`).
