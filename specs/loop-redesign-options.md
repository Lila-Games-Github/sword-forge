# Sword Forge — Core Loop & Progression: Options

**Status: exploration. Nothing here is committed.** Diagnosis it builds on: `specs/loop-progression-teardown.md`.
Target model (decided): **mobile F2P**. Written 2026-07-22.

---

## 1. What any answer has to satisfy

These are acceptance criteria, not preferences. Each is derived from a specific failure in the current
build or a specific finding in the research corpus. Every variation below is scored against them in §7.

| # | Constraint | Why — and where it comes from |
|---|---|---|
| **C1** | **The economy must never solve.** | Sword Forge's solves in ~30 min (`SUM(traits)` payout on a `some()` check, uncapped passive shop). Potionomics solves ~day 25 of 50 and its back-half tension had to be *authored*. Potion Craft's terminal chapter is a 3-hour grind the player asked twice to end. On premium this is survivable; on F2P it is terminal. |
| **C2** | **Something must be consumed on every craft.** | Nothing is today. Traits are permanent unlocks. Potion Craft's ingredients are consumed every brew — which is why its garden and merchants stay load-bearing after the map is fully known. |
| **C3** | **There must be a 2–4 minute session that completes something.** | Potion Craft's DAU/MAU is **7.3%** — ~2 sessions/month. Its own teardown: *"There is no authored session shape."* F2P cannot run an economy on that. |
| **C4** | **Automation removes effort, never cost or risk.** | Potion Craft's quick-brew removes map navigation and still charges the full ingredient bill. Sword Forge's Auto-Craft hardcodes `hazardLoss: 0`, skips the HP cap, and collapses N heats into 1 — so it removes cost *and* risk, and the map dies. |
| **C5** | **Progression must improve the player's verbs, not just their access.** | Alchemist Shop Simulator's most-upvoted review: *"Your garden and shop get a little bigger, but you don't."* Its one true automation is reached by **~6% of players**. |
| **C6** | **The player must want to craft something before a customer asks for it.** | The Design Desk currently ships an info button whose job is to say choices don't matter. `traitSkins` covers **3 of 24** traits. Every request is a `some(t => t.id === requestedTrait.id)` check with the "I have something" button auto-disabled when you don't. |
| **C7** | **New content must not invalidate old content.** | Sequential disposable regions = Potion Craft's 2%-completion shape tiled N times. Every retained player eventually catches the head of production. |
| **C8** | **The value ladder must span the achievable range.** | Tier V "Legendary" starts at 120; a full blade is ~1,630g. The named ladder describes ~7% of the range. |
| **C9** | **State must persist.** | No save/load today. Reload = Day 1. Non-negotiable for F2P; also blocks any measurement. |

**A note on the retention benchmark.** Potion Craft's D1 ~47% / D7 ~13% is a *premium purchase* cohort —
people who paid $19.99 and carry commitment bias. It does not port to free installs at face value. The
number that actually describes the loop is **DAU/MAU 7.3%** and **MAU −67% in 18 months despite free
content drops**. All three are one root cause: finite completable content with no session shape (C3).

---

## 2. The framing: which screen is the game?

Sword Forge has three screens — Shop, Counter, Forge/Map. Every variation below is an answer to *which
one is the engine*. All three screens keep existing in all four variations; what changes is which one the
repetitive loop lives in, and therefore what the player masters.

```
   ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
   │  MAP         │      │  FORGE       │      │  COUNTER     │
   │  (supply)    │─────>│  (transform) │─────>│  (demand)    │
   └──────────────┘      └──────────────┘      └──────────────┘
         ▲                      ▲                      ▲
      Variation A          Variation C            Variation B
      "The Mine"          "The Collection"       "The Order Book"
    loop = gathering      loop = making          loop = fulfilling
    master: routing       master: combinations   master: constraints
```

**Variation D ("The Idle Workshop") is a fourth answer — the loop lives *between* sessions.** It's
covered and rejected in §6.

---

## 3. Variation A — "The Mine" *(the one we've been developing)*

### 3.1 The single change

**A trait stops being a fact you learn and becomes a material you spend.**

