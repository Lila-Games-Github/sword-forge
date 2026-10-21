# HANDOFF

Living session-to-session state for Sword Forge. Updated + pushed at each session close.
Durable narrative here; volatile per-PR state (PR URL, merged SHA, branch) goes in the
continuation prompt printed at close time.

## Current state (2026-10-14)

- **Active build:** `Swordforge_looptest_landscape.html`, the **landscape loop-test**, and the only
  file being developed. The portrait loop-test (`Swordforge_new_looptest.html`) is deliberately never
  touched. `swordforgeV2.html` / `v1.html` are older canon.
- **Repo:** https://github.com/Lila-Games-Github/sword-forge
  **Live:** https://lila-games-github.github.io/sword-forge/ (the root redirects to the landscape build)
- **Status: FTUE v3 is merged and live.** PR #24 (2026-10-14) carried r216-r230, the FTUE v3 rework
  (parts 1-6), its play-test round and the fixes after it; the Pages deploy succeeded and the live page
  serves the merged build. **200 dialogue keys** (D92m, D92n added 2026-10-15; D119a, D119b 2026-10-16; D11 and D28 removed, D18a and D28j added 2026-10-21), `lastLine()` `D140`.
- **The FTUE is v3, in six parts.** Design record, per-part build records and every owner decision:
  **`specs/2026-10-07-ftue-v3-rework.md`** (it supersedes `specs/2026-09-29-tutorial-parts-plan.md` on order
  and content). Its **"## Log"** (the last section) is the dated one-line list of every change; each
  change's full record is a bullet appended just above **"## Cross-part issues"** (which itself only holds
  the cross-part items X1-X2). Recorded values sit in the `FTUE` object (top of the main
  script), `MARKET` (blueprints), `HAZ` (hazards, incl. `HAZ.move`) and `HM_HITS`; seven test suites assert
  them (see "How to verify").
- **Owner play-testing:** the owner play-tested v3 piece by piece this session and reported each issue;
  every report is fixed. **A full play-through of the whole v3 FTUE on the live build has not happened
  yet.** Most fixes were verified in the browser pane by driving game functions, not by playing.
- **Working rule (owner, 2026-10-14): one commit per feature, made as soon as it is finished** (tests
  GREEN, browser-checked, tracker + counts updated). Push / PR / merge only when the owner asks.
- **Start a new round like this:**
  ```bash
  git checkout main && git pull
  git checkout -b sword-forge/<2-5-kebab-keywords>
  ```
  The convention is `sword-forge/<keywords>` (the owner has also named branches themselves).
- **Do not commit directly to `main`**: every push there publishes the site. Docs changes go through a
  branch and PR too.

### The FTUE v3 by part (detail: the tracker's "## Part n" sections)

| Part | Tutorial customer | Gameplay customers (GC) | Notes |
| --- | --- | --- | --- |
| 1 | Bram: first balanced sword, quests, bell | GC1-GC3 balanced Longsword / Broadsword (dragon buys) / Katana (player buys), guided through the craft | market opens here; the first crafted window teaches itself (D17a-c) |
| 2 | TC2: raw ores miss, the grindstone gift, grinding | none | TC3 (fire) has no desk, no reward |
| 3 | TC3: fire; the fire run's last ore is a choice (full iron crosses a moved speck, full manganese avoids it) | GC4 Durable lesson; GC5-GC7 fire via market and craft book | Day 1 ends; Day 2 cave stocked (20 iron/manganese) |
| 4 | TC4: Epic Durable and the pull lesson; TC5 gale | GC8 Weak stop; the waiting customer (gale Katana + fire Claymore, COME LATER) | the waiting customer's guide starts once gold covers 750g |
| 5 | Bram: swift Dagger, the sharpening wheel, the diary | GC9 gale Longsword (dragon buys) | sharpening DONE needs the green band in the lesson |
| 6 | Garric: design desk lesson, grading, the banner | none | Day 3: cave first, then the pickaxe skill (D89b-d); D140 ends the FTUE |

### What changed in r207-r212

- **r207:** the hammer shows each trait and shape. Stages: metal sphere, then
  `balanced_<shape>_midblade`, then the sword's own blade (`bladeFor(skin, shape)`). Heat glow masked
  to each blade (`.hm-heat`). `hammer_sword.*` is no longer drawn.
