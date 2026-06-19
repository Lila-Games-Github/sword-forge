# specs/

Single source of truth (SSOT) for Sword Forge's design.

## Policy

- These specs describe the game **as implemented** in `index.html`, not aspirational design.
- Any change to a mechanic, number, or system must update the relevant spec in the **same change** as the code.
- When code and a spec disagree, that's a bug — reconcile them, don't ignore it.
- The original design vision is preserved in `../archive/Sword_Grid_Game_GDD.md` for history only. Specs here supersede it.

## Files

- **`game-design.md`** — master design doc: core loop, grid/movement, traits, heating, forging, economy, UI. Start here.

Add focused spec files here as systems grow complex enough to warrant their own doc (e.g. `economy-balance.md`, `trait-catalog.md`, `art-assets.md`). Link them from `game-design.md` and list them above.
