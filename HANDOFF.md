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
- **Branch:** `tutorial-polish`. Level with `main` **in game code** (the HTML is byte-identical) but
  **not in the git graph**: `main` carries the two merge commits, and this branch carries the docs
  commit that PR #18 is for. `git pull` on it is a no-op and will NOT bring you up to date.
- **Start a new round like this**, not by committing to `tutorial-polish`:
  ```bash
  git checkout main && git pull
  git checkout -b sword-forge/<2-5-kebab-keywords>
  ```
  `tutorial-polish` predates the `<project-slug>/<keywords>` convention the other branches follow
  (`sword-forge/mobile-compat`, `sword-forge/tutorial-script-and-craft-systems`). Name new ones that way.
- **Do not commit directly to `main`** — every push there publishes the site.
- **While PR #18 is open, `main`’s copies of this file and of `CLAUDE.md` are badly stale.** Main’s
  HANDOFF still says the build has **43 dialogue keys ending at D43** — it has **144, ending at D139**
  — and main’s `CLAUDE.md` still gives the preview port as 5678 in one section. Read the docs from
  this branch until #18 lands: `git show tutorial-polish:HANDOFF.md`. **Seeing 144 keys is not a bug.**

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

**Ordering.** #1 is blocked on an owner answer — ask, then park it. **#2 and #3 are the ones a fresh
agent can ship unblocked**, and #2 matters because the build is public. #4 and #5 are backlog.
There is no written definition of "polished" for the tutorial: the owner drives it beat by beat from
play-testing, so expect the next session's work to arrive as fresh reports rather than from this list.

1. **The gale/Epic alignment bug — the owner parked this deliberately and it is the top item.**
   "gale" here is the **trait** (`TRAIT_POS.gale`), not the gale *ore* — they share a name, and the ore
   is irrelevant to this.
   The dragon-pull already stops at the **closest approach**: `tick()`'s `fireOnAnvil` branch clamps the
   step to `t = (trait − sword) · û`, the projection onto the unit vector toward `START`. That is the
   nearest the sword can ever get on that path, so "stop as soon as Epic is available" cannot be done by
   changing *when* it stops — stopping sooner only lands further away.
   **Re-measure it before acting** (one paste in the console on the forge screen, no fixture needed):
   ```js
   resetRun(); ORE_COUNT.copper=9; buildShelf();
   for(let i=0;i<3;i++){ startPrep('copper'); prep.grind=1; addOreDirect('copper'); }
   sword={seg:segs.length-1, frac:segs[segs.length-1].tPct};
   const p=swordPoint(), g=traits.find(t=>t.trait&&t.trait.id==='gale');
   const dx=START.x-p.x, dy=START.y-p.y, d=Math.hypot(dx,dy), ux=dx/d, uy=dy/d;
   const t=(g.x-p.x)*ux+(g.y-p.y)*uy;
   Math.hypot(g.x-(p.x+ux*t), g.y-(p.y+uy*t));   // 27.1 on 2026-09-23
   ```
   **27.1** against `ALIGN_EPIC 9` / `ALIGN_FINE 20` is **Weak** — Epic is unreachable by pulling.
   Four levers: move the gale trait, re-cut the copper route, widen `ALIGN_EPIC`, or let the pull steer
   instead of running straight at spawn. **This needs the owner's answer before any code changes** — it
   is a tuning decision. *If pressed for a default:* re-cutting the copper route is the least invasive,
   because `ALIGN_EPIC` is global (it would make every trait easier) and moving a trait rearranges the
   hazard field around it — which is exactly what bit r111 when Fire moved.
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

- **The verify commands are bash** (Git Bash is present). On PowerShell use
  `.claude/hooks/verify-living-docs.ps1`, which sits beside the `.sh` for exactly this reason.
- **Two of the repo's three test suites cannot run here.** `tooling/anchor-match` needs Python, which
  is not installed, and so does the `docs/wiki/` search script. `tooling/mobile-fit/fit.test.mjs` is
  the one that runs.
- **GitHub Issues is empty**, although `CLAUDE.md` routes work through it. Every open item lives as
  prose in this file. If the backlog grows past the "Next steps" list, file issues rather than
  lengthening it.

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
