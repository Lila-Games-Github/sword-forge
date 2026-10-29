# FTUE rework for the smelter loop: change list and estimate (2026-10-23)

**Status:** canon (decisions taken, 2026-10-23); the build is in progress, step by step (see "Build log"). Owner: "the smelter version of the game has been finalized, that means we will move forward with
this as the main game. check what needs to be reworked in the ftue to fit the new game, list all the changes, and give
me an estimate of how long it will take."

**Sources:** the tutorial in play order (`specs/2026-09-15-looptest-landscape-tutorial-script.md`, r301), the smelter
loop (`specs/2026-10-21-smelter-version-loop.md`, s1-s6), and the code of
`Swordforge_looptest_landscape_smelterversion.html` (it still carries the whole FTUE; `smFreePlay` bypasses it).

## What stays

- **The six parts, the customers, the story, the market, the craft book, the cave, the basement, Garric:** unchanged.
- **The ore chain and the refill (`FTUE.oreChain`, r291-r295):** the routes are the same (the bellows travel the same
  path), so every sword still needs the same ores.
- **The hammering minigame:** the dragon still heats the metal (D13-D16, D45, D46 stay). Only its mug ending goes.
- **CRAFT 1 (craft book):** it skips the smelter and the minigame, so GC5-GC7's book and map routes are not affected.
- **Hazards, books, the GC8 Weak stop (`tutWeakStop`) and the Epic stop on Gale (`tutGaleEpicStop`):** they run in
  `advanceSword`, which the bellows still drive.

## What changes in the loop (old -> new)

| Step | Old loop (main build) | New loop (smelter version) |
|---|---|---|
| Travel | heat with the bellows (hold), open the gate, metal to the anvil, drag the hammer onto it | drag the bellows handle up and down; the metal stays in the smelter |
| Take the trait | pour the mug over the metal on the anvil | tap the smelter gate while the sword is on a trait |
| Go further | put the metal back in the smelter, add ore, heat, hammer | add more ore to the smelter (the metal never left) |
| Tier alignment | drag the dragon to the anvil and hold (fire pulls) | tilt the ladle beside the smelter |
| Shape | tap the metal on the anvil | dropping the hot metal on the anvil opens the shape window |
| Finish | splash the mug in the minigame | the blade lies on the anvil, hot; pick it up by the handle and dip it in the bucket |
| Heat | sets the travel speed; the gate waits for it | gone from the forge (only the minigame has heat) |

## Decisions (owner, 2026-10-23)

Owner: "1- yes 2- yes 3- yes 4- keep it 5- no." So:

1. **The smelter version is the main file:** it becomes `Swordforge_looptest_landscape.html`; the old loop is kept as
   `Swordforge_looptest_landscape_hammerloop.html` (reference only, no tests).
2. **The heat lesson goes:** D39, D40 removed; D41 reworded.
3. **The proposed wording is approved** (the tables below).
4. **The bellows pacing stays** (`strokeSec` 0.2, about 19 pulls for the first sword).
5. **The tiers window art does not show the dragon pulling:** it stays.

Noted: the rework goes ahead before a phone play test of the smelter loop (the risk below stays open).

## The questions that were asked

1. **Which file is the main game.** Recommended: the smelter version replaces `Swordforge_looptest_landscape.html`
   (same URL, `index.html` redirect and test paths), and the old loop is kept as
   `Swordforge_looptest_landscape_hammerloop.html` for reference. The alternative leaves two names and eight test suites
   to repoint.
2. **The heat lesson (Part 2, D39-D41).** It taught "hotter metal travels faster", which is no longer true. Recommended:
   drop it; TC2's craft goes grind, smelter, bellows, gate.
3. **Dialogue wording.** About 27 lines change (listed below). Recommended: approve the proposed wording in one pass, as
   with r300's lines.
4. **Bellows pacing in the tutorial.** The first sword now takes about 19 pulls (`strokeSec` 0.2). Keep it, or give the
   tutorial a faster stroke for the first sword.
5. **The tiers window art** (`assets/ui/weak/fine/epic.webp`, opened by D97): check whether it shows the dragon pulling;
   if so it needs new art.

## Dialogue changes (proposed wording)

### Part 1: the first sword

| Id | Now | Proposed | Trigger change |
|---|---|---|---|
| D4 | "Heat up the smelter with the bellows. Tap and hold." | "Drag the bellows handle up and down." | none (the ores are in) |
| D5 | "Tap on the smelter gate to open it." | **remove** (the gate now opens on a trait: D10) | - |
| D7 | "Pick up the hammer and strike the hot metal on the anvil." | **remove** (the bellows move the sword) | - |
| D8 | "Look, the sword icon moves on the trait map with each strike. Keep hammering till we reach the '?'." | "Look, the sword icon moves on the trait map with each pump. Keep pumping till we reach the '?'." | after a moment of pumping (was hammering) |
| D10 | "Now that we have reached a '?' trait ... Pick up the mug from the bucket and drag it to the metal." | "We reached a '?' trait! Tap the smelter gate to take the trait." | the gate lights |
| D6 | "Nice! Let's take this hot metal to the anvil." | unchanged | now after the trait window (was after the gate) |
| D12 | "Tap on the metal to select the shape of the sword blade." | "Pick the shape of the sword blade." | the shape window opens by itself on the anvil |
| D17 | "Pick up the mug and splash water on the blade to finish." | "Pick up the blade by its handle and dip it in the bucket to finish." | the blade is on the anvil (was: fully shaped, in the minigame) |
| D9 (GC1) | "Hammering also allows you to collect experience points..." | "Pumping the bellows also lets you collect experience points scattered all over the map. Collect them to level up." | none |

### Part 2: TC2 and TC3

| Id | Now | Proposed |
|---|---|---|
| D39 | "Heat up the smelter. Oh, I almost forgot to tell you!" | **remove** (decision 2), or "Pump the bellows." |
| D40 | "The hotter the metal is, the faster the sword icon travels..." | **remove** (decision 2) |
| D41 | "Hot enough! Move it to the anvil and start hammering." | "We are on the balanced trait. Open the gate!" |
| D42 | text unchanged | trigger: the gate gives Balanced (was the quench) |
| D44 | "Tap on the metal to select a shape." | "Take the hot metal to the anvil." |
| D47 | "Splash water to cool the blade and finish crafting." | "Dip the blade in the bucket to finish crafting." |
| D69 | "Now heat it, take it to the anvil and hammer." | "Now pump the bellows." |
| D71 | "Put the metal back in the smelter; we need to go further." | "We need to go further. Let's add one more ore." |
| D72 | text unchanged | trigger: after D71 (was: the metal is back in the smelter) |
| D74 | "Heat it, take it to the anvil and hammer." | "Pump the bellows." |
| D75 | "Splash water on it! I hope this is the fire trait!" | "Open the gate! I hope this is the fire trait!" |
| D76 | text unchanged | trigger: the gate gives Fire |
| D77 | "Tap the metal and select a shape." | "Take it to the anvil." |

### Part 4: TC4, TC5, GC8 (the ladle)

