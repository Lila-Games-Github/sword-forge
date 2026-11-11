# Sword Forge - Game Design (SSOT)

**Single source of truth for game mechanics.** This describes the game *as actually implemented*. When code and this doc
disagree, treat it as a bug in one of them and reconcile. Update this doc in the same change as any mechanic change.

> **Which build this describes (rewritten 2026-11-03).** The game is **`Swordforge_looptest_landscape.html`** (the
> smelter crafting loop and the six-part FTUE, as merged in PR #28, R0-R62). **Every section describes that build**; values
> were read from the code on 2026-11-03. The dated records hold the full detail and the reasons, and win on any conflict:
> `specs/2026-10-21-smelter-version-loop.md` (the loop), `specs/2026-10-07-ftue-v3-rework.md` (the FTUE, market, blueprints,
> ore chain), `specs/2026-10-23-ftue-smelter-rework-plan.md` (R0-R62), `specs/2026-10-29-rotary-market.md`,
> `specs/2026-10-01-hammer-hit-points.md`, `specs/2026-10-01-hazard-integrity.md`, `specs/2026-10-06-skill-tree-trade-ore.md`,
> `specs/2026-10-30-*.md` (effects, dialogue colours). The whole game in one narrative document: `GDD.md` (repo root).

> The original design vision is archived at `archive/Sword_Grid_Game_GDD.md`. The V1 game this file used to describe in
> §6-§8 (metals, the 50x50 grid, 7 customers a day, the heat minigame) is in `v1.html` and this file's git history.

---

## 1. Overview

You play a blacksmith, guided by a small dragon, who reopens an abandoned forge. Ores dropped into the smelter draw a route
across a fog-covered trait map; the bellows move a sword marker along it; the smelter gate takes the trait the marker rests
on, at a tier set by how well it is lined up. The hot metal is shaped on the anvil in a hammering minigame, quenched in a
bucket, optionally decorated and sharpened, and sold at the counter or from the shop. Mobile, landscape, one HTML file.

## 2. Core loop (the main build, smelter loop)

1. **Ores** - from the starting bag, the dragon's rewards and the cave (`FTUE.oreStart`, `FTUE.oreChain`, §7).
2. **Grind (optional)** - an ore on the **grindstone**, turned by its handle, reaches further on the map (§3).
3. **Smelt** - each ore dropped into the **smelter** adds a segment to the active sword's **route** on the map.
4. **Pump** - dragging the **bellows** handle up and down moves the sword along the route (§3).
5. **Align (optional)** - tilting the **ladle** beside the smelter pulls the sword toward the map's centre, to line it up on a
   trait's centre: the tier (§4).
6. **Take the trait** - on a trait the **smelter gate** glows; a tap takes the trait and releases the hot metal. For another
   trait, put the metal back into the smelter, pump on, open the gate again (§4).
7. **Shape** - the hot metal dropped on the **anvil**, then a tap on it, opens the **shape window** (owned shapes, and blueprints to buy), then the
   **hammering minigame** (§5).
8. **Quench** - the shaped blade lies hot on the anvil; picked up by its handle it hangs and swings; dipped (or dropped) into
   the **bucket** it is quenched and the sword is made (§5).
9. **Finish (optional)** - the **design desk** and the **sharpening wheel** in the basement (§5); each adds 7g.
10. **Sell** - at the counter to a customer, or from a shop rack (§6); then craft again.

## 3. The map, routes and travel

### The map

- **World:** an SVG board **2800 x 1960** units (`WORLD_W`, `WORLD_H`), seen through a zoom / pan window: `INIT_W` **1100**,
  `MIN_W` **360**, `MAX_W` **2800**. The sword starts at **(1400, 1030)** (`START`). A craft's start recentres the window on
  the sword, zoom kept (R94, `craftView`): the first ore of a new craft on the grindstone or in the smelter
  (`craftStartView`: no metal, no segment, no ore on the wheel), CONTINUE FROM HERE, and a stored ingot back on the anvil.
- **Fog:** cleared for good in circles of `REVEAL_R` **120** as the sword travels (the Vision skill widens it, §6), plus
  `INIT_REVEAL` **430** around the start.
- **Traits:** 25, placed from the owner's map (`TRAIT_POS`); each is a `?` until taken. The map's trait icons open a small trait
  card (`specs/2026-10-06-map-trait-links.md`).
- **Hazards:** zones that cost the blade health while the sword moves through them (`HAZARD_DPS` **26**/s over a blade of
  `BLADE_HP_MAX` **100**, shown as a fill inside the sword marker; at 0 the blade shatters). Health lowers the price
  (`HAZ.floor` 0.5 at 0 health); 3+ zones crossed drop every trait one tier, 5+ two (`HAZ.steps`; the first 2 are free).
  In a zone the marker's parts shake (`swordShake`) and the health fill is red; out of it the level colour (green above 60%,
  amber 30-60%, red below 30%) returns. D69's speck in the fire craft is `HAZ.move[1]` at scale 2.25 (R103, was 0.75): the fire
  run loses about 14 health there (was 4). Record: `specs/2026-10-01-hazard-integrity.md`.