- **r208:** swift's third shape is the **Dagger** (`swift_dagger_blade`), not the Rapier; GPC9 gives the
  swift Dagger blueprint. Gale keeps the Rapier.
- **r209:** **hit points.**
  - The orb has 1 point, struck 3 times. Then 3 random points sit on the mid-blade's solid pixels.
  - An aim ring sits below the hammer head (`HM_HITS.ring` 55%, 46.5%). Drag the hammer to move it;
    tap the hammer to strike. Over a point, the ring is yellow, blue or red for the band that strike
    would get.
  - A strike off every point is free. A counted strike still needs heat.
  - The 6 accuracies average into a band: 85% Masterwork, 60% Good, else Crude. The band is stored as
    `w.quality` / `w.forge` and multiplies the base price (x1.3 / x1.0 / x0.8).
  - SKIP HAMMER, recipe crafts and old saves count as Good. New line D15a.
- **r210:** D57 says the bonus is from sharpening; `{b}` is the sharpening bonus alone (the design
  bonus is still paid).
- **r211:** the owner's art.
  - All fire and gale parts are real now (`DD_ALIAS` is empty); gale blades are in `DD_BLADES`.
  - Balanced grips, guards and pommels 5-6 are Garric's gift (`DD_BONUS`). `pommel5` moved there,
    because the balanced set never showed more than 4.
  - The shop banner is `assets/Decor/Banner.webp`.
- **r212:** Garric's old rewards (r131/r132) open in the reward window when he leaves:
  `FTUE.garricRewards`, new reward kinds `gold` and unlock `garricParts`. The sale no longer pays the
  tip.
- **r213:** the owner's dialogue review. 18 lines reworded (record: the r213 sections of the tutorial
  script and the FTUE design record); five new lines: D28b (GPC1), D58a (GPC3), D92a (GPC4), D93a
  (TC4, why copper), D140 (the shared close after every Garric ending); D57 moved before Bram's D114;
  D110 ends "I'm Bram, by the way.", and Bram's name tag is "???" until that line has typed out; no curly
  quotes in any line.
- **r214:** selling Garric a sword short of his best grade (Epic + customized + sharpened) first opens
  "Sell this sword?" (`#sfGarricAsk`), naming what the sword lacks; "No, keep it" leaves it on the
  counter. Garric only; every other sale is unchanged.
- **r215: hazard integrity** (design record `specs/2026-10-01-hazard-integrity.md`, test
  `tooling/hazard/hazard.test.mjs`, 28 checks). The sword keeps its health (`w.hp`) and the zones it
  crossed (`w.haz`, each zone once). Health lowers the base price (x 0.5 + 0.5 x health); 3+ zones drop
  every trait one tier, 5+ two (owner chose the trait tier; Claude set the numbers, owner may rework).
  Recipes keep their route's health and zones, so bulk craft cannot dodge it. Craft window: Integrity
  row. Tutorial: D69b names the cost; new D69d over the fire sword's craft window (the bubble lifts
  above the window, `.say-over-modal`); the island the part 4 gale route crossed is removed (`HAZ.clear`).
- **r216:** D69a-D69c play the first time the sword crosses a hazard **during the fire sword build**
  (`TUT_FIRE_BUILD` stages), not on the first crossing ever; earlier crossings no longer spend them,
  and the PART 2-3 jumps no longer mark them said.
- **r217:** "Integrity" is "Health" to the player; the craft window's Health row shows the gold lost, in
  red. D69d: "See its health? ...".
- **r218: four new skills** (design record `specs/2026-10-06-skill-tree-trade-ore.md`, test
  `tooling/skills/skills.test.mjs`): Improved Trading Skills (yellow node 0, 20 ranks, +5% base price a
  rank, x2 at 20); Ore Extraction Upgrade (green 4, 5 ranks, 5-25% chance a seam holds 3-4 more, rolled
  once per seam); Pickaxe Upgrade (green 5, 5 ranks, 10% faster swings a rank); Ore Bountifulness
  (green 6, 10 ranks, +1 ore a seam a rank). 1 point a rank. The ore skills skip the tutorial's
  scripted caves (`script:true` seams). Yellow nodes 1-3 and green node 7 are still empty.
