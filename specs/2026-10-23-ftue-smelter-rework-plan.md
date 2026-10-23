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