Today: reach a trait → heat it → it is fused onto the blade → recorded as a composition → available
forever, free, via Auto-Craft. The map is a checklist you complete once.

Under A: a trait node is a **renewable deposit**. Heating it yields **essence** — a quantity of a
consumable. Every sword burns essence. Nodes recharge on the day tick. The map becomes a mine you return
to, and the recorded composition becomes a *recipe you can afford or not afford* rather than a permanent
unlock.

Everything else in the diagnosis falls out of this one reclassification.

### 3.2 The repetitive loop (the 2–4 minute session)

```
  ┌─ 1. PICK A TARGET ──────────────────────────────────────────┐
  │    Chart shows known nodes + their charge state.            │
  │    Depth = value = risk. "I need 3 Ice, the node is ring 2."│
  └──────────────────────┬──────────────────────────────────────┘
                         v
  ┌─ 2. THE TRIP ───────────────── ~30–45 sec ──────────────────┐
  │    Purify dash out. Metals spent per move.                  │
  │    Hazards are a live wager — HP is the currency of greed.  │
  └──────────────────────┬──────────────────────────────────────┘
                         v
  ┌─ 3. EXTRACT ────────────────── ~30 sec ─────────────────────┐
  │    Heat minigame (one of 24 bespoke variants).              │
  │    Performance → YIELD (how much essence)                   │
  │    Depth       → PURITY (what grade of essence)             │
  └──────────────────────┬──────────────────────────────────────┘
                         v
  ┌─ 4. FORGE ──────────────────── ~60–90 sec ──────────────────┐
  │    Spend essence + metal against a recipe.                  │
  │    shape → hammer → quench → design → sharpen               │
  │    Performance → quality. Unchanged from today.             │
  └──────────────────────┬──────────────────────────────────────┘
                         v
  ┌─ 5. PLACE IT ───────────────── ~15 sec ─────────────────────┐
  │    Sell to a waiting customer, or stock the shop.           │
  └──────────────────────┬──────────────────────────────────────┘
                         v
                    [ GOLD ] ──> tools ──> deeper reach ──┐
                                                          │
  └───────────────────────────────────────────────────────┘
```

**The atomic unit is one expedition**, not one day. That is deliberate: the player must be able to
complete something meaningful in a single bus ride. A "day" becomes a container of 3–6 expeditions, not a
prerequisite for any of them.

### 3.3 Why this satisfies C1 and C2

The resource graph closes:

```
   metals ──(movement)──> reach ──(heat)──> essence ──(forge)──> swords
     ▲                       ▲                                     │
     │                       │                                     v
   smelter <──── gold <──────┴──── tools <──────────────────── sales
```

Every arrow consumes. There is no terminal node. The current build's graph has `traits` as a terminal
node — you reach it once and it stops consuming anything, which is why everything upstream of it dies.

### 3.4 What compounds — the progression that brings them back

Four ladders, all funded by gold, all always-visible:

| Ladder | What it buys | Satisfies |
|---|---|---|
| **Reach** (tools/gear) | Survive deeper rings. Ring 2 nodes yield higher-purity essence at higher hazard density. This is the primary long-term goal and it's *visible from hour one* — you can see the Cursed node on the chart and you can't survive the trip. | C5 — it improves the verb (how far you can go), not just what you own |
| **Yield** (extraction gear) | Essence per heat. Directly multiplies every session. | C5 |
| **Throughput** (smelter) | Metals per tick → expeditions per day. The existing 50g ladder, finally with a purpose. | C1 |
| **Catalogue** (recipes, shop slots) | What you can make and how much passively sells. | C1 |

**The daily return hook is diegetic:** nodes recharge on the day tick. You come back tomorrow because
the Ice node is full again, not because a login popup gave you 50 gems. That is the single most valuable
property of this variation for F2P.

**Towns are the month-to-month spine, and they are cumulative** (see §5.2): Town 1's nodes remain your
cheap high-volume tier forever; Town 2's customers want compositions that need both. Old content stays
live (C7).

### 3.5 Auto-Craft, repriced

