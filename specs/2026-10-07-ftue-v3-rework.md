# FTUE v3 rework: tracker

Status: **planning complete 2026-10-08; all six parts built 2026-10-08 (owner play-test pending).** Opened 2026-10-07. Build: `Swordforge_looptest_landscape.html`.

How this works: the owner explains the new FTUE one part at a time. For each part this file records
what the owner wants, what the current build does, what can be kept, what must change, and any issues,
errors or bugs found. No code changes until the owner approves a part. When a part is approved, its
values go into the `FTUE` object and `tooling/ftue/ftue.test.mjs` asserts them (test first).

The current design record is `specs/2026-09-29-tutorial-parts-plan.md` (FTUE v2, r199-r230). It stays
canon until this file replaces it part by part.

Terms: **TC** = tutorial customer (scripted). **GPC** = gameplay customer (random portrait, real order).
**D-ids** are permanent dialogue ids (`DIALOGUE` map); new ids go beside their neighbours.

## Baseline: the FTUE as built today (v2, after r230)

| Part | Tutorial step | Gameplay step | Rewards |
| --- | --- | --- | --- |
| 1 | Bram (TC1): first balanced sword, sale (D1-D26). Quest list. Bell tutorial (D27-D28). | GPC1, GPC2: one balanced sword each. | Bram: shop banner. GPC1: Longsword blueprint. GPC2: Broadsword blueprint + grindstone. |
| 2 | TC2: grinding and updating the recipe (D29, D31-D43). | GPC3: 5 balanced swords in one order (bulk craft). | TC2: +5 recipe pages. GPC3: design desk. |
| 3 | TC3: fire sword (D59-D63), cave and ore (D64-D65), fire craft (D66-D78) with hazard lines D69a-d, design desk (D79-D85), Day 1 ends (D86-D88), skill tree (D89-D94). | GPC4 fire, GPC5 balanced, GPC6 fire. | TC3: balanced parts x3 + fire parts x3 + fire Longsword blueprint. GPC4: fire Broadsword blueprint. GPC6: fire parts x3. |
| 4 | TC4: gale sword; tier alignment (D97), storing a metal (D99), swift and gale crafts (D95-D107). | GPC7 gale, GPC8 fire. | TC4: gale Longsword blueprint + gale parts x3. GPC7: gale Rapier blueprint + gale parts x3. |
| 5 | TC5: Bram returns (D110-D113), swift sword sharpened with the stored ingot, sharpening (D48-D55), diary (D114-D117). | GPC9 gale, GPC10 swift. | Bram: diary. GPC9: swift Dagger blueprint. GPC10: swift parts x3. |
| 6 | TC6: Garric (D120-D140) ends the FTUE; sell confirmation (r214). | none | By grade: 1 nothing, 2 10g tip, 3 tip + balanced parts 5-6 (r212). |

Systems the FTUE relies on (each a possible keep/change point):
- **Hammer minigame on hit points** (r209, `HM_HITS`), quality bands Masterwork/Good/Crude change the price.
- **Hazard health** (r215-r217, `HAZ`): health lowers the price; 3+ zones drop a tier.
- **Skill tree** (r218, `SKILLS`): trading, ore extraction, pickaxe, ore bountifulness.
- **Map**: trait icons open the craft book (r220); the customer's trait is ringed (r221); path tail
  hidden until the grinder (r222); soft fog edge (r230).
- **Guidance**: ore arrows follow the metal (r223), the turn arrow on the grinder (r229), the held
  "+50" for the first book (r224).
- **Counter**: no DENY during the FTUE (r228); Bram's reply after D22 (r227).
- **Test aids**: PART 1-6 buttons and `ftuePart(n)`.

Uncommitted at the start of this tracker: r228-r230 (working tree on `sword-forge/fix-hazard-lines`,
which also holds unpushed commits b999937 and df3566a).

## Part 1

### Owner wants (2026-10-07)

- The opening is unchanged: the first balanced sword, the sale to Bram, the quest list, the bell
  tutorial (D1-D28).
- **GC1** asks for a **balanced Longsword**. **GC2** asks for a **balanced Broadsword**. (Today both ask
  for "balanced" with any shape.)
- **GC3 is new** in part 1 and asks for a **balanced Katana**.
- The player is guided to a new **MARKET** button, finds the balanced Katana blueprint there, and is
  guided to buy it.
- From now on **shape blueprints are bought in the market**; all shapes are on sale there.
- **Layout:** the MARKET button goes beside SKILL TREE; SKILL TREE becomes half its width and MARKET
  takes the other half.

### Current build

- **Orders have no shape.** A GPC order is `{ trait, qty }` (`FTUE.parts[n].gpc`). `ftueGpcArrive()`
  stores only `tid`, and `sellCounter()` checks only the trait. The ask lines (`CUST_ASKS`) name a
  trait only ("Do you have a Balanced sword?").
- **Blueprints are rewards, per trait and shape** (`FTUE_ST.shapes['balanced:Longsword']`).
  Shortsword is always open (`FTUE.startShape`). Part 1 rewards: Bram the banner, GPC1 the balanced
  Longsword blueprint, GPC2 the balanced Broadsword blueprint and the grindstone.
- **Shapes per trait** (`FTUE.shapes`): balanced and fire Shortsword/Longsword/Broadsword, gale
  Shortsword/Longsword/Rapier, swift Shortsword/Longsword/Dagger. **No Katana anywhere.**
- **Katana art:** only `assets/sword-parts/blades/balanced_katana_blade.webp` (and its .png) exists. It is
  not referenced by the code. There is no Katana mid-blade for the hammer minigame and no icon.
- **Shape picker** (`shapeGrid()`) builds one button per shape in `FTUE.shapes[trait]`, with a lock
  and the toast "Locked: earn the ... blueprint".
- **SKILL TREE** (`#skillBtn`) is 125x50 px in the 1080x600 frame, beside the gear (59 px), gap 13 px.
  Its label "SKILL TREE" alone is 87 px wide; the button also holds the level line and the xp bar.
  It is visible from the start of the game.
- **There is no market, and nothing to spend gold on in part 1.** Gold today: 0 at the start,
  Bram's sale, the two pre-completed quests (+10g each), then the GPC sales. `ftuePart(2)` guesses 60g
  at the end of part 1; the real figure has not been measured.

### Keep

- D1-D28, Bram, the quest list, the bell, the banner reward and the build mode.
- The GPC machinery (`ftueGpcArrive`, `ftueGpcSold`, the reward window), with a shape added to the order.
- The blueprint lock in the shape picker (`ftueShapeOpen`), with "earn" changed to "buy".

### Change (first draft, superseded by "Change (revised after the decisions)" below)

