# HANDOFF

Living session-to-session state for Sword Forge. Updated + pushed at each session close.
Durable narrative here; volatile per-PR state (PR URL, merged SHA, branch) goes in the
continuation prompt printed at close time.

## Current state (2026-10-01)

- **Active build:** `Swordforge_looptest_landscape.html`, the **landscape loop-test**, and the only
  file being developed. The portrait loop-test (`Swordforge_new_looptest.html`) is deliberately never
  touched. `swordforgeV2.html` / `v1.html` are older canon.
- **Repo:** https://github.com/Lila-Games-Github/sword-forge
  **Live:** https://lila-games-github.github.io/sword-forge/ (the root redirects to the landscape build)
- **Status: rounds r197-r212 are merged and live.**
  - r197-r206, the FTUE in six parts: PR #19 (2026-09-30), plus the docs PRs #18 and #20.
  - r207-r211, hammer, Dagger, D57 and owner art: PR #21 (2026-10-01).
  - r212, Garric's rewards: PR #22 (2026-10-01).
  After each merge the Pages deploy succeeded, and the live `Swordforge_looptest_landscape.html` was
  checked byte-identical to `main`. **154 dialogue keys** (D15a in r209; D28b, D58a, D92a, D93a, D140 in r213; D69d in r215), `lastLine()` `D140`.
- **The tutorial is the FTUE in six parts** (r199-r206, r212). Design record and build records per
  part: `specs/2026-09-29-tutorial-parts-plan.md`. Every recorded value is in one `FTUE` object at the
  top of the main script; `tooling/ftue/ftue.test.mjs` asserts it against the record (110 checks).
- **The hammer minigame is on hit points** (r209). Design record `specs/2026-10-01-hammer-hit-points.md`;
  every value is in `HM_HITS`; `tooling/hammer/hammer.test.mjs` asserts it (27 checks).
- **Owner play-testing:** parts 1-4 "all good" (before r207). **Not yet play-tested by the owner:**
  parts 5-6, the new hammer (r209), the art in place (r211), Garric's reward window (r212). All of
  these were verified by script and in the browser pane only.
- **Start a new round like this:**
  ```bash
  git checkout main && git pull
  git checkout -b sword-forge/<2-5-kebab-keywords>
  ```
  The owner named two branches themselves (`Swordforge_FTUE_v2`, `Swordforge_FTUEv2_polish`; both merged
  and deleted); the convention is still `sword-forge/<keywords>`.
- **Do not commit directly to `main`**: every push there publishes the site. Docs changes go through a
  branch and PR too.
- **Old branches:** `sword-forge/playtest-polish-r197`, `tutorial-polish` and `swordforge-ftue-tutorial`
  were deleted on the owner's instruction (2026-09-30). Remote leftovers from older work
  (`fm/sf-lazy-load`, `sword-forge/core-loop-mapping`, `sword-forge/pathforge-cluster-infusion`,
  `variation-a-prototype`) are untouched.

### The FTUE by part

| Part | Tutorial customer | Gameplay customers | Rewards |
| --- | --- | --- | --- |
| 1 | Bram: first balanced sword, quest list, build mode, bell | GPC1, GPC2 (balanced) | shop banner; balanced Longsword; balanced Broadsword + grindstone |
| 2 | TC2 (`man1`): grinding, record craft | GPC3 (5 balanced, bulk craft) | +5 recipe pages (8); design desk |
| 3 | TC3 (`woman1`): fire, decorating, Day 1 end, skill tree, Day 2 cave | GPC4 fire, GPC5 balanced, GPC6 fire | balanced + fire parts, fire Longsword; fire Broadsword; fire parts |
| 4 | TC4 (`man2`): tier alignment, storing swift, gale | GPC7 gale, GPC8 fire | gale Longsword + parts; gale Rapier + parts |
| 5 | Bram (`BramD2`): sharpened swift sword, the diary | GPC9 gale, GPC10 swift | swift Dagger (r208); swift parts |
| 6 | Garric (`man4`): no gameplay; he grades his sword | none | by grade (r212): 1 nothing, 2 a 10g tip, 3 the tip + balanced parts x6 |

- **Systems:** reward window; blueprints per trait + shape (Shortsword always open); design desk parts
  earned per trait (`FTUE.startParts` 3, +1 of each per reward); recipe page limit (3, then 8); locked
  grindstone and design desk; quests pay on **CLAIM** (coins fly to the gold counter); **build mode**
  (decor from ITEMS & DECOR onto the counter, shop or bedroom, behind every prop); silent ore caps on
  the tutorial swords; D28a + Retry for part 1's customer swords; the Day 2 cave stocked for Day 2
  (2-3 ores a swing); PART 1-6 buttons beside SKIP HAMMER (`ftuePart(n)` in the console).
