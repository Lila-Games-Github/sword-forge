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