- **Books:** XP pickups collected by travelling near them (small 50 xp, large 75, great tomes 100-200; §6).

### Ores and routes

- **7 ores:** Iron, Manganese, Copper, Aluminium, Nickel, Tin, Zinc (`ORES`), each with its own fixed path shape and length
  (200, 258, 144, 250, 215, 185, 230 world units). Since 2026-10-28 (R24) iron's path is turned 30 deg anticlockwise and
  manganese's 30 deg clockwise (`ORES` `rot`); Balanced and Fire sit at the new ends (`FTUE.balancedAt`, `FTUE.fireAt`).
  Record: `specs/2026-10-28-rotated-ore-paths-test.md`. Each ore dropped into the smelter appends its path from the current
  route end (the **X**); ores stack.
- **Raw vs ground:** a raw ore reaches **50%** of its path; on the grindstone two full turns of the handle (`GRIND_TURNS` **2**)
  grind it fully, **100%** (`tPct = 0.5 + 0.5 x grind`).
- **Back to the bag:** an ore on the grindstone dropped on the inventory goes back to the bag, whole; its grinding is lost (R21).
- **Route drawing:** the placed route is **dark brown**; while an ore is held its preview is a fainter **red** (solid to its
  reach, dotted for what grinding would add). The route behind the sword is erased as it travels.
- **Known routes (tutorial):** Balanced 2 iron + 2 manganese raw (Epic); Fire 2 iron + 1 manganese, then manganese, then a
  ground iron; Durable 2 nickel; Swift 2 fully ground copper; Gale further along copper.

### Travel: the bellows

- Dragging the bellows handle (`#bellowHot`) moves the sword, and only while the handle moves: a full stroke (closed to raised,
  `SMELT.rangePx` **40** px) is `SMELT.strokeSec` **0.2** s of full-speed travel (`SWORD_SPEED` 0.5 of a segment a second;
  routes of 5+ fully ground irons run at x2, `ROUTE_FAST`). The travel glides out frame by frame (`SMELT.easeSec` **0.15**). The
  handle springs back closed when released (`SMELT.springMs` **250**); the spring moves nothing. Heat does not set the speed.
- **The smelter's look** follows the work: its crown lights as the bellows pump and cools after (R34-R35, `furnaceLook`); the
  gate layer glows while the sword is on a trait.
- Record: `specs/2026-10-21-smelter-version-loop.md` (s1-s3).

## 4. Traits: alignment and taking them

- **Alignment sets the tier** (`tierFromDist`, the sword's distance to the trait's centre): **<= `ALIGN_EPIC` 9 Epic**,
  **<= `ALIGN_FINE` 20 Fine**, **< `ALIGN_MAX` 34 Weak**; beyond 34 the sword is not on the trait.
