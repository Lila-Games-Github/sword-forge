# Sword Forge — Project Plan

A 2D grid-based blacksmith crafting game. Single-file build (`index.html`), auto-deployed to GitHub Pages on every push to `main`.

> Design SSOT is `specs/game-design.md`. The original GDD in `archive/` is historical only.

---

## ✅ Done

### Core gameplay
- [x] 50×50 grid, fog of war, seeded layout (seed `1337`); 8-direction movement with 8 metals
- [x] **Purify-dash slider** — hold a direction to charge; release in the red/yellow/green zone = 1/2/3-block dash (1 metal regardless of distance)
- [x] **Live dash path preview** — green `tile_move.png` highlights the 1–3 cells you'd move into, in sync with the slider; clamped at the map edge
- [x] **Cancel a held move** — drag onto the centre cancel button, slide a finger over it, or right-click (no metal spent)
- [x] Hazards (~20% of map), health (−20/hit), death shatters the active blade
- [x] 24 traits hidden on the map; value scales with distance from centre; one fuse per trait per blade
- [x] **Heating minigame** — pulley → bellows → stabilize in the green zone; glow + hand cues guide pulley-then-bellows
- [x] **Design Desk** — blade/grip/guard/pommel art; **trait-specific part art** (Flame skin) via `traitSkins`; **7 unlockable balanced blade shapes** (50g each); info-hint button
- [x] **Forge** — 10 shapes; forge-result reveal; resets player to centre

### Economy & progression
- [x] Smelter (passive metal gen, 50g upgrades); NPC customers (trait/shape requests, reputation multipliers)
- [x] **Search Inventory** (finds + highlights the matching sword) and **Craft & Sell** shortcuts
- [x] Passive shopfront (50g unlock); Blueprints ("Record Mixture") + Auto-Craft; map reset (retains gold/metals/rep/vault/blueprints/upgrades)
- [x] **Trait-acquired toast**; mixture-recorded toast (replaced native alerts)

### Tutorial (data-driven `tutorialFlow`)
- [x] Full guided flow: intro → select metals → reach trait → heat → forge → counter → sell → 2nd (Flame) customer → back to forge → chart → learn slider → reach Flame → heat → record mixture → forge → sell
- [x] **Guided hand pointers** (👆/👇/👈/👉) at each step, auto-clearing on the action
- [x] **First-craft metal lock** — start with exactly 4 steel + 1 magnesium; other metals, Record Mixture, Chart, and auto-generation locked until the first sword is forged
- [x] Dialogue-frame art + OK button (centered, black, shrink-on-click)

### UI
- [x] **Minimap (Chart)** — live canvas, full reveal (no fog), trait emoji icons, pulsing player marker, **zoom + pan**, tap a trait for its name (replaced static `Minimap.png`)
- [x] **Counter (screen 1) redesign** — slim gold/rep pill; customer **portrait images** that **slide in from the left**, rotating `man2`(first) → `man1` → `woman1`; speech bubble with tail; Search Inventory / Craft & Sell / Refuse stacked beside it; expandable Inventory + Saved Recipes pushed to the bottom; `Screen1bg.png`
- [x] Heat/Forge button glow cues; Forge disabled until a trait is heated
- [x] Grammar pass across all player-facing copy
- [x] 3-screen swipe layout; GitHub Pages auto-deploy CI

---

## 🔜 Next up

- [ ] **Save / load** game state across sessions (localStorage) — nothing persists on reload today
- [ ] **More customer art / variety** — named customers, archetypes, more dialogue; only 3 portraits so far
- [ ] **Audio** — anvil hits, trait-discovery ding, shop-sale chime
- [ ] Clean up `assets/unused/` (7 unreferenced files); remove empty top-level `Docs/`

### Reconcile spec ↔ build (`specs/game-design.md §9`)
- [ ] Heat quality is hardcoded **Epic-only** — restore Weak/Fine/Epic tiers, or keep?
- [ ] Map seed fixed (`1337`) — should reset randomize?
- [ ] Original GDD's **Dagger** shape is absent (10 shapes vs 11)

## Open questions
- Target platform — web-only, or a mobile wrapper later?