Auto-Craft stays — it's the right F2P convenience and the natural monetisation seam. It just gets Potion
Craft's terms instead of its current ones:

| | Today | Under A |
|---|---|---|
| Essence cost | n/a (no such resource) | **full price, every craft** |
| Hazard penalty | `hazardLoss = 0` hardcoded | n/a — you already paid in essence |
| HP cap | skipped | n/a |
| Heats required | 1, for all N traits | 1, and quality is capped one tier below a hand-forged equivalent |
| What it removes | the trip, the risk, and the cost | **the trip only** |

It becomes what quick-brew is in Potion Craft: a time-saver that never beats doing it yourself. (C4)

### 3.6 Concrete first-pass numbers *(illustrative — to be tuned, not committed)*

- **Essence per extraction:** 1–4 units, set by heat performance × node purity.
- **Recipe cost:** 1 essence per trait per sword at ring 1; deeper traits cost more essence *and* are worth
  more, so margin stays roughly flat and the reason to go deep is **access to what customers want**, not
  raw gold-per-minute. (Guards against C1 — depth must not be a straight income multiplier.)
- **Node recharge:** full at the day tick; partial recharge on a timer for the impatient (an offer seam).
- **Value formula:** stop paying `SUM(traits)` on a single-trait match. Pay for the *requested* trait plus a
  reduced rate on extras — otherwise the mega-composition exploit survives the redesign intact (C8).
- **Tier thresholds:** re-derive from the actual achievable range, not 120.

### 3.7 Risks

