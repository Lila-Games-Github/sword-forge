# INDEX

Chronological catalog of every doc in this repo. `canon` = current source of truth;
`superseded`/`deprecated` marked when it happens.

## WHERE CANON LIVES NOW

| Topic | Canonical doc |
|-------|---------------|
| What this repo is | [README.md](README.md) |
| Repo rules / conventions | [CLAUDE.md](CLAUDE.md) |
| Game design / mechanics SSOT | [specs/game-design.md](specs/game-design.md) |
| **Which build is canon** (split — read specs §2–§5 header) | craft/movement loop → [Swordforge_new_looptest.html](Swordforge_new_looptest.html) (Path-Forge canon); economy/UI/onboarding → [index.html](index.html); [swordforgeV2.html](swordforgeV2.html) = fuller-tutorial reference. Integration open (specs §9). |
| Zero-context handoff / onboarding | [ONBOARDING.md](ONBOARDING.md) |
| Task tracker (done / next up) | [plan.md](plan.md) |
| Lessons learned | [LEARNINGS.md](LEARNINGS.md) |
| Session-to-session state | [HANDOFF.md](HANDOFF.md) |
| Code navigation (wiki, subordinate to specs) | [docs/wiki/index.md](docs/wiki/index.md) |
| Agent workflow config (issues/labels/domain) | [docs/agents/](docs/agents/) |

## Timeline

