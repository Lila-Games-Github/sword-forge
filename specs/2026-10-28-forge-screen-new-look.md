# The forge screen's new look (2026-10-28)

Status: **canon**, built in steps R25 (the craft frame), R26 (the right rail, the bedroom calendar, the market on the
counter), R27 (the grid above the basket, D42), R28 (the ring guides the record step), R30 (the customer counter), R31 (the ring follows the finger) and R33 (the inventory tabs appear as first used). Build log: specs/2026-10-23-ftue-smelter-rework-plan.md.

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

## R27: the inventory grid above the basket, and the text that named the old buttons

Owner (with a picture of the rail): "yes, reword D42 to "Tap the inkpot to record the craft". check and reword anything that
remains. also, I want the inventory to show 12 boxes in the available space above the quest bucket, the last three boxes
fades in a gradient behind the questbucket."

- **The grid:** rows a fixed **85 px** with a **5 px** gap (was `minmax(44px,1fr)`, stretched to the shelf). The shelf
  starts 120 px down the frame and the basket's top is at 478, so four rows (12 boxes) end at 475, just above the basket.
  **15 cells** at least (`MAT_CELLS`, was 12): the fifth row (3 boxes) sits behind the basket and the diary and **fades
  into dark** (R27b, owner: "the gradient is supposed to be dark in color"; a first cut faded the boxes out, which showed
  the light card behind them): an overlay on the card's bottom **115 px** (from the fifth row's top, frame y 480), the
  rail's own **#1b120c**, clear at its top, 85% at 45%, solid from 75%. It sits over the slots and under the diary and
  the basket, and lets taps through; it stays put as the shelf scrolls when a tab holds more than 15.
