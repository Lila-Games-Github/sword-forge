# Variation A — "The Mine": Full Design

**Status: proposed design, not committed.** Builds on `specs/loop-progression-teardown.md` (diagnosis) and
`specs/loop-redesign-options.md` (options + acceptance criteria C1–C9). Target: **mobile F2P**.
Written 2026-07-22.

> **This document designs the SUPPLY half** — map, expedition, alloy, essence, craft, value, ladders.
> The **DEMAND half** — customers, standing, commissions, and how towns are structured — is in
> `specs/variation-a-demand-and-towns.md`. Read both; neither loop works alone.

---

## 1. Thesis

> **A sword is an alloy you walked for, a charge you extracted, and a craft you performed.**
> Three axes, three sources, three kinds of mastery. Today the game has only the third, and it doesn't
> price it.

The current build already stamps two of these onto every sword and uses neither:

- `usedMetals` — the metals your route spent — is recorded as the sword's "Composition" and has **zero
  mechanical effect**.
- `hazardGoldLost` — the impurity you picked up crossing hazards — is a flat −4g and nothing else, despite
  the game's own dialogue saying *"You don't want impurities in your alloy."*

So the redesign is less invention than **activation**. The path you walk already is a recipe. Make it one.

### The three axes

| Axis | Source | Player skill | Currently |
|---|---|---|---|
| **ALLOY** — what the blade is made of | the metals your route spends (`usedMetals`) | **route planning** — a spatial puzzle | recorded, inert |
| **CHARGE** — what the blade is infused with | essence extracted at trait nodes | **which nodes, how well you heat** | traits are free permanent unlocks |
| **CRAFT** — how well it was made | hammer / quench / design / sharpen performance | **execution** | works, but value ignores it except as a tier drop |

This is the direct analogue of Potion Craft's alchemy map — *there* the path you trace through ingredient
space determines the potion; *here* the path you walk through metal space determines the alloy. The
difference is that our map also has to yield a **consumable**, because Potion Craft gets its consumable
from the garden and we have no garden.

---

## 2. The map

### 2.1 Rings, not a field

The centre is the forge. Distance from centre becomes an explicit, legible **ring**:

```
            ┌──────────────────────────────────────────┐
            │  RING 3  ·  deep      purity 3           │
            │  ┌────────────────────────────────────┐  │
            │  │  RING 2  ·  outer   purity 2       │  │
            │  │  ┌──────────────────────────────┐  │  │
            │  │  │  RING 1 · near   purity 1    │  │  │
            │  │  │       ┌──────────┐           │  │  │
            │  │  │       │  FORGE   │           │  │  │
            │  │  │       │  (safe)  │           │  │  │
            │  │  │       └──────────┘           │  │  │
            │  │  └──────────────────────────────┘  │  │
            │  └────────────────────────────────────┘  │
            └──────────────────────────────────────────┘
   hazard density   ▁▁▂▂▃▃▄▄▅▅▆▆▇▇  ──────────────────>
   node purity      1 ────── 2 ────── 3
   trip length      ~30s ─── ~60s ─── ~90s
```

Ring already exists implicitly — trait value is `floor(distance/35.355 × 100)`. We're making it explicit,
visible, and something gear can extend.

### 2.2 Multiple nodes per trait — this is what makes it renewable

Today: 24 traits, one hardcoded coordinate each, reached once. Under A: **~50–60 node instances across the
same 24 trait types**, distributed across rings.

Flame has a Ring-1 node (purity 1, close, safe) *and* a Ring-3 node (purity 3, far, dangerous). So:

- **Ring 1 is your farm.** Volume, low risk, low grade. Always available, always worth a 90-second session.
- **Ring 3 is your ambition.** You can see it on the Chart. You can't survive the trip yet. That is the
  always-visible long-term goal (C5).

This single structural change is what turns a checklist into a mine, and it costs **no new art** — the same
24 emoji/trait identities, more instances.

### 2.3 Depletion and recharge — the return hook

A node holds **N charges**. Each extraction spends one. At zero the node is spent and shows as dim on the
Chart. **Nodes recharge on the day tick.**

You come back tomorrow because the Ice node has recharged. That is a diegetic daily hook, not a login
popup, and it is the single most valuable property of this design for F2P.

### 2.4 The pressure is on the world, not the player