- **r219:** the hammer's hit marks show the heat as a smooth gradient: yellow (1.0) → orange (0.7) →
  red (0.45) → grey (0.35, too cold to strike) (`HM_HITS.heat`, `hmHeatColor()`).
- **r220:** a trait icon on the map opens the craft book on that trait's newest page (record
  `specs/2026-10-06-map-trait-links.md`, test `tooling/map/map.test.mjs`). A still tap on the map, not a
  drag; undiscovered: "Discover this trait first"; no page: "No saved page for <Trait> yet"; fogged: nothing.
- **r221:** during the tutorial the waiting customer's trait is ringed on the map (`#custSpot`), only if
  discovered; TC2 and Bram's return carry `want` (balanced, swift) for it.
- **r222:** until the grinder can be used (TC2), the path preview shows only its solid part, not the
  dotted grinding tail (`ftueGrindHidden()`).
- **r223:** tutorial ore arrows follow the metal: part 1 moves from Iron to Manganese after 2 iron; the
  fire sword's first half (D68) gets ore arrows (Iron, then Manganese; wheel, turn, smelter).
- **r224:** the first book's "+50" stays on screen, lit above the pause's dim layer, until D9 is closed.
- **r225:** tier colours: purple Epic, blue Fine, dark grey Weak (`tierColor()` and the tier legend); yellow
  Epic did not read on the beige windows.
- **r226:** the hammer's accuracy popup is 26 px, lasts 1.6 s and rises almost to the top before fading.
- **r227:** after D22 the player clicks "I can give you a sword." before D23 appears; the counter-screen
  dragon is 25% smaller (17.25% wide).
