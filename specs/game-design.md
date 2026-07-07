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
- **Hazards:** 20% of cells are explosions (💥), placed by seeded RNG (seed `1337`), never on the center start. **Landing** on one costs **−20 HP** (max 100). Damage is only applied to the cell the sword **lands on** — **crossing over** a hazard mid-dash (a 2- or 3-block Purify dash) is harmless, even over multiple hazards in a row. Reaching 0 HP triggers death. A low HP total also **caps the forged sword's quality** (see §4): a battered blade forges a lower-quality sword.
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

  **First-craft tutorial lock:** the game starts with exactly **4 steel + 1 magnesium** and everything else gated — only Steel & Magnesium are usable, the other metal buttons, Record Composition, Chart, and passive metal generation are all disabled. This lock lifts the moment the **first sword is forged** (`tutorialMetalLock`), after which generation resumes and all buttons unlock normally.

### Purify mini-game (movement)

Holding a movement button charges a slider that bounces 0↔100 (speed `0.15`). Releasing resolves the dash distance by where the slider stops:

| Slider position | Dash distance |
|-----------------|---------------|
| 40–60 (center) | 3 blocks |
| 25–75 (mid)    | 2 blocks |
| else (edges)   | 1 block |

Cost: exactly **1 metal** of the direction's type (consumed once, regardless of dash distance). The dash stops early at the map edge. Hazards along the way are passed over harmlessly; only the **final landing cell** is checked for hazard damage (and can trigger death).

While the button is held, a **live path preview** (the green `tile_move.png`) highlights the cells the sword would travel into — 1, 2 or 3 tiles in the move direction — updating in sync with the slider's current zone, and clamped at the map edge. It clears on release, and the actual dash matches the previewed distance.

**Cancel a held move** (no movement, no metal spent) by dragging the cursor onto the **cancel button** that appears in the centre of the 3×3 movement grid while holding, sliding a finger over it, or **right-clicking**.

The slider is **locked during the early guided tutorial** (moves are single-block) and unlocked when the tutorial reaches the chart/slider lesson (also unlocked on first craft as a fallback); once unlocked it stays available for the rest of the game.

## 4. Traits & heating

- **24 base traits**, each at a fixed coordinate on the map (see `traitCoordinates` in code). Examples: Durable 🛡️, Cursed ☠️, Flame 🔥, Celestial ☄️, Dark 🌑.
- **Discovery:** stepping onto a trait cell reveals a `❓`; heating it reveals and fuses the trait.
- **Value scaling:** a trait's base value = `floor(distance_from_center / 35.355 × 100)` (0–100). Farther from center = more valuable.
- **One-per-blade:** a given trait ID can only be fused onto the active blade once.

### Heating mini-game

Triggered by the **Heat** button while standing on a discovered trait. Interactive forge sequence:

1. **Pulley** — tap to lower the bucket (2s animation).
2. **Bellows** — **tap or hold** to pump heat. Each tap adds `+16` heat; **holding** raises heat gradually (`+40`/sec while held). Heat decays at `18`/sec, so holding nets ~`+22`/sec.
3. **Stabilize** — keep heat in the **green zone** for a cumulative **stabilize time**. Above the zone = "Too Hot", below it shows "Use the bellow to heat the furnace." (both bleed stabilization progress). The green band's position/width and the timings **vary per trait** (see below); the default (and every tutorial heat) is zone **40–70**, **2.0s**, decay `18`, pump `+16`.

**Per-trait heating variants:** every trait has a unique heating minigame, all built on the same engine via `heatConfigs` (the coloured band(s) on the meter move to match). Tutorial heats always use the default band so onboarding stays easy.

