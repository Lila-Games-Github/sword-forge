# Sword Forge — Game Design (SSOT)

**Single source of truth for game mechanics.** This describes the game *as actually implemented* in `index.html`. When code and this doc disagree, treat it as a bug in one of them and reconcile. Update this doc in the same change as any mechanic change.

> The original design vision is archived at `archive/Sword_Grid_Game_GDD.md`. The build has drifted from it; this spec reflects current reality, not original intent.

---

## 1. Overview

You play a blacksmith who explores a dark 50×50 grid to discover magical traits, forges custom weapons from those traits, and sells them to customers (actively) or through a passive shopfront.

## 2. Core loop

1. **Smelt** — passively generate metals over time.
2. **Explore** — spend metals to move/dash across a fog-of-war grid (Purify mini-game).
3. **Heat** — find hidden traits and play the Heating mini-game to fuse them onto your active blade.
4. **Forge** — pick a weapon shape, customize its look, and complete the sword into your Vault.
5. **Sell** — fulfill NPC requests for Gold + Reputation, or list swords in the passive Shop.
6. **Reinvest** — upgrade the Smelter, unlock metals, unlock the Shop, save Blueprints, or reset the map.

## 3. Grid & movement

- **Grid:** 50×50 (2500 cells). Player starts at center **(25, 25)**.
- **Vision:** radius 3.5; fog clears in a circle around the player as they move.
- **Hazards:** 20% of cells are explosions (💥), placed by seeded RNG (seed `1337`), never on the center start. Hitting one costs **−20 HP** (max 100). Reaching 0 HP triggers death.
- **Death:** shatters the active blade — clears active traits and used metals, restores HP to 100, and resets the player to center. Crafted swords, gold, etc. are kept.
- **8-direction movement**, each direction costs 1 unit of a specific metal:

  | Direction | Metal | Start state |
  |-----------|-------|-------------|
  | Up | steel | unlocked |
  | Down | iron | unlocked |
  | Left | magnesium | unlocked |
  | Right | bronze | unlocked |
  | Up-Left | titanium | **locked** (50g) |
  | Up-Right | aluminium | **locked** (50g) |
  | Down-Left | blackIron | **locked** (50g) |
  | Down-Right | redIron | **locked** (50g) |

  The 4 cardinal metals are available from the start; the 4 diagonal metals must each be unlocked for **50 Gold** (click the locked grid button).

### Purify mini-game (movement)

Holding a movement button charges a slider that bounces 0↔100 (speed `0.15`). Releasing resolves the dash distance by where the slider stops:

| Slider position | Dash distance |
|-----------------|---------------|
| 40–60 (center) | 3 blocks |
| 25–75 (mid)    | 2 blocks |
| else (edges)   | 1 block |

Cost: exactly **1 metal** of the direction's type (consumed once, regardless of dash distance). The dash stops early at the map edge or on death.

## 4. Traits & heating

- **24 base traits**, each at a fixed coordinate on the map (see `traitCoordinates` in code). Examples: Durable 🛡️, Cursed ☠️, Flame 🔥, Celestial ☄️, Dark 🌑.
- **Discovery:** stepping onto a trait cell reveals a `❓`; heating it reveals and fuses the trait.
- **Value scaling:** a trait's base value = `floor(distance_from_center / 35.355 × 100)` (0–100). Farther from center = more valuable.
- **One-per-blade:** a given trait ID can only be fused onto the active blade once.

### Heating mini-game

Triggered by the **Heat** button while standing on a discovered trait. Interactive forge sequence:

1. **Pulley** — tap to lower the bucket (2s animation).
2. **Bellows** — repeatedly tap to pump heat. Each pump `+16` heat; heat decays at `18`/sec.
3. **Stabilize** — keep heat in the **green zone (40–70)** for a cumulative **2.0 seconds**. Above 70 = "Too Hot", below 40 = "Too Cold" (both bleed stabilization progress).

On success the trait fuses onto the active blade and a **"`<symbol>` `<name>` trait acquired"** toast appears (game-wide, not tutorial-only). During the tutorial this toast shows first, then the post-heat dialogue follows after a short delay.

