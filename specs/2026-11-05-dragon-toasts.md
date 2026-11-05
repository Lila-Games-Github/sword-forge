# Dragon toasts (R90, 2026-11-05)

Status: canon, **on trial**. The owner is testing it and may want it reversed (see "Revert").
Build: `Swordforge_looptest_landscape.html`. Test: `tooling/ftue/ftue.test.mjs` (the R90 checks at its end).
Owner's list: `toast-checklist.md` (repo root, the owner's ticks; not shipped).

## Owner's words (2026-11-05)

> "except the sword sale from shop racks, and test aids, I want the remaining toasts to be part of dragon's dialogues
> instead, not a separate toast. I have marked all the ones I want deleted. [...] There are windows where dragon is not
> visible, in those windows, make the toast look like dragon's dialogue box, with the dragon's profile pic. [...] It remains
> for 4 seconds and goes away on it's own. If dragon is already having a dialogue active, the toast replaces the dragon's
> dialogues, shows for 4 seconds, then leaves, and dragon's dialogues comes back as it was."

Answers to the questions asked before the build: a new dragon line replaces a showing toast **at once**; a tap on the
toast **closes it early**; the text stays as it was, with the **emoji removed** and the **em-dashes made colons**; where the
dragon is not visible, the box is placed **as in the sharpening window** (bottom centre, icon and bubble).

## Three kinds of toast

| Kind | Call | What it does |
|---|---|---|
| Dragon toast | `toast(msg)` | Said by the dragon (below). Every call not in the two other kinds. |
| Cut | `toastCut(msg)` | Nothing (the owner's 30 ticks). |
| Plain | `plainToast(msg)` | The old top-centre toast: the shop-rack sale (`shopTick`) and the PART 1-6 / GAME buttons. |

## The dragon toast

Values, one object `DTOAST` beside `toast()`: `{ on: true, ms: 4000 }`.

1. **A dragon line is up** (`SAY_ON`, its box shown and on screen): the toast takes that box's text for `ms`. The line's
   go button becomes the X; its answer buttons hide. The line stays open in the game's state (`SAY_ON`, the run, the
   dark, the go kind are not touched), so every tutorial check that reads it is unchanged. After `ms`, or a tap on the box,
   the line's text, go button and answer buttons come back as they were (a line that was still typing comes back whole).
2. **No line is up and the dragon is visible**: the toast shows in the box his lines use there (`sayWhere()`), with the X,
   and the box hides after `ms` or a tap. `SAY_ON` stays null.
3. **No line is up and the dragon is not visible**: the toast shows in `#dtSay`, a box built like the sharpening window's
   (`tut-iconsay`: `assets/ui/dragon_icon.webp`, a "DRAGON" bubble, the X), at the sharpening window's place: bottom centre
   of the frame (`left 50%`, `bottom 10.2%`), over every window.

"Visible": the dragon the box points at (`#dragon`, `#screenDragon`, the bedroom's painted dragon, or the hammer
minigame's head) has a box, and the point at its centre hits it, not a window over it. The sharpening and design-desk
boxes carry the icon, so there he always counts as visible.

Rules shared by the three:
- A second toast while one shows replaces it, and its `ms` starts again.
- A new dragon line (`say()`) ends the toast at once and is shown as usual. `sayHide()` ends a toast that took a
  line's place (case 1); a toast of its own (cases 2 and 3) stays its full time, as the game often closes lines around it.
- The text: em-dashes (U+2014, `&mdash;`) become `: `, emoji are removed, `<b>` stays bold (`dtText`).
- The text appears whole (no word-by-word typing); the box's own entrance animation plays in cases 2 and 3.

## The cut list (the owner's ticks)

Counter: "Handed over...", "He took it and paid nothing", "Sold for ...g", "Popularity level ...", "... on the counter -
...g", "Back in your inventory" (counter), "Not yet. The dragon will tell you when.". Workstation: "... on the
workstation", "Back in your inventory" (workstation), "Take a sword to the workstation, the counter or the shop racks".
Racks: "... on rack ...", "Back in your inventory" (rack). Decor: "Build mode ON/OFF", "Back in your inventory" (decor),
"Decor goes on the counter, shop or bedroom". Ore: "The ores are back in your inventory". Hammer: "Shaping cancelled...".
Craft book: "Erased the ... recipe". Market: "Bought the ... blueprint" (market and shape window), "The dragon bought
the ... blueprint" (market and shape window). Mining: "A rich seam: ...". Level and skills: "Level ... +... talent
point(s)", "... rank .../...", "No talent points spent yet". Quests: "Quest complete...". Menu: "Game saved", "Game
loaded", "New game". 30 calls.

## Revert

Set `DTOAST.on` to `false`: `toast()` and `toastCut()` then both call `plainToast()`, so every toast, the cut ones
included, comes back as before R90, with its old text. (The test then fails on the recorded value, as it should: change
this record with it.) To remove R90 from the code instead, revert its commit.