- **r228:** the counter's DENY button (a placeholder) is hidden during the FTUE (class `ftue-off` until `FTUE_ST.done`).
- **r229:** the rotating turn arrow shows whenever ore is on the grinder and can still be ground, on the forge screen, in every stage (`grindSpinWanted()`, refreshed every frame in `tick()`).
- **r230:** the fog edge is a soft gradient: `#fogHoles` is blurred by `#fogSoft` (feGaussianBlur 24 world units) inside the mask. Not yet checked for frame rate on a phone.
- **r231:** the customer's dialogue text is 50% bigger: 17px -> 25.5px in `.cs-dlg p` and `.cs-bram-dlg p`.
- **r232:** the inventory tabs are icons (iron ore, ingot, a balanced Longsword, the banner), named by `title`/`aria-label`; the fourth tab is "Decor", not "Items & Decor".
- **r233:** the Ingots tab icon is the shelf's own metal orb (`.mt-orb .inv-orb`), not the ingot bar.
- **r234:** the customer's dialogue text is 25% smaller than r231: 25.5px -> **19.125px** (the current size).
- **r235:** the "Sword crafted!" card shows the health % and the forging % under the heart and the hammer (`#cwHpPct`, `#cwHmPct`; "-" when the hammer was skipped).
- **r236:** every return to the forge screen puts the dragon back at his top-left LAYOUT spot; `homeDragon()` now reapplies `LAYOUT` (it used to drop him bottom left).
- **r237:** the table sword's art box (`.cs-sword`) takes no taps, so it no longer covers the sharpening wheel; its strip (`.cs-swordbox`) grabs the sword.
- **r238:** `takeCounter()` refused whenever `TUT_BRAM_STATE` was set, and it stays 'done' all game, so no counter sword could go back to the inventory after part 1; it now refuses only during Bram's scene.
- **r239:** the craft-book guide re-runs when a window closes (`ftueBookModal()` in `ftueBookSig()`), so CRAFT 1 stops blinking after the craft; in the FTUE, `ftueCraftLocked()` disables CRAFT 1 while the customer's order is already made.
- **r240:** every arrival in the cave lights the pickaxe (`PICK_HINT`, `.cv-hint` = `tutGlow` on its image) until the player touches it.
- **r241:** the cancel-craft X opens a confirmation (`#sfCancelAsk`); only "Yes, cancel" resets the run. Open: Restore Ore can still return some ore, though the line says none comes back.
- **r242:** `.tut-blink` is the dialogue OK glow (`tutLitCtl`); the rail buttons blink like the inventory tabs (`tutBlinkTab`); the clipped halo `tutBlinkHalo` is gone.
- **r243:** the blade's health is a ring around the sword marker on the map (`#swordHpRing`, driven by `updateHpPill()`); the top-right bar `#sfHp` is gone. Owner to confirm the amber/red warning colours.
- **r244:** the customer's line is left-aligned across its box, so it types left to right.
- **r245:** GC5 (map route): D92m "Let's go to the forge."; on the forge the map scrolls fire into view and `#tutHole` darkens everything but the trait while D92n says "Tap on the trait to open the craft book directly."
- **r246:** player-facing text says "tap", never "click" (owner: the game is for mobile; their "click" means tap). D92n reworded; a test bars "click" in dialogue.
- **r247:** Garric's D130 has no "Let me try to do it on my own." answer; its lit OK goes on to D130b and the design desk (`SAY_AFTER.D130`).
- **r248:** the customer's trait ring on the map (`#custSpot`) goes once a sword with that trait is crafted (`custTraitMade`), whatever its shape or tier.
- **r249:** leaving the basement puts the table sword back in the bag (`workAutoReturn()`, no message since r250); the take steps move to their way-back stage. Open: `#sfToast` takes taps and covers the up exit while it shows.
- **r251:** `ROUTE_FAST` { irons:5, mul:2 }: a route at least 5 fully ground irons long (1000 units, drawn length) runs the sword x2; hazard damage takes the same factor (same cost per distance).
- **r252:** gameplay customers thank you after a sale: a random `CUST_THANKS` line by the sword's best tier (5 each; a Weak sword they asked for gets a Fine line), shown for 3.2 s by the display-only `CUST_BYE`.
- **r253:** the part 4 come-later customer is guided to MARKET first (both blueprints shown and lit, then Close), then D107d and COME LATER (`FTUE_LATER`).
- **r254:** the GC4 map window (basic vs elemental) shows `assets/ui/MAP_parts2.webp`; the five-parts window keeps `MAP_parts.webp`.
- **r255:** after the part 1 quest list, D119a teaches "tap me for help": close it, tap the glowing dragon (`tutGlowBig`), D119b, then the bell (D27, D28) as before.
- **r256:** the blade's health is now a fill inside the sword disc (`#swordHpFill`, top 100% down to 0%, clipped to the disc, 60% opaque); r243's ring covered the tier alignment ring.
- **r257:** the health fill always shows on the sword marker, from the start point (full when there is no run).
- **r258:** the two tutorial books and the EXP line D9 are on the second sword's route (GC1), not the first (Bram's); `BOOK_LESSON_STAGES` (the `p1-craft-*` stages) replaces `FIRST_CRAFT_STAGES`.
- **r259:** the mug quench plays steam puffs and a full-screen mist (`quenchFx`, `QUENCH_FX`, 1.55 s) before the trait window; the trait itself is gained at once.
- **r260:** the quench mist is a soft plain white gradient, not the tiled smoke art.
- **r261:** metal on the anvil is drawn hot only while it has heat; a quench leaves it grey.
- **r262:** the hammer minigame's mug plays the same steam and mist (`quenchFx` with a spot in `#hmFx`, the mist lifted over the minigame) before `finishBlade()`.
- **r263:** the white idle-nudge arrows are gone: the drag nudge is the guide's dashed arrow (metal -> furnace), the tap nudge the metal's glow.
- **r264:** the metal's glow is `tutGlowOrb`, a white ring with a gold halo (a gold drop-shadow alone vanished on the parchment).
- **r265:** the white arrow images (`assets/ui/arrow.*`, `arrow_point_down.*`) are deleted, with their asset-diet entries.
- **r266:** the owner's new `map_base.png` is in the game: `map_base.webp` regenerated (2048 wide, q 0.82) and its manifest entry updated. The PNG itself went in with r260 by mistake (`git add -A`); commits now name their files.
- **r291:** the ore chain, step 1: the bag starts with 2 Iron + 2 Manganese and after each tutorial sword the dragon gives the next sword's ores (`FTUE.oreChain`, reward kind 'ore', D18a / D28j over the window); the Day 2 cave holds 2 Nickel. Next: the craft lock (D28k) and the refill (D28l).
- **r290:** fixed the minigame's D13 replay: `tutHmStep` says D13 only after the first sword's shape pick (`TUT_HM_FIRST`); GC4/TC4/GC8 keep their stage, so their counter pointer works again.
- **r289:** every market ask (D28b, D28e, D28g, D92h-D92j, D111b, D113a) has no close button.
- **r288:** D15 pauses the game under the dark screen until its OK (`SAY_PAUSE_ONE`); D28b has no close; a `SAY_NO_X` line has no button anywhere in a run (D23 had become an OK behind a stale run).
- **r287:** D118 and D27 have no close button; D28 ("Go ahead, try it!") removed (198 keys). The script doc's play-order section is updated with each line change (edit it by hand: add, remove or renumber the entry).
- **r286:** the trait window (`showAcquire`) closes the dragon's open line (D10) first.
- **r285:** the tutorial script doc reads in play order (all 199 lines, parts 1-6). Found while tracing: the minigame's D13 replay (fixed in r290); the v3 record's Katana price (50g) differs from the build (150g / 200g).
- **r284:** D24 has no close button (`SAY_NO_X`).
- **r283:** D15 "It is hot enough.", D15a "Pick up your hammer, line up the ring..."; after D21 or D22 the player taps "I just crafted a sword. You can have it." before D23; D23 has no close.
- **r282:** D10 and D11 are one line (D10), no close button; D11 removed (199 keys).
- **r281:** `SAY_NO_X`: the first sword's instruction lines (D3-D7, D11, D12, D14, D15a, D17, D18) show no close button; D8, D9, D16, D19 keep it. `.say-go.none` now beats `#dragonSay .go`, so a hidden button no longer leaves an empty frame.
- **r280:** the route (`#pathline`) is dark brown `#4a2c17`; the held ore's preview stays red at opacity 0.45 / 0.3 (values Claude's proposal).
- **r279:** `SCREEN_TAB`: the forge opens on the ingredients tab, the basement, the counter and the shop on the swords tab (`goScreen`); the bedroom and the cave keep theirs.
- **r278:** a trait icon on the map opens a small trait card (icon, name, description; CRAFT 1, CONTINUE FROM HERE, CRAFT BOOK, and a close the owner did not ask for), not the book. GC5's map route points at the card's CRAFT 1. Open: D92n still says "open the craft book".
- **r277:** the hammer minigame takes a press on what is under the finger: the hammer's own pixels first, then the metal's or blade's, else nothing (`wireHmTouch`, `hmOnHammer`, `hmOnWork`, `HM_HITS.touch` slack 6/8 px, Claude's proposal). The box pads (`#hmGrip`, `#hmAimPad`, `#hmStrikePad`) no longer take presses; the metal's box used to turn a tap on the hammer's handle into dragon fire.
- **r276:** `STAGE_DARK.travel` (hammering to the '?'): map window, anvil and metal lifted. Open: the hammer is not lifted (owner's list), so it hides behind the anvil while held there.
- **r275:** `STAGE_DARK.quench` (D10, D11): anvil, metal, bucket, mug lifted (bucket/mug rules `!important` over their inline z); the dim lifts while `#quenchFog` has `.catch`.
- **r274:** `.dark-lit.dragging` (z64 !important) keeps a lifted prop over the dim mid-drag; `.dragging` alone (35 !important) put it under.
- **r273:** the ore step also shows the map's highlight, path and sword: a fog window (`#tutHoleMap`, a soft hole per `#fogHoles` circle via the fog rect's screen CTM, `FOG_EDGE` 40).
- **r272:** `STAGE_DARK` (stage -> lifted elements / cut windows, replaces r271's ORE_DARK_*): D3-D7 stay dark around what each step uses; D8 cuts a window over the map, and `tutPause` leaves `#tutDim` off in a dark stage.
- **r271:** the ore step (D3 until 2+2 ores are in) is dark too: `#stSmelt` lifted over the dim, a window cut for `#matPanel` (`ORE_DARK_CUT`/`ORE_DARK_LIFT`, `tutDarkLayout`).
- **r270:** D1 and D2 are read on a dark screen (`tutDark`, `SAY_DARK`: the r245 `#tutHole` dim with no hole; the dragon and `#dragonSay` at z61).
- **r269:** the owner's second `map_base.png` update: `map_base.webp` regenerated (2048 wide, q 0.82, 583 KB), manifest updated.
- **r268:** a paid sale flies coins from SELL to the gold panel (`flyCoins`, as a quest claim); the HUD count waits for them (`setGoldShown`).
- **r267:** an order of several swords is sold one sword at a time (`orderHandOver`, `CUSTOMER.held`); the gold, REP, popularity and XP for all of them come with the last sale. COME LATER returns held swords.
- **FTUE v3 (history; now built, merged and live, see "Current state"; `specs/2026-10-07-ftue-v3-rework.md`):** shared systems built on `sword-forge/ftue-v3-rework`: the MARKET button and window (blueprints per trait and shape, 50g, closed until part 1 opens it), the dragon buying with flying coins (`marketGift`), shaped orders, Durable as a trait key, SKILL TREE as a tree icon, no CRAFT 5. Test: `tooling/market/market.test.mjs` (50). **Part 1 built:** three shaped GCs (Longsword, Broadsword bought by the dragon; Katana bought by the player, gold topped up to 50 if short), no part 1 rewards, 9 + 9 ore. **Part 2 built:** TC2 starts at 1 + 1 ore, the raw route misses Balanced, the dragon gives the grindstone and returns the ores; no bulk order; TC3 skips the design desk and gives no reward. **Part 3 built:** Day 2 without the skill tree; GC4 Durable (map window, cave with nickel, 2 ground nickel; Durable moved to (1577, 740): Fine without the pull, Epic with it); GC5-GC7 fire Longsword/Broadsword (dragon buys) and Katana (player buys). **Part 4 built:** TC4 Epic Durable (cave trip, the pull lesson parks the sword on Durable), TC5 gale with the reminder, GC8 Weak balanced Longsword (the hammer parks in the Weak band); orders can name a tier. **Part 5 built:** Bram's swift Dagger (the dragon buys the blueprint), the sharpening wheel locked until his reward window, the diary, GC9 gale Longsword (the dragon buys). **Part 6 built:** Garric gives the design desk (D130b) and its lesson, the banner in every outcome and its lesson, then the second night, Day 3 and the skill tree; D140 ends the FTUE. GC1-GC3 are guided through the whole craft by pointers (owner, 2026-10-08). **FTUE v3 is complete; owner play-test pending.** 2026-10-09: a new Sword crafted window (card + sliding details paper), and recipes keep their hammering; a new quest list (two pages of seven, 20g + 20 xp each); the customer waiting system (COME LATER, the waiting list on the ledger, a two-sword customer sent there at the end of part 4). Blueprint prices rise (50 x (trait place + shape step); balanced Katana 150, fire Katana 200), and the market slides across all 25 traits. 2026-10-09 play-test fixes: exits from the screen map, the dragon on every FTUE screen, GC5/GC6 craft-book guides, the Day 2 cave holds all of Day 2 + 5 (TC4 has no cave trip, Garric no refill).

## Next steps

**Next session's focus (owner, 2026-10-14): keep fixing and polishing.** The owner drives the work beat
by beat from play-testing; expect fresh reports. For each: reproduce, write the test first, fix, check in
the browser, add the change's record (a bullet just above "## Cross-part issues") and its one-line entry
(the end of "## Log") to the tracker, update the counts in CLAUDE.md and here (test checks; and the
dialogue-key count / last key when a line is added), then **commit that one feature**. Mechanics are recorded
in the dated specs, not `specs/game-design.md` (see "Documentation drift").

1. **Owner play-test of the whole v3 FTUE on the live build** - none has been done end to end.
2. **Owner items still open (ask, do not decide):**
   - 24 of the 25 craft-book sword descriptions (`SWORD_DESC`) are placeholders; balanced is the owner's.
   - Craft-book headings: the owner asked for "Crafting process" / "Shapes unlocked"; the updated wireframe
     labels them "Recipe" / "Shapes discovered". The owner's words were kept; confirm.
   - The waiting customer's guide starts as soon as gold reaches 750g - possibly right after that customer
     says "come back when you are richer". Confirm the timing.
   - At D70 fire's disc is now fully under the fog (fire moved 5 units away); only the pulsing ring marks it.
   - `assets/Game-elements/polishing_desk.png` is in the repo but deliberately not shown yet.
3. **A reload mid-part loses the tutorial position.** The save keeps `FTUE_ST` but not `TUT_STAGE`. Not
   built; ask the owner before building.
4. **Art still to come:** see the "art" list, `specs/2026-10-07-ftue-v3-art-list.md`.
5. Older owner questions (from 2026-10-01, still open): the r209 forging price multipliers (x1.3 / x1.0 /
   x0.8, `HM_HITS.bands`); Garric's gift as 6 balanced parts; whether the PART 1-6 buttons stay public;
   D67a wording; 4 empty skill nodes (yellow 1-3, green 7).

## How to verify current state

```bash
git log --oneline -3
node -e "const s=require('fs').readFileSync('Swordforge_looptest_landscape.html','utf8');[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach(m=>new Function(m[1]));console.log('parses OK')"
node tooling/ftue/ftue.test.mjs
node tooling/hammer/hammer.test.mjs
node tooling/hazard/hazard.test.mjs
node tooling/market/market.test.mjs
node tooling/skills/skills.test.mjs
node tooling/map/map.test.mjs
node tooling/mobile-fit/fit.test.mjs
bash .claude/hooks/verify-living-docs.sh --audit
```
Then `preview_start` (name `sword-forge`, port **5679**; `autoPort` is on, so use the port it reports) and navigate explicitly to
`http://localhost:5679/Swordforge_looptest_landscape.html`. Expect 200 dialogue keys, `lastLine()`
`"D140"`, and `ftuePart(3)` to land at TC3's bell (`TUT_STAGE` `bell2`).

**Baselines, not regressions:** the FTUE test prints GREEN at 580 checks; the market test GREEN at 50; the hammer test GREEN at 47; the hazard test GREEN at 37; the skills test GREEN at 18; the map test GREEN at 17;
the mobile-fit test GREEN at **21** cases (its summary line can print only "GREEN /" in some shells);
the living-docs audit prints **10 `ORPHAN` lines** for `docs/wiki/` and exits 0.

## Gotchas

- **Check line endings with Node, never `grep`/`awk` here** - they read through carriage returns. The
  tracked text files are CRLF in the working copy; a Node patch script (normalise to LF, patch, restore CRLF)
  keeps them so; `sed -i` in Git Bash and some tools silently write LF. One-liner:
  `node -e "const s=require('fs').readFileSync('FILE','utf8');console.log((s.match(/(^|[^\r])\n/g)||[]).length)"` (0 = clean).
- **A new tutorial action step needs a `TUT_SKIP` entry** (stage -> a check on game state + the call that moves
  on), or a player who acts before the line stalls the guide. Its "done" must also be true once the player
  has gone further. "Go to screen X" steps go in `TUT_SKIP_SCREEN`.
- **Side guides that run beside the tutorial keep their own state** (the waiting customer's guide:
  `FTUE_ST.wq`) and speak only at a free moment (`wqFree`), so they never touch `TUT_STAGE`.
- **Shell escaping eats backslashes** in heredocs and `node -e`: write patch scripts and regex-bearing test
  lines with the Write/Edit tools.
- **The verify commands are bash** (Git Bash is present). On PowerShell use
  `.claude/hooks/verify-living-docs.ps1`.
- **Tests that run here (seven):** `tooling/ftue`, `tooling/market`, `tooling/hammer`, `tooling/hazard`, `tooling/skills`, `tooling/map` and `tooling/mobile-fit`.
  `tooling/anchor-match` and the `docs/wiki/` search script need Python, which is not installed.
  (`tooling/asset-diet` is a manifest generator and converter page, not a test.)
- **GitHub Issues is empty**, although `CLAUDE.md` routes work through it. Every open item lives here.
- **A recorded value is changed in three places together:** the design record, the config object
  (`FTUE`, `MARKET`, `HAZ`, `SKILLS` or `HM_HITS`), and the test. Write the test change first and watch it fail.
- **"Grindstone" is two things.** In the FTUE it is the forge's ore grinding wheel (`#stMortar`, art
  `anchor_grindwheel.webp`). `assets/forge/grindstone.webp` is the **basement sharpening wheel**.