1. **Orders get a shape:** `{ trait, shape, qty }`. The customer stores it, the ask line names it ("a
   Balanced Longsword"), and `sellCounter()` refuses a wrong shape with a toast, as it does for a
   wrong trait.
2. **Part 1 gets 3 GPCs:** Longsword, Broadsword, Katana.
3. **New shape: Katana** for balanced (`FTUE.shapes.balanced` gets a 4th shape), its icon,
   `bladeFor()` already finds `balanced_katana_blade`, and the hammer minigame borrows a mid-blade
   through `HM_MID_ALIAS` until a Katana mid-blade exists.
4. **Market:** a new button, a new window that lists the blueprints with prices, a buy action
   (gold down, `FTUE_ST.shapes[key]=true`), and the same lock state as the shape picker.
5. **Layout:** SKILL TREE and MARKET share the space SKILL TREE has now (about 56 px each).
6. **Guidance for GC3:** new dragon lines (new D-ids beside D28b) and a new stage: GC3 asks, the dragon
   points at MARKET, then the Katana row, then BUY, then the craft as usual.
7. **Test aid:** `ftuePart(2)` and later must grant whatever blueprints the new part 1 ends with.

### Issues, errors, bugs

- **I1. GC1 and GC2 cannot be served as things stand.** The Longsword and Broadsword blueprints are
  today the rewards *for* GPC1 and GPC2, given after the sale. A player cannot make a Longsword
  for GC1 if the Longsword blueprint only arrives after GC1 is served. Something must give the player
  these two blueprints first (see Q2).
- **I2. D28b is wrong for GC1.** "Make a balanced sword like the last one." The last one was a
  Shortsword; GC1 now wants a Longsword.
- **I3. SKILL TREE at half width does not fit its label.** 56 px is less than the 87 px label. It
  needs two lines ("SKILL / TREE") at a smaller size, or a shorter label, and the level line and xp bar
  must still fit in 50 px. Phone layouts must be rechecked (`tooling/mobile-fit`).
- **I4. The shape picker was laid out for 3 shapes.** Balanced with Katana has 4; the grid must be
  checked at 4.
- **I5. Price and gold are unknown.** The Katana blueprint must be affordable when GC3 arrives, after
  4 sales and 2 quests. The real gold at that point must be measured in play before a price is set.
- **I6. Katana art is incomplete.** Blade art exists; hammer mid-blade, picker icon, and fire/gale/swift
  Katana blades do not. The rack/counter lay-flat views use the blade art and should work, but must be
  checked with the Katana's proportions.
- **I7. Later parts depend on part 1's blueprints.** Parts 3-5 give fire, gale and swift blueprints as
  rewards. If all shapes move to the market (Q4), those reward lists change.

### Open questions

- **Q1. Blueprint scope.** Is a blueprint per **trait and shape** ("balanced Katana", as today), or per
  **shape** for every trait ("Katana" opens the Katana for every trait)?
- **Q2. GC1 and GC2's shapes (I1).** How does the player get the Longsword and Broadsword blueprints?
  A. Bram's sale gives the Longsword blueprint, GC1's gives the Broadsword blueprint, and GC2's gives
     the grindstone.
  B. The player starts with Shortsword, Longsword and Broadsword open for balanced; only the Katana is
     bought.
  C. The market opens at GC1, and the player buys the Longsword and then the Broadsword too (3 guided
     purchases).
- **Q3. Part 1 rewards.** With 3 GCs, what does each one give? Is the grindstone still a part 1 reward,
  and after which GC?
- **Q4. Market contents.** Which blueprints are on sale, and at what prices? Do the later blueprint
  rewards (fire Longsword/Broadsword, gale Longsword/Rapier, swift Dagger) move to the market, or stay
  rewards? Does every trait get a Katana?
- **Q5. Market access.** Is MARKET visible from the start (locked until GC3), or does it appear at GC3?
  Does it sell anything besides blueprints?
- **Q6. Later orders.** Do the GPC orders in parts 2-5 also name a shape (for example, GPC3's 5 swords)?
- **Q7. The guiding lines.** Do you write the dragon's market lines, or should I draft them?

### Decisions (owner, 2026-10-07)

- **D1. Blueprints are per trait and shape.** Buying the balanced Katana leaves the fire Katana locked.
- **D2. Every blueprint costs 50g.**
- **D3 (superseded by D10).** Part 1 blueprints: Bram's sale gives the balanced **Longsword** blueprint; GC1's sale gives the
  balanced **Broadsword** blueprint. GC2 and GC3 give nothing.
- **D4. Moved out of part 1:** the shop banner moves to **part 6**; the grindstone moves to **part 2**.
- **D5. The trait and shape table** (owner's chart, 2026-10-07). Five traits; **Durable is new to the
  FTUE** (it exists on the map today, but has no shapes, skin or parts).

  | Shape | Balanced | Fire | Swift | Gale | Durable |
  | --- | --- | --- | --- | --- | --- |
  | Shortsword | base | base | base | base | base |
  | Longsword | base | base | base | base | base |
  | Broadsword | base | base | - | - | base |
  | Rapier | - | - | market | base | - |
  | Dagger | market | market | base | market | market |
  | Katana | market | market | market | market | market |
  | Cutlass | market | market | market | market | market |
  | Machete | market | market | market | market | market |
  | Saber | market | market | market | market | market |
  | Scimitar | market | market | market | market | market |
  | Claymore | market | market | market | market | market |

  "base" = a purple box in the chart (the trait's own set, as `FTUE.shapes` has today, plus Durable).
  "market" = a pink box. 11 shapes in all, 10 per trait: 50 blueprints, 45 of them not the free Shortsword.
  See Q8 for what the colours mean.
- **D6. MARKET is visible from the start.** Before it opens, a click shows "Play more to unlock".
- **D7. Every order names a shape** (details for parts 2-6 to come).
- **D8. D28b changes** (draft below). **The dragon's market lines are mine to draft** (below).
- **D9. SKILL TREE shows a tree icon** instead of the words, which also solves I3 (the label did not fit
  at half width).

### Drafted lines, round 1 (superseded by round 2 below)

New ids sit beside D28b (D28c-D28f), per the D-id rule.

| Id | When | Line |
| --- | --- | --- |
| D28b (changed) | GC1 asks | "Now you try! This customer wants a balanced Longsword. Pick the Longsword when you shape the blade." |
| D28c | GC3 asks for the Katana | "A Katana? We don't have that blueprint yet. Let's visit the market!" |
| D28d | The market window opens | "Every shape has its own blueprint. Buy the Balanced Katana for 50 gold." |
| D28e | After the purchase | "Now we can make a Katana! Craft a balanced sword and pick the Katana shape." |
| (toast) | MARKET clicked before it opens | "Play more to unlock" |

### Change (revised after D1-D9; rewards and lines superseded by D10-D14)

1. **Orders:** `{ trait, shape, qty }`. The ask line names both ("Do you have a Balanced Katana?").
   `sellCounter()` refuses a wrong shape with "They asked for a Balanced Katana".
2. **Part 1 GCs:** GC1 balanced Longsword, GC2 balanced Broadsword, GC3 balanced Katana.
   Rewards: Bram `[balanced Longsword blueprint]`, GC1 `[balanced Broadsword blueprint]`, GC2 `[]`,
   GC3 `[]`.
3. **Bram's reward window** shows the Longsword blueprint in place of the banner.
4. **`FTUE.shapes`** grows to the D5 table, and Durable is added as a trait key (`ftueTraitKey()` only
   knows fire, gale and swift today, so a Durable blade would be read as balanced).
5. **Market:** a new window with the 50 blueprints by trait, a lock state per row, a price of 50g and
   BUY. Locked before GC3 ("Play more to unlock"); open from GC3 on. A purchase sets
   `FTUE_ST.shapes[trait:shape]` and takes the gold.
6. **Layout:** gear | SKILL TREE (tree icon, level line, xp bar) | MARKET, in the row the gear and SKILL TREE
   use today.
7. **GC3 guidance:** stage `p1-market`: D28c, pointer at MARKET, D28d, pointer at the Balanced Katana's
   BUY, D28e, then the craft as usual. The shape picker's lock toast says "buy" instead of "earn".
8. **Shape picker** with up to 10 shapes per trait (it is laid out for 3).
9. **Fallback art:** `bladeFor()` already uses the balanced blade when a trait has no blade for the shape;
   the hammer minigame uses `HM_MID_ALIAS` for shapes with no mid-blade.
10. **Test aid:** `ftuePart(n)` grants the new part 1 blueprints (balanced Longsword, Broadsword, Katana).

### More issues (after the decisions)

- **I8. Gold may be short at GC3.** One balanced sword sells for 9g (Weak, Crude) to 28g (Epic,
  Masterwork); a Fine, Good one is 17g (measured in the build with `swordBase()`). Before GC3 the player
  has 3 sales (Bram, GC1, GC2) and 2 quests (+20g): **47g at worst**, about 71g for Fine, Good swords. At
  worst the player cannot buy the 50g Katana the tutorial is pointing at. Proposal: as GC3 arrives,
  top the gold up to 50g if it is short (the same idea as `ensureOre`), silently. Alternative: a lower
  price for the first purchase only.
- **I9. Durable has no FTUE support:** no blade skin (`DD_BLADES`), no design desk parts, no customer
  orders, no trait key. Its chart column needs all of these when it is used.
- **I10. 10 shapes in the shape picker.** Most will be locked at first. The picker needs a grid that
  holds 10 buttons at phone size, or it lists only the open shapes plus a "more in the market" link.
- **I11. The hammer minigame has mid-blades for 3 shapes only.** 7 more shapes borrow one until art lands.
- **I12. The grindstone in part 2.** Today TC2's grinding lesson starts with the grindstone already on the
  bench (GPC2 gave it). Moved to part 2, it must arrive **before** D29-D43. Proposal: TC2's arrival
  opens the reward window with the grindstone, then D29.
- **I13. The banner in part 6.** Which moment gives it (Garric's arrival, his sale, or every grade)? See Q9.
  Build mode (placing decor) has nothing to place until then.
- **I14. r222 (the path tail hidden until the grinder) and the turn arrow (r229)** key on the grindstone
  flags; moving the grindstone to part 2 keeps them correct, but they must be rechecked.

### Open questions (round 2)

- **Q8. The chart's colours.** Is my reading right: purple = the trait's base shapes, given as rewards
  (as Bram's Longsword and GC1's Broadsword are), pink = sold in the market? Or does the market sell
  every shape in the chart, purple included?
- **Q9. The banner in part 6:** after which moment (see I13)?
- **Q10. Gold for the Katana (I8):** top up to 50g at GC3, or something else?
- **Q11. The grindstone (I12):** given as TC2 arrives, before D29?
- **Q12. Market layout:** all 5 traits from the start, or only traits the player has discovered?

### Decisions, round 2 (owner, 2026-10-07)

- **D10 (Q8). Purple = rewarded, pink = market.** A purple ("base") shape is now rewarded by the
  **dragon buying it in the market** with his own gold (unlimited), not by a reward window.
  **This replaces D3:** Bram's sale and GC1's sale no longer give blueprints.
  - **GC1** asks for a balanced Longsword. The dragon guides the player to MARKET, says he will buy it,
    and does: **coins fly from the dragon to the blueprint's lock, then the lock opens.**
  - **GC2** asks for a balanced Broadsword: the same, the dragon buys it.
  - **GC3** asks for a balanced Katana: the dragon guides the player to MARKET, and **the player buys it**
    with their own gold. His line (owner's words): "I helped you a bit. Now you buy your own stuff. I'll
    buy for you when I feel like it. Humph!"
- **D11 (Q9). The banner is Garric's reward in all three outcomes**, after his sale (grade 1 included,
  where he refuses the sword and pays nothing).
- **D12 (Q10). Short of 50g at GC3:** the dragon says "Oh, you don't have enough. Don't worry, I'll
  help." and tops the gold up to 50g.
- **D13 (Q11). The grindstone in part 2:** TC2 asks for the sword first. The player starts the craft
  and finds there is not enough ore; the dragon gives the grindstone; the used ores are reset; the
  player tries again with the grindstone and succeeds. (Recorded here; worked out in part 2.)
- **D14 (Q12). The market shows every shape for every trait.** An undiscovered trait's name shows as
  "?"; its shape names are visible.

### Part 1 flow (after D10-D14)

| Step | What happens | Lines |
| --- | --- | --- |
| 1 | Bram, first balanced Shortsword, sale (D1-D26). **No reward window** (the banner moved to part 6). Quest list, bell (D27-D28). | as today |
| 2 | GC1 asks for a balanced Longsword. Dragon: to the market. Pointer at MARKET. | D28b |
| 3 | Market opens on the Balanced column. Pointer at the Longsword row. The dragon buys it: coins fly from the dragon to the lock, the lock opens. | D28c, D28d |
| 4 | Craft; the shape picker has Longsword open. Sale to GC1. No reward. | - |
| 5 | GC2 asks for a balanced Broadsword. Same as steps 2-4, Broadsword. | D28e, D28f |
| 6 | GC3 asks for a balanced Katana. Pointer at MARKET, then at the Katana's BUY. | D28g |
| 6a | Only if gold < 50g when the market opens: top-up to 50g, with coins flying to the gold counter. | D28h |
| 7 | The player buys it (50g). Craft, sale to GC3. No reward. The bell brings TC2 (part 2). | D28i |

**Market before GC1:** a click shows the toast "Play more to unlock". From GC1 on it is open.

### Drafted lines, round 2 (replaces the round 1 table above)

| Id | When | Line |
| --- | --- | --- |
| D28b (changed) | GC1 asks | "A balanced Longsword? We need its blueprint first. Open the market, I'll buy it for you." |
| D28c | Market open, pointing at the Longsword | "Here it is. Watch this!" |
| D28d | After the coins, lock open | "There, my treat! Now make a balanced sword and pick the Longsword shape." |
| D28e | GC2 asks | "A Broadsword this time. To the market! I'll pay again." |
| D28f | After the coins, lock open | "Done! Pick the Broadsword when you shape the blade." |
| D28g | GC3 asks (owner's words) | "I helped you a bit. Now you buy your own stuff. I'll buy for you when I feel like it. Humph!" |
| D28h | Gold < 50g at GC3 (owner's words, comma added) | "Oh, you don't have enough. Don't worry, I'll help." |
| D28i | After the player buys the Katana | "Your first blueprint! Now make the Katana." |
| (toast) | MARKET before GC1 | "Play more to unlock" |

### Issues, round 3

- **I15. The market window covers the dragon.** The coin animation starts at the dragon, but the market
  is a modal over the scene. Proposal: the coins start from the dragon's on-screen position and fly
  above the modal; the dragon speaks in the bubble that sits over modals (`.say-over-modal`, r217).
- **I16. The banner's build-mode lesson moves too.** Today, after Bram's sale, the player is guided to
  hang the banner (ITEMS & DECOR, BUILD on, drag, BUILD off: `ftueDecorStep`, stage `p1-decor-tab`).
  With the banner in part 6, that lesson runs after Garric's sale, the last beat of the FTUE. See Q13.
- **I17. Garric's grade 1 had no reward window.** It now opens one, for the banner alone.
- **I18. Buying for an undiscovered trait (D14).** A "?" column shows shape names; can the player buy
  them? See Q14.
- **I19. GC1's sale used to give the Broadsword blueprint and GC2's the grindstone.** Both reward lists
  are now empty, so part 1 has no reward windows at all.

### Open questions (round 3)

- **Q13. The banner lesson (I16):** keep the guided hanging of the banner after Garric's reward, before
  the closing lines (D135-D140)? Or just give the banner, with no lesson?
- **Q14. Undiscovered traits (I18):** can their blueprints be bought before the trait is found, or are
  the BUY buttons locked until it is found?
- **Q15. Do the drafted lines D28b-D28i read right?**

### Decisions, round 3 (owner, 2026-10-07)

- **D15 (Q13). The banner lesson stays, in part 6.** After Garric's reward window, the dragon guides the
  player to hang the banner (ITEMS & DECOR, BUILD on, drag, BUILD off: today's `ftueDecorStep`), then the
  closing lines D135-D140 play.
- **D16 (Q14). Undiscovered traits are locked in the market.** The "?" column shows the shape names, but
  its BUY buttons are locked until the trait is found.
- **D17 (Q15). Lines D28b-D28i are approved for now** (round 2 table).

**Part 1 planning is complete.** It is ready to build when the owner says so.

## Part 2

### Owner wants (2026-10-07)

- **TC2** asks for a balanced sword again. The player has **1 iron and 1 manganese** left, puts both in
  the smelter, and sees the path cannot reach the Balanced trait.
- The dragon: "We can't get the balanced trait with only 1 iron and 1 manganese, unless-" then "We grind
  them!" He gives the grindstone: "Here, I found this grinder lying around. It should help."
- The ores are reset (D13). The grinding lesson for the balanced sword follows, then **updating the
  recipe** (record craft), then the **recipe pages reward**.
- After TC2 the player is **completely out of ores**.
- **TC3** asks for the **fire sword**: unchanged, and **gathering** (the cave) is taught here.
- **The design desk leaves this part** (it moves to part 6).
- **TC3's reward:** the **fire Longsword blueprint**.

### Current build

- **Ore:** the player starts with 12 iron and 12 manganese (`FTUE.oreStart`). At TC2 the forge visit
  (`tutForgeAgain()`) **sets the ore to 6 and 6** (`FTUE.tc2Ore`, the "safety net" for D34), and the TC2
  craft takes 1 iron and 1 manganese, both fully ground (`FTUE.tc2Craft`).
- **The grindstone is already on the bench** when TC2 arrives (GPC2's reward), and the lesson opens
  with D32-D35:
  - D32 "Hmm, we are low on ores. Why don't we use the grindstone to make our ores go further?"
  - D33 "We can travel further on the map if we grind the ores before we put them in the smelter."
  - D34 "If we do it properly, we can craft 6 more swords instead of just 3!"
  - D35 "Drag one iron to the grindstone. Hold the handle and turn the stone. ..."
  then D36-D41 (grind, load, heat, hammer), D42-D43 (record craft, update the recipe).
- **In the TC2 stages, unground ore is refused** ("Grind it all the way first", `fullGrindOnly()`).
- **Part 2 today then has GPC3** (5 balanced swords in one order, the CRAFT 5 lesson, with
  `ensureOre` 5 and 5) whose reward is the **design desk**. TC2's reward is **+5 recipe pages**.
- **TC3 is part 3 today:** D59-D63 (the adventurer), the cave and the pickaxe (D64-D65), the fire craft
  (D66-D78, hazard lines D69a-d), **the design desk lesson (D79-D85)**, the sale and **Day 1 ends**
  (D86-D88), **Day 2 opens with the skill tree** (D89-D94). Then GPC4 fire, GPC5 balanced, GPC6 fire.
  TC3's reward is balanced parts x3 + fire parts x3 + the fire Longsword blueprint.
- `ftuePart(3)` already starts TC3 with 0 iron and 0 manganese, so the cave lesson already expects an
  empty bag.

### Keep

- D29 (TC2's ask), D31, D33, D35-D43 (the grinding lesson and the recipe update).
- TC3 as it is: D59-D78 with the cave and the fire craft.
- The +N recipe pages reward (Q18 for the number).

### Change

1. **Ore:** 1 iron and 1 manganese left when TC2 arrives (see I20).
2. **A new beat before the grindstone:** TC2 asks; the player loads the 2 raw ores; once both are in, the
   path is checked against the Balanced trait; the dragon's lines; the reward window gives the
   grindstone; both ores go back to the bag and the smelter is cleared; the grinding lesson starts.
3. **D32 and D34 are replaced** (D32 "low on ores", D34 "6 more swords instead of 3" are no longer
   true). D33 stays. Drafted lines below.
4. **TC2's sword uses the grindstone on 1 + 1 ores**, then the player has 0 and 0.
5. **GPC3 (the bulk order) and its design desk reward leave part 2** (see Q16).
6. **TC3 joins part 2**, after TC2. Its design desk lesson (D79-D85) moves to part 6: after the quench
   the fire sword goes straight to the counter. Reward: `[fire Longsword blueprint]` only.

### Drafted lines

New ids beside D32, per the D-id rule.

| Id | When | Line |
| --- | --- | --- |
| D32 (changed) | Both raw ores are in the smelter, and the path misses Balanced | "We can't get the balanced trait with only 1 iron and 1 manganese, unless-" |
| D32a | Next | "We grind them!" |
| D32b | The reward window opens with the grindstone | "Here, I found this grinder lying around. It should help." |
| D32c | The ores are back in the bag | "I put your ores back. Let's try again." |
| D33 | (kept) | "We can travel further on the map if we grind the ores before we put them in the smelter." |
| D34 | **removed** | - |

The owner's "1iron" is written "1 iron", and "we grind them!" starts with a capital. D32c is mine.

### Issues, errors, bugs

- **I20. The ore count does not come out to 1 and 1.** Part 1 uses 2 + 2 for each of 4 swords (Bram,
  GC1-GC3): 8 and 8. From 12 and 12 that leaves **4 and 4**. Also, a player can make extra swords in
  part 1, so a fixed start cannot guarantee the count. Proposal: start with **9 and 9**, and set the ore
  to exactly 1 and 1 when TC2 arrives (today's safety net sets 6 and 6 at the same point).
- **I21 (checked 2026-10-08: raw ends 139 from Balanced, a miss; ground ends 2 from it, a hit). Raw 1 + 1 must miss Balanced, and ground 1 + 1 must reach it.** D38 says the ground route
  reaches it; the raw route must be measured in the build before this is built, since the whole beat
  depends on it.
- **I22. The check needs a trigger.** Today nothing reacts to "both ores are in". A new stage waits for 2
  segments in the smelter, before the heat step, and checks the route end against the Balanced trait.
- **I23. D35 says "grindstone"; the owner's new line says "grinder".** The tutorial uses "grindstone"
  everywhere else (D32, D35, toasts). One word should be chosen.
- **I24. The bulk-craft lesson (CRAFT 5) has no place.** It was GPC3 in part 2; with 0 ores after TC2 it
  cannot stay there.
- **I25. TC3's parts rewards disappear** (balanced and fire parts x3 were for the design desk). The
  design desk and its parts are planned again in part 6.
- **I26. Day 1's end and Day 2's skill tree** (D86-D94) follow TC3's sale today. Not mentioned; assumed
  kept (Q19).
- **I27. Part numbers shift.** If part 2 is TC2 + TC3, today's parts 3-6 renumber; the PART buttons and
  `ftuePart(n)` follow.
- **I28. D79's choice** ("Do you want to customize it?", D80 "Wrong answer") goes with the design desk.
  D86's "{g}g" still quotes the real sale.

### Open questions

- **Q16. GPCs in part 2.** Are there any gameplay customers in part 2 now? Where do the bulk order
  (5 swords, CRAFT 5) and today's part 3 customers (GPC4 fire, GPC5 balanced, GPC6 fire) go?
- **Q17. Shapes (D7).** Which shape do TC2 and TC3 ask for? The fire Longsword is TC3's reward, so TC3
  can only ask for a fire Shortsword, unless the dragon buys a fire blueprint first.
- **Q18. "p recipe pages":** is it **5** pages, as today?
- **Q19. After the fire sale:** do Day 1's end (D86-D88) and Day 2's skill tree (D89-D94) stay here?
- **Q20. Ore (I20):** start with 9 and 9, and set exactly 1 and 1 at TC2?
- **Q21. "Grinder" or "grindstone" (I23)?**
- **Q22. Do the drafted lines D32-D32c read right?**

### Decisions (owner, 2026-10-07)

- **D18 (Q16). Part 2 has no gameplay customers.** It is TC2, then TC3. **No bulk craft anymore**: the
  5-sword order and its CRAFT 5 lesson are gone (see Q23 for the CRAFT 5 button itself).
- **D19 (Q17). Shapes:** TC2 asks for **balanced, any shape** (the one exception to D7). TC3 asks for a
  **fire Shortsword**.
- **D20 (Q18). TC2's reward: +5 recipe pages**, as today.
- **D21 (Q19). The end of Day 1 (D86-D88) moves to part 3; the skill tree (D89-D94) moves to part 6.**
  Part 2 ends with TC3's sale and the fire Longsword blueprint.
- **D22 (Q20). Ore:** the player starts with **9 iron and 9 manganese**, and when TC2 arrives the ore is
  set to **exactly 1 and 1** (replacing today's 6 and 6).
- **D23 (Q21). "Grindstone"** everywhere. D32b becomes: "Here, I found this grindstone lying around. It
  should help."
- **D24 (Q22). Lines D32-D32c approved for now** (with D23's word).

### Part 2 flow (after D18-D24)

| Step | What happens | Lines |
| --- | --- | --- |
| 1 | The bell brings TC2: "Give me a good one." (balanced, any shape). Ore set to 1 and 1. | D29 |
| 2 | To the forge. The player loads the raw iron and manganese. The path misses Balanced. | D31, D32, D32a |
| 3 | Reward window: the grindstone. Both ores back in the bag, smelter cleared. | D32b, D32c |
| 4 | Grinding lesson, heat, hammer, quench, record craft, update the recipe. | D33, D35-D43 |
| 5 | Sale to TC2. Reward window: +5 recipe pages. Ore now 0 and 0. | - |
| 6 | The bell brings TC3: the fire Shortsword. | D59-D63 |
| 7 | Out of ores: the cave and the pickaxe. | D64-D65 |
| 8 | Fire craft (hazard lines D69a-d), then straight to the counter (no design desk). | D66-D78 |
| 9 | Sale to TC3. No reward (D31; was the fire Longsword blueprint). End of part 2. | D86 (sale line) |

### Issues, round 2

- **I29. D86 is TC3's sale line and the start of the Day 1 end.** D86 ("...Here's your {g}g.") stays with
  the sale in part 2; D87-D88 (bedtime) move to part 3. To check when part 3 is planned.
- **I30. The fire Longsword was "base" (purple) in D5, which D10 says the dragon buys.** Here it is a
  reward window instead, by the owner's choice. Recorded as an exception, not a conflict.

### Open questions, round 2

- **Q23. "No bulk craft anymore":** remove only the lesson, or also the CRAFT 5 button in the craft book?

## Part 3

### Owner wants (2026-10-08)

1. **The end of Day 1 first** (bedtime), then the player is guided to the counter.
2. **GC4 asks for a Durable sword.** The dragon:
   - "Durable trait is one the basic trait. It should in the visible part of the map."
   - "The traits you discover in the hidden part of the map are elemental."
   - **A window shows the map** (owner art later; the existing art for now).
   - "And I also remember we need a Nickel for a durable trait."
   - "Let's see if we can find some in the cave."
3. **To the cave**; gather the ores, **nickel included**. Then:
   - "We got some Nickel! We can craft a Nickel sword now."
   - "If you explore further in the same direction, you will find elemental traits associated with light."
4. **Craft the Durable sword: 2 ground nickel lead to the Durable trait.** Sell it to GC4.
5. **GC5: fire Longsword.** The dragon buys the blueprint (not a reward any more).
6. **GC6: fire Broadsword.** The dragon buys the blueprint.
7. **GC7: fire Katana.** The player buys it. The dragon: "Remember how to buy the blueprint? Go to the
   market and buy a fire katana blueprint!"

### Current build

- **Day 1 ends after TC3's sale** with D87-D88 (bed). **Day 2 opens** with D89 ("Good morning! ... I'll
  show you how to.") and the skill tree (D90-D91), then D92 "Let's go check the counter."
- **Durable** is one of the 5 "centre ring" traits (swift, balanced, durable, flexible, heavy), at world
  (1570, 873), **231 from the spawn: inside the opening reveal (430)**, so it is in the visible part of the
  map today. Its icon shows "?" until acquired.
- **Nickel** exists (`ORES`, path length 215) and has a cave seam in normal play (`CAVE_METALS`), but
  **no FTUE cave stocks it** (the code comment: "the FTUE never uses it"). The TC3 cave holds exactly
  2 iron + 2 manganese; the Day 2 cave (`FTUE.day2Cave`) holds iron 12, manganese 12, copper 24,
  aluminium 7.
- **The map window already exists:** `MAP_parts.webp`, "The map, divided into five parts", shown once
  after D67a in TC3's fire craft (part 2 in v3).
- **Trait reach:** where the sword stops, the nearest trait within `ALIGN_MAX` = 34 counts; the distance
  sets the tier (about 5: Epic, 20: Fine, 34 or more: none).
- **Durable has no FTUE support** (I9): no skin, no parts, no trait key (a Durable blade reads as
  balanced in the shape picker), no orders.

**Measured in the build (2026-10-08), from the spawn, with no pull:**

| Ores | Closest the route comes to Durable | Reaches it? |
| --- | --- | --- |
| 1 nickel, ground | 79 | no |
| 2 nickel, raw | 72 | no |
| **2 nickel, ground** | **43** (at 27% of the second ore) | **no** (needs 34 or less) |

Also measured for part 2 (I21): 1 raw iron + 1 raw manganese end **139** from Balanced (a miss, as the
owner wants); ground, they end **2** from it (a hit).

### Keep

- D87-D88 (bed), D89 (good morning), D92 (to the counter).
- The cave and pickaxe flow (the stock changes).
- The dragon-buys and player-buys market beats from part 1 (D10), for fire this time.
- `MAP_parts.webp` as the stand-in for the new map window.

### Change

1. **Day 2 morning without the skill tree:** D89, then D92 (D90-D91 move to part 6).
2. **GC4 (Durable)** with the new lines, the map window, the cave with nickel, the Durable craft.
3. **Durable's position moves** so that 2 ground nickel reach it (I31).
4. **Durable gets FTUE support:** trait key, shapes (D5 column), blade fallback to the balanced art.
5. **GC5-GC7** reuse part 1's market beats with fire.
6. **TC3's reward (part 2) is removed:** the fire Longsword is now bought by the dragon at GC5 (I33).

### Drafted lines

The owner's lines, with grammar fixes marked. New ids beside D92 (D92b-D92j), per the D-id rule;
D92a is taken (r213).

| Id | When | Line |
| --- | --- | --- |
| D92b | GC4 asks | "The Durable trait is one of the basic traits. It should be in the visible part of the map." (fixed: "one of the basic traits", "should be") |
| D92c | Next; then the map window | "The traits you discover in the hidden part of the map are elemental." |
| D92d | Map window closed | "And I also remember we need nickel for the Durable trait." (fixed: "nickel", "the Durable trait") |
| D92e | Next; pointer to the cave | "Let's see if we can find some in the cave." |
| D92f | Nickel in the bag | "We got some nickel! We can craft a Durable sword now." (changed: "a Durable sword", not "a Nickel sword"; see Q27) |
| D92g | Next | "If you explore further in the same direction, you will find elemental traits associated with light." |
| D92h | GC5 asks (fire Longsword) | "A fire Longsword! I'll buy this blueprint for you too." |
| D92i | GC6 asks (fire Broadsword) | "And a fire Broadsword. My treat, one more time!" |
| D92j | GC7 asks (fire Katana; owner's words) | "Remember how to buy the blueprint? Go to the market and buy a fire katana blueprint!" |

GC5 and GC6 reuse "Here it is. Watch this!" (D28c) and the coin animation. GC7 reuses the top-up line
D28h if the gold is short (Q28).

### Issues, errors, bugs

- **I31. 2 ground nickel do not reach Durable.** The closest pass is 43; the trait needs 34 or less.
  Options:
  A. **Move Durable** to the end of the 2-ground-nickel route, (1581, 723): 356 from the spawn, still
     inside the opening reveal (430), so still "visible". The same fix r80 used for Balanced.
  B. Move it onto the route's closest point, about (1610, 830): the player must stop hammering there.
  C. Change nickel's path (it would change nickel everywhere).
  Recommendation: **A**, so the full route ends on the trait, as the Balanced lesson does.
- **I32. "Elemental traits associated with light" in that direction.** Beyond Durable, along nickel's
  direction, the next traits are **Noble** (👑) and **Luck** (🍀). Neither is a "light" trait. The
  light-like traits (Celestial ☄️, Rainbow 🌈, Grace ✨) lie elsewhere. See Q26.
- **I33. GC5 contradicts part 2's TC3 reward.** Part 2 gave the fire Longsword blueprint after TC3's
  sale. GC5 now has the dragon buy it, so TC3's reward window is empty (or gives something else).
- **I34. The cave needs new stock.** Part 3 needs 2 nickel (GC4) and enough iron and manganese for
  3 fire swords (GC5-GC7). The fire recipe uses 2 iron + 2 manganese, so **6 + 6**, or a second cave
  trip. The player starts part 3 with 0 + 0.
- **I35. The map window is already used** (after D67a, in TC3's fire craft, one part earlier). Showing
  the same picture again for "basic vs elemental" repeats it until the owner's new art lands.
- **I36. GC4's order shape (D7).** "A Durable sword": the Shortsword (free) is the only Durable shape
  open.
- **I37. Durable's ring on the map (r221)** only shows for discovered traits. GC4's Durable is not
  discovered yet, so no ring. Intended, since the dragon explains where to look.
- **I38. The part 1 market beats must work for any trait and shape** (dragon buys / player buys), not
  only for balanced.

### Open questions

- **Q24. Durable's position (I31):** A (move it to the route's end), B, or C?
- **Q25. GC4's arrival:** by the bell, as in part 1, or straight after D92?
- **Q26. "Light" traits (I32):** which traits are "light"? Does the new map art define the sectors, or
  should the line name a different direction or trait?
- **Q27. D92f:** "Durable sword" in place of "Nickel sword"?
- **Q28. GC7's gold:** the same top-up as GC3 (D12) if the player has less than 50g?
- **Q29. The cave (I34):** one trip with 2 nickel + 6 iron + 6 manganese, or a smaller stock and a second
  trip later?
- **Q30. TC3's reward (I33):** nothing, or something else?
- **Q31. Rewards for GC4-GC7:** none, as in part 1?

### Decisions (owner, 2026-10-08)

- **D25 (Q24). Durable moves near the end of the 2-ground-nickel route (option A), offset so the sword
  gets the Fine tier, not Epic.** The tiers are set by the distance from the trait centre: Epic 9 or
  less, Fine over 9 up to 20, Weak over 20 up to 34 (`ALIGN_EPIC`, `ALIGN_FINE`, `ALIGN_MAX`). Plan:
  place Durable about **15 units to the side of the route's end** (refined in part 4: (1577, 740), measured), at a right angle to the route's last
  direction. Then no point of the route comes within 9 (no Epic), and the end is within 20 (Fine).
  The exact point is measured in the build when it is built, and a test asserts the tier.
- **D26 (Q25). Every customer arrives by the bell.** No customer comes before the player rings it.
  This is a rule for all parts (see the cross-part issues).
- **D27 (Q26). There is no "light" trait.** The map has 5 parts. The **light part** holds Celestial,
  Luck, Noble, Floral, Durable and Grace. D92g ("...elemental traits associated with light") stays as
  written: it points to the elemental traits of that part (Celestial, Luck, Noble, Floral, Grace).
- **D28 (Q27). D92f says "Durable sword".**
- **D29 (Q28). GC7: the gold top-up of D12 applies** (less than 50g: D28h, then the top-up).
- **D30 (Q29). One cave trip:** 2 nickel + 6 iron + 6 manganese.
- **D31 (Q30). TC3 (part 2) gives nothing.** Part 2's TC3 reward of the fire Longsword blueprint is
  removed; the dragon buys it at GC5.
- **D32 (Q31). GC4-GC7 give no rewards.**

### Part 3 flow (after D25-D32)

| Step | What happens | Lines |
| --- | --- | --- |
| 1 | After TC3's sale (part 2): bed, Day 1 ends. | D87, D88 |
| 2 | Day 2 morning, to the counter. The bell glows. | D89, D92 |
| 3 | Bell: GC4 asks for a Durable Shortsword. | D92b, D92c |
| 4 | The map window (`MAP_parts.webp` for now). | - |
| 5 | Pointer to the cave. | D92d, D92e |
| 6 | Cave: 2 nickel, 6 iron, 6 manganese, one trip. | - |
| 7 | Back at the forge. | D92f, D92g |
| 8 | Craft: 2 ground nickel, Durable at the Fine tier. Sale to GC4. No reward. | - |
| 9 | Bell: GC5, fire Longsword. The dragon buys it (coins, lock opens). Craft, sale. | D92h, D28c |
| 10 | Bell: GC6, fire Broadsword. The dragon buys it. Craft, sale. | D92i, D28c |
| 11 | Bell: GC7, fire Katana. The player buys it (top-up if under 50g). Craft, sale. End of part 3. | D92j, (D28h) |

### Issues, round 2

- **I39. The dragon's fire pull can move the sword after the route ends.** A player who pulls could bring
  it closer to Durable than the offset. If the pull runs towards the spawn and Durable sits to the side,
  the pull does not bring it closer; this must be checked when the point is measured.
- **I40. Ore after part 3:** 6 + 6 iron and manganese cover exactly the 3 fire swords if each uses
  2 + 2. A wasted or retried craft leaves the player short; the fire crafts need the same retry or cap
  rule part 1 has (`ftueRetryAsk`), or a little spare. To settle when the part is built.

## Part 4

### Owner wants (2026-10-08)

- **Renumbering:** today's TC4 splits into **TC4 and TC5**. Bram (part 5) becomes **TC6**; Garric
  becomes **TC7**.
- **TC4 asks for an Epic Durable sword.** "I want a durable sword. Make sure it is EPIC! I only want the
  best." The dragon: "Okay, time to learn how to craft the best tier sword!" **The lesson on using the
  dragon to pull the sword for trait alignment moves here.** Guide the craft of an Epic Durable, then the
  sale.
- **TC5 asks for the gale sword**, as today: discover Swift first, learn to store it, then get Gale.
- **GC8 asks for a Weak balanced sword.** "My master requests a balanced sword. He is going on a dangerous
  hunt. But I don't want him to come back. He tortures me everyday. Can you give me a weak sword?"
  Guide the craft: 1 iron + 1 manganese, both fully ground. While hammering, stop at the Weak tier, and the
  dragon says "Stop now! This alignment will give us a weak trait tier." Then finish and sell.

### Current build

- **Today's TC4 (part 4)** is the gale order, D93-D107:
  - D93 (ask), D93a, D94/D94b (to the cave, "Gather everything").
  - D95-D96: 2 ground copper, hammer.
  - **D97, the pull lesson:** "Drag me to the anvil and hold. Doing so will slowly drag the sword icon to
    the centre of the map, and you can align the sword with the traits to get an epic tier every time!"
    Then the **"Alignment for Tiers" window** (`openTiers()`, after D97), and D98 "Stop! This looks
    perfect." The pull is clamped so it parks the sword on Swift (`tutPullTarget()`, r124/r126).
  - D99-D99a: store the swift metal. D100-D106: copper further, to Gale. D107: sell.
  - Rewards: gale Longsword blueprint + gale parts x3; then GPC7 (gale) and GPC8 (fire).
- **Tiers** come from the distance between the sword's stop point and the trait's centre:
  Epic 9 or less, Fine 20 or less, Weak 34 or less (`ALIGN_EPIC`, `ALIGN_FINE`, `ALIGN_MAX`).
- **The fire pull** moves the sword and its path towards the spawn while the dragon breathes on the
  anvil (`PULL_SPEED`).
- **Ore at the start of part 4:** 0 + 0 iron and manganese after part 3's fire swords; nickel 0 (both
  used at GC4); copper only from the Day 2 cave (`FTUE.day2Cave`, copper 24).

**Measured in the build (2026-10-08): one Durable position that serves part 3 and part 4.**
Durable at **(1577, 740)**, beside the end of the 2-ground-nickel route (1581, 723):

| Check | Value | Result |
| --- | --- | --- |
| Distance from the route's end | 17.5 | **Fine** when hammered to the end (part 3, GC4) |
| Closest any point of the route comes | 12.7 | Never Epic by stopping early (more than 9) |
| Closest when pulled from the end towards the spawn | 5.2 | **Epic** with the pull (part 4, TC4) |
| Distance from the spawn | 357 | Inside the opening reveal (430): still visible |

The margins are small (12.7 against 9; 5.2 against 9). A test will assert all three when it is built.
This refines D25 (which said "about 15 to the side").

### Keep

- D97 (the pull lesson), the "Alignment for Tiers" window and D98, now in TC4 for Durable.
- TC5 = today's gale run: D93-D96, D99-D107 (Swift, store it, Gale).

### Change

1. **TC4 (new):** the Durable Epic order, the pull lesson (D97, the window, D98) on Durable.
2. **TC5:** the swift step no longer teaches the pull (D97 is used in TC4). It needs a short reminder in
   its place (draft below).
3. **GC8 (new):** a Weak balanced sword: 1 + 1 ground, a stop in the Weak band with a pause, then finish.
4. **The pull clamp** (`tutPullTarget()`) gets a Durable target for TC4.
5. **A Weak-band stop** for GC8: the sword is parked in the Weak band, the game pauses, the line plays.
6. **Renumber** TC5-TC7, the PART buttons and `ftuePart(n)`.

### Drafted lines

New ids beside their neighbours: TC4's beside D92 (after part 3's D92j), the TC5 reminder beside D97,
GC8's beside D107.

| Id | When | Line |
| --- | --- | --- |
| D92k | TC4 asks (owner's words) | "I want a durable sword. Make sure it is EPIC! I only want the best." |
| D92l | Next (owner's words) | "Okay, time to learn how to craft the best tier sword!" |
| D97 | TC4, the sword at the route's end (kept) | "Drag me to the anvil and hold. Doing so will slowly drag the sword icon to the centre of the map, and you can align the sword with the traits to get an epic tier every time!" |
| D98 | TC4, Epic reached (kept) | "Stop! This looks perfect." |
| D97a | TC5, the swift step (replaces D97 there) | "Remember? Drag me to the anvil and hold to pull the sword onto the trait." |
| D107a | GC8 asks (owner's words, "every day" fixed) | "My master requests a balanced sword. He is going on a dangerous hunt. But I don't want him to come back. He tortures me every day. Can you give me a weak sword?" |
| D107b | GC8, the sword enters the Weak band (owner's words) | "Stop now! This alignment will give us a weak trait tier." |

### Issues, errors, bugs

- **I41. Durable's position must serve both parts.** Part 3 wants Fine without the pull; part 4 wants
  Epic with it. Solved by the measured point above; recorded here so a later move does not break one of
  the two.
- **I42. Ore for part 4.** TC4 needs 2 nickel; TC5 needs about 7 copper (2 for Swift, then 3 + 1 + 1 for
  Gale); GC8 needs 1 iron + 1 manganese. The player has none of these after part 3 (D30's trip covered
  part 3 only). Today TC4's cave trip is D94/D94b. See Q33.
- **I43. The Weak band is narrow.** It is 14 units wide (34 down to 20). A hot sword can cross it in one
  stretch of hammering, so the dragon could speak too late. Proposal: in GC8's stage, park the sword at
  the Weak band (the same kind of clamp r124 uses for Swift), pause, play D107b.
- **I44. The craft book can skip GC8's lesson.** The recorded balanced recipe (1 + 1 ground, TC2) would
  make the sword at the recipe's tier without the map. GC8 must be guided through the forge, or the book
  closed for that order. See Q37.
- **I45. The swift step in TC5 used D97's clamp and window.** Without D97, it needs D97a and the clamp
  still parked on Swift. The "Alignment for Tiers" window shows once only (`TUT_SAW_TIERS`), in TC4.
- **I46. The tier was never explained before TC4.** Part 3's Durable is Fine, and the earlier swords show
  tiers too. TC4's window is the first explanation. Probably fine; noted.
- **I47. Today's GPC7 (gale) and GPC8 (fire) and the part 4 rewards** (gale Longsword blueprint, gale
  Rapier blueprint, gale parts) are not in the new part 4. See Q34.

### Open questions

- **Q32. Shapes (D7):** TC4's Durable, TC5's Gale and GC8's Balanced: which shapes? (Free: every
  trait's Shortsword; balanced also has Longsword, Broadsword and Katana by then.)
- **Q33. Ore for part 4 (I42):** one cave trip at TC4 with 2 nickel + 7 copper + 1 iron + 1 manganese
  (plus spare)? Or a trip at TC4 and another at TC5?
- **Q34. Rewards (I47):** what do TC4, TC5 and GC8 give? Today's gale blueprints and gale parts: keep,
  move, or drop?
- **Q35. D97a:** is a short reminder right for TC5's swift step?
- **Q36. GC8's arrival:** by the bell after TC5 (D26)? Any more gameplay customers in part 4?
- **Q37. GC8 and the craft book (I44):** lock the book's CRAFT for this order, or only point to the forge?

### Decisions (owner, 2026-10-08)

- **D33 (Q32). Shapes:** TC4 asks for "a durable sword" with **no shape** (any shape, like TC2).
  TC5 asks for a **gale Shortsword**. GC8 asks for a **balanced Longsword**.
- **D34 (Q33). One cave trip**, at TC4: 2 nickel + 7 copper (2 for Swift, then 3 + 1 + 1 for Gale) +
  1 iron + 1 manganese (**12 copper after D41**, for GC9 in part 5). The spare (if any) is set when built, after the retry rule is settled (I40).
  The Day 2 cave's other stock (copper 24, aluminium 7) is not needed any more.
- **D35 (Q34). No rewards in part 4, for now.** Today's gale Longsword blueprint, gale Rapier blueprint
  and gale parts are dropped from part 4.
- **D36 (Q35). D97a is approved** for TC5's swift step.
- **D37 (Q36). GC8 arrives by the bell after TC5. GC8 is the last customer of part 4.**
- **D38 (Q37). GC8 is crafted at the forge only, and the Weak sword is not saved in the craft book**
  (no "record craft" prompt for it). Reading: the dragon points to the forge, not to the book; the book is
  not locked. To confirm if the book must also be locked.

### Part 4 flow (after D33-D38)

| Step | What happens | Lines |
| --- | --- | --- |
| 1 | Bell: TC4 asks for an Epic Durable sword (any shape). | D92k, D92l |
| 2 | One cave trip: 2 nickel, 7 copper, 1 iron, 1 manganese. | D94, D94b |
| 3 | 2 ground nickel; hammer to the route's end (Fine, 17.5 away). | - |
| 4 | The pull lesson: drag the dragon to the anvil and hold; the tiers window; stop on Epic (5.2 away). | D97, D98 |
| 5 | Finish, sell to TC4. No reward. | - |
| 6 | Bell: TC5 asks for a gale Shortsword. | D93, D93a |
| 7 | 2 ground copper; the pull onto Swift; store the swift metal. | D95, D96, D97a, D98, D99, D99a |
| 8 | Copper further, to Gale; shape, sell to TC5. No reward. | D100-D107 |
| 9 | Bell: GC8 asks for a Weak balanced Longsword. | D107a |
| 10 | Forge: 1 iron + 1 manganese, both fully ground; hammer; the sword parks in the Weak band; pause. | D107b |
| 11 | Finish (no record craft), sell to GC8. No reward. End of part 4. | - |

### Issues, round 2

- **I48. D94 says "Go back to the cave."** In v3 the player was last in the cave in part 3, so "back"
  still reads right.
- **I49. "No save in the craft book" (D38)** means the record-craft beat (D42-D43 style) must not fire for
  GC8's Weak sword, and the game's automatic save of a new recipe (if any) must skip it. To check when built.

## Part 5

### Owner wants (2026-10-08)

- **TC6 = Bram returns**, as today: he returns, his illustration is shown, he asks for a **swift Dagger**,
  and says the last sword was not sharp enough.
- **The dragon gives the sharpening wheel** (a reward): "I found this sharpening wheel. I'll show you how
  to use it."
- Guide the player to use **the stored swift metal** from the inventory and craft the sword, then to the
  **sharpening wheel**.
- After the sale, **Bram gives the diary**.
- **GC9 asks for a gale Longsword. The dragon buys the gale Longsword blueprint.**

### Current build

- **Bram's return** (part 5 today): D110 (hello), the illustration (`Bram_illustration.webp`, "Bram, back
  from his mission", `tutBram2Illus`), D111 (a swift sword), **D111a** ("The last one was good, but not
  very sharp. Can you make this one sharper?", `FTUE.bramLine`), D112-D113 (the stored swift metal to the
  anvil), then sharpening **D48-D55**, the sale **D56-D57** (the sharpening bonus), **D114** (the gift),
  the diary **D115-D117**. Then GPC9 (gale) and GPC10 (swift); rewards: GPC9 the swift Dagger blueprint,
  GPC10 swift parts x3.
- **D48** introduces the wheel as found: "There is a sharpening wheel in the basement. Let's go see if we
  can use it."
- **The sharpening wheel is never locked** (`act:'sharpen'` in the basement props). HANDOFF has this as an
  open question ("lock the basement sharpening wheel until part 5?").
- **D111 asks for "a swift sword"**, no shape. The swift Dagger blueprint was GPC9's reward, after Bram.
- **The stored swift metal** comes from TC5's swift step (part 4 in v3); D99a guards it ("Use it later.
  We don't need that now.", `FTUE.swiftLine`) if the player takes it out early.

### Keep

- D110, the illustration, D111a, D112-D113, D49-D57 (sharpening, sale, bonus), D114-D117 (diary).
- `ftueAfterDiary()` and the bell after the diary.

### Change

1. **The sharpening wheel is locked until part 5**, like the grindstone before part 2 (the lock toast and
   the greyed prop). This answers HANDOFF's open question.
2. **A reward window gives the sharpening wheel** with the dragon's new line, in place of D48.
3. **D111 names the Dagger** (draft below).
4. **The swift Dagger blueprint** must be open before Bram's craft (I50).
5. **GC9 (new):** gale Longsword, with the dragon-buys beat (D10). Today's GPC9 and GPC10 and their
   rewards go.

### Drafted lines

| Id | When | Line |
| --- | --- | --- |
| D111 (changed) | Bram asks | "I have another request. My next mission requires me to cross enemy territory quickly. Can you make a swift dagger for me?" |
| D111a | (kept) | "The last one was good, but not very sharp. Can you make this one sharper?" |
| D48 (changed) | The sharpening wheel's reward window (owner's words) | "I found this sharpening wheel. I'll show you how to use it." |
| D113a | GC9 asks (gale Longsword) | "A gale Longsword? Fine, I'll buy this one too. Don't get used to it!" |

D113a sits beside D113 (Bram's run), per the D-id rule. GC9 reuses D28c ("Here it is. Watch this!").

### Issues, errors, bugs

- **I50. The swift Dagger blueprint.** Bram asks for a swift Dagger, and the Dagger is swift's base
  (purple) shape. Under D10 the dragon buys base shapes, but the owner's part 5 text does not mention it.
  See Q38.
- **I51. When the wheel is given.** D48 today plays after the craft (the sword is made, then "there is a
  sharpening wheel in the basement"). The owner's order puts the reward right after Bram's ask. Either
  works; the reward window at the ask matches the owner's text. See Q39.
- **I52. Ore for GC9.** A gale sword needs copper (TC5's route: 2 + 3 + 1 + 1 = 7 copper, or fewer with a
  recorded recipe). Part 4's cave trip was exact (D34), so the player has no copper. See Q40.
- **I53. The hammer minigame has no Dagger mid-blade.** The Dagger borrows the Shortsword's
  (`HM_MID_ALIAS`), as today. Already on the art list.
- **I54. D56 ("Hmm. I see. Not bad. {g}g for your efforts.")** is Bram's sale line in v2. It reads
  oddly from a returning friend. Not in the owner's text; noted only.
- **I55. Lock state on old saves.** A save from before the lock has the wheel usable; `ftuePart(n)`
  must set the lock correctly for parts 1-4.

### Open questions

- **Q38. The swift Dagger blueprint (I50):** does the dragon buy it at Bram's ask (coins, lock opens),
  or is it simply open?
- **Q39. The wheel's reward (I51):** at Bram's ask, or after the craft (where D48 is today)?
- **Q40. Copper for GC9 (I52):** extra copper in part 4's cave trip, or a cave trip here?
- **Q41. Rewards:** the diary (Bram) only? GC9 gives nothing?
- **Q42. Any more customers in part 5 after GC9?**

### Decisions (owner, 2026-10-08)

- **D39 (Q38). The dragon buys the swift Dagger blueprint** at Bram's ask (coins fly, the lock opens).
- **D40 (Q39). The sharpening wheel is given at Bram's ask**, in a reward window with D48 (changed).
- **D41 (Q40). GC9's copper comes as extra copper in part 4's cave trip** (D34). TC5's gale route took
  5 copper (3 + 1 + 1), so part 4's trip becomes **2 nickel + 12 copper + 1 iron + 1 manganese**. The exact
  count for GC9's route is measured when built.
- **D42 (Q41). The diary is the only reward in part 5;** GC9 gives nothing.
- **D43 (Q42). GC9 is the last customer of part 5.**

### Part 5 flow (after D39-D43)

| Step | What happens | Lines |
| --- | --- | --- |
| 1 | Bell: Bram returns; his illustration. | D110 |
| 2 | He asks for a swift Dagger, sharper than the last. | D111, D111a |
| 3 | The dragon buys the swift Dagger blueprint (market, coins, lock opens). | D28c-style line |
| 4 | Reward window: the sharpening wheel. | D48 |
| 5 | The stored swift metal to the anvil; shape the Dagger; quench. | D112, D113 |
| 6 | Basement: sharpen. | D49-D55 |
| 7 | Sale with the sharpening bonus. | D56, D57 |
| 8 | Bram's gift: the diary. | D114-D117 |
| 9 | Bell: GC9, gale Longsword. The dragon buys it. Craft (copper from part 4), sale. End of part 5. | D113a, D28c |

### Issues, round 2

- **I56. Step 3 needs its own line.** The dragon buys the Dagger blueprint, but D111a is Bram's line.
  Draft: **D111b** "A dagger? We don't have that blueprint. I'll get it, since he is an old friend."
- **I57. The market trip happens twice in a row for Bram** (the blueprint, then the wheel window). Order
  chosen: blueprint first, then the wheel, then the craft.

## Part 6

### Owner wants (2026-10-08)

- **TC7 = Garric**, as before. After his lines, the dragon: "He wants a custom designed sword. Let me get
  a design desk for you." (the design desk arrives here, D-part 2 notes).
- After the sale, **Garric also gives the banner, in all 3 outcomes** (D11), then **the decor lesson**
  (D15).
- After Garric leaves, **Day 3**, the same way as the Day 1 to Day 2 change.
- **Day 3 opens with the skill tree lesson** (D21).

### Current build

- **Garric (part 6 today):** D120-D128 (his lecture and the order: "Craft a Balanced sword and show me!
  Extra gold if it is good, and a reward if it is Epic tier, customized and sharpened!"), D129-D130 (the
  dragon), then **a solo run**: the dragon steps back (r189), checks in once (D130a). The sell
  confirmation (r214) for a sword below his best grade. His grade sets the ending: grade 1 D131-D133,
  grade 2 D134-D136, grade 3 D137-D139; all close on **D140**: "From now on, ring the bell when you are
  ready for customers. I'll be here if you need me." That is the map's last key (`lastLine()`), and
  `FTUE_ST.done` turns on.
- **Rewards** (`FTUE.garricRewards`, r212), in the window as he leaves (`garricLeaves()`): grade 1 none,
  grade 2 10g, grade 3 10g + his balanced parts (grips/guards/pommels 5-6).
- **There is no Day 3 today.** The FTUE ends on Day 2.
- **The day change today** (Day 1 to 2, after TC3): `tutExit('#panRight')` to the bedroom, D87 ("*Yawn* -
  I'm sleepy. Can we go to bed now?"), D88 (goodnight, on the bed), the bed tap, the "Day 2" card
  (`dayTransition`), the cave restock, then the morning: **D89-D91** (good morning, the skill points, open
  the skill tree), the tree, then D92.
- **The design desk lesson** today is D79-D85, in TC3's fire run: D79 "Wow. A fire sword! Do you want to
  customize it?" (D80 "Wrong answer. Think again." on "no"), D81 to the basement, D82-D83 the desk, D84,
  D85 back to the counter. The desk is locked until unlocked (`FTUE_ST.desk`).
- **The banner lesson** today: `ftueDecorStep()` (stage `p1-decor-tab`): ITEMS & DECOR, BUILD on, drag the
  banner onto the counter screen, BUILD off.

### Keep

- D120-D140, the solo run, the sell confirmation, the three endings, Garric's grade rewards (+ the banner).
- D87-D91 and the day change (`dayTransition`), run a second time for Day 3.
- D81-D85 (the desk lesson), `ftueDecorStep()` (the banner lesson).

### Change

1. **D130b (new, owner's line)** after D130, then a reward window: the design desk.
2. **The desk lesson** runs on Garric's sword: after the quench, D79 (reworded, not fire) and D81-D85.
3. **Garric's rewards** each get `{ kind:'decor', id:'banner' }` (grade 1 now opens a window).
4. **The banner lesson** after his reward window.
5. **Day 3:** to the bedroom, sleep, the "Day 3" card, the morning, the skill tree (D89-D91).
6. **The FTUE's end moves** from Garric's ending to the end of the Day 3 skill tree; D140 stays the last
   line and `lastLine()` still finds it.

### Proposed order of the ending (see Q43)

| Step | What happens | Lines |
| --- | --- | --- |
| 1 | Bell: Garric's lecture and order. | D120-D128 |
| 2 | The dragon's reaction. | D129, D130 |
| 3 | The dragon gets the desk: reward window, the design desk. | D130b |
| 4 | Craft (solo, D130a once). After the quench, the desk lesson. Sharpening (unlocked in part 5). | D79 (reworded), D81-D85 |
| 5 | Sale (the confirmation if below his best grade). | D131 / D134 / D137 |
| 6 | Reward window: his grade reward + the banner. | - |
| 7 | The dragon's answer. | D132-D133 / D135-D136 / D138-D139 |
| 8 | The banner lesson. | (today's decor-step pointers) |
| 9 | To bed, Day 3. | D87a, D88a (D47) |
| 10 | Day 3 morning, the skill tree. | D89a, D90, D91 |
| 11 | The close; `FTUE_ST.done`. | D140 |

### Drafted lines

| Id | When | Line |
| --- | --- | --- |
| D130b | After D130 (owner's words) | "He wants a custom designed sword. Let me get a design desk for you." |
| D79 (changed) | After the quench, Garric's sword | "Now let's make it look special. Do you want to customize it?" |

### Issues, errors, bugs

- **I58. The desk lesson sits inside Garric's solo run.** r189 made the dragon step back for this craft;
  the desk lesson needs pointers. Proposal: the solo rule holds for the map and hammer, and the dragon
  only guides the desk (and not the rest). See Q45.
- **I59. D79 names fire** ("Wow. A fire sword!"). Garric's order is balanced. Reworded above.
- **I60. D80's choice** ("Wrong answer. Think again." if the player says no) stays with D79.
- **I61. Day 3 reuses D87-D89.** The same "sleepy" and "good morning" lines play on both nights. See Q46.
- **I62. D90-D91 speak of "the experience points you collected"**; by Day 3 the player has many level ups
  unspent. Fine as written; noted.
- **I63. `FTUE_ST.done` and the dragon's switch to a pet** must move from Garric's ending to after Day 3's
  skill tree, or the dragon stops guiding before the tree.
- **I64. Garric's order shape (D7).** D128 says "a Balanced sword", no shape. See Q44.
- **I65. Grade 3 needs a designed, sharpened, Epic sword.** The desk now arrives at Garric and the wheel
  in part 5, so grade 3 is reachable. Good.
- **I66. The cave restock at the day change** (`ftueDay2Cave()` runs when `TUT_STAGE==='bed'`) must not
  run again on Day 3, or it must stock Day 3 properly. See Q47.

### Open questions

- **Q43. Is the proposed ending order right** (steps 1-11)?
- **Q44. Garric's shape:** any shape (as D128 says), or a named one?
- **Q45. The desk lesson in the solo run (I58):** the dragon guides only the desk?
- **Q46. Day 3's night and morning:** reuse D87-D89, or new lines? (I can draft them.)
- **Q47. Day 3's cave:** restock it (with what), or leave it as normal play?
- **Q48. Are D130b and the reworded D79 right?**

### Decisions (owner, 2026-10-08)

- **D44 (Q43). The ending order is approved** (steps 1-11 above).
- **D45 (Q44). Garric asks for a balanced sword of any shape.**
- **D46 (Q45). In Garric's solo run the dragon guides only the design desk lesson.**
- **D47 (Q46). Day 3's night and morning get new lines** (drafted below).
- **D48 (Q47). Day 3's cave is normal play** (no tutorial restock; `ftueDay2Cave()` must not run on Day 3).
- **D49 (Q48). D130b and the reworded D79 are approved.**

### Drafted lines, Day 3 (for the owner to approve)

New ids beside D87, D88 and D89.

| Id | When | Line |
| --- | --- | --- |
| D87a | After the banner lesson | "What a day! Even that grumpy old man couldn't ruin it. Let's get some sleep." |
| D88a | On the bed | "Goodnight. Tomorrow - we craft - the best swords - in town - and meat. Lots of meat." |
| D89a | Day 3 morning, before D90 | "Good morning! You have grown so much in just two days. I think you are ready for this." |

Then D90-D91 (the skill points, open the skill tree), the tree, and D140 to close.

**Part 6 planning is complete. All six parts are planned.**

## Final decisions (owner, 2026-10-08)

- **D50 (Q23). No bulk craft at all:** the lesson and the **CRAFT 5 button** in the craft book are removed.
- **D51 (D38 confirmed).** GC8: the dragon points to the forge only; the craft book is not locked; the Weak
  sword is never saved in the book.
- **D52. All drafted lines are approved:** D92h, D92i, D111b, D113a, D87a, D88a, D89a.
- **D53. Build order:** the shared systems first (the market and the coin animation, the shape in each
  order, the Durable trait, the SKILL TREE and MARKET buttons), then parts 1-6 in order, each test first.

**Status: planning complete (2026-10-08).** Nothing built yet.

## Build record: shared systems (2026-10-08)

Asserted by `tooling/market/market.test.mjs` (33 checks, written first and seen failing) and the
`FTUE.shapes` check in `tooling/ftue/ftue.test.mjs`.

- **`MARKET`** (between the MARKET-CONFIG markers): price 50 (D2); traits and shapes in the chart's order
  (D5); `extra` = the pink boxes per trait. `FTUE.shapes` (the purple boxes) gains `durable`.
- **Rules** (MARKET-PURE): `marketShapes(trait)` (a trait's 10 shapes), `marketRow()` (free, owned, closed,
  unknown, poor, buy, in that order), `orderMatches()` (D7: an order with no shape takes any shape),
  `orderLabel()`, and `ftueTraitKey()` (moved here; now knows Durable).
- **MARKET button** beside SKILL TREE, half the old width each (56 px). SKILL TREE shows a tree icon (D9) and
  "Lv N" (+ unspent points); the xp numbers left the label, the bar still shows them.
- **Market window** (`#sfMarketModal`): a shape column and one column per trait; "?" for an undiscovered
  trait (D14), whose cells are locked (D16). Closed until `FTUE_ST.market` (set by part 1 later) or the end
  of the FTUE; a click then says "Play more to unlock" (D6).
- **The dragon buys** (`marketGift()`, D10): the window opens, 5 coins fly from the visible dragon to the
  cell (above the window), then the blueprint is owned and the cell pops. State changes on a timer, not on
  the animation. Measured: done 1.19 s after the call.
- **The player buys** (`marketBuy()`): 50g; toasts for closed, unknown and not enough gold.
- **Shaped orders:** a GPC order may carry `shape`; the customer keeps it, the ask names it ("Do you have a
  Balanced Katana?"), and the sale refuses a wrong shape. No part config names a shape yet (parts 1-6 will).
- **Shape picker:** lists the trait's whole column (up to 10, four to a row); a locked one says "buy ... in
  the market".
- **D50:** CRAFT 5 is removed from the craft book.
- **Art stand-ins:** the new shapes borrow hammer mid-blades (`HM_MID_ALIAS`); a balanced Dagger borrows
  `swift_dagger_blade` (`BLADE_BORROW`).
- Checked in the browser: the button row (gear 59, SKILL 56, MARKET 56 px), the closed toast, the window with
  Balanced known (9 buy, 5 free, 36 locked, 5 empty), the dragon's gift (5 coins in flight, owned after),
  a purchase (60g to 10g), "not enough gold" and "discover first" refusals, the 10-shape picker; no console
  errors; mobile-fit GREEN.

## Build record: part 1 (2026-10-08)

Asserted by `tooling/ftue/ftue.test.mjs` (134 checks; the part 1 checks written first and seen failing).

- `FTUE.oreStart` 9 + 9 (D22). `FTUE.parts[1]`: three orders, balanced Longsword, Broadsword, Katana, each
  with `market: { by, ask, done }` (dragon, dragon, player); no rewards. `FTUE.marketWatch` D28c,
  `FTUE.marketShort` D28h. Lines D28b (changed) and D28c-D28i as approved (D17).
- **Bram:** no reward window; D26 leads straight to the quest list (D118).
- **A market order** opens the market (`FTUE_ST.market`), says its ask line and blinks MARKET. Opening the
  market runs the lesson (`FTUE_MK`): the dragon buys (D28c, coins, D28d / D28f), or the player buys (with
  D28h and the coin top-up to 50g if short; only the ordered blueprint can be bought during the lesson).
  CLOSE blinks when it is done. Closing before buying sends the player back to MARKET.
- **Found in the browser and fixed:** on the counter screen the dragon's bubble cannot rise above a modal
  (it lives in the screen layer's stacking context). While the market is open his line shows in a strip
  inside the window (`#mkSay`). Test added and seen failing without the fix.
- **Interim until later parts are built:** the grindstone is put on the bench when part 1 ends (part 2 will
  give it in TC2's run, D13); the banner is not given anywhere (part 6 will, D11); part 2 still runs the v2
  script, including the 5-sword order whose CRAFT 5 button is gone (part 2 removes that order, D18).
- `ftuePart(2)` now ends part 1 with the three balanced blueprints, the market open, 1 + 1 ore, no banner.
- Checked in the browser: a new game has 9 + 9 ore and MARKET closed; GC1 to GC3 each ask by shape; the
  dragon buys the Longsword and Broadsword; at 46g the top-up brings the gold to 50; a different blueprint
  is refused during the lesson; the Katana is bought (50 to 0); a Shortsword is refused at the counter and
  the ordered shape sells; after GC3 the stage is the bell for TC2 and the grindstone is on the bench.

## Build record: part 2 (2026-10-08)

Asserted by `tooling/ftue/ftue.test.mjs` (148 checks; the part 2 checks written first and seen failing).

- `FTUE.tc2Ore` 1 + 1, set when TC2 arrives (D22). `FTUE.parts[2]`: no GPCs, no `ensureOre`, reward `tc` = +5
  pages (D18, D20). Lines: D32 (changed), D32a-D32c new, D34 removed.
- **TC2's raw step** (stage `tc2-raw`): the arrow goes from the iron, then the manganese, to the smelter. With both
  in, the route end is checked against Balanced (raw: 139 away, a miss): D32, D32a, D32b; then the reward
  window gives the grindstone; both ores go back to the bag, the smelter is cleared, `grindUse` is set, and
  D32c, D33, D35 start the grinding lesson as before (stage `regrind`).
- The grindstone is no longer given when part 1 ends (part 1's interim removed). Its reward card now says
  "It is on the forge bench. Let's use it now."
- **TC3:** joins part 2 (it no longer sets part 3). After the quench the fire sword goes straight to the
  counter (D85, then the counter blinks); the design desk lesson is not run. Her sale gives no reward (D31);
  part 3 starts with the bed (D87).
- **Caught by review, not by the text tests:** the new reward line first shipped as `'...Let's...'`, which broke the
  script. The FTUE test now also checks that every script block parses (seen failing on a planted error).
- **Interim until part 3 is built:** after the bed, v2's Day 2 still runs (the skill tree, then the v2 part 3
  customers).
- Checked in the browser: TC2 at 1 + 1 with the grindstone locked; the raw route stops short of Balanced
  (screenshot); D32-D32b; the grindstone window; ores back, grindstone usable; the ground route ends 2 from
  Balanced; TC2's +5 pages, then the bell for TC3; TC3 in part 2; the fire sword to the counter; after her
  sale part 3, no reward window, D87.

## Build record: part 3 (2026-10-08)

Asserted by `tooling/ftue/ftue.test.mjs` (172 checks; the part 3 checks written first and seen failing).

- `FTUE.parts[3]`: GC4 Durable Shortsword (`lesson:'durable'`), GC5 fire Longsword and GC6 fire Broadsword
  (the dragon buys; done lines D92a and D28f), GC7 fire Katana (the player buys; no done line). No rewards.
  `FTUE.day2Cave` = 2 nickel + 6 iron + 6 manganese (D30). Lines D92b-D92j.
- **Durable moved** to world (1577, 740) (`TRAIT_POS` 1136, 421.667). Measured: 2 ground nickel end 17.4 away
  (Fine), the route never comes closer than 12.8 (no Epic by stopping early), the pull from the end reaches
  5.4 (Epic, for part 4), 340 from the spawn (visible). The route crossed no hazard on 9 random maps.
- **Day 2 morning:** D89 then D92; the skill tree is skipped (part 6). The counter, then the bell.
- **GC4's lesson:** D92b, D92c, the map window (`MAP_parts.webp` for now), D92d, D92e, the exits to the cave,
  D94b, gather everything, D92f, D92g, back to the forge; nickel to the wheel (raw nickel and other ores
  refused), the turn arrow, the smelter, twice; bellows, gate, anvil, hammer; the mug at the route's end;
  after the craft, to the counter and the sword-to-counter arrow.
- **Market steps without a done line** now say nothing (GC7).
- **Found in the browser and fixed:** the walk stages (`p3-dur-*`) were not routed to the screen handler, so the
  exits never changed and the cave never started the mining step. Test added, seen failing without the fix.
- **Interim until part 4 is built:** after GC7 the v2 gale order (`d2-bell`) comes next, and the Day 2 cave
  no longer holds copper for it.
- Checked in the browser: TC3's sale to the bed, Day 2 with the new cave stock, D89/D92, the bell; GC4 asks for
  a Durable Shortsword; the lines, the map window, the walk to the cave and back; the craft guidance; the
  route end reaches Durable at Fine (17.4); the sale; GC5 and GC6 (the dragon buys), GC7 with the top-up
  (20g to 50g) and the purchase; after GC7 the stage is `d2-bell`.

## Build record: part 4 (2026-10-08)

Asserted by `tooling/ftue/ftue.test.mjs` (190) and `tooling/market/market.test.mjs` (37); the part 4 checks were
written first and seen failing.

- `FTUE.parts[3].after` is `p4-tc4` (the bell brings TC4). `FTUE.parts[4]`: GC8 balanced Longsword, tier Weak,
  `lesson:'weak'`; after `d2-praise` (Bram); no rewards. `FTUE.p4Cave` = 2 nickel + 12 copper + 1 iron + 1
  manganese. `FTUE.weakStop` = 27 (the middle of the Weak band). Lines D92k, D92l, D97a, D107a, D107b.
- **Orders may name a tier** (`orderMatches`): TC4 Epic, GC8 Weak; the counter refuses another tier.
- **TC4** (`tutTc4Arrive`): asks (D92k), D92l, D94, one cave trip; the walk and the 2-ground-nickel craft reuse
  part 3's Durable stages. At the route's end (Fine, 17.4) the pull lesson: D97, the tiers window, the dragon
  to the anvil; the pull parks the sword on Durable (5.4, Epic) and D98 plays; the mug; the craft; the sale
  (Epic only); then the bell for TC5.
- **TC5** (the v2 gale run): the swift step says the reminder D97a; the tiers window does not open again.
- **GC8:** D107a; to the forge; iron then manganese, ground; the heat run; the hammer parks the sword where it
  first comes within 27 of Balanced (Weak, 26.9 measured), D107b, the mug. The recipe is not saved (Balanced
  already has a page; automatic saving is first discovery only).
- Checked in the browser with real frames for the pull and the hammer: every step above, the refusals of a
  Fine sword for TC4 and GC8, and the stage after GC8 (`d2-praise`, Bram). No console errors.
- **Interim until part 5 is built:** Bram runs his v2 visit (the stored swift metal, sharpening, the diary).

## Build record: part 5 (2026-10-08)

Asserted by `tooling/ftue/ftue.test.mjs` (203; the part 5 checks written first and seen failing).

- `FTUE.parts[5]`: GC9 gale Longsword, the dragon buys it (ask D113a); no rewards. `FTUE.bramBlueprint`: the
  swift Dagger, the dragon buys it (ask D111b). Lines: D48 and D111 changed, D111b and D113a new.
- **The sharpening wheel is locked** (`FTUE_ST.sharp`; greyed, "The sharpening wheel is locked") until its
  reward window, and always open once the FTUE is done.
- **Bram:** D110, the illustration, D111 + D111a; then D111b and MARKET; the dragon buys the Dagger; closing
  the market hands on (the lesson's new `then`); D48 and the sharpening wheel's window; D112 and the forge as
  before. The basement step no longer says D48. The counter sells Bram a Dagger only.
- **GC9** after the diary: the dragon buys the gale Longsword; after the sale, `g-bell` (Garric).
- The test aid: part 5 starts with Bram at the bell (copper 5 for GC9, no gale blueprints, no Dagger, wheel
  locked); part 6 starts after GC9.
- Checked in the browser: the locked wheel, Bram's new steps, the gift of the Dagger blueprint, D48 and the
  window, the unlocked wheel, the refusal of a Shortsword, D57, the diary, GC9 and its blueprint, then
  `g-bell`. No console errors.
- **Interim until part 6 is built:** Garric runs his v2 visit and ends the FTUE (no design desk lesson, banner,
  Day 3 or skill tree yet).

## Build record: part 6 (2026-10-08)

Asserted by `tooling/ftue/ftue.test.mjs` (221; the part 6 checks written first and seen failing, the desk-gate fix
checked failing without it).

- `FTUE.garricRewards`: the banner in all three outcomes (D11). Lines: D79 reworded, D87a, D88a, D89a, D130b.
- **Garric:** his order restocks the cave with normal seams (parts 3-5 leave the bag and cave empty; found while
  building, see below). D129, D130, "Let me try to do it on my own", then D130b and the design desk's window, then
  the solo run (D46: the dragon guides only the desk lesson).
- **His crafted sword** opens the desk lesson (D79 reworded, D80/D81, the basement, D82-D85). Back at the counter the
  run is solo again.
- **Found in the browser and fixed:** the desk lesson's screen steps sit behind the `TUT_FIRE_RUN` gate, so in
  Garric's run they never fired. The flag is now set for his lesson and cleared at the counter.
- **After the sale:** the reward window (his grade reward + the banner); his answer (D132-D139, no D140); the
  banner lesson (r200's, stages `p1-decor-*`); D87a; the bed and D88a; Day 3 with a normal-play cave (no tutorial
  restock); D89a, D90, D91; the skill tree; closing it says D140, which ends the FTUE (`FTUE_ST.done`). Closing the
  tree with no talent to spend is allowed.
- **Open for the owner:** the cave restock at Garric's order is my choice (the plan left the player with no iron or
  manganese for his balanced sword).
- Checked in the browser: every step above, grade 2 (10g + banner) and grade 1 (banner) windows, the banner
  hung, the night, Day 3, the skill tree, D140 and `done`. No console errors; mobile-fit GREEN.

## GC1-GC3 craft guide (owner, 2026-10-08)

The owner: guide GC1 to GC3 through the entire crafting process. Pointers only, no new lines. Asserted by
`tooling/ftue/ftue.test.mjs` (228; written first and seen failing).

- Closing the market after a part 1 lesson starts it (stage `p1-craft-go`): the exit to the forge; then 2 iron and
  2 manganese, raw, each from its slot to the smelter (`p1-craft-ore`); the bellows, the gate, the metal to the
  anvil, the hammer, and the mug once the route is done (`p1-craft-heat`); after the quench the metal glows and the
  ordered shape blinks in the picker (`p1-craft-shape`); the minigame runs on its own (`p1-craft-hammer`); when the
  craft window closes, the exit and the sword-to-counter arrow (the same step as the Durable lesson's, which now
  sets the current part's `p<n>-gpc` stage instead of always `p3-gpc`).
- Checked in the browser: GC1 from the market to the sale, every pointer in turn, Epic at the route's end, the
  Longsword blinking, the counter arrow, the sale. No console errors.

- **Owner play-test fix (2026-10-08):** the mug arrow never came at the route's end. The per-frame guide redraws only
  when `tutNudgeSig()` changes, and reaching the end changed nothing in it, so the hammer arrow stayed. The
  signature now carries "at the route's end". This also fixes the same gap in part 3's Durable craft (the mug) and
  TC4's pull lesson (started from the same branch). Test seen failing without the fix; checked with real frames
  and no forced redraw: the hammer arrow turns into the mug arrow at the end.

## Requested shape and the trait ring (owner, 2026-10-08)

- **The requested shape is highlighted in the shape window, in the whole game:** a gold ring, a pulse and a
  "Requested" tag (`.sf-req`), on the shape the waiting customer asked for, when the blade on the bench has that
  customer's trait (`custShapeFor(k)`). The scripted customers now carry their shape too: TC3 fire Shortsword,
  TC5 gale Shortsword, Bram a Dagger. Customers with no shape (TC2, TC4, Garric, normal play) highlight nothing.
  The part 1 craft guide uses the same highlight.
- **The customer's trait ring (r221) goes once their sword is made:** `custSpotSync()` hides it while a sword that
  fills the order (trait, shape, tier) is in the bag or on the counter (`custOrderReady()`).
- Asserted by `tooling/ftue/ftue.test.mjs` (234; written first and seen failing). Checked in the browser with real
  frames: the ring shows while crafting, stays for a wrong shape, goes for the ordered Longsword, comes back if the
  sword leaves; the picker highlights the Longsword (GC) and the Shortsword (TC5 gale), and nothing when the
  blade's trait is not the customer's.

## Owner play-test fixes (2026-10-09)

Asserted by `tooling/ftue/ftue.test.mjs` (249; each check written first and seen failing).

- **Exits:** the screens run shop | counter | forge | cave, so from the counter the way to the forge or the cave is
  RIGHT. Six new walks assumed left and pointed at the shop. Every new walk now asks `screenExit(from, to)` (the
  first step of the shortest walk on `SCREENS`, between the SCREEN-PURE markers) through `tutExitTo()`.
- **The dragon without his image:** off the forge, a line in a stage not listed in `TUT_SCREEN_STAGES` went to the
  forge dragon's bubble while he was hidden under the screen. During the FTUE he now comes along to every screen
  but the forge and the bedroom (on the counter once it has been visited or Bram is there), so his lines use the
  screen bubble beside him. (A first attempt looped: `sayWhere()` calls `onScreenDragon()`; a check now forbids
  the call back.)
- **GC5 (fire Longsword), `guide:'map'`:** after the market, to the forge; the fire icon on the map is ringed;
  the book opens on the fire page; CRAFT 1 blinks; the picker highlights the Longsword; then CLOSE, the counter, the
  sword-to-counter arrow.
- **GC6 (fire Broadsword), `guide:'book'`:** the CRAFT BOOK button; the fire page mark if another page is open;
  CRAFT 1; the Broadsword; then the same way to the counter.
- **The Day 2 cave holds all of Day 2 (parts 3-6) + 5 of each:** nickel 2 + 2 + 5 = 9, iron and manganese
  6 + 1 + 1 + 5 = 13, copper 7 + 5 + 5 = 17 (`FTUE.day2Cave`). This replaces D30/D34/D41: TC4 no longer goes to
  the cave (D94 is not said; D92l, then the forge), `FTUE.p4Cave` is gone, and Garric's order no longer refills the
  cave (his iron and manganese are in the total).
- Checked in the browser with real frames: the exits from the counter, shop and forge; the dragon beside his line
  on the counter and in the cave; the cave stock (9, 13, 13, 17); GC5 and GC6 step by step.

- **The trait ring (`#tutSpot`, owner 2026-10-09):** the thin orange ring merged with the yellow map. It is now a white core on a dark edge with a strong orange-red glow, pulsing, and two rings rippling outward (scale 1 to 2.6, fading), half a beat apart. Every lesson that marks a trait uses it (GC5's fire icon, TC3's fire, TC5's gale, Garric's balanced). Asserted by the FTUE test (252).

## Rising prices and the 25-trait market (owner, 2026-10-09)

Replaces D2 (every blueprint 50g). Asserted by `tooling/market/market.test.mjs` (50; written first and seen failing).

- **Price** = `MARKET.priceStep` (50) x (the trait's place in `MARKET.traits` + the shape's step). Shortsword is free.
- **Steps** (`marketSteps`): the trait's own base shapes, then Katana, Cutlass, Machete, Saber, Scimitar, Claymore, then its
  last extra. Balanced: Longsword 50, Broadsword 100, Katana 150 ... Dagger 450. Fire: 100, 150, 200 ... Dagger 500.
  Swift: Longsword 150, Dagger 200 ... Rapier 550. Gale: Longsword 200, Rapier 250. Durable: Longsword 250 ...
- **25 traits** (`MARKET.traits`): the chart's five, then the map's other twenty in its own order (flexible, heavy,
  celestial ... dark). The twenty use Balanced's shapes. The most expensive is Dark Claymore, 1600g.
- **A blade of any market trait offers that trait's shapes** (`ftueTraitKey`: fire, gale, swift first; then any other
  market trait except balanced and durable; then durable; else balanced). So an Ice blueprint opens Ice shapes.
- **The slider:** the shape names stay on the left; the 25 trait columns scroll sideways, five in view, with ◀ ▶ and
  dragging (`marketSlide`). The dragon's gift and the lesson's pointer slide to their column (`mkShow`). Locked
  cells show their price too.
- **Tutorial gold (owner: the top-up stays):** GC3's balanced Katana is now 150g and GC7's fire Katana 200g; the
  dragon tops the gold up to that price when short.
- Checked in the browser: 25 columns of 10; five in view, sliding; the prices above; Dark Claymore 1600 in view on
  request; the top-up from 40g to 150g with the Katana in view and lit; the purchase (150 to 0); the dragon's coins
  landing on a column slid into view.

## The customer waiting system (owner, 2026-10-09)

Asserted by `tooling/ftue/ftue.test.mjs` (267; written first and seen failing).

- **COME LATER** on the counter, beside SELL (68.8%-78.8% of the panel). It appears with the waiting customer and stays;
  after the FTUE it is always there, with **DENY** (still a placeholder) one row below it. Before the waiting customer it
  is hidden.
- **In the tutorial,** COME LATER works for the waiting customer and for anyone called back; for anyone else (Bram,
  GC9, Garric) the dragon says D107e and nothing happens. After the FTUE it works for every customer.
- **The waiting list** (`FTUE_ST.waiting`, so it is saved and a new game clears it) is on the ledger's right page,
  below the squashed Details box. Each entry is a button, one line per sword: "1X Gale Katana". Clicking it asks
  "Call this customer back?" (YES / WAIT LONGER). YES with someone at the counter says "There is already a customer
  at the counter."; otherwise the customer returns ("I'm back. I wanted a Gale Katana and a Fire Claymore."). No time
  limit.
- **Several swords, one customer:** the sword on the counter must be one of the request, and every other one must be in
  the bag, or the customer says "My request was for two swords. You only have one?". With all of them, all are sold at
  once at their own prices. No partial delivery.
- **The waiting customer** (end of part 4, after GC8, before Bram): a gale Katana and a fire Claymore (blueprints
  300g + 450g). D107c (theirs), D107d (the dragon refuses to pay); COME LATER blinks; the customer goes to the list
  and the bell brings Bram. `ftuePart(5)` starts with them on the list.
- Checked in the browser: COME LATER hidden before, shown and lit with the waiting customer; the list entry; D107e on
  Bram; "already a customer"; the call-back line; the one-sword refusal; both sold together (2 sales); the three
  buttons inside the scene after the FTUE. Mobile-fit GREEN.

## The quest list (owner, 2026-10-09)

Asserted by `tooling/ftue/ftue.test.mjs` (271; written first and seen failing). Two pages of seven (`QS_PAGES` 2,
`QS_PER` 7, rows tightened to fit). Each quest pays **20g and 20 xp** (owner: "some gold, +20 xp"; 20g is the game's
default `QUEST_REWARD`; the two pre-completed quests went from 10g to 20g to match). The old five (Epic x5, no refusal,
discover 3, update 3, open the shop) are gone.

| Page | Quest | Counted when |
| --- | --- | --- |
| 1 | Craft a sword; Sell a sword | complete when the list arrives (`FTUE.preQuests`) |
| 1 | Buy a blueprint for the sword shape. | the player buys any blueprint |
| 1 | Update a recipe. | the recipe is updated or saved as a new page |
| 1 | Gather ores from cave | an ore is mined |
| 1 | Craft a fire sword | a sword with Fire is made (forge or craft book) |
| 1 | Go to bed. Remember to pet the dragon! | a new day starts (the player slept) |
| 2 | Craft a durable sword | a sword with Durable is made |
| 2 | Buy a blueprint for the fire sword. | the player buys a fire blueprint |
| 2 | Get dragon's help for an epic tier sword. | an Epic trait is taken while the sword has been pulled |
| 2 | Sell a weak sword. | a sword whose best tier is Weak is sold (and paid for) |
| 2 | Craft a swift sword; Craft a gale sword | a sword with Swift / Gale is made |
| 2 | Sharpen a sword | a sharpening is finished (not cancelled) |

Checked in the browser: both pages, the rows inside the page, completions through the real hooks, a claim (+20g, +20 xp).

## The "Sword crafted!" window (owner, 2026-10-09)

From the wireframes `assets/Anchor-images/Sword_crafted_wireframe.png` and `..._expanded_wireframe.png`. Asserted by
`tooling/ftue/ftue.test.mjs` (280) and the hazard test's Health check (moved to the details paper); written first.

- **The card:** "Sword crafted!" tab; the sword; one line "Epic Balanced Shortsword" (several traits: "Epic Fire, Fine
  Swift Longsword", each tier in its colour); a box with the heart (fills to the health %) and the hammer (fills to the
  forging %); a box with the most-used ore and the total count; the sword's worth (no gold is paid: owner); CLOSE.
- **The paper behind it:** its arrow slides the card left and the paper out (and back): Health % with the gold the
  hazards cost in red, the forging band and %, and each ore with its count.
- **The hammering is saved in the recipe** (owner): pages written during a forge run (the automatic first save, or the
  composition window while the metal is live) receive that run's forging when the sword is finished; a page saved
  from the last craft carries it too. A craft-book sword takes its page's band and %; a page from before this change
  counts as Good.
- D69d's pointer now lights the heart (superseded 2026-10-10: see the hurt fire sword's lesson below).
- Checked in the browser: the card and the paper (75% health, -7g, Masterwork 96%, ores x2 x1 x1); a forge run at 96%
  writing Masterwork 96% to its new page; the craft-book sword from it at Masterwork 96% with the hammer filled to 0.958.

- **The QUEST button glows green (owner, 2026-10-09)** while a finished quest waits to be claimed (`questBtnUi()`, refreshed when a quest finishes, is claimed, on load and on a new game). Asserted by the FTUE test (283); checked in the browser: off at the start, on when a quest finishes, off after the claim.

- **The crafted window at the wireframe's size (owner, 2026-10-09):** the card is 470 px wide and, with its title and CLOSE tabs, fills 86% of the frame's height (the wireframe: 88%); the sword area is 200 px tall, the name 21 px, the boxes 86 px with 46 px icons, the gold 42 px; the paper scales with it. Open, the card and the paper span 117-991 px of the 1080 px frame, centred like the expanded wireframe; the paper passes over the right rail, under the window's backdrop. Asserted by the FTUE test (284).

- **The first crafted window teaches itself (owner, 2026-10-10).** Once per game (`FTUE_ST.cwSeen`, saved; the PART
  jumps set it), while the FTUE runs: D17a "Tap the arrow to see more details." with the arrow lit and no continue
  button (the arrow is the way on); opening the paper brings D17b "The hammer icon shows how well you hammered your
  blade. Higher percentage means more money." with the hammer (Masterwork) row lit, then D17c "This shows how much ore
  you used for the sword." with the ore row lit; the continue on D17c lights CLOSE. All three lines sit above the
  window (`say-over-modal`); CLOSE ends the lesson at any step. Corrections: the owner's line gained its full stop;
  the lit rows keep a steady orange edge under the pulse. Asserted by `tooling/ftue/ftue.test.mjs` (299), written
  first. Checked in the browser: each step, tapped as a player; the after-close step still runs; a second window
  does not repeat it; no console errors.
- **The hurt fire sword's window (owner, 2026-10-10).** D69d is now "The sword was damaged because of the Hazard
  zones. It will sell for a little less." It lights the arrow and has no continue button; opening the paper lights the
  Health row (Health % and "Gold lost: -Ng" in red) and gives D69d a continue; that continue lights CLOSE. Tapping the
  line away early does not lose it: opening the paper says it again. Asserted by the FTUE test (305) and the hazard
  test (35), written first. Checked in the browser by clicking: 75% health, Gold lost -8g, CLOSE lit, the
  after-close step ran, no console errors.
- **Garric's ore (owner, 2026-10-10: "not enough ore for Garric").** The 2026-10-09 change counted his iron and
  manganese inside the Day 2 cave (1 + 1) and dropped the restock at his order; in play the Day 2 swords use that ore
  up. The Day 2 cave now holds 7 more iron and 7 more manganese: `FTUE.day2Cave` = nickel 9, iron 20, manganese 20,
  copper 17 (Garric's Epic Balanced is 2 + 2, the first sword's route, + 5 of each). The dragon does NOT refill the
  bag (owner: a first try did, and was rejected). The PART jumps carry it: PART 4 iron and manganese 14, PARTS 5-6
  7. Asserted by the FTUE test (307), written first. Checked in the browser: the cave stock 9 / 20 / 20 / 17; the
  PART 6 bag 7 / 7, unchanged by his order, no toast.
- **The Day 3 cave (owner, 2026-10-10).** Supersedes D48 (Day 3's cave was normal play). After Garric's night the
  cave is stocked like Day 2's, plus aluminium: `FTUE.day3Cave` = nickel 9, iron 20, manganese 20, copper 17,
  aluminium 15, one seam each on random spots, 2-3 a swing. Both tutorial nights go through one line in
  `advanceDay` (part 6 takes day3Cave, the first night day2Cave); later nights roll normal seams. The unused
  `ftueDay2Cave` is gone. Asserted by the FTUE test (308), written first. Checked in the browser: Day 3 9 / 20 / 20 /
  17 / 15 on 5 spots, Day 2 unchanged, a later night normal seams, no console errors.
- **Day 3's skill tree lesson goes through the cave (owner, 2026-10-10).** Was D89a, D90, D91 and the tree at the
  forge. Now: at the forge D89a, D89b "Let's gather more ores for the day." and the exit to the cave blinks (stage
  `d2-d3cave`); in the cave D89c "Ahh! So many ores to collect. This is going to take way too long!" (the owner's
  "way to" corrected) and D89d "Why don't you upgrade your pickaxe skill from the skill tree?", which lights the
  skill button. In the tree the Pickaxe Upgrade node glows with a steady orange ring; only a pickaxe point counts.
  Closing the tree without one lights the button again with the toast "Put a point on the Pickaxe Upgrade" (unless
  no talent is left); with one, D140 ends the FTUE as before. D90 and D91 are no longer said (kept in the map).
  Found and fixed: the PART 4-6 jumps set `TUT_D2_SPENT` (from when the tree was on Day 2), which let the tree
  close at once; the Day 3 morning now clears it. Asserted by the FTUE test (320), written first (the flag fix
  retroactive RED). Checked in the browser: the exit blink, D89a-D89d, the tree's refusals (closed empty; a point on
  trading), the pickaxe click by coordinate, then D140 and `FTUE_ST.done`; no console errors.
- **A step already done moves on (owner, 2026-10-13).** "If the player already finishes the tasks before the
  tutorial guide, mark it done and move on." Cause: each step waited for the EVENT that ends it, and the event can
  happen before the step begins (all four ores in during D1/D2 left D3's arrow waiting forever). Fix: one table,
  `TUT_SKIP` (stage -> a check on game state + the call that moves on), run every frame from `updateHintArrow`
  (not while a line pauses the game); a stage is tried once, then again only after the stage changes. The chain
  follows: ores, heat, gate and anvil all done early go from D2 straight to D7. Entries, from a read-only audit of
  every action step: the first craft (ore, bellows, gate, anvil); TC2 (tc2-raw, regrind-grind/iron/mang,
  regrind-heat - it waits for D38-D40 to be read); GC1-GC3 (p1-craft-heat, p1-craft-shape) and every shape step
  (the hammer opened early); Day 2 (p3-dur-mine, p3-dur-grind, p4-weak-grind, d2-copper; fire-heat1, d2-hammer,
  d2-gale-hammer, which were only checked while the hammer struck); Day 3 (a pickaxe point spent before the tree
  lesson). "Go to X" while already on X (`TUT_SKIP_SCREEN`, 20 stages): goScreen returns early on the current
  screen, so the arrival never ran; the entry waits for the line to close, then replays the arrival. The market: an
  ordered blueprint already owned skips the trip (it looped buy -> close -> ask), for the dragon's buys too.
  "Done" includes "done and further" (the bellows step counts the metal already out of the smelter; found in the
  browser). Steps whose control is locked until asked (the bellows in the second craft, the sharpener, the desk,
  the diary) need no entry. Asserted by the FTUE test (349), written first. Checked in the browser: the owner's
  case (D3 -> D4); the whole first craft early (D2 -> D7, the hammer lit); the normal order unchanged (D3, D4, D5,
  D6, D7); an owned fire Longsword at GC5 (no market, straight to the book guide, no gold spent); bedtime in the
  bedroom (after D87, D88); the pickaxe point spent early (the tree closes to D140); Day 2 copper loaded early and
  the route's end reached without striking (D96, then D97a); no console errors.
- **The crafted sword flies into the bag like the coins (owner, 2026-10-13).** On CLOSE each sword flies from
  the window to its OWN slot in the SWORDS tab (the tab opens if another is showing): an arc that leaves at the size
  the window drew it, crosses the middle at 1.15 with a random lift (as `flyCoins`), and shrinks to the slot, 720 ms,
  ease-in; Craft 5 sends them 110 ms apart. Until its sword lands a slot keeps its place but shows nothing and cannot
  be dragged (`CRAFT_FLY`, ids, not saved; only while the window is up or the flight runs, so a window closed any
  other way never hides a sword). Landing (on a timer, never onfinish): the slot shows, swells to 1.16 with a gold
  glow, and 8 sparks fly off it. A new game or a load drops any flight. Found in the browser: the shelf was redrawn
  before the window was up, so the slot still showed; it is now redrawn after. Asserted by the FTUE test (358),
  written first. Checked in the browser: one sword (hidden while open, hidden in flight, shown with the pop and 8
  sparks at ~0.7 s, all cleared by 1.7 s, CLOSE clicked by hit-test); Craft 5 (5 hidden, landing one by one, all
  cleared); a frozen mid-flight frame; no console errors.
- **The mug in front of the bucket, and glowing when it is the next step (owner, 2026-10-13).** The page sets the
  mug at z 10 over the bucket's 9, but the end of every pour and every reset put it back at z 3, so from the second
  use on it sat behind the bucket. One constant, `MUG_Z` = 10, now. While `canPourQuench()` holds (metal on the
  anvil, the sword resting on a trait) the mug's picture pulses with a blue glow, every frame, in and out of the
  tutorial (on the picture, so the tutorial's own mug glow on `#mug` still works). Asserted by the FTUE test (361),
  written first. Checked in the browser: at load, after a pour pressed and released like a player, and after a
  reset, a tap on the mug hits the mug at z 10; the glow is off with nothing on the anvil, on with the sword on a
  trait, off again when it leaves; the glow seen in a screenshot; no console errors.
- **OK on the dragon's lines (owner, 2026-10-13).** The continue button in all four dragon bubbles reads OK (Cinzel,
  13 px; the button widens from 32 to 44 px) instead of the double arrow; the close X on a run's last line is
  unchanged, and the glow on the lines that light it (`SAY_GO_GLOW`) is kept. Asserted by the FTUE test (364),
  written first. Checked in the browser: D1 and D2 show OK (lit), D3 keeps the X; a screenshot of D1.
- **The fire run's last ore is a choice (owner, 2026-10-13).** The first half is unchanged (2 iron + 1 manganese, full,
  across speck (1028, 1016): the hazard lesson, D69a-c). After the reheat the dragon says D72 "If we use iron, we will cross
  another hazard zone." (it draws the full iron path, dashed dark red, opens the fog over the choice and pulses the hazard
  red) and D72a "But the manganese can avoid it." (the manganese path, dashed green); closing D72a clears them and lights
  the grindstone. No buttons (owner): either ore is taken, fully ground (`fireOreWanted` 'iron/manganese'; the 70%
  manganese cap is gone); a full grind says D73, the load D74. Both end Fine on fire: `FTUE.fireAt` (824, 1016), 17.2
  (iron) and 17.1 (manganese) away; iron crosses the moved speck (`HAZ.move`, hazard record), manganese none. Fire and the
  speck move after the map is built (`TRAIT_POS` and the seeded zones and books are untouched). Permanent: the map is one
  for the whole game. The PART jumps' fire recipe is now the full route. Found in the browser and fixed: the iron path was
  the route's red (now dashed, dark red / green); both paths ran into the fog (the fog opens over the choice); the speck
  was faint (it pulses red while talked about). Noted: at D70 fire's disc is now 139 from the 3-ore end (was 134), so it
  stays fully under the 120 sight circle - the pulsing ring still marks it. Asserted by the FTUE test (378) and the hazard
  test (37), written first. Checked in the browser: the map (fire, the moved speck, the old spot empty, #53 on both first
  halves); both lines with their paths, the red pulse, then all cleared and the grindstone lit; copper refused ("Iron or
  Manganese"); iron and manganese each taken, half-ground refused, full -> D73 -> D74; both routes Fine; no console errors.
- **The fire run's cave holds 3 iron (owner, 2026-10-13).** The scripted cave (`setTutorialCave`) stocked exactly
  2 iron + 2 manganese for the old recipe; with the last ore a choice, a player who picks iron needs a third. Now iron 3,
  manganese 2; the cave lines name no count. Asserted by the skills test's scripted-cave check (18), written first.
  Checked in the browser: the seams read 3 and 2; mining walks iron to 0 (bag 3), then manganese (bag 2), then the
  stow step; no console errors.
- **The pickaxe stays in the cave (owner, 2026-10-13).** It no longer goes in the bag: no ITEMS & DECOR slot, no
  drag out of the bag, no stowing on the rail (a drop there leaves it in the cave, at the panel's edge). It lies at
  `PICK_HOME` (28, 78) of the cave plate - chosen against all ten seam spots, its head 1.9 x the strike reach from the
  nearest (the old drop spot (40, 88) was 1.01 x, a hair from mining by itself); it can be dragged to a seam as before;
  every arrival at the cave, a new game, a load (a saved position is ignored) and the PART jumps put it back.
  `PICK_OUT` is never null. The fire run's `cave-stow` stage is gone: after the seams, D66 and D67 play and the exit
  to the forge blinks.
  **Lines affected:** D66 "Let's keep the pickaxe in the inventory..." - PROPOSED: "Let's leave the pickaxe here for
  next time. We found it. We are not stealing. Not stealing at all." (owner approved 2026-10-14); D67 "2 iron and 2 manganese"
  is now "3 iron and 2 manganese" (the cave gives 3 iron since the fire choice). D65 ("Pick it up and drag it to the
  ores") still fits; no other line mentions the pickaxe in the bag. Asserted by the FTUE test (385), written first.
  Checked in the browser: ITEMS & DECOR holds only BUILD; the pickaxe at (28, 78) on arrival, idle; dragged by pointer
  next to a seam it mines; dropped on the rail it stays in the cave; back home after leaving and returning; the fire
  run's cave: D65 with the arrow from the lit pickaxe, the bag 3 + 2, then D66, D67 and the forge exit; no console errors.
- **OK on the customers' lines too (owner, 2026-10-14).** The customer bubble's small "tap to continue" (8 px text)
  is now the dragon's OK button: the same brown gradient, border, Cinzel 13 px, 44 x 26 px, at the bubble's bottom-right
  edge; shown, as before, only while the speech has more (`.more`). The whole bubble still takes the tap. Asserted by
  the FTUE test (387), written first. Checked in the browser: Garric's speech shows OK; a tap on it, by hit-test, moves
  the speech on; no console errors.
- **The grindstone is not seen before it is given (owner, 2026-10-14).** Locked (`FTUE_ST.grind` false) it was
  dimmed (grey, 45% opacity) and still showed; now `#stMortar.ftue-lock` is hidden and takes no taps. An ore dropped
  where it sits does nothing, silently (the old "The grindstone is not ready yet" toast spoke of a stone nobody can
  see). Given, it shows at full strength as before. Asserted by the FTUE test (389), written first. Checked in the
  browser: locked - the stone, its wheel handle and the hotspot hidden, a tap at its centre misses it, no toast; given -
  visible, opacity 1, no filter, the tap hits it; no console errors.

- **The basement background without the polishing desk (owner, 2026-10-14).** The owner updated
  `assets/backgrounds/basement_background.png`: the same plate, minus the desk in the FINISHING bay (the desk is now its
  own file, `assets/Game-elements/polishing_desk.png`, deliberately NOT shown yet). The game loads the .webp, so it was
  re-encoded from the new PNG with the asset-diet settings for this file (1920 x 1066, WebP 0.82; 147 KB) through the dev
  server's /__save. No code change. Compared old and new: only the FINISHING bay differs; the work table, the ASSEMBLY and
  SHARPENING bays and the prop areas are unchanged. The game loads the new file (1920 x 1066).

- **The craft book: headings and the page's own sword (owner, 2026-10-14).** Each box is headed: "Ores used", "Crafting
  process", "Shapes unlocked" (`cbHead`). The picture was always the balanced longsword; it now wears the page's trait -
  its longsword blade (`bladeFor`; every skin has one) and the default design in that trait's parts (`ddCoerce(DD_SEL, skin)`):
  fire, swift and gale show their own swords. Fixed with the heading: the shapes box listed a fixed three
  (Shortsword, Longsword, Broadsword) whatever the trait; it now lists what the shape picker allows for the page's
  trait (`marketShapes` + `ftueShapeOpen`), so "unlocked" is true. Found in the browser and fixed: the shapes heading
  took the shape pills' border and shading. Asserted by the FTUE test (394), written first. Checked in the browser
  (PART 6 pages): balanced, fire, swift and gale each show their blade and parts, all loaded; the three headings;
  shapes - balanced and fire Shortsword, Longsword, Broadsword, Katana; swift Shortsword, Dagger; gale Shortsword,
  Longsword; no console errors.

- **The craft book's middle column (owner, 2026-10-14; Composition_book_wireframe.png, updated).** The five tier boxes are
  one: a "Trait Tier" label and one box with every trait's pips (tier-coloured, the panel's rule; 13 px past four pips),
  then a description box. Positions measured off the wireframe in the book's own frame (book 72..1024 x 66..692): label
  top 13.40%, tier box 25.10 / 17.90 / 18.20 x 10.20%, description 25.10 / 31.30 / 18.20 x 31.30% (the other boxes
  already matched). The right boxes keep the owner's headings from the same day ("Crafting process", "Shapes unlocked")
  rather than the wireframe's labels ("Recipe", "Shapes discovered"). Descriptions are `SWORD_DESC`, one per trait (25);
  balanced is the owner's wireframe text, the other 24 are PLACEHOLDERS (owner: "make something up for now"). A page of
  several traits reads "A blend of Fire and Swift. " and the first trait's words. Asserted by the FTUE test (399), written
  first. Checked in the browser: balanced, fire, swift, gale and a two-trait page (5 pips) - every description and tier
  row fits its box, the longest description with the blend prefix too; no console errors.

  | trait | description |
  | --- | --- |
  | balanced | A basic balanced sword. Good choice for those who don't like the fancy elements and rely on pure skills. |
  | swift | A light, quick blade. It strikes before the enemy can blink, made for fighters who rely on speed. |
  | durable | A tough blade that refuses to break. Made for long battles and owners who hate repairs. |
  | flexible | A springy blade that bends instead of snapping. Hard to block, harder to break. |
  | heavy | A weighty blade that hits like a hammer. Slow to swing, but few stand up after one blow. |
  | celestial | Forged under the stars, it glows faintly at night. Said to guide its owner home. |
  | cloud | So light it almost floats. Every swing feels like moving through air. |
  | rainbow | Its edge shimmers in every colour. More admired at feasts than feared in battle. |
  | luck | Nobody knows why, but its owners keep winning. Every coin toss, every close call. |
  | lightning | Crackles with a restless charge. Each strike lands with a flash and a jolt. |
  | noble | An elegant blade fit for a lord. It opens doors before it ever leaves the sheath. |
  | grace | Perfectly weighted for the dancing duellist. Every move flows into the next. |
  | gale | Wrapped in a constant breeze. Each swing sends a gust strong enough to push foes back. |
  | floral | Blossoms are etched along its edge, and it smells faintly of spring. |
  | fury | A blade that runs hotter with anger. It rewards those who never step back. |
  | ice | Cold to the touch and colder to its foes. Its strikes leave a trail of frost. |
  | fire | A blade with a flame inside. Its strikes leave scorch marks and frightened foes. |
  | water | Flows like a river in the hand. Its strikes are smooth, steady and hard to stop. |
  | magma | Molten at its core, it never quite cools. Heavy, hot and hard to stop. |
  | mist | Hard to see and harder to follow. Its edge seems to vanish mid-swing. |
  | poison | A cruel edge that lingers in every wound. Favoured by those who fight dirty. |
  | savage | A jagged, brutal blade. It wins no beauty contests, only fights. |
  | blood | It thirsts for battle and grows stronger with every hit. |
  | cursed | Powerful, but it whispers at night. Few owners keep it for long. |
  | dark | A blade that drinks the light around it. Feared in every tavern story. |

- **The crafting process starts with "Ores" (owner, 2026-10-14).** It listed every ore by name ("Copper + Copper + Copper +
  Copper + Copper -> heat -> ...", two lines); now "Ores -> heat -> hammer -> quench -> hammer" - the ores are in "Ores
  used". Asserted by the FTUE test (400), written first. Checked in the browser: the gale page on one line, fits.

- **No "0g bonus" from sharpening (owner, 2026-10-14: "why 0g bonus from sharpening?").** The bonus (7g) is paid only
  when the sold sword's edge is in the green band (`SH_ZONE_LO` 80+); the wheel's DONE took any edge, so the lesson could
  end unsharpened, and D57 then said "We got a 0g bonus". Now, in the lesson (`base-sharp`), DONE below the band keeps
  the wheel open with the toast "Sharpen it into the green zone first"; and at Bram's sale D57 plays only when a
  sharpening bonus was earned (another, unsharpened Dagger could still be sold - then it is skipped and Bram thanks
  straight away). Outside the lesson DONE is unchanged. Asserted by the FTUE test (402), written first. Checked in the
  browser: DONE at 40 refused (panel open, toast, edge not saved), at 85 accepted (D54, edge 85 saved); the sale with
  a 7g bonus says D57, with 0 goes straight to Bram; no console errors.

- **The mug no longer glows after the trait is in (owner, 2026-10-14).** A pour clears the trait reach, but the sword stays on
  the trait, and the next position check (the dragon's pull runs it every frame) set the reach again, so the mug glowed
  for a trait the sword already had. The glow now asks `mugWanted()`: a pour that ADDS something - a trait the sword
  lacks, or a better tier of one it has (`TIER_RANK`). Pouring is still allowed either way (it can only raise the tier).
  Asserted by the FTUE test (403), written first. Checked in the browser: on balanced (Fine) - glow; after the pour - off;
  the same spot re-checked (reach set again) - still off; closer, Epic - glow; no console errors.

- **No arrow out of a closed inventory tab (owner, 2026-10-14).** An arrow that starts at an ore (e.g. the first craft's
  smelter arrow) fell back to the whole shelf when another tab was open, and drew a line out of the rail. r155 had fixed
  that for the grindstone arrow alone, at setup. Now `tutDrawArrow` draws nothing while the arrow's own tab (`opt.tab`) is
  not open - the tab's glow asks for it - and `invTab` redraws, so the arrow comes back from the ore once INGREDIENTS is
  open. Asserted by the FTUE test (405), written first. Checked in the browser on D3: INGREDIENTS - arrow; INGOTS - no
  arrow, INGREDIENTS glows; INGREDIENTS again - arrow; no console errors.

- **The Durable craft's mug pointer goes after the pour (owner, 2026-10-14).** In GC4 (`p3-dur-heat`) the per-frame
  guide pointed at the mug whenever the metal was on the anvil at the route's end, Durable already on or not, so the
  mug kept glowing after the trait was in; TC4 (`p4-quench`) and GC8 (`p4-weak-quench`) set the mug pointer once and
  nothing cleared it. A pour in any of the three now runs `ftueDurQuenched` (pointer and glows off, the metal glows - the
  shape is next, as GC1-GC3's `ftueGcQuenched`), and the GC4 guide stops once Durable is on. Asserted by the FTUE test
  (407), written first. Checked in the browser: GC4 - mug lit before the pour; after it, and after the guide re-ran, the
  mug off and the metal lit; TC4 the same; no console errors.

- **The waiting customer's guide (owner, 2026-10-14).** The part 4 customer who waits for a gale Katana and a fire Claymore
  (300g + 450g blueprints). Own saved state `FTUE_ST.wq` ('' -> see -> craft -> call -> done), so the tutorial's stages are
  untouched; it speaks only at a free moment (`wqFree`: no line, no window, and the FTUE done, or no stage, or a
  `p<n>-gpc/bell` stage, or the part's bell stage). see: the gold covers the blueprints still to buy - D107f "You can now
  buy both the blueprints that other guy requested. See the request in the ledger."; the exit to the counter blinks if
  needed; the LEDGER button lights, and inside, the waiting request. Closing the ledger: D107g "Craft both the swords."
  call: both swords in the bag - D107h "Now tap on the waiting list in the ledger to call them back."; the LEDGER, the
  request, then YES light. Served: done. Both blueprints already owned: straight to craft. The ledger has no tabs; its
  "Waiting list" section and the request button are what the owner called the waiting list tab. Wording: "both the
  blueprints", "call them back" (owner's typos fixed). Timing: in the PART 5 jump (820g) it starts at once, at the bell
  that brings Bram; in real play it starts when the gold reaches 750 (less any blueprint already bought). Asserted by the
  FTUE test (421), written first. Checked in the browser from PART 5: D107f with the ledger lit (a hit test lands on it);
  the request lit inside; closing: D107g; one sword - still craft; both - D107h and the ledger lit; the request, then YES
  lit; called back - lights off; served - done; no console errors.

- **r231: the customer's dialogue text is 50% bigger (owner, 2026-10-14).** Both customer boxes, `.cs-dlg p` (every
  customer) and `.cs-bram-dlg p` (the scripted customers' own box), go from 17px to 25.5px. The name tag, the player's
  reply buttons and the dragon's lines keep their sizes. The boxes already grow with their text and `counterLayout()` puts
  the buttons under them, so nothing else moved. Asserted by the FTUE test (423), written first. Checked in the browser
  (1080x600 frame): the longest customer speech, D111 + D111a (195 characters), fills the box from 126px to 395px with
  the two replies under it at 405-488px; D107a with SELL under it ends at 280px; no console errors.

- **r232: the inventory tabs are icons; "Items & Decor" is now "Decor" (owner, 2026-10-14).** The four `#matTabs`
  buttons lose their text and show the game's own art: Ingredients = `assets/forge/iron_ore.webp`, Ingots =
  `assets/hammer/ingot.webp` (scaled 2.3x, its canvas is mostly empty), Swords = a balanced Longsword built from its
  parts (`balanced_longsword_blade`, `guard1`, `grip1`, `pommel1`, scaled 1.3x), Decor = `assets/Decor/Banner.webp`.
  Each tab keeps its name as `title` (hover) and `aria-label`. The decor reward's sub-line reads "Decor. Place it with
  BUILD in the Decor tab." Tabs are found by index everywhere, so the tutorial's tab blink and arrows are unchanged.
  Note: the INGOTS tab holds metal orbs (`.inv-orb`), not ingot bars; the icon is the ingot the owner asked for. Asserted
  by the FTUE test (428), written first. Checked in the browser (1280x720): all seven images load, each tab hit-tests at
  its centre and switches `INV_TAB`, the Decor tab shows BUILD; no console errors.

- **r233: the Ingots tab shows an orb (owner, 2026-10-14).** The tab holds metal orbs (`.inv-orb`), so its icon is that
  same orb, the cold grey one, 30px (`.mt-orb`), in place of `assets/hammer/ingot.webp` (r232), which is unused again.
  Asserted by the FTUE test (429), written first. Checked in the browser (1280x720): the orb is 30x30 in its 47x50 tab,
  the tab hit-tests at its centre and switches to INGOTS; no console errors.

- **r234: the customer's dialogue text is 25% smaller than r231 (owner, 2026-10-14).** 25.5px x 0.75 = **19.125px**, in
  `.cs-dlg p` and `.cs-bram-dlg p` (supersedes r231's 25.5px; still 12.5% above the old 17px). Asserted by the FTUE test
  (429, the r231 checks now read 19.125px), written first. Checked in the browser (1080x600 frame): D111 + D111a fills
  its box from 66px to 254px, the replies under it at 264-347px; D107a ends at 209px with SELL at 219-253px; no console
  errors.

- **r235: the crafted card shows the health and forging percentages (owner, 2026-10-14).** On the main "Sword crafted!"
  card, under the heart and the hammer (each now a `.cw-stat` column), `#cwHpPct` shows the health % and `#cwHmPct`
  the hammer minigame's accuracy %, the same values as the details paper (`w.hp`, `w.forge`). A sword with no
  accuracy (SKIP HAMMER, old saves) shows "-" under the hammer, as the paper shows only the band. 17px Georgia bold.
  Asserted by the FTUE test (431), written first. Checked in the browser (1280x720): a sword at 82 health and 0.734
  accuracy shows 82% and 73% inside the 86px box (paper: "Health 82%", "Good 73%"); a skipped hammer shows 100% and "-";
  no console errors.

- **r236: back on the forge screen, the dragon is back at his top-left spot (owner, 2026-10-14).** Every arrival on the
  forge screen (`goScreen('forge')`) calls `homeDragon()`, so a dragon the player dragged away is back where the game
  opens with him. Found on the way: `homeDragon()` (r188, called by the p4 and d2 quench steps) cleared his inline
  left/top, but that spot is LAYOUT's, written inline by `applyLayout()`; clearing it dropped him to the bench's bottom
  left (100, 537 against 112, 86 at 1280x720). It now reapplies his LAYOUT entry (`applyLayout(SF_ORIENT, 'dragon')`;
  `applyLayout` takes an optional single key). Asserted by the FTUE test (434), written first. Checked in the browser
  (1280x720): a real pointer drag moved him from (112, 86) to (412, 386); counter and back: (112, 86); a moved dragon
  through `homeDragon()`: (112, 86); no console errors.

- **r237: the whole sharpening wheel can be tapped (owner, 2026-10-14).** With a sword on the basement table, only the
  wheel's top quarter opened sharpening; a tap lower took the sword back to the bag. The table sword's art box
  (`.cs-sword`, a mostly transparent square, 266-779 x 335-848 at 1280x720) sat over the wheel (294-544) and caught the
  tap. `.cs-sword` now has `pointer-events: none`; the strip it lies in (`.cs-swordbox`, 337-743 x 571-613) still grabs
  the sword (tap or drag). Same box on the counter. Asserted by the FTUE test (435), written first. Checked in the
  browser (1280x720): the wheel hit-tests as the wheel from 10% to 95% of its height (was only to 25%); a real tap at
  80% opens the sharpening window with the sword still on the table; a tap on the sword takes it back to the bag; the
  counter sword's strip still hit-tests along its length; no console errors.

- **r238: a counter sword goes back to the inventory again (owner, 2026-10-14).** After Bram's opener a sword on the
  counter could not be taken back, by tap or by drag to the inventory. `TUT_BRAM_STATE` is set to 'done' when Bram
  leaves and keeps that value all game; `takeCounter()` (r184) refused on any value, which was meant to hold the sword
  only during Bram's scene. It now refuses only while that scene runs (`TUT_BRAM_STATE && TUT_BRAM_STATE!=='done'`, the
  test the rest of the file already uses). Not caused by r237: the counter strip hit-tests the same before and after.
  Asserted by the FTUE test (436), written first. Checked in the browser (1280x720): with the state at 'done' (forced, then
  a PART 2 jump), a real tap and a real drag to the inventory both return the sword (before the fix the tap left it on
  the counter); with the state 'counter-ready' (Bram's scene) the sword stays; no console errors.

- **r239: CRAFT 1 stops glowing once the order is made, and cannot be spammed in the FTUE (owner, 2026-10-15).**
  Glow: the craft-book guide (`ftueBookStep`, GC5/GC6, stage `p3-book`) runs only when `ftueBookSig()` changes. The order
  became ready while the "Sword crafted!" window was open, so the step skipped that turn; closing the window changed
  nothing in the signature, so the step never ran again and CRAFT 1 kept blinking. The signature now carries the open
  windows (`ftueBookModal()`, shared with the step's skip). Spam: `ftueCraftLocked()` is true in the FTUE while the
  customer's order is already made (on the counter or in the bag; a several-sword order needs all of them; `qty` less
  `got`); then CRAFT 1 is disabled (`renderRecipe`) and `cbCraft` refuses with "This order is already made. Serve the
  customer first.". No customer, or the FTUE done: never locked. Asserted by the FTUE test (438), written first. Checked
  in the browser (PART 4 jump, a fire Broadsword order in `p3-book`): CRAFT 1 blinks; real taps on CRAFT 1, Broadsword
  and CLOSE; after the close CRAFT 1 no longer blinks, the book's close button does, CRAFT 1 is disabled; a second
  `cbCraft(1)` makes nothing and opens no shape window; with the customer gone CRAFT 1 is enabled; the same run with
  the pre-r239 signature leaves CRAFT 1 blinking; no console errors.

- **r240: the cave pickaxe is lit on every arrival, until the player touches it (owner, 2026-10-15).** `PICK_HINT` turns
  on with every `goScreen('cave')` (beside `pickHome()`) and off at the first pointerdown on the pickaxe; `buildCave()`
  (which runs after every strike) gives the rebuilt pickaxe `.cv-hint` while it is on. The glow is the tutorial's
  `tutGlow` on the pickaxe's image, so the swinging box's `.striking` animation cannot override it. Every visit, not only
  in the FTUE. The 2026-10-13 cave-reset check now reads the new arrival line. Asserted by the FTUE test (442), written
  first. Checked in the browser (1280x720): arrival - lit (`tutGlow` running on the image); after a rebuild - still lit;
  a real pointerdown on the pickaxe (hit-tested) - off, and still off after a rebuild; forge and back - lit again; no
  console errors.

- **r241: cancelling a craft asks first (owner, 2026-10-15).** The X on the blade panel (`#cancelCraft`) opens
  `#sfCancelAsk` (the r214 window's look, `.gsa-box`): "Cancel crafting?" / "Are you sure you want to cancel the crafting?
  Ores will not be refunded." (owner's words) / "Yes, cancel" and "No, keep crafting". Only Yes runs what the X ran before
  (`refundOre()`, `resetRun()`, the hint; the hint's dash is now a colon). Open: with Restore Ore ranks, `refundOre()` can
  still return some ore, which the line does not say. Asserted by the FTUE test (445), written first. Checked in the
  browser (1280x720, HUD opened by its toggle, 2 segments laid): real taps; the X opens the window (330x129, centred) with
  the run intact; No closes it, still 2 segments; X then Yes closes it and the run is reset (0 segments); no console
  errors.

- **r242: every pointer glow is the owner's two (owner, 2026-10-15).** The owner could not see the glow on some buttons
  and likes two: the dialogue OK button's (`tutLitCtl`: a brighter face, an outer halo and an inset glow) and the
  inventory tabs' (`tutBlinkTab`: the face turns orange). The plain `.tut-blink` was an outer halo only
  (`tutBlinkHalo`), which `overflow:hidden` panels cut off. Now `.tut-blink` is `tutLitCtl` (every button and hotspot:
  craft book, ledger, counter buttons, book buttons, window buttons); the rail buttons (settings, skill tree, MARKET,
  diary, quests) use `tutBlinkTab` like the tabs (the skill tree's own hold-blink `tutBlinkSkill` is gone; its `.sk-lv`
  text pass follows the new curve; its rule stays before `.levelled`, so the level-up flash still wins). Unchanged:
  the exits (already an orange face), `.tut-glow` on props drawn as art (a box glow would light their transparent
  rectangle), `.tut-lit-ctl` itself. `tutBlinkHalo` is removed. Asserted by the FTUE test (448), written first. Checked
  in the browser (1280x720, counter screen; each animation paused at its bright frame for the screenshot): settings,
  skill tree and MARKET turn orange like the Swords tab; craft book and ledger glow like the OK button; a closed market
  stays grey (`mk-closed`); no console errors.

- **r243: the sword's health is a ring around its map marker (owner, 2026-10-15).** The top-right bar (`#sfHp`, its CSS
  and its clean-mode entry) is gone. Inside `#sword`, `#swordHpRing` holds a dark track and the arc `#swordHp` (r 24.5,
  width 4.5, just outside the marker's disc; `pathLength` 100, rotated -90deg): the arc starts at 12 o'clock and
  shortens clockwise as the blade takes damage (`stroke-dasharray` = health %), hidden at 0. `updateHpPill()` keeps its
  name (10 call sites) and drives the ring, with the old bar's rule (shown while a run exists and the sword is out) and
  colours (green above 60%, amber above 30%, red below; the owner asked for green, the warning colours are kept for
  the owner to confirm). Asserted by the FTUE test (451), written first. Checked in the browser (1280x720,
  `ensureMelt()` and `sword.frac` 0.5 forced for the display check): health 100/72/45/18 gives arcs 100/72/45/18 in
  green/green/amber/red, 0 hides the arc; at 65% (map zoomed in) the arc runs from 12 o'clock to about 8 o'clock over
  the dark track; no console errors.

- **r244: the customer's line types left to right (owner, 2026-10-15).** The line was centred, and its paragraph shrank
  to its text inside a centring flexbox, so each typed word grew the line out from the middle. Both customer boxes are
  now left-aligned across their full width: `.cs-dlg p` (a row flexbox) `text-align: left; width: 100%`, so it stays
  centred vertically; `.cs-bram-dlg p` (a column flexbox) `text-align:left; align-self:stretch; width:100%`. The dragon's
  lines are unchanged. Asserted by the FTUE test (453), written first. Checked in the browser (1280x720): mid-typing
  (two words), typed out and a one-word line, the first word starts at the box's left content edge (476px) and the line
  spans the full 417px; a short line stays centred vertically; the scripted customer box the same; no console errors.

- **r245: GC5's map route - "Let's go to the forge.", then everything dark but the fire trait (owner, 2026-10-15).**
  Two new lines (owner's words), after D92l at the end of the D92 group (the pinned D92a -> D92b order is kept):
  | Id | Line |
  | --- | --- |
  | D92m | "Let's go to the forge." |
  | D92n | "Click on the trait to open the craft book directly." |
  In `ftueBookStep()` (stage `p3-book`, `guide:'map'`, book closed): off the forge, D92m once (`FTUE_BOOK.saidGo`) and the
  exit to the forge lights. On the forge, once: the map scrolls the trait into view if it sits outside the middle 70% of
  the view (`tutMapShow`; at a PART 4 jump fire was off screen); then the ring (`tutSpotOn`), the dim with a hole
  (`tutHole`) and D92n (`FTUE_BOOK.saidTap`). The dim is `#tutHole` (not `#tutDim`: `tutPause()` holds the frame loop),
  z-index 60 over the rail (z45) and the exits (z50), the bubble lifted to 61 (`.hole-say`); the hole is a clip-path cut
  sized to the ring plus 8px, so a tap inside reaches the map and any other tap lands on the dim. The frame loop keeps the
  hole on the ring and drops it once the stage is left; it also lifts when the book opens or the order is made. Closing
  D92n with its X leaves the dim. GC6 (`guide:'book'`) is unchanged. Asserted by the FTUE test (460), written first.
  Checked in the browser (1280x720, PART 4 jump, a fire Longsword order, `ftueBookGo` with `guide:'map'`): counter - D92m,
  the right exit lit, no dim; a real tap on it - forge, fire centred (527, 299), D92n, dim on; hit tests: the hole reaches
  the map, the anvil, the left exit and MARKET hit the dim, the bubble is on top; the X leaves the dim; a tap on the dim
  opens nothing; a real tap in the hole opens the book on the fire page, the dim lifts and CRAFT 1 lights; book closed -
  dim back; counter - dim gone; no console errors.

- **r246: "tap", not "click" (owner, 2026-10-15).** The game is for mobile; the owner works on a PC and writes "click"
  from habit, and wants "tap" in what the player reads (standing rule). D92n is now "Tap on the trait to open the craft
  book directly." No other dialogue line, toast, hint or button text said "click". A test now fails on any dialogue line
  with "click". Asserted by the FTUE test (461), written first. Checked in the browser: the bubble reads the new line; 198
  keys; no console errors.

- **r247: no "Let me try to do it on my own." answer in Garric's scene (owner, 2026-10-15).** D130 offered one blocking
  answer that ran `tutGarricDesk()` (D130b, the design desk). The answer is gone; closing D130 runs the same step
  (`SAY_AFTER.D130`, stage `g-talk` only), and D130's button is a lit OK (`SAY_GO_MORE`, `SAY_GO_GLOW`), not a closing X.
  The r130 check on the answer now checks the new path. Asserted by the FTUE test (463), written first. Checked in the
  browser (1280x720, PART 6 jump, stage `g-forge`, real taps on the bubble's button): D129, then D130 with no answer
  button and a lit OK; its tap gives D130b and stage `g-desk`; no console errors.

- **r248: the customer's trait glows only until it is crafted (owner, 2026-10-15).** The r221 ring (`#custSpot`) stayed
  until a sword met the whole order (`custOrderReady`: trait, shape and tier), so a sword with the right trait but the
  wrong shape or tier (e.g. a swift Shortsword for Bram's swift Dagger) left the trait glowing after the craft. Now
  `custSpotSync()` drops the ring as soon as a sword with that trait is in the bag or on the counter
  (`custTraitMade`). Side effect: a leftover sword with the trait hides the ring for a later order of that trait. The
  scripted `#tutSpot` rings were checked and each already ends on its own beat. The r221 check now reads the new rule.
  Asserted by the FTUE test (464), written first. Checked in the browser (1280x720, PART 5 jump): Bram's swift Dagger
  order rings swift; a swift Shortsword in the bag (order not met) - ring off; a fire order with no fire sword - ring on;
  on Garric's order the balanced ring goes at the first iron ore and the customer ring once the sword is made; no
  console errors.

- **r249: no sword is left lying in the basement (owner, 2026-10-15).** Leaving the basement with a sword on its table
  (`WORK`) puts it back in the bag (`workAutoReturn()`, first thing in `goScreen`; toast "The sword went back to your
  inventory", SWORDS tab). In the take-it-back tutorial steps (`dec-take`, `base-take`) the stage moves straight to
  `dec-back` / `base-back` without the line that says to go up (a showing D54 is hidden, the drag arrow cleared), and the
  destination's arrival handler carries on (forge: the left exit lights; counter: the sale). A save made off the basement
  loads with the table sword in the bag; a save made in the basement keeps it on the table. Found on the way (not
  fixed): the toast `#sfToast` takes taps (`pointer-events: auto`) and sits over the up exit while it shows, so a tap
  on the exit right after placing a sword does nothing. Asserted by the FTUE test (467), written first. Checked in the
  browser (1280x720): a real tap on the up exit with a sword on the table - forge, sword in the bag, SWORDS tab, the
  basement empty on return; PART 5 jump, `base-take` with D54 up - forge, stage `base-back`, D54 gone, the left exit
  lit; `applyState` with a table sword saved on the forge - in the bag; saved in the basement - on the table; no
  console errors.

- **r250: no message when the table sword goes back (owner, 2026-10-15).** r249's toast "The sword went back to your
  inventory" is removed; the sword is simply in the bag (SWORDS tab). Asserted by the FTUE test (467; the r249 check now
  also asserts the text is gone), written first. Checked in the browser (1280x720): a real tap on the up exit with a
  sword on the table - forge, sword in the bag, no new toast; no console errors.

- **r251: a very long route runs the sword twice as fast (owner, 2026-10-15).** Design record (values in `ROUTE_FAST`,
  asserted by the FTUE test):
  | Value | Recorded | Why |
  | --- | --- | --- |
  | `ROUTE_FAST.irons` | 5 | owner: "around 5-6 fully ground iron, or more"; the low end, so 5 is already fast |
  | `ROUTE_FAST.mul` | 2 | owner: "twice as fast" |
  Route length = what is drawn: each segment's path length x its ground fraction (`tPct` = 0.5 + 0.5 x grind, so raw ore
  counts half). Yardstick: one fully ground iron = 200 world units, so the threshold is 1000. It is a step, not a ramp:
  the speed doubles the moment the route reaches 1000. Hazard damage is time-based (`HAZARD_DPS` x dt), so the hazard
  check gets dt x the same factor: a zone costs the same health per distance at either speed (without it, long routes
  would take half the damage). Pull speed (`PULL_SPEED`) is unchanged. Cross-check: no locked constraint names the
  travel speed; the tutorial's stops (`tutGaleEpicStop`, `tutWeakStop`) clamp by position, so speed does not move them.
  Checked in the browser: 4 / 5 / 6 fully ground irons (800 / 1000 / 1200) give x1 / x2 / x2 (the sword's step in 0.1s
  at full heat 0.05 / 0.10 / 0.10); 9 / 10 raw irons (900 / 1000) give x1 / x2; no console errors.

- **r252: gameplay customers thank you after a sale (owner, 2026-10-15).** Before this, only the scripted customers
  (Bram, TC2, TC3, TC5, Bram on Day 2, Garric) spoke after a sale; every other customer left at once. Now a gameplay
  customer (FTUE GCs, the called-back waiting customer, every customer after the FTUE) says one random line by the sold
  sword's best tier, `CUST_THANKS` (5 a tier; the owner's examples kept word for word, "Wow! looks good" capitalised):
  | Tier | Lines |
  | --- | --- |
  | Epic (generous) | "Thank you so much, this is the best sword I have ever seen. You are too good!" / "Incredible work! I will tell everyone in town about your shop." / "This blade is a masterpiece. Worth every coin, and more!" / "I can't believe how good this is. Thank you, thank you!" / "Look at that edge! You have made my whole year." |
  | Fine (normal or curt) | "Wow! Looks good. Good job." / "Good enough." / "Not too bad, usable. Thanks." / "Nice work. This will serve me well." / "Fair price, fair sword. Thanks." |
  | Weak (doubtful) | "Are you sure this sword is strong enough? I hope it is." / "Looks...okay...I guess?" / "I have seen better. Humph, what was I even expecting?" / "Hmm. I hope this holds together long enough." / "Well, it is a sword. Mostly." |
  A Weak sword the customer asked for (GC8) gets a Fine line ("unless they ask for it"). Not for: the scripted customers
  (they keep their lines), TC4, a refused sale, or a several-sword order before its last sword ("Good. N more, please."
  stays). How: `CUSTOMER` is cleared on the sale as before; `CUST_BYE` (display only) keeps the portrait drawn and the
  line box up for `CUST_BYE_MS` = 3200 ms with no buttons, so the bell, the guides and the next customer never see it;
  a new customer ends it at once. Asserted by the FTUE test (475), written first. Checked in the browser (1280x720, after
  the FTUE): a real tap on SELL with an Epic sword - the customer stays, an Epic line, SELL hidden, `CUSTOMER` null;
  3.2 s later both gone; Weak sword - a Weak line; a new customer during the goodbye - it ends, one portrait; Weak asked
  - a Fine line; a two-sword order - "Good. 1 more, please." then a Fine line on the last; no console errors.

- **r253: the come-later customer goes through the market first (owner, 2026-10-16).** Part 4's waiting customer (gale
  Katana + fire Claymore, `lesson:'later'`): after their request (D107c) MARKET lights; opening it scrolls both blueprints
  into view and lights them (gale Katana 300g, fire Claymore 450g; the gold shows at the foot) and lights Close; closing
  it gives D107d ("I am not buying the blueprint for those! Ask the customer to come back later when you are richer.
  Humph!") and lights COME LATER, as before. No new line. State: `FTUE_LATER` ('mk' -> 'close' -> null), its own flag,
  so the orders' market lesson (`FTUE_MK`) is untouched; COME LATER tapped at any point ends it. Asserted by the FTUE
  test (479), written first. Checked in the browser (1280x720, PART 4 jump, `ftueGpcArrive` with the later order, real
  taps): MARKET lit, D107d not yet; the market open on both cells (both in view, lit), Close lit; Close - D107d and COME
  LATER lit, no cell left lit; COME LATER - the customer waits (1 on the list), the part goes on; no console errors.
  The PART 4 jump starts before TC5, so the gale column shows "?" there; in play gale is found first.

- **r254: the second map window has its own art (owner, 2026-10-16).** The GC4 Durable lesson's window (after D92c: basic
  traits in the visible part, elemental ones in the hidden part, `ftueDurableMap`) shows the owner's
  `assets/ui/MAP_parts2.png` (929x929, "BASIC" in the lit centre, "ELEMENTAL" in the dark), loaded as
  `assets/ui/MAP_parts2.webp` (converted in the preview page, quality 0.86, saved through `/__save`, 21 KB). The first
  window (D67a, the five parts) keeps `MAP_parts.webp`. The older check on this window now names the new file. Asserted
  by the FTUE test (480), written first. Checked in the browser (stage `p3-dur-ask`): the window shows MAP_parts2.webp,
  loaded, 400x400; no console errors.

- **r255: "tap me for help", after the quest list (owner, 2026-10-16).** Part 1, after Bram's sale and the quest list
  (both quests claimed, the list closed): two new lines (owner's words) beside D119:
  | Id | Line |
  | --- | --- |
  | D119a | "If you are not sure what to do, at any point, you can tap on me. I'll help you." |
  | D119b | "Good. Now let's continue." |
  Closing the list now gives D119, D119a (stage `p1-dragon`); D119a's button is a lit close (`SAY_GO_GLOW`). Closing it
  (`SAY_AFTER.D119a`) sets `p1-dragon-tap` and lights both dragons (counter screen and forge) with a stronger glow
  (`tutGlowBig` on `.crop.dragoncrop`; the plain `tutGlow` was faint on the counter's wood). Any tap on the dragon
  (`dragonTap`) then removes the glow and says D119b, D27, D28: D27 brings the bell, as before (stage `p1-bell0` ->
  `p1-bell`). A tap before D119a is closed repeats the line, as taps always do. Asserted by the FTUE test (485), written
  first. Checked in the browser (1280x720, counter, real taps): close the list - D119 (OK); OK - D119a (lit X, no bell
  yet); X - both dragons glow; tap the dragon - D119b, glow gone; OK - D27, the bell out, stage `p1-bell`; no console
  errors.

- **r256: the health is a fill inside the sword disc, not a ring (owner, 2026-10-16).** r243's ring (r 24.5, width 4.5)
  covered the tier alignment ring (`#alignRing`, r 25) whenever the sword sat on a trait. Now `#swordHpFill` is drawn over
  the icon inside the disc: a rect clipped to the disc's inner edge (r 17.25, so the white border and everything outside
  stay clear), its top edge at the health level - the whole disc at 100%, gone at 0% (y = 17.25 - 34.5 x health,
  height = 34.5 x health). 60% opaque so the icon shows through (the owner's sketch is solid; a solid fill would hide the
  icon at full health). Same rule (shown while a run exists and the sword is out) and colours (green, amber below 60%,
  red below 30%) as r243. The r243 checks now read the fill. Asserted by the FTUE test (485), written first. Checked in
  the browser: health 100/70/40/15 gives fill heights 34.5/24.15/13.8/5.17 in green/green/amber/red, 0 hides it; at 65%
  with an Epic `#alignRing` drawn on the sword's spot (map zoomed in) the purple ring is fully visible around the disc and
  the fill covers its lower 65%; no console errors.

## Cross-part issues

Problems that touch more than one part (rewards that move, D-ids reused, locks, saves).

- **X1. Every customer arrives by the bell (D26).** Bram (TC1) is the exception: he opens the game before the bell exists (D27-D28 introduce it). Every later TC and GC must wait for a ring; to check part by part (today Garric has his own bell, `tutGarricBell`).
- **X2. Part 2 TC3 reward removed (D31).** Part 2 flow step 9 changes to: sale to TC3, no reward window.


## Art needed

The full list, kept up to date part by part: `specs/2026-10-07-ftue-v3-art-list.md`.

## Log

- 2026-10-07: tracker opened; baseline recorded.
- 2026-10-07: part 1 described by the owner; compared with the build; 7 issues, 7 questions.
- 2026-10-07: owner answered Q1-Q7 (decisions D1-D9, with the trait and shape chart). Lines drafted;
  7 more issues (I8-I14), 5 more questions (Q8-Q12). Art list started.
- 2026-10-07: owner answered Q8-Q12 (D10-D14): the dragon buys the base blueprints at GC1 and GC2, the
  player buys the Katana at GC3; banner to Garric; gold top-up; grindstone story for part 2; "?" traits.
  Part 1 flow and lines redrafted; I15-I19, Q13-Q15.
- 2026-10-07: owner answered Q13-Q15 (D15-D17). Part 1 planning complete.
- 2026-10-07: part 2 described by the owner; compared with the build; I20-I28, Q16-Q22; lines D32-D32c drafted.
- 2026-10-07: owner answered Q16-Q22 (D18-D24). Part 2 flow written; I29-I30; Q23 open.
- 2026-10-08: part 3 described by the owner; Durable and nickel measured in the build (2 ground nickel pass 43 from Durable, 34 needed); I31-I38, Q24-Q31; lines D92b-D92j drafted. Part 2 I21 measured (raw miss 139, ground hit 2).
- 2026-10-08: owner answered Q24-Q31 (D25-D32): Durable offset to Fine, every customer by the bell, the light part, one cave trip, no rewards for TC3 and GC4-GC7. Part 3 flow written; I39-I40; cross-part X1-X2.
- 2026-10-08: part 4 described by the owner (TC4 Epic Durable with the pull lesson, TC5 gale, GC8 Weak balanced; Bram TC6, Garric TC7). Measured one Durable point for parts 3 and 4: (1577, 740). I41-I47, Q32-Q37; lines drafted.
- 2026-10-08: owner answered Q32-Q37 (D33-D38). Part 4 flow written; I48-I49.
- 2026-10-08: part 5 described by the owner (TC6 Bram: swift Dagger, sharpening wheel reward, diary; GC9 gale Longsword bought by the dragon). I50-I55, Q38-Q42; lines drafted.
- 2026-10-08: owner answered Q38-Q42 (D39-D43). Part 5 flow written; I56-I57, D111b drafted.
- 2026-10-08: part 6 described by the owner (Garric, the design desk, the banner and decor lesson, Day 3, the skill tree). I58-I66, Q43-Q48; ending order proposed.
- 2026-10-08: owner answered Q43-Q48 (D44-D49). Day 3 lines D87a, D88a, D89a drafted. All six parts planned.
- 2026-10-08: owner closed the last questions (D50-D53). Planning complete.
- 2026-10-08: shared systems built (market, coins, shaped orders, Durable key, buttons, no CRAFT 5).
- 2026-10-08: part 1 built (market lesson, three shaped GCs, no part 1 rewards, 9 + 9 ore).
- 2026-10-08: part 2 built (TC2 raw-ore step and grindstone gift, no bulk order, TC3 without the design desk or a reward).
- 2026-10-08: part 3 built (Day 2 without the skill tree, GC4 Durable lesson with the moved trait, GC5-GC7 fire with the market).
- 2026-10-08: part 4 built (TC4 Epic Durable and the pull lesson, TC5 with the reminder, GC8 Weak stop, tiered orders).
- 2026-10-08: part 5 built (Bram's Dagger bought by the dragon, the sharpening wheel as a reward, GC9).
- 2026-10-08: part 6 built (Garric's design desk and lesson, the banner and its lesson, the second night, Day 3 and the skill tree, D140). FTUE v3 complete.
- 2026-10-08: GC1-GC3 guided through the whole craft (owner request).
- 2026-10-08: fix - the guide now notices the route end (mug arrow, TC4 pull lesson).
- 2026-10-08: the requested shape highlighted in the shape window (whole game); the trait ring goes once the order is crafted.
- 2026-10-09: play-test fixes (exits, the dragon on every screen, GC5/GC6 book guides, the Day 2 cave for all of Day 2 + 5).
- 2026-10-09: the trait ring made bright, glowing and rippling.
- 2026-10-09: rising blueprint prices, 25 traits in a sliding market.
- 2026-10-09: the customer waiting system (COME LATER, the ledger list, the waiting customer at the end of part 4).
- 2026-10-09: the quest list (two pages of seven, 20g + 20 xp each).
- 2026-10-09: the new Sword crafted window; the hammering saved in the recipe.
- 2026-10-09: the QUEST button glows green when there is something to claim.
- 2026-10-09: the crafted window enlarged to the wireframe.
- 2026-10-10: the first crafted window's lesson (D17a-D17c, then CLOSE).
- 2026-10-10: the hurt fire sword's window (new D69d, the Health row and its gold lost).
- 2026-10-10: the Day 2 cave holds 7 more iron and 7 more manganese for Garric.
- 2026-10-10: the Day 3 cave holds the same, + 15 aluminium (supersedes D48).
- 2026-10-10: Day 3's skill tree lesson goes through the cave and the pickaxe (D89b-D89d).
- 2026-10-13: a step the player already finished moves on (`TUT_SKIP`, every frame).
- 2026-10-13: the crafted sword flies into its own slot like the coins; the slot shows when it lands, with a pop and sparks.
- 2026-10-13: the mug stays in front of the bucket and glows while the sword rests on a trait.
- 2026-10-13: the dragon's continue button reads OK.
- 2026-10-13: the fire run's last ore is a choice: full iron (crosses a moved speck) or full manganese (goes round it).
- 2026-10-13: the fire run's cave holds 3 iron (was 2), so the iron choice has its ore.
- 2026-10-13: the pickaxe stays in the cave at one spot (no bag, no stowing); D66 rewrite proposed, D67 counts 3 iron.
- 2026-10-14: the customers' "tap to continue" is the OK button.
- 2026-10-14: the grindstone is fully hidden until it is given.
- 2026-10-14: the basement background without the polishing desk (re-encoded .webp; the desk art kept, unused).
- 2026-10-14: the craft book: box headings, the page's own sword, and the shapes actually unlocked.
- 2026-10-14: the craft book's middle column: one Trait Tier box and a sword description (24 placeholders).
- 2026-10-14: the crafting process starts with "Ores".
- 2026-10-14: no "0g bonus": the lesson's DONE waits for the green band; D57 only with a bonus.
- 2026-10-14: the mug glows only for a pour that adds a trait or a better tier.
- 2026-10-14: no arrow out of a closed inventory tab (the tab glow is enough).
- 2026-10-14: the Durable and Weak crafts stop pointing at the mug once the pour is done.
- 2026-10-14: the waiting customer's guide (D107f-D107h: the ledger, craft both, call them back).
- 2026-10-14: r231 the customer's dialogue text is 50% bigger (17px -> 25.5px).
- 2026-10-14: r232 the inventory tabs are icons (ore, ingot, sword, banner); "Items & Decor" is "Decor".
- 2026-10-14: r233 the Ingots tab icon is the shelf's metal orb, not the ingot bar.
- 2026-10-14: r234 the customer's dialogue text is 25% smaller (25.5px -> 19.125px).
- 2026-10-14: r235 the crafted card shows the health % and forging % under the heart and the hammer.
- 2026-10-14: r236 the dragon returns to his top-left spot on every return to the forge screen (and homeDragon is fixed).
- 2026-10-14: r237 the whole sharpening wheel can be tapped (the table sword's art box no longer covers it).
- 2026-10-14: r238 a counter sword goes back to the inventory after Bram's opener (takeCounter ignored 'done').
- 2026-10-15: r239 CRAFT 1 stops glowing after the craft; in the FTUE it is locked while the order is already made.
- 2026-10-15: r240 the cave pickaxe glows on every arrival until the player touches it.
- 2026-10-15: r241 the cancel-craft X asks "Are you sure you want to cancel the crafting? Ores will not be refunded."
- 2026-10-15: r242 every pointer glow is the OK glow (buttons) or the tab glow (rail buttons); the clipped halo is gone.
- 2026-10-15: r243 the sword's health is a ring around its map marker; the top-right bar is gone.
- 2026-10-15: r244 the customer's line is left-aligned, so it types left to right.
- 2026-10-15: r245 GC5: D92m "Let's go to the forge.", then the forge goes dark but the fire trait (D92n).
- 2026-10-15: r246 "tap", not "click": D92n reworded; a test bars "click" in dialogue.
- 2026-10-15: r247 D130 has no "on my own" answer; its OK goes on to the design desk.
- 2026-10-15: r248 the customer's trait stops glowing once a sword with that trait is crafted.
- 2026-10-15: r249 leaving the basement puts the table sword back in the bag (and loading a save made elsewhere).
- 2026-10-15: r250 no toast when the basement sword goes back to the bag.
- 2026-10-15: r251 a route of 5+ fully ground irons (drawn length) runs the sword x2; hazard damage per distance kept.
- 2026-10-15: r252 gameplay customers say a random thank-you by tier (CUST_THANKS, 5 Epic / 5 Fine / 5 Weak).
- 2026-10-16: r253 the come-later customer: MARKET, both blueprints lit, Close, then D107d and COME LATER.
- 2026-10-16: r254 the GC4 map window (basic vs elemental) shows the owner's MAP_parts2.
- 2026-10-16: r255 after the quest list: D119a "tap me for help", the dragon glows, a tap gives D119b, then the bell.
- 2026-10-16: r256 the health is a fill inside the sword disc (top 100% to bottom 0%); the ring covered the tier ring.
