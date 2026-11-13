# Sword Forge - Game Design Document

| | |
|---|---|
| **Genre** | Crafting and shopkeeping; a light map-exploration puzzle at its core |
| **Platform** | Mobile web, landscape only; touch first (desktop mouse works) |
| **Build** | `Swordforge_looptest_landscape.html`: one self-contained HTML file, no build step |
| **Live** | https://lila-games-github.github.io/sword-forge/ |
| **State** | Six-part tutorial (FTUE) and free play, merged in PR #28 (2026-11-02, R0-R62) |
| **This document** | Written 2026-11-03 from the build and the dated records. Values are the build's. |

**Authority.** This is the whole game in one place. For a single system's full record and reasons, the dated specs in
`specs/` win on any conflict (listed in §18). `specs/game-design.md` is the shorter mechanics reference with the same values.
Where the build does something the design did not intend, §17 says so.

---

## 1. Concept

A young blacksmith, exiled after monsters burn their home, finds an abandoned forge at the edge of Oakhaven. A small dragon
lives there and becomes their guide and partner. The player rebuilds the forge's trade: they craft swords whose magic comes from
a fog-covered **trait map**, and sell them to the townsfolk, adventurers and a demanding Forgemaster.

**The hook:** crafting is navigation. Every ore dropped into the smelter draws a fixed path on the map; stacking and grinding
ores steers a sword marker to a trait; lining the marker up on the trait's centre sets its tier. The forge's stations are
physical: the player pumps the bellows, tilts a ladle, opens the smelter gate, hammers on marks, and dips the blade into a
bucket by its handle.

**Player fantasy:** a craftsman who learns where the good metal goes, and whose swords get visibly, sellably better.

**Tone:** warm and a little comic; the dragon is cheeky ("Muwahaha!"), the customers have small stories.

## 2. Core loop

1. **Gather ores** - from the bag, the dragon's gifts (tutorial) and the cave.
2. **Grind (optional)** - a ground ore travels its whole path; a raw one, half.
3. **Smelt** - each ore in the smelter adds its path to the sword's route on the map.
4. **Pump the bellows** - the sword moves along the route only while the handle moves.
5. **Align with the ladle (optional)** - pulls the sword toward the map's centre to sit on a trait's centre (the tier).
6. **Open the gate** - on a trait, a tap takes it. Back into the smelter for another trait, or on.
7. **Shape** - the hot metal on the anvil, then a tap on it: pick a shape (buy its blueprint if needed), then the hammering minigame.
8. **Quench** - pick the hot blade up by its handle and dip it in the bucket. The sword is made.
9. **Finish (optional)** - decorate it at the design desk, sharpen it on the wheel (each +7g).
10. **Sell** - at the counter to the customer's order, or leave it on a shop rack.

The unit of play is one sword for one customer. The craft book lets a known sword be made in one tap, so the loop shifts from
discovery to supply as the game goes on.

## 3. Characters and story

| Character | Role |
|---|---|
| **The blacksmith** | The player. Their story is the intro's four pictures: The Fall, Exile, A New Hearth, The Anvil Awaits. |
| **The dragon** | The forge's resident, the guide. Heats the metal in the minigame, speaks every tutorial line, buys some blueprints, gives ores, can be petted (hearts). |
| **Bram** | TC1. Flees assassins, takes the first sword. Returns on Day 2 as a friend, asks for a sharper swift dagger, gives the diary. |
| **TC2** | "Give me a good one": the grinding and recording lesson. |
| **The adventurer** (TC3) | Hunts ice drakes with her group; wants a fire sword. Opens the cave and the second trait route. |
| **TC4** | Wants the best: an Epic durable sword (the ladle lesson). |
| **TC5** | Wants a gale sword; the swift metal found on the way is stored for later. |
| **GC8's customer** | Asks for a balanced sword for a cruel master, but secretly wants it Weak. |
| **The waiting customer** | Wants a gale Katana and a fire Claymore for a partner's flame; too dear for now: COME LATER. |
| **Garric** | TC6, "the great Forgemaster". Mocks the dirty shop, then tests the player with a graded balanced sword. |

The diary (from Bram) has a Travel Log, "People I met" and character sheets, setting up later adventures.

