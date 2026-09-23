# HANDOFF

Living session-to-session state for Sword Forge. Updated + pushed at each session close.
Durable narrative here; volatile per-PR state (PR URL, merged SHA, branch) goes in the
continuation prompt printed at close time.

## Current state (2026-09-23)

- **Active build:** `Swordforge_looptest_landscape.html` — the **landscape loop-test**, and the only
  file being developed. The portrait loop-test (`Swordforge_new_looptest.html`) is deliberately never
  touched. `swordforgeV2.html` / `v1.html` are older canon and were not touched this session.
- **Repo:** https://github.com/Lila-Games-Github/sword-forge
  **Live:** https://lila-games-github.github.io/sword-forge/ (the root redirects to the landscape build)
- **Status:** rounds **r154–r196** are **merged and live**. PR #16 landed 41 commits (r154–r194) and
  PR #17 landed r195–r196; Pages redeployed on both (`.github/workflows/deploy.yml` fires on every push
  to `main`). Verified against the deployed site, not assumed: **144 dialogue keys**, `lastLine()`
  `D139`, `MAP_parts.webp` served at 87 KB.
- **Branch:** `tutorial-polish`, level with `main`. **Do not commit directly to `main`** — every push
  there publishes the site.

### What this session changed (r154–r196)

Roughly forty rounds of play-test polish. The themes, not the list:

- **Dialogue script.** New lines D69a/b/c (the first hazard crossing stops the world), D94b, D130a,
  D67a. D30 deleted; D4, D42, D128 reworded. **New ids are inserted beside their neighbours, never
  appended** — `lastLine()` is the map's final key and drives the guide-to-pet switch. Still `D139`.
- **Pointer vocabulary, finished.** "tap to continue" became a real button (`.say-go`) with a
  double-play / X icon that **lights up** on lines whose only next step is a click (`SAY_GO_GLOW`).
  Tab halos, the skill-tree blink and the panel-close chevron all take a **face swap** instead of a
  halo. `.tut-lit-ctl` lights any control (SELL, answer buttons, the go button) additively.
- **Windows.** Day transitions fade the whole frame to black and name the day. "Alignment for Tiers"
  after D97. Bram's illustration between his reply and D111. The map-parts window after D67a. The
  Sword Crafted window is 50% bigger.
- **Layout and input.** The dragon has a **position per screen**; nothing can be dragged under the
  inventory panel any more (counter dragon, cave pickaxe, bench dragon, hammer, mug). Map controls
  moved to the top right. A SKIP HAMMER cheat sits outside the frame.
- **Payload.** weak/fine/epic, Bram's illustration and MAP_parts converted to WebP:
  **2.93 MB → 259 KB**. Manifest 140 → 145 entries.

## Next steps

1. **The gale/Epic alignment bug — the owner parked this deliberately and it is the top item.**
   The dragon-pull already stops at the **closest approach** (it clamps to the projection of the trait
   onto the line toward spawn), so "stop as soon as Epic is available" cannot be done by changing
   *when* it stops — stopping sooner only lands further away. Measured on a copper route the closest
   approach to gale is **27.1 units** against `ALIGN_EPIC 9` / `ALIGN_FINE 20`, i.e. **Weak**. Epic is
   unreachable by pulling. The levers are: move gale, re-cut the copper route, widen `ALIGN_EPIC`, or
   let the pull steer rather than run straight at spawn. **Ask the owner which** — this is a tuning
   decision, not a bug fix.
2. **Gate the SKIP HAMMER cheat** if the owner wants it off the public link. `#cheatBar` is
   unconditional, so it is visible on the deployed Pages site to anyone with the URL. One line in the
   `load` handler (`location.search.indexOf('cheats')>=0`).
3. **D67a wording.** "You can guess where a trait could be from this image" can read for a moment as
   "a trait from this image". Flagged to the owner, not changed.
4. **The "Alignment for Tiers" window is once-per-game.** The owner said a re-open will live under
   settings → tutorial later. Nothing built for it yet.