**Design rule, and I want to be emphatic about it:** there is **no energy meter, no stamina gate, and no
hard cap on how long you can play.**

The corpus is loudest about exactly this. Potion Shop Alchemy Sim's mana gate is its **#1 complaint at
21.9% of negatives** — *"I downloaded this game just to give you 1 star for your energy system in such a
wonderful game"*, and *"Sadly basically everything is on a timer. Want to craft something? Energy on a
timer. Plant something? Timer."*

Instead: **nodes deplete.** A player who wants to keep going is never blocked — they just exhaust the near
ring and have to **push deeper for fresh nodes**. The constraint pushes them toward the content they
haven't seen instead of toward the app store. Same pacing effect, none of the resentment.

### 2.5 The Chart earns its reveal

`buildMinimapStatic` (`index.html:1655`) currently draws every trait on the board regardless of discovery
state, and the tutorial teaches you to open it. Under A the Chart shows:

- **Surveyed nodes** — with their trait, ring, and live charge state
- **Rumour markers** — a ring-and-direction hint, no identity, seeded by customer dialogue and by finds
- **Nothing else**

Fog on the grid becomes real, because the button that removes it no longer does.

### 2.6 Does the 50×50 grid survive?

Partly. A needs **rings, nodes and traversal**; it does not need 2,500 cells, and 2,500 cells read badly on
a phone. Recommendation: **shrink to roughly 31×31 (~960 cells) with hand-authored ring boundaries and node
placement**, rather than a seeded 20% hazard scatter.

Rationale: the current used radius is only ~29 of a possible 35 anyway (the farthest trait, `cursed`, sits
at distance ~29). Hand-authoring lets us guarantee that every ring has a viable route, that hazard walls
are *interesting* rather than random, and that ring-2 and ring-3 pushes have genuine chokepoints worth gear.

---

## 3. The expedition — session unit #1 (~90 seconds)

```
  ┌─ PLAN ─────────────────────────────── ~10s ──────────────────────┐
  │  Open Chart. See which nodes are charged. Pick a target.         │
  │  "I need Ice. Ring-1 Ice is spent. Ring-2 Ice is charged —       │
  │   but the route runs through a hazard band."                     │
  └──────────────────────────┬───────────────────────────────────────┘
                             v
  ┌─ TRAVEL ─────────────────────────── ~30–60s ─────────────────────┐
  │  Purify dash, 8 directions, 1 metal per move.                    │
  │  ►► THE METALS YOU SPEND ARE THE ALLOY YOU CARRY HOME ◄◄         │
  │  Going north spends steel → your blade is steel-heavy.           │
  │  A dogleg east adds bronze. The route IS the recipe.             │
  │                                                                  │
  │  Hazards: −HP  AND  +1 impurity (caps the eventual quality)      │
  └──────────────────────────┬───────────────────────────────────────┘
                             v
  ┌─ EXTRACT ──────────────────────────── ~30s ──────────────────────┐
  │  Heat minigame — one of the existing 24 bespoke variants.        │
  │  Performance  →  YIELD   (1–4 essence)                           │
  │  Node ring    →  PURITY  (grade 1–3)                             │
  │  Node loses one charge.                                          │
  └──────────────────────────┬───────────────────────────────────────┘
                             v
  ┌─ BANK OR PUSH ───────────────────────────────────────────────────┐
  │  Return home (instant — the walk back isn't played out), or      │
  │  push to a second node on the same trip: more haul, more         │
  │  alloy, more hazard, and the SAME HP pool.                       │
  │                                                                  │
  │  HP hits 0  →  carried home, LOSE HALF THE HAUL, alloy is scrap. │
  └──────────────────────────────────────────────────────────────────┘
```

### 3.1 Why the return trip isn't played out

Push-your-luck needs a **bank** decision, but a literal walk home doubles session length for zero new
information (the route is known, the fog is lifted). So: **HP is the expedition budget, the return is
instant, and the tension lives entirely in "one more node or go home."** Mobile-appropriate, and it keeps
the atomic session under two minutes.

HP refills fully at the forge. It is *not* a daily resource — see §2.4.

### 3.2 What hazards do now

Both of the current effects survive, reframed and finally meaningful:

| | Today | Under A |
|---|---|---|
| HP loss | −25, caps quality via `healthQualityCap()` | −HP, and at 0 the expedition **fails** and you lose half the haul |
| Impurity | flat −4g `hazardGoldLost`, cosmetic | **+1 impurity → caps the alloy grade → caps quality** |

The existing warning line — *"Avoid the hazard zones! You don't want impurities in your alloy."* — becomes
literally true.

### 3.3 Traversal: the 3×3 pad and the Purify slider are kept, and finally have a tradeoff

**Everything about movement is retained** — the 8 direction buttons, one metal per move, the metal-per-
direction mapping, the held-charge Purify slider, the hover path preview, the cancel gesture, the ore-toss
juice. What changes is that the metals stop being a fuel tax and become **the blade itself**.

**The slider currently has no decision in it.** Spec §3: the dash costs *"exactly 1 metal … regardless of
dash distance"*, and the zones pay 3 / 2 / 1 blocks for centre / mid / edge. So landing centre is strictly
better every single time. It is a skill check with no tradeoff — you are only ever being punished for
missing.

Under A, distance-per-metal becomes a real dial, because metal spent is alloy gained:

| Input | Blocks | Metal | Alloy per cell travelled | Use it when |
|---|---|---|---|---|
| **Tap** | 1 | 1 | **1.0 — dense** | building mass for a Claymore; short deliberate hops |
| **Hold → mid** | 2 | 1 | 0.5 | |
| **Hold → centre** | 3 | 1 | **0.33 — thin** | covering ground to a distant node cheaply |

So: **tap to build the blade, hold to cover the map.** Same inputs, same art, same feel — but the player is
now choosing between *travel efficiency* and *alloy density* on every move, and the skill check acquires a
purpose beyond "don't miss."

Recommendation: make it explicit rather than emergent — **tap = a guaranteed single deliberate hop**
(no slider, always succeeds), **hold = charge the dash** (the existing skill check, 2–3 blocks). That's the
same tap-vs-hold vocabulary the bellows already teach.

### 3.4 The route puzzle: same destination, different alloy

Because each direction spends a specific metal, **two routes to the same node produce two different
blades**. North-then-east is steel-heavy; east-then-north is bronze-heavy; a diagonal leg buys you titanium
or red iron. The endpoint is fixed by the node; the alloy is fixed by how you got there.

That is the whole puzzle, and it is the direct analogue of Potion Craft's ingredient vectors — with one
honest caveat: **geography constrains the alloy**. If the Ice node is due north, the lazy route is
all-steel. What makes the choice interesting is that the *indirect* route is available and sometimes
correct, which only holds if the map is authored so detours have texture — hazard bands worth going around,
corridors rich in one metal, chokepoints that cost you purity to cross. This is the strongest argument for
hand-authoring the map (§2.6) rather than scattering hazards at 20%.

Two consequences worth naming:

- **The four locked diagonal metals (50g each) get much more interesting.** Unlocking titanium stops being
  "a fourth direction" and becomes "access to titanium in my alloys" — a materials unlock, not a movement one.
- **The smelter becomes the alloy supply line.** Metals in → routes out → blades. It sits symmetrically
  opposite the claim system: **smelter = passive alloy, claims = passive essence, hand-digs = peak essence.**

### 3.5 The UI problem this creates

Eight metal pools permanently on screen is a lot for a phone, and the current build already carries a
"lowest-first" generation rule that exists mainly to stop the player having to manage them.

Fix the **readout**, not the system: a single **alloy stock bar** with a tap-to-expand breakdown, plus the
live *this-trip* mix shown as a proportional bar (see the Expedition wireframe). The player should read
"mass-heavy, suits a Claymore" at a glance and only drill into eight numbers when they're planning a
specific route.

---

## 4. The craft — session unit #2 (~90 seconds)

Unchanged in feel: **shape → hammer → quench → design → sharpen.** What changes is what it consumes and
what its output is worth.

```
   INPUT                                    OUTPUT
   ─────                                    ──────
   ALLOY   = metals from the trip     ──┐
             (or from the smelter,       ├──>  a sword whose value is
              or a recorded recipe)      │     (charge + alloy + craft)
   CHARGE  = essence, SPENT           ──┤
             1+ per trait               │
   CRAFT   = your performance         ──┘
```

### 4.1 Charge — the knob that replaces `SUM(traits)`

**Charge = essence spent on a trait × its purity grade.**

