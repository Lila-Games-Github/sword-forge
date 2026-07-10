# Potion Craft: Alchemist Simulator — Reference-Game Research

> **Purpose.** *Potion Craft: Alchemist Simulator* is the primary design reference for **Sword Forge**. This document captures how Potion Craft works — with emphasis on its signature spatial-crafting mechanic — and distils **actionable lessons** for Sword Forge.
>
> **Status.** Research/reference only. This file does **not** describe Sword Forge's own design — see `specs/game-design.md` (SSOT) for that. Nothing here overrides the spec.
>
> **Compiled.** 2026-07-10.
> **Method.** Multi-source deep research (fan-out web search → source fetch → 3-vote adversarial verification of 25 claims, 25/25 confirmed) plus a live app-analytics pull for the mobile version. Sources are linked inline and listed at the bottom. Confidence is noted where a claim carried a dissenting verification vote.
>
> **⚠️ Key framing caveat.** Potion Craft's "map" is a **freeform, continuous 2D plane**, *not* a discrete grid. Sword Forge's crafting is grid-based. The parallel between the two is a **design analogy** (spatial navigation as crafting), not a literal equivalence. Read every comparison in that spirit.

---

## 0. Executive summary

Potion Craft (developer **niceplay games**, publisher **tinyBuild**; Steam Early Access 21 Sep 2021, full Windows release 13 Dec 2022) is a hand-drawn alchemy simulator whose entire identity rests on **one signature mechanic: the Alchemy Map.** You don't pick a recipe from a list — you *navigate* a potion marker across a fog-covered 2D map by grinding and adding ingredients (which plot directional paths), stirring (which advances the marker), and using bases/salts (which pull, rotate, or erase the path). You lock in effects by aligning the marker over bottle-shaped "effect zones" and pumping the bellows; alignment precision sets the effect tier.