1. **It turns a crafting game into a gathering game.** If the trip is the loop, the forge risks becoming a
   formality. Mitigation: keep the trip to ~30–45 seconds and keep quality (the forge's output) as the
   dominant term in value.
2. **Grind perception.** Alchemist Shop Sim: *"repetitive"* ties *"cozy"* at 27 review mentions each, and
   16 of the 27 grind complaints sit inside **positive** reviews. Gathering loops attract this. Mitigation
   is C5 — relief must be purchasable early (their #1 lesson: their one automation reaches 6% of players).
3. **The traversal itself has to feel good hundreds of times.** The Purify dash is a decent push-your-luck
   beat but it has never been asked to carry this much. This is the single biggest prototype risk and the
   thing I'd test first.

---

## 4. The alternatives

### 4.1 Variation B — "The Order Book" *(the loop lives at the Counter)*

**The pitch:** the game is a commission business. Orders arrive with **multiple constraints** — trait,
shape, quality floor, sometimes a budget, a deadline, or an oblique description you must decode. You read,
decide whether you can fill it, plan, craft, deliver. Rank up. Harder orders, pickier clients, better pay.

**The loop:** `order board refreshes → read constraints → decide (accept / decline / stockpile) → craft
→ deliver → standing ↑ → better board`

**What's renewable:** **orders, procedurally generated from a constraint grammar.** This is the variation's
decisive advantage — content scales without an art pipeline at all. Potion Shop Alchemy Sim runs 400+
clients and 500+ orders on exactly this, with 12 faction relationship tracks layered on top.

**What compounds:** your **rank and standing**. Guild tiers or noble houses gate which board you see, which
gates your income ceiling. Potionomics' competition ladder is the same idea with a deadline attached.
Secondary: a stocked vault becomes strategic — answering an order on demand beats crafting to order.

**Session:** naturally bounded and short. "Clear three commissions."

**Return hook:** the board refreshes daily; high-value contracts expire. Strong and conventional.

**Where the map goes:** it becomes a per-town knowledge unlock — walked once, consulted after. It stops
needing to be renewable, which means *less work on the currently-broken half*. But you keep a large system
that isn't load-bearing.

**The hole:** what is consumed? If materials come from a merchant for gold, gold is the only resource and
the economy is one-dimensional — that's Alchemy Garden, whose every legible goal paid out nothing and whose
rating fell 93% → 36%. B needs a material source bolted on, which is A in miniature.

**The other risk, and it's your own complaint:** *"you're not crafting out of your own curiosity."* B makes
that structural. Unless orders are genuinely oblique and reward cleverness, it is a task list. And Potion
Craft's counter-warning: its sale step carried **71% of all gold** and was one of the most-complained-about
systems in the game.

---

### 4.2 Variation C — "The Collection" *(the loop lives at the Forge)*

**The pitch:** the game is a catalogue of swords, and you craft to see what things look like. 24 traits ×
10 shapes × 3 qualities × skins is an enormous visual space. Every combination is an encyclopedia entry
with graded tasks (Little Witch's C→B→A→S), and entry ranks grant **real capability** — faster heats,
higher yields, new shapes.

**The loop:** `pick a combination you haven't seen → source it → craft it → entry fills → rank grants
capability → unlocks harder combinations`

**What compounds:** the encyclopedia itself, with capability attached to rank so it satisfies C5.

**The decisive advantage:** it is the **only variation whose answer to "why craft?" is "because I want to
see it"** — which is precisely the gap you identified. It also makes the art the content, which is where
your investment is and where you're now willing to hire. Little Witch's Encyclopedia (96 entries) converts
a ~20-hour story into a **50-hour median playtime**.

**Return hook:** the weakest of the three. Collection drives *completion*, not *daily return* — the entire
Little Witch retention section reads as *"players return because they are partway through a story and a
catalogue."* You would need a daily layer bolted on.

**The risks, both from the same teardown:**
- Little Witch's own warning: *"a completion meta can manufacture playtime, but engaged players can smell
  the formula"* — every entry in a region shares the same task shape, and its most-invested detractors call
  it *"garbage design existing only to stretch out playtime."*
- Its positive reviewers praise art at **47.0%** and brewing at **1.9%**. Collection retention is really
  *art* retention. That's viable — but it means the game's quality ceiling is set by the art budget, not
  the design.

**The hole:** same as B. Collection is a goal layer, not a resource economy. It does not by itself satisfy
C1 or C2.

---

## 5. Modifiers — these layer onto any variation

Not alternatives. Each is independently valuable and independently shippable.

### 5.1 Partial information on traits *(the strongest single primitive in the corpus)*

Potion Shop Alchemy Sim reveals **2 of 4** ingredient attributes on acquisition; the rest are discovered by
experiment or bought. A slot can also resolve to *"No property"* — so experimentation is genuinely risky,
not monotonically rewarding. The teardown's read: *"there is always a known unknown."*

Applied here: a trait reveals its name and one property on discovery; its heat behaviour, its skin, and its
interaction with other traits are learned by using it. Directly attacks C6 and costs almost nothing in art.

### 5.2 Cumulative towns *(the month-to-month spine)*

Towns as regions, with three rules that keep them from becoming disposable:

1. **Old towns stay live.** Town 1 nodes become the cheap high-volume tier — the farming layer, exactly how
   merge and idle games keep three-year-old areas useful.
2. **Demand crosses towns.** Town 2 customers want compositions needing Town 1 *and* Town 2 materials.
3. **Every town buys a verb, not just a region.** Little Witch does this correctly — Extractor, then
   Roaster, then Mixer, plus new puzzle types per act. Strange Horticulture stops adding systems at Day 10
   of 16, and *"the exact same thing over and over"* is its single most-upvoted negative.

At 3–5 towns in year one this is comfortable. At "on and on forever" with disposable towns it's a content
factory with no floor.

### 5.3 The Chart earns its reveal

`buildMinimapStatic` (`index.html:1655`) draws **every trait on the board regardless of discovery state** —
no fog, uniform ground, tap for the name — and the tutorial teaches you to open it. The fog on the main
grid is theatre. Fix: the Chart shows what you've surveyed, plus rumour markers (a customer mentions a
trait, an unlock hints at a ring). Cheap change, large effect on C6.

### 5.4 Trait skins for all 24 traits

`traitSkins` (`index.html:1302`): Flame has 3 blades / 3 grips / 5 guards / 2 pommels. Ice and Water have
**one of each**. The remaining **21 traits have none**. This is the curiosity engine and 87% of it isn't
built. Independent of every decision in this document.

---

## 6. Rejected: Variation D — "The Idle Workshop"

The loop lives *between* sessions: hire apprentices, build stations, tune a production line, collect
offline output, check in to optimise. A genuinely strong F2P shape with a proven monetisation model.

**Rejected because it guts the five minigames** — the heat variants especially — which are the best-built
thing in the codebase and the entire reason the game has texture. It converts a crafting game into a
spreadsheet. Worth revisiting only as a *late-game* layer sitting on top of a chosen engine, never as the
engine itself.

---

## 7. Scorecard

`●` satisfies · `◐` partial / needs a bolt-on · `○` does not address

| | C1 never solves | C2 consumable | C3 session | C4 automation | C5 verbs | C6 curiosity | C7 additive | Content cost |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|---|
| **A · The Mine** | ● | ● | ● | ● | ● | ◐ | ● | Medium — mostly numbers + state; reuses all existing art |
| **B · The Order Book** | ◐ | ○ | ● | ● | ◐ | ○ | ● | **Lowest** — orders are generated, not authored |
| **C · The Collection** | ○ | ○ | ◐ | ◐ | ● | ● | ● | **Highest** — scales with art |
| *Modifiers* | — | — | — | — | — | ● | ● | Low |

Read across the rows and the shape is clear: **A is the only one that closes the resource loop.** B and C
each leave C1/C2 open and need a material economy bolted underneath — and that bolt-on *is* A in miniature.

Read down the columns and the complement is just as clear: **A is weakest exactly where B and C are
strongest.** A doesn't generate demand cheaply (B does) and doesn't answer "why craft this?" (C does).

---

## 8. Recommendation

**A is the engine. B is the demand side. C is the goal layer.**

- **A — The Mine** carries the minute-to-minute and the resource economy. It is the only variation that
  satisfies C1 and C2, and it costs the least because it is a reclassification (trait = material) rather
  than a rebuild. Every existing asset survives.
- **B's order generator** replaces the current `some()` check as the demand side. Procedural constraint-based
  commissions give the day a shape and cost nothing in art. Take the generator; leave the rank ladder for
  later.
- **C's encyclopedia** becomes the goal layer — the reason to craft a Celestial Claymore nobody asked for.
  Attach capability to entry ranks so it satisfies C5 rather than being a checklist.
- **Modifiers 5.1–5.4** ship independently of all of the above and 5.3/5.4 could start now.

**Sequencing if we go this way:**

| Phase | What | Why first |
|---|---|---|
| 0 | Persistence (C9) + re-pricing the sale/value formula (C8) + Auto-Craft terms (C4) | Nothing is measurable or tunable until state persists; the value exploit invalidates any balance work done before it |
| 1 | Essence: trait → consumable, nodes recharge, recipes cost materials | The one change everything else depends on |
| 2 | Reach/yield tool ladders + Chart fog (5.3) | Turns the map into a place with a reason to return |
| 3 | Order generator (B) | Gives the day a shape |
| 4 | Encyclopedia (C) + trait skins (5.4) | The curiosity layer, once the economy holds |
| 5 | Town 2 | Only once a full loop is proven in Town 1 |

---

## 9. Open questions

1. **Does the trip survive repetition?** The single largest risk in A. The Purify dash has never been asked
   to run hundreds of times. This should be prototyped and felt before anything else is built.
2. **Where does money enter?** No variation here specifies a monetisation surface beyond "Auto-Craft and
   node recharge are natural seams." Needs its own pass.
3. **What is a "day" for, once the expedition is the atomic unit?** Currently it gates customers and
   restocks metals. Under A it should gate node recharge — but whether it also gates anything else
   (a board refresh, a rent payment, an obligation) is undecided, and Potionomics is the cautionary tale
   for adding pressure: its deadline drove both its momentum and 50% of its negative reviews. If we add
   pressure, the relaxed mode ships day one, not two years later.
4. **How much of the 50×50 grid survives?** A needs nodes, rings and traversal; it does not need 2,500
   cells. A smaller, denser, hand-authored map may serve better and read better on a phone.
5. **Value formula.** `SUM(traits)` has to go, but its replacement decides whether multi-trait swords are
   interesting or dominant. Needs modelling before it's chosen.
