# Path-Forge Cluster Infusion — Integration Plan

**Status:** PLANNED (not started) · **Date:** 2026-08-13 · **Branch:** `sword-forge/pathforge-cluster-infusion`
**Owner:** Biswajeet · **Grounded in:** owner decision 2026-08-13 (build target) + the Codex doc/SSOT review (this session).

> This is the execution plan for grafting the Path-Forge loop-test into the main game. Execute **later** — it is gated on prerequisite experiments (see §Dependencies). Do not start Phase 1+ until those land on main.

---

## 1. Goal

Splice `Swordforge_new_looptest.html` (the Path-Forge ore-path map + forge minigames) into the main game as the **middle "explore + forge" cluster**, Potion-Craft-style — replacing the current 50×50 grid movement + per-trait heating minigame + the front of the forge pipeline. Everything **before** the cluster (intro/story/tutorial shell) and **after** it (counter/sell/haggle-free/day cycle) is preserved.

### Non-goals
- Not rebuilding the economy, day system, quests, shop, or story.
- Not shipping a new art pass.
- Not keeping the V1 grid movement or the per-trait heating minigame (both are replaced).

## 2. Decided target (the WHY)

The design pivoted to Path-Forge (GDD v0.3; loop-test built 2026-08-12; specs made loop-test-canon in `16746d9`). The loop-test is a faithful Potion-Craft-style craft loop (ore = path, grind = extend, alignment = quality, water-quench = acquire). It only lacks wiring to the economy. The owner's decision (2026-08-13): **infuse the loop-test as the map+forge cluster; keep the existing tutorial→…→sell spine.**

## 3. Architecture

```
[ Intro + Tutorial shell ]  ->  [ PATH-FORGE CLUSTER ]  ->  [ Counter: sell + Day cycle ]
   swordforgeV2 (KEEP)            looptest (INFUSE)          swordforgeV2 (KEEP)
```

**The cluster** = the whole Forge screen: ore tray → mortar (grind) → furnace (smelt + bellows) → anvil (hammer-travel along the ore-path map) → dragon (fire = pull to fine-tune alignment) → water mug (quench = acquire trait at its alignment tier) → shape select → hammer minigame → forged sword. Traits stack; re-heat to travel further.

**It replaces** in V2: the 50×50 grid Purify movement (§3 of the current spec), the per-trait heating minigame (§4), and the shape/hammer front of the forge pipeline (§5).

### Base file
**Base = `swordforgeV2.html`** — keep the mature shell + tutorial + economy, graft the cluster in. `index.html` (V1) → **frozen legacy**; the infused V2 becomes the new deploy target. (Rejected alternative: base = looptest + port the economy — the economy/tutorial is the larger, more fragile half.)
Single-file constraint holds: the cluster's CSS/JS/DOM merges into `swordforgeV2.html`. No build step.

## 4. The two splice points

- **ENTRY (tutorial → cluster):** the shell/story stays; the tutorial's *mechanic-teaching* steps are rewritten to teach the cluster verbs (add ore → grind → smelt → hammer-travel → dragon-align → water-quench → shape → hammer). "Tut stays the same" = scaffolding stays, lesson content changes.
- **EXIT (cluster → sell) — the keystone:** the forged blade must become a V2 Vault/sale object. The loop-test today produces `{shape, traits[], tier}` wired to nothing (specs §9). This seam is the highest-risk work.

## 5. Seams & decisions

Each is a decision to lock (record in a decision doc at execution). Recommendation given; mark DECIDED when locked.

| # | Seam | Recommendation | Status |
|---|------|----------------|--------|
| S1 | **Sword output schema** (cluster→sell) | `value = Σ trait-distance-value + tier bonus (Epic +20 / Fine +10 / Weak +0)`. Wire forged blade → Vault → sale. Drop HP-cap/sharpen from value. | OPEN |
| S2 | **Resource set** (ore↔metal) | Smelter generates the **8 ores** `{copper,iron,gold,aluminium,ember,frost,tide,gale}`; retire movement-metals `{steel,iron,magnesium,bronze,…}`. Ores are the cluster's currency. | OPEN |
| S3 | **Traits** | 24 traits carry over 1:1 (8 signature on ore-paths + 16 scattered). Drop V2 per-trait heating minigames (`heatConfigs`). | OPEN (low risk) |
| S4 | **Quality source** | Alignment tier only (Epic/Fine/Weak). Drop the heat-timer→HP→hammer→sharpen quality chain. Keep the finish-hammer minigame as a small gold bonus (per hit). | OPEN |
| S5 | **Screen layout** | The loop-test's single 9:16 becomes V2's **Forge screen** (screen 2 of 3); keep swipe-nav to Counter/Shop. | OPEN |
| S6 | **Hazard stakes** | Adopt blade-HP + shatter on the map (loop-test hazards are decorative today). Gives the cluster stakes; echoes V2's impurity-gold penalty. | OPEN |
| S7 | **Design/Sharpen tail** | Decide keep-as-cosmetic-post-cluster or drop. Rec: drop for the first infused build (they were V1 cosmetic; re-add later if wanted). | OPEN |