On top of that sit a **moral customer economy** (requests with optional/mandatory conditions, a ±100 good/evil reputation) and a **gold-gated progression** (a tiered Alchemy Machine unlocking salts and a chain of legendary recipes ending in the Philosopher's Stone).

Critically it is respected but divisive — **Metacritic 74 (PC), user 7.1** — praised as an *innovative, experimentation-rewarding* mechanic ("failure is a feature, not a bug") but criticised because **the one clever mechanic wears thin** and the late game leans on grinding. The developer has said outright that the game only worked because the *control feel* of manipulating the map was made "perfect."

**The single most important takeaway for Sword Forge:** a spatial-navigation crafting mechanic can carry a whole game *if the moment-to-moment control feel is exceptional* — but a novel mechanic alone is not a full game. Plan for **depth and variety layered on top** of the core grid, or risk the exact "wears thin" criticism Potion Craft received.

---

## 1. Snapshot

| | |
|---|---|
| **Title** | Potion Craft: Alchemist Simulator |
| **Developer** | niceplay games (indie studio) |
| **Publisher** | tinyBuild |
| **Genre** | Hand-drawn alchemy / crafting / shop-management simulation |
| **Steam Early Access** | 21 Sep 2021 |
| **Full release (Windows)** | 13 Dec 2022 |
| **Consoles** | Xbox (~Dec 2022); PS4/PS5/Switch (2023) |
| **Mobile** | Via Netflix Games; separate store listing now appearing (see §8) |
| **Metacritic (PC)** | **74** — "Mixed or Average" (13 critic reviews: 7 positive / 6 mixed / 0 negative); **User 7.1** (114 ratings) |
| **OpenCritic** | ~83 — "Strong" (different aggregation method) |

Sources: [Steam store page](https://store.steampowered.com/app/1210320/Potion_Craft_Alchemist_Simulator/) (primary), [Wikipedia](https://en.wikipedia.org/wiki/Potion_Craft), [Metacritic](https://www.metacritic.com/game/potion-craft-alchemist-simulator/), [OpenCritic](https://opencritic.com/game/14152/potion-craft-alchemist-simulator). *(All verified 3-0.)*

> **Note on sales numbers.** Concrete units-sold / peak-concurrent / revenue figures were **not** confirmable from authoritative sources; review counts are the only public proxy. Treat "commercial success" as *critically visible and long-tailed* rather than a specific number.

---

## 2. Core gameplay loop

**Gather → Grind → Mix/Brew → Sell → Upgrade**, repeated across in-game days.

1. **Acquire ingredients** — buy from a travelling trader/merchant, or grow your own in a garden. (No active foraging.)
2. **Grind** ingredients with a mortar & pestle.
3. **Mix / brew** — add ground ingredients to the cauldron over a **base** (water, oil, or wine), heat the coals, boil, and stir.
4. **Sell** — each day, customers visit the shop with requests; you sell finished potions and decide *who* to serve.
5. **Upgrade** — spend gold on the Alchemy Machine, ingredients, and shop growth; discover new recipes.

Sources: [Steam store page](https://store.steampowered.com/app/1210320/Potion_Craft_Alchemist_Simulator/), [Fandom: Potion Craft](https://potion-craft.fandom.com/wiki/Potion_Craft). *(Verified 3-0.)*

The Steam/Play store description (publisher's own words) frames it as physically interacting with tools: *"Grind ingredients and carefully mix them in your cauldron… Heat the coals. Boil and stir. Add the base: water, oil, or… something else."*

---

## 3. ⭐ The Alchemy Map — the signature mechanic (the centerpiece)

**This is why Potion Craft is Sword Forge's reference.** The entire craft is a spatial-navigation puzzle on a 2D map. There is *no recipe list to memorise* — you steer a marker toward effects.

### 3.1 The board
- A **fog-shrouded 2D parchment map**. A **potion marker** (a little bottle) sits on it and can travel across it.
- Scattered across the map are **effect zones ("effect markers")** — fixed, bottle-shaped silhouettes (healing, poison, invisibility, etc.). They start as **question marks** and are only revealed once discovered.
- **Fog hides everything unvisited**; as the marker travels it **uncovers the surrounding terrain**, so *exploration = recipe discovery*. Different ingredients push into different uncharted areas.

### 3.2 How you move the marker (the tool verbs)

| Action / tool | Effect on the map |
|---|---|
| **Grind ingredient (mortar & pestle)** | Determines **how far** along that ingredient's fixed vector the path is traced. *More grinding = farther.* You can stop at almost any distance. |
| **Add ingredient (to cauldron)** | **Plots a path**, appended to the end of the current path, starting from the marker's current position. Each ingredient has its own direction/shape. |
| **Stir the cauldron** | **Irreversibly advances** the marker forward along the plotted path. (You cannot un-stir.) |
| **Ladle / add base** | Pulls the marker **back toward the map origin** in a *straight line* (not a retrace of the travelled path). Acts like dilution. |
| **Bellows (heat/fire)** | **Locks in an effect** — see §3.3. |
| **Salts** (crafted; see §3.4) | **Rotate** or **erase** the path, or **pull** toward the nearest effect. |

**Bases each have their own map.** Water (default), **oil** (repositions effects and adds *swamp* terrain that halves movement speed), and **wine** each present a distinct navigable map.

### 3.3 Locking in an effect (precision matters)
- An effect is imbued only by **pumping the bellows while the marker is touching an effect marker.**
- The result has a **tier — I, II, or III** — filling that many of the potion's **5 effect slots**.
- **Tier depends on alignment precision**: the more completely the marker overlaps the effect marker, the higher the tier. Near-perfect overlap → tier III.
- A single potion can hold **multiple effects** (up to the 5 slots), so multi-effect potions require chaining alignments across the map.

Sources: [Fandom: Alchemy Map](https://potion-craft.fandom.com/wiki/Alchemy_Map), [Fandom: Ladle](https://potion-craft.fandom.com/wiki/Ladle). *(Verified 3-0.)*

### 3.4 Orientation is a second axis — salts
The marker's **rotation** is an additional navigable dimension that changes how it aligns with effect markers:
- **Sun Salt** — rotate potion + path **clockwise**; **Moon Salt** — **counter-clockwise** (~1,000 grains per full rotation).
- **Pouring in more base gradually reverses** the rotation (dilution).
- **Void Salt** — gradually **erases** the built path.
- **Philosopher's Salt** — **draws** the potion toward the nearest effect (like pouring).

Salts are technically consumable ingredients but function as **path-manipulation utilities**; they're crafted in the Alchemy Machine (§5). Sources: [Fandom: Alchemy Map](https://potion-craft.fandom.com/wiki/Alchemy_Map), [Fandom: Alchemy Machine](https://potion-craft.fandom.com/wiki/Alchemy_Machine). *(Verified 3-0.)*

### 3.5 Why it's novel and satisfying
- **Multiple routes to the same result.** The developer *deliberately* designed so the same effect is reachable through different ingredient shapes/approaches — enabling player expression and improvisation. (Niceplay CEO **Mikhail Chuprakov**, DevGAMM 2024.)
- **Tactile, physical verbs.** Grinding, stirring, pumping — every input is a hand action, not a menu click.
- **Failure is cheap.** Experimentation is rewarded; there's essentially *no punishment for a "wrong" brew* (you learn the map).
- **Control feel is the whole game.** Chuprakov: *"If I couldn't make the control perfect, the game would never work."* He wanted *"a game where… you can make the potion the way you want with different shapes."*

Source: [Gamereactor — DevGAMM 2024 interview](https://www.gamereactor.eu/potion-craft-creator-if-i-couldnt-make-the-control-perfect-the-game-would-never-work-1459873/). *(Verified 3-0.)*

---

## 4. Economy & customers

### 4.1 Requests (the "sell" half of the loop)
- Each customer arrives with a **request** — often **vague** — that may carry **conditions** beyond the desired effect: specific ingredients to include/exclude, salt/base restrictions, ingredient-count limits, or required potion qualities.
- Conditions are **colour-coded**:
  - **Green = optional.** Meeting them makes the customer **pay more** (fulfilled optional conditions multiply price).
  - **Red = mandatory.** The customer **won't buy** a potion that fails them.
- Community guides report up to **two optional + two mandatory** extra conditions per request.

Source: [Fandom: Requests](https://potion-craft.fandom.com/wiki/Requests). *(Verified 3-0.)*

### 4.2 Reputation — a two-sided moral system
- Bounded **+100 / −100**.
- Gained by **serving helpful customers** their desired potions **AND by turning down malicious requests** (you're rewarded for *refusing* to sell harmful potions).
- Serving morally dubious customers **decreases** it.
- Your reputation level **shifts the customer mix**: closer to +100 attracts more "Good" customers/quests; closer to −100 attracts more "Evil" ones.
- **Popularity** is tracked *separately* from reputation.

Sources: [Fandom: Reputation](https://potion-craft.fandom.com/wiki/Reputation), [TheGamer reputation guide](https://www.thegamer.com/potion-craft-alchemist-simulator-reputation-guide-increase-decrease-consequences/). *(Verified 3-0.)*

### 4.3 Pricing, haggling, and buying
- Selling price scales with **potion potency/effects and fulfilled optional (green) conditions**.
- **Haggling** exists when buying ingredients from merchants (successful haggling saves coin) — but reviewers repeatedly call it **weak/underdeveloped**. *(The exact selling/haggling interaction — minigame vs. fixed markup — was not confirmable; see Open Questions.)*
- Ingredients: **buy from travelling merchants** or **grow your own** in a garden.

### 4.4 Customization (retention/expression hook)
Per the store description: players can change **bottle shape, label type, icon, colours**, add a **custom name and label description**, and arrange potions on shelves — a low-stakes creative/display layer on top of the systemic game.

---

## 5. Progression

Progression is driven by **gold funding a tiered Alchemy Machine** plus **sequentially discovered legendary recipes.**

**Alchemy Machine upgrade tiers** (bought from the Fellow Alchemist; **20,000 gold total**):

| Tier | Cost | Unlocks |
|---|---|---|
| Repair kit | 2,000g | Basic machine; **Nigredo** recipe |
| Upgrade kit | 6,000g | Machine's leftmost side; **Albedo, Citrinitas** |
| Advanced upgrade | 12,000g | Full unlock; **Rubedo, Philosopher's Stone (Magnum Opus)** |

**Legendary recipe chain** (each discovered by crafting the previous one):
**Nigredo → Albedo → Citrinitas → Rubedo → Philosopher's Stone.**

- **Recipe discovery is spatial**, not a list: you find effects by exploring uncharted (fogged) map regions with new ingredient combinations.
- **Ingredient unlocks** come from new merchant stock and garden growth.

Sources: [Fandom: Alchemy Machine](https://potion-craft.fandom.com/wiki/Alchemy_Machine), [Attack of the Fanboy upgrade guide](https://attackofthefanboy.com/guides/potion-craft-alchemy-machine-upgrade-guide/). Machine cost tiers verified **3-0**; the exact legendary-recipe sequence/gating verified **2-1** (the Fandom page returned HTTP 402 on direct fetch, so recipe order relied on search snippets + secondary guides).

> **Open question — "talents".** No separate **talent/skill-tree** system distinct from Alchemy Machine upgrades + recipe discovery was confirmable. If Sword Forge wants a talent tree, Potion Craft is *not* precedent for one.

---

## 6. Game feel & art direction

- **Hand-drawn "alchemy manual" aesthetic** — the map is a fog-covered parchment; the whole UI reads like an illustrated medieval alchemist's notebook. The UI is frequently singled out as *lovingly crafted* ([design breakdown, Medium](https://medium.com/@saragiraltfdez/potion-craft-and-its-lovingly-well-crafted-ui-57670cec4e13)).
- **Tactile, physical inputs.** Grinding the pestle, stirring, pumping bellows — the *feel* of manipulation is the point, not menu selection.
- **Control feel as the make-or-break design pillar** (developer, §3.5). This is the through-line of the whole design: the mechanic is only fun because the moment-to-moment manipulation is precise and responsive.
- **Low-stress / cozy framing.** Ambient, unhurried; "no punishment for failure" is a deliberate tone as much as a mechanic.

---

## 7. Reception — praise vs. criticism

### What critics & players praise
- **The map-navigation crafting system is the standout** — repeatedly called *clever, innovative, deeply robust.*
  - *Hardcore Gamer (90):* "The unique crafting system of navigating potions through a sea of recipes is fun and enticing."
  - *Hey Poor Player (80):* "one of the cleverest games on a mechanics level."
  - *GameGrin (9/10):* "With no punishment for failure, Potion Craft encourages natural curiosities by rewarding players that experiment… failure is a feature, not a bug." Both *"easy to get into"* and *"rewards committed play."*
- **Experimentation-first, accessible depth** for casual and committed players alike.

### What critics & players criticise (the recurring complaint)
- **The one clever mechanic wears thin; the game lacks long-term depth.**
  - *KeenGamer (65):* "It feels less like a full game and more like a mechanic in search of a game."
  - *Edge (70):* "The charm of those inventive crafting mechanics can wear off, with progression in the later stages stretched… thin."
  - *The Games Machine (78):* "an uninspired endgame relying on grinding."
  - *Finger Guns (70):* "can get repetitive and frustrating at times."
- **Weak haggling / shallow economy** noted in multiple reviews.

This split *is* the 74 Metascore: 6 of 13 critics landed "mixed."

Sources: [Metacritic critic reviews](https://www.metacritic.com/game/potion-craft-alchemist-simulator/critic-reviews/), [Metacritic](https://www.metacritic.com/game/potion-craft-alchemist-simulator/). *(Praise for the mechanic verified 3-0; complaint cluster verified 3-0.)*

---

## 8. Mobile market snapshot (live app-analytics pull, 2026-07-10)

Included because Sword Forge is mobile-minded. **Headline: Potion Craft's commercial story is PC/console; the standalone mobile version is brand-new and low-traction.**

- **Android** — `com.niceplaygames.PotionCraft`, publisher **tinyBuild**, category **Simulation**, content rating **Everyone 10+**.
  - Store listing live but effectively **soft-launch / unreleased**: `release_date: null`, **0 ratings**, **< 5k downloads** and **< $5k revenue** last month; download/revenue *estimates* not yet available (too new).
  - **Monetization: freemium** — *"Play the first two chapters free… unlock the full game with a one-time purchase"* (premium unlock, not ads/IAP-heavy).
  - [Google Play listing](https://play.google.com/store/apps/details?id=com.niceplaygames.PotionCraft&hl=en_US).
- **iOS** — no genuine Potion Craft listing found in the dataset (appears Android-first / not yet on the App Store, aside from the earlier Netflix Games distribution).

**Implication for Sword Forge:** Potion Craft proves the *design* on premium PC/console, but it is **not** a proven free-to-play mobile performer. Do not assume its economy (one-time unlock, no ads, weak haggling) maps onto a mobile-monetized Sword Forge. Its **touch-control adaptation for the map mechanic is unverified** and is the most relevant open question for a mobile Sword Forge (see below).

---

## 9. → Lessons for Sword Forge (the actionable payoff)

### 9.1 Direct mechanic parallels

| Potion Craft | Sword Forge analogue | Note |
|---|---|---|
| Alchemy Map (continuous 2D plane) | Crafting **grid** (discrete tiles) | Same *idea* (crafting = spatial navigation); different topology. Grid is more legible/tappable on mobile — a genuine advantage. |
| Marker traverses paths plotted by ingredients | Sword moves across grid tiles | Sword Forge already has `tile_path` (trail of landed cells) — the same "your route is visible" idea. |
| Grind amount = path distance | (Hammering / step intensity?) | Potion Craft ties a *physical action's intensity* to *distance travelled*. Consider whether a Sword Forge action modulates movement magnitude. |
| Effect zones; alignment precision → tier I/II/III | Quality tiers (Weak `crack` / … / Epic `sparkle`) | **Precision-of-alignment → quality tier** is a proven, satisfying reward curve. Sword Forge already grades quality — tying it to *spatial precision* is on-reference. |
| Salts rotate/erase/pull the path | (Grid modifiers / hazard tiles / tools?) | Path-manipulation *utilities* add a second skill axis. Sword Forge has `tile_hazard` — lean into modifier tiles as a "salts" equivalent. |
| Fog reveal = discovery | Grid exploration | Discovery-through-play beats recipe menus; consider fogged/locked grid regions unlocked by traversal. |
| Requests: green (optional, pay more) / red (mandatory) | Counter-customer orders | A clean, teachable order system. **Steal the green/red condition model** — it creates risk/reward on every sale without a tutorial wall. |
| ±100 good/evil reputation shifts customer mix | Screen-2 reputation | Two-sided reputation that *changes who walks in* gives reputation teeth. Sword Forge already has rep — make it *steer the customer pool*, not just gate a number. |
| Tiered machine (2k/6k/12k) gates salts + recipe chain | Gold-gated upgrades | Simple, legible sink→unlock ladder. |

### 9.2 What to borrow
1. **Obsess over control feel of the grid.** Potion Craft's own developer says the game *only worked* because manipulation felt perfect. For Sword Forge this means the tap/drag/hammer feel on the grid must be the highest-polish thing in the build. **This is the #1 lesson.**
2. **Multiple routes to the same result.** Reachability-by-different-paths is what made experimentation fun and gave replay value. Let players reach a given sword quality/trait via more than one grid route.
3. **"Failure is a feature."** Cheap, low-punishment experimentation lowered the skill floor while keeping a high ceiling. Avoid harsh fail states on the grid.
4. **Green/red order conditions** — adopt this near-verbatim for counter customers; it's an elegant risk/reward and price-multiplier system.
5. **Reputation that changes the customer pool**, not just a score.
6. **Precision → quality tier** as the core reward mapping.

### 9.3 What to avoid / watch out for (learn from its criticism)
1. **The "one clever mechanic wears thin" trap.** This is Potion Craft's single biggest critique. **A novel grid mechanic is not a full game.** Sword Forge must layer genuine variety, escalating goals, and a non-grindy endgame *on top of* the grid. Budget design time for the *back half* of the experience.
2. **Don't let the endgame collapse into grinding.** Late-stage progression stretched thin was a repeated complaint. Keep new *verbs/tiles/modifiers* coming, not just bigger gold numbers.
3. **Don't ship a shallow economy.** "Weak haggling" was a recurring ding. If Sword Forge has haggling/selling interaction, give it real decisions.
4. **Don't assume the mobile economy is solved.** Potion Craft is a *premium* PC/console title; its mobile version is unproven and uses a one-time-unlock model. Sword Forge's mobile monetization is its **own** problem to solve — Potion Craft is a design reference, not a monetization one.

### 9.4 Open questions worth answering before leaning harder on this reference
- **Touch adaptation:** How were grinding/stirring/bellows re-mapped for touch on the mobile port? (Unverified — and the most directly relevant thing for a mobile Sword Forge.)
- **Haggling/selling interaction:** What actually happens at point of sale beyond green/red price multipliers?
- **Hard numbers:** No confirmed units-sold / concurrent-player figures were found — treat "success" qualitatively.

---

## 10. Caveats on this research

- **Grid ≠ map.** Potion Craft's map is a **freeform continuous plane**, not a discrete grid. The "analogous to Sword Forge's grid" framing is a design analogy imported from the research brief, not an established equivalence.
- **Source mix.** The snapshot, core loop, and design-intent claims are anchored by **primary** sources (Steam store page; the developer's DevGAMM 2024 interview). The **detailed** map/economy/progression mechanics rest largely on the **Potion Craft Fandom wiki** plus corroborating editorial guides (TheGamer, Attack of the Fanboy, Gamezebo) — appropriate for routine game-mechanic facts and multiply corroborated, but secondary. No full GDC/postmortem talk was located beyond the DevGAMM writeup.
- **Two findings carried a dissenting vote** (both ultimately corroborated): finer path-node details, and the exact legendary-recipe sequence/gating (Fandom Alchemy Machine page returned HTTP 402 on direct fetch).
- **Reception figures are platform- and time-sensitive.** 74 Metascore / 7.1 user score are the **PC** figures and may drift; OpenCritic's ~83 reflects a different method. "Full release 13 Dec 2022" is **Windows-specific**; console and mobile dates differ.

---

## 11. Sources

**Primary**
- [Steam store page — Potion Craft: Alchemist Simulator](https://store.steampowered.com/app/1210320/Potion_Craft_Alchemist_Simulator/)
- [Gamereactor — Niceplay CEO Mikhail Chuprakov, DevGAMM 2024 interview](https://www.gamereactor.eu/potion-craft-creator-if-i-couldnt-make-the-control-perfect-the-game-would-never-work-1459873/)
- [Google Play listing (mobile)](https://play.google.com/store/apps/details?id=com.niceplaygames.PotionCraft&hl=en_US) + live app-analytics pull (§8)

**Reference / secondary**
- [Wikipedia — Potion Craft](https://en.wikipedia.org/wiki/Potion_Craft)
- [Fandom — Alchemy Map](https://potion-craft.fandom.com/wiki/Alchemy_Map) · [Ladle](https://potion-craft.fandom.com/wiki/Ladle) · [Requests](https://potion-craft.fandom.com/wiki/Requests) · [Reputation](https://potion-craft.fandom.com/wiki/Reputation) · [Alchemy Machine](https://potion-craft.fandom.com/wiki/Alchemy_Machine)
- [Attack of the Fanboy — Alchemy Machine upgrade guide](https://attackofthefanboy.com/guides/potion-craft-alchemy-machine-upgrade-guide/)
- [TheGamer — Reputation guide](https://www.thegamer.com/potion-craft-alchemist-simulator-reputation-guide-increase-decrease-consequences/)
- [Medium — "Potion Craft and its lovingly well-crafted UI"](https://medium.com/@saragiraltfdez/potion-craft-and-its-lovingly-well-crafted-ui-57670cec4e13)

**Reception aggregators**
- [Metacritic](https://www.metacritic.com/game/potion-craft-alchemist-simulator/) · [Critic reviews](https://www.metacritic.com/game/potion-craft-alchemist-simulator/critic-reviews/)
- [OpenCritic](https://opencritic.com/game/14152/potion-craft-alchemist-simulator)

*Verification: 25 claims adversarially verified (3-vote), 25/25 confirmed; findings synthesised to 14. Full agent transcript retained in the session's workflow journal.*
