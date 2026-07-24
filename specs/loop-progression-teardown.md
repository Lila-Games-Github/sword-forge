# Sword Forge — Core Loop & Progression Teardown

**Status:** diagnosis only. No redesign committed yet. Written 2026-07-22 against `index.html` @ `f5a32f8`.
Cross-referenced against `/Users/tarun/LILA/Game Research/SwordForge Research` (7 teardowns).

---

## 0. What the game currently is

A **linear 5-stage crafting pipeline** (heat → shape → hammer → quench → design → sharpen) bolted onto a
**one-time exploration unlock** (a 50×50 fixed-seed grid holding 24 traits at hardcoded coordinates), fed
by a **single repeatable gold sink** (smelter, +1 metal/10s per 50g, infinite), selling into a **customer
queue that performs a single trait-equality check**.

The craft *feel* is genuinely well built — 24 bespoke heating variants (`heatConfigs`), a real hammer
timing game, a real sharpening skill/greed tradeoff. That is the product. The systems around it do not
yet form a loop.

---

## 1. The seven structural findings

### 1.1 Nothing compounds

Every comparable in the research folder has an engine — a thing that gets stronger and feeds back:

| Game | The engine |
|---|---|
| Potionomics | cauldron tier → magimin cap → higher potion tier → gold → cauldron tier |
| Potion Craft | Alchemy Machine tiers (2k/6k/12k g) + a 3-branch talent tree |
| Potion Shop Alchemy Sim | 9 ingredient merge trees (12–18 deep) + Distiller (15k→30k) + 12 factions |
| Little Witch | potion-as-key: each recipe literally unlocks a region |
| Alchemist Shop Sim | knowledge tree + shop/garden tiers *(and it is the cautionary tale — see 1.5)* |

Sword Forge's complete list of gold sinks:

| Sink | Cost | Repeatable? | Effect |
|---|---|---|---|
| 4 diagonal metals | 50g each | no | 4 more movement directions |
| 7 blade shapes | 50g each | no | cosmetic + satisfies a 10%-chance shape request |
| Shop unlock | 500g | no | passive income |
| Smelter upgrade | 50g | **yes, infinite** | +1 metal per 10s tick |
| Quests | — | no (5 one-offs, +20g each = 100g total) | — |

**Total non-repeatable spend in the entire game: 1,050 gold.** After that the only thing to buy is more
movement fuel — and movement fuel's demand collapses (see 1.2). The engine feeds a resource nobody needs.

### 1.2 Auto-Craft strictly dominates the exploration half

`quickCraft` (`index.html:3386`) → `completeForge` auto branch (`index.html:1838`):

- `hazardLoss: 0` — hardcoded. Auto-Craft can never take the −4g/hazard penalty.
- **No HP cap.** The manual branch (`index.html:1851`) applies `healthQualityCap()`; the auto branch does not.
- **One heat sets a uniform quality across every trait** (`index.html:1842-1843`). A 3-trait composition
  needs one good heat, not three.
- Costs exactly the recorded metal counts (`index.html:1841`).

So: re-crafting a recorded composition is **cheaper, safer, higher-quality and faster** than walking the
map. The map is a one-time content unlock, not a loop. Once all 24 traits are recorded, the entire
exploration half — the grid, the Purify dash, hazards, HP, death, the metal-as-fuel system, the chart,
the tile art — is dead content.

The map seed is fixed (`1337`) and trait coordinates are hardcoded (`index.html:2297`), so there is no
second walk either. Map reset changes nothing.

> Potion Craft's fixed map is also identical for every player forever — but there it is the **moat**:
> mastery is real, routes are memorisable, recipes are shareable, and a 28.6k-member subreddit exists
> because of it. Sword Forge has the same fixed-map property and nothing that rewards mastering it.

### 1.3 The value ladder breaks in the first hour

Trait base value = `floor(distance_from_centre / 35.355 × 100)`. Actual spread across the 24 traits:

| | value |
|---|---|
| cheapest (`balanced` @ 24,21) | **11** |
| median | ~50 |
| dearest (`cursed` @ 6,47) | **82** |

