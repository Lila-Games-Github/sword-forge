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
   blade, because `swift_broadsword_blade.png` does not exist. Ice and water are thinner still: a longsword blade plus
   exactly one grip, one guard and one pommel each.
3. **`assets/ui/dragon_icon.png` is referenced nowhere** — committed but unused; ask the owner where
   it goes.
4. **19 `hint()` calls are dead.** `hint()` has been a no-op since r34, so a lot of instructional text
   never appears — including "Still heating — keep pumping the bellows", the only feedback for tapping
   a cold gate. Either restore a hint surface or convert the ones that matter to `toast()`. **Why it went:** r34 cut
   the `#sfHint` bottom bar to match `Main_forge_wireframe.png`; `#sfToast` is the surviving surface.
   Rationale at `specs/2026-08-18-...md` lines ~1112/1130/2550 — do not rebuild the bar blindly.
5. **Customers ask for a trait but nothing enforces it** — the sale pays for whatever sword is on the
   counter, match or not. Matching, refusal, patience and price effects are a customer system, not a
   bell. Spontaneous (unrung) arrivals are also unbuilt.
6. Older, still open: no day system behind the end-of-day flow (`openEndDay()`, reached by clicking the
   **bed** on the bedroom screen — there is no "END DAY" button; that string is V1/V2); talent points buy nothing on the 8 yellow/green
   skill nodes; the manganese ore *image* still uses the r29 guess (`gale_ore.png`); tutorial state is
   not in the save.

## How to verify current state

```bash
git log --oneline -3
node -e "const s=require('fs').readFileSync('Swordforge_looptest_landscape.html','utf8');new Function(s.match(/<script>([\s\S]*)<\/script>/)[1]);console.log('parses OK')"
bash .claude/hooks/verify-living-docs.sh --audit
```
Then `preview_start` (name `sword-forge`, port 5678) **and navigate explicitly to**
`http://localhost:5678/Swordforge_looptest_landscape.html` — the server maps `/` to `index.html`, which
is **V1**, where `DIALOGUE`/`lastLine()`/`TUT_STAGE` are all `undefined` and the build looks broken.
With the right URL loaded, expect `Object.keys(DIALOGUE).length === 43` and `lastLine() === "D43"`.
The living-docs audit prints **10 pre-existing `ORPHAN` lines** for `docs/wiki/` and exits 0 — that is
the expected baseline, not a regression. **Screenshots work** if the pane is visible —
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

## Before you start — open questions for the owner

Three things a fresh agent cannot resolve alone. Ask these first; everything else is workable from the
specs.

1. **What is D44?** The owner supplies dialogue one line at a time and the standing instruction is to
   check the wording and ask before implementing. Nothing in the repo predicts the next line.
2. **PR #10 (`fm/sf-lazy-load`, open since 2026-09-07) — land, rebase or close?** It defers
   non-first-paint art *and* renames the landscape build canonical across `INDEX.md`, `README.md`,
   `plan.md`, `specs/README.md`, `specs/game-design.md`. **It is already `CONFLICTING`/`DIRTY` against `main` today** — independently of PR #13, and `main`
   has not moved since PR #12 — so "just land it" is not available without a rebase. It also overlaps
   PR #13 on `INDEX.md`, `plan.md` and the build file. It is also the change
   that would have prevented the canonical-build confusion below.
3. **Do D44+ commits stack on `sword-forge/tutorial-script-and-craft-systems`, or start a new branch
   off it?** PR #13 is already +8182/−3120 across 31 files. Stacking makes it harder to review;
   branching means two open PRs on the same file. Not decided. Remember **merging to `main` deploys
   Pages**, so this is not a private choice.

**If the owner is away**, the ranked fallback is: (a) next-step 4 (the 19 dead `hint()` calls — a
self-contained fix); then (b) next-step 2 (`swift_broadsword_blade.png`, needs art, so prepare the
fallback instead); then (c) next-step 5 (enforce the customer's trait request — but that invents
economy rules, so write the proposal rather than the code). Do **not** start D44+ without the line.

## Documentation drift you will hit

Several repo docs still describe the *older* builds. Corrected in CLAUDE.md on 2026-09-18, but the
others are untouched (some are inside PR #10's scope, so they were left alone deliberately):

- `INDEX.md` line ~13 still routes "craft/movement loop" to `Swordforge_new_looptest.html` — the
  portrait build that is never edited. `plan.md`'s "🔜 Next up" section is likewise V1/V2 scope: its
  save/load keys (`currentDay`, `customersToday`, `diaryGiven`, `shopLedger`) appear **nowhere** in the
  landscape build.
- `docs/wiki/` describes `index.html`/`swordforgeV2.html`, including a `Tutorial Flow` page about the
  `tutorialFlow` array, which the landscape build does not have. Its search script needs Python, which
  is not installed here.
- `README.md` and `specs/README.md` still name `swordforgeV2.html` / `Swordforge_new_looptest.html`
  canonical. Both are inside **PR #10's** file list, so they were left alone here rather than creating
  more conflict. `ONBOARDING.md` is in **no** PR and is what CLAUDE.md tells a new agent to read first —
  it got a dated banner on 2026-09-18 instead.
- `AGENTS.md` carries a "Delegation preference" (delegate implementation to cheaper subagents) that
  CLAUDE.md does not mention. Weigh it against the first gotcha below — a mid-line `//` in this file
  silently deletes the rest of the line and once destroyed `wireDragon`. Delegate edits to this file
  with care, or not at all.