5. Older, still open: the 35-swing Day 2 cave; whether a re-quench may upgrade a trait tier; the
   `DD_BONUS.balanced` part lists ship **empty** pending art (dropping filenames into that one object
   is all that is needed); no day system behind the end-of-day flow beyond the r162 transition;
   talent points buy nothing on the 8 yellow/green skill nodes; tutorial state is not in the save.

## How to verify current state

```bash
git log --oneline -3
node -e "const s=require('fs').readFileSync('Swordforge_looptest_landscape.html','utf8');[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach(m=>new Function(m[1]));console.log('parses OK')"
node tooling/mobile-fit/fit.test.mjs
bash .claude/hooks/verify-living-docs.sh --audit
```
Then `preview_start` (name `sword-forge`, port **5679**) and navigate explicitly to
`http://localhost:5679/Swordforge_looptest_landscape.html`. Expect
`Object.keys(DIALOGUE).length === 144` and `lastLine() === "D139"`.

**Baselines, not regressions:** the mobile-fit test prints GREEN at 23 cases; the living-docs audit
prints **10 `ORPHAN` lines** for `docs/wiki/` and exits 0. Screenshots work when the app window is
visible — retry once on timeout, then fall back to `javascript_tool` measurements.

## Gotchas

- **Verify through the path a player takes.** This cost three bugs this session. Driving a function
  directly proves the branch is correct and says **nothing** about whether anything reaches it. Drive
  real `tick()` frames and real `PointerEvent`s. See LEARNINGS.
- **There are two arrows.** `#tutArrow` is the scripted dashed pointer; `#hintArrow` is
  `assets/ui/arrow.webp`, a white idle nudge that fades in after 4 s. Clearing one is not clearing the
  other. Since r187 the white one stands down whenever `TUT_ARROW` is set.
- **A halo near a clipped edge does not read.** `#rail` and `#frame` are `overflow: hidden`. Anything
  within ~20 px of their edges needs a face swap (`tutBlinkTab` / `tutBlinkSkill`), not a box-shadow.
- **A pointer or line is retired only if something retires it.** Setting the next stage is not enough
  unless that stage speaks or points. Every arrival branch was swept in r183; the table is in the
  tutorial script spec.
- **`TUT_TICK_STAGES` gates the idle pointer.** A new branch in `tutNudgeApply()` is dead unless its
  stage is in that list.
- **`refundOre()` is the Restore Ore talent, not a refund** — a per-ore roll at 10 % a rank, so
  unranked it returns nothing. For a real restore, loop `segs` and `gainOre`.
- **One file, terse style.** Never put an inline `//` comment mid-line — it silently deletes the rest
  of the line. Block or own-line comments only.
- **Patch by script, not by hand.** Anchored `replace` with a uniqueness check, a CRLF-aware `nl()`
  normaliser, and **syntax-check each `<script>` block separately** (there are two).
- The Browser pane reports `innerWidth: 0` until `resize_window`, and a **hidden pane freezes
  `requestAnimationFrame` and CSS animations/transitions** — drive `tick()` by hand, and pin an
  animation's `currentTime` to inspect a keyframe.

## Documentation drift you will hit

- `INDEX.md`'s "WHERE CANON LIVES NOW" table is correct for the build; the per-section split lower down
  is superseded.
- `docs/wiki/` describes `index.html`/`swordforgeV2.html`, including a `Tutorial Flow` page about a
  `tutorialFlow` array the landscape build does not have. Its search script needs Python, which is not
  installed here. The 10 audit orphans are these pages.
- **`specs/game-design.md`** is named the mechanics SSOT by CLAUDE.md, but its header still names the
  portrait build canon. In practice mechanics are recorded in the dated round spec
  (`specs/2026-08-18-...md`) and the tutorial script SSOT (`specs/2026-09-15-...md`). Keep doing that
  until someone reconciles the header, and say so in the commit.
- `specs/README.md` and `README.md` still name older builds in their bodies, under dated banners.
- `plan.md`'s "Next up" is V1/V2 scope.