Quality adds a flat +0 / +10 / +20. Sword value = **sum of all fused trait values** (`calculateSwordValue`,
`index.html:2254`). One blade may hold one of each trait ID — up to **24 traits**.

Tier thresholds: I <30 · II <60 · III <90 · IV <120 · **V Legendary ≥120**.

- Two mid traits at Epic ≈ 120 → Legendary. Reached within the tutorial's neighbourhood.
- A full 24-trait Epic blade is worth **~1,630g**. The named tier ladder describes roughly the bottom
  **7%** of the achievable value range. There is no tier for 95% of the curve.

### 1.4 The customer check is a single `some()`

`sellSword` (`index.html:3444`): `sword.traits.some(t => t.id === requestedTrait.id)` plus an optional
shape match. The payout is `sword.value` — **the full sum of every trait on the blade**, regardless of
what was asked for.

Therefore the dominant strategy is: build **one** maximal composition, record it, Auto-Craft it forever,
and sell it to whichever customer shows up. A customer asking for `Balanced` (base 11) pays ~1,630g.

Compounding it: the passive shop pays full value at a 5%/10s roll per sword. Ten mega-swords on the shelf
≈ **4,800 gold/minute**, uncapped, with no interaction.

### 1.5 Progression grants access, never capability

The single sharpest lesson in the research corpus, from Alchemist Shop Simulator's most-upvoted review:

> *"Progression is almost nonexistent. Your garden and shop get a little bigger, but you don't. Your
> **speed never improves**, your **watering doesn't get better**."*

Sword Forge is the same shape. Nothing the player buys makes them better at heating, hammering,
quenching, designing or sharpening — the five verbs that constitute 100% of the actual gameplay. There is
no talent tree, no tool tier, no equipment level, no mastery track. The player's own skill improves; the
game never acknowledges or amplifies it.

Related: Alchemist Shop Sim's #2 lesson — **never let a reward increase friction.** Sword Forge's rewards
are neutral rather than harmful, but the same audit applies to whatever replaces them.

### 1.6 The five mini-games never change

Every forge, forever, runs the same pipeline. The heat step has 24 authored variants (excellent); the
hammer, quench, design and sharpen steps have exactly one form each and never escalate, combine, or gate.

Strange Horticulture's structural finding applies directly: **zero new mechanics appear in Days 11–16**,
and ~47% of runtime reuses a complete toolkit — which is the mechanical explanation for its 43
"exact same thing over and over" reviews. That game at least front-loaded four new systems across Days
1/5/8/10. Sword Forge introduces its last new verb in the tutorial.

Potion Craft's counter-lesson is the hopeful one: repetition is simultaneously its **#1 complaint
(54.6% of negatives) and its #1 forgiven flaw** — 87 reviewers call the loop repetitive *and recommend it
anyway*. Repetition loses the player who never bonded with the mechanic; it does not lose the bonded one.
So the fix is not "more variety" by default — it is **making sure the bond forms**.

### 1.7 The day is a container with nothing inside it

7 customers/day, End Day, black transition, +7 of every unlocked metal, day counter. No rent, no debt, no
quota, no contract, no consequence for a bad day. `refusalsToday` exists solely to tick one of five
one-off quests.

Potionomics' finding: **the debt-and-competition deadline is the spine that gives the first 20 hours
forward momentum — and simultaneously the single biggest churn cause** (50% of all negative reviews,
averaging 30 helpful votes vs 5.2 for every other complaint). Potion Craft avoids that damage entirely
and pays for it with the opposite problem: DAU/MAU ~7.3%, "nothing pulls players back."

Sword Forge currently has **neither** — the pacing container without the pressure, and without the
open-ended mastery that would justify not having pressure.

### 1.8 (Bonus) Nothing persists

No save/load. Reload = Day 1, zero gold, empty vault, tutorial replays. Every system in §1.7 —
days, quests, diary, ledger — is session-scoped. This is flagged as the top item in `plan.md`.

---

## 2. What the research folder says to steal

