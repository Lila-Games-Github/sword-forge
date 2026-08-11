# Core Loop Mapping: Potion Craft → Sword Forge

**Status:** Proposed direction (pre-implementation). Captured from the team whiteboard (FigJam, Nancy + Biswajeet), 2026-08-10.
**Scope:** This is the design target for the **presentation pass** of Sword Forge. It redefines the *front half* of the core loop (how a blade is built). The back half (shape → hammer → finishing → sell) is retained from the current build.
**Relation to SSOT:** `specs/game-design.md` continues to describe the game **as implemented** (V2, `swordforgeV2.html`). This doc describes where the build is going. As each system below lands in code, fold it into `game-design.md` in the same change.
**Reference research:** `research/potioncraft.md` (deep teardown of the reference game). This doc is the *application* of that research.

---

## 1. The thesis

Sword Forge's crafting becomes a **Potion Craft-style path-navigation puzzle, expressed entirely through blacksmith stations**.

In Potion Craft you never pick a recipe from a list: you plot a path on a map by choosing and grinding ingredients, advance a marker along it by stirring, pull it back to centre with water, and lock in an effect with the bellows. The new Sword Forge loop is a 1:1 translation of those verbs into forge equipment: **ores plot paths, the crusher lengthens them, the smelter commits them, the hammer travels them, water quenches back to centre, and fire locks in traits.**

Key design note from the board (Nancy): *smelting + crushing + hammering + cooling have nice interactions, and can stack traits.*

## 2. Verb mapping (the heart of the board)

| Potion Craft verb | What it does there | Sword Forge station / verb | What it does here |
|---|---|---|---|
| Choose herb | Selects which path segment you can plot | **Select metal ore** | Each ore type plots a distinct path shape on the map; picking ore = planning the route (4 ore types on the board) |
| Grind (mortar & pestle) | More grinding = longer path segment | **Stamp mill / crusher** | Optional step: crush the ore to make its path longer before committing |
| Add ingredient to cauldron | Appends the plotted segment to the live path | **Add metal to smelter** | Finalizes / commits the planned path |
| Heat the coals | Enables the brew | **Bellowing** | Heats the ore in the smelter |
| (Pour the brew) | - | **Click smelter mouth to pour ingot** | Tactile beat: the molten metal becomes the ingot you will steer |
| Stir the cauldron | Irreversibly advances the marker along the path | **Anvil / hammer** | Hammering travels the ingot along the path, plus fine tuning of position |
| Ladle / water base | Pulls the marker straight back toward the map origin | **Pour water (quench)** | Moves the ingot back toward centre |
| Bellows over an effect zone | Locks in an effect; alignment precision = tier | **Heat on fire** | Acquires / locks a trait at the current map position |
| (No direct equivalent) | - | **Temperature axis** | Hot ore travels faster, cold ore slower; controlling temperature = choosing fast travel vs precision (Nancy) |
| "Finish potion" (no turning back) | Commits the craft | **Select shape → Hammer** | The point of no return before shaping the blade |

## 3. The new core loop, step by step

### Phase A - Plan and smelt (path building)

1. **Select metal ore - plan path.** Each ore has its own path shape; choosing the ore is choosing the route toward the traits you want.
2. **Stamp mill / crusher - make path longer** *(optional)*. Analog of grinding: invest work to extend the ore's path before committing. Loops back to ore selection if you change your mind.
3. **Add metal to smelter - finalize path.** The path is now committed.
4. **Bellowing - heat the ore.**
5. **Click the smelter mouth to pour the ingot** (tactile interaction, pink on the board).

### Phase B - Travel and tune (path navigation)

