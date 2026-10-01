# Tutorial in parts: plan (DRAFT, not implemented)

Status: **approved 2026-09-29; part 1 being built** on branch `Swordforge_FTUE_v2`. Build:
`Swordforge_looptest_landscape.html`. All 6 parts are defined. When this is approved
it becomes the design record, and a test will assert the code matches the tables below.

Terms: **TC** = tutorial customer (scripted). **GPC** = gameplay customer (random portrait, real order).

## Parts table

| Part | Tutorial step | Gameplay step | Rewards (after the named sale) |
| --- | --- | --- | --- |
| 1 | First balanced sword, sale to Bram (D1-D26). Quest list arrives. Bell tutorial (D27-D28). | GPC1 and GPC2 each ask for **one balanced** sword. | Bram: **shop banner** (decor). GPC1: **Longsword blueprint**. GPC2: **Broadsword blueprint** + **grindstone** (ore grinding wheel). |
| 2 | TC2 (4th customer): grinding + updating the recipe (D29, D31-D43). | GPC3 asks for **5 balanced swords in one order**, so the player must use bulk craft (CRAFT 5). | TC2: **+5 recipe pages** (8 in total). GPC3: **design desk**. |
| 3 | TC3 asks for the **fire sword** (the adventurer, D59-D63). Cave and ore gathering (D64-D65). Fire sword craft (D66-D78). **Design desk tutorial** (decorating, D79-D85). Sale, **Day 1 ends** (D86-D88). Day 2 opens with the **skill tree** (D89-D94). | GPC4 wants **fire**, GPC5 wants **balanced**, GPC6 wants **fire**. | TC3: **balanced parts x3** (1 grip, 1 pommel, 1 guard) + **fire parts x3** + **fire Longsword blueprint**. GPC4: **fire Broadsword blueprint**. GPC5: nothing. GPC6: **fire parts x3**. |
| 4 | TC4 asks for the **gale sword** (the Day 2 gale order). Teaches **tier alignment** (D97 + the tier window), **storing a metal with its traits in the inventory** (D99), and crafts the **swift** and **gale** swords (D95-D107). | GPC7 wants **gale**, GPC8 wants **fire**. | TC4: **gale Longsword blueprint** + **gale parts x3**. GPC7: **gale Rapier blueprint** + **gale parts x3**. |
| 5 | TC5 = **Bram returns** (D110-D113). He wants a swift sword, **sharpened**: new line after D111. The stored **swift ingot** is used (D112-D113). **Sharpening in the basement moves here** (D48-D55). Sale to Bram, then the **diary** (D114-D117). | GPC9 wants **gale**, GPC10 wants **swift**. | Bram: **diary**. GPC9: **swift Dagger blueprint** (r208; was the swift Rapier). GPC10: **swift parts x3**. |
| 6 | TC6 = **Garric** (D120-D139) runs and **ends the FTUE**. `lastLine()` is D139, so the guide-to-pet switch still happens at the end. | none | (Garric's existing gift) |

Customer order: Bram (TC1), GPC1, GPC2, TC2, GPC3, TC3, GPC4, GPC5, GPC6, TC4, GPC7, GPC8.

**Blueprints are per trait AND shape** (for example "fire Longsword"). Shapes by trait: balanced and
fire use Shortsword / Longsword / Broadsword; **gale uses Rapier in place of Broadsword**, and **swift uses Dagger** (`swift_dagger_blade`, r208; it was Rapier until then)
(owner, 2026-09-29).

**Not placed in any part yet** (current beats with no part): sharpening in the basement (D48-D55,
and D56/D57, the sale reaction to a sharp sword); Bram
returns (D108-D114, and his restore of the stored swift ingot); the diary gift (D115-D119, its quest
list has moved to part 1); Garric (D120-D139).

## Owner decisions (2026-09-29)

- **Ore:** the player starts with **12 iron and 12 manganese** in the inventory (now `ORE_START` is 2 + 2).
  The first tutorial craft must accept **only 2 iron and 2 manganese**.
- **Grindstone** = the ore grinding wheel on the forge bench (`#stMortar`), not the basement
  sharpening wheel. Locked until the GPC2 reward.
- **Quests:** the quest list moves to part 1. The first two quests are **"Sell a sword"** and
  **"Craft a sword"**, and they are **already complete** when the list arrives. The other five
  (`epic5`, `noRefuseDay`, `discover3`, `update3`, `openShop`) stay as they are for now.
- **TC2 line D29:** "Give me a good, sharp one." becomes "Give me a good one." Sharpening moves to a
  later part. The "man walking out" in D29 is now taken to be GPC2; the line otherwise stays.
- **Recipe pages:** 3 pages (see Open 2 for the count after the reward).
- **GPC3:** one customer, one order, 5 balanced swords.
- **Shop banner:** a decor item the player places in the background. This needs a **build mode**:
  take decor items from the inventory and place them around the **counter, shop and bedroom**.
  Owner will provide the art; a **placeholder square** is used until then.
- **Console helper:** a hidden console function to start at the beginning of any part, for testing.

## What is kept

- The full craft loop and map; D1-D28 as they are; the D32-D43 grind + record-craft beat (with the
  wording fixes below); random customers (`nextCustomer`, `ringBell`); bulk craft (`cbCraft(n)`, CRAFT
  1 / 5); the dialogue system (permanent D-ids, `sayQueue`, pointers, glows).
- Everything after part 2 keeps its current order until parts 3-6 are defined.

## What is reworked

- **Part system:** a part number beside `TUT_STAGE`. Each part = tutorial step, then gameplay step.
  In a gameplay step the tutorial gates are off and the locks stay on. The sale that ends a step
  gives its reward and starts the next part.
- **Locks (new):** Longsword, Broadsword, grindstone, design desk, recipe pages beyond the limit. Now
  nothing is locked; all three shapes are open and the default blade is Longsword
  (`DD_BLADE='balanced_longsword_blade'`), so the default becomes **Shortsword**.
- **First-craft ore gate:** with 12 + 12 on the shelf, the `ore` stage needs a gate like
  `fireOreWanted()` that accepts 2 iron + 2 manganese and nothing more.
- **Random customer orders:** `askedTrait()` sometimes picks an **undiscovered** trait
  (`CUST_DISCOVERED`). In parts 1-2 the GPCs must ask for balanced. GPC3 needs a new order type
  (quantity 5); now every customer buys one sword.
- **Quests:** two new quest entries, pre-completed, and the quest list moves from the Day 2 diary gift
  (D115-D119) to part 1. New dialogue line(s) to hand it over.
- **Recipe book:** now unlimited, and it saves a page by itself for every new trait
  (`recordRecipe`). A page limit changes that, D42/D43, and the save file.
- **Reward window:** one window for every reward, built from the Sword Crafted window parts.
- **Build mode (new system):** decor inventory, a way to enter and leave build mode, placement on 3
  screens, and saving the positions.
- **Save:** the save does not keep the tutorial position now. Save the part number, unlocks and
  rewards at each part boundary.

## New wording for D31-D34 (owner, 2026-09-29)

| id | owner text | check |
| --- | --- | --- |
| D31 | "So many customers. No tea break for us. Back to the forge we go." | OK |
| D32 | "Hmm, we are low on ores. Why don't we use the grindstone to use our ores more efficiently?" | "use ... to use" repeats; see Open A |
| D33 | "We can travel further on the map if we grind the ores before we put it in the smelter." | "ores ... it" should be "them"; see Open A |
| D34 | "If we do it properly, we can craft 6 more swords instead of just 3!" | true only if the player has exactly 6 + 6 here; see Open B |

The D34 numbers: 12 + 12 at the start, minus 2 + 2 for Bram's sword and 2 + 2 for each GPC sword,
leaves **6 iron + 6 manganese**. The unground recipe (2 + 2) makes 3 swords from that; the ground
recipe (1 + 1) makes 6: the TC2 sword plus the 5 for GPC3. It works out exactly.

## More owner decisions (2026-09-29)

- **Recipe pages:** start with **3**; the TC2 reward adds 5, **8 in total**.
- **Pre-completed quests** pay on arrival: **10g and 20 exp each** for now (placeholder values, to be
  tuned). The other quests keep `QUEST_REWARD` / `XP_QUEST`.
- **Build mode:**
  - Placement **anywhere**, on a **background layer**: behind the customer, the counter, the dragon,
    and the racks and tables in the shop.
  - A placed item can be **put back in the inventory**.
  - A **build mode on / off button** in the inventory's items and decor tab.
- **Grindstone between GPC2 and TC2:** it becomes visible (unlocked) after the GPC2 sale, but the
  player **cannot use it** yet. Tapping it shows a message like "Proceed with the tutorial". After
  the GPC2 sale the guide points to the counter (if the player has left it) and then to the bell;
  ringing it brings TC2 and continues the tutorial.

## Settled 2026-09-29

- **D32 / D33 final text:**
  - D32 "Hmm, we are low on ores. Why don't we use the grindstone to make our ores go further?"
  - D33 "We can travel further on the map if we grind the ores before we put them in the smelter."
- **Keeping D34 true (the GPC crafts in part 1):** if the player puts **3 or more iron, or 3 or more
  manganese** in the smelter, the dragon says a **new line** (next free id beside D28/D29, never
  appended): "Use 2 iron and 2 manganese for the balanced sword." (wording checked: OK). Below the
  line is a **Retry** button. Retry gives the ores in the smelter back to the inventory and clears the
  route, so the player can start the sword again. Mechanism to reuse: the optional choice button from
  r189 (D130a, `sayChoose(list, true)`). The give-back must loop `segs` and call `gainOre`:
  `refundOre()` is the Restore Ore talent, not a refund (HANDOFF gotcha).

## Open questions

- **C. Other ways to lose ore.** A blade can still lose its ores without too many going in: a hazard
  can break it (blade HP), or the player can cancel the craft (that gives nothing back). Then the
  player reaches TC2 with less than 6 + 6. Proposal: also set iron and manganese to exactly 6 each
  when TC2 arrives, as a safety net.
- **D. Too few ores.** If the player heats the smelter with fewer than 2 of one ore (for example
  2 iron + 1 manganese), does the same line and Retry show?

## Parts 3-4: what is kept, what is reworked

Kept: the adventurer (D59-D63), cave (D64-D65), fire craft (D66-D78), decorating (D79-D85), Day 1
end (D86-D88), Day 2 morning and skill tree (D89-D94), swift + gale run (D95-D107, with the r198
stop on Gale), the tier window (r190), storing an ingot (`stashIngot`). These are already in this
order, so parts 3 and 4 are mostly the current script with gameplay steps put between the beats.

Reworked:
- **Design desk parts are locked by default.** Now every part in a set (`DD_SETS`) is open. Rewards
  of "x3" unlock one grip, one guard and one pommel of that set.
- **Blueprints per trait + shape.** Now `CB_SHAPES` is one list for every trait. It becomes a list
  per trait, with Rapier for swift and gale, and each (trait, shape) pair locked until its blueprint.
- **Scripted GPC orders.** GPC4-GPC8 each ask for a named trait. Now a random customer asks for a
  random trait.
- **Tutorial cave** (`setTutorialCave`) stocks exactly 2 iron + 2 manganese, for the fire sword only.
- **Day 2 cave** gives copper for swift + gale. It must also cover GPC7 (gale) and GPC8 (fire).

## Parts 3-4: complications found

1. **Decorating comes before the reward.** The design desk tutorial (D79-D85) decorates the fire
   sword **before** the sale to TC3, but the fire parts are the TC3 reward. With parts locked, the
   design desk would have no fire parts to show in its own tutorial.
2. **Ore for part 3 gameplay.** After part 2 the player has 0 iron and 0 manganese (the 6 + 6 are
   used exactly). The cave gives 2 + 2 for TC3. GPC4 (fire), GPC5 (balanced) and GPC6 (fire) need
   about 5 more iron and 5 more manganese.
3. **Copper for part 4.** Swift uses 2 copper and gale uses 5. GPC7 (gale) needs 5 more. The Day 2
   cave must give at least 12 copper, plus iron and manganese for GPC8 (fire).
4. **No gale art.** Gale has no parts art and no blade art: a gale sword borrows the balanced blade
   (`DD_SKIN_OF` has no gale). Gale parts x3 (twice) and the gale blueprints need art or placeholders.
5. **Rapier art.** There is a `balanced_rapier_blade` image, but no swift or gale rapier, and the
   hammer minigame has mid-blade art only for Shortsword, Longsword and Broadsword.
6. **Swift shapes.** Swift uses Rapier in place of Broadsword, but no reward unlocks any swift shape.
   Swift has a `dagger` blade today, which the new shape list does not use.
7. **Bram and the stored swift ingot.** Now Bram returns (D108-D114) and takes the stored swift
   ingot. If Bram moves to part 5 or 6, the player must still have that ingot after GPC7 and GPC8.

## Parts 3-4: open questions

- **E.** Complication 1: give the fire parts before the decorating tutorial (and keep x3 after TC3
  as extra), or make the design desk tutorial use balanced parts?
- **F.** Complication 2 and 3: where does the extra ore come from: more ore in the tutorial caves,
  a free cave trip in the gameplay step, or a reward?
- **G.** Which parts and shapes does the player have at the start? Proposal: 1 grip, 1 guard,
  1 pommel of each set, and Shortsword for every trait.
- **H.** Complication 4 and 5: placeholder squares for gale parts, and the balanced blade art for
  gale and swift rapier, until the art comes?
- **I.** Swift shapes: does swift unlock Longsword and Rapier anywhere, and is the dagger removed?
- **J.** Where does Day 2 end?

## Settled 2026-09-29 (parts 3-4 answers)

- **Parts (E, G):** the player starts with **9 parts: 3 grips, 3 guards, 3 pommels**. More come with
  rewards later. Until the owner's art lands, **placeholders repeat the existing part images**. The
  decorating tutorial uses these starting parts, so it no longer waits on the TC3 reward.
- **Shapes (G, I):** **Shortsword is open for every trait from the start.** The rewards unlock the other
  two shapes (Longsword + Broadsword, or Longsword + Rapier for swift and gale). Swift Longsword and
  swift Rapier are **not part of the FTUE**. The swift **dagger stays** in the code.
- **Day 2 ore (F):** the ore gathering that now comes during TC4 (the gale order: `d2-bell` →
  `d2-ask` → `d2-cave` → `d2-mine`) **moves to right after the skill tree tutorial** (D89-D94). The
  Day 2 cave then holds everything Day 2 needs **plus 5 of each ore**:

  | Day 2 use | iron | manganese | copper |
  | --- | --- | --- | --- |
  | GPC4 fire (2 iron + 2 manganese) | 2 | 2 | |
  | GPC5 balanced (recorded ground recipe, 1 + 1) | 1 | 1 | |
  | GPC6 fire | 2 | 2 | |
  | TC4: swift (2 ground copper) | | | 2 |
  | TC4: gale (4 ground + 1 raw copper) | | | 5 |
  | GPC7 gale | | | 5 |
  | GPC8 fire | 2 | 2 | |
  | **needed** | **7** | **7** | **12** |
  | **in the cave (+5)** | **12** | **12** | **17** |

  If a player makes GPC5 with the old unground recipe (2 + 2), the +5 covers it.
- **Art (4, 5):** a full list of the art needed is given to the owner when planning is done.
- **Stored swift ingot (7):** during the FTUE, if the player tries to take the swift ingot out of the
  inventory (drag it to the anvil), the dragon says a new line and the ingot snaps back into the
  inventory. Owner text: "Use it later. we don't need that now." Wording check: "we" starts a new
  sentence, so it should be "**We**". Proposed: "Use it later. We don't need that now."
- **Day 2 end (J):** not part of the FTUE.

## Open questions (after parts 3-4 answers)

- **K. Starting parts:** are the 9 parts one shared set used on every sword (balanced, fire, gale,
  swift), or 9 per trait set?
- **L. Day 2 cave length:** 12 + 12 + 17 = **41 ores**, one per swing. The current Day 2 cave is 35
  swings, and the script already lists that as possibly too long. Options: 2 or 3 ores per swing, or
  keep 41. Also: do aluminium and nickel leave the Day 2 cave (the FTUE does not use them)?

## Settled 2026-09-29 (K, L)

- **K. Starting parts are per trait:** balanced, fire, gale and swift **each** start with their own
  9 parts (3 grips, 3 guards, 3 pommels) = 36 parts in total. Placeholders repeat existing images
  where a set has fewer than 3 (for example flame pommels: 2 exist; gale: none, so it borrows).
- **L. Day 2 cave:** iron 12, manganese 12, copper 17, **aluminium 7** (kept, not used by the FTUE),
  **nickel removed**. **2-3 ores per swing** (proposed: a random 2 or 3, and the last swing of a seam
  takes only what is left). 48 ores = about 16-24 swings, against 35 now.

## Parts 5-6 notes (2026-09-29)

- **New Bram line** (after D111). Owner text: "the previous sword was good, but it wasn't very sharp.
  can you make it sharper?" Wording check: two sentences must start with capitals. Proposed: "The
  previous sword was good, but it wasn't very sharp. Can you make it sharper?"
- **D118 / D119** (the dragon hands over the quest list) are the dragon's own lines, not Bram's.
  They **move to part 1** with the quest list. D115-D117 (the diary) stay with Bram in part 5.
- **D56 / D57** (a customer's reaction to a sharp sword, and the sharpness bonus) were written for
  TC2's "sharp" order. With sharpening in part 5, Bram's D114 replaces D56; see Open O for D57.
- **Swift Rapier** is now a part 5 reward. This overrides the earlier note "swift Longsword and Rapier
  are not part of the FTUE" for the Rapier only. Swift Longsword stays out of the FTUE.
- **Copper for part 5.** GPC9 (gale) needs 5 copper and GPC10 (swift) needs 2. The Day 2 cave's +5
  spare copper is not enough (7 needed). Proposal: the Day 2 cave copper becomes **24**
  (12 + 7 = 19 needed, +5). Part 5 is still Day 2, so it is the same cave.
- **Customer order (full):** TC1 Bram, GPC1, GPC2, TC2, GPC3, TC3, GPC4, GPC5, GPC6, TC4, GPC7, GPC8,
  TC5 Bram, GPC9, GPC10, TC6.

## Open questions (parts 5-6)

- **M.** Which sale gives which reward? Proposal: GPC9 (gale) gives the swift Rapier blueprint,
  GPC10 (swift) gives swift parts x3.
- **N.** Is TC6 Garric (D120-D139)?
- **O.** Keep D57 ("We got {b}g bonus this time!...") after Bram pays for the sharpened sword?
- **P.** Day 2 cave copper 24, as proposed above?

## Art needed (draft, counted from the existing files in `assets/`)

Parts: each trait needs 3 of each piece at the start, +1 of each per "parts x3" reward.

| Trait | Needs (grip / guard / pommel) | Has now | **To make** |
| --- | --- | --- | --- |
| balanced | 4 / 4 / 4 (start + TC3) | 6 / 6 / 6 (r211: 5-6 of each are Garric's gift) | none |
| fire (flame) | 5 / 5 / 5 (start + TC3 + GPC6) | 5 / 5 / 5 (r211) | none |
| gale | 5 / 5 / 5 (start + TC4 + GPC7) | 5 / 5 / 5 (r211) | none |
| swift | 4 / 4 / 4 (start + part 5) | 5 / 5 / 5 | none |

Blades (`assets/sword-parts/blades/`):
- **gale_shortsword_blade**, **gale_longsword_blade**, **gale_rapier_blade** (gale has no blades; it
  borrows balanced now).
- ~~**swift_rapier_blade**~~ **not needed since r208**: the swift third shape is the Dagger, which has art (`swift_dagger_blade`).

Hammer minigame (`assets/hammer/`):
- **balanced_rapier_midblade** (mid art exists only for short, long and broad).

New items and UI:
- **Shop banner** (decor item; placed art + its inventory icon). Placeholder square until then.
- **Build mode on / off button** (items and decor tab).
- **Blueprint** icon (reward window + inventory).
- Reward icons: **grindstone unlock**, **+5 recipe pages**, **design desk unlock**, **sword parts**.
- **Locked** look: a locked shape in the shape window, the locked grindstone, the locked design desk.

Not needed: customer portraits (TCs use existing art, GPCs use the random pool), cave seams
(aluminium, iron, manganese, copper exist), the diary.

## Settled 2026-09-29 (M, N, O, P): planning complete

- **M.** GPC9 (gale) gives the **swift Rapier blueprint**; GPC10 (swift) gives **swift parts x3**.
- **N.** TC6 is **Garric** (D120-D139). The FTUE ends on D139.
- **O.** **D57 is kept**, after Bram pays for the sharpened swift sword.
- **P.** Day 2 cave copper is **24**. Final Day 2 cave: iron 12, manganese 12, copper 24, aluminium 7,
  2-3 ores per swing (55 ores, about 19-28 swings).

**Next:** turn this plan into the design spec + tests (asserting the tables), then build part by part,
starting with the console helper and part 1. Nothing is built until the owner says to start.

## Part 1 build record (2026-09-29)

The values below live in one object, `FTUE`, in `Swordforge_looptest_landscape.html`, and
`node tooling/ftue/ftue.test.mjs` asserts the object equals this table.

| Key | Value |
| --- | --- |
| `oreStart` | iron 12, manganese 12 (`ORE_START` reads it) |
| `firstCraft` | iron 2, manganese 2 (the most the first tutorial sword accepts) |
| `gpcCraft` | iron 2, manganese 2 (part 1 GPC swords: 3 or more of one = D28a + Retry; fewer than 2 of one at the gate tap = D28a + Retry) |
| `preQuests` | `sellOne` "Sell a sword" and `craftOne` "Craft a sword", **10g + 20 exp** each, completed when the list arrives |
| `startShape` | Shortsword, open for every trait |
| `shapes` | balanced / fire: Shortsword, Longsword, Broadsword. gale / swift: Shortsword, Longsword, Rapier |
| part 1 `gpc` | 2 customers, each 1 balanced sword |
| part 1 rewards | after Bram: decor `banner`. After GPC1: blueprint balanced Longsword. After GPC2: blueprint balanced Broadsword + grindstone (visible, not usable until TC2) |
| `decor.banner` | placeholder rectangle, 10% x 24% of the screen |
| `retryLine` | D28a "Use 2 iron and 2 manganese for the balanced sword." |

Dialogue changed in part 1: **D29** "...Give me a good one." and **D31** "So many customers. No tea
break for us. Back to the forge we go." (both are spoken when TC2 arrives, the last beat of part 1).
D32-D34 change with part 2.

Part 1 flow: D1-D25 unchanged, D26, **reward window (banner)**, D118 (quest button lights; the two
pre-completed quests pay), the player opens and closes the list, D119, D27, D28, bell → **GPC1**
(sale → Longsword blueprint), bell → **GPC2** (sale → Broadsword blueprint + grindstone), bell
glows (a pointer leads back to the counter if the player left) → **TC2** (D29, D31), and the old
flow continues from there.

A GPC only buys a sword that has the trait they asked for. Build mode: an ON / OFF slot in ITEMS &
DECOR; decor drags from the tab onto the counter, shop or bedroom, sits behind every prop and the
dragon, can be dragged again, and goes back to the inventory when dropped on the inventory panel.
Console helper: `ftuePart(1)` = a new game; `ftuePart(2)` = the start of part 2 (TC2 at the bell,
with part 1's rewards, 6 + 6 ore and the balanced recipe).

Deferred to part 2 on purpose (they would break the old flow that still runs after TC2): the design
desk lock, the recipe page limit, the 6 + 6 safety net, D32-D34.

Also fixed in part 1 (older bug, found while testing): the menu's New Game called `sayNext()`, which
does nothing at the start of a run (r106), so a new game never spoke D1. It now calls `sayStart()`,
as the page load does. `ftuePart(1)` depends on it.

## Part 1 fixes (owner play-test, 2026-09-29), r200

- **First sword, spent ore:** once the smelter holds 2 iron, the iron slot on the shelf goes **grey and
  ignores presses**, with **no message**; the same for manganese (`ftueFirstSpent`). Replaces r199's
  toast "For this sword use only 2 iron and 2 manganese".
- **Banner beat (pointers only):** after the banner reward window: ITEMS & DECOR tab halo → BUILD slot
  blinks → a drag arrow runs from the banner slot to the wall of the **counter** screen → once the
  banner is on the counter screen, BUILD blinks again → BUILD off → D118. D118 waits until BUILD is
  off. Stages `p1-decor-tab` / `-build` / `-drag` / `-off`, all worked out by `ftueDecorStep()`, which
  `buildShelf()` and `setBuild()` call (the shelf rebuilds its slots, so a blink must be re-applied).
- **Quest CLAIM:** a finished quest no longer pays by itself. Its reward cell shows **CLAIM <gold>g**.
  Pressing it flies 5 coins from the button to the gold counter (650 ms each, 70 ms apart); the gold
  **and the exp** land, with a "+<gold>g" pop at the counter, only when the coins arrive. The quest
  done message is now "Quest complete: claim your reward in the quest list". `claimed` is saved.
- **Part 1 quest step:** both FTUE quests' CLAIM buttons blink; the list cannot close until both are
  claimed; then Close blinks; closing it gives D119, D27, D28 as before.

## Part 2 build record (2026-09-29), r201

New `FTUE` values (asserted by the test): `recipePages` 3; `tc2Ore` iron 6 + manganese 6;
`tc2Craft` iron 1 + manganese 1; part 2 `gpc` = one customer, 5 balanced; `ensureOre` iron 5 +
manganese 5; `after` 'bell2'; rewards: TC2 **+5 recipe pages**, GPC3 **design desk**. D32-D34 carry
the owner's text (with the D32/D33 fixes).

Flow: TC2 at the bell (D29, D31) → the forge (D32-D35): iron and manganese are **set to 6 + 6**
(safety net), and the TC2 sword is capped at 1 + 1 the same silent way as the first sword (the
slot greys) → grind, smelt, hammer, record craft (D36-D43), shape (D44-D47) → **no basement**:
D55 "Back to the counter now." → D23 at the counter → sale → D56 → "Thank you." → **reward
window (+5 pages)** → D58 → the bell brings **GPC3** ("I need 5 Balanced swords. Can you make them
all?"). Iron and manganese are topped up to at least 5 + 5 when GPC3 arrives.

GPC3 pointers (only): the CRAFT BOOK button → the balanced page with the fewest ores (the ground
one) → CRAFT 5 → (shape window, craft window) → the book's close button → a drag arrow from the
sword to the counter. GPC3 buys one sword at a time and stays ("Good. N more, please.") until the
fifth; then the **design desk** reward, and the bell (`bell2`) brings **TC3**, the adventurer, which
opens part 3 (the old flow from D59 on).

Locks now on: the **design desk** (prop greyed in the basement, "The design desk is locked") until
the GPC3 reward; the **craft book page limit** (3, 8 after the reward), which blocks automatic
recording of a new trait, "record new", and a first-time "Update", each with a "craft book is full"
message.

Not in part 2 any more: D48-D54 and D57 (sharpening, and its bonus line); they return in part 5.
Console / cheat bar: `ftuePart(3)` and a PART 3 button start part 3 (TC3 at the bell).

New customer wording for the owner to check: "I need 5 Balanced swords. Can you make them all?" and
"Good. N more, please."

## Fixes (owner play-test, 2026-09-29), r202

- **Empty recipe pages show:** the craft book's bookmark row draws one blank `bookmark_paper` for
  every free page, up to the page limit (3, then 8). They have no symbol and do nothing when tapped.
- **The grindstone reward is the forge's grinding wheel.** The lock was already on the forge
  grinder (`#stMortar`, art `anchor_grindwheel.webp`), but the reward window showed
  `grindstone.webp`, which is the **basement sharpening wheel**. The window now shows
  `anchor_grindwheel.webp`, and its text says "on the forge bench".

## Part 3 build record (2026-09-29), r203

New `FTUE` values (asserted by the test): `startParts` 3; part 3 `gpc` = fire, balanced, fire (one
each); `after` 'd2-bell' (the bell that brings TC4); rewards: TC3 **balanced parts x3 + fire parts
x3 + fire Longsword blueprint**, GPC4 **fire Broadsword blueprint**, GPC5 nothing, GPC6 **fire parts
x3**; `day2Cave` iron 12, manganese 12, copper 24, aluminium 7 (no nickel); `day2Swing` [2, 3].

**Design desk parts are earned.** `ddSet()` shows the first `startParts` of each kind for the sword's
set, plus one per `parts` reward for that set (`FTUE_ST.dd`, per skin: fire is `flame`). Garric's
bonus parts still add on top. Fire needs more parts than there is art for, so `DD_ALIAS` gives
`flame_grip4-5` and `flame_pommel3-5` (the art-list names) an existing image and `DD_EXTRA` puts
them at the end of the flame set. When the real file lands, delete its `DD_ALIAS` entry.

Flow: TC3 at the bell (the adventurer, D59-D63) → cave (D64-D67) → fire craft (D67a-D78) →
decorating with the starting parts (D79-D85) → sale (D86) → "Thank you." → **reward window (TC3)** →
D87, bed, D88 → Day 2: the tutorial's night stocks the **Day 2 cave** (`ftueDay2Cave`) → D89-D91 and
the skill tree → **D94 and D94b: the cave, right after the skill tree** (moved from after TC4's order)
→ each swing takes 2-3 (the last swing on a seam takes what is left) → D92 "Let's go check the
counter." → the bell brings **GPC4 (fire), GPC5 (balanced), GPC6 (fire)**, each refusing another
trait → the bell (`d2-bell`) brings **TC4** (D93, part 4 opens) → TC4 now sends the player to the
**forge** (D95), not the cave, since the ores are already in the bag.

Console / cheat bar: `ftuePart(4)` and a PART 4 button start part 4 (TC4 at the bell).

## Part 4 build record (2026-09-29), r204

New `FTUE` values (asserted by the test): part 4 `gpc` = gale, fire (one each); `after`
'd2-praise'; rewards: TC4 **gale Longsword blueprint + gale parts x3**, GPC7 **gale Rapier blueprint +
gale parts x3**, GPC8 nothing; `swiftLine` 'D99a'. New line **D99a** "Use it later. We don't need that
now." (owner's text, with the capital "We").

Flow: TC4 at the bell (D93) → the forge (D95; the ores came from the Day 2 cave in part 3) → swift
copper, the pull and the tier window (D96-D98, r190), the swift metal stored as an ingot (D99) → the
gale run (D100-D107, with the r198 stop on Gale) → sale (D108) → "You're welcome." → **reward window
(TC4)** → D109 "Great work!" → the bell brings **GPC7 (gale)** and **GPC8 (fire)** → the bell
(`d2-praise`) brings **Bram**, which opens part 5. (Bram used to walk in 1.2 s after D109.)

**The stored swift ingot stays in the bag until Bram asks for it** (`bram2-ingot`): dropping it on the
anvil before then says D99a and takes nothing out.

**Gale gets its own design desk set** (`DD_SKIN_OF.gale`). There is no gale art yet, so all 15 ids
(`gale_grip1-5`, `gale_guard1-5`, `gale_pommel1-5`, the art-list names) are `DD_ALIAS` placeholders
onto the balanced parts. A gale sword still uses the balanced blade art (`bladeFor` falls back).
**Rapier** has no hammer mid-blade art, so `HM_MID_ALIAS` shows the Longsword's until
`balanced_rapier_midblade` lands.

Console / cheat bar: `ftuePart(5)` and a PART 5 button start part 5 (Bram at the bell, the swift ingot
in the bag).

## Part 5 build record (2026-09-30), r205

New `FTUE` values (asserted by the test): part 5 `gpc` = gale, swift (one each); `after` 'g-bell'
(the bell that brings Garric); rewards: Bram none in the window (his reward is the diary, through its
own gift window), GPC9 **swift Rapier blueprint**, GPC10 **swift parts x3**; `bramLine` 'D111a'. New
line **D111a** "The previous sword was good, but it wasn't very sharp. Can you make it sharper?"
(owner's text, with the two capitals).

Flow: Bram on the bell (D110, reply, his illustration) → **D111 and D111a as one speech**, typed together
(chained, D111a replaced D111 the moment it finished, unread) → D112, D113 → the stored swift ingot on
the anvil (the swift guard lifts here, `FTUE_ST.swiftFree`) → shape → **sharpening, moved here from
part 2** (D48-D55: basement, table, wheel, back) → D23 at the counter → sale to Bram → D114 → "Thank you
for the gift." → **D57** (the sharpness bonus) → the diary window → D115 and the diary steps →
**D116, D117** (D118/D119, the quest list, are part 1's now) → the bell brings **GPC9 (gale)** and
**GPC10 (swift)** → the bell (`g-bell`) brings **Garric**, which opens part 6.

Fix to r204: the swift guard only holds until Bram's own step; it used to hold until the whole
tutorial ended, which would have blocked a swift ingot the player makes for GPC10.

Note: D57 quotes the real bonus. A sword not sharpened into the zone (`SH_ZONE_LO` 80) earns 0, and
D57 then says "We got 0g bonus this time!" (the same as the old TC2 run).

Console / cheat bar: `ftuePart(6)` and a PART 6 button start part 6 (Garric at the bell).

## Part 6 build record (2026-09-30), r206

Part 6 is **Garric (TC6), with no gameplay and no rewards** (owner). His beat (D120-D139) is unchanged:
he arrives on the bell after GPC10 (part 5's `after` is 'g-bell'), lectures, orders a Balanced sword,
the player makes it alone (r189 solo run), and he grades it: Weak + undecorated + unsharpened = 1
(D131, then D132-D133), Epic + decorated + sharpened = 3 (D137 and his parts gift, then D138-D139),
anything else = 2 (D134, then D135-D136).

**Fix: every ending ends the FTUE.** Only D139, the dialogue map's last key, used to set the end
(`TUT_SEEN_END`, the guide-to-pet switch), so after a grade 1 or grade 2 sword the dragon never stopped
guiding. `FTUE.endLines` = D133, D136, D139 (asserted by the test), and `say()` ends the FTUE on any of
them (`FTUE_ST.done`). A save made after the end loads with the tutorial finished. Verified in the
browser for all three grades; with the old rule the grade 1 ending left `tutOver()` false (RED).

**The FTUE is complete: parts 1-6 are built.**

## Swift Dagger (owner, 2026-09-30), r208

The swift third shape is the **Dagger**, not the Rapier: `FTUE.shapes.swift` = Shortsword, Longsword,
Dagger, and GPC9's reward is the **swift Dagger blueprint** (both asserted by the test). The finished
blade is `swift_dagger_blade`, which already existed (`DD_BLADES.swift`). There is no dagger mid-blade,
so `HM_MID_ALIAS` shows the Shortsword's until `balanced_dagger_midblade` exists. This supersedes every
earlier "swift Rapier" line in this record; `swift_rapier_blade` leaves the art list. Gale keeps the Rapier.

## Hammer minigame art (owner, 2026-09-30), r207

The minigame's stages are the metal sphere, then `balanced_<shape>_midblade`, then **the sword's own
blade** (`assets/sword-parts/blades/`, by `bladeFor(skin, shape)`: fire Longsword =
`flame_longsword_blade`, balanced Broadsword = `balanced_broadsword_blade`, and so on), drawn in the
mid-blade's box on the same diagonal. `hammer_sword.*` is no longer drawn. Heat shows as a glow layer
masked to each blade image (`.hm-heat`), its opacity the heat level.

## Owner art (2026-10-01), r211

The owner added PNGs for the fire and gale parts, the gale blades, the shop banner and five new
balanced parts. Each got a `.webp` (512 wide, quality 0.86; the banner cropped to its visible art,
258 x 457).

- **Placeholders gone:** `DD_ALIAS` is empty (fire grips 4-5, fire pommels 3-5, all 15 gale parts).
- **Gale blades:** `DD_BLADES.gale` = longsword, rapier, shortsword.
- **New balanced parts go to Garric's gift** (`DD_BONUS.balanced`, unlocked by the best sword for
  Garric): grips 5-6, guards 5-6, pommels 5-6. `pommel5` moved there from the balanced set: the set
  only ever showed 4 balanced parts (`FTUE.startParts` 3 + the TC3 reward), so it was unreachable.
  This placement is Claude's reading of the code's own note on `DD_BONUS`; the owner may move them.
- **Banner:** `FTUE.decor.banner.img` = `assets/Decor/Banner.webp`, drawn whole (no box, border or
  label) on the screen, in the ITEMS & DECOR slot and in the reward window. The box stays 10% x 24%.
- **Test:** `tooling/ftue/ftue.test.mjs` asserts the above and that every part, blade and decor image
  the build names exists on disk.