- **The ladle (tier alignment):** behind the smelter (`assets/forge/ladle_base`, `ladle_head`), shown from Part 4 (R29).
  Dragging its bowl tilts it (0-`ladleMax` **45** deg); past `ladleDead` **4** deg it pulls the sword, its route and the X
  straight toward the map's centre, up to `ladlePull` **24** map px/s at full tilt, linearly by the tilt. Released, it tips back
  and the pull stops. Only while the metal is in the smelter. Record: `specs/2026-10-21-smelter-version-loop.md` (s4).
- **The gate takes the trait:** it glows while the sword is on a trait (`smGateSync`). A tap takes the trait at its tier, reveals
  its symbol on the map for good, records it in the craft book, opens the trait window (first discovery only, R12, with a
  celebration burst, R58-R59), and puts the hot metal at the gate. Off a trait the gate refuses. A trait already on the metal is
  only re-rolled up in tier, never added twice.
- **More traits:** drag the hot metal back into the smelter, add ore if needed, pump and open the gate again. The blade's
  traits show as pips in the craft frame (5 slots; a tier-N trait fills N).
- **Craft book:** each trait set's page records the route that reached it (ores, grinds, tier, hammer grade); **CRAFT 1** makes
  the page's sword straight away from its ores (no smelter, no minigame; §8).

## 5. Forging the blade

- **The anvil opens the shaping:** the hot metal lies on the anvil (with at least one trait); a tap on it opens the **shape window** (R82): owned
  shapes, and locked ones with their blueprint price and a BUY (the market's prices and checks, §6). A tap on the metal reopens
  it. A stored metal (ingot) dropped on the anvil lands there with the heat it was stored with (R18).
- **The hammering minigame:** the dragon heats the metal (hold on it), the hammer strikes **hit points** (`HM_HITS`: 1 point on
  the orb for 3 strikes, then 3 random points on the mid-blade), graded by aim into an accuracy percent that sets the price (R92, `hmAccMul`, `HM_HITS.price`): 0-80% a
  curve `0.8 + 0.2 x (e^(4p/80) - 1)/(e^4 - 1)`, 81-100% a row a percent (1.010 ... 1.300, each step bigger). Band names as
  labels only: **Masterwork** (>= 0.85), **Good** (>= 0.60), **Crude**. Record: `specs/2026-10-01-hammer-hit-points.md`. Stages: metal sphere,
  `balanced_<shape>_midblade`, the sword's own blade (`bladeFor`). **No mug:** `SMELT.shapedHold` **700** ms after the last
  strike the minigame closes and the finished blade lies on the anvil, glowing hot. SKIP HAMMER grades it Good.
- **Quench:** pressed within `SMELT.bladeGrab` **24** px of its line, the blade is picked up by its handle (the tang, stored per
  blade picture in `SM_ENDS_ART`) and hangs as a damped pendulum from the finger (`bladeG` 2600, `bladeDamp` 2.5 since R98, was 1.2). Dipped
  into the bucket's water from above, or released over the bucket, it is quenched (the glow fades, smoke and mist) and the
  sword is made; released elsewhere it goes back on the anvil. Record: `specs/2026-10-21-smelter-version-loop.md` (s5, s6).
- **Dragged swords swing:** a sword dragged out of the Swords tab on any screen (or off the counter or the table) hangs from
  its grip and swings like the blade on the anvil (`SMELT.swingW` 317 px; s7).
- **Swing effects** (R40-R51, `SWING_FX`, `fxFor`, record `specs/2026-10-30-fire-swing-fx.md`): a fire sword glows and throws
  embers with an orange slash at the tip; balanced, durable and swift swords leave a white slash; a gale sword leaves the slash,
  wind streaks that swirl round it when still and trail it when moving, and cyan wind curls. Other traits have none yet. Shown
  on dragged swords and on the blade held at the forge.
- **The made sword** goes to the Swords tab with its shape, traits and tiers, hammer grade, health and hazards crossed; the
  "Sword crafted!" window shows it (the first one teaches its rows, D17b-D17a-D17c).
- **Design desk** (basement, unlocked in Part 6): the sword's trait set of grips, guards and pommels (`DD_SETS`: balanced,
  flame, swift, gale, ice, water; Durable and the other traits use balanced). `FTUE.startParts` 3 of each, plus Garric's 6
  bonus balanced parts at grade 3. DONE marks the sword designed (+7g). The parts chosen do not change the price.