- **New lines:** D28a, D99a, D111a, D15a (inserted beside D28, D99, D111, D15). **Reworded:** D29, D31,
  D32-D34, D57 (r210). **Moved:** the quest list (D118/D119) to part 1; sharpening (D48-D55) and D57 to
  part 5; the Day 2 ore run (D94/D94b) to right after the skill tree.
- **Fixes:** r197, a stored dragon-pulled blade offset the next path; r198, hammering the gale route
  stops the sword on Gale's centre, then D98 and the mug; the menu's New Game never spoke D1; only D139
  ended the tutorial, then any of Garric's three endings did (`FTUE.endLines`); since r213 all three
  endings close on the shared line D140, which is the map's last key and the only `FTUE.endLines` entry.

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
- **FTUE v3 (planning complete, `specs/2026-10-07-ftue-v3-rework.md`):** shared systems built on `sword-forge/ftue-v3-rework`: the MARKET button and window (blueprints per trait and shape, 50g, closed until part 1 opens it), the dragon buying with flying coins (`marketGift`), shaped orders, Durable as a trait key, SKILL TREE as a tree icon, no CRAFT 5. Test: `tooling/market/market.test.mjs` (50). **Part 1 built:** three shaped GCs (Longsword, Broadsword bought by the dragon; Katana bought by the player, gold topped up to 50 if short), no part 1 rewards, 9 + 9 ore. **Part 2 built:** TC2 starts at 1 + 1 ore, the raw route misses Balanced, the dragon gives the grindstone and returns the ores; no bulk order; TC3 skips the design desk and gives no reward. **Part 3 built:** Day 2 without the skill tree; GC4 Durable (map window, cave with nickel, 2 ground nickel; Durable moved to (1577, 740): Fine without the pull, Epic with it); GC5-GC7 fire Longsword/Broadsword (dragon buys) and Katana (player buys). **Part 4 built:** TC4 Epic Durable (cave trip, the pull lesson parks the sword on Durable), TC5 gale with the reminder, GC8 Weak balanced Longsword (the hammer parks in the Weak band); orders can name a tier. **Part 5 built:** Bram's swift Dagger (the dragon buys the blueprint), the sharpening wheel locked until his reward window, the diary, GC9 gale Longsword (the dragon buys). **Part 6 built:** Garric gives the design desk (D130b) and its lesson, the banner in every outcome and its lesson, then the second night, Day 3 and the skill tree; D140 ends the FTUE. GC1-GC3 are guided through the whole craft by pointers (owner, 2026-10-08). **FTUE v3 is complete; owner play-test pending.** 2026-10-09: a new Sword crafted window (card + sliding details paper), and recipes keep their hammering; a new quest list (two pages of seven, 20g + 20 xp each); the customer waiting system (COME LATER, the waiting list on the ledger, a two-sword customer sent there at the end of part 4). Blueprint prices rise (50 x (trait place + shape step); balanced Katana 150, fire Katana 200), and the market slides across all 25 traits. 2026-10-09 play-test fixes: exits from the screen map, the dragon on every FTUE screen, GC5/GC6 craft-book guides, the Day 2 cave holds all of Day 2 + 5 (TC4 has no cave trip, Garric no refill).

## Next steps

The owner drives the work beat by beat from play-testing; expect fresh reports rather than this list.

1. **Owner play-test** of the r209 hammer (feel of drag + tap, ring distance, mark size 5% of the
   stage), the r211 art in place, Garric's reward window (r212), and parts 5-6. The sharpening minigame
   and Garric's solo craft were jumped over in testing (both beats are unchanged, but now run in a new
   order).
2. **A reload mid-part loses the tutorial position.** The save keeps `FTUE_ST` (unlocks, decor, rewards,
   `done`) and quest claims, but not `TUT_STAGE`. Planned fix: save the part number at each part
   boundary. Not built; ask the owner before building.
3. **Art still to come** (full list: "Art needed" in the FTUE design record):
   - `balanced_rapier_midblade` / `balanced_dagger_midblade`; then delete `HM_MID_ALIAS.Rapier` /
     `.Dagger`;
   - a coin icon (the gold reward row shows 🪙);
   - the emoji lock / rapier icons;
   - the reward and UI icons (the "parts" reward icon would replace the small `guard5` in Garric's
     window).
   A new PNG needs its `.webp` (see CLAUDE.md, `assets/sword-parts/`).