## 4. The forge (the main screen)

| Station | What the player does | Notes |
|---|---|---|
| **Smelter** | Drop ores in | Its crown lights while the bellows pump and cools after; the gate layer glows on a trait |
| **Bellows** | Drag the handle up and down | A full stroke (40 px) = 0.2 s of full-speed travel; springs back closed |
| **Gate** | Tap | Takes the trait under the sword; refuses off a trait |
| **Ladle** | Drag the bowl to tilt | 0-45 deg; past 4 deg pulls the sword to the map centre, up to 24 px/s; from Part 4 |
| **Grindstone** | Hold the handle to turn the wheel | 2 full turns grind an ore fully; unlocked in Part 2 |
| **Anvil** | Drop the hot metal on it, then tap it | Opens the shape window, then the minigame |
| **Bucket** | Dip the hanging blade | Quenches it; the sword is made |
| **Craft frame** | Tap the ring or drag it down | Blade pips (5 slots); X to cancel the craft, which asks first ("Yes, cancel" / "No"): a cancelled blade is lost with its traits and ores, except what the Restore Ore talent gives back; the inkpot to record; the craft book |
| **The map** | Pan and zoom | The top 80% of the screen; fog clears where the sword travels |

The dragon sits on the bench; his speech bubble points at him.

## 5. The trait map

### Map, fog, traits

- A 2800 x 1960 world, viewed through a zoom window (1100 wide at start, 360-2800). The sword starts just below the centre.
  When a craft starts (its first ore on the grindstone or in the smelter, CONTINUE FROM HERE, or a stored ingot back on the
  anvil), the map recentres on the sword, at the player's zoom (R94).
- **Fog** covers it; the sword clears circles of 120 as it travels (the Vision skill widens them), and 430 around the start.
- **25 traits**, hand-placed from the owner's map. A trait is a `?` until taken; then its symbol shows for good and a tap on it
  opens its trait card (craft from it in one tap).
  - Centre ring (visible from the start): Swift, Balanced, Durable, Flexible, Heavy.
  - Outer field (in the fog): Celestial, Cloud, Rainbow, Luck, Lightning, Noble, Grace, Gale, Floral, Fury, Ice, Fire, Water,
    Magma, Mist, Poison, Savage, Blood, Cursed, Dark.
- **Trait value** grows with distance from the centre: `round(distance / 12)`, clamped 5-100 (swift 16, balanced 24, durable
  25, gale 41, fire 48, up to 100 for Fury and Magma).
- **Hazards:** zones that drain the blade's health (26/s of 100) while the sword moves through them; at 0 the blade shatters.
  Health lowers the price (to half at 0); crossing 3+ zones drops every trait a tier, 5+ two (the first 2 are free). In a zone
  the sword shakes and its health shows red; out of it, the health's usual colour again (R103). The fire craft's first zone
  (D69) is three times its old size (R103).
- **Books:** exp pickups on the map, collected by travelling near them (small 50, large 75, great tomes 100-200).

### Ores and routes

| Ore | Path length | Notes |
|---|---|---|
| Iron | 200 | Turned 30 deg anticlockwise (R24) |
| Manganese | 258 | Turned 30 deg clockwise (R24) |
| Copper | 144 | Two fully ground copper stop just past Swift |
| Aluminium | 250 | |
| Nickel | 215 | Durable's ore |
| Tin | 185 | No cave seam yet |
| Zinc | 230 | No cave seam yet |

- Each ore's path is a fixed curve appended from the route's current end (the X). A raw ore goes 50% of its path, a fully
  ground one 100%. The route behind the sword is erased as it travels.
- While an ore is held, its path previews in faint red (solid to its reach, dotted for what grinding would add).
- **Known recipes:** Balanced = 2 iron + 2 manganese, raw (Epic). Fire = 2 iron + 1 manganese, then manganese, then a ground
  iron. Durable = 2 nickel. Swift = 2 ground copper. Gale = further along copper.

### Tiers

| Distance from the trait's centre | Tier | Value bonus |
|---|---|---|
| <= 9 | **Epic** | +20 |
| <= 20 | **Fine** | +10 |
| < 34 | **Weak** | +0 |
| 34+ | not on the trait | |

