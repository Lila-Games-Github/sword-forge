# LEARNINGS

Lessons from building Sword Forge.

- **Browser screenshot tools time out on this game** — the continuous ember/`requestAnimationFrame` loop keeps the page from going idle. Verify via the preview tools (`javascript_tool`, `read_console_messages`) instead; resize to mobile (375px) before measuring layout or the headless viewport reports width 0.
- **The preview static server drops between turns** — a `navigate` fails or the tab reverts to `file://`; restart with `preview_start` and re-`navigate` (same port, 5678).
- **Data-driven tutorial (`tutorialFlow` array) beats scattered flags** — dialogue steps, actions, and `waitAction` gates in one array; gameplay functions advance it by checking the current step's `waitAction`.
- **An SSOT must track the *live direction*, not a superseded build** — `specs/game-design.md` documented the V1 grid game long after the design pivoted to Path-Forge, so reviews were checked against the wrong game. Fixed 2026-08-12 by making the loop-test canon for the craft loop. Lesson: when the design pivots, reconcile the SSOT *in the same push* as the new build lands, or the spec silently rots.
- **Reconcile the SSOT with a dated decision record, not a silent in-place edit** — the loop-test-canon switch was an in-place edit of `game-design.md`; the *why/when* survives only in a commit message. A dated decision doc was even started (`2026-08-10-core-loop-potioncraft-mapping.md`) but stranded in a worktree. RuneSurge's append-only `docs/superpowers/specs/` decision log is the pattern to copy: new decision = new immutable dated doc, GDD/spec = synthesis that cites them.
- **Competitor FTUE teardown workflow (game-research + video-analysis)** — scope to the tutorial window, pull a no-commentary walkthrough (frames carry it, cadence 1 frame/2s) + a narrated guide (commentary carries intent), source-tag every claim, keep text deliverables in-repo and gitignore the heavy raw video/frames with a MANIFEST for re-fetch.