4. **Owner questions still open:**
   - the r209 forging price multipliers (x1.3 / x1.0 / x0.8) are Claude's proposal; the owner gave only
     the bands. One place to change: `HM_HITS.bands` (with the record and the test);
   - Garric's gift is now 6 balanced parts (r211 placement, Claude's reading of the code); confirm;
   - the GPC3 wording ("I need 5 Balanced swords. Can you make them all?" / "Good. N more, please.");
   - lock the basement sharpening wheel until part 5?
   - should the PART 1-6 buttons stay public? (SKIP HAMMER stays public: owner's decision, 2026-09-23);
   - the r197 path-offset report ("still not fixed"): never confirmed whether it was tested on the live
     link (which did not have the fix then) or locally. The fix is live now; ask for a re-test.
5. Older, still open: D67a wording ("a trait could be from this image"); the Alignment for Tiers window
   is once per game (a re-open under settings is planned); whether a re-quench may upgrade a trait
   tier; 4 skill nodes are still empty (yellow 1-3, green 7; r218 filled the other four).

**Closed since the last handoff:** "no rewards in part 6" (r212: the owner called it a mistake);
`DD_BONUS.balanced` shipping empty (r211); the fire and gale placeholder parts (r211); the
stale hammer baseline count (26, now 27).

## How to verify current state

```bash
git log --oneline -3
node -e "const s=require('fs').readFileSync('Swordforge_looptest_landscape.html','utf8');[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach(m=>new Function(m[1]));console.log('parses OK')"
node tooling/ftue/ftue.test.mjs
node tooling/hammer/hammer.test.mjs
node tooling/hazard/hazard.test.mjs
node tooling/skills/skills.test.mjs
node tooling/map/map.test.mjs
node tooling/mobile-fit/fit.test.mjs
bash .claude/hooks/verify-living-docs.sh --audit
```
Then `preview_start` (name `sword-forge`, port **5679**) and navigate explicitly to
`http://localhost:5679/Swordforge_looptest_landscape.html`. Expect 154 dialogue keys, `lastLine()`
`"D140"`, and `ftuePart(3)` to land at TC3's bell.

**Baselines, not regressions:** the FTUE test prints GREEN at 400 checks; the hammer test GREEN at 34; the hazard test GREEN at 37; the skills test GREEN at 18; the map test GREEN at 9;
the mobile-fit test GREEN at **21** cases (its summary line can print only "GREEN /" in some shells);
the living-docs audit prints **10 `ORPHAN` lines** for `docs/wiki/` and exits 0.

## Gotchas

- **The verify commands are bash** (Git Bash is present). On PowerShell use
  `.claude/hooks/verify-living-docs.ps1`.
- **Tests that run here:** `tooling/ftue`, `tooling/hammer`, `tooling/hazard`, `tooling/skills`, `tooling/map` and `tooling/mobile-fit`.
  `tooling/anchor-match` and the `docs/wiki/` search script need Python, which is not installed.
  (`tooling/asset-diet` is a manifest generator and converter page, not a test.)
- **GitHub Issues is empty**, although `CLAUDE.md` routes work through it. Every open item lives here.
- **A recorded value is changed in three places together:** the design record, the config object
  (`FTUE` or `HM_HITS`), and the test. Write the test change first and watch it fail.
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
- **There are two arrows.** `#tutArrow` is the scripted dashed pointer; `#hintArrow` is the white idle
  nudge. Since r187 the white one stands down whenever `TUT_ARROW` is set.
- **A halo near a clipped edge does not read.** `#rail` and `#frame` are `overflow: hidden`; use a face
  swap there (`tutBlinkTab` / `tutBlinkSkill`).
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

- **The FTUE design record wins over the tutorial script SSOT on order and rewards.**
  `specs/2026-09-15-looptest-landscape-tutorial-script.md` still holds the dialogue text and the beat
  notes, but its order is the pre-FTUE one (sharpening in the TC2 run, the quest list with the diary,
  the Day 2 cave after TC4's order). `specs/2026-09-29-tutorial-parts-plan.md` has the current order.
  Within that record, a later dated section supersedes an earlier one (for example r212 over r206's
  "no rewards").
- `INDEX.md`'s "WHERE CANON LIVES NOW" table is correct for the build; the per-section split lower down
  is superseded.
- `docs/wiki/` describes `index.html`/`swordforgeV2.html`. The 10 audit orphans are these pages.
- **`specs/game-design.md`** is named the mechanics SSOT by CLAUDE.md, but its header still names the
  portrait build canon. Mechanics are recorded in the dated specs instead; say so in the commit.
- `specs/README.md` and `README.md` still name older builds in their bodies, under dated banners.
- `plan.md`'s "Next up" is V1/V2 scope.
