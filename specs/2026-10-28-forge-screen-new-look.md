# The forge screen's new look (2026-10-28)

Status: **canon**, built in steps R25 (the craft frame), R26 (the bedroom calendar), R27 (the right rail and the market on
the counter). Build log: specs/2026-10-23-ftue-smelter-rework-plan.md.

## The request

Owner: "`assets/Anchor-images/Newforge.png` this is the new look for the forge screen. the skill tree replaces the day
tab. market is no longer there (will add a separate image icon on customer counter later) setting moves to bottom right.
There is a wooden frame at the top left with the 5 point trait system, the x is the cancel craft button, the inkpot is the
record craft and the craftbook is the craftbook. the pulley replaces the expand and collapse window. the collapsed
version still shows the craftbook slightly. ask if anything is not clear. all images are in the asset folder."

Answers (2026-10-28):
- Market until the counter icon exists: **a temporary button on the customer counter** (the tutorial still points at it).
- The day: **"the day shows up somewhere in the bedroom wall. like a calendar decor on the wall"**.
- The dragon: **keep him top left** (the open frame covers part of him, as the old panel did).
- The bottom of the rail: **the book is the Diary, the basket is the Quests** (`diary.png`, `questbasket.png`).

## R25: the craft frame (top left)

Art, all on one 264 x 430 canvas so they stack 1:1: `assets/ui/craft_window_frame` (the wood), `inkpot`, `craftbook`,
`craft_window_frame_pulley` (the ring on its rope). Each `.png` has a `.webp` beside it (quality 0.86, full size) that the
game loads.

Placement, measured off the reference: the reference is 1337 px wide, the frame 1080, so 0.8078. The craft book's red
spans x 22-238 of the canvas and x 20-170 of the reference (scale 0.694, left 4.7, top -15); the ring checks it (canvas
x 45-99, y 330-426 lands on the reference's ring, x 37-70, y 237-279). In the frame: **left 4 px, top -12 px, width
148 px** (the top of the wood runs off the frame's top edge, as in the reference).

Boxes, as % of the canvas (the `CRAFT_FRAME` object in the build):

| Box | left | top | width | height | What |
|---|---|---|---|---|---|
| `slots` | 11.6 | 8.0 | 76.4 | 12.4 | the 5 trait slots (`#traitSlots`), as before |
| `cancel` | 63.5 | 21.4 | 22.9 | 14.1 | the X (`#cancelCraft`): cancel craft, asks first (r241) |
| `record` | 17.4 | 25.1 | 33.7 | 28.9 | the inkpot (`#saveBlade`): record craft |
| `book` | 8.0 | 54.0 | 83.3 | 17.9 | the craft book (`#recipeBtn`) |
| `ring` | 17.0 | 76.7 | 20.5 | 22.3 | the pulley ring (`#hudToggle`): opens and closes the frame |

- **Closed (`shut` 63.3):** the frame slides up by 63.3% of the canvas height (272 of 430), so the craft book's lower
  edge (~9 px) and the frame's bottom edge show, with the ring hanging below them (the reference's second picture).
  It starts closed, as the panel did.
- **The ring:** a tap opens or closes; a pull down opens, a push up closes (a drag of 12 px or more).
- **Glow:** the inkpot, the book and the ring hold their art inside their button, so the tutorial's glow follows the art
  (`tutGlow`), not a rectangle.
- The ids are the old ones (`#bladePanel`, `#traitSlots`, `#cancelCraft`, `#saveBlade`, `#recipeBtn`, `#hudToggle`), so
  every tutorial pointer and the `collapsed` class keep working.
