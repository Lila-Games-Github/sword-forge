# The forge screen's new look (2026-10-28)

Status: **canon**, built in steps R25 (the craft frame) and R26 (the right rail, the bedroom calendar, the market on the
counter). Build log: specs/2026-10-23-ftue-smelter-rework-plan.md.

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

## R26: the right rail, the bedroom calendar, the market on the counter

Placement read off the reference (x 0.8078 to the frame); rail values are px inside `#rail` (which starts at frame x 853),
the calendar is % of the frame, like the bedroom's hotspots. The build keeps them in `RAIL_ART`.

- **The skill tree in the day tile's place:** `#skillBtn` moves into `.statRow`, the same 30% x 64 px tile the day had
  (the reference's tile is 60 x 65 px). Cream face, dark border, the tree art (`assets/ui/icon_skilltree.webp`) with the
  level and talent points (`#skillLv`, "Lv 1 · 2 pt") under it and the thin xp bar, so nothing it showed is lost. The
  second row (settings, skill, MARKET) is gone, so the inventory tabs move up 50 px and the grid gains that height.
- **Settings:** `#settingsBtn`, a gear (the glyph, steel blue, no box; no art yet) in the frame's bottom-right corner:
  `gear` right 4 px, bottom 2 px, 40 px.
- **Diary and quests:** the book (`diary`, `#diaryBtn`) and the basket of scrolls (`questbasket`, `#questBtn`) stand over
  the bottom of the grid, as in the reference: `diary` left 17, top 537, width 57; `quest` left 58, top 478, width 79
  (px in `#rail`). They still appear only once unlocked (`RAIL_DIARY`, `RAIL_QUEST`). The basket's "something to claim"
  glow and the tutorial's pointer follow the art.
- **The day:** a calendar on the bedroom wall, left of the round window, clear of the bed's tap area: `#calendar`
  (`cal`: left 24.5%, top 27%, width 6.5%, height 13% of the frame), a paper with a red DAY band and the number. Only on
  the bedroom screen. `#dayNum` moves into it, so the save, the ledger and the day change keep reading the same element.
  A placeholder until there is art.
- **The market:** a temporary MARKET button on the customer counter, under CRAFT BOOK (`SCREEN_UI.customer`: x 0.79, y
  10.2, w 8.20, h 8.47, % of the frame), with the old id `#marketBtn`, so the tutorial's pointers and the closed look
  (`mk-closed`) still work. The forge has no market until the counter's icon arrives.