## 6. Build sequence

- **Phase 0 — docs reconciliation (unblocked now by the target decision).** Prereq clean-up before any code:
  - Seed `DECISIONS.md` (append-only) with the infusion target + land the stranded `specs/2026-08-10-core-loop-potioncraft-mapping.md` from the `core-loop-mapping` worktree.
  - Fix `CLAUDE.md:11` — the build target (currently says V2 is "THE game, always edit this"; must name the infused build as the target and mark index.html V1 legacy).
  - Reconcile `specs/game-design.md` §1 (still describes the 50×50 grid) and §5 tail (V1 Sword-value + Quality-overlay remnants inside the loop-test-canon section) to the target.
  - Repair or archive `docs/wiki/` (broken `wiki.config.json`: `canon_index` → nonexistent `docs/INDEX.md`, empty `canon_ssot`, pages pinned pre-pivot).
- **Phase 1 — schema seam (keystone).** Define the forged-sword object; wire cluster output → Vault → sale. First home for a minimal headless assertion harness (tier thresholds, route stacking, value formula).
- **Phase 2 — resource unify.** Smelter → ores (S2).
- **Phase 3 — transplant.** Move the loop-test cluster into `swordforgeV2.html` as the Forge screen; delete V2 grid/heating/old-forge-front. Preserve swipe-nav + HUD.
- **Phase 4 — tutorial re-teach.** Rewrite `tutorialFlow` craft steps for the cluster; keep intro/story/sell steps.
- **Phase 5 — hazard + quality wiring + polish** (S4, S6).
- **Phase 6 — verify end-to-end.** Tutorial → craft (cluster) → sell → day rollover, via the preview tools (per CLAUDE.md verification notes; screenshots time out on this game).

## 7. Verification strategy

- Per-phase: preview-tool checks (`javascript_tool`, `read_console_messages`, mobile 375px) — screenshots time out (ember rAF loop).
- Phase 1 keystone: add a tiny headless assertion block for the value/tier/route math (test the live formula, not copied constants — per the Codex review; RS-style oracle/fuzz is premature here).
- Spec sync: any mechanic change updates `specs/game-design.md` in the same commit (existing policy).

## 8. Dependencies / sequencing (owner-stated)

The owner is running **further experiments on separate worktrees**; those **land on main first**, then the cluster is grafted. So:
- Do **not** start Phase 1+ until the pending experiments are merged to main and this branch is rebased on them.
- Phase 0 (docs) can proceed independently — it clears the SSOT contradictions and is not affected by the experiments.

## 9. Risks

- **Schema seam (S1)** is the make-or-break; the loop-test was never wired to value/Vault. Budget the most time here.
- **Single-file merge friction:** grafting the cluster's globals/DOM into V2 risks id/CSS collisions and global-state clashes — reconcile namespaces early.
- **Tutorial rewrite (S7/Phase 4)** touches the data-driven `tutorialFlow`; easy to break gate ordering.
- **Resource swap (S2)** ripples into smelter, day-restock, and starter-stock logic — audit all `availableMetals` touchpoints.

## 10. References

- Build: `Swordforge_new_looptest.html` (cluster source). Shell/economy: `swordforgeV2.html`.
- SSOT: `specs/game-design.md` (§3–§5 loop-test-canon; §6–§8 economy; §9 open seams).
- Design: `research/sword-forge-gdd.html` (v0.3, Path-Forge). FTUE: `research/swordforge-ftue-flow.md`.
- Stranded decision doc to land: `specs/2026-08-10-core-loop-potioncraft-mapping.md` (in the `core-loop-mapping` worktree).
- Session doc/SSOT review + Codex findings: see this session's LEARNINGS additions.