- 1 Flame essence at purity 1 → charge 1 — *"a faintly Flame-touched blade"*
- 3 Flame essence at purity 3 → charge 9 — *"a furnace given an edge"*

This is the fix for C8, and it's better than a wider tier ladder because it makes a **single-trait sword
worth pursuing**. Today the only way to raise value is to bolt on more traits, which is exactly why the
mega-composition exploit exists. Under A you can go **deep on one trait** or **broad across several**, and
customers can ask for either.

Customers start asking for intensity, not just presence: *"a strongly Flame-touched blade"* = charge ≥ 6.

### 4.2 Alloy — what the route buys you

Two effects, both driven by the metal mix your route spent:

**(a) Grade → quality ceiling.** Alloy grade is set by total metal mass and impurity picked up en route.
A thin or impure alloy caps you at Fine no matter how perfectly you hammer. This is where the current
`healthQualityCap()` logic re-homes.

**(b) Profile → shape affinity.** Each shape prefers an alloy profile. Illustrative:

| Shape | Wants | Because |
|---|---|---|
| Rapier, Saber | light mix, magnesium/aluminium-heavy | thin, fast |
| Claymore, Broadsword | mass, iron/blackIron-heavy | weight is the point |
| Katana, Scimitar | layered — needs ≥3 distinct metals | folded steel |
| Shortsword, Machete | tolerant of anything | the forgiving early shapes |

Match the profile → value bonus. Mismatch → penalty. **This is what makes route planning a puzzle instead
of a commute**: you're not walking to the Ice node, you're walking to the Ice node *via* enough iron to
forge a Claymore.

**Minimum viable version:** ship (a) alone. Alloy grade → quality ceiling is a one-line change and already
delivers "the route matters." Ship (b) in phase 2 once the map is hand-authored to support it.

### 4.3 Craft — finally priced

Heat performance no longer sets trait quality (it sets **yield** now — see §3). Quality comes from the
forge itself: hammer accuracy, sharpen precision, capped by alloy grade. Craft becomes a **multiplier on
the whole sword** rather than a tier nudge, so a great forge on a modest haul is a real strategy.

---

## 5. Value and pricing

### 5.1 The formula

```
  trait_value  = charge × RATE                     (RATE ≈ 8, tuning constant)
  sword_base   = Σ trait_value  +  shape_base
  sword_value  = sword_base × craft_mult × alloy_mult

     craft_mult :  Weak 0.8  ·  Fine 1.0  ·  Epic 1.3
     alloy_mult :  0.9 (mismatch)  →  1.25 (profile match)
```

### 5.2 The sale — killing the mega-sword exploit

Today: `sword.traits.some(t => t.id === requestedTrait.id)` and the customer pays the **full sum of every
trait on the blade**. A customer asking for Balanced (base 11) will pay ~1,630g for a 24-trait sword.

Under A the customer pays for **what they asked for, plus a capped bonus for the rest**:

```
  payout = requested_trait_value × craft_mult × alloy_mult
         + min( other_traits_value , 25% of the above )
         ± reputation modifier
```

Multi-trait swords stay *good* — they're flexible (fit more requests), they're better shop stock, and they
fill encyclopedia entries — but they stop being an arbitrage. And the passive shop pays `sword_value` at a
**capped rate per day**, not an uncapped 5%/10s roll.

### 5.3 Tier names

Re-derive from the achievable range once §5.1 is tuned. "Legendary at 120" describing ~7% of the curve is
not a balance problem, it's a naming bug.

---

## 6. Progression — the five ladders

All gold-funded, all always visible, all satisfying C5 (**improve the verbs, not just the access**).

| Ladder | Buys | Verb it improves |
|---|---|---|
| **1 · Reach** — boots, lantern, ward | hazard damage ↓, vision ↑, ring access | *how far you can go.* The ring-3 node you can see and can't survive is the game's spine |
| **2 · Extraction** — tongs, bellows, crucible | essence yield ↑, purity floor ↑, longer heat timer | *how much a node is worth to you* |
| **3 · Forge stations** — anvil, grindstone, quench trough | **wider hammer timing window, wider "keen" band, forgiving quench** | *your execution.* The direct C5 answer — the minigames literally get easier as you invest |
| **4 · Smelter** — the existing 50g ladder | metals/tick → alloy capacity | *how many swords per day.* Finally has a purpose |
| **5 · Catalogue** — recipe slots, shop slots, ledger | what you can auto-craft, passive throughput | *breadth* |