- **(pre-2026-08-10)** — [archive/Sword_Grid_Game_GDD.md](archive/Sword_Grid_Game_GDD.md) — original design vision. `superseded` — superseded-by `specs/game-design.md`.
- **(pre-2026-08-10)** — [specs/game-design.md](specs/game-design.md) — mechanics SSOT, kept in sync with the code. `canon` — supersedes the archive GDD. **Updated 2026-08-12 (16746d9):** now a two-build split — §2 steps 2–4 + §3–§5 are canon per the loop-test (Path-Forge craft loop); §6–§8 still reflect index.html. Integration open (§9).
- **(pre-2026-08-10)** — [ONBOARDING.md](ONBOARDING.md) — zero-context contributor/agent handoff (describes V1 systems; see its canon-update banner). `canon`
- **(pre-2026-08-10)** — [plan.md](plan.md) — running done/next-up tracker. `canon`
- **(pre-2026-08-10)** — [research/chalk-map-design.md](research/chalk-map-design.md) + [research/map_test.html](research/map_test.html) — chalk-map redesign exploration (not shipped). `canon` (research)
- **(pre-2026-08-10)** — [research/potioncraft.md](research/potioncraft.md) — PotionCraft reference notes. `canon` (research)
- **(pre-2026-08-10)** — [research/sword-forge-gdd.html](research/sword-forge-gdd.html) — Sword Forge GDD (research doc; now **v0.3**, Path-Forge redesign — see 2026-08-11 below). `canon` (research, forward-looking; specs/game-design.md is the built-state SSOT)
- **2026-08-10** — agent workflow config from setup-matt-pocock-skills: [docs/agents/issue-tracker.md](docs/agents/issue-tracker.md) (GitHub Issues via `gh`), [docs/agents/triage-labels.md](docs/agents/triage-labels.md) (five-role vocabulary), [docs/agents/domain.md](docs/agents/domain.md) (single-context CONTEXT.md + ADRs). `canon`
- **2026-08-10** — [AGENTS.md](AGENTS.md) — agent-file pointer to the code wiki (written by wiki adopt). `canon`
- **2026-08-10** — [docs/wiki/](docs/wiki/) — code-repo navigation wiki adopted (subordinate to the spec chain). `canon` (navigation layer)
- **2026-08-10** — V2 (`swordforgeV2.html`) declared the canonical build; `index.html` (V1) kept for historical reference and remains the deployed Pages entry point until promoted. Recorded in CLAUDE.md / README / ONBOARDING banners.
- **2026-08-10** — living-docs spine seeded by `start-session` (INDEX.md, LEARNINGS.md, HANDOFF.md, verifier hook, `.claude/settings.json`).
- **2026-08-11** — [research/sword-forge-gdd.html](research/sword-forge-gdd.html) bumped to **v0.2 → v0.3**: the **Path-Forge** core-loop redesign (PotionCraft-style ore-path navigation). `canon` (research, forward-looking design).
- **2026-08-11** — [story/bram-one-more-sunrise.html](story/bram-one-more-sunrise.html) — Bram story vignette. `canon` (narrative).
- **2026-08-12** — [Swordforge_new_looptest.html](Swordforge_new_looptest.html) — the **Path-Forge loop-test build** (standalone 9:16; ore→grind→smelt→hammer-travel→water-quench→shape). `canon` (build — craft loop only; not wired to economy/Vault, see specs §9).
- **2026-08-12** — **specs/game-design.md reconciled** (16746d9): the loop-test is now canon for the ore→sword craft/movement loop (§2 steps 2–4, §3–§5); economy/UI (§6–§8) stay index.html. *Done as an in-place edit — no dated decision doc (cf. the stranded `specs/2026-08-10-core-loop-potioncraft-mapping.md`, which lives only in the `core-loop-mapping` worktree, never landed).*
- **2026-08-13** — [research/Shop Titans Crafting Tycoon/](research/Shop%20Titans%20Crafting%20Tycoon/) — Shop Titans competitive teardown corpus (game-research skill). `canon` (research, block-indexed reference library).
- **2026-08-13** — [Potion Craft/](Potion%20Craft/) — Potion Craft FTUE teardown (video-analysis; text deliverables only, media gitignored — see `Potion Craft/MANIFEST.md`) + [research/swordforge-ftue-flow.md](research/swordforge-ftue-flow.md) — tri-color Path-Forge FTUE flow keyed to specs §refs, FigJam Mermaid. `canon` (research + design).
- **2026-08-13** — [specs/2026-08-13-looptest-phase1-vert-anchor-match.md](specs/2026-08-13-looptest-phase1-vert-anchor-match.md) — Phase 1 portrait match to the vert anchor: 2-col grid (HUD bar + vertical right ore rail zone) + diorama recomposed via LAYOUT + cozy CSS (structure pass), then AFK NB-Pro green-screen art gen (chroma-keyed, ≤$10). Records the Phase 1 portrait LAYOUT composition. `canon` (build spec, branch `sword-forge/dual-orientation-anchor-rework`).
- **2026-08-13** — [specs/2026-08-13-looptest-layout-skeleton.md](specs/2026-08-13-looptest-layout-skeleton.md) — Phase 0 layout-skeleton refactor of `Swordforge_new_looptest.html`: CSS-Grid named zones (hud/map/bench) + two `grid-template-areas` (portrait/landscape) + data-driven `LAYOUT` table (fractions of zone, both orientations) + `resolveLayout`/`applyLayout` + `?wire` wireframe + `?test` self-test (in-zone/parity/drift invariants). Records the portrait ground-truth positions. `canon` (build spec, branch `sword-forge/dual-orientation-anchor-rework`).
- **2026-08-14** — [Swordforge_looptest_landscape.html](Swordforge_looptest_landscape.html) — the **landscape (hori-anchor) loop-test build**: a separate 1080×600 file (copy of the portrait loop-test) flipped to the hori composition — left wood-plaque HUD column + Skill Tree top-right, full-width parchment map (anchor map cut → `assets/map/territory_hori.png`), 2-col wood ore rail, and the bench diorama laid out horizontally (dragon · anvil+hammer · furnace+cauldron · grinding wheel · bucket · mug). New anchor cuts: `assets/forge/anchor_grindwheel.png`, `assets/forge/anchor_cauldron.png`. `canon` (build — landscape look; portrait `Swordforge_new_looptest.html` untouched).
- **2026-08-14** — [specs/2026-08-14-looptest-phase2-landscape-hori-anchor.md](specs/2026-08-14-looptest-phase2-landscape-hori-anchor.md) — Phase 2 landscape match to the hori anchor: records the landscape `LAYOUT` composition (RECORDED, **loop r12**), the separate-file decision, and the two loop eras — (1) Opus-gated composition r2 58→r7 77, then (2) the **objective-gate era** (r8–r12) using `tooling/anchor-match/` (`screen_gate` palette + `element_size`), which drove the map over-saturation fix, anchor re-cuts of the **smelter** (seated pot, Opus 38→71→80), **grey-stone HUD plaque** 9-slice, **winged dragon**, and **bellows** (79 SHIP), plus owner-directed hero-sizing (furnace/anvil 1.5×, dragon/mug 2×), the map/bench seam fix, and `?clean` render mode. `canon` (build spec, branch `sword-forge/dual-orientation-anchor-rework`).
- **2026-08-14** — [specs/2026-08-14-looptest-station-minigame-feel.md](specs/2026-08-14-looptest-station-minigame-feel.md) — Phase B station-feel pass on `Swordforge_looptest_landscape.html`: wired the previously-dead grind wheel (`wireGrindWheel` + `#grindHot` hold-to-grind), added a shared `fxBurst` particle emitter, and per-station juice (grind sparks, bellows embers + heat-ramped furnace glow, anvil strike sparks + recoil, quench steam + flash, dragon fire embers). `canon` (feel spec, branch `sword-forge/looptest-minigame-feel`).
- **2026-08-14** — [tooling/anchor-match/README.md](tooling/anchor-match/README.md) — objective anchor-matching tooling + notes: what transfers from `mother-clucker`'s camera gate and `art-pipelines-RND/consistency-gate` (deterministic measure→gate + per-project spec + mandatory chroma-key), and two Sword-Forge gates — `prop_gate.py` (single-cut fidelity: silhouette IoU + luminance + colour MAE, magenta key) and `screen_gate.py` (region-localized composition diff: per-region palette histogram distance + coarse-luminance structure, with a review heatmap). PIL-only, TDD (14 tests). Baseline: landscape palette-match **75.1/100**, worst regions rail 0.55 / skilltree 0.35 / map 0.32. `canon` (tooling, branch `sword-forge/anchor-match-tooling`).