- **"Quality" is two things.** The craft window's **Quality** row is the trait tier (Weak/Fine/Epic);
  the r209 hammer grade is **Forging** (Masterwork/Good/Crude, `w.quality`). Do not merge the names.
- **The hammer's tap pad sits above the dragon's.** `#hmAimPad` (hold the metal to heat it) covers the
  anvil, so `#hmStrikePad` on the hammer head is z-index 7. A new layer over the anvil must keep that
  order, or taps on the head heat the metal instead of striking.
- **The tutorial owns the screen in tests.** Driving the hammer from a fresh load, a cold strike speaks
  D16 and pauses under `#tutDim`, and `#dragonSay` covers the scene top. See LEARNINGS (2026-10-01).
- **Owner art arrives as PNG; the game loads WebP.** Convert in the preview page and save through the
  dev server's `/__save` (CLAUDE.md, `assets/sword-parts/`). Never crop sword parts.
- **The shelf rebuilds its slots on every change**, so a blink put on a slot is lost. Pointers that
  mark a slot are recomputed from state after every `buildShelf()` (`ftueDecorStep`, `ftueBulkStep`).
- **A new CSS class can already be taken.** `rw-row` belonged to the rack window and broke the reward
  window's layout (renamed `rwd-`). Grep a class name before using it.