A sword can carry several traits (one each); taking a trait it already has can only raise that trait's tier.

## 6. Shaping and finishing

### Shapes and blueprints

- 11 shapes: Shortsword, Longsword, Broadsword, Rapier, Dagger, Katana, Cutlass, Machete, Saber, Scimitar, Claymore.
- **Base shapes per trait:** balanced, fire, durable: Shortsword, Longsword, Broadsword. Gale: Shortsword, Longsword, Rapier.
  Swift: Shortsword, Longsword, Dagger. The other 20 traits use balanced's. The market adds the rest.
- The **Shortsword is always free**; every other shape needs that trait's blueprint. Price: `50 x (trait index + step index +
  1)` gold, rising through the trait's base shapes, then Katana, Cutlass, Machete, Saber, Scimitar, Claymore, then the leftover.
  Balanced: Longsword 50 ... Dagger 450. The last trait (Dark): 1250-1650.
- A sword with several traits takes its shapes from one of them (fire first, then gale, swift, the other traits, durable,
  balanced).

### The hammering minigame

- The dragon heats the metal while the player holds on it. At full heat the minigame says so (D15, in the tutorial).
- The player drags the hammer and taps to strike **hit points**: one point on the metal sphere for 3 strikes, then 3 random
  points on the mid-blade. An aim ring under the hammer head shows the band each strike would get (yellow, blue, red).
- The 6 strikes' accuracy averages into one **accuracy percent**, which sets the price (R92): a steep curve from x0.8 at 0%
  to x1.0 at 80%, then one step a percent, each bigger than the last, to x1.3 at 100% (on a 100g base every percent from 80%
  adds gold). The band names stay as labels: **Masterwork** (>= 85%), **Good** (>= 60%), **Crude**. 700 ms after the last strike the minigame closes; the blade lies hot on the anvil.
- Stages drawn: metal sphere, a mid-blade, the sword's own blade. A glow on the blade shows its heat.

### Quench

The hot blade is picked up by its handle (within 24 px of the blade's line) and hangs from the finger as a damped pendulum,
swinging as it moves. Dipped into the bucket's water (or released over it), it is quenched in smoke and mist and the sword is
made; released elsewhere it returns to the anvil. The "Sword crafted!" window shows the sword, its coloured name, health,
forging and gold. An arrow tab at its side slides out a paper that lists the ores used (tap it again to slide it back). The
first crafted window of the game teaches itself: the hammer row (D17b), then the arrow (D17a), then the ores (D17c).

### Swing effects

Any sword dragged in the game hangs from its grip and swings. By trait:

| Trait | Effect |
|---|---|
| Fire | Glows, throws embers, an orange slash at the tip |
| Balanced, Durable, Swift | A white slash |
| Gale | The white slash, wind streaks swirling round it when still and trailing it in motion, cyan wind curls |
| Others | None yet |

### Finishing (the basement)

- **Design desk** (from Part 6): choose a grip, guard and pommel from the sword's trait set (balanced, fire, swift and gale have
  their own sets; durable and the rest use balanced). 3 of each to start; Garric's grade-3 gift adds 6 balanced parts.
  A designed sword sells for +7g; the parts chosen are looks only.
- **Sharpening wheel** (from Part 5): drag the sword along the spinning stone to fill sharpness 0-100; the green band is
  80-90. At 80 or more the sword sells for +7g.

## 7. Economy

### Price

```
price = floor( trait values + tier bonuses     (5 for a sword with no trait)
               x popularity  (1.10 ^ (level - 1))
               x forging accuracy (0.8 .. 1.3, R92)
               x health      (0.5 + 0.5 x health/100)
               x Trade skill (1 + 0.05 x rank)
               x reputation  (1.2 above 10, 0.8 below 0) )      min 1
        + 7 if sharpened + 7 if designed
