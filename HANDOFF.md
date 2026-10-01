# HANDOFF

Living session-to-session state for Sword Forge. Updated + pushed at each session close.
Durable narrative here; volatile per-PR state (PR URL, merged SHA, branch) goes in the
continuation prompt printed at close time.

## Current state (2026-09-30)

- **Active build:** `Swordforge_looptest_landscape.html`, the **landscape loop-test**, and the only
  file being developed. The portrait loop-test (`Swordforge_new_looptest.html`) is deliberately never
  touched. `swordforgeV2.html` / `v1.html` are older canon.
- **Repo:** https://github.com/Lila-Games-Github/sword-forge
  **Live:** https://lila-games-github.github.io/sword-forge/ (the root redirects to the landscape build)
- **Status:** rounds **r197-r206 are merged and live** (PR #19, merge `77931a7`, 2026-09-30); the docs
  PR #18 is merged too (`7b3748b`). Verified against the deployed site, not assumed: the live
  `Swordforge_looptest_landscape.html` is byte-identical to the file on `main`, and carries the `FTUE`
  config and the PART 1-6 buttons. **147 dialogue keys**, `lastLine()` `D139`.
- **The tutorial is now the FTUE in six parts** (r199-r206). Design record and build records per part:
  `specs/2026-09-29-tutorial-parts-plan.md`. Every recorded value is in one `FTUE` object at the top of
  the main script, and `tooling/ftue/ftue.test.mjs` asserts it against the record (50 checks).
  **The owner play-tested parts 1-4: all good.** Parts 5-6 were verified by script only.
- **Start a new round like this:**
  ```bash
  git checkout main && git pull
  git checkout -b sword-forge/<2-5-kebab-keywords>
  ```
  The FTUE branch was named `Swordforge_FTUE_v2` on the owner's instruction (deleted after the merge);
  the convention is still `sword-forge/<keywords>`.
- **Do not commit directly to `main`**: every push there publishes the site.
- **Stale local branches** (not on GitHub's `main` path any more): `sword-forge/playtest-polish-r197`
  (its r197/r198 are in #19), `tutorial-polish` (#18's, merged), `swordforge-ftue-tutorial` (not made
  in that session, left alone). Delete only if the owner says so.

### What changed (r197-r206)

| Part | Tutorial customer | Gameplay customers | Rewards |
| --- | --- | --- | --- |
| 1 | Bram: first balanced sword, quest list, build mode, bell | GPC1, GPC2 (balanced) | shop banner; balanced Longsword; balanced Broadsword + grindstone |
| 2 | TC2 (`man1`): grinding, record craft | GPC3 (5 balanced, bulk craft) | +5 recipe pages (8); design desk |
| 3 | TC3 (`woman1`): fire, decorating, Day 1 end, skill tree, Day 2 cave | GPC4 fire, GPC5 balanced, GPC6 fire | balanced + fire parts, fire Longsword; fire Broadsword; fire parts |
| 4 | TC4 (`man2`): tier alignment, storing swift, gale | GPC7 gale, GPC8 fire | gale Longsword + parts; gale Rapier + parts |
| 5 | Bram (`BramD2`): sharpened swift sword, the diary | GPC9 gale, GPC10 swift | swift Dagger (r208); swift parts |
| 6 | Garric (`man4`): no gameplay, no rewards | none | none |

- **Systems:** reward window; blueprints per trait + shape (Shortsword always open); design desk parts
  earned per trait (`FTUE.startParts` 3, +1 of each per reward); recipe page limit (3, then 8); locked
  grindstone and design desk; quests pay on **CLAIM** (coins fly to the gold counter); **build mode**
  (decor from ITEMS & DECOR onto the counter, shop or bedroom, behind every prop); silent ore caps on
  the tutorial swords; D28a + Retry for part 1's customer swords; the Day 2 cave stocked for Day 2
  (2-3 ores a swing); PART 1-6 buttons beside SKIP HAMMER (`ftuePart(n)` in the console).
- **New lines:** D28a, D99a, D111a (inserted beside D28, D99, D111). **Reworded:** D29, D31, D32-D34.
  **Moved:** the quest list (D118/D119) to part 1; sharpening (D48-D55) and D57 to part 5; the Day 2
  ore run (D94/D94b) to right after the skill tree.
- **Fixes:** r197, a stored dragon-pulled blade offset the next path; r198, hammering the gale route
  stops the sword on Gale's centre, then D98 and the mug; the menu's New Game never spoke D1; only D139
  ended the tutorial, now any of Garric's three endings does (`FTUE.endLines`).

## Next steps

The owner drives the work beat by beat from play-testing; expect fresh reports rather than this list.

1. **Owner play-through of parts 5-6.** Not yet done. The sharpening minigame and Garric's solo craft
   were jumped over in testing (both beats are unchanged, but now run in a new order).
2. **A reload mid-part loses the tutorial position.** The save keeps `FTUE_ST` (unlocks, decor, rewards,
   `done`) and quest claims, but not `TUT_STAGE`. Planned fix: save the part number at each part
   boundary. Not built; ask the owner before building.
3. **Art from the owner** (full list: "Art needed" in the design record). When a file lands:
   delete its `DD_ALIAS` line (fire and gale parts); add gale blades to `DD_BLADES`; delete
   `HM_MID_ALIAS.Rapier` / `.Dagger` for `balanced_rapier_midblade` / `balanced_dagger_midblade`; replace the banner's red rectangle
   (`FTUE.decor.banner`); swap the emoji lock / rapier icons.
4. **Owner questions still open:**
   - the GPC3 wording ("I need 5 Balanced swords. Can you make them all?" / "Good. N more, please.");
   - lock the basement sharpening wheel until part 5?
   - should the PART 1-6 buttons stay public? (SKIP HAMMER stays public: owner's decision, 2026-09-23);
   - the r197 path-offset report ("still not fixed"): never confirmed whether it was tested on the live
     link (which did not have the fix then) or locally. The fix is live now; ask for a re-test.
5. Older, still open: D67a wording ("a trait could be from this image"); the Alignment for Tiers window
   is once per game (a re-open under settings is planned); whether a re-quench may upgrade a trait
   tier; `DD_BONUS.balanced` (Garric's gift) ships empty pending art; talent points buy nothing on the
   8 yellow/green skill nodes.

**Closed since the last handoff:** the gale/Epic item (r198; the old 27.1 measurement used raw copper,
the real route passes within 0.4 of Gale); gating SKIP HAMMER (the owner said no); the 35-swing Day 2
cave (r203, 2-3 ores a swing).

## How to verify current state

```bash
git log --oneline -3
node -e "const s=require('fs').readFileSync('Swordforge_looptest_landscape.html','utf8');[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach(m=>new Function(m[1]));console.log('parses OK')"
node tooling/ftue/ftue.test.mjs
node tooling/mobile-fit/fit.test.mjs
bash .claude/hooks/verify-living-docs.sh --audit
```
Then `preview_start` (name `sword-forge`, port **5679**) and navigate explicitly to
`http://localhost:5679/Swordforge_looptest_landscape.html`. Expect 147 dialogue keys, `lastLine()`
`"D139"`, and `ftuePart(3)` to land at TC3's bell.

**Baselines, not regressions:** the FTUE test prints GREEN at 50 checks; the mobile-fit test prints
GREEN at **21** cases (the old handoff said 23, which was wrong: the file has not changed since r135);
the living-docs audit prints **10 `ORPHAN` lines** for `docs/wiki/` and exits 0.

## Gotchas

- **The verify commands are bash** (Git Bash is present). On PowerShell use
  `.claude/hooks/verify-living-docs.ps1`.
- **Tests that run here:** `tooling/ftue` and `tooling/mobile-fit`. `tooling/anchor-match` and the
  `docs/wiki/` search script need Python, which is not installed. (`tooling/asset-diet` is a manifest
  generator, not a test.)
- **GitHub Issues is empty**, although `CLAUDE.md` routes work through it. Every open item lives here.
- **An FTUE value is changed in three places together:** the design record, the `FTUE` object, and
  the test. Write the test change first and watch it fail.
- **"Grindstone" is two things.** In the FTUE it is the forge's ore grinding wheel (`#stMortar`, art
  `anchor_grindwheel.webp`). `assets/forge/grindstone.webp` is the **basement sharpening wheel**.
  r202 fixed a reward window that showed the wrong one.
- **The shelf rebuilds its slots on every change**, so a blink put on a slot is lost. Pointers that
  mark a slot are recomputed from state after every `buildShelf()` (`ftueDecorStep`, `ftueBulkStep`).
- **A new CSS class can already be taken.** `rw-row` belonged to the rack window and broke the reward
  window's layout (renamed `rwd-`). Grep a class name before using it.
- **Chained customer lines replace each other at once.** `typeAfter` fires the moment a line finishes,
  so a second `custLine` wipes the first unread. Bram's D111 + D111a are one typed speech for this reason.
- **Rewards and coins time out; they never wait on an animation.** A hidden pane freezes animations,
  so `flyCoins` lands the gold on a `setTimeout`, not `onfinish`.
- **`ftuePart(n)` builds an approximate state** (gold, exp, fog and books are guesses). It is a test
  aid for jumping to a part, not a save.
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
  `<script>` block separately** (there are two).
- The Browser pane reports `innerWidth: 0` until `resize_window`, and a **hidden pane freezes
  `requestAnimationFrame` and CSS animations/transitions**. Drive `tick()` by hand.

## Documentation drift you will hit

- **The FTUE design record wins over the tutorial script SSOT on order and rewards.**
  `specs/2026-09-15-looptest-landscape-tutorial-script.md` still holds the dialogue text and the beat
  notes, but its order is the pre-FTUE one (sharpening in the TC2 run, the quest list with the diary,
  the Day 2 cave after TC4's order). `specs/2026-09-29-tutorial-parts-plan.md` has the current order.
- `INDEX.md`'s "WHERE CANON LIVES NOW" table is correct for the build; the per-section split lower down
  is superseded.
- `docs/wiki/` describes `index.html`/`swordforgeV2.html`. The 10 audit orphans are these pages.
- **`specs/game-design.md`** is named the mechanics SSOT by CLAUDE.md, but its header still names the
  portrait build canon. Mechanics are recorded in the dated specs instead; say so in the commit.
- `specs/README.md` and `README.md` still name older builds in their bodies, under dated banners.
- `plan.md`'s "Next up" is V1/V2 scope.