- **Static tweaks (Tier A):** Flame high band (70–90); Ice low (8–28, gentle, harsh overheat); Floral low/delicate (24–44); Sharp very narrow (50–62); Balanced narrow centre (44–56); Fury fast decay + quick stabilize; Durable wide band + long hold (3.5s); Endurance slow decay + long hold (4.5s); Heavy sluggish; Cruel band hugging the overheat edge (60–72); Grace narrow + quick (1.0s); Blood decay grows with heat.
- **Dynamic / random (Tier B):** Water, Celestial, Flexible — the band **oscillates** (different centres/speeds); Storm — random **gusts** shove the heat; Savage — the band **jitters** to random spots; Luck — **two** random bands, stabilize in **either**; Accurate — narrow band that **repositions once**; Cursed — band **jumps** repeatedly + heat spikes.
- **Sequential / hidden (Tier C):** Noble — stabilize a **low then a high** band; Honor — stabilize the **same band twice**; Lightning — a **fast two-strike** (narrow, fast decay, twice); Dark — the marker **flickers hidden** (forge by feel). Between stages the heat is knocked down so each stage is re-earned.

**Guidance cues:** the part to act on pulses with a glow and a bouncing hand points to it — the pulley first, then (after the bucket lowers) the bellows.

On success the trait fuses onto the active blade and a **"`<symbol>` `<name>` trait acquired"** toast appears (game-wide, not tutorial-only). During the tutorial this toast shows first, then the post-heat dialogue follows after a short delay.

**Heat timer → quality.** A countdown runs during the heating (bellows) phase, its length **per trait** (`heatTimers`; e.g. Grace 7.5s, most static traits 9s, dynamic/staged ~11s, Durable 11.5s, Endurance 14s; **tutorial heats get a safe 45s**). **Stabilize before the timer ends → the trait fuses at `Epic`.** If the timer runs out first, the trait still fuses but at `Fine` (one tier down) — no hard failure. The remaining time is shown as a `⏱` readout **right below the heat slider**.

### Quality tiers