- **Chained customer lines replace each other at once.** `typeAfter` fires the moment a line finishes,
  so a second `custLine` wipes the first unread. Bram's D111 + D111a are one typed speech for this reason.
- **Rewards and coins time out; they never wait on an animation.** A hidden pane freezes animations,
  so `flyCoins` lands the gold on a `setTimeout`, not `onfinish`.
- **`ftuePart(n)` builds an approximate state** (gold, exp, fog and books are guesses), and part of it
  settles after a delay. It is a test aid for jumping to a part, not a save.
- **Verify through the path a player takes.** Drive real `tick()` frames and real `PointerEvent`s, and
  click through `elementFromPoint`. See LEARNINGS.
- **There is one arrow.** `#tutArrow` is the dashed pointer. Since r263 the idle nudges use it too (written to `TUT_ARROW`
  as `HINT_ARROW_REF`, cleared only by the nudge) or the metal's glow; the white arrow images are gone. A guide arrow
  still makes the nudge stand down.
- **A halo near a clipped edge does not read.** `#rail` and `#frame` are `overflow: hidden`; since r242 `.tut-blink`
  is `tutLitCtl` (its inset glow survives clipping) and every rail button uses the tabs' face swap (`tutBlinkTab`).
- **A pointer or line is retired only if something retires it.** Setting the next stage is not enough
  unless that stage speaks or points.
