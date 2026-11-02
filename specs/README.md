# specs/

Single source of truth (SSOT) for Sword Forge's design.

## Policy

- These specs describe the game **as implemented**, not aspirational design. The game is `Swordforge_looptest_landscape.html`;
  its records are **dated** (`YYYY-MM-DD-topic.md`), and `../INDEX.md` marks each one canon or superseded. Where a dated
  record and `game-design.md` disagree, the dated record wins (`game-design.md` §6-§8 still describe an older build).
- Any change to a mechanic, number, or system must update the relevant spec in the **same change** as the code.
- When code and a spec disagree, that's a bug — reconcile them, don't ignore it.
- The original design vision is preserved in `../archive/Sword_Grid_Game_GDD.md` for history only. Specs here supersede it.

## Files

- **`game-design.md`** - overview: §2-§5 the current crafting loop (updated 2026-10-23); §6-§8 an older build.
- **The crafting loop:** `2026-10-21-smelter-version-loop.md` (the bellows, the gate, the ladle, the anvil, the bucket; values
  and tests). **The tutorial:** `2026-10-07-ftue-v3-rework.md` (the FTUE in six parts), `2026-10-23-ftue-smelter-rework-plan.md`
  (its rework to the loop), `2026-09-15-looptest-landscape-tutorial-script.md` (every line in play order).
- **Systems:** `2026-10-01-hammer-hit-points.md` (the minigame), `2026-10-01-hazard-integrity.md` (hazards),
  `2026-10-06-skill-tree-trade-ore.md` (skills), `2026-10-06-map-trait-links.md` (the map's trait card), and the rest in `../INDEX.md`.

Add focused spec files here as systems grow complex enough to warrant their own doc (e.g. `economy-balance.md`, `trait-catalog.md`, `art-assets.md`). Link them from `game-design.md` and list them above.