| Id | Now | Proposed |
|---|---|---|
| D97 | "Drag me to the anvil and hold. Doing so will slowly drag the sword icon to the centre of the map..." | "Tilt the ladle beside the smelter. It slowly pulls the sword icon to the centre of the map. Line the sword up with a trait's centre to get an epic tier every time!" |
| D97a | "Remember? Drag me to the anvil and hold to pull the sword onto the trait." | "Remember? Tilt the ladle to pull the sword onto the trait." |
| D98 | text unchanged | trigger: the ladle holds the sword on the trait |
| D96 | "Take it to the anvil and start hammering." | "Pump the bellows." |
| D99 | text unchanged | trigger: the gate gives Swift |
| D102 | "Use the hammer to travel along the path on the map." | "Use the bellows to travel along the path on the map." |
| D103 | "Put it back in the smelter and add one more ground copper." | "Add one more ground copper." |
| D105 | "Heat it up and hammer." | "Pump the bellows." |
| D106 | "Amazing, you got it! We got it! Tap on the metal to select the shape." | "Amazing, you got it! We got it! Take it to the anvil." |

### Part 5 and the quest list

- **D44 after D113** (Bram's swift ingot): **remove** there; the anvil opens the shape window itself.
- **Quest `epicHelp`:** "Get dragon's help for an epic tier sword." -> "Use the ladle for an epic tier sword."

**Count:** 27 lines reworded or removed, 0-2 new (none if D39 is dropped). No change in Parts 3 and 6.

## Code changes

| # | Area | Change |
|---|---|---|
| C1 | Files and tests | The file swap (decision 1); point the 8 suites at the new file; fold `tooling/smelter` into them. |
| C2 | Start | D1 again instead of free play (free play kept as a test aid, e.g. `?freeplay`); the PART buttons back, with their states rebuilt for the new loop (`ftuePart`). |
| C3 | First sword | New stage chain: ore -> bellows -> travel -> gate -> anvil -> shape -> minigame -> dip (was ore, bellows, gate, anvil, hammer, strike, travel, quench, ...): `tutSmeltCheck`, `tutGateStep`, `tutAnvilStep`, `tutHammerStep`, `tutStrikeStep`, `tutQuenchStep`, `tutMugStep`; D8's pause on pumping time; `STAGE_DARK` (drop hammer/strike/quench; travel = map + smelter; new dip = anvil, blade, bucket). |
| C4 | Bellows | Put back `TUT_BELLOWS_LOCK` (the new handler dropped it). |
| C5 | Gate | Put back the two checks the new `openGate` dropped: `ftueGateOk` (the GC1-GC3 "2 iron + 2 manganese" retry, D28a) and `ftuePourOk` (the craft lock on a trait the order did not ask for, D28k). |
| C6 | The dip | A pointer to the blade, then the bucket, after every hammered tutorial craft (first sword, GC1-GC3, TC2, TC3, GC4, TC4, TC5 x2, GC8, Bram, the gale Longsword, Garric); D17 and D47 on the blade, not the minigame mug (`tutHm2Idle`, `hmMugReady`). |
| C7 | Fire and gale runs | Drop the put-it-back steps (`tutFireBack`, the `fire-*` and `d2-gale*` stages that wait for the metal back in the smelter or for heat): the next ore goes straight in. |
| C8 | Ladle | Move the tutorial's pull clamp (`tutPullTarget` -> `tutSwiftAligned` / `tutDurableAligned` / `tutGaleAligned`, `TUT_SWIFT_LOCK`) from the dragon's fire into `smLadleTick`; the `d2-pull` / `p4-pull` stages wait for a ladle tilt instead of the dragon at the anvil (`dragonAtAnvil`); the pointers go to the ladle. |
| C9 | Pointers | Retarget or remove the 21 `#hammerTool` and 14 `#mug` references (arrows, glows, dark lifts). |
| C10 | Nudges and hints | The idle nudges (`hintArrowWanted`: metal on the anvil at the route end -> now route end with no trait -> add ore; `hintDownWanted`: tap the metal -> now the blade to the bucket); the remaining `hint()` lines. |
| C11 | Ore chain | `CRAFT_REWIND` and `FIRST_SWORD_STAGES` name stages that change. |
| C12 | Quest and art | The `epicHelp` label; the tiers window art (decision 5). |

## Docs and tests

- **FTUE test (644 checks):** about 60 checks read old-loop code (the hammer tool, mug, pull, gate on heat, quench) and
  are rewritten; new checks for each new step, written first, as usual.
- **Records:** a build record per step in `specs/2026-10-07-ftue-v3-rework.md`; the tutorial script regenerated in play
  order; `specs/2026-10-21-smelter-version-loop.md` marked as the main loop; CLAUDE.md, HANDOFF.md, INDEX.md.

## Estimate

Built as before: one commit per step, test first, browser check, record. Hours are build time; play-test rounds are
yours and come on top.

| Phase | Steps | Build time |
|---|---|---|
| 0. Decisions, file swap, tests repointed, FTUE start back (C1, C2) | 2 | 1.5 h |
| 1. Part 1: first sword chain, dark screens, dip (C3-C6) | 7 | 5 h |
| 2. Part 1: GC1-GC3 craft guide (gate checks, dip) | 2 | 1.5 h |
| 3. Part 2: TC2 (heat lesson out) and TC3's fire run (C7) | 4 | 3 h |
| 4. Part 3: GC4 Durable | 1 | 0.5 h |
| 5. Part 4: the ladle for TC4, TC5 (swift, gale), GC8 (C8) | 5 | 4 h |
| 6. Parts 5-6: Bram's ingot and Dagger, the gale Longsword, Garric's solo craft | 2 | 1.5 h |
| 7. Cross-cutting: pointers, nudges, hints, ore-chain stages, quest, PART jumps (C9-C12) | 3 | 2 h |
| 8. A full Parts 1-6 play-through in the browser, and its fixes | - | 4 h |
| **Total** | **about 26 steps** | **about 23 h (range 20-28 h)** |

**Calendar:** about 3-4 working sessions of build time. With your play test after each part and one wording round, about
1 to 1.5 weeks.

## Risks

- **The loop is not finger-tested yet.** The bellows, ladle and pendulum dip have only been driven by code in the
  browser. A loop change after the FTUE rework means redoing tutorial steps, so a phone play session of the smelter
  version first is the cheapest insurance.
- **Wording rounds:** 27 lines; each round of changes adds about 1 h.
- **No full Parts 1-6 run exists yet** for the current main build either (the ore chain, shape-window purchases); phase
  8 covers both.

## Build log

- **R0 (2026-10-23): the smelter loop is the main game; the tutorial starts again.** Decision 1: `git mv` the old main
  build to `Swordforge_looptest_landscape_hammerloop.html` and the smelter version to `Swordforge_looptest_landscape.html`
  (the URL, `index.html`'s redirect and the suites' paths stay). The tutorial plays again: D1 after the intro, on load
  and on a new game (`sayStart`); `?freeplay` gives free play instead (`SM_FREE`); the PART buttons are back. Tests: the
  smelter test reads the main file, and its "the main build has none of it" check now reads the old loop's file; its
  free-play and PART checks are rewritten (written first); two FTUE checks that read replaced code now read the new
  code (the gate's embers instead of the mug's mist before the trait window; the travel step without the heat factor).
  All eight suites GREEN (FTUE 644, smelter 66). Checked in the browser: the intro, then D1 at part 1 with 2 iron; with
  `?freeplay`, free play (part 7, 20 of every ore, 500 gold); the PART buttons show; no console errors. The tutorial
  itself is not yet reworked (R1 on).
- **R1 (2026-10-23): the first sword in the smelter loop.** The lines as approved: D4 "Drag the bellows handle up and
  down.", D8 "...with each pump. Keep pumping...", D10 "We reached a '?' trait! Tap the smelter gate to take the trait.",
  D12 "Pick the shape of the sword blade.", D17 "Pick up the blade by its handle and dip it in the bucket to finish.";
  D5 and D7 removed (201 dialogue keys). The chain: ore (D3) -> bellows (D4; the pointer at the bellows) -> D8 once
  the bellows have moved the sword `FTUE.pumpBeat` 0.4 full-speed s (a full down-and-up pump, two pulls of the
  spring-back handle; `tutPumpBeat` in `smGlide`), the game paused -> travel -> at the '?' D10 with the pointer and a glow
  on the gate (`tutGatePointer`; the stage keeps its name, 'quench') -> the trait window -> D6 and the pointer from the
  metal at the gate to the anvil (`tutShapeStep`, stage 'anvil') -> on the anvil the shape window opens with D12 over it
  (`ftueSaySh`) and the Shortsword lit -> the minigame (D13-D16 unchanged) -> shaped: D17 and a pointer from the blade to
  the bucket (`tutMugStep`, `TUT_DIP`), gone while the blade is held, back if it is put down, ended by the dip
  (`tutDipDone`) -> the crafted window (D17a). `STAGE_DARK`: bellows = the smelter; anvil = the anvil and the metal;
  strike, quench (the gate) and travel = a map window and the smelter; no gate or hammer stages. `TUT_SKIP`: bellows ->
  already on the trait (`tutTravelOnTrait`); anvil -> already on the anvil (`tutAnvilShape`: D12, tap the metal); no gate
  entry. `tutHammerStep`, `tutAnvilStep` and the gate-on-heat branch of `tutGateStep` removed. Found in the browser
  check: pumping while D8 pauses the game stored travel that ran out after it; the bellows now ignore moves while
  paused. FTUE test 644 -> 658 (written first). Checked in the browser (1280x720, the frames run by hand, the pane
  hidden): D1, D2, D3; the ores in -> D4 at the bellows, the smelter lit; two pulls -> D8, paused, the smelter lit
  over the dim; D8 closed -> pumping to Balanced -> D10, the gate glowing; the gate (hit-tested) -> Balanced Epic, the
  trait window; closed -> D6, the arrow, the anvil and the metal lit; the metal dragged to the anvil -> the shape window
  with D12 over it (z 1011) and the Shortsword lit; the minigame's lines; shaped -> the hot blade on the anvil, D17, the
  arrow to the bucket; picked up -> the arrow gone; dipped -> D17 gone, the craft window, D17a; no console errors.
- **R2 (2026-10-23): GC1-GC3's craft guide in the smelter loop.** D9 as approved ("Pumping the bellows also lets
  you collect..."). One pointer for a guided craft, worked out from the state (`tutLoopPointer`, reused by later parts):
  smelting - the bellows (a glow), or the gate once the sword is on a trait (`gateReady`, a tap highlight); hot - the
  metal to the anvil; on the anvil - none (the shape window opens itself); shaped - the blade to the bucket, none while it
  is held. The GC stages p1-craft-heat, p1-craft-shape and p1-craft-hammer use it and tick; the guide's signature sees
  the blade held (`SM_BL`). After the gate `ftueGcQuenched` points the metal to the anvil (was a glow on it). The gate
  has the mug's two checks back: the craft lock on a trait the order did not ask for (`ftuePourOk`, D28k) and the GC1-GC3
  "2 iron + 2 manganese" retry (`ftueGateOk`, D28a). FTUE test 658 -> 664 (written first; two pattern limits widened
  for a comment line). Checked in the browser (GC1's craft staged: Bram served, 2 + 2 in the bag, the guide started):
  the ore arrow; the ores in -> pumping with the bellows lit, the first book's D9; on Balanced the gate highlighted;
  the gate, the trait window closed -> the arrow from the metal to the anvil; on the anvil the shape window, no
  pointer; the minigame; shaped -> the arrow from the blade to the bucket, gone while held, back when put down.
- **R3 (2026-10-23): TC2 in the smelter loop.** Decision 2: the heat lesson goes - D39 and D40 removed (199 dialogue
  keys); D41 "We are on the balanced trait. Open the gate!", D44 "Take the hot metal to the anvil.", D47 "Dip the blade
  in the bucket to finish crafting." as approved. The ground manganese in -> D38, then the bellows lit (stage
  regrind-heat); on Balanced (`gateReady`, the skip entry unchanged) -> D41 (regrind-work, the shared pointer: the
  gate, then the metal); the gate -> the record lesson -> D44 with the arrow from the metal to the anvil (a glow on the
  metal if it is on the anvil already); D44 goes when the shape window opens; the minigame speaks D46 only (the mug
  branch is gone); shaped -> D47 with the dip pointer (`tutDipStep`, shared with D17: `TUT_DIP_LINE` is the line the dip
  closes). **C4 changed:** the bellows lock (`TUT_BELLOWS_LOCK`, r182) only held the bellows during the heat lesson, so
  it is removed instead of put back. **Found in the browser check:** D42 had not shown since r286 - it is spoken in the
  same beat the trait window opens, and the window closes the dragon's line (the old build too). It now waits for the
  window to close (`TUT_D42_WAIT`, `tutRecordSay` in `closeAcquire`). FTUE test 664 -> 675 (written first). Checked in
  the browser (PART 2 jump, TC2 played through): the bell, D31, the forge, the raw ores, D32-D32c and the grindstone,
  D33, D35; the iron and the manganese ground in -> D36, D37, D38, the bellows lit; 19 pulls -> D41, the gate lit; the
  gate -> the trait window; closed -> D42; the record (D43, Update) -> the panel shut -> D44, the arrow to the anvil;
  on the anvil the shape window, D44 gone; the minigame (D45); shaped -> D47, the arrow to the bucket; dipped -> the
  craft window; no console errors.
- **R4 (2026-10-23): TC3's fire run in the smelter loop.** D69 "Now pump the bellows.", D71 "We need to go further.
  Let's add one more ore.", D74 "Pump the bellows.", D75 "Open the gate! I hope this is the fire trait!", D77 "Take it to
  the anvil." as approved. The metal never leaves the smelter: after D70 and D71 (read first, `SAY_ON!=='D71'`) the
  fork lesson (D72, D72a) and the next ore follow with no carry back. The route-end checks (`tutFireSpot`,
  `tutFireReached`, and TC5's `tutDay2Pull` / `tutGaleEnd`) were called only by the old hammer branch; they now run as
  the bellows move the sword (`tutTravelHooks` in `smGlide`), and the route end is read while the metal is in the
  smelter (`tutAtRouteEnd`). Both heat runs use the shared pointer, the gate only on Fire at the route end
  (`tutLoopPointer(want, atEnd)`); D75 waits for the route end too - the first touch of Fire is its Weak edge (34 in the
  check), the route end is Fine (17), as `FTUE.fireAt` records. After the gate: D76, D77 and the arrow to the anvil;
  D44/D77 and that arrow go when the shape window opens; the minigame's lines (D45, D46, D78) go when the blade comes out;
  every later hammered tutorial craft gets the dip arrow without a line (C6). **Found in the browser check (the same
  r286 effect as D42 in R3):** the trait window closed every line the gate's hooks said in that beat - D42, D76, D99,
  D106 had not shown since r286, in the old build too. R3's D42-only fix is replaced by a general one: the line said by
  the hooks (`sayNew`) is said again when the window closes (`TUT_ACQ_LINE`, `tutAcqLineBack` in `closeAcquire`). FTUE
  test 675 -> 687 (written first; three pattern limits widened as functions grew). Checked in the browser (PART 3 jump,
  the cave's result staged: 3 iron, 2 manganese, then `tutFireForge`): D67a and the map window, D68, the three ground
  ores in -> D69, the bellows lit; the hazard lines D69a-D69c; the route end -> D70, D71; D72, D72a, the manganese ground
  -> D73, in -> D74; Fire first touched at 34 with the bellows still lit; the route end at 17 -> D75 and the gate; Fire
  Fine, the trait window; closed -> D76, then D77 with the arrow to the anvil; on the anvil the shape window, the arrow
  and D77 gone; the minigame (D78); shaped -> D78 gone, the dip arrow.
- **R5 (2026-10-23): the Durable crafts (GC4, TC4) and the ladle lessons.** D97 "Tilt the ladle beside the smelter. It
  slowly pulls the sword icon to the centre of the map. Line the sword up with a trait's centre to get an epic tier
  every time!", D97a "Remember? Tilt the ladle to pull the sword onto the trait." and the quest `epicHelp` "Use the
  ladle for an epic tier sword." as approved. The Durable heat run (p3-dur-heat) uses the shared pointer on Durable; in
  part 4 (TC4) its route end starts the ladle lesson (`tutTc4Pull`: D97, the tiers window, the ladle lit); TC5's reminder
  (`tutDay2Pull`, D97a) is read while the metal is in the smelter and lights the ladle too. The tutorial's clamp moved
  from the dragon's fire into the ladle's pull (`smLadleTick`): while a tier lesson runs (`tutPullTarget`: Durable,
  Swift, Gale) the pull stops on the trait's closest point and locks (`TUT_SWIFT_LOCK`; the ladle does nothing while
  locked); the aligned steps say D98 and point at the gate (was the mug). After the gate the Durable crafts point the
  metal to the anvil (`ftueDurQuenched`). FTUE test 687 -> 693 (written first; the old "no mug re-point" check now asserts
  its branch is gone; the smelter test's ladle window widened). Checked in the browser (PART 4 jump, TC4): the bell,
  D92k, D92l, the way to the forge; 2 ground nickel in -> the bellows lit; 21 pulls -> the route end on Durable at 17 ->
  D97, the ladle lit; D97 read -> the tiers window; closed; the ladle tilted 45 deg (the bowl hit-tested) -> 3.8 s ->
  parked on Durable at 5 (Epic), locked, D98, the gate lit; held 1 s more -> no movement; the gate -> Durable Epic, the
  `epicHelp` quest counted; the window closed -> the arrow to the anvil; no console errors. GC4's craft uses the same
  pointer and steps (not played separately).
- **R6 (2026-10-23): TC5's swift and gale runs and GC8's Weak sword.** D96 "Pump the bellows.", D102 "Use the bellows to
  travel along the path on the map.", D103 "Add one more ground copper.", D105 "Pump the bellows.", D106 "Amazing, you
  got it! We got it! Take it to the anvil." as approved. Each pump line lights the bellows. The gale route's end is read
  while the metal is in the smelter (`tutGaleEnd`) and points one more copper to the grindstone (no carry back); the tick
  line that cleared any arrow while smelting in that stage is gone (the metal now always is). Gale taken: D106 and the
  metal to the anvil. GC8: the bellows while it travels; the Weak stop (in `advanceSword`, unchanged) parks the sword, says
  D107b and points at the gate. The mug pointer (`tutMugPointer`) and the hammer homing calls are gone. FTUE test 693 ->
  703 (written first). Checked in the browser (TC5 staged on the forge): 2 ground copper -> D96, the bellows lit; 21
  pulls -> the route end 30 from Swift -> D97a, the ladle lit; the ladle -> parked on Swift (0, Epic) in 1.3 s -> D98,
  the gate; the gate -> Swift Epic; the window closed -> D99, the arrow to store the metal. The gale run: 3 ground copper
  -> D102, the bellows lit; the route end -> D103, the arrow from the copper to the grindstone; the 4th in -> D104, the
  arrow for the raw 5th; in -> D105, the bellows; the Epic stop on Gale (0) -> D98, the gate; three more pulls while parked
  -> no movement; the gate -> Gale Epic; the window closed -> D106, the arrow to the anvil; no console errors. GC8's Weak
  stop was not played (its stop and gate pointer are the same code paths).
- **R7 (2026-10-23): parts 5-6.** A stored ingot comes back hot at the gate (`restoreIngot`; one stored on the anvil is
  turned hot too), so the anvil opens the shaping the same way every time. **Plan change:** D44 after D113 is kept, not
  removed - Bram's swift metal now comes back at the gate, so "Take the hot metal to the anvil." is the right line; it
  points from the metal to the anvil (was a glow on it). Garric's solo run (`TUT_SOLO`) gets no dip arrow (the other
  hammered tutorial crafts keep it). The part 5 gale Longsword is made from the craft book (CRAFT 1 skips the smelter) and
  needed no change. FTUE test 703 -> 705 (written first). Checked in the browser (PART 5 jump): the stored swift ingot
  (stage onAnvil) -> D113 with the arrow from its slot -> taken out: hot at the gate -> D44, the arrow to the anvil; on
  the anvil the shape window, D44 and the arrow gone; no console errors.
- **R8 (2026-10-23): tidying.** The refill tables (`FIRST_SWORD_STAGES`, `CRAFT_REWIND`) drop the gate and hammer steps R1 removed;
  `markGateReady` (the gate on heat, unused since s1) and its old hint are gone. Most of C9-C12 was done on the way (the
  hammer and mug pointers gone in R5-R6, the quest label in R5, the tiers art kept by decision 5). The hidden forge hammer
  and mug (their props, CSS and wiring) are still in the file, unused; removing them is a separate cleanup. FTUE test
  705 -> 706. Checked in the browser: the intro, then D1; no console errors.
- **R9 (2026-10-23): the tutorial script in play order.** `specs/2026-09-15-looptest-landscape-tutorial-script.md`'s play-order
  section is regenerated from the build's DIALOGUE (199 keys) with the new triggers (the bellows, the gate, the ladle,
  the dip); D5, D7, D39 and D40 leave it (the only entries removed; the rest is renumbering), and the removed-lines note
  names them.
- **R10 (2026-10-23): a continuous Part 1 play.** In the browser, from a new game: the first sword (D1-D17c), D18, the
  counter, Bram (both replies, the sale, "Take care", D26), the ore reward, the quest list (D118, both claims, D119), the
  dragon-tap lesson (D119a, D119b), the bell (D27), GC1 (D28b, the craft guide, D9 at the first book, the gate on
  Balanced at the route end, the dragon's coins at the shape window with D28c and D28d, the Longsword lit, the minigame,
  the dip), the sale and GC2's ore reward (2 iron, 2 manganese); no console errors. Parts 2-6 were checked per part
  (R3-R7), not played continuously; nothing was played on a phone.
- **R11 (2026-10-23, owner play-test): TC5's swift metal is allowed at the gate.** Owner: "for this part, I actually want
  the players to be able to craft a swift sword first, even though the customer asked for a gale ... I actually meant
  only let them craft what the tutorial demands. So bring back the earlier flow, where they craft the swift, store it,
  then craft again for the gale." The report: at the swift route's end the gate glows (the sword is on Swift), and a tap
  there got D28k - the craft lock (`ftuePourOk`) let Swift through only once the ladle had parked the sword (stage
  d2-quench). Now the lock follows the tutorial's step: through TC5's swift run (`TUT_SWIFT_STAGES`: d2-copper, d2-hammer,
  d2-pull, d2-quench) the tutorial's trait is Swift (`ftueTutTrait`) and the gate takes it, before or after the ladle;
  `tutSwiftGot` takes it from any of those stages (D99, the arrow to store the metal), so the run goes on as before. The
  record's craft lock section carries the clarification.
  FTUE test 706 -> 709 (written first). Checked in the browser (TC5's Gale order open at the counter, the swift run
  staged): the route end on Swift at 30, the gate glowing, D97a up; the gate tapped before the ladle -> Swift (Weak, at
  that distance), no D28k; the window closed -> D99, the store arrow; in the gale run the lock still refuses Swift (D28k);
  no console errors. Taken before the ladle the swift metal is Weak; after it, Epic.
- **R12 (2026-10-26, owner play-test): the trait window for a first discovery only; no craft-book toast in Part 1.**
  Owner: "the trait acquired window keeps showing up for every sword. It should only appear when it is discovered for
  the first time. also, remove the 'balanced trait recorded' toast for the first four sword." The gate opened the trait
  window on every take ("Trait locked in" after the first). Now `tryAcquire` opens it only when the trait was still a
  `?` (`firstFind`); a re-take goes straight on (`tutShapeStep`, the pointer to the anvil), and a line the gate's
  hooks said stays up, since no window closes it. The "recorded in the craft book" toast is quiet through Part 1
  (`FTUE.bookToastQuietPart` 1, `ftueBookToastQuiet()`): Bram's sword and GC1-GC3, the first four swords, all
  Balanced. Free play (`?freeplay`) and a finished FTUE keep the toast. FTUE test 709 -> 713 (written first; the R0
  and R4 checks read the new call). Checked in the browser: four Balanced takes in Part 1 -> the window once, no toast;
  Fire in Part 2 -> the window and the toast once; a GC re-take at `p1-craft-heat` -> no window, stage
  `p1-craft-shape`, the pointer from the metal to the anvil; no console errors.
- **R13 (2026-10-26, owner): the dragon's blueprints cannot be bought by the player.** Owner: "make sure, the sword that
  are bought by the dragon, players cannot click on the buttons and buy it themselves." Six tutorial orders have the
  dragon buy the blueprint (`market.by` 'dragon': GC1's Longsword, GC2's Broadsword, GC5's fire Longsword, GC6's fire
  Broadsword, the gale Longsword, Bram's swift Dagger). Until his coins landed, the shape window showed "BUY Xg" on that
  shape and the market cell was buyable, so a player with the gold could buy it first. Now `ftueDragonPays(k, sh)`
  (the open order's blueprint, `FTUE_MK`, when the dragon buys it) hides the BUY in the shape window, shows the market
  cell locked with no price, and `shapeBuy` / `marketBuy` refuse a tap. The dragon's own purchase does not go through
  either, so it is unchanged. FTUE test 713 -> 719 (written first). Checked in the browser (GC1's Longsword order, 1000
  gold): the market cell a lock, a tap left the gold at 1000; the shape window's Longsword a lock with no BUY, a tap
  bought nothing, the dragon's coins then bought it (owned, gold 1000); the other shapes kept their BUY; no console
  errors.
- **R14 (2026-10-26, owner play-test): no refill after a scripted sale.** Owner: "'careful here try again' appears after
  selling gale sword and the dragon gives reward before customer leaves." The line is D28l, the dragon's ore refill
  (r293, `ftueRefillTick`, run every frame). Cause: after TC5's gale sale (stage `d2-gale-paid`) the customer stays at
  the counter for D108 and "You're welcome." (`scriptedBye` in `sellCounter` keeps `CUSTOMER`). `ftueOrderOpen` still
  read the customer's gale order as open, the craft lock was off (the gale sword had just been sold), and the bag was
  short of the last round's ores, so the refill window opened with D28l before the customer left. TC2, TC3, Bram's Dagger
  and Garric keep their customer the same way and had the same gap (it showed only when the bag was short). Now a
  scripted sale marks the customer `paid`, and `ftueOrderOpen` returns no order for a paid customer. No customer object
  is ever given a second order, so this closes nothing still owed. FTUE test 719 -> 721 (written first). Reproduced in
  the browser before the fix (TC5's customer, a gale Shortsword on the counter, an empty bag, `oreRound` 5 copper: the
  reward window with 5 copper and D28l at `d2-gale-paid`); after it: no window, no D28l, no copper, "You're welcome." up;
  the thanks then goes on to D109 and `p4-bell`; no console errors.
- **R15 (2026-10-26, owner): the drag gestures on the ladle and the bellows.** Owner: "show up arrow guide on the ladle,
  and up and down arrow on the bellows". Before, `tutArrow(null, '#bellowtop')` and `tutArrow(null, '#ladleHead')` gave
  only a glow (a tap pointer on a picture; the bellows calls' arrow offsets were never used), so nothing showed which way
  to drag. Now a gesture overlay `#tutDrag` (like the grindstone's turn arrow, `#tutSpin`) shows over a drag control the
  tutorial points at, with the glow kept: `TUT_DRAG_GESTURE` = `#ladleHead` { kind 'up', fx 0.25, fy 0.1 } (over the
  handle's end; dragging it up tilts the ladle) and `#bellowtop` { kind 'updown', fx 0.6, fy 0.2 } (on the top board, by
  the handle); fx/fy are the gesture's centre in the target's box. The up arrow slides up and fades (1.2 s); the
  up-and-down arrow bobs (0.6 s each way). `tutTap` sets or clears it, so every pointer change does; `tutDragDraw` runs
  every frame beside `tutSpinOn`, and shows it only on the forge screen (the forge props stay laid out under the other
  screens). FTUE test 721 -> 727 (written first; the forge-screen check was added RED after the browser check found the
  arrow over the customer screen). Checked in the browser: the first sword's bellows step (`tutBellowsStep`, D4) -> the
  up-and-down arrow on the bellows; TC4's ladle lesson (`tutTc4Pull`) -> the up arrow and the glow on the ladle; a drag
  from the handle's end upward tilted the ladle to 27.6 deg; a drag arrow, `tutDone` and the customer screen clear it, the
  forge screen brings it back; no console errors.
- **R16 (2026-10-27, owner): D13 on a dark minigame.** Owner (a screenshot of D13 over the first sword's minigame): "for
  this part, darken everything (use the existing black overlay look) except the dragon and dialogue." The existing dark
  (`#tutHole`, SAY_DARK, STAGE_DARK) is a frame layer at z60; the minigame's dragon (`#hmDragon`) is inside the hammer
  window's stacking context (z1000), so nothing at frame level can sit between it and the rest of the scene. Now the
  hammer window has its own dim, `#hmDim` (inset 0, z10, the same rgba(6,4,2,.74) as `#tutHole`), shown by the class
  `hm-dark`, which also lifts `#hmDragon` to z11; the line (`#dragonSay`, z1100) is over the window already.
  `HM_SAY_DARK` ['D13'] lists the lines; `hmDarkSync()` sets the class while the window is open and one of them is up,
  every frame (beside `tutDarkSync`) and in `say()`. D14 ("hold the metal") is left lit, since it asks for the metal.
  FTUE test 727 -> 732 (written first). Checked in the browser (the first sword's minigame): D13 -> the anvil, metal,
  hammer, quench tray and footer dark, the dragon and the bubble lit; OK (hit-tested) -> D14, the dark gone; the minigame
  cancelled over D13 -> no dark left; no console errors.
- **R17 (2026-10-27, owner): the "Sword crafted!" window rearranged.** Owner (a screenshot of the window, paper out): "Show
  the health and hammer info on the left side of the window only. On the expandable window, only show the ores used. It
  should be like this - Health icon, percentage below it, money lost because of damage on health on the right. Below the
  Health, we will have the hammering info, percentage below it, then the gold value affect on the right. The total gold
  will show as it is right now." Now the card has two rows (`#cwHpRow`, `#cwFgRow`, ids kept from the paper): the heart
  or hammer filled to its percentage, the percentage under it, and on the right the gold effect. Health:
  `cwHpEffHtml` = the full-health price minus the price, in red ("-14g"), else "No loss", with "N hazards: -k tier" under
  it when tiers dropped (the old `hazLostHtml`, which only the paper read). Hammering: `cwHmEffHtml` = the price minus
  the price at `HM_HITS.unforged` (Good, x1.0), "+13g" in green, "-8g" in red, else "No change", with the band under it.
  The card's ore box is gone; the paper shows only the ores (`#cwOres`). The art is 150 px (was 200) so the card still
  fits the frame (it spans 37-563 of 600). The lessons follow the rows: the first window now says D17b on the hammer row
  first, then D17a on the arrow (`SAY_AFTER.D17b`), then D17c on the ores once the paper is out, then CLOSE; the hurt fire
  sword's D69d lights the card's Health row directly (no arrow step, `hp-arrow` removed). The dialogue texts are
  unchanged. FTUE test 732 -> 740, hazard test still 37 (its Health-row checks read the new row; written first). Checked
  in the browser: an Epic Balanced Shortsword, Masterwork 97%, full health -> "No loss", "+13g Masterwork", 57g; a Fine
  Fire Longsword, 40% health, 4 hazards, Crude 42% -> "-14g" with "4 hazards: -1 tier", "-8g Crude", 32g, the paper with
  three ore rows only; the first lesson D17b (hammer row) -> OK -> D17a (arrow) -> the arrow -> D17c (ores) -> OK -> CLOSE
  lit; the hurt lesson D69d (Health row) -> OK -> CLOSE lit; every tap hit-tested; no console errors.
- **R18 (2026-10-27, owner play-test): a stored metal dropped on the anvil lands on the anvil, its heat kept.** Owner: "on
  dragging the metal from the inventory (during bram's second visit) to the anvil, there is a bug that snaps the matl to
  the smelter gate instead, makes it hot. ... I want to be able to directly place the metal from inventory to anvil, the
  heat level should not change randomly." Cause: R7 (2026-10-23) made `restoreIngot` turn every stored metal 'hot' and
  `snapToGate()` it, though the only way in is a drop on the anvil (`startIngotDrag` restores only `overAnvilEvent`);
  and the bag cooled a metal by `STASH_COOL` 3.5 heat a second (`invCooled`), so the heat it came back with depended on
  how long it had waited. Now `restoreIngot` puts it on the anvil with `placeOnAnvil()` (stage onAnvil; with a trait the
  shape window opens, as for any metal put there), with the heat it was stored with (`g.heat`); `STASH_COOL` is 0, so the
  bag keeps it (the stash hint says so). Bram's step (`tutBram2Restored`) drops D113 and no longer says D44 or points from
  the gate: the shape window opens and the dragon buys the Dagger blueprint there. R7's two checks now assert their
  absence. FTUE test 740 -> 745 (written first). Checked in the browser (PART 5 jump, Bram's step `bram2-ingot`, the
  stored swift metal at heat 60, a real drag from its slot to the anvil after a wait): the metal on the anvil (not the
  gate), heat 60, stage onAnvil, D113 gone, no arrow, the shape window open with the dragon's Dagger purchase (D28c); no
  console errors.
- **R19 (2026-10-28, owner): the waiting customer's guide only at an empty counter, and only when the blueprints can be
  bought.** Owner: "make sure the customer on the waiting list tutorial is only triggered when there is no customer
  present at the counter, and only when players have the money to buy the requested blueprints." The guide (D107f "You can
  now buy both the blueprints...", then D107g, then D107h "call them back"; `wqTick`, 2026-10-14) spoke at a "free moment"
  (`wqFree`), which allowed the `p<n>-gpc` stages, when a gameplay customer stands at the counter; right after a sale the
  customer's goodbye (`CUST_BYE`, 3.2 s) was also free, while `GOLD` already held the payment but its coins were still
  flying and the shown gold was lower. And "can buy" was gold alone. Now `wqFree` also needs no `CUSTOMER` and no
  `CUST_BYE` (this gates D107f and D107h), and D107f needs `wqCanBuy()`: the gold covers the blueprints still to buy and
  the market sells each one (open, its trait discovered), the market's own rule. FTUE test 745 -> 747 (written first).
  Checked in the browser (PART 5 jump, the waiting gale Katana + fire Claymore, 750g to buy): gold 749 - nothing; 750
  with a customer at the counter - nothing; with a customer saying goodbye - nothing; with gale undiscovered - nothing;
  750 and an empty counter - D107f; both swords in the bag with a customer present - no D107h, then an empty counter -
  D107h; no console errors.
- **R20 (2026-10-28, owner): the way to the counter on Day 2 lights after D92.** Owner: "make the highlight guide to go to
  the customer counter on day 2 appear after d92, and not d89." r297 lit it (`tutExit('#panLeft')`) in `say()` as D92
  came up, which is the moment D89's OK is tapped. Now D92's own close lights it (`SAY_AFTER.D92`, stage `d2-counter`),
  for the morning (`tutDay2Morning`, D89 then D92) and for the cave path (`tutDay2Mined`, D92 alone, which lit it with
  D92 as well). FTUE test 747 -> 749 (written first). Checked in the browser (1280x720): the morning - D89 up, nothing
  blinks; its OK - D92 up, nothing blinks; its OK - the counter's arrow (`#panLeft`) blinks; the cave path - D92 up,
  nothing blinks; its OK - `#panLeft` blinks; every OK hit-tested; no console errors.
- **R21 (2026-10-28, owner): an ore on the grindstone goes back to the inventory; no ores during D72/D72a.** Owner: "not able
  to put ores back to inventory from grinder. also disable interaction with ores for tutorial about iron vs manganese path
  for fire sword for d72." (1) r101 committed an ore once it was on the wheel ("nothing puts it back"); the orb's drop
  handler (`handleOrbDrop`) had only the smelter or the wheel for it, and the drop on the inventory (`overRail`) only
  stored a finished metal (`stashIngot`). Now the same drop runs `unprepOre()` for an ore on the wheel: the ore goes back
  to the bag whole (`gainOre`), its grinding lost, the orb and its map preview go, and the Ingredients tab shows it. The
  tutorial's pointers re-read the wheel on their own (`tutNudgeSig` holds `prep`). game-design.md section 3 records it. (2)
  While D72 ("If we use iron, we will cross another hazard zone.") or D72a ("But the manganese can avoid it.") is up at
  stage `fire-mang`, `startOreDrag` does nothing (`tutOresHeld`), so no ore leaves the bag while the dragon compares the two
  paths; closing D72a frees them (`tutForkDone` points at the wheel, as before). FTUE test 749 -> 752 (written first).
  Checked in the browser (1280x720, free play, real pointer drags): iron 20 -> on the wheel 19, ground to 60% -> dropped on
  the inventory: 20, nothing on the wheel, no orb, no preview, no route; at `fire-mang` with D72 and with D72a up, a drag
  from the iron and the manganese slots made no ghost and spent nothing; with D72a closed the iron went onto the wheel; no
  console errors.
- **R22 (2026-10-28, owner): no X on the dragon's lines on the counter and cave screens.** Owner: "remove x from dragon's
  dialogues for customer counter screen and cave". The X (`SAY_GO_CLOSE`) showed on the last line of a run; it has no
  handler of its own (a tap on it reaches the bubble's `onclick="sayNext()"`, on both `#screenDragonSay` and
  `#dragonSay`), so a tap anywhere on the bubble already closed the line. Now `say()` works out the button as before
  (`goKind`: none, close or next) and, on a screen in `SAY_NO_X_SCREENS` ['customer','cave'], shows no button instead of
  the X; OK (more to come) stays, and the forge and the other screens keep the X. FTUE test 752 -> 755 (written first; the
  r288 check reads `goKind`). Checked in the browser (1280x720, PART 3 jump): the counter's morning - D89 with OK, its
  bubble tapped - D92 with no button, the bubble tapped - closed; the cave - D92e as a last line with no button, the
  bubble tapped - closed; the forge - a last line with the X; every tap hit-tested on the bubble; no console errors.
- **R23 (2026-10-28, owner): Day 3 - no gathering until the pickaxe skill is upgraded.** Owner: "do not let players gather
  till they have upgraded skills on day 3". Day 3's morning (part 6, owner 2026-10-10) sends the player to the cave
  (`d2-d3cave`, D89a, D89b), says D89c and D89d ("Why don't you upgrade your pickaxe skill from the skill tree?") there
  (`d2-morning`), and opens the tree (`d2-skill`); the pickaxe gathered all along. Now `tutGatherHeld()` is true in those
  three stages (`DAY3_HOLD`) of part 6 until the Pickaxe Upgrade point is spent (`TUT_D2_SPENT`, set by `tutDay2Spent`):
  `pickCheck` does not swing at a seam and toasts "Upgrade the Pickaxe in the skill tree first" (at most every 2.5 s), and
  `mineNode` gives no ore. With no talent point to spend, closing the tree ends the stage (D140), so nothing is stuck. FTUE
  test 755 -> 759 (written first). Checked in the browser (1280x720, PART 6 jump, then the Day 3 morning: D89a at
  `d2-d3cave`, the cave, D89c at `d2-morning`): the pickaxe dragged onto a seam and held 2 s - no swing, no ore (the seam
  stayed at 7), one toast; the tree opened, the lit Pickaxe Upgrade tapped (rank 1, the hold off); the tree closed (D140);
  the same drag - 6 ore (the seam 7 -> 1), no toast; every press hit-tested; no console errors.
- **R24 (2026-10-28, owner): the rotated iron and manganese paths.** Owner: "If we rotate iron 30 degree anticlockwise
  and manganese 30 degree clockwise. I would still want them to reach the balanced and fire traits as they do now.
  nothing in the tutorial should break either." Tried in a generated test build first
  (`Swordforge_looptest_landscape_pathtest.html`); after two fire-run versions the owner chose manganese then a ground
  iron, and asked: "port this to the main build". The paths turn in `normalizeOrePaths` (`ORES` `rot`); Balanced
  (`FTUE.balancedAt` (1163, 1036)) and Fire (`FTUE.fireAt` (807, 1113)) move after the map is built, their values kept;
  `HAZ` removes the ribbon the run would cross and moves D69's speck and the fork speck; `ROUTE_FAST.irons` 5 -> 6. The
  fire run: D68, D69 (hazard lesson), D71 at the three ores' end (D70 waits), D72 / D72a, manganese only, D73, D74; on
  the manganese path Fire comes into view (`tutFireSeen`, `FTUE.fireSeenIn` 15): the ring, D70 (no pointer), the new
  **D70a** "Let's finish it with one ground iron." (stage `fire-iron`, the iron arrow); the iron in, the bellows, D75.
  200 dialogue keys. Records: specs/2026-10-28-rotated-ore-paths-test.md, the FTUE tracker ("Rotated iron and manganese
  paths"), the hazard record, the script. FTUE test 759 -> 776 (written first, including a geometry block that rebuilds
  both paths from the source and checks Balanced Epic, TC2's miss, Fire out of sight at D71, in view on the manganese
  path, and the route's end Fine); hazard test 37 (its `HAZ` and fire-stage checks updated first). Checked in the
  browser (PART 3 jump, the fire run driven stage by stage): D69a-c on the moved speck; D71 at the three ores' end; D72
  and D72a with their one-ore paths; iron refused, manganese taken; D70 104 from Fire with the ring and no pointer;
  D70a in `fire-iron`; the ground iron in; D75 at the end, 17.7 from Fire (Fine), 1 zone, health 95.3, normal speed.
  Raw 2 + 2 ends on Balanced 2.0 away (Epic), raw 1 + 1 reaches no trait. No console errors. Not run: parts 3-6 by hand
  (GC8, TC5 and Garric aim at Balanced through the same routes).
- **R25 (2026-10-28, owner): the forge's craft frame.** Owner: the new forge look (`assets/Anchor-images/Newforge.png`):
  "There is a wooden frame at the top left with the 5 point trait system, the x is the cancel craft button, the inkpot is
  the record craft and the craftbook is the craftbook. the pulley replaces the expand and collapse window. the collapsed
  version still shows the craftbook slightly." The text panel (RECORD CRAFT, CRAFT BOOK, the chevrons) is replaced by the
  owner's four layers on one 264 x 430 canvas, placed by `CRAFT_FRAME` (measured off the reference; record:
  specs/2026-10-28-forge-screen-new-look.md): left 4, top -12, 148 wide; closed it slides up 63.3% so the book's edge and
  the ring show. The ring: a tap toggles, a pull down opens, a push up closes. The old ids stay, so every tutorial pointer
  holds; the inkpot, the book and the ring glow along their art. The toast says "tap the inkpot". Webp beside each png.
  FTUE test 776 -> 785 (written first). Checked in the browser (1280x720, free play): the ring hit-tested, tapped open;
  slots, X, inkpot and book where the reference has them, each hit-tested at its centre; pushed up, closed (9 px of book,
  the ring below); pushed up again, stays closed. The ring hangs over the dragon's wing when closed (the dragon stays top
  left, owner).
- **R26 (2026-10-28, owner): the right rail, the bedroom calendar, the market on the counter.** Owner: "the skill tree
  replaces the day tab. market is no longer there (will add a separate image icon on customer counter later) setting moves
  to bottom right."; answers: a temporary market button on the counter; "the day shows up somewhere in the bedroom wall.
  like a calendar decor on the wall"; the book is the Diary, the basket the Quests. `RAIL_ART` (record:
  specs/2026-10-28-forge-screen-new-look.md): the skill tree (the owner's tree art, with its level, points and xp bar) in
  the day tile's place; the second row gone; the gear in the frame's bottom-right corner; the diary book and the quest
  basket over the bottom of the grid (their glow follows the art; the basket's claim glow too); `#dayNum` in a placeholder
  calendar on the bedroom wall (the save, the ledger and the day change read it as before); MARKET on the counter under
  CRAFT BOOK with its old id. FTUE test 785 -> 795, market test 54 (two checks rewritten), written first. Checked in the
  browser (1280x720, free play): skill tile, gear, diary and basket where the reference has them, each hit-tested; the
  basket glows green with a quest to claim; MARKET on the counter hit-tested and tapped (the market opens); the bedroom
  calendar shows the day, 1 -> 2 after a night, clear of the bed and the dragon's hotspots; no console errors.
- **R27 (2026-10-28, owner): D42 names the inkpot; the inventory above the basket.** Owner: "reword D42 to "Tap the inkpot
  to record the craft". check and reword anything that remains. also, I want the inventory to show 12 boxes in the
  available space above the quest bucket, the last three boxes fades in a gradient behind the questbucket." D42 ends "Tap
  the inkpot to record the craft."; a sweep of every line, toast, hint and label found nothing else naming an old control.
  The grid's rows are a fixed 85 px (gap 5): four rows (12 boxes) end at 475, the basket starts at 478; `MAT_CELLS` 12 ->
  15, the fifth row fading behind the basket (mask 360 -> 435 px into the shelf). Record:
  specs/2026-10-28-forge-screen-new-look.md. FTUE test 795 -> 799 (written first). Checked in the browser (1280x720,
  free play): row tops 120, 210, 300, 390, 480; the 12th box hit-tested; the fifth row fades behind the basket; the ore
  tab's names, art and counts fit the 85 px boxes; no console errors.
  **R27b (owner):** "the gradient is supposed to be dark in color". The fade showed the light card behind the boxes; it is
  now a dark overlay on the card's bottom 115 px (the rail's #1b120c, solid from 75%), over the slots and under the diary
  and the basket, taps passing through (the left box of the fifth row hit-tested). FTUE test 799 (the mask check rewritten,
  first). Checked in the browser; no console errors.
- **R28 (2026-10-29, owner): the ring guides the record step.** Owner: "add a glow on the pulley to guide players to drag the
  window down so they can see the inkpot. once they record, guide them to click on the pulley again to close the window."
  Found: the record step (r121) and the guide's change watcher asked whether the panel was hidden; since R25 the frame
  slides shut instead, so the step lit the off-screen inkpot and the watcher missed every open and close. Both read the
  `collapsed` class now. D42 with the frame closed: the ring glows and a down arrow slides over it (`TUT_DRAG_GESTURE`, a
  third kind, `down`); open: the inkpot glows; after recording: the ring glows, no arrow, and its tap closes the frame
  (D44). Record: specs/2026-10-28-forge-screen-new-look.md. FTUE test 799 -> 804 (the checks failed on the previous
  build, passed on this one). Checked in the browser (1280x720, PART 2 jump, the record stage): closed - ring glowing,
  arrow on; the ring pulled down (hit-tested) - open, the inkpot glowing, arrow off; recorded - the ring glowing, arrow
  off; the ring tapped - closed, D44; no console errors.
- **R29 (2026-10-29, owner): the ladle appears with TC4.** Owner: "Same as grinder, the ladle should appear only after the
  tutorial of it begins, when TC4 arrives." Like the grindstone (`#stMortar.ftue-lock`), `#ladle` and `#ladleHot` carry
  `ftue-lock` (not seen, no touch) until part 4 or the end of the tutorial; TC4's arrival is what makes it part 4, so the
  part is the switch and no save field is added. Record: specs/2026-10-21-smelter-version-loop.md (the ladle). FTUE test
  804 -> 808 (failing on the previous build first). Checked in the browser (1280x720): a new game, the PART 3 and PART 4
  jumps (TC4 at the bell) - hidden, its drag area not hit; TC4 arrives - shown, the drag area hit-tested; PART 5 and free
  play - shown; no console errors. Noted: the quest "Use the ladle for an epic tier sword" (page 2) can be listed in part
  3, before the ladle appears; it is still done in part 4.
- **R30 (2026-10-29, owner): the customer counter's new look** (`assets/Anchor-images/customer_counter_new.png`). The shelf
  top left is the forge's craft frame showing only the craft book and the ring (open to the book, 48.5%; closed as on the
  forge), open at first and the player's choice kept; the bell (`bell_new`) hangs top right and swings a little when idle,
  more when tapped, glowing with the swing in the tutorial; the ledger is the scroll at the bottom left; the market is the
  rotary (`#marketBtn`), which slides behind the inventory panel when dragged right, its crank left out (a tap or a drag
  left brings it back; a tap opens the market). Answers: a sliver stays out; the shelf remembers. Values in `COUNTER_UI`;
  record: specs/2026-10-28-forge-screen-new-look.md (R30). FTUE test 808 -> 819, market test 54 (one check rewritten),
  written first. Checked in the browser (1280x720, free play): book, ring, bell, scroll and rotary where the reference has
  them, each hit-tested; the ring pushed up - closed (9 px of book), tapped - open; the bell tapped - the big swing, a
  customer called; with the tutorial's glow it runs both animations; the rotary dragged right - in, 26 px out; its sliver
  tapped - out; tapped - the market opens; no console errors. Noted: with a customer at the counter, the speech bubble and
  COME LATER sit over the bell's lower half (the bell is not needed then).
- **R31 (2026-10-29, owner): the ring follows the finger.** Owner: "I like the 'swipe to close' on the market rotory. Have the
  same controls on the pulley for the craft window as well". Both rings (the forge's craft frame, the counter's shelf) go
  through one `wirePull`: held, the frame slides with the finger between its open and shut places (no further, no
  animation while held); let go after 12 px it goes the way it was going; a tap toggles. Record:
  specs/2026-10-28-forge-screen-new-look.md (R31). FTUE test 819 -> 821 (two ring checks rewritten, two added; failing on
  the previous build first). Checked in the browser (1280x720, free play): the forge ring pulled down 20/60/100 px - the
  frame followed (top -145, -105, -65), let go - open; pushed up - shut; half down and back up to 30 px - open; half up -
  shut; tapped twice - open, shut (each eased to -12 or -165 px); the counter ring the same between its book-open place and
  shut; every press hit-tested; no console errors.
