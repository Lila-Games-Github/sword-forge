# Sword Forge — Project Plan

A 2D grid-based blacksmith crafting game. Single-file build (`index.html`), auto-deployed to GitHub Pages on every push to `main`.

> Design SSOT is `specs/game-design.md`. The original GDD in `archive/` is historical only.

---

## ✅ Done

### Core gameplay
- [x] 50×50 grid, fog of war, seeded layout (seed `1337`); 8-direction movement with 8 metals
- [x] **Purify-dash slider** — hold a direction to charge; release in the red/yellow/green zone = 1/2/3-block dash (1 metal regardless of distance); live green `tile_move.png` path preview; cancel via centre button / slide-off / right-click
- [x] Hazards (~20% of map), health (−20 on **landing**; crossing over a hazard mid-dash is safe), death shatters the active blade
- [x] 24 traits hidden on the map; value scales with distance from centre; one fuse per trait per blade
- [x] **Heating minigame** — pulley → bellows → stabilize; glow + hand cues guide pulley-then-bellows
- [x] **Bellow tap *and* hold** — a tap adds +16; holding raises heat gradually (~+22/sec net)
- [x] **Per-trait heating variants** — every trait has a unique minigame via the `heatConfigs` table (band position/width, decay, stabilize, pump, hold, overheat; plus dynamic bands: oscillate/gust/jitter/multi-band/jump/stages/hidden). Tutorial heats stay on the default band. Fully reversible (delete a config → default).
- [x] **Heat timer → quality** — a per-trait countdown (`heatTimers`; ⏱ readout in the heat modal, safe 45s in the tutorial). Stabilize in time → `Epic`; timer runs out → the trait still fuses at `Fine`. Quality tiers **Weak +0 / Fine +10 / Epic +20** value bonus.
- [x] **Blade HP → quality** — at forge, low HP caps quality (≥80 Epic, 40–79 Fine, <40 Weak; `min(heat outcome, HP cap)`).
- [x] **Quality overlays** — forge result layers a **crack** overlay on Weak swords and **sparkling stars** on Epic (`assets/sword-parts/overlays/`).
- [x] **"New Trait Discovered!" box** on the first heat of each trait (icon + name), including during the tutorial
- [x] **Multi-step forge pipeline** — **shape select** (10 shapes, 3 free + 7 unlockable at 50g) → **hammering mini-game** (shrinking-ring targets over ingot→mid→final art in `assets/hammer/`; 6 targets/2 stages; misses cost quality) → **quench** (feel-only cooling beat: tap to dip the blade in water, 3s soak, steam/glow; `assets/forge/water_bucket.png` on `assets/backgrounds/forge_bg.png`; **skipped when the last-acquired trait is `flame`**) → **Design Desk** (fittings only; blade fixed from step 1, Blade tab removed). Manual forge + Auto-Craft both run it (Auto-Craft prepends a detached heat mini-game).
- [x] **Hammer → quality** — −1 quality tier per 2 misses, applied after heat + HP cap (`heat → HP cap → hammer penalty`); Design Desk preview shows the final projected quality
- [x] **Design Desk** — grip/guard/pommel art; trait-specific part art (Flame/Ice/Water skins) via `traitSkins`; info-hint button
- [x] **Forge** — 10 shapes; forge-result reveal; resets player to centre