| Source | Lesson | Direct application here |
|---|---|---|
| **Potion Shop Alchemy Sim** | **2 of 4 ingredient attributes revealed; the rest discovered.** "There is always a known unknown." The single best retention primitive in the whole corpus. | Traits currently reveal everything on discovery. Partial-information traits would make the map a knowledge space instead of a checklist. |
| **Potion Shop Alchemy Sim** | Requests are **oblique** — *"even other beggars shy away from the smell of my shoes"*. Difficulty is tuned per customer, not uniform. | Sword Forge has exactly two oblique customers (Bram D2, ice-dragon) and both are scripted one-offs. Everything else names the trait. |
| **Potion Craft** | 71% of lifetime gold came from **haggling**, not brewing. *The economy may not live where the fantasy lives.* | Worth deciding deliberately where Sword Forge's gold comes from, rather than defaulting to "sum of traits". |
| **Potion Craft** | Teaches its **verbs** exhaustively and its **strategy** not at all. The beginner guide covering strategy has 90,291 views vs 57 for raw gameplay. | Sword Forge's tutorial is verb-complete and strategy-silent in exactly the same way. |
| **Strange Horticulture** | Cozy/relaxing cited in **417** of 1,501 reviews; deduction — the marquee verb — in **53**. **The cat is named in 58.** | The Diary / Bram / June / Roland work is likely the highest-leverage thing already in the build. Attachment objects outperform systems. |
| **Little Witch** | Art 47% / cosy 45.8% / characters 41.1% praised — **brewing 1.9%**. *In cozy, the world is the moat.* | Relevant to how the artist's time is spent. |
| **Little Witch** | A completion meta manufactures playtime, but engaged players **smell the formula** when every entry shares the same task shape. | If we add an encyclopedia/mastery track, vary the task shape. |
| **Alchemist Shop Sim** | **Gate relief early.** Its one true automation (irrigation) is reached by ~6% of players. 94% get the friction and never the relief. | Any QoL/automation unlock must land inside the median session budget. |
| **Alchemy Garden** | Every legible goal it set **paid out nothing** (108k-gold land ladder buying functionally identical plots; a deleted 1M-gold retirement goal). Rating fell 93% → 36%. | Audit every future goal against "what does the player actually get". |
| **Potionomics** | **Ship the difficulty escape hatch day one.** Cozy mode halved the dominant complaint — but arrived two years late and could only rescue sentiment, not the launch window. | If we add pressure (deadline/rent/quota), ship the relaxed mode with it. |
| **Potionomics / Potion Craft** | Both economies **solve themselves** and both back halves go slack. | Sword Forge's already does (§1.4), 30 minutes in rather than 25 hours in. |

---

## 3. The three questions the redesign has to answer

1. **What compounds?** Knowledge (the player levels up), economy (the workshop levels up), or collection
   (the catalogue fills up)? Currently: nothing.
2. **What pressures the day?** An obligation ladder (Potionomics), or open-ended mastery with no clock
   (Potion Craft)? Currently: neither.
3. **Why is a second sword different from the first?** Currently it isn't, unless the traits differ —
   and after ~24 traits it never is again.

---

## 4. Sunk art to preserve

Whatever we change, the artist's investment sits in the **forge pipeline and the counter**, not the map:
`assets/forge/` (bellow, pulley, bucket, grindstone + spin frame), `assets/hammer/` (ingot + 3 mid-blade
stages), `assets/sword-parts/` (10 shapes × grips/guards/pommels, plus flame/ice/water skins and
crack/sparkle overlays), `assets/customer/` (11 portraits incl. 4 named story customers),
`assets/backgrounds/` (forge, sharpen, shop, counter).

The **map/grid art is the smallest investment** (9 tiles in `assets/map/`) and the most structurally
broken system. The chalk-map prototype (`research/chalk-map-design.md`) proposes replacing it — note that
this implies a large *new* art spend (a main chart plus 24 per-trait shape charts) for a system whose
underlying problem (§1.2 — exploration is a one-time unlock that Auto-Craft dominates) it does not by
itself fix.
