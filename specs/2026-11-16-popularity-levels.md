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
| 1 to 2 | **12** (R135; R133 had 7) | 20 |
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

## R134: the level-up window

Owner (2026-11-16): "I want a similar window popup when popularity goes up. this window will also have some texts like 'people
are starting to notice.' at level 1, then at level 2 'Nearby town folks are talking about your swords.'" Their "level 1" is the
first level-up (the game starts at level 1, so it reaches level 2). The draft (the window and the lines for levels 4 on) was
shown with R133's question; the owner went on to R132-R133.

| Part | Content |
| --- | --- |
| Title | "Popularity Up!" |
| Icon | a star, and "Level 2" |
| Line | the level's line (below), in italics |
| Bonus | "Swords now sell for 10% more" (`popMul`: 10%, 21%, 33%, ...) |
| Button | OK |
| Burst | the sale window's gold burst (`SALE_FX`) on its own canvas (`#popFx`) |

| Level reached | Line (`POP_LINES`) |
| --- | --- |
| 2 | "People are starting to notice." (owner) |
| 3 | "Nearby town folks are talking about your swords." (owner) |
| 4 | "Travellers stop in OakHaven just to see your blades." |
| 5 | "Your swords are the talk of Whitefield." |
| 6 | "Knights ask for your work by name." |
| 7 | "Your name is known in every town on the map." |
| 8 on | "Bards sing of the blacksmith of OakHaven." |

**When:** a sale that raises the level opens it after the sale window's CLAIM, once the coins have landed (`POP_UP_MS` 950 ms),
or at once for an unpaid sale (Garric refusing). Its OK runs the sale's next steps (the tutorial hooks, the customer, the
thank-you, exp), so nothing opens over it. It replaces the "Popularity level N" toast (R90's ticked toasts: 26).

## R135: level 2 needs 12 (2026-11-16)

Owner: "i have been getting 2 popularity points for each customer till tc3. i should have 12 points by now, but the popularity
tab shows 6/7, and it is stuck at 6." then "swords are bound to be epic for balanced, and fine for fire. so after gc4, we should
have 12 points. raise level 2 point required to 12". R133 counted every sword Fine; in play the guided balanced swords are Epic
(2 points) and the fire swords Fine (1), so the hold threw points away.

| Sales | Tiers | Points |
| --- | --- | --- |
| TC1, GC1-GC3, TC2 (balanced) | Epic | 2 each = 10 |
| TC3 (fire) | Fine | 1 (Day 1: 11) |
| **GC4** (durable, Day 2's first) | Fine | 1: **12, level 2** |
| GC5-GC7 (fire) | Fine | 3 |
| TC4 (durable, EPIC asked) | Epic | 2 |
| GC8 (Weak asked) | Weak | 0 |
| TC5 (gale) | Fine | 1 |
| the waiting customer (gale Katana + fire Claymore, one sale) | Fine | 2 |
| Bram's return (swift Dagger) | Fine | 1 |
| GC9 (gale) | Fine | 1 |
| **Garric** (balanced, Epic for his best grade) | Epic | 2: **12, level 3** |

So level 1 to 2 needs **12** (was 7); level 2 to 3 stays **12**. With these tiers the bars fill at GC4 and at Garric by the
points alone, and the tutorial's hold (R133) throws nothing away; it still holds a player whose tiers differ.