Three tiers, low→high: **`Weak` (+0) · `Fine` (+10) · `Epic` (+20)** value bonus (added to the trait's distance-based base value; each trait stores `baseValue` + `quality`). The final quality is the result of a **four-stage chain**:

1. **Heat outcome** (Epic/Fine above), then
2. **capped by the blade's HP** at forge time (see §3): HP ≥ 80 → Epic allowed, 40–79 → capped at Fine, < 40 → Weak (`min(heat outcome, HP cap)`), then
3. **dropped by the hammer penalty** from the Hammering mini-game (see §5): **−1 tier per 2 misses** (`⌊misses / 2⌋` tiers), then
4. **dropped by the over-honing penalty** from the Sharpening mini-game (see §5): finishing in the **90–110% "keen" window** costs nothing, but grinding past **110%** over-hones the blade for **−1 tier per 10% over** (`⌈(pct − 110) / 10⌉` tiers).

Weak is the floor. The hammer and sharpen drops are combined (`⌊misses / 2⌋ + over-hone tiers`) and applied together. For a **manual forge** the chain runs per trait (each trait keeps its own heated quality through the cap, then the shared hammer + sharpen drop). For an **Auto-Craft** there is no HP cap (no exploration) and a single heat + hammer + sharpen performance sets **one uniform quality across all the sword's traits**. The forged sword's overall quality = its highest-tier trait, which drives the quality overlay (see §5).

## 5. Forging & weapons

- **Requirement:** at least one **heated trait** on the active blade — the Forge button is disabled until a heating minigame has fused a trait. Also requires ≥1 metal spent (by moving).

Forging runs as a **pipeline of steps** — shape select → hammer → *quench (non-fire only)* → design → sharpen (`forgeSword` for a manual forge; Auto-Craft prepends a heat minigame — see §6):

**Part 1 — Shape select.** A modal (with the player's **available gold shown at the top**) shows the 10 blade **shapes** only (no fittings), each tile labelled with the **blade's name** below it. Pick one and hit **Continue**.
- **Shapes (10):** Shortsword, Longsword, Broadsword, Katana, Rapier, Cutlass, Claymore, Saber, Scimitar, Machete. *(Original GDD listed 11 incl. Dagger — Dagger is not in the build.)* For the base (balanced) set, only **Shortsword, Longsword, Broadsword are free**; the other **7 are locked and unlock for 50 gold each** (click the locked thumbnail). Trait-skinned blade sets (e.g. Flame) are not locked, and a skinned trait limits the shape list to that skin's blades (Flame → 3 shapes; Ice/Water → Longsword only).

**Part 2 — Hammering mini-game.** A top-down **ingot** (`assets/hammer/ingot.png`) is shown; the player hammers it into the chosen shape by hitting **6 targets across 2 stages**. Each target appears one at a time as a **shrinking ring** — click it before the ring fully shrinks or it counts as a **miss**. Stage A: 3 targets on the ingot → the image changes to a **mid-forged blade** (`assets/hammer/balanced_<shape>_midblade.png`; only Shortsword/Longsword/Broadsword have mid art — the other 7 shapes reuse the Longsword mid as a placeholder). Stage B: 3 targets (tip + sides) → the image resolves to the finished blade, then the design step opens. The mini-game always completes (no fail/soft-lock); **misses only cost quality** (−1 tier per 2 misses — see §4). Tutorial/Auto-Craft-in-tutorial heats keep an easy, slow ring.

**Part 2.5 — Quench (cooling).** For any blade **whose last-acquired trait is not `flame`**, a cooling beat runs after hammering (a fire blade skips it and goes straight to design). The finished blade is shown glowing warm above a **water bucket** (`assets/forge/water_bucket.png`) on the forge scene (`assets/backgrounds/forge_bg.png`); the player **taps to dip** it, the blade slides into the water (steam rises, the glow fades to steel), **soaks for 3 seconds**, rises back out, and the design step opens automatically. **Feel-only — it has no effect on quality or value.** During the tutorial a bouncing hand points to the blade. (`openCoolModal`/`dipBlade`/`finishQuench`; `#coolModal`.)

**Part 3 — Design Desk (fittings).** Customize the sword across 3 part categories — **Grip, Guard, Pommel** — each with selectable art. Purely cosmetic. The **blade is fixed** from Part 1 (shown in the preview, not editable — the Blade tab is gone). An **info (i) button** toggles a hint reminding the player that looks don't affect properties. The **Sharpen** button advances to the sharpening step (Part 4).

**Part 4 — Sharpen (grindstone).** The finished sword — **fully assembled** (blade + grip + guard + pommel as chosen in the Design Desk) — lies horizontal across a front-facing **grindstone** (`assets/forge/grindstone.png` in its wooden stand, on `assets/backgrounds/sharpen_bg.png`). **After a 2-second delay the wheel begins spinning** — a motion-blurred frame (`assets/forge/grindstone_spin.png`) fades in over the still stone and is jittered in place — and **keeps spinning until the player finishes**. The player **slides the sword left↔right across the stone** — by dragging it, using the on-screen **◀ ▶ buttons (tap or hold to keep sliding)**, or the ←/→ keys; travel fills a **sharpness bar 0 → ~120%**, and sparks fly at the contact point while grinding. Zones: **0–90%** "keep sharpening" (Finish locked) · **90–110%** green "keen edge" window (Finish enabled, the player decides how sharp — **no penalty**) · **>110%** red "over-honed", which drops quality (**−1 tier per 10% over** — see §4). **Finish Sharpening** locks in the result and completes the forge → the **"Forging Complete!" board** (with **Add to Vault**) appears. Cancelling aborts the whole forge. During the tutorial a bouncing hand slides over the blade. (`openSharpenModal`/`sharpenGrind`/`finishSharpen`; `#sharpenModal`.)

- **Trait-specific part art:** a sword carrying a trait with a defined skin shows that trait's part images in the shape select, Design Desk, and everywhere it's rendered (forge result, etc.). Defined in `traitSkins` and resolved via `partsFor`/`designPartSrc`. Currently the **Flame** trait has a full set: 3 blades (Shortsword/Longsword/Broadsword), 3 grips, 5 guards, 2 pommels (`assets/sword-parts/*/flame_*.png`). **Ice** and **Water** have lean skins: 1 Longsword blade + 1 grip + 1 guard + 1 pommel each (`ice_*` / `water_*`), so an Ice or Water sword forges as a Longsword with that trait's parts. Traits without a skin fall back to the base library.
- **Completion:** moves the finished sword (shape, design, traits, recipe of used metals, value) into the **Vault** (inventory), clears the active forge, and resets player to center with full HP.

### Sword value & tiers

- **Value** = sum of fused trait values (base distance value + quality bonus — see §4). A sword with **zero traits = 5g** base.
- **Tiers** by value: I Common (<30), II Uncommon (<60), III Rare (<90), IV Epic (<120), V Legendary (≥120). *(Value tier is distinct from trait **quality** Weak/Fine/Epic.)*
- **Quality overlay:** both the **Design Desk preview** and the **forge-result** render layer a transparent overlay over the sword based on its overall quality — **cracks** (`overlays/crack.png`, hugging the blade) on a **Weak** sword, **sparkling stars** (`overlays/sparkle.png`) on an **Epic** one; **Fine** gets neither. In the Design Desk the overlay reflects the *projected* quality — heat outcome → HP cap (manual only) → hammer penalty (see §4) — since by Part 3 the heat and hammer results are already known. It does **not** include the Part 4 sharpening penalty (which happens after design), so it is an optimistic projection that a later over-hone can still lower; the **forge-result** overlay reflects the final quality.

## 6. Economy

### Smelter
- Generates metals passively. Base **1 metal/sec**.
- Upgrade for **50 Gold** per tier → **+1 metal/sec** each, infinitely.

### NPC customers (active selling)
- Requests are scripted then randomized:
  - **Request #1:** "any weapon" — any sword works; pays at least **15g**.
  - **Request #2:** scripted **Flame** 🔥 trait request. (During the tutorial, this customer is held back until the player dismisses the post-sale dialogue, then summoned manually.)
  - **Request #3:** scripted **ice-dragon** customer — asks indirectly for a sword "weak to heat" (resolves to the **Flame** 🔥 trait); the tutorial uses this customer to teach crafting from a recorded composition via the Recorded Compositions **Craft** button.
  - **Request #4+:** random trait (from the 8 closest-to-center traits while `requestCount ≤ 10`, then from all 24). **10% chance** to also demand a specific shape.
- **Dialogue reveal & responses:** the customer's request line is revealed **word by word** (typewriter, ~110ms/word; tapping the speech bubble skips to the full line). The line types out when the Counter screen first becomes visible for that customer (or immediately if a new customer arrives while you're already on the Counter). Only **after the full line has appeared** do the player's **two response options** fade in:
  - **"I have something for you."** → runs **Search Inventory** (below). Auto-disabled when nothing in the Vault matches the request, so it doubles as a "do I have it?" cue.
  - **"I don't have what you need."** → runs **Refuse** (below).
  The options are hidden while the line is still typing and while a customer is leaving (post-sale/refuse).
- **Payout** = sword value, modified by Reputation:
  - Rep < 0 → **×0.8** (min 1g)
  - Rep > 10 → **×1.2**
- **Sale:** +1 Reputation. **Refuse:** −1 Reputation, new customer after ~1.2s. The **"I don't have what you need."** (Refuse) option is **disabled for the first three (scripted) customers** (`requestCount ≤ 3`) so the tutorial flow can't be broken; it enables from customer #4 on.
- **Post-sale feedback + response gate:** on a successful sale the customer reacts with a short line before the gold, e.g. *"Oh! Hot! Here's your 25 gold."* The line is chosen by **prioritizing the trait the customer asked for** (`requestedTrait`), then the sword's first trait, then a random **generic** line (also used for trait-less swords). Each of the 24 traits has its own line (`traitFeedback`), plus 5 generic lines (`genericFeedback`); the scripted **ice-dragon** (tutorial customer #3) keeps its bespoke "You can craft such a powerful sword?" line. **The sold customer then waits at the counter** — instead of auto-departing — until the player taps a single **response button** (rotating between *"Thank you" / "Glad you liked it" / "Take care"*, `saleResponses`). Tapping it summons the next customer (the tutorial advances to its next scripted step; otherwise a random request). **Refuse is unchanged** (no response button; the next customer auto-arrives after ~1.2s).
- **Search Inventory** (the **"I have something for you."** option) finds the sword in the Vault that matches the customer's request and **opens the Inventory modal straight to that sword's detail view** (highlighted), so the **Sell** button is right there to complete the sale. *(A separate one-tap "Craft & Sell" button was removed; craft from a recorded composition via the Recorded Compositions modal's **Craft** button instead, then Sell.)*

### Passive shopfront
- **Unlock:** 500 Gold. (A "Shop Available!" tip box appears once the player first reaches 500 gold; dismissing it starts a hand-pointer guide — pointing to the left arrow until they reach the Shop screen, then to the **Unlock Shop** button — which clears when the shop is unlocked. The guide only runs once the main tutorial is over, so its hands don't clash.)
- **Post-unlock "stock the shop" guide:** the moment the shop is unlocked, a one-off guide runs (`shopSellPhase`): a box — *"Craft a flame sword and add it to your shop for sale."* — then a hand points the player to the counter and the recorded flame composition's **Craft** button (metals are topped up so it's affordable), then to the crafted sword's **To Shop** button. Once a sword is sent to the shop it guides them to the Shop screen and shows two boxes — *"This is where you display your best swords and possibly earn even more gold!"* then *"Or if you have too many swords lying in your inventory, better send them to the shop for sale."* — after which the guide ends. Skipped entirely if no flame composition is recorded.
- Move swords from Vault into the Shop. Every **10 seconds**, each shop sword has an independent **5% chance** to sell for its full value. Does not affect Reputation.

### Recorded Compositions (blueprints)
- The **Record Composition** button saves the current active traits + used-metal composition as a named entry. If the active blade is empty (e.g. right after forging) but a sword was just forged, the button instead reads **Record Last Composition** and saves that last forged sword's traits + composition — so you can still record after forging without re-heating.
- **Confirmation box (`#recordModal`):** recording never saves silently — it opens a box first. A composition is **keyed by its trait set**:
  - **New trait set** → the box shows *what trait(s)* are being saved and *how many metals* were used, with a **Record** button (or Cancel).
  - **A trait set already recorded** → the box shows a **before/after comparison** of the metal counts (Recorded vs New) and asks to **Update** (replace) the existing entry, so re-recording the same trait updates it rather than creating a duplicate. If the metals are unchanged the box notes "These are identical". (`saveRecipe` → `openRecordModal`/`confirmRecord`/`closeRecordModal`.)
- **Recorded Compositions** (Counter screen): a **📜 Recorded Compositions** button opens a **modal** (its own box with an internal scroll). The modal shows a grid of trait-icon tiles; **tapping a tile drills in** to a detail view (Tier, Traits, Value, **Composition**) with a **⚡ Craft** button (Auto-Craft — see below) and a **🗑️ Delete** button (delete is hidden during the tutorial to avoid breaking the guided craft step), plus a **← Back** to the grid. Craft closes the modal and runs the forge pipeline.
- **Auto-Craft** (the **⚡ Craft** button): if you hold enough raw metals, craft a recorded composition. It runs the **full forge pipeline**: a **heat mini-game** (using the composition's **last-acquired trait's** heat config/timer) → shape select → hammer → quench (skipped when that last-acquired trait is `flame`) → design → sharpen, then outputs to the Vault. Unlike a manual forge there is no HP cap, and the single heat + hammer + sharpen performance sets **one uniform quality across all the composition's traits** (see §4) — quality now comes from live performance, not a stored value. Cancelling the heat aborts the craft (no metals spent).

## 7. Map travel (reset)

- Reset the 50×50 grid at any time.
- **Retained:** Gold, available metals, Reputation, Vault, Shop contents, Blueprints, Smelter upgrades, metal unlocks.
- **Cleared/reset:** map layout, fog of war, active forge, player position (back to center).

> Note: the map seed is fixed (`1337`), so the layout is currently deterministic across resets. If reset is meant to produce *new* trait layouts (per original GDD), the seed needs to vary.

## 8. UI / UX

- **Three swipeable screens:** Shop (0) · Customers (1) · Forge/Map (2). Game opens on the Forge screen.
- **Counter (Customers) screen:** a slim gold/reputation pill at the top; the customer rendered as an **image** anchored bottom-left that **slides in from the left** on each new customer, **rotating** through `assets/customer/man2.png` (always the first customer) → `man1.png` → `woman1.png`; the request speech bubble (tail pointing to the customer) whose text is **revealed word by word** (see §6), with the player's two **response options** — **"I have something for you."** (Search Inventory) and **"I don't have what you need."** (Refuse) — stacked beside it, fading in only once the line has finished typing (Refuse is disabled for the first three customers — see §6); after a sale those two options are replaced by a single **response button** (*"Thank you" / "Glad you liked it" / "Take care"*) that the player taps to send the customer off and bring the next (see §6); and, at the bottom, two buttons — **🛡️ Inventory** and **📜 Recorded Compositions** — that each open their **own modal** (a fixed-height box with an internal scroll, so the screen itself no longer grows). Each modal is a **tile grid → tap a tile → drill-in detail view** (with a ← Back): the **Inventory** modal's tiles show the **composited sword image** (blade + fittings, with the quality overlay in the detail) and the detail carries **Sell** + **To Shop**; the **Recorded Compositions** modal's tiles show the trait icon(s) and the detail carries **⚡ Craft** + **🗑️ Delete**. Background: `Screen1bg.png`.
- **Forge screen:** status panel — health bar (no numeric text), then a row with an **ℹ️ tutorial-review button** (left) and the **gold/reputation pill** (mirrors screen 1's `💰 Gold | ⭐ Rep`), then a **"Blade Traits:"** line listing the heated traits (or "None"). The ℹ️ button re-opens past tutorial dialogue boxes (in their own frames) with ◀ Prev / Next ▶ / Close, and stays available after the tutorial. Then a draggable/zoomable 50×50 viewport (drag to pan; mouse-wheel zoom is centered on the cursor; a **📷 free-camera toggle** at the viewport's bottom-right (highlighted gold when active) — when active, moving the sword no longer recentres the view; turning it off snaps back to the sword), 3×3 movement grid, action buttons (Heat, Forge, Record Composition, 🗺️ Chart). ("Record Composition" saves a recorded composition — see §6.)
  - **Grid tiles:** the spawn cell (25,25) shows `tile_centre` and the 8 cells around it show `tile_centre2` (home base); cells the active sword **lands on** show a `tile_path` trail. Dashes only mark the endpoint, so jumped-over cells stay blank; the trail never overwrites hazard, trait, or the home tiles. The trail resets with the active blade — after a forge or on death (`pathCells`, `markPath`/`clearPath`).
- **Onboarding:** 4-scene animated intro (ember particles) → multi-step tutorial (select metals → reach a trait → heat → forge → go to counter → sell a sword → a 2nd Flame-trait customer arrives → back to the forge → open the chart (a text label + pulsing glow over the minimap alternates every 3s between the player marker — "Your location" — and the Flame icon — "Flame trait" — until the chart is closed, so the player sees where to head) → learn the Purify-dash slider (two illustrated dialogue boxes: a tap-vs-hold art frame, then an avoid-impure-tiles art frame) → head west toward the Flame trait (when its ❓ mark is revealed by the fog, a persistent top-of-screen banner — "See the trait mark ❓… add some iron to go down to it." — appears and stays until the player reaches it) → reach the Flame trait, where a bouncing arrow points to the Heat button → heat it → prompt to "Record Composition" (the **Forge button is greyed out from when the Flame is heated until the composition is recorded**, so the player can't accidentally forge first) → record it (a **confirmation box** shows the trait + metals being saved; confirm to record — see §6) → a bouncing arrow points to the now-enabled Forge button to craft the sword → forge it (choose the blade shape, hammer the ingot into form, quench it in water, design the fittings, then sharpen it on the grindstone — see §5) → prompt to go sell it at the counter → sell the flame sword to the 2nd customer → a 3rd customer (off to fight an ice dragon, "weak to heat") arrives, a tutorial box teaches opening **Recorded Compositions** and tapping **Craft** to forge a flame sword from the recorded composition (which re-runs the heat + hammer mini-games — see §6), then giving it to the customer, who is delighted, then a closing "help customers find the perfect sword" tip), plus a contextual "Shop Available!" tip the first time the player reaches 500 gold (enough to unlock the Shop), which then hand-guides them to the Shop screen and the Unlock Shop button (see §6). **Any tutorial box tied to a customer** (the sell-a-sword prompt, the "another customer" prompt, the Auto-Craft lesson, and the closing tip) is gated to appear **only after that customer's word-by-word line has fully typed out plus a ~2s read pause**, so a tutorial box never overlaps the customer's speech. During the intro, a **"Skip Intro" button** (fixed bottom-right) jumps straight into the game (`launchCoreGame`). A **"Skip Tutorial" button** (fixed at the window's bottom-right, outside the game frame, shown only while the tutorial is running) ends the flow immediately and unlocks everything (metals, passive generation, Record Composition, Chart, the Purify slider). Stacked above them, three cheat buttons (fixed bottom-right, shown for the whole session) — **"+100 Metals"** (adds 100 of every metal), **"+100 Gold"**, and **"Skip Stage"** (skips whichever forge minigame is open — heat/shape/hammer/quench/design/sharpen — and proceeds to the next stage) — remain available throughout. ⚠️ The Skip Intro button and all three cheats currently ship to players.
- **Feedback:** red flash on damage, orange flash on heat success, green gold-pulse on passive shop sales, "reached a trait" / "trait acquired" toasts. Spending a metal (a move/dash) **flings an ore chunk** (`assets/forge/Metal.png`) from the pressed metal button into the bucket in an arc, and the bucket wobbles as it lands (`tossMetalToBucket`; fires only on an actual spend, so a cancelled Purify hold throws nothing). The **first time** a given trait is heated (per session) shows a celebratory **"New Trait Discovered!"** box with the trait's icon and name — including during the tutorial (it layers above the tutorial dialogue); repeat heats of an already-known trait just show the "trait acquired" toast. Warnings/errors (not enough gold, duplicate composition, wrong sword for a customer, etc.) use a **styled parchment popup** (`gameAlert`, matching the dialogue-frame look) instead of the browser's native `alert()`. The **Heat** button pulses with a glow while standing on a trait; the **Forge** button is disabled until a trait is heated, then pulses with a glow (and during the guided flame step it is re-disabled from the heat until the composition is recorded, so the player records before forging).
- **Tutorial hand pointers:** at each guided step a bouncing 👆/👇/👈/👉 hand points to the element to use next — the Steel & Magnesium metal buttons (until the 4 steel + 1 magnesium recipe is added), Heat, Forge, the left/right screen arrows, Search Inventory, the Chart button, Magnesium again (until the Flame trait is revealed on the map), Record Composition, and — for the 3rd (ice-dragon) customer — the selected composition's **Auto-Craft** button then **Search Inventory**. Each hand clears once its action is taken. Data-driven via a `hand` field on the relevant `tutorialFlow` gate steps.
- **Minimap (Chart modal):** a live canvas minimap of the full 50×50 grid (fully revealed — no fog) — uniform tan ground (hazards are **not** shown), every trait drawn as its emoji icon at its location, and the player marked by the same sword icon used on the grid map (`assets/map/tile_sword.png`) with a pulsing blue glow. Supports **zoom** (scroll / pinch / on-screen +/− buttons, 1×–6×) and **pan** (drag), clamped to the map. **Tapping a trait icon** shows a small label with that trait's name below it. During the tutorial's chart step, a **text label + pulsing glow** (no hand pointer) highlights the target and alternates every 3 seconds between the player marker ("Your location", its own blue glow) and the Flame icon ("Flame trait", an amber glow ring), tracking zoom/pan, until the chart is closed. (Replaces the old static `Minimap.png`, now unused.)

## 9. Known discrepancies & open questions

- ~~Heat quality is Epic-only~~ — **resolved:** quality is now Weak/Fine/Epic, set by the heat timer and capped by blade HP (see §4).
- Map seed is fixed (see §7) — should reset randomize the layout?
- Dagger shape from original GDD is absent (see §5).
- Metals expanded 4 → 8 vs the original GDD.