```

- **Example:** an Epic Balanced sword, Good forging, full health, popularity 1: 24 + 20 = **44g**; designed and sharpened, **58g**.
- **Popularity:** each counter sale adds 0 (Weak), 1 (Fine) or 2 (Epic) to a 20-point bar; a full bar raises the level (every
  price +10% per level), the rest carries over.
- **Reputation:** +1 per counter sale.

### Customers and the counter

- The **bell** calls one customer at a time. The counter has SELL, COME LATER and DENY (DENY is a placeholder), a shelf with the
  craft book, the ledger scroll and the rotary market.
- **Tutorial customers** (scripted) and **gameplay customers** (each part's orders) name a trait and may name a shape, a tier,
  or two swords; an order that names no shape says "Any shape is fine." (R118: TC2, TC4, Garric and every free-play customer). A
  sword that does not match is refused. A two-sword order is handed over one sword at a time and paid at the
  end.
- **Free-play customers:** a random face from 7; 80% ask for a trait already found, 20% for one still in the fog ("Do you have a
  Fire sword? Any shape is fine.").
- **A sale** pays the price, reputation +1, popularity, and 5 exp. The customer thanks the player by the sword's tier (5 lines
  each for Epic, Fine, Weak) and leaves after 3 s.
- **COME LATER** puts a customer on the waiting list; the ledger calls them back when the player is ready.
- **The player's reply:** in the tutorial the player answers an order ("Yes, I can craft one.") before the dragon speaks.

### The market

A rotary wheel of traits on the counter; one blueprint page at a time, with its description and price. A page
is free, owned, closed ("Play more to unlock"), unknown (trait not found), too dear, or BUY. Blueprints can also be bought in
the shape window. In the tutorial only the current order's blueprints can be bought (the others show greyed, R112), and the dragon pays for some: his coins fly to the
gold counter with the price ("+<price>g"), then the player buys it (R96). Buying
one (in either place) flies coins from the gold counter to the buy button, the same coins as a quest claim, and the counter
shows "-<price>g" (R91).

### The shop

- The shopfront costs 500g and holds rack 1; racks 2 and 3 cost 200g and 300g; 5 swords a rack.
- Every 30 s each racked sword has a 5% chance to sell, for 80% of its price (gold only).
- The **ledger** lists the day's sales (counter and shop) and the waiting list.

### Decor

The shop banner (Garric's reward) is placed in build mode on the counter, shop or bedroom walls. Decor is cosmetic.

## 8. Progression

### Exp, levels, skill points

100 exp a level; each level gives 1 skill point. Exp: craft a sword 5, sell a sword 5, work out a cave seam 5, books 50-200,
quests 20.

### The skill tree

| Skill | Ranks | Effect per rank |
|---|---|---|
| Trade | 20 | +5% sale price |
| Extract | 5 | 5% chance a seam gives +3-4 ore |
| Pickaxe | 5 | Swing 10% faster |
| Bounty | 10 | +1 ore per seam |
| Bulk Craft | 7 (7 points each) | Craft-book crafts use 10% less ore |
| Master | 10 | More books in the fog (ranks 1-5), great tomes (6-10) |
| Vision | 20 | +5% sight radius |
| Restore Ore | 3 | 10% chance per ore to get it back when a blade shatters or a craft is cancelled |

Four more node slots are empty. RESET TALENT refunds every point.

### Quests

14 one-step quests, 20g and 20 exp each, claimed from the quest basket: craft a sword, sell a sword (both done when the list
arrives), buy a blueprint, update a craft-book page, gather ores, craft a fire sword, sleep, craft a durable sword, buy a fire
blueprint, make an Epic with the ladle, sell a Weak sword, craft a swift sword, craft a gale sword, sharpen a sword. While a
finished quest waits to be claimed, the basket has a still green glow and a faint green tint on its art (R93).

### Days

The player sleeps in the bedroom ("Go to bed?"): the screen fades to "Day n", the calendar turns, the cave gets 5 fresh seams.
Nothing else changes with the day yet.

### The cave

Five seams (iron, copper, manganese, aluminium, nickel), each 7 ore (+ Bounty), mined by dragging the pickaxe onto a seam; it
swings by itself. Tin and zinc have no seam yet.

### The craft book

- A page per trait set: the ores and grinds that reached it, its tier and forging grade, its description, sword art and the
  shapes owned. The first discovery records itself; after that, the inkpot either updates the page or records a new one (during the tutorial
only Update is offered, R100). Its Trait Tier pips show from TC4's pip lesson on (hidden before, R113).
- **CRAFT 1** makes the page's sword from its ores straight away (no smelter, no minigame; the page's forging grade).
- Pages: 3 to start, +5 from TC2's reward.

## 9. The tutorial (FTUE)

Six parts over three in-game days. The dragon leads; each step lights the one control to use. The ores are rationed: the dragon gives
exactly an order's ores ("the ore chain"), in the "Ores Acquired!" window when his line for that order closes (R108; was after
the previous sale).

| Part | Day | Who | What the player learns |
|---|---|---|---|
| **1** | 1 | **Bram** (TC1), then 3 orders: balanced Longsword, Broadsword, Katana | The whole loop on one sword (2 iron + 2 manganese). The crafted window. The counter and a sale. The quest list. The bell. Blueprints: the player buys all three; for the first two the dragon gives the gold first (R96). At GC2's gate the craft book:
the craft frame appears, the player opens the book and closes it (R105; D28n on the dark with only the map and the craft frame lit, R110). |
| **2** | 1 | **TC2** ("a good one"); **the adventurer** (TC3, fire) | Raw ores fall short: the grindstone, grinding, recording a craft with the inkpot (on the dark until it is recorded, R111), 5 more pages. Then the cave, hazards, a two-ore fork to reach Fire, a damaged blade. Bed. |
| **3** | 2 | Orders: durable Shortsword; fire Longsword, Broadsword, Katana | The basic-vs-elemental map window, nickel from the cave, Durable. The trait card and CRAFT 1 from the map and the craft book. |
| **4** | 2 | **TC4** (Epic durable), then an order for a Weak balanced Longsword (R95), then **TC5** (gale), then an order for a gale Katana + fire Claymore | The ladle and the three tiers (at the route's end the Alignment for Tiers window, then the ladle with the map
zoomed 1.5x, gliding; R104, R106). After TC4's gate, the blade pips: open the craft window, then the Traits and Tiers
window (1, 2, 3 pips for Weak, Fine, Epic, and five different traits stacked; R107). Storing a metal (swift, found on the way to Gale). Stopping on Weak on purpose. COME LATER and the waiting list. |
| **5** | 2 | **Bram** returns (swift Dagger, sharper); an order for a gale Longsword | The stored swift ingot. The sharpening wheel. The diary. |
| **6** | 2-3 | **Garric** (TC6) | The design desk; a solo craft graded by Garric; the banner and build mode; bed; Day 3: the cave waits for a Pickaxe point, the skill tree. D140 ends the tutorial. |

### Garric's grading

| Grade | Sword | Garric | Reward |
|---|---|---|---|
| 3 | Balanced, Epic, designed and sharpened | "You do have potential." | 10g, 6 balanced design parts, the banner |
| 2 | Anything between | "This is ... okay-ish." | 10g, the banner |
| 1 | Weak, plain | "I'm not paying for this junk." | the banner only, no pay |

Below grade 3 a window names what is missing before the sale. After D140 ("From now on, ring the bell when you are ready for
customers"), free play opens everything: the market, DENY and COME LATER for all, the bell bringing random customers.

### Tutorial rules

- Lines type in word by word; only a line's OK (next) or X (close) moves it on. Some lines wait for an action instead.
- A customer's line finishes before the player's reply appears; the reply comes before the dragon's next line.
- A guided craft that goes wrong (wrong ores, a missed trait) gets a dragon line and a retry.
- Off-order actions are blocked with a line: crafting before the order allows it, buying a blueprint not needed.

## 10. Screens and navigation

```
             bedroom
                |
 shop - counter - FORGE - cave
                |
             basement