### Economy & progression
- [x] Smelter (passive metal gen, 50g upgrades); NPC customers (trait/shape requests, reputation multipliers)
- [x] Scripted customers #1 (any) → #2 (Flame) → #3 (ice-dragon, "weak to heat" = Flame); random from #4
- [x] **Refuse disabled for the first three (scripted) customers**
- [x] **Search Inventory** shortcut (finds + highlights the matching sword). *(The old one-tap "Craft & Sell" button was removed — craft from a recorded composition's Auto-Craft instead.)*
- [x] Passive shopfront (500g unlock; "Shop Available!" tip at 500g → hand-guides the player to the Shop screen then the Unlock Shop button; after unlocking, a "stock the shop" guide walks them through Auto-Crafting a flame sword, sending it To Shop, then explains the shop with two boxes); map reset (retains gold/metals/rep/vault/compositions/upgrades)

### Recorded Compositions (formerly "Saved Recipes" / "Blueprints")
- [x] **Record Composition** button (was "Record Mixture"); **Record Last Composition** records the last forged sword after forging (no active blade needed)
- [x] **Duplicate guard** — recording an identical composition (same traits + metals) is blocked with an alert
- [x] Compact **5-per-row tile grid** (trait icon only); tap a tile → details (Tier/Traits/Value/**Composition**) + **Auto-Craft** + **Delete** (delete hidden during the tutorial)

### Tutorial (data-driven `tutorialFlow`)
- [x] Full guided flow, incl. a 3rd (ice-dragon) customer teaching Auto-Craft from a recorded composition
- [x] Guided hand pointers (👆/👇/👈/👉), auto-clearing on the action
- [x] **First-craft metal lock** — start with 4 steel + 1 magnesium; other metals, Record Composition, Chart, auto-gen locked until first forge
- [x] **Forge greyed out** from the Flame heat until the composition is recorded (guided step)
- [x] **Flame-reveal top banner** ("add some iron to go down to it") until the player reaches it
- [x] **Illustrated slider lesson** — two art frames (`dialogue-frame9/10.png`): tap-vs-hold, then avoid-impure-tiles
- [x] **Skip Tutorial button** (window bottom-right) — ends the flow and unlocks everything

### UI
- [x] **Minimap (Chart)** — live canvas, full reveal, trait emoji icons, **player shown with the grid sword icon** (`tile_sword.png`) + blue glow, zoom + pan, tap-a-trait name label (readable, scaled to display); tutorial pointer alternating "Your location" / "Flame trait"
- [x] **Grid viewport** — drag-to-pan (fixed edge-lock bug), **mouse-wheel zoom centred on the cursor**, **📷 free-camera toggle** (stop following the sword)
- [x] **Grid tiles** — `tile_centre` (spawn) + `tile_centre2` (8 around spawn) home tiles; `tile_path` trail of cells the active sword lands on (dashes mark only the endpoint; never overwrites hazard/trait/home; resets with the active blade on forge/death)
- [x] **Metal-toss juice** — spending a metal flings `Metal.png` from the pressed button into the bucket in an arc, wobbling the bucket on landing (`tossMetalToBucket`; on actual spend only)
- [x] **UI polish** — heat ⏱ timer moved to right below the heat slider; chart tutorial pointer is now a text label + pulsing glow (hand removed, amber glow on the Flame target); all metal-button counts white; all cancel/refuse/close buttons grey (was red/blue)
- [x] **Blade Traits status bar** — the forge status row shows the heated traits (removed the "100/100" health text; bar still shows HP)
- [x] **Styled `gameAlert` popups** — all warnings/errors use a parchment popup (no native `alert()`)
- [x] **Counter (screen 1)** — gold/rep pill; rotating customer portraits sliding in from the left; speech bubble; expandable Inventory + Recorded Compositions
- [x] **Word-by-word customer dialogue + response options** — the customer's request types out one word at a time (tap the bubble to skip); once the line finishes, the player's two responses fade in: **"I have something for you."** (Search Inventory) and **"I don't have what you need."** (Refuse, still disabled for the first three scripted customers). Tutorial boxes tied to a customer are gated to appear only after that customer's line fully types + a ~2s read pause, so they never overlap the speech
- [x] **Post-sale customer feedback + response gate** — on a sale the customer reacts with a short line before the gold (e.g. "Oh! Hot! Here's your 25 gold."), chosen by the trait the customer asked for → sword's first trait → random generic (per-trait line for all 24 traits plus 5 generic lines). The customer then **stays at the counter until the player taps a response button** ("Thank you" / "Glad you liked it" / "Take care"), which brings the next customer. Refuse still auto-advances
- [x] Heat/Forge glow cues; grammar pass; 3-screen swipe layout; GitHub Pages auto-deploy CI
- [x] **+100 Metals** and **+100 Gold** cheat buttons (window bottom-right, whole session); **Skip Intro** button (bottom-right, during the intro → `launchCoreGame`)

---

## 🔜 Next up

- [ ] **Save / load** game state across sessions (localStorage) — nothing persists on reload today (biggest gap)
- [ ] **More customer art / variety** — named customers, archetypes, more dialogue; only 3 portraits so far
- [ ] **Audio** — anvil hits, trait-discovery ding, shop-sale chime
- [ ] **Balance pass on per-trait heating** — `heatConfigs` band difficulty is first-pass (Dark hidden, Cursed jumps, Lightning two-strike likeliest to need softening); `heatTimers` were recently halved — play-test the timer + quality feel
- [ ] **Hammer mini-game art polish** — only Shortsword/Longsword/Broadsword have mid-forge art; the other 7 shapes reuse the Longsword mid as a placeholder. Add per-shape mid art (and optionally top-down final art) when ready. Target positions in `HAMMER_POINTS` are approximate — tune to the real art.
- [ ] Clean up **committed-but-unreferenced** files (all safe to delete): `assets/unused/` folder, `assets/ui/Chart_background.png` (grep count 0), and `assets/sword-parts/pommels/sparkle.png` (stray duplicate — the real overlay is `overlays/sparkle.png`)

## ⚠️ Known / decisions to make
- [ ] **`+100 Metals`, `+100 Gold`, and `Skip Intro` are visible to players** on the live site — gate them (key combo / `?cheats` URL flag) before a "real" release, or remove the cheats
- [x] ~~Heat **quality** is hardcoded **Epic-only**~~ — **done:** Weak/Fine/Epic driven by the heat timer + blade-HP cap, with crack/sparkle overlays
- [ ] Map seed fixed (`1337`) — should reset randomize the layout?
- [ ] Original GDD's **Dagger** shape is absent (10 shapes vs 11)

## Open questions
- Target platform — web-only, or a mobile wrapper later?
