# The sale window (R130, 2026-11-16)

Build: `Swordforge_looptest_landscape.html`. Tracker: R130 in `specs/2026-10-23-ftue-smelter-rework-plan.md`. Test:
`node tooling/ftue/ftue.test.mjs` (the R130 checks).

Owner (2026-11-16): "on selling a sword, i want a popup window, like the reward windows, showing the gold earned, gold icon and a
claim button. clicking this claim button shows the gold flying from the window to the gold tab in the inventory."

## What happens

A sale at the counter that pays gold (`sellCounter`, `paidAll > 0`) opens the **sale window** (`#sfSaleModal`), in the reward
window's style:

| Part | Content |
| --- | --- |
| Title | "Sword Sold!" (an order of several swords: "2 Swords Sold!") |
| The gold | a large coin icon and "+44g": the whole sale (with any held swords of the order) |
| Below it | "+1 popularity" when the sale gave popularity, else nothing |
| Button | **CLAIM** |

**CLAIM** closes the window, then the coins fly from the window's coin to the gold counter in the inventory panel (`flyCoins`,
the quest claim's coins); the count stays at the old value until they land, then shows the new total with a "+44g" pop.

## What changed with it

- **The gold is the player's at the sale**, as before; the window and the coins only show it.
- **The after-sale steps wait for CLAIM:** the tutorial's sale hooks (Bram's, TC2, TC3, the gale sale, Bram's return, Garric),
  a gameplay customer's sale (`ftueGpcSold`, its reward window and the next bell), the thank-you line, the exp and the
  popularity level toast. So nothing opens on top of the sale window, and the next step follows the claim.
- **The coins no longer fly from SELL** (r268); they fly from the window.
- **The "Sold for 44g" toast is gone** (the window says it); R90's count of the owner's ticked toasts drops from 28 to 27.
- **A sale that pays nothing** (Garric refusing a grade-1 sword) opens no window: its toast and the steps run at once.

## The gold burst (R131, 2026-11-16)

Owner: "can we have the same, particle explosion effect as when we get for trait discovery. for gold window it should have gold
color only and smaller burst". The sale window bursts as it opens, with the trait window's burst (R58-R59: a ring, glowing
sparks and flipping confetti from the window's edge, then a smaller second burst), from its own table `SALE_FX`:

| Value | Trait window (`ACQ_FX`, Fine) | Sale window (`SALE_FX`) |
| --- | --- | --- |
| Particles | 70 | 40 (second burst 18) |
| Speed | 380-820 px/s | 260-560 px/s |
| Size | 5-10 px | 4-8 px |
| Life | 0.7-1.3 s | 0.6-1.1 s |
| Ring | 320 px, 0.55 s, 6 px | 200 px, 0.5 s, 5 px |
| Colours | the tier's colour, gold, white | deep gold `[232,163,23]`, gold `[255,214,90]`, pale gold `[255,236,160]` (the ring deep gold) |
| Second burst | 0.35 s later, x0.45 count, x0.6 speed and ring | 0.3 s later, the same factors |

Drag, fall, spin and the colour mix (50% / 35% / 15%) are the trait window's. Visual only; the burst code (`acqBurst`) now takes
the window and the table.

## Stars for popularity (R132, 2026-11-16)

Owner: "remove the +2 popularity here, instead star icon x2 popularity points. I want these stars flying to the popularity tab
as well." The window shows a star and "×2" (the sale's popularity points) in place of "+2 popularity"; none when the sale gave
none. CLAIM flies the stars, one per point (at most 5, `POP_FLY_MAX`), from the window's star to the popularity counter
(`#popVal`) beside the coins to the gold, on the coins' path and timing (`flyCoins(..., html, n, cls)`); the counter keeps its
old text until they land.