6. **Anvil / hammer - travel on the path + fine tuning.** Hammering advances the ingot along the committed path (Potion Craft's stir). This is where moment-to-moment control feel lives.
   - **Re-smelt loop** (pink on the board): *click the ingot on the anvil and throw it back in the smelter* to add more metal / extend the run.
7. **Temperature control** (Nancy's note): hot ore travels faster, cold ore travels slower. The player manages temperature to trade **fast travel vs precision**. This is Sword Forge's own twist; Potion Craft has no speed axis.
8. **Pour water - move to centre.** Quenching pulls the ingot back toward the map centre (Potion Craft's ladle/base dilution).
9. **Heat on fire to acquire trait.** Positioning the ingot at a trait location and heating locks the trait in (Potion Craft's bellows-lock).

### The stacking loop

After acquiring a trait, the flow loops back to **Select metal ore** (dashed lines on the board): add another metal, travel further, acquire another trait. Smelting + crushing + hammering + cooling interact, so traits **stack** across iterations.

### The point of no return (red line on the board)

Once you leave the path map for shaping, there is no going back (mirrors Potion Craft's "Finish potion" commit).

### Phase C - Shape and finish (retained from current V2)

10. **Select shape** (Shortsword / Longsword / Broadsword / ...).
11. **Hammer** - the existing "Hammer the Ingot" mini-game.
12. **Optional finishing** (marked optional on the board): **Designing → Sharpening → Polishing.** Skippable as a group; polishing is the new third member.
13. **Sell.**

## 4. What changes vs the current V2 build

| System | Current V2 (as-built, `specs/game-design.md`) | New direction (this doc) |
|---|---|---|
| Movement | Free 8-direction dashes on a fog-of-war 50×50 grid; 1 metal per move; Purify slider sets dash length | Ore choice **plots a path**; hammering **travels** it; no free steering off-path |
| Path | `tile_path` marks where you have been (a trail) | The path is **planned up front** (ore + crusher) and then navigated |
| Metals | 8 metals = 8 directions | Ores = path shapes (4 on the board); crusher modulates length |
| Movement speed | Slider zones (1/2/3 blocks) | **Temperature**: hot = fast, cold = slow/precise |
| Return to centre | Walk back / map reset | **Quench** pulls toward centre |
| Trait acquisition | Stand on trait cell → Heating mini-game | **Position on path + heat on fire**; stacking across re-smelt loops |
| Shape → Hammer → Design → Sharpen | Pipeline after forging | Retained; Design/Sharpen/**Polish** become an explicitly optional trio |
| Sell | 7 customers/day, green/red-style requests | Retained (unchanged on the board) |

What is deliberately **kept**: the tactile station verbs (bellows, pulley, bucket, anvil), the hammering mini-game, the quality-tier idea, the sell loop, and all existing art (stamp mill / crusher is the main new station).

## 5. Open questions (from the board)

- **"Ores mined?"** - The sourcing loop is undecided (Potion Craft grows herbs / buys from traders; do we mine, buy, or passively generate?). Top-of-board open question.
- **Rejected edge (red X on the board):** a direct loop between path-selection and grinding was crossed out on the Potion Craft reference side; the crusher loop in our flow instead returns via ore selection. Confirm the intended loop shape.
- **"Water thingy"** - the quench station needs a real name (bosh / slack tub?).
- **Precision → quality:** Potion Craft maps alignment precision to effect tier I/II/III. How does trait-lock precision interact with our existing Weak/Fine/Epic chain (heat timer, HP cap, hammer misses, over-honing)?
- **Trait stacking limits:** how many traits per blade under the new loop (currently one-per-trait-ID, no hard count)?
- **Hazard/impurity cells:** do they exist on the new path map, and what do they do to a path-locked ingot?
- **Temperature UI:** is temperature a persistent meter fed by bellowing and drained by time/quenching (reusing the heating mini-game's heat model)?

## 6. Presentation pass scope

What the presentation build must demonstrate, in order:

1. Ore selection showing a **visible planned path** on the map.
2. Crusher interaction visibly **lengthening** the path.
3. Smelter commit → bellows → **pour-the-ingot** tactile beat.
4. Hammer-to-travel on the anvil with the **temperature speed effect** readable.
5. Quench pulling the ingot toward centre.
6. A trait lock via fire, then **one stacking loop** (second metal, second trait).
7. Crossing the no-return line into the existing shape → hammer → (design/sharpen/polish) → sell flow.

Success bar (from `research/potioncraft.md`): the loop only works if the moment-to-moment control feel of hammer-travel is excellent, and the "crafting is navigation" aha must land in the first session.

## 7. Board legend (provenance)

Colour coding on the source whiteboard:

- **Grey box ("Section 4") + grey notes** - Potion Craft reference flow (choose herb / grinding / stirring / water / bellowing) with the four path-manipulation sketches (extend, advance, pull back, finish).
- **Purple boxes** - the Sword Forge core flow (main spine).
- **Blue boxes + dashed blue arrows** - optional steps / loops (crusher, quench).
- **Pink boxes** - tactile click interactions (pour ingot, throw ingot back in smelter).
- **Green notes (Nancy)** - design rationale (trait stacking; temperature = speed control).
- **Red line** - the no-turning-back commit point.
- **Yellow box** - Sell (loop exit).