- **Sharpening wheel** (basement, unlocked in Part 5): drag the sword along the spinning stone; sharpness 0-100 (`SH_GAIN`
  0.055 per px); the green band is 80-90.1 (capped at 90.1 during the lesson). DONE stores it; >= 80 adds +7g.

## 6. Economy

### Sword price

- **Trait value** (`traitValue`, stamped when a trait is placed): `clamp(5, 100, round(distance from the map centre (1400, 980)
  / 12))`. Starter traits: swift 16, heavy 21, balanced 24, flexible 24, durable 25; fire 48; gale 41; the outer traits up to
  100 (fury, magma).
- **Raw value** (`swordValue`): the sum over the sword's traits of trait value + `QUALITY_BONUS` (Weak 0, Fine 10, Epic 20);
  a sword with no traits is worth 5. The shape does not count.
- **Price** (`swordBase`, `swordPriceParts`): `floor(raw value x popularity x forging band x health x Trade skill x
  reputation)`, min 1, then **+7g** if sharpened (>= 80) and **+7g** if designed.
  - Popularity: `1.10^(level-1)` (`POP_STEP`); each counter sale adds `POP_GAIN` (Weak 0, Fine 1, Epic 2, by the sword's best
    tier) to a 20-point bar (`POP_CAP`) that carries over into the next level.
  - Forging accuracy: x0.8 (0%) to x1.0 (80%) to x1.3 (100%), every percent its own value; no accuracy x1.0 (§5, R92). Health: `0.5 + 0.5 x hp/100` (`hazPriceMul`). Trade skill: `1 + 0.05 x rank`.
  - Reputation: +1 per counter sale; above 10 every price is x1.2 (below 0 x0.8; nothing lowers it in this build).
  - Example: an Epic Balanced, Good forging, full health, popularity 1, no skills: 24 + 20 = 44g; designed and sharpened, 58g.
- A sale at the counter also gives `XP_SELL` 5 xp per sword.

### Customers and orders

- **The bell** brings one customer at a time (no timer). During the tutorial the stage decides who comes (the scripted
  customers and each part's gameplay customers, §7). After it, `nextCustomer`: a random portrait from 7 (`CUST_POOL`); 80%
  ask for a trait already discovered (`CUST_DISCOVERED`), 20% for one not yet found, in one of 4 lines (`CUST_ASKS`, "Do you
  have a <Trait> sword?").
- **Orders:** tutorial orders name a trait and may name a shape, a tier, or several items (`orderMatches` checks the trait,
  the shape and the best tier). A sword that does not match is refused with a toast. Several-sword orders are handed over one
  at a time; the last one pays for all (r267).
- **SELL** pays the price (above), REP +1, popularity and 5 xp. The customer thanks the player with a line chosen by the sword's
  best tier (`CUST_THANKS`, 5 each) and stays `CUST_BYE_MS` 3.2 s.
- **COME LATER** puts the customer on the waiting list (`FTUE_ST.waiting`); the ledger calls them back. In the tutorial only the
  Part 4 two-sword customer can wait. **DENY** is a placeholder (no action), hidden until the tutorial ends.
- **The player's reply** (R56, `FTUE.replies`): in the tutorial, after an order line the player taps a reply ("Yes, I can craft
  one.") before the dragon speaks; replies show only once the customer's line has finished typing (R60).

### Market and blueprints

- **Shapes:** the Shortsword is free for every trait; the base shapes (`FTUE.shapes`): balanced, fire, durable - Shortsword,
  Longsword, Broadsword; gale - Shortsword, Longsword, Rapier; swift - Shortsword, Longsword, Dagger. The market adds Katana,
  Cutlass, Machete, Saber, Scimitar, Claymore and the leftover of Dagger / Rapier (`MARKET.extra`). The 20 other traits use
  balanced's list.
- **Price** (`marketPrice`): `50 x (trait index + step index + 1)`; Shortsword is free. Trait order: balanced, fire, swift,
  gale, durable, then the map's other 20. Step order: the trait's other base shapes, then Katana ... Claymore, then the
  leftover. Examples: Balanced Longsword 50, Katana 150, Claymore 400, Dagger 450; Fire Katana 200; Gale Katana 300; Fire
  Claymore 450; the last trait's shapes 1250-1650.
- **Buying:** in the rotary market window on the counter (R38, `MK_ROT`, record `specs/2026-10-29-rotary-market.md`) or from
  the shape window. States: free, owned, "Play more to unlock" (market not open), unknown trait, too poor, BUY. In the tutorial
  only the open order's (or a waiting customer's) blueprints can be bought, and the dragon pays for some (D28c): his coins fly to the gold counter, the gold rises by the price, D28ca, and the player
  buys it (R96, `ftueDeposit`; until R96 he unlocked it himself). Only owned
  shapes can be forged. A purchase (market or shape window) flies the quest claim's coins (`flyCoins`: 5 coins, 650 ms,
  70 ms apart) from the gold counter to the buy button, and the counter pops "-<price>g"; the gold is spent at once (R91,
  `buyCoins`).

