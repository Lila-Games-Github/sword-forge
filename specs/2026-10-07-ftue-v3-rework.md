# FTUE v3 rework: tracker

Status: **planning complete 2026-10-08; shared systems and part 1 built 2026-10-08; parts 2-6 not built.** Opened 2026-10-07. Build: `Swordforge_looptest_landscape.html`.

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
