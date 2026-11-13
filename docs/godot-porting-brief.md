# Sword Forge: porting brief for the Godot version

For the developer building Sword Forge in Godot. Written 2026-11-13 against `main` at `f566ebe` (R0-R118). Line numbers drift;
search for the names in `code font` instead.

**Port this build:** `Swordforge_looptest_landscape.html` (the smelter loop and the six-part tutorial). Play it at
https://lila-games-github.github.io/sword-forge/Swordforge_looptest_landscape.html (it has the cheat bar; the PART buttons and the
CUSTOMER dropdown jump to any point of the tutorial). Do not port the older builds (`index.html` redirects, `v1.html`,
`swordforgeV2.html`, `Swordforge_new_looptest.html`, `*_hammerloop.html`, `*_pathtest.html`) or `Swordforge_external.html`
(a generated copy of the main build with the cheats off).

## 1. Read first

1. `GDD.md`: the whole game in one document, with most of the numbers.
2. This brief: where every number and rule sits in the build.
3. `specs/2026-09-15-looptest-landscape-tutorial-script.md`: every dialogue line in play order.
4. `HANDOFF.md`, "Current state": what is unfinished, on trial or waiting on the owner. Do not copy those as final.

The other specs go deeper on one system each; the tables below name the one to open when the GDD is not enough.

## 2. How the HTML build is organised

- **One file**, about 11,850 lines: CSS, then markup, then two scripts. The first script only fits the page to a phone screen
  (web-only, skip it). The second holds the whole game.
- **Plain global state**, no framework. Data tables are `const` objects near the code that uses them; the game state is global
  variables (`segs`, `sword`, `pull`, `melt`, `ORE_COUNT`, `GOLD`, `INV`, `RECIPES`, `FTUE_ST`, `TUT_STAGE`, `CUSTOMER` ...).
- **The main loop** is `tick(now)` (one call per animation frame). It drives the bellows' travel, the ladle, hazards, the
  smelter's heat, the tutorial's per-frame checks (`TUT_SKIP`, `ftueRefillTick`) and the guides.
- **Spaces.** The screen is a fixed 1080 x 600 frame. The trait map is a world of 2800 x 1960 units (`WORLD_W`, `WORLD_H`)
  shown through a pannable, zoomable view (`view`, `INIT_W`, `MIN_W`, `MAX_W`). Screen props are placed as fractions or
  percentages of their zone (`LAYOUT.landscape`, `SCREEN_PROPS`, `CRAFT_FRAME`), so they map to Godot anchors directly.
- **Screens** are a graph (`SCREENS`): forge, counter (`customer`), shop, cave, bedroom, basement; arrows and arrow keys move
  along it.
- **Windows** (`.sf-modal`, about 25 of them) sit over the frame: shape, hammer, crafted, craft book, market, reward, trait card,
  compare, quests, ledger, diary, skill tree, menu, intro and others.

## 3. Data tables, by system

Each row: the table (search `const NAME`), what it holds, and the doc that explains it.

### Crafting loop

