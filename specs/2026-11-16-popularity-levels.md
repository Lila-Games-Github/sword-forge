# Popularity levels in the tutorial; the level-up window (R133-R134, 2026-11-16)

Build: `Swordforge_looptest_landscape.html`. Tracker: R133, R134 in `specs/2026-10-23-ftue-smelter-rework-plan.md`. Test:
`node tooling/ftue/ftue.test.mjs` (the R133 and R134 checks; the build keeps the values between the `POP-LEVELS` markers).

## R133: when the levels come

Owner (2026-11-16): "Tweak the popularity points required so players reach level 2 popularity right after selling the first
sword on day 2. level 3, right after selling garric's sword."

Popularity comes only from counter sales: a sale's best tier gives Weak 0, Fine 1, Epic 2 (`POP_GAIN`, unchanged). The game
starts at level 1 with 0 points.

### The points each level needs (`POP_LEVELS`)

| Level | Points to the next | Before R133 |
| --- | --- | --- |
| 1 to 2 | **7** | 20 |
| 2 to 3 | **12** | 20 |
| 3 on | 20 (`POP_CAP`) | 20 |

The tutorial's sales, with the tiers it asks for (TC4 Epic, GC8 Weak) and the rest Fine: TC1, GC1-GC3, TC2, TC3 (6 points by
the end of Day 1), then **GC4, Day 2's first sale, is the 7th point**; GC5-GC7 (3), TC4 (2), GC8 (0), TC5 (1), the waiting
customer's two (2), Bram's return (1), GC9 (1) and **Garric (1, or 2 when Epic) make 11-12**. So the bars fill at those two
sales.

### The tutorial holds them there (`popStep`, `popGoal`)

Tiers vary (a Weak sword gives nothing, an Epic two), so while the tutorial runs (`!FTUE_ST.done`):

- **Day 2's first sale** (the first sale with `FTUE_ST.part >= 3` while the level is 1; GC4) **always reaches level 2**.
- **Garric's sale** (`TUT_GARRIC_STATE === 'asked'`, paid or refused) **always reaches level 3** (from level 1 too).
- **Every other tutorial sale** adds its points but stops one short of the next level (6 of 7, 11 of 12).
- A set level-up starts the new level at 0 points.

After the tutorial, points carry over level by level as before (`while(POP >= need) ...`). The PART and CUSTOMER jumps start at
level 1; the first sale after a jump into Day 2 reaches level 2.