```

| Screen | Contents |
|---|---|
| **Forge** | The stations, the map, the dragon, the craft frame |
| **Bedroom** | The bed (end the day), the calendar (the day number), pet the dragon |
| **Basement** | The design desk, the sharpening wheel, the work zone |
| **Counter** | The customer, SELL / COME LATER / DENY, the shelf and craft book, the bell, the ledger scroll, the rotary market |
| **Shop** | 3 racks; buy the shopfront and racks |
| **Cave** | 5 ore seams and the pickaxe |

Arrows at the screen edges (and the arrow keys) move between screens; an arrow that leads nowhere is hidden.

### The frame and the rail

- A fixed 1080 x 600 landscape frame scaled to the phone (the viewport width is set so 600 px fills the screen height).
  The first tap asks for full screen; held in portrait, a "Turn your phone sideways" screen covers the game.
- **The rail** (right): the skill-tree button (level, points, exp bar), gold, reputation, popularity, the inventory, the diary
  and the quest basket, the gear menu.
- **Inventory tabs:** Ingredients (ores), Ingots (stored metals), Swords, Decor. Each tab appears the first time it is needed.
  15 cells shown, more in rows of 3.

### Windows

Trait discovered (first find only, with a celebration burst, bigger for Epic, a second smaller burst after), sword crafted,
reward (the dragon shown over its dark, his line under it), shape, market, skill tree, quests, diary, ledger and waiting list,
end of day, the gear menu (resume, save, new game, load, settings). SETTINGS also reopens the tutorial's two map windows
(MAP: FIVE PARTS, MAP: TRAITS), each once the tutorial has shown it, and both after it (R97).

## 11. Dialogue and guidance

- **The dragon's bubble** sits by him: on the bench at the forge, by his on-screen figure elsewhere, as an icon bubble inside the
  basement windows. Text types at 70 ms a word; a tap shows the rest. OK goes on, X closes; the bubble body does nothing else.
- **Customers** speak in the counter's dialogue box or in a named panel (name tag "???" until they introduce themselves); the
  player answers with reply buttons.
- **Highlighted words:** sword names (a trait word and its shape) are bold in the trait's colour, tiers bold in the tier
  window's colours (Epic purple, Fine blue, Weak grey), "sharpened" and "customized" bold in their own colours. Each of the 25
  traits has a colour readable on the parchment.
- **Tap the dragon for help:** a tap on the dragon makes him say his last line again, so the current hint comes back (D119a
  teaches it in Part 1: "If you are not sure what to do, at any point, you can tap on me. I'll help you."). After the tutorial a
  tap pets him instead (hearts).
- **Guidance:** a drag arrow for drag steps, a glow or blink on the control to tap, drag-gesture hints (ladle up, bellows up
  and down, ring down), a dark screen with the needed controls cut out, and a pulsing ring on the map trait to aim for (it goes
  out once the sword is made).
- **Rules for lines:** straight quotes only; "tap", never "click".
- **Toasts are the dragon's (R90, on trial):** a game message (for example "No Iron left") is said by the dragon for 4 s, then
  goes. With a line up it takes that line's place, and the line comes back as it was; with no line, it shows in his bubble
  where he is visible, or in an icon bubble at the bottom centre (as in the sharpening window) where he is not. A tap closes
  it; a new line replaces it at once. 30 old toasts are gone; the shop-rack sale and the PART buttons keep the old top toast.
  Record: `specs/2026-11-05-dragon-toasts.md` (`DTOAST.on=false` reverts it).

## 12. Art and audio

- Painted 2D art: screen plates, props on anchor layers, per-trait sword parts (blades by trait and shape, grips, guards,
  pommels), customer portraits, four intro illustrations, explainer pictures (tiers, map parts). WebP at 2x display size.
- **Stand-ins:** the fire Katana wears the balanced Katana blade; Durable swords wear the balanced blade and parts; the Katana,
  Dagger and Claymore borrow other shapes' mid-blades in the minigame; manganese, nickel, tin and zinc ore pictures reuse older
  art. Planned art: `specs/2026-10-07-ftue-v3-art-list.md`.
- **Effects:** swing effects, the trait burst, the smelter's lit states, quench smoke and mist, the bell's swing, hearts.
- **Audio:** none yet.

## 13. Saving

Manual: SAVE in the gear menu writes the game to the browser (`localStorage`, version 9): gold, swords, ingots, ores, the
craft book, skills, quests, the map's fog and traits, the tutorial's progress flags. LOAD GAME restores it; NEW GAME starts
over (skipping the intro). Not saved: the exact tutorial step and the dialogue, so a reload in the middle of a part loses the
step. No autosave; the game does not offer to continue on start.

## 14. Test aids in the build

SKIP HAMMER (grades the forging Good), PART 1-6 and GAME (start a new game at a part, or just after the tutorial), the CUSTOMER dropdown (a new game at any tutorial customer, R109), the map's
fog button, +1000 gold in the settings, the URL options `?freeplay` (tutorial done, 20 of each ore, 500g) and `?nointro`, and
the layout and art aids: `?hammer` (the minigame straight away), `?wire` or the W key (wireframe boxes), `?test` (a layout
self-test), `?labels`, `?clean` and `?bbox`.
They are in the internal build only: the external tester copy, `Swordforge_external.html`, is generated with all of them off
(R115; R116 added the layout and art aids; `const DEV=false;`, `specs/2026-11-12-external-build.md`).

## 15. Technical

- One HTML file (~11,400 lines): markup, CSS and vanilla JS, global state, direct DOM. The map is SVG; effects draw on canvases.
- Every recorded design value lives in one named object (`FTUE`, `SMELT`, `HM_HITS`, `HAZ`, `MARKET`, `MK_ROT`, `SKILLS`,
  `SWING_FX`, `ACQ_FX`, `DLG_HL`), and eight Node test suites read those objects out of the HTML and assert them against their
  records (`tooling/*/`). A design value changes in its record and its test together, test first.
- Deploy: a push to `main` publishes GitHub Pages; the site root redirects to the game.

## 16. Roadmap

- Play Parts 2-6 straight through, and play on phones (the bellows, ladle and blade dip by finger).
- Missing art (§12); swing effects for the other 21 traits; audio.
- Free play depth: customers whose order is checked, a day that means something (costs, a customer count), tin and zinc seams,
  routes to the outer 20 traits, the 4 empty skill nodes.
- Save the tutorial step (or autosave); remove or hide the test aids before a real release.
- Remove the old forge hammer and mug left in the file.

## 17. Known gaps and open questions

- **Free-play customers take any sword:** only tutorial orders are checked; a customer who asks for a Fire sword pays in full
  for any sword. Intended to be checked?
- **Reputation never falls**, so from the 11th sale every price is x1.2.
- **Fire and Balanced trait values** come from their positions before the R24 path change (Fire 48).
- **DENY** does nothing; the 24 craft-book descriptions other than Balanced's are placeholders.
- **Owner questions still open** (from `HANDOFF.md`): the forging price multipliers; Garric's gift as 6 balanced parts; whether
  the PART buttons stay public; the waiting customer's guide timing (it starts once gold covers 750g); the craft-book headings.
- A 2026-11-02 code review listed 10 smaller issues, set aside by the owner (`HANDOFF.md`).

## 18. Source records

| Topic | Record |
|---|---|
| Mechanics with values | `specs/game-design.md` |
| The crafting loop | `specs/2026-10-21-smelter-version-loop.md` |
| The tutorial design | `specs/2026-10-07-ftue-v3-rework.md` |
| The tutorial's rework, R0-R62 | `specs/2026-10-23-ftue-smelter-rework-plan.md` |
| Every line in play order | `specs/2026-09-15-looptest-landscape-tutorial-script.md` |
| Hammer minigame | `specs/2026-10-01-hammer-hit-points.md` |
| Hazards | `specs/2026-10-01-hazard-integrity.md` |
| Skills | `specs/2026-10-06-skill-tree-trade-ore.md` |
| Map trait card | `specs/2026-10-06-map-trait-links.md` |
| Iron and manganese paths | `specs/2026-10-28-rotated-ore-paths-test.md` |
| The forge's craft frame | `specs/2026-10-28-forge-screen-new-look.md` |
| The market window | `specs/2026-10-29-rotary-market.md` |
| Swing effects | `specs/2026-10-30-fire-swing-fx.md` |
| Trait discovery burst | `specs/2026-10-30-trait-discovery-burst.md` |
| Coloured sword names | `specs/2026-10-30-dialogue-sword-names.md` |
| Mobile fit and payload | `specs/2026-09-21-mobile-viewport-fit.md`, `specs/2026-09-21-asset-payload-diet.md` |
| Art still needed | `specs/2026-10-07-ftue-v3-art-list.md` |
| Current state, open questions | `HANDOFF.md` |
| Which doc is canon | `INDEX.md` |