- **`TUT_TICK_STAGES` gates the idle pointer.** A new branch in `tutNudgeApply()` is dead unless its
  stage is in that list.
- **`refundOre()` is the Restore Ore talent, not a refund.** For a real restore, loop `segs` and
  `gainOre` (as `ftueRetry` does).
- **One file, terse style.** Never put an inline `//` comment mid-line; it silently deletes the rest of
  the line. Block or own-line comments only.
- **Patch by script, not by hand.** Anchored `replace` with a uniqueness check, and **syntax-check each
  `<script>` block separately** (there are two). The working tree is CRLF: normalise to LF, patch,
  restore CRLF. Write regex-bearing lines with the Edit tool or a quoted heredoc (LEARNINGS).
- The Browser pane reports `innerWidth: 0` until `resize_window`, and a **hidden pane freezes
  `requestAnimationFrame` and CSS animations/transitions**. Drive `tick()` by hand.

## Documentation drift you will hit

- **The FTUE v3 record (`specs/2026-10-07-ftue-v3-rework.md`) wins over the tutorial script SSOT and the
  2026-09-29 parts plan on order, content and rewards.**
  Since r285 `specs/2026-09-15-looptest-landscape-tutorial-script.md` opens with the whole script in play
  order (as of r284, text copied from the build); its build history below that is the pre-FTUE order
  (sharpening in the TC2 run, the quest list with the diary, the Day 2 cave after TC4's order). When a line
  or step changes, update the play-order section too. The 2026-09-29 parts plan is superseded. Within the v3 record a
  later dated entry supersedes an earlier one (e.g. the Day 3 cave over D48).
- `INDEX.md`'s "WHERE CANON LIVES NOW" table is correct for the build; the per-section split lower down
  is superseded.
- `docs/wiki/` describes `index.html`/`swordforgeV2.html`. The 10 audit orphans are these pages.
- **`specs/game-design.md`** is named the mechanics SSOT by CLAUDE.md, but its header still names the
  portrait build canon. Mechanics are recorded in the dated specs instead; say so in the commit.
- `specs/README.md` and `README.md` still name older builds in their bodies, under dated banners.
- `plan.md`'s "Next up" is V1/V2 scope.