**Ladder 3 is the one I'd protect hardest.** It is the difference between this game and Alchemist Shop
Simulator, whose most-upvoted review is *"Your garden and shop get a little bigger, but you don't."* An
anvil that widens `HAMMER_RING_MS` is a progression system that makes the player *better at the game*, and
almost nothing in the corpus does this.

**Gate relief early.** Alchemist Shop Sim's one true automation (irrigation) reaches ~6% of players — *"the
vast majority will never get a whiff."* Every ladder's first two tiers must land inside the median player's
first few sessions.

---

## 7. The day

| Ticks over | Does not tick over |
|---|---|
| Node charges refill | HP (refills at the forge, always) |
| Smelter output banked | Gold, vault, essence, gear, recipes |
| Order board refreshes | Anything the player would resent losing |
| Customers reset to 7 | |

**No rent, no debt, no quota — for now.** Potionomics is the cautionary tale: its deadline is *"the spine
that gives the first ~20 hours forward momentum"* **and** the top churn cause at 50% of all negative
reviews, most-upvoted by a factor of six. If we ever add obligation, the relaxed mode ships **the same day**
— their Cozy mode halved the dominant complaint but arrived two years late and could only rescue sentiment,
not the launch window.

---

## 8. Session shapes

| Budget | What fits | Completes something? |
|---|---|---|
| **~2 min** | one Ring-1 expedition → auto-craft from a recipe → sell | ✓ a sword, sold |
| **~10 min** | 3–4 expeditions, hand-forge 2 swords, restock the shop | ✓ a day's stock |
| **~30 min** | a Ring-3 push with a planned alloy route, several crafts, catalogue work | ✓ a gear tier |

C3 is satisfied at the 2-minute mark, which is the one that matters. Potion Craft's DAU/MAU of 7.3%
(~2 sessions/month) is what happens when the smallest meaningful unit is an hour.

---

## 9. Auto-Craft, repriced

Stays. It's the correct F2P convenience and the natural monetisation seam. Potion Craft's terms, not the
current ones:

| | Today | Under A |
|---|---|---|
| Alloy cost | recorded metals (a free resource) | recorded metals — now genuinely scarce |
| Essence cost | — | **full price, every craft** |
| Hazard/impurity | `hazardLoss = 0` hardcoded | n/a — no trip taken, so alloy grade is the recipe's stored grade |
| Quality | one heat sets all traits uniformly | **capped one tier below hand-forged** |
| What it removes | the trip, the risk, *and* the cost | **the trip only** |

It becomes what quick-brew is in Potion Craft: a time-saver that never beats doing it yourself (C4).

---

## 10. Where money enters

No energy gate (§2.4), so we monetise **convenience, capacity and vanity** — never access.

| Seam | Shape |
|---|---|
| **Node instant-recharge** | The natural one. Rewarded-ad version for the free tier, currency for the paid |
| **Auto-Craft charges** | Time-skip. Free daily allowance, buy more |
| **Gear/station tiers** | Soft-currency ladder with a hard-currency accelerator |
| **Capacity** | Recipe slots, shop slots, essence storage |
| **Vanity** | Trait skins, forge/shop decoration, sword display. Directly fed by §11 |
| **Rewarded video** | Double a haul, re-roll an order, a second extraction from a spent node |

Explicitly rejected: energy/stamina gates, and anything that blocks play (§2.4).

---

## 11. What this does for curiosity (C6)

Three things, all cheap relative to their effect:

1. **Charge makes traits worth revisiting.** You don't "have" Flame; you have *four Flame essence at
   purity 2* and you want purity 3. A trait stays interesting after the first heat.
2. **The Chart stops spoiling itself** (§2.5) — the ring-3 node is a rumour before it's a marker.
3. **Trait skins.** `traitSkins` (`index.html:1302`) covers **3 of 24 traits** — Flame has 3 blades / 3
   grips / 5 guards / 2 pommels; Ice and Water have one of each; the other **21 have nothing**. This is
   the curiosity engine and 87% of it isn't built. *"I want to see what a Celestial Claymore looks like"*
   is the sentence the whole redesign is trying to make true, and this is the line item that makes it.

   Also: delete the Design Desk's info button. Its entire job is to tell the player their choices don't
   matter.

