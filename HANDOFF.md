# HANDOFF

Living session-to-session state for Sword Forge. Updated + pushed at each session close.
Durable narrative here; volatile per-PR state (PR URL, merged SHA, branch) goes in the
continuation prompt printed at close time.

## Current state (2026-09-18)

- **Active build:** `Swordforge_looptest_landscape.html` — the **landscape loop-test**, and the only
  file being developed. The portrait loop-test (`Swordforge_new_looptest.html`) is deliberately never
  touched; the two have diverged in catalog and layout. `swordforgeV2.html` / `index.html` are older
  canon and were not touched this session.
- **Repo:** https://github.com/Lila-Games-Github/sword-forge (Pages: https://lila-games-github.github.io/sword-forge/)
- **Status:** rounds **r60–r101** are pushed and proposed in **one open PR**, not yet merged — the
  owner chose to hold it for review at session close. Merging is also the deploy: `.github/workflows/deploy.yml`
  publishes Pages on every push to `main`. The last push before this one was PR #12 / `e2bdca4` (up to r59),
  so this PR is a very large single review.

### What the landscape build now has

- **A guided tutorial, D1–D43.** Copy and ordering are owned by
  `specs/2026-09-15-looptest-landscape-tutorial-script.md`; the build follows that file, not the
  reverse. It runs: first craft → the counter and Bram's sale → the bell and a second customer → a
  second forge run that teaches grinding and recording a craft.
- **Dragon dialogue system.** `DIALOGUE` map + `SAY_SEQ` run; the dragon guides until the script's
  **last** line has played, then tapping him pops hearts. "Last" is the final key of `DIALOGUE`, so it
  needs no maintenance as lines are added. A counter-side dragon (`#screenDragon`) mirrors him.
- **Craft loop:** smelter gate waits on **heat ≥ 70** (not a timer); grinding wheel driven by **angle
  swept** (2 turns per ore, either direction); hammering-minigame fire aimed by **holding the metal**;
  a quench mug finishes the blade; a **Sword Crafted** window ends every craft path.
- **Economy/meta:** cave ore-gathering, shop racks + locks + passive sale, exp/level/talent with four
  blue skills, a counter **bell** that summons customers asking for a trait (80% discovered / 20% not).
- **Per-trait art:** the Design Desk shows only the set belonging to the sword being designed
  (fire=`flame_*`, swift, ice, water; unprefixed "balanced" is the default placeholder).

## Next steps

1. **Continue the tutorial script past D43.** The owner supplies each line; check it for errors and
   ask before implementing (that is a standing instruction). D43 currently ends at the record-craft
   choice — the natural next beat is shaping/hammering the second sword and selling it.
2. **A swift Broadsword is a visible seam** — swift grip/guard/pommel on a *balanced* broadsword
   blade, because `swift_broadsword_blade.png` does not exist. Ice and water are thinner still (one
   part each, longsword blade only).
3. **`assets/ui/dragon_icon.png` is referenced nowhere** — committed but unused; ask the owner where
   it goes.
4. **19 `hint()` calls are dead.** `hint()` has been a no-op since r34, so a lot of instructional text
   never appears — including "Still heating — keep pumping the bellows", the only feedback for tapping
   a cold gate. Either restore a hint surface or convert the ones that matter to `toast()`.
5. **Customers ask for a trait but nothing enforces it** — the sale pays for whatever sword is on the
   counter, match or not. Matching, refusal, patience and price effects are a customer system, not a
   bell. Spontaneous (unrung) arrivals are also unbuilt.
6. Older, still open: no day system behind END DAY; talent points buy nothing on the 8 yellow/green
   skill nodes; the manganese ore *image* still uses the r29 guess (`gale_ore.png`); tutorial state is
   not in the save.

## How to verify current state

```bash
git log --oneline -3
node -e "const s=require('fs').readFileSync('Swordforge_looptest_landscape.html','utf8');new Function(s.match(/<script>([\s\S]*)<\/script>/)[1]);console.log('parses OK')"
bash .claude/hooks/verify-living-docs.sh --audit
```
Then open the build with the preview tools (`preview_start` name `sword-forge`, port 5678) and read
`DIALOGUE`, `lastLine()`, `TUT_STAGE` from the console. **Screenshots work** if the pane is visible —
retry once on timeout; they fail while the window is minimised.

## Gotchas

- **One file, terse style.** Many statements share one very long line. **Never** put an inline `//`
  comment mid-line — it silently deletes the rest of the line (this once destroyed `wireDragon` and
  aborted `initMechanics`). Block comments or own-line comments only.
- **Patch by script, not by hand.** Write a node script to the scratchpad with an anchored
  `replace`-with-uniqueness-check, and **syntax-check with `new Function` over the `<script>` body
  before writing**. Backticks inside a node template literal will break the script.
- `core.autocrlf=true` while committed blobs are CRLF — diffs can look larger than they are.
- `TRAIT_POS` is **sketch space**, not world space: `wx = START.x + (p.x − REF_C.x) · REF_S`.
- The Browser pane reports `innerWidth: 0` until `resize_window`, and a **hidden pane freezes
  `requestAnimationFrame`** — drive `tick()`/`hmTick()` by hand when verifying anything time-based.
- Console **retains errors from earlier loads**; check the URL stamp before believing one.