### Progression: exp, levels and skills

- **XP:** 100 per level, each level 1 skill point. Sources: crafting 5, selling 5, a cave seam worked out 5, map books
  (small 50, large 75, great tomes 100-200), quests 20.
- **Skill tree** (`SKILLS`, 12 node slots, 8 used; record `specs/2026-10-06-skill-tree-trade-ore.md`): Trade (+5% price a
  rank, 20 ranks), Extract (5% a rank: a seam gives +3-4 ore, 5 ranks), Pickaxe (swing 10% faster a rank, 5), Bounty (+1 ore
  per seam a rank, 10), Bulk Craft (craft-book crafts use 10% less ore a rank, 7 ranks at 7 points each), Master (more books in
  the fog, then great tomes, 10), Vision (+5% sight, 20), Restore Ore (10% a rank: an ore back when a blade shatters, 3).
  RESET TALENT refunds all. There is no ore buying or selling.

### Quests

- 14 one-step quests, 20g and 20 xp each, paid when CLAIM is pressed (`QUESTS`): craft a sword and sell a sword (already done
  when the list arrives, Part 1), then buy a blueprint, update a craft-book page, gather ores, craft a fire sword, sleep, craft
  a durable sword, buy a fire blueprint, an Epic with the ladle, sell a weak sword, craft a swift sword, craft a gale sword,
  sharpen a sword. Something to claim (`qs-ready`): the basket's glow is still (`drop-shadow(0 0 9px rgba(90,230,110,.9))`) and a
  faint green tint (`rgba(90,230,110,.3)`, masked to the basket's art) lies on it (R93; it breathed before).

### Shop and decor

- **Shopfront:** 500g (`SHOP_COST`), with rack 1; racks 2 and 3 cost 200g and 300g; 5 swords a rack. Every 30 s each racked sword
  has a 5% chance to sell for 80% of its price (`SHOP_TICK`, `SHOP_CHANCE`, `SHOP_CUT`): gold only, no REP, popularity or xp.
- **Ledger** (the scroll on the counter): the day's sales with their gold (shop sales marked), and the waiting list.
- **Decor:** the banner (Garric's reward) is placed with BUILD on the counter, shop or bedroom. Decor is cosmetic.

## 7. Days, the cave and the tutorial

### Days

- **Bed:** in the bedroom, "Go to bed?" YES fades to "Day n", adds a day to the calendar and puts 5 fresh seams in the cave.
  Nothing else changes with the day (no costs, no customer or market refresh). The day shows only on the bedroom calendar.

### The cave and ores

- **Seams:** on a normal day 5 seams (iron, copper, manganese, aluminium, nickel), each `NODE_YIELD` 7 + Bounty ranks, 1 ore
  a swing; tin and zinc have none. Drag the pickaxe onto a seam and it swings by itself.
- **Tutorial caves:** the first (Part 2) 3 iron + 2 manganese; Day 2 `FTUE.day2Cave` (2 nickel); Day 3 `FTUE.day3Cave`
  (nickel 9, iron 20, manganese 20, copper 17, aluminium 15), 2-3 ore a swing. Day 3 gathering waits for a Pickaxe point (R23).
- **Ore chain:** in the tutorial the dragon gives exactly the next sword's ores after each sale (`FTUE.oreChain`); the bag
  starts with 2 iron + 2 manganese (`FTUE.oreStart`).

### The tutorial (FTUE)

Six parts over three days; every value in the `FTUE` object; record `specs/2026-10-07-ftue-v3-rework.md`, reworked to the
loop in `specs/2026-10-23-ftue-smelter-rework-plan.md`; every line in play order in
`specs/2026-09-15-looptest-landscape-tutorial-script.md`.

| Part | Day | Tutorial customer | Gameplay customers | Teaches |
|---|---|---|---|---|
| 1 | 1 | Bram (TC1): the first sword | balanced Longsword, Broadsword (the dragon gives the gold, the player buys, R96), Katana (the player buys) | the whole loop, the counter, quests, the bell, the market, the craft book (GC2's gate, R105) |
| 2 | 1 | TC2 ("a good one"), TC3 the adventurer (fire) | none | grinding, recording a craft, the cave, hazards, a second trait route |
| 3 | 2 | none | durable Shortsword; fire Longsword, Broadsword, Katana | the map window, nickel, the craft book (CRAFT 1) |
| 4 | 2 | TC4 (Epic durable), TC5 (gale) | Weak balanced Longsword (between TC4 and TC5, R95); gale Katana + fire Claymore (COME LATER, after TC5) | the ladle and tiers, storing a metal, a Weak stop, the waiting list |
| 5 | 2 | Bram returns (swift Dagger) | gale Longsword | sharpening, the diary |
| 6 | 2-3 | Garric (TC6, graded) | none | the design desk, decor (the banner), the skill tree; D140 ends the FTUE |

Garric grades his balanced sword: grade 3 = Epic, designed and sharpened (10g, the 6 bonus parts, the banner); grade 1 = Weak,
plain (the banner only, no pay); else grade 2 (10g, the banner). After D140 (`FTUE_ST.done`) free play opens everything.

## 8. UI / UX

- **Frame:** a fixed 1080 x 600 landscape frame (map on top, bench below, the rail on the right), fitted to the phone by the
  viewport width; full screen on the first tap; a "Turn your phone sideways" gate in portrait (`specs/2026-09-21-mobile-viewport-fit.md`).
- **Screens** (`SCREENS`): forge (centre); bedroom above (bed, calendar, pet the dragon); basement below (design desk,
  sharpening wheel, work zone); customer counter to the left (portrait, SELL / DENY / COME LATER, the shelf with the craft book,
  the bell, the ledger scroll, the rotary market); shop left of the counter (3 racks); cave to the right (seams, pickaxe).
  Arrows and arrow keys move between them; an arrow that leads nowhere is hidden.
- **Forge:** the smelter (bellows, gate, ladle), grindstone, anvil, bucket, the dragon, and the craft frame (blade pips, X,
  inkpot to record, craft book, pulley ring that opens and shuts it, R25-R31). The map pans and zooms.
- **Rail:** the skill tree button (level, points, xp bar), gold, reputation, popularity, the inventory, the diary and quest
  basket, the gear menu.
- **Inventory:** tabs Ingredients (ores), Ingots (stored metals), Swords, Decor; each tab appears when first used (R33); 15 cells
  shown, growing in rows of 3. Drag targets: ore to grindstone or smelter, metal to the rail (stored), ingot to the anvil, sword
  to the work zone, counter or a rack.
- **Craft book** (`RECIPES`): a page per trait set (more pages as `#2`, `#3`), capped at `FTUE.recipePages` 3 + rewarded pages.
  The first discovery records itself; after that the inkpot updates a page or records a new one (in the tutorial the compare
  window has no Record new, R100). A page shows the traits, tier,
  description, sword art, ores, process and shapes, with CRAFT 1, CONTINUE FROM HERE, ERASE and a default design.
- **Windows:** trait discovered (first find, with the burst), sword crafted, reward (the dragon shown over it, his line below,
  R53), shape, market, skill tree, quests, diary, ledger and waiting list, end of day, Garric's confirm, the menu.
- **Dialogue:** the dragon's lines type word by word (R32) in a bubble by him (the bench on the forge, the screen bubble
  elsewhere, an icon bubble in the basement windows). OK goes on, X closes; a tap on the bubble only finishes the typing - only
  its button moves it on (R57). Customers' lines type in the counter box or the named panel; the player answers with reply
  buttons. Sword names, tiers, "sharpened" and "customized" are bold and coloured (`DLG_HL`, R61). Pointers: a drag arrow, a
  glow or blink on the control, drag gestures, a dark screen with cut-outs, and a ring on a map trait (`tutSpot`, which a
  finished sword clears, R62).
- **Effects:** swing effects (§5), the trait burst, the smelter's lit states, quench smoke and mist, the bell's swing, hearts
  when the dragon is petted, toasts. No audio.
- **Toasts (R90, on trial):** said by the dragon for 4 s (`DTOAST`): in a line's place (the line returns as it was), in his
  bubble, or where he is not visible in an icon bubble at the sharpening window's place. Tap closes; a new line replaces it.
  30 are cut (`toastCut`); the shop-rack sale and the PART buttons keep the old top toast (`plainToast`). Record:
  `specs/2026-11-05-dragon-toasts.md`.
- **Gear menu, SETTINGS (R97):** MAP: FIVE PARTS (`MAP_parts.webp`) and MAP: TRAITS (`MAP_parts2.webp`) reopen the tutorial's
  map windows (`MENU_MAPS`), each offered once shown (`FTUE_ST.seenParts` / `seenParts2`; part 3+ / 4+ for older saves), both
  after the tutorial and in free play; then the +1000 gold cheat and BACK.
- **Save:** manual, from the gear menu (SAVE / LOAD GAME / NEW GAME), `localStorage` `swordforge.save.v1` version 9. It keeps
  gold, swords, ingots, ores, recipes, skills, quests, the map's fog and traits, and `FTUE_ST`, but not the tutorial stage
  (`TUT_STAGE`) or the dialogue; there is no autosave and no continue on boot.
- **Intro:** four pictures (`FTUE.intro`: The Fall, Exile, A New Hearth, The Anvil Awaits), tap to go on, SKIP; then D1.
- **Test aids that ship:** SKIP HAMMER and PART 1-6 / GAME (bottom left, outside the frame), the map's fog button, +1000 gold in
  the settings, `?freeplay` (tutorial done, 20 of each ore, 500g), `?nointro`.

## 9. Known discrepancies & open questions

- **Free-play customers take any sword:** only tutorial orders are checked (`orderMatches`); a free-play customer who asks for
  a trait pays full price for any sword.
- **Reputation only rises**, so from the 11th sale every price is x1.2.
- **Days are cosmetic** beyond the cave's seams.
- **Trait values from older positions:** Fire's value is fixed at its pre-R24 position (48) and Balanced keeps its old value.
- **Save gaps:** `TUT_STAGE` and the dialogue are not saved, so a reload mid-part loses the tutorial position.
- **Dead calls:** `bumpQuest` for discover3 / epic5 / openShop (no such quests); `ftueBulkStep` points at a `#cbCraft5` that
  does not exist (no current order has qty > 1).
- **Stand-in art:** the fire Katana wears the balanced Katana blade, Durable swords the balanced blade and parts; Katana,
  Dagger and Claymore borrow mid-blades in the minigame.
- **Naming:** the FTUE record's GC9 is Part 4's two-sword waiting order; a config comment calls Part 5's gale Longsword GC9.
- **Left in the file, unused:** the old forge hammer and mug (hidden by CSS). The old loop is kept in
  `Swordforge_looptest_landscape_hammerloop.html`; the portrait `Swordforge_new_looptest.html` is on an older loop and never
  edited.
- **Review items set aside (2026-11-02):** see `HANDOFF.md`.