- **D42** ends "Tap the inkpot to record the craft." (was "Tap 'record craft'."); the rest of the line is unchanged.
- **The sweep:** every dialogue line, toast, hint and button label was searched for the old controls (RECORD CRAFT, the
  chevron, the DAY tile, the rail's MARKET, DIARY and QUEST words, the old settings row). Only D42 named one; the "record
  this craft first" toast already says "tap the inkpot" (R25). Lines that name the craft book, the skill tree, the diary,
  the quest list and the market still fit (the controls kept those jobs).

## R28: the ring guides the record step (2026-10-29)

Owner (with a picture of D42 over the closed frame): "add a glow on the pulley to guide players to drag the window down so
they can see the inkpot. once they record, guide them to click on the pulley again to close the window."

- **Found:** the record step (r121) and the guide's change watcher (`tutNudgeSig`) asked whether the panel was *hidden*
  (`display`). Since R25 the closed frame slides up instead, so the step always took it for open and lit the inkpot, which
  was off screen, and the watcher never saw the frame open or close. Both now read the `collapsed` class on `#hud`.
- **D42, the frame closed:** the ring glows and a **down** arrow slides over it (`TUT_DRAG_GESTURE['#hudToggle']`: kind
  `down`, centred at 0.5 / 0.75 of the ring's box), the R15 gesture vocabulary with a third kind. Open: the inkpot glows,
  no arrow.
- **After recording (`record-close`, r177):** the ring glows, no arrow: a tap closes the frame, and the closing moves the
  tutorial on (D44), as before.

## R30: the customer counter's new look (2026-10-29)

Owner: "`assets/Anchor-images/customer_counter_new.png` is the reference for the customer counter screen. the top left
shelf is the same as on the forge screen, but it only opens till the craftbook, and it remains open by default. Players can
close it. the bell will now be on the top right. I want it swinging slightly when idle. It will have the same glow as we do
now in the tutorial. When players click on it, it should swing more.. `assets/ui/bell_new.png` is the new image for bell.
the scroll is the ledger at the bottom left. the market is now the rotary which can slide right to go behind the inventory
panel." Answers: when the rotary slides in, **a sliver stays out** (drag it left, or tap it, to bring it back); the shelf
**remembers the player's choice** (open the first time).

Art: `assets/ui/bell_new`, `ledger`, `Market` (png, a webp beside each). Placement read off the reference (1920 wide, so
0.5625 to the frame). The build keeps the values in `COUNTER_UI`.

- **The shelf (`#cntShelf`):** the forge's craft frame (`CRAFT_FRAME`: same art, size and place), only the wood, the
  craft book (`#cntBook`, opens the craft book) and the ring (`#cntRing`). Open it slides up **48.5%** of its height, so
  the whole book shows and nothing above it (the reference); closed it slides up `CRAFT_FRAME.shut` (63.3%), as on the
  forge. Open at first; the player's choice is kept (`CNT_SHELF_OPEN`, saved). The ring: a tap toggles, a pull down opens,
  a push up closes. A tutorial pointer at the craft book goes to the book when the shelf is open and to the ring when it
  is closed; opening it moves the pointer to the book.
- **The bell:** `bell_new`, hanging from the top edge at the top right (plate %: left 70.1, width 4.84, bottom 28.8). It
  swings about the top of its rope: idle **+/-2.5 deg** over 2.8 s; a tap swings it **+/-16 deg**, dying away over 1.6 s.
  The tutorial's glow (`tutGlow`) runs with the swing, not instead of it (one rule lists both animations). It still shows
  only from D27 (`BELL_ON`) and still calls the next customer.
- **The ledger:** the scroll at the bottom left (frame %: left 0, top 90.7, width 8.6, height 9.9), title "Ledger", opens
  the ledger; the waiting-list lesson's light (`tut-lit-ctl`) glows along the art.
- **The market:** the rotary on the counter (frame %: left 60.9, top 71.4, width 15.9, height 24.1), id `#marketBtn`
  (the tutorial's pointers and the closed look hold). Drag it right and it slides behind the inventory panel, leaving
  **26 px** out (left 76.6%; the crank shows); drag it left, or tap it, and it comes back. A tap when it is out opens the
  market. Its place is kept (`MKT_IN`, saved). The temporary MARKET and CRAFT BOOK buttons go.

## R31: the ring follows the finger (2026-10-29)

Owner: "I like the 'swipe to close' on the market rotory. Have the same controls on the pulley for the craft window as well"

- The rotary follows the finger while it is dragged and, let go, goes the way it was going. The ring now does the same for
  both frames (the forge's craft frame and the counter's shelf): while the ring is dragged the frame slides with the finger,
  between its open and its shut place (forge 0 to 63.3%, counter 48.5 to 63.3% of its height; no further); let go after
  12 px or more and it settles the way it was going (down opens, up shuts); a tap still toggles. One function,
  `wirePull(el, isOpen, setOpen, panel, range, settle)`, does it for both rings; the frame does not animate while it is
  held (`dragging`), and eases to its place when let go.

## R33: the inventory tabs appear as they are first used (2026-10-29)

Owner: "I want each of these tabs to appear as they are introduced/used for the first time. So, at the beginning, we will
only have the ores tab, then when the sword is crafted we see the swords tab. The metal orb tab appears while crafting the
swift sword, when we have to store the metal in the inventory for the first time. The decor tab appears after garric rewards
the banner. check is there is any error in my instructions as well."

- **Checked against the script:** the first metal is stored during **TC5's gale order (part 4, D99)**: the gale run makes
  swift metal by mistake and the dragon says to store it; the swift dagger (Bram, part 5, D113) is made later from that
  stored metal. So the metal tab appears at D99, the first store, which is what "when we have to store the metal for the
  first time" means; "while crafting the swift sword" was the one slip. Garric gives the banner with every grade
  (`FTUE.garricRewards`), so the decor tab appears with his reward window. The counter, the basement and the shop open the
  swords tab (`SCREEN_TAB`), and Bram's first visit comes before the first sword: with that tab not there yet, the bag
  stays on ores. A metal can be stored by drag at any time, so its tab appears at the first store, whenever that is.
- **The rule (`invTabShown`):** ores always; metal once a metal is stored (`INV.ingots`), swords once a sword is made
  (`INV.swords`), decor once a decor piece is owned (`FTUE_ST.decor` or placed). Each stays once seen (`FTUE_ST.tabIngots`,
  `tabSwords`, `tabDecor`, saved), so selling every sword does not take the tab away. All four in free play and once the
  tutorial is over. Older saves without the marks: swords from part 2 (or Bram's sale), metal from part 5.
- **Look:** a tab not there yet keeps its slot (the four stay in place, nothing shifts when one appears) and pops in when it
  appears (`tab-new`). Asking for a tab that is not there (a screen's default, `invTab`) gives the ores tab.

## R34: the smelter's lit states (2026-10-29)

Owner: "I have updated the furnace image. Also added the off state of the top and gate. I want these images to be overlaid
on the furnace. So, initially, the furnace will look off, no glow. As we start bellowing, the furnace_top_off goes from 100
to 0 %opacity. when we arrive at the trait, the furnace_gate_on is visible, showing the gate glowing. when we click on the
gate, we see the updated furnace image, all other images at 0. the metal orb shows as it is now. when we transfer the metal
to anvil the metal shows the off state again." ("the metal shows the off state" read as the furnace.)

- **Art:** `assets/forge/anchor_furnace` is the lit furnace (the pot glowing, the pour running from the gate). Three layers
  on the same 638x775 canvas lie over it 1:1 (`.furnace-ov`, left 0, top 0, the furnace's width, no shadow of their own):
  `anchor_furnace_top_off` (the crown cold), `anchor_furnace_gate_off` (the gate cold), `anchor_furnace_gate_on` (the gate
  glowing). All four load as webp, 416x505, quality 0.86.
- **The states (`furnaceLook(melt, gateReady)`, opacity of top / gate off / gate on):**

  | State | When | top | gate off | gate on |
  |---|---|---|---|---|
  | off | no metal, or the metal on the anvil | 1 | 1 | 0 |
  | lit | in the smelter, the bellows pumped (`melt.lit`) | 0 | 1 | 0 |
  | gate | in the smelter, the sword on a trait (`gateReady`) | 0 | 1 | 1 |
  | open | the gate tapped, the metal out and hot (`stage 'hot'`) | 0 | 0 | 0 |

  In the smelter and not pumped yet, it is off. The gate glow lies over the cold gate (the cold gate stays at 1 under it),
  so the fade never shows the pour through a half-faded gate. The sword leaving the trait puts the gate back to cold.
- **Timing (`FURNACE_ART`):** the crown goes out over `litMs` 1500 ms on the first pump (a fade, set off by the first
  pump: the owner's "as we start bellowing"); every other change fades in `fadeMs` 400 ms.
- **Back to off:** the metal on the anvil (`onAnvil`), stored, or the run cleared. Put back in the smelter, the metal
  starts cold again (`melt.lit` false) until the bellows are pumped.
- **The old heat glow retired:** `#furnaceGlow` (an orange radial glow on the gate, driven by the heat from the moment an
  ore went in) is no longer driven, since it would glow while the furnace looks off. The element stays: the tutorial's
  arrow aims at it. The gate's `ready` ring (the pulsing outline on the gate's tap box) is unchanged.
