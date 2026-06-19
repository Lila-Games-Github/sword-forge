# Sword Forge — Project Plan

A 2D grid-based blacksmith crafting game. Single-file build (`index.html`), auto-deployed to GitHub Pages on every push to `main`.

---

## ✅ Done

### Core gameplay (per GDD)
- [x] 50×50 grid with fog of war, seeded random layout
- [x] 8-direction movement with 8 metal types (expanded from GDD's 4: steel, iron, silver, gold → titanium, steel, aluminium, magnesium, bronze, blackIron, iron, redIron)
- [x] **Purify mini-game** — hold-to-charge slider, Red/Yellow/Green zones = 1/2/3 block dash
- [x] Hazards on 20% of map, health system (-20 HP per hit), death shatters blade + resets to center
- [x] **24 traits** hidden on map, value scales with distance from center
- [x] **Heating mini-game** — interactive bucket / pulley / bellow UI, quality tiers (Weak/Fine/Epic)
- [x] **Design desk** — blade / grip / guard / pommel visual customization
- [x] **Forge** — 11 weapon shapes, forge-result modal, resets player on completion
- [x] Trait-can-only-apply-once-per-blade limitation

### Economy & progression
- [x] **Smelter** — passive metal generation, infinite upgrades (50g each, +1 metal/sec)
- [x] **NPC customers** — trait requests, 10% chance of shape request, reputation multipliers (±20%), refuse = -1 rep
- [x] **Auto Sell** + **Craft & Sell** one-tap shortcuts
- [x] **Passive shopfront** (50g unlock) — 5% sell chance per sword every 10s, green gold-flash on sale
- [x] **Blueprints** — save trait+metal recipe, one-click Auto-Craft when metals available
- [x] **Map reset** — clears grid/fog/position, retains gold/metals/rep/inventory/blueprints/upgrades

### UI / onboarding
- [x] 4-scene animated intro sequence with embers
- [x] Multi-step tutorial (first move, heat, forge) + contextual tips (shop unlock at 50g, blueprint tip at 5th sword)
- [x] 3-screen swipe layout (Shop / Customers / Forge)
- [x] Static minimap reference (chart modal)
- [x] GitHub Pages auto-deploy CI

### Uncommitted (working tree)
- [ ] Button label "Save" → "Save Recipe" (`index.html:580`)
- [ ] Tutorial step 2 no longer force-expands metals panel (`index.html:862`)
- [ ] **Action:** commit these two tweaks

---

## 🔜 Next up

### Polish / enhancements (not in GDD)
- [ ] **Save / load game state** — persist gold, inventory, smelter upgrades, blueprints across sessions (localStorage)
- [ ] **Dynamic minimap** — render from live fog-of-war state instead of static `Minimap.png`
- [ ] **NPC variety** — named customers, more dialogue lines, customer archetypes
- [ ] **Audio** — anvil hits, trait-discovery ding, shop sale chime

### Quality / housekeeping
- [x] Remove stale `Sword_forge v0.2.html` — `index.html` is canon
- [x] Add `CLAUDE.md` (repo guidance) and `specs/` SSOT (`specs/game-design.md`, `specs/README.md`)
- [ ] Clean up unused image assets (multiple `image_*.png`, duplicate `.jpg`/`.png` pairs)
- [ ] Test full game loop end-to-end in browser before next push

### Reconcile spec vs build (from specs/game-design.md §9)
- [ ] Heat quality is hardcoded **Epic-only** — restore Weak/Fine/Epic tiers or keep?
- [ ] Map seed is fixed (`1337`) — should reset randomize the layout?
- [ ] Dagger shape from original GDD is absent (10 shapes vs 11)

---

## Open questions
- Target platform — staying web-only, or planning a mobile wrapper later?

> Design SSOT is now `specs/game-design.md`. The original `Docs/` GDD is historical.