| Table | What it holds | Doc |
|---|---|---|
| `ORES`, `ORE_BY` | The 7 metals; each has an SVG path `d` (its route shape on the map, from the sword's position outwards) | `specs/2026-10-28-rotated-ore-paths-test.md`, GDD §5 |
| `ORE_START`, `FTUE.oreStart` | The starting bag (2 iron, 2 manganese) | `specs/2026-10-07-ftue-v3-rework.md` |
| `GRIND_RATE`, `HEAT_READY`, `HEAT_RISE`, `BASE_HEAT`, `SWORD_SPEED`, `PULL_SPEED`, `HEAT_DECAY`, `CRAWL_MIN`, `GRIND_TURNS`, `ROUTE_FAST` | Grinding (a ground ore draws a shorter route), heat, travel speed | `specs/2026-10-21-smelter-version-loop.md` |
| `SMELT` | The bellows stroke, the gate, the ladle (tilt, dead zone, pull), the hanging blade's pendulum, free-play stock | `specs/2026-10-21-smelter-version-loop.md` |
| `ALIGN_MAX`, `ALIGN_EPIC`, `ALIGN_FINE`, `tierFromDist()` | The tier from the sword's distance to the trait: 9 or less Epic, 20 or less Fine, else Weak | GDD §5 Tiers |
| `TIER_PIPS`, `TIER_RANK`, `BLADE_SLOTS` | 1-2-3 pips for Weak-Fine-Epic, 5 blade slots | GDD §5, R107 in the rework plan |
| `FURNACE_ART` | The smelter's lit-state layers and their fades | rework plan R34-R35 |
| `SM_ENDS_ART`, `SM_ENDS_DEFAULT`, `QUENCH_FX` | Where the hanging blade's handle sits per blade picture; the quench's smoke and mist | smelter loop spec |

### Map, traits, fog, hazards

| Table | What it holds | Doc |
|---|---|---|
| `WORLD_W/H`, `CENTER`, `START`, `REVEAL_R`, `INIT_REVEAL`, `TRAIT_R`, `FOG_EDGE` | The world, the start point, the fog's reveal radii | `specs/2026-08-18-looptest-landscape-map-traits-hazards.md` |
| `TRAITS`, `TRAIT_BY`, `TRAIT_POS` | The 25 traits (id, name, symbol) and their fixed map positions | same; GDD §5 |
| `FTUE.fireAt`, `FTUE.balancedAt` | Tutorial overrides of two trait positions | ftue v3 rework |
| `BOOK_KINDS`, `BOOK_BIG`, `BOOK_GRAB`, `BOOK_R` | The map's tomes (small, large, the great tome) and their exp | map spec |
| `HAZ`, `HAZ_KINDS`, `CORRIDOR_MAJOR/MINOR`, `BLADE_HP_MAX`, `HAZARD_DPS` | Hazard shapes, seeded placement (keeps corridors clear), damage per second, the price floor at low health | `specs/2026-10-01-hazard-integrity.md` |
| `TRAIT_TAP` | Tapping a trait icon on the map opens its card | `specs/2026-10-06-map-trait-links.md` |

Hazards are placed by a seeded generator: moving a trait reshuffles the field (`LEARNINGS.md`, 2026-09-19). Port the
generator, not a snapshot of one field.

### Shaping and finishing

| Table | What it holds | Doc |
|---|---|---|
| `HM_HITS` | The hammering minigame: strike points, accuracy bands, the forging grade, and the price per accuracy percent (`price`, `hmAccMul()`) | `specs/2026-10-01-hammer-hit-points.md` |
| `HM_RIG`, `HM_FORGE`, `HM_MID_ALIAS`, `HM_ACC_TOP`, `HM_TAP_PX`, `HM_DOWN` | The minigame scene's layout, heat, stand-in mid-blades | same |
| `SHAPE_IC`, `MARKET.order`, `FTUE.shapes`, `FTUE.startShape` | The shapes, which shapes each trait gets free, the free Shortsword | ftue v3 rework, GDD §6 |
| `SH_ZONE_LO/HI`, `SH_GAIN`, `SH_LEN`, `SHARP_BONUS` | Sharpening: the target band, speed, the +7g | GDD §6 Finishing |
| `DD_SETS`, `DD_SKIN_OF`, `DD_BLADES`, `BLADE_BORROW`, `DD_BONUS`, `DD_EXTRA`, `DD_ALIAS`, `DESIGN_BONUS` | The design desk's part sets per trait skin, Garric's bonus parts, the +7g | GDD §6 Finishing |
| `SWING_FX`, `FX_PLAIN_TRAITS`, `FX_RAMP`, `ACQ_FX` | Sword swing effects per trait, the trait-discovery burst | `specs/2026-10-30-fire-swing-fx.md`, `specs/2026-10-30-trait-discovery-burst.md` |

### Economy

| Table | What it holds | Doc |
|---|---|---|
| `swordBase()`, `swordPriceParts()` | The price: trait values + tier bonus, x popularity x forging x health x trade skill x reputation, + sharpen + design | GDD §7 Price |
| `QUALITY_BONUS`, `POP_GAIN`, `POP_CAP`, `POP_STEP` | Tier bonus to value, popularity gain per sale and its multiplier | GDD §7 |
| `MARKET`, `marketPrice()`, `MARKET_NEW`, `MK_ROT`, `MARKET_DESC` | Blueprint prices (50 x (trait index + shape step + 1)), the rotary market, the 250 blueprint descriptions | `specs/2026-10-29-rotary-market.md` |
| `RACKS`, `RACK_CAP`, `SHOP_COST`, `RACK_COST`, `SHOP_TICK`, `SHOP_CHANCE`, `SHOP_CUT` | The shop's racks and passive sales | GDD §7 The shop |
| `CUST_POOL`, `CUST_ASKS`, `CUST_ANY`, `CUST_THANKS`, `CUST_DISCOVERED`, `CUST_BYE_MS` | Free-play customers: faces, asks, thank-you lines by tier, 80% known traits | GDD §7 Customers |
| `GARRIC_TIP`, `FTUE.garricRewards` | Garric's grading rewards | GDD §9 |

### Progression

| Table | What it holds | Doc |
|---|---|---|
| `XP_PER_LEVEL`, `XP_CRAFT`, `XP_SELL`, `XP_ORE_NODE`, `XP_QUEST` | Exp | GDD §8 |
| `SKILLS`, `SKILL_BY`, `ST_NODES`, `SM_EXTRA_PCT`, `SM_BIG_PER_RANK` | The skill tree (each skill's ranks and effect) and the node positions | `specs/2026-10-06-skill-tree-trade-ore.md` |
| `QUESTS`, `QUEST_CRAFT`, `QUEST_REWARD`, `FTUE.preQuests`, `FTUE.quests` | The quest list | GDD §8 Quests |
| `CAVE_METALS`, `CAVE_SPOTS`, `NODE_YIELD`, `PICK_SWING`, `FTUE.day2Cave`, `FTUE.day3Cave`, `FTUE.day2Swing` | The cave's seams and the pickaxe | GDD §8 The cave |
| `DAY_IN`, `DAY_HOLD`, `DAY_OUT`, `advanceDay()` | The day change (bed, fade, restock) | GDD §8 Days |
| `RECIPES`, `SWORD_DESC`, `CB_MARK_SLOTS`, `FTUE.recipePages` | The craft book (recipes are made at run time); 24 of 25 descriptions are placeholders | GDD §8 The craft book |

### Screens, layout, art

| Table | What it holds | Doc |
|---|---|---|
| `SCREENS`, `SCREEN_TAB`, `SCREEN_ART`, `SCREEN_HOTS`, `SCREEN_UI`, `SCREEN_PROPS`, `PROP_OPQ`, `PROP_ACTS` | The screen graph, each screen's art, tap spots and props | GDD §10 |
| `LAYOUT` (this build runs `landscape`), `PROP_ELS`, `FRAME_BOX_SEL` | The forge's props as fractions of the bench | `specs/2026-10-28-forge-screen-new-look.md` |
| `CRAFT_FRAME`, `RAIL_ART`, `COUNTER_UI`, `COUNTER_SWORD`, `COUNTER_ZONE`, `WORK_TABLE`, `WORK_SWORD` | The craft window, the rail, the counter | same |
| `DECOR_SCREENS`, `FTUE.decor` | Where decor can be placed | GDD §7 Decor |
| `DIARY_SLOTS`, `DIARY_TABS`, `QS_*`, `LB_*`, `RW_*` | Diary, quest, ledger and reward window layouts | GDD §10 |

Art: `assets/`, folder by folder in `CLAUDE.md` ("Assets"). The game loads the `.webp` files; `.png` beside them are sources.
Layered art that must stay registered: the hammer scene layers (all 1877 x 1025), the smelter's lit layers (638 x 775), the
sharpening wheel's two frames (1701 x 1536).

### Tutorial (FTUE)

| Table | What it holds | Doc |
|---|---|---|
| `FTUE` | Every recorded tutorial value: `parts` (each part's orders and rewards), `oreChain` (the ores per order), `replies` (the player's answers), `intro`, `pipRows`, `ladleZoom`, `garricRewards` and more | `specs/2026-10-07-ftue-v3-rework.md`, the rework plan |
| `DIALOGUE` | The 216 lines (D1-D140), permanent ids | the tutorial script |
| `TUT_STAGE`, `FTUE_ST`, `SAY_SEQ`, `SAY_OPENING` | The tutorial's position (a stage string) and progress flags | ftue v3 rework |
| `SAY_AFTER`, `SAY_THEN` | What happens when a line closes | rework plan |
| `SAY_NO_X`, `SAY_GO_GLOW`, `SAY_GO_MORE`, `SAY_PAUSE_ONE` | Which lines have no close button, a lit OK, or pause the game | rework plan R55-R57 |
| `SAY_DARK`, `SAY_DARK_CUT`, `STAGE_DARK`, `HM_SAY_DARK` | The dark overlay with cut-outs: per line and per stage | rework plan (R71, R99, R107, R110, R111) |
| `TUT_SKIP`, `TUT_SKIP_SCREEN`, `CRAFT_REWIND`, `FIRST_SWORD_STAGES` | Per-frame catch-up (the player acted before the guide), and where a refilled craft restarts | ftue v3 rework |
| `TUT_DRAG_GESTURE`, `DLG_HL` | Drag hints; coloured sword names in lines | `specs/2026-10-30-dialogue-sword-names.md` |
| `DTOAST` | Game messages said by the dragon (on trial) | `specs/2026-11-05-dragon-toasts.md` |
| `specs/2026-11-10-ftue-customer-list.md` | Every tutorial customer: request, rewards, ores | (a doc, not a table) |

### Saving

`SAVE_KEY`, `SAVE_V`, `saveBlob()` and `menuSave()`: the save is a JSON snapshot in browser storage; `saveBlob()` lists what is
kept (GDD §13). A reload mid-part loses the tutorial's position (`TUT_STAGE` is not saved; open in `HANDOFF.md`).

## 4. Behaviour that lives only in code

Open these functions when the docs are not enough:

| Function | What it does |
|---|---|
| `addSegment()`, `segPoint()`, `routeEnd()` | Builds the route from ore paths (scaled by grind) and walks the sword along it; `pull` is the ladle's offset |
| `tick()` | The frame loop: travel, heat, hazards, ladle (`smLadleTick()`), guides |
| `tierFromDist()` | Tier from distance |
| `hmQualOf()`, `hmAccMul()` | Forging grade and price multiplier from the strikes |
| `swordBase()`, `swordPriceParts()`, `sellCounter()` | Price and sale |
| `marketPrice()`, `marketRow()` | Blueprint price and state |
| `reveal()`, `revealR()` | Fog reveal |
| `ftueGpcArrive()`, `ftueOreReward()`, `ftueRefillTick()` | Tutorial orders, ore windows, the refill |

## 5. Do not port

- Cheats and test aids: everything behind `DEV` (the cheat bar, `CUST_JUMPS`, `ftuePart`, +1000 gold, the fog eye, URL options,
  the W wireframe). Record: `specs/2026-11-12-external-build.md`. Godot may want its own debug menu instead.
- Web-only code: the mobile-fit script, the asset diet, the CSS stacking fixes for the dark overlay (`tutHole` clip paths,
  z-index lifts). In Godot the dark with cut-outs is one shader or a mask, not a stack of DOM layers.
- Dead code: the forge hammer and mug (hidden), `ORE_TRAIT` (no longer used), the `CRAFT 5` references in `ftueBulkStep()`,
  `MK_ROT.laterMs` (unused since R83).

## 6. Not final (check `HANDOFF.md` before copying)

- Stand-in art: the fire and gale Katana, the fire Claymore and Durable blades, some minigame mid-blades.
- 24 placeholder sword descriptions (`SWORD_DESC`).
- R90 (the dragon's toasts) is on trial; D107d's wording is waiting on the owner.

## 7. The tests as a checklist

`tooling/<suite>/<suite>.test.mjs` read the build and check its tables against the specs: `ftue` (1074 checks, the tutorial),
`smelter` (146, the loop and effects), `market` (84), `hazard` (40), `hammer` (56), `skills` (18), `map` (17). Their check names
are a list of the rules the Godot version must keep. Run them with Node: `node tooling/ftue/ftue.test.mjs`.