---

## 12. What happens to the existing build

**Kept, unchanged:** the 24 bespoke `heatConfigs` · the forge pipeline (shape/hammer/quench/design/sharpen)
· `traitSkins` and all sword-part art · the counter, portraits, word-by-word dialogue, Diary, story
customers · the shop and ledger · the smelter · grid tiles, metal-toss juice, Purify dash.

**Reframed, low cost:**

| System | Change |
|---|---|
| Heat outcome | quality → **yield** (1–4 essence) |
| Node ring | → **purity** (1–3) |
| `usedMetals` | inert record → **the alloy**, with grade and profile |
| `hazardGoldLost` | flat −4g → **impurity → alloy grade cap** |
| `healthQualityCap()` | HP → quality | → HP is the expedition budget; alloy grade is the cap |
| Auto-Craft | strictly dominant → convenience (§9) |
| Chart | full reveal → surveyed + rumours |
| Passive shop | uncapped 5%/10s at full value | → capped daily throughput |

**New:** essence inventory and its UI · node instances with charge state · gear/station ladders · the value
formula (§5) · persistence (C9).

**Cut:** the Design Desk info button · the fixed `traitCoordinates` table (replaced by node instances) ·
the shipped cheat buttons (`+100 Metals`, `+100 Gold`, `Skip Stage`, `Skip Intro`) · `SUM(traits)` pricing.

---

## 13. Minimum viable slice

The smallest build that proves or kills the design. Everything else waits.

1. **Persistence** (C9) — nothing is measurable or tunable without it
2. **Essence**: traits yield a consumable; recipes cost it; nodes deplete and recharge daily
3. **Multiple nodes per trait across 3 rings** — the renewability change
4. **Alloy grade → quality ceiling** (§4.2a only; skip shape affinity)
5. **The value formula** (§5.1) and the capped sale (§5.2)
6. **Auto-Craft repriced** (§9)
7. **Chart fog** (§2.5)

That's the loop. Ladders, shape affinity, order generation, encyclopedia and Town 2 all come after it holds.

---

## 14. Risks and what to prototype first

| Risk | Severity | Mitigation |
|---|---|---|
| **The trip doesn't survive repetition.** The Purify dash is a good 30-second beat and has never been asked to run hundreds of times. A makes it the spine. | **Highest** | **Prototype this before anything else.** Build a bare loop — dash out, heat, bank — and play 30 expeditions in a row. If it's tedious at 30 it is fatal at 3,000 |
| Gathering-game drift — the forge becomes a formality | High | Keep the trip ≤45s; keep `craft_mult` the dominant term in value |
| Grind perception | High | Alchemist Shop Sim: *"repetitive"* ties *"cozy"* at 27 mentions each, and 16 of 27 grind complaints sit in **positive** reviews. Gate relief early (§6) |
| Two currencies (metals + essence) is too much inventory for a phone | Medium | Metals are already 8 pools. Consider collapsing the display to a single "alloy stock" readout with a breakdown on tap |
| Node recharge reads as a disguised energy gate | Medium | §2.4 — you are never blocked, only pushed deeper. Watch this in playtest; it's the difference between the design and Potion Shop's 21.9% |
| Hand-authoring the map is real work | Medium | It's also the thing that makes ring pushes interesting. Budget it |

---

## 15. Open questions

1. **Does essence stack per trait, or per trait-and-purity?** Per-purity is richer (you can hold 3× purity-1
   and 1× purity-3 Flame and choose) but it triples inventory. Leaning per-purity with a merge action —
   *n* low-purity → 1 higher — which imports Potion Shop's merge layer for free.
2. **Shape affinity (§4.2b): ship it or cut it?** It is the thing that makes routing a real puzzle. It is
   also the thing most likely to be opaque on a phone. Prototype after the MVP holds.
3. **Map size.** 31×31 hand-authored is the recommendation; needs a layout pass to confirm the rings work.
4. **Does the heat minigame still need 24 variants** if its output is yield rather than quality? Probably
   yes — they're built and they're the game's best texture — but the difficulty curve should now track
   *ring*, not trait.
5. **Where does the order generator (Variation B) attach**, and does it replace the current 7-customers-a-day
   or sit alongside it? Deferred to after the MVP.
