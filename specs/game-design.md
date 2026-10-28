# Sword Forge — Game Design (SSOT)

**Single source of truth for game mechanics.** This describes the game *as actually implemented*. When code and this doc disagree, treat it as a bug in one of them and reconcile. Update this doc in the same change as any mechanic change.

> **Which build this describes (updated 2026-10-23).** The game under development is
> **`Swordforge_looptest_landscape.html`**. Since 2026-10-23 it carries the **smelter crafting loop** (the bellows move the
> sword, the smelter gate takes the trait, a ladle aligns the tier, the anvil opens the shaping, the blade is quenched in the
> bucket). **§2-§5 describe that loop as built.** **§6-§8 still describe the older `index.html` / V1 game** (metals, the day
> of 7 customers, the old minigames) and have not been rewritten; for the current economy, customers, market, quests and
> tutorial use the dated records, which win over this file: `specs/2026-10-21-smelter-version-loop.md` (the loop, its values
> and tests), `specs/2026-10-23-ftue-smelter-rework-plan.md` (the tutorial's rework to it),
> `specs/2026-10-07-ftue-v3-rework.md` (the FTUE, the market, blueprints, the ore chain), `specs/2026-10-01-hammer-hit-points.md`
> (the minigame), `specs/2026-10-01-hazard-integrity.md` (hazards), and `HANDOFF.md`.

> The original design vision is archived at `archive/Sword_Grid_Game_GDD.md`. The build has drifted from it; this spec reflects current reality, not original intent.

---

## 1. Overview

You play a blacksmith who explores a dark 50×50 grid to discover magical traits, forges custom weapons from those traits, and sells them to customers (actively) or through a passive shopfront.

## 2. Core loop (the main build, smelter loop)

1. **Ores** - from the starting bag, the dragon's rewards and the cave (`FTUE.oreStart`, `FTUE.oreChain`).
2. **Grind (optional)** - an ore on the **grindstone**, turned by its handle, reaches further on the map (§3).
3. **Smelt** - each ore dropped into the **smelter** adds a segment to the active sword's **route** on the map.
4. **Pump** - dragging the **bellows** handle up and down moves the sword along the route (§3).
5. **Align (optional)** - tilting the **ladle** beside the smelter pulls the sword toward the map's centre, to line it up on a
   trait's centre: the tier (§4).
6. **Take the trait** - on a trait the **smelter gate** glows; a tap takes the trait and releases the hot metal. For another
   trait, put the metal back into the smelter, pump on, open the gate again (§4).
7. **Shape** - the hot metal dropped on the **anvil** opens the **shape window** (owned shapes, and blueprints to buy), then the
   **hammering minigame** (§5).
8. **Quench** - the shaped blade lies hot on the anvil; picked up by its handle it hangs and swings; dipped (or dropped) into
   the **bucket** it is quenched and the sword is made (§5).
9. **Sell** - at the counter to customers' orders, or from the shop; then craft again.

## 3. The map, routes and travel

### The map

- **World:** an SVG board **2800 x 1960** units (`WORLD_W`, `WORLD_H`), seen through a zoom / pan window: `INIT_W` **1100**,
  `MIN_W` **360**, `MAX_W` **2800**. The sword starts at **(1400, 1030)** (`START`).
- **Fog:** cleared for good in circles of `REVEAL_R` **120** as the sword travels, plus `INIT_REVEAL` **430** around the start.
- **Traits:** 25, placed from the owner's map (`TRAIT_POS`); each is a `?` until taken. The map's trait icons open a small trait
  card (`specs/2026-10-06-map-trait-links.md`).
- **Hazards:** zones that cost the blade health while the sword moves through them (`HAZARD_DPS` **26**/s over a blade of
  `BLADE_HP_MAX` **100**, shown as a fill inside the sword marker). Health lowers the price (`HAZ.floor` 0.5 at 0 health); 3+
  zones crossed drop every trait one tier, 5+ two (`HAZ.steps`). Record: `specs/2026-10-01-hazard-integrity.md`.
- **Books:** XP pickups collected by travelling near them; XP levels the player and gives skill points (the skill tree).

### Ores and routes

- **7 ores:** Iron, Manganese, Copper, Aluminium, Nickel, Tin, Zinc (`ORES`), each with its own fixed path shape and length.
  Since 2026-10-28 (R24) iron's path is turned 30 deg anticlockwise and manganese's 30 deg clockwise (`ORES` `rot`); Balanced
  and Fire sit at the new ends (`FTUE.balancedAt`, `FTUE.fireAt`). Record: specs/2026-10-28-rotated-ore-paths-test.md.
  Each ore dropped into the smelter appends its path from the current route end (the **X**); ores stack.
- **Raw vs ground:** a raw ore reaches **50%** of its path; on the grindstone two full turns of the handle (`GRIND_TURNS` **2**)
  grind it fully, **100%** (`tPct = 0.5 + 0.5 x grind`).
- **Back to the bag:** an ore on the grindstone dropped on the inventory goes back to the bag, whole; its grinding is
  lost (R21, 2026-10-28; until then an ore on the wheel was committed, r101).
- **Route drawing:** the placed route is **dark brown**; while an ore is held its preview is a fainter **red** (solid to its
  reach, dotted for what grinding would add). The route behind the sword is erased as it travels.

### Travel: the bellows

- Dragging the bellows handle (`#bellowHot`) moves the sword, and only while the handle moves: a full stroke (closed to raised,
  `SMELT.rangePx` **40** px) is `SMELT.strokeSec` **0.2** s of full-speed travel (`SWORD_SPEED` 0.5 of a segment a second;
  routes of 5+ fully ground irons run at x2, `ROUTE_FAST`). The travel glides out frame by frame (`SMELT.easeSec` **0.15**). The
  handle springs back closed when released (`SMELT.springMs` **250**); the spring moves nothing. Heat no longer sets the speed.
- Record: `specs/2026-10-21-smelter-version-loop.md` (s1-s3).

## 4. Traits: alignment and taking them

- **Alignment sets the tier** (`tierFromDist`, the sword's distance to the trait's centre): **<= `ALIGN_EPIC` 9 Epic**,
  **<= `ALIGN_FINE` 20 Fine**, **<= `ALIGN_MAX` 34 Weak**; beyond 34 the sword is not on the trait.
- **The ladle (tier alignment):** behind the smelter (`assets/forge/ladle_base`, `ladle_head`). Dragging its bowl tilts it
  (0-`ladleMax` **45** deg); past `ladleDead` **4** deg it pulls the sword, its route and the X straight toward the map's centre,
  up to `ladlePull` **24** map px/s at full tilt, linearly by the tilt. Released, it tips back and the pull stops. Only while the
  metal is in the smelter. Record: `specs/2026-10-21-smelter-version-loop.md` (s4).
- **The gate takes the trait:** it glows while the sword is on a trait (`smGateSync`). A tap takes the trait at its tier, reveals
  its symbol on the map for good, records it in the craft book, opens the trait window, and puts the hot metal at the gate.
  Off a trait the gate refuses. A trait already on the metal is only re-rolled up in tier, never added twice.
- **More traits:** drag the hot metal back into the smelter, add ore if needed, pump and open the gate again. The blade's
  traits show as pips in the blade panel (a tier-N trait fills N slots).
- **Craft book:** each trait's page records the route that reached it (ores, grinds, tier, hammer grade); **CRAFT 1** makes the
  page's sword straight away from its ores (no smelter, no minigame).

## 5. Forging the blade

- **The anvil opens the shaping:** the hot metal dropped on the anvil (with at least one trait) opens the **shape window**: owned
  shapes, and locked ones with their blueprint price and a BUY (the market's prices and checks). A tap on the metal reopens it.
- **The hammering minigame:** the dragon heats the metal (hold on it), the hammer strikes **hit points** (`HM_HITS`: 1 point on
  the orb for 3 strikes, then 3 random points on the mid-blade), graded by aim into a band - **Masterwork** (x1.3), **Good**
  (x1.0), **Crude** (x0.8). Record: `specs/2026-10-01-hammer-hit-points.md`. **No mug:** `SMELT.shapedHold` **700** ms after the
  last strike the minigame closes and the finished blade lies on the anvil, glowing hot.
- **Quench:** pressed within `SMELT.bladeGrab` **24** px of its line, the blade is picked up by its handle (the tang, found from
  each blade picture's pixels) and hangs as a damped pendulum from the finger (`bladeG` 2600, `bladeDamp` 1.2), swinging as it
  is moved. Dipped into the bucket's water from above, or released over the bucket, it is quenched (the glow fades, steam and
  mist) and the sword is made; released elsewhere it goes back on the anvil. Record: `specs/2026-10-21-smelter-version-loop.md`
  (s5, s6).
- **Dragged swords swing:** a sword dragged out of the Swords tab on any screen (or off the counter or the table) hangs from
  its grip and swings like the blade on the anvil, the same physics at the same size (`SMELT.swingW` 317 px). Record:
  `specs/2026-10-21-smelter-version-loop.md` (s7).
- **The made sword** goes to the Swords tab with its shape, traits and tiers, hammer grade, health and hazards crossed; the
  "Sword crafted!" window shows it. Decoration (the design desk) and sharpening (the basement wheel) are later, optional steps.

## 6. Economy (the older `index.html` build - not rewritten; see the banner at the top)

### Smelter
- Generates metals passively on a **10-second tick** (only after the tutorial; generation is locked during it). Base **1 metal per tick** (1 metal / 10 s).
- **Only unlocked metals are generated** — the 4 cardinals (steel/iron/magnesium/bronze) always, plus any diagonal metal that's been bought (50g). Locked diagonals do not accumulate until unlocked.
- **Lowest-first priority:** each metal generated is added to the **lowest-count metal** in the pool (ties broken randomly) as long as any pooled metal is **below 5**; once every pooled metal is at 5+, the metal is chosen uniformly at random. So a depleted metal is topped back up to 5 before generation spreads out.
- Upgrade for **50 Gold** per tier → **+1 metal per tick** each, infinitely.

### NPC customers (active selling)
- Requests are scripted then randomized:
  - **Request #1:** "any weapon" — any sword works; pays at least **15g**.
  - **Request #2:** scripted **Flame** 🔥 trait request. (During the tutorial, this customer is held back until the player dismisses the post-sale dialogue, then summoned manually.)
  - **Request #3:** scripted **ice-dragon** customer — asks indirectly for a sword "weak to heat" (resolves to the **Flame** 🔥 trait); the tutorial uses this customer to teach crafting from a recorded composition via the Recorded Compositions **Craft** button.
  - **Request #4+:** random trait (from the 8 closest-to-center traits while `requestCount ≤ 10`, then from all 24). **10% chance** to also demand a specific shape. **Customer #4 never requests Flame** (it's excluded from that one customer's pool) so the record-reminder box (below) points the player at a genuinely new trait.
  - **Record reminder (post-tutorial):** the **first time the player completes a heating minigame after the tutorial ends** (i.e. heating customer #4's fresh, non-Flame trait), a one-off box appears — *"Remember to record the composition of each new trait you discover, and keep updating the old ones as you improve."* — followed by a **hand pointer to the Record Composition button** (clears when they open the record box). Shown **once per session** (`hasShownRecordReminder`); if the heat surfaced a "New Trait Discovered!" box, the reminder waits until that box is dismissed. (`triggerRecordReminder`.)
  - **Day 2 opener (Bram returns):** the first customer of **Day 2** is **Bram** (portrait `BramD2.png`), back with a **three-beat story** told one line at a time — *"Thanks to your sword, I was able to defeat the bandits! I fought so hard, the sword broke."* → *"But my talent was spotted and I got recruited as a soldier!"* → *"Can you get me something that won't break so easy-eh?"* Each of the first two beats shows a **Continue ▶** button (after a short read gap) to advance; the **final beat** carries his request and the usual two response options. His request is a **Durable 🛡️ sword** — but his dialogue never names the trait, so the player must **infer** that *"something that won't break so easy"* means the **Durable** trait. (`presentCustomerDialogueSequence`; detected via `currentDay === 2 && customersToday === 0`; `requestedTrait` = the `durable` base trait.)

  **Scripted story customers** (portraits in `assets/customer/`; detected by `currentDay`/`customersToday`):
  - **June** — **Day 1's final customer (#7)** (portrait `June.png`): *"Give me the sharpest blade you have! I must END the monsters who took my husband away from me!"* Accepts a **Sharp 🔪 sword of any shape** (`requestedTrait` = `sharp`).
  - **Roland** — **Day 2's 3rd customer** (portrait `Roland.png`): *"Do you have something that looks Noble? I need it for a very important performance."* Accepts a **Noble 👑 sword of any shape** (`requestedTrait` = `noble`). Alongside the usual two responses he offers a **third option — *"I don't make swords for cosplay."*** (`#btnCosplay`, shown only for Roland via `showCosplayOption`); picking it makes Roland retort *"Ah, just give me one! A real sword is best suited for… extreme performances anyways."* and then re-shows the normal responses (the Noble request stands). (`onCosplayClick`.)
- **Dialogue reveal & responses:** the customer's request line is revealed **word by word** (typewriter, ~110ms/word; tapping the speech bubble skips to the full line). The line types out when the Counter screen first becomes visible for that customer (or immediately if a new customer arrives while you're already on the Counter). Only **after the full line has appeared** do the player's **two response options** fade in:
  - **"I have something for you."** → runs **Search Inventory** (below). Auto-disabled when nothing in the Vault matches the request, so it doubles as a "do I have it?" cue.
  - **"I don't have what you need."** → runs **Refuse** (below).
  The options are hidden while the line is still typing and while a customer is leaving (post-sale/refuse). **Multi-beat customers** (e.g. Bram on Day 2) reveal each leading beat with a **Continue ▶** button after a short read gap (`DIALOGUE_GAP_MS`); the response options appear only once the **final** beat has typed out (`customerLineQueue`/`advanceCustomerDialogue`).
- **Payout** = `max(1, reputation-adjusted value + craftsmanship bonus − hazard penalty)`:
  - **Base value** modified by Reputation: Rep < 0 → **×0.8** (min 1g); Rep > 10 → **×1.2**.
  - **+ craftsmanship bonus** (`sword.craftBonus`, flat, *after* the reputation multiplier): **+1 gold per successful hammer hit** (up to 6) **+ a sharpen-accuracy bonus** (**+3** for finishing at **95–105%**, **+2** for **90–95%** or **105–110%**, **+0** if over-honed past 110%).
  - **− hazard penalty** (`sword.hazardLoss`, flat): 4 gold per hazard tile landed on while building the blade (see §1).
  - Both are baked onto the sword at forge time (`completeForge`) and shown as a green **"+x craft"** / red **"−x hazard"** next to the value on the **forge-result board** and the **Vault sword-detail (sell) screen**. The **customer sale dialogue shows only the final net total** (e.g. value 31 + 9 craft − 4 hazard → *"Here's your 36 gold."*) — no per-component breakdown in the dialogue. The same net (value + craft − hazard, min 1g) is paid when a sword sells passively in the Shop.
  - **First-sale starter stock:** completing the sale to **customer #1** tops every *usable* metal (the 4 cardinals + any unlocked diagonal) up to **at least 5** (`topUpMetalsAfterFirstSale`), so the player isn't stranded at 0 after the tutorial forge.
- **Sale:** +1 Reputation. **Refuse:** −1 Reputation, new customer after ~1.2s. The **"I don't have what you need."** (Refuse) option is **disabled for the first three (scripted) customers** (`requestCount ≤ 3`) so the tutorial flow can't be broken; it enables from customer #4 on.
- **Post-sale feedback + response gate:** on a successful sale the customer reacts with a short line before the gold, e.g. *"Oh! Hot! Here's your 25 gold."* The line is chosen by **prioritizing the trait the customer asked for** (`requestedTrait`), then the sword's first trait, then a random **generic** line (also used for trait-less swords). Each of the 24 traits has its own line (`traitFeedback`), plus 5 generic lines (`genericFeedback`); the scripted **ice-dragon** (tutorial customer #3) keeps its bespoke "You can craft such a powerful sword?" line. **The sold customer then waits at the counter** — instead of auto-departing — until the player taps a single **response button** (rotating between *"Thank you" / "Glad you liked it" / "Take care"*, `saleResponses`). Tapping it summons the next customer (the tutorial advances to its next scripted step; otherwise a random request). **Refuse is unchanged** (no response button; the next customer auto-arrives after ~1.2s).
- **Search Inventory** (the **"I have something for you."** option) finds the sword in the Vault that matches the customer's request and **opens the Inventory modal straight to that sword's detail view** (highlighted), so the **Sell** button is right there to complete the sale. *(A separate one-tap "Craft & Sell" button was removed; craft from a recorded composition via the Recorded Compositions modal's **Craft** button instead, then Sell.)*

### Day system
- The counter runs in **days**. Exactly **7 customers visit per day** (`CUSTOMERS_PER_DAY`); each handled customer counts — **a sale or a refusal both count** (`customersToday`). Once 7 have been handled, **no more customers arrive** until the player ends the day (`maybeSummonNextCustomer` → `onDayFull`): the counter is **cleared completely** — no customer portrait and no dialogue box (both hidden until the next day's first customer, which un-hides them via `setCustomerImage`/`showCustomerLine`).
- **End Day button** (`#btnEndDay`, `requestEndDay`) sits next to the **📦 Available Metals** header on the Forge screen. It's **disabled on day 1 until all 7 are served**; from **day 2 on it's enabled after 3** customers (`EARLY_END_MIN`). Clicking it opens a Yes/No confirm (`#endDayModal`): **ending early** (fewer than 7 served) asks *"Are you sure you want to end the day so soon?"*; **after all 7** it asks *"End the day and go to bed?"*.
- **Day 1 guide:** the moment all 7 are served on day 1, a one-off box — *"Good work! Let's end the day here and go to bed!"* — appears, then a **hand pointer to the End Day button** (since it's on the Forge screen, the pointer first nudges the player there from the counter). Shown once (`shownDay1EndBox`).
- **Confirming Yes** runs a **black fade-out → fade-in transition** (`#dayTransition`, `runDayTransition`) that shows **"Day N"** for the new day at the midpoint, then advances the day, resets the per-day count, and summons the new day's first customer. At the day rollover, **every unlocked metal is restocked by `+DAY_METAL_BONUS` (7)** (`availableMetals[m] += 7`; locked diagonals are skipped, matching the smelter's unlocked-only rule). Otherwise ending a day only advances the day and resets the customer count — Gold, Vault, Reputation, Shop, Blueprints, and the smelter all persist.
- **Day counter:** a **"Day N"** badge (`#day-text` / `#day-text-2`) sits to the **left of the gold/reputation pill** on both the Counter and Forge screens.

### Quests
- A **quest tracker** lives in the **top-left corner of the Counter screen**, shown collapsed as a single **📋 emoji button** (`#questToggle`); tapping it expands a panel (`#questPanel`) listing each quest with its **progress** and its **reward** (🪙 **+20g**, `QUEST_REWARD`). Completing a quest awards the gold once, pops a *"✅ Quest complete …"* toast, and marks the row done (✅ + strike-through, "Reward claimed"). Each quest is **one-off** and does not re-award (`bumpQuest`/`renderQuests`; `quests[]`).
- **The five quests:**
  - **Craft 5 Epic swords** — counts each forged sword whose overall quality (`swordQuality`) is **Epic** (manual or Auto-Craft).
  - **Survive a day without turning any customer away** — completes when a day ends (`runDayTransition`) with **zero refusals that day** (`refusalsToday === 0`; a refusal via the Refuse button breaks it for the current day). The counter resets each day.
  - **Discover 3 new traits** — +1 each time a **never-before-heated** trait is fused (the same event that fires the "New Trait Discovered!" box).
  - **Update 3 recorded compositions** — +1 each time an **existing** recorded composition is **updated** via the record modal's *Update* (replace) action (not "Keep Both", which records a new entry).
  - **Open the shop front** — completes when the shop is unlocked (`unlockShop`).
- Quest state is **session-only** (no persistence yet — resets on reload, like other run state).

### Passive shopfront
- **Unlock:** 500 Gold. (A "Shop Available!" tip box appears once the player first reaches 500 gold; dismissing it starts a hand-pointer guide — pointing to the left arrow until they reach the Shop screen, then to the **Unlock Shop** button — which clears when the shop is unlocked. The guide only runs once the main tutorial is over, so its hands don't clash.)
- **Post-unlock "stock the shop" guide:** the moment the shop is unlocked, a one-off guide runs (`shopSellPhase`): a box — *"Craft a flame sword and add it to your shop for sale."* — then a hand points the player to the counter and the recorded flame composition's **Craft** button (metals are topped up so it's affordable), then to the crafted sword's **To Shop** button. Once a sword is sent to the shop it guides them to the Shop screen and shows two boxes — *"This is where you display your best swords and possibly earn even more gold!"* then *"Or if you have too many swords lying in your inventory, better send them to the shop for sale."* — after which the guide ends. Skipped entirely if no flame composition is recorded.
- Move swords from Vault into the Shop. Each shop card shows the **composited sword image laid flat/horizontal** (`vaultPartsHtml` rotated −135°, `.shop-sword-img`) above its tier/traits/price. Every **10 seconds**, each shop sword has an independent **5% chance** to sell for its full value (value + craft bonus − hazard loss, min 1). Does not affect Reputation. On a sale, a small green **popup on the Shop screen** announces it and the **gold gained** (`showShopSalePopup` / `#shop-sale-popup`), alongside the existing green pulse on the gold pill.
- **Ledger** (`📒 Ledger` button on the Shop screen → `#ledgerModal`): an expandable window with **scrollable day tabs** across the top (most-recent day first, labelled *Day N*); tapping a tab lists every sword sold **that day via the passive shop** — its image (laid flat), shape, traits, and the gold it fetched, plus a day total. Only the **5 most recent days** with sales are kept; older days are dropped (`shopLedger`, capped at `LEDGER_MAX_DAYS`; `recordLedgerSale`/`renderLedger`).

### Recorded Compositions (blueprints)
- The **Record Composition** button saves the current active traits + used-metal composition as a named entry. If the active blade is empty (e.g. right after forging) but a sword was just forged, the button instead reads **Record Last Composition** and saves that last forged sword's traits + composition — so you can still record after forging without re-heating.
- **Confirmation box (`#recordModal`):** recording never saves silently — it opens a box first. A composition is **keyed by its trait set**:
  - **New trait set** → the box shows *what trait(s)* are being saved and *how many metals* were used, with a **Record** button (or Cancel).
  - **A trait set already recorded** → the box (titled *Update Composition*, prompting *"Replace the old record or keep both?"*) shows a **before/after comparison** of the metal counts (Recorded vs New) and offers two actions (plus Cancel): **Update** (replace the existing entry in place) or **Keep Both** (`keepBothRecord` — save the new one as a **separate** entry, so two compositions can share the same trait set with different metal recipes). If the metals are unchanged the box notes "These are identical" and **Keep Both is hidden** (nothing distinct to keep). (`saveRecipe` → `openRecordModal`/`confirmRecord`/`keepBothRecord`/`closeRecordModal`.)
- **Recorded Compositions** (Counter screen): a **📜 Recorded Compositions** button opens a **modal** (its own box with an internal scroll). The modal shows a grid of trait-icon tiles; **tapping a tile drills in** to a detail view (Tier, Traits, Value, **Composition**) with a **⚡ Craft** button (Auto-Craft — see below) and a **🗑️ Delete** button (delete is hidden during the tutorial to avoid breaking the guided craft step), plus a **← Back** to the grid. Craft closes the modal and runs the forge pipeline.
- **Auto-Craft** (the **⚡ Craft** button): if you hold enough raw metals, craft a recorded composition. It runs the **full forge pipeline**: a **heat mini-game** (using the composition's **last-acquired trait's** heat config/timer) → shape select → hammer → quench (skipped when that last-acquired trait is `flame`) → design → sharpen, then outputs to the Vault. Unlike a manual forge there is no HP cap, and the single heat + hammer + sharpen performance sets **one uniform quality across all the composition's traits** (see §4) — quality now comes from live performance, not a stored value. Cancelling the heat aborts the craft (no metals spent).

## 7. Map travel (reset) (the older build)

- Reset the 50×50 grid at any time.
- **Retained:** Gold, available metals, Reputation, Vault, Shop contents, Blueprints, Smelter upgrades, metal unlocks.
- **Cleared/reset:** map layout, fog of war, active forge, player position (back to center).

> Note: the map seed is fixed (`1337`), so the layout is currently deterministic across resets. If reset is meant to produce *new* trait layouts (per original GDD), the seed needs to vary.

## 8. UI / UX (the older build)

- **Three swipeable screens:** Shop (0) · Customers (1) · Forge/Map (2). Game opens on the Forge screen.
- **Counter (Customers) screen:** two stacked top-left corner tabs — a **📋 quest tracker** (see §6 *Quests*) and, below it, a **📖 Diary** (mutually exclusive panels). The Diary is a **paged book** (◀ ▶ arrows) of the named story customers — **Bram, June, Roland**. Each page is **locked (identity hidden behind a 🔒 placeholder) until the player sells a sword to that specific customer**; once unlocked it shows the customer's portrait, a short storyline note, and a running **list of swords crafted for them** (`diaryCustomers`/`diaryGiven`; sales tagged via `currentCustomerId`; a page unlocks when `diaryGiven[id]` is non-empty; `renderDiary`/`diaryFlip`). a slim gold/reputation pill at the top; the customer rendered as an **image** anchored bottom-left that **slides in from the left** on each new customer: **Bram** (`assets/customer/Bram.png`) is the tutorial's very first customer (Day 1 opener) and returns as `BramD2.png` for **Day 2's opener**; every other customer draws a **random portrait** from the human pool (`man1`–`man4`, `woman1`–`woman3`), never repeating the previous portrait back-to-back (`customerPool`/`setCustomerImage`); the request speech bubble (tail pointing to the customer) whose text is **revealed word by word** (see §6), with the player's two **response options** — **"I have something for you."** (Search Inventory) and **"I don't have what you need."** (Refuse) — stacked beside it, fading in only once the line has finished typing (Refuse is disabled for the first three customers — see §6); after a sale those two options are replaced by a single **response button** (*"Thank you" / "Glad you liked it" / "Take care"*) that the player taps to send the customer off and bring the next (see §6); and, at the bottom, two buttons — **🛡️ Inventory** and **📜 Recorded Compositions** — that each open their **own modal** (a fixed-height box with an internal scroll, so the screen itself no longer grows). Each modal is a **tile grid → tap a tile → drill-in detail view** (with a ← Back): the **Inventory** modal's tiles show the **composited sword image** (blade + fittings, with the quality overlay in the detail) and the detail carries **Sell** + **To Shop**; the **Recorded Compositions** modal's tiles show the trait icon(s) and the detail carries **⚡ Craft** + **🗑️ Delete**. Background: `Screen1bg.png`.
- **Forge screen:** status panel — health bar (no numeric text), then a row with an **ℹ️ tutorial-review button** (left) and the **gold/reputation pill** (mirrors screen 1's `💰 Gold | ⭐ Rep`), then a **"Blade Traits:"** line listing the heated traits (or "None"). The ℹ️ button re-opens past tutorial dialogue boxes (in their own frames) with ◀ Prev / Next ▶ / Close, and stays available after the tutorial. Then a draggable/zoomable 50×50 viewport (drag to pan; mouse-wheel zoom is centered on the cursor; a **📷 free-camera toggle** at the viewport's bottom-right (highlighted gold when active) — when active, moving the sword no longer recentres the view; turning it off snaps back to the sword), 3×3 movement grid, action buttons (Heat, Forge, Record Composition, 🗺️ Chart). ("Record Composition" saves a recorded composition — see §6.)
  - **Grid tiles:** the spawn cell (25,25) shows `tile_centre` and the 8 cells around it show `tile_centre2` (home base); cells the active sword **lands on** show a `tile_path` trail. Dashes only mark the endpoint, so jumped-over cells stay blank; the trail never overwrites hazard, trait, or the home tiles. The trail resets with the active blade — after a forge or on death (`pathCells`, `markPath`/`clearPath`).
- **Onboarding:** 4-scene animated intro (ember particles) → multi-step tutorial (select metals → reach a trait → heat → forge → go to counter → sell a sword → a 2nd Flame-trait customer arrives → back to the forge → open the chart (a text label + pulsing glow over the minimap alternates every 3s between the player marker — "Your location" — and the Flame icon — "Flame trait" — until the chart is closed, so the player sees where to head) → learn the Purify-dash slider (two illustrated dialogue boxes: a tap-vs-hold art frame, then an avoid-impure-tiles art frame) → head west toward the Flame trait (when its ❓ mark is revealed by the fog, a persistent top-of-screen banner — "See the trait mark ❓… add some iron to go down to it." — appears and stays until the player reaches it) → reach the Flame trait, where a bouncing arrow points to the Heat button → heat it → prompt to "Record Composition" (the **Forge button is greyed out from when the Flame is heated until the composition is recorded**, so the player can't accidentally forge first) → record it (a **confirmation box** shows the trait + metals being saved; confirm to record — see §6) → a bouncing arrow points to the now-enabled Forge button to craft the sword → forge it (choose the blade shape, hammer the ingot into form, quench it in water, design the fittings, then sharpen it on the grindstone — see §5) → prompt to go sell it at the counter → sell the flame sword to the 2nd customer → a 3rd customer (off to fight an ice dragon, "weak to heat") arrives, a tutorial box teaches opening **Recorded Compositions** and tapping **Craft** to forge a flame sword from the recorded composition (which re-runs the heat + hammer mini-games — see §6), then giving it to the customer, who is delighted, then a closing "help customers find the perfect sword" tip as the 4th (non-Flame) customer arrives; then, the first time the player finishes a heating minigame after the tutorial (heating that 4th customer's new trait), a one-off record-reminder box — "Remember to record the composition of each new trait you discover, and keep updating the old ones as you improve." — with a hand pointer to the Record Composition button (see §6)), plus a contextual "Shop Available!" tip the first time the player reaches 500 gold (enough to unlock the Shop), which then hand-guides them to the Shop screen and the Unlock Shop button (see §6). **Any tutorial box tied to a customer** (the sell-a-sword prompt, the "another customer" prompt, the Auto-Craft lesson, and the closing tip) is gated to appear **only after that customer's word-by-word line has fully typed out plus a ~2s read pause**, so a tutorial box never overlaps the customer's speech. During the intro, a **"Skip Intro" button** (fixed bottom-right) jumps straight into the game (`launchCoreGame`). A **"Skip Tutorial"** button (in the collapsible cheat box, shown only while the tutorial is running) ends the flow immediately and unlocks everything (metals, passive generation, Record Composition, Chart, the Purify slider). The three cheat buttons live in a **small collapsible box** floating **just above the game frame's top-right** (`#cheatBox` inside a `#frame-shell` wrapper, so it clears the game window / health bar and works on desktop and mobile): a **🛠 toggle** (`toggleCheats`) expands a **horizontal row** of **"+100 Metals"** (adds 100 of every metal), **"+100 Gold"**, **"Skip Stage"** (skips whichever forge minigame is open — heat/shape/hammer/quench/design/sharpen — and proceeds to the next stage), and — **while the tutorial is running** — **"Skip Tutorial"**. The box appears once the game starts (`launchCoreGame`) and stays available for the session, collapsed by default. ⚠️ The Skip Intro button and all three cheats currently ship to players.
- **Feedback:** red flash on damage, orange flash on heat success, green gold-pulse on passive shop sales, "reached a trait" / "trait acquired" toasts. Spending a metal (a move/dash) **flings an ore chunk** (`assets/forge/Metal.png`) from the pressed metal button into the bucket in an arc, and the bucket wobbles as it lands (`tossMetalToBucket`; fires only on an actual spend, so a cancelled Purify hold throws nothing). The **first time** a given trait is heated (per session) shows a celebratory **"New Trait Discovered!"** box with the trait's icon and name — including during the tutorial (it layers above the tutorial dialogue); repeat heats of an already-known trait just show the "trait acquired" toast. Warnings/errors (not enough gold, duplicate composition, wrong sword for a customer, etc.) use a **styled parchment popup** (`gameAlert`, matching the dialogue-frame look) instead of the browser's native `alert()`. The **Heat** button pulses with a glow while standing on a trait; the **Forge** button is disabled until a trait is heated, then pulses with a glow (and during the guided flame step it is re-disabled from the heat until the composition is recorded, so the player records before forging).
- **Tutorial hand pointers:** at each guided step a bouncing 👆/👇/👈/👉 hand points to the element to use next — the Steel & Magnesium metal buttons (until the 4 steel + 1 magnesium recipe is added), Heat, Forge, the left/right screen arrows, Search Inventory, the Chart button, Magnesium again (until the Flame trait is revealed on the map), Record Composition, and — for the 3rd (ice-dragon) customer — the selected composition's **Auto-Craft** button then **Search Inventory**. Each hand clears once its action is taken. Data-driven via a `hand` field on the relevant `tutorialFlow` gate steps.
- **Minimap (Chart modal):** a live canvas minimap of the full 50×50 grid (fully revealed — no fog) — uniform tan ground (hazards are **not** shown), every trait drawn as its emoji icon at its location, and the player marked by the same sword icon used on the grid map (`assets/map/tile_sword.png`) with a pulsing blue glow. Supports **zoom** (scroll / pinch / on-screen +/− buttons, 1×–6×) and **pan** (drag), clamped to the map. **Tapping a trait icon** shows a small label with that trait's name below it. During the tutorial's chart step, a **text label + pulsing glow** (no hand pointer) highlights the target and alternates every 3 seconds between the player marker ("Your location", its own blue glow) and the Flame icon ("Flame trait", an amber glow ring), tracking zoom/pan, until the chart is closed. (Replaces the old static `Minimap.png`, now unused.)

## 9. Known discrepancies & open questions

- ~~Heat quality is Epic-only~~ — **resolved:** quality is now Weak/Fine/Epic, set by the heat timer and capped by blade HP (see §4).
- Map seed is fixed (see §7) — should reset randomize the layout?
- Dagger shape from original GDD is absent (see §5).
- Metals expanded 4 → 8 vs the original GDD.
- **§6-§8 are the older build (2026-10-23):** the landscape build has its own counter, market, quests, shop, cave, basement and
  FTUE (the dated records listed at the top); a rewrite of §6-§8 to it is still to do.
- **The old loop** (hammer travel, the mug, the dragon's pull) is kept for reference in
  `Swordforge_looptest_landscape_hammerloop.html`; the portrait `Swordforge_new_looptest.html` is on an even older loop.
- ~~Hazards decorative~~ — **resolved for landscape (2026-08-18):** hazards now damage the active blade (§3). **Portrait is unchanged** and still has decorative hazards, so the two loop-test builds now diverge on map, fog, traits and hazards.
- **Loop-test builds diverged (2026-08-18):** the landscape build owns the reworked map/traits/hazards; `Swordforge_new_looptest.html` (portrait) was deliberately left on the old behaviour. `TRAITS`/`ORE_TRAIT`/`ORES` are still duplicated verbatim in both files — a trait rework has to touch both, or portrait should be retired.