> ⚠️ **Implementation note / known discrepancy:** quality is currently hardcoded to **Epic (+20 value bonus)** on every successful heat (`resolveInteractiveHeatMinigame`). The tiered Weak/Fine/Epic quality outcomes from the original GDD are not implemented. Decide whether to keep Epic-only or restore tiers.

## 5. Forging & weapons

- **Requirement:** must have spent ≥1 metal (by moving) to forge.
- **Shapes (10):** Shortsword, Longsword, Broadsword, Katana, Rapier, Cutlass, Claymore, Saber, Scimitar, Machete. *(Original GDD listed 11 incl. Dagger — Dagger is not in the build.)*
- **Design Desk:** customize the blade visually across 4 part categories — Blade, Grip, Guard, Pommel — each with selectable art. Purely cosmetic.
- **Completion:** moves the finished sword (shape, design, traits, recipe of used metals, value) into the **Vault** (inventory), clears the active forge, and resets player to center with full HP.

### Sword value & tiers

- **Value** = sum of fused trait values (base distance value + quality bonus). A sword with **zero traits = 5g** base.
- **Tiers** by value: I Common (<30), II Uncommon (<60), III Rare (<90), IV Epic (<120), V Legendary (≥120).

## 6. Economy

### Smelter
- Generates metals passively. Base **1 metal/sec**.
- Upgrade for **50 Gold** per tier → **+1 metal/sec** each, infinitely.

### NPC customers (active selling)
- Requests are scripted then randomized:
  - **Request #1:** "any weapon" — any sword works; pays at least **15g**.
  - **Request #2:** scripted **Flame** 🔥 trait request. (During the tutorial, this customer is held back until the player dismisses the post-sale dialogue, then summoned manually.)
  - **Request #3+:** random trait (from the 8 closest-to-center traits while `requestCount ≤ 10`, then from all 24). **10% chance** to also demand a specific shape.
- **Payout** = sword value, modified by Reputation:
  - Rep < 0 → **×0.8** (min 1g)
  - Rep > 10 → **×1.2**
- **Sale:** +1 Reputation. **Refuse:** −1 Reputation, new customer after ~1.2s.
- Shortcuts: **Auto Sell** (fulfill from Vault) and **Craft & Sell** (auto-craft a matching blueprint then sell).

### Passive shopfront
- **Unlock:** 50 Gold.
- Move swords from Vault into the Shop. Every **10 seconds**, each shop sword has an independent **5% chance** to sell for its full value. Does not affect Reputation.

### Blueprints
- Save the current active traits + used-metal recipe as a named Blueprint.
- **Auto-Craft:** if you hold enough raw metals, one-click craft a blueprint (opens the Design Desk, outputs to Vault).

## 7. Map travel (reset)

- Reset the 50×50 grid at any time.
- **Retained:** Gold, available metals, Reputation, Vault, Shop contents, Blueprints, Smelter upgrades, metal unlocks.
- **Cleared/reset:** map layout, fog of war, active forge, player position (back to center).

> Note: the map seed is fixed (`1337`), so the layout is currently deterministic across resets. If reset is meant to produce *new* trait layouts (per original GDD), the seed needs to vary.

## 8. UI / UX

- **Three swipeable screens:** Shop (0) · Customers (1) · Forge/Map (2). Game opens on the Forge screen.
- **Forge screen:** status panel (health bar, rep, gold, active traits), draggable/zoomable 50×50 viewport, 3×3 movement grid, action buttons (Heat, Forge, Save Recipe, 🗺️ Chart).
- **Onboarding:** 4-scene animated intro (ember particles) → multi-step tutorial (select metals → reach a trait → heat → forge → go to counter → sell a sword → a 2nd Flame-trait customer arrives → back to the forge), plus a contextual tip at the Shop unlock (50g).
- **Feedback:** red flash on damage, orange flash on heat success, green gold-pulse on passive shop sales, "reached a trait" / "trait acquired" toasts.
- **Reference map:** static `Minimap.png` shown via the Chart modal.

## 9. Known discrepancies & open questions

- Heat quality is Epic-only (see §4) — restore tiers or keep?
- Map seed is fixed (see §7) — should reset randomize the layout?
- Dagger shape from original GDD is absent (see §5).
- Metals expanded 4 → 8 vs the original GDD.
