# Variation A — Towns, Claims & Demand

**Status: proposed design, not committed.** Companion to `specs/variation-a-the-mine.md`, which designs the
expedition/craft/value core. This designs the **town ladder** (the month-to-month spine), the **claim
system** (the idle layer), and **demand**. Target: **mobile F2P**. Rewritten 2026-07-22.

---

## 0. Correction log

This document previously gated town progression on **satisfying the town's cast**. That was a drift and it
is reverted. Two corrections:

| Was | Now | Why |
|---|---|---|
| Gate = the cast's stories are resolved | **Gate = the town's mine is developed to capacity** | An economic gate leaves behind *productive infrastructure*, not a completed checklist. The original objection — "unlock all the map then move on makes the map disposable" — doesn't apply, because a maxed town keeps producing forever |
| Ring-1 nodes are "your cheap volume tier" (still hand-walked every time) | **Nodes can be claimed and developed into passive producers** | Without this, "cheap volume tier" means "grind the easy node forever," which is the exact failure mode flagged as the highest risk in the supply doc |

The **cast** survives — but as the town's *demand profile and emotional layer*, not as the gate.

---

## 1. The model

> **A town is a mine you develop, a cast who buys from it, and a verb you learn there.**

The town ladder is the **spine** (month-to-month). The material economy is the **engine** (day-to-day).
Different jobs, both needed.

```
  ┌─ TOWN 1 ─────────────┐   ┌─ TOWN 2 ─────────────┐   ┌─ TOWN 3 ─────────────┐
  │  rings 1–3           │   │  rings 1–4           │   │  rings 1–5           │
  │  base materials      │   │  rarer materials     │   │  rarest              │
  │  cast: 6–8 regulars  │   │  cast: 6–8 regulars  │   │  cast: 6–8           │
  │  verb: (baseline)    │   │  verb: alloy folding │   │  verb: ...           │
  │                      │   │                      │   │                      │
  │  ┌────────────────┐  │   │  ┌────────────────┐  │   │  ┌────────────────┐  │
  │  │ DEVELOPED MINE │──┼───┼─>│ DEVELOPED MINE │──┼───┼─>│ DEVELOPED MINE │  │
  │  │ produces base  │  │   │  │ produces mid   │  │   │  │ produces high  │  │
  │  └────────────────┘  │   │  └────────────────┘  │   │  └────────────────┘  │
  └──────────┬───────────┘   └──────────┬───────────┘   └──────────┬───────────┘
             │                          │                          │
             └──── feeds ──────────────>└──── feeds ──────────────>┘
                   Town 2 recipes consume Town 1 material.
                   Town 3 recipes consume Town 2 material.
             ►► OLD TOWNS ARE FEEDSTOCK, NOT NOSTALGIA ◄◄
```

---

## 2. Inside a town: the progression curve

Each town has its own arc, and it has a legible shape. This is what "every town had a progression" means:

| Stage | What the player is doing | What they're chasing |
|---|---|---|
| **1 · Arrive** | Manual digs only. Ring 1, surface material. Meet the cast. | learning the local material |
| **2 · First claim** | Afford a **claim** on a ring-1 node → first passive trickle | *"my mine is working while I'm away"* |
| **3 · Push deeper** | Ring 2 by hand. Better purity → better swords → more gold | gear that survives ring 2 |
| **4 · Build out** | Claim and upgrade across ring 1–2. Passive income scales | rate · purity · capacity tiers |
| **5 · The deep** | Ring 3 — the town's best material, hand-dig only at peak purity | the town's signature output |
| **6 · Capacity** | Every node claimed, upgraded to tier N. The mine is *done* and *permanently productive* | **the road to the next town opens** |

Stage 6 is the gate. It is an **economic milestone**, not a checklist — and what you leave behind is a
factory, not a spent map.

---

## 3. Claims — the idle layer

### 3.1 The three states of a node

```
   UNCLAIMED                CLAIMED                    DEVELOPED
   ─────────                ───────                    ─────────
   hand-dig only            passive trickle            faster · purer · deeper bank
   depletes, recharges      banks up to CAPACITY       tiered upgrades
   daily                    then stops                 gold sink that never closes
        │                        │                          │
        └──── claim (gold) ──────┴──── upgrade (gold) ──────┘
```

**Capacity is the return hook.** A developed claim banks output up to a ceiling and then idles. You come
back to collect — the classic idle beat, and a far better daily reason than "nodes recharged." Upgrading
capacity is how a player buys a longer away-time, which is also a clean monetisation seam.

### 3.2 The rule that keeps the game a crafting game

**Claims produce base purity. Peak purity requires a hand-dig.**

| | Passive claim | Hand-dig |
|---|---|---|
| Purity | grade 1–2 (rises with upgrades, never to max) | **grade 3+ — the ceiling** |
| Volume | steady, capped by capacity | one haul |
| Player time | zero | ~90 seconds |
| Minigames | none | **heat, and the whole forge pipeline** |

This is the load-bearing rule of the whole design. It means:

- **Volume never has to be ground** — claims handle it, which kills the "does the trip survive repetition?"
  risk from `variation-a-the-mine.md` §14 outright
- **The minigames never die** — high-end commissions and late-town customers need peak purity, so you
  always go dig by hand
- The expedition becomes what it should be: **the thing you do for the good stuff**, not the tax you pay
  for the boring stuff

Without this rule, full automation turns Sword Forge into a spreadsheet — which is exactly why Variation D
was rejected as an engine. With it, the idle layer is a *floor* under the crafting game, not a replacement.

### 3.3 What upgrades buy

| Tier axis | Effect | Why the player wants it |
|---|---|---|
| **Rate** | output per hour | more material |
| **Purity ceiling** | grade 1 → 2 | fewer hand-digs needed for mid-tier work |
| **Capacity** | bank size before it idles | longer away-time; the F2P seam |

Three axes × N nodes × M towns is a gold sink that structurally never closes (C1).

---

## 4. Cross-town demand — the anti-inflation mechanism

This is the piece that makes towns genuinely cumulative rather than sentimentally so.

**N passive mines all producing means income compounds hard.** The standard failure is that Town 1's output
becomes free gold and the economy inflates. The fix is that **Town 1's output is not gold — it's an
ingredient.**

```
   Town 2 recipe:  2× Town-2 essence  +  4× Town-1 base  ──> a sword
   Town 3 recipe:  2× Town-3 essence  +  4× Town-2 base  ──> a better sword
```

So:

- **Town 1's developed mine is a required input forever**, not a nostalgia visit
- Its passive output is **consumed**, not banked — no inflation
- Its cast still generates (low-value, zero-risk) demand, so the counter there stays alive
- "Max out Town 1 before you leave" becomes **genuinely correct advice**, because Town 2 runs on Town 1's
  throughput

This is how merge and idle games keep three-year-old areas load-bearing, and it's the mechanism, not the
slogan.

---

## 5. Demand: three tiers

Demand does three jobs — it directs the mine, it prices the output, and it carries the fantasy. One tier
each.

```
  ┌──────────────────────────────────────────────────────────────────┐
  │  REGULARS  ·  named, recurring, 6–8 per town                     │
  │  job: emotion, story, rumours, and the town's DEMAND PROFILE     │
  │  ► the reason you care. Not the gate — the flavour of the gate   │
  ├──────────────────────────────────────────────────────────────────┤
  │  WALK-INS  ·  procedural  ·  the existing 7/day rhythm           │
  │  job: volume, economy, keeping the day turning                   │
  │  ► generated from a constraint grammar — free content, no art    │
  ├──────────────────────────────────────────────────────────────────┤
  │  COMMISSIONS  ·  multi-day, player-accepted, high value          │
  │  job: planning; the reason TOMORROW matters                      │
  │  ► and the reason to hand-dig for peak purity                    │
  └──────────────────────────────────────────────────────────────────┘
```

### 5.1 Demand is the routing problem

Rings and claims give the map structure; **demand gives it direction**:

> *"Durable, strong"* → the ring-2 Durable node · *"a Claymore"* → spend iron-heavy getting there ·
> *"Fine or better"* → avoid the hazard band, because impurity caps quality

A session is **read demand → plan a route that satisfies it → execute → deliver.**

### 5.2 Regulars, and the Diary

Already built and unwired: Bram, June, Roland, multi-beat dialogue, 24 trait-specific sale-feedback lines,
the post-sale response gate, and **the Diary** — a locked book that unlocks per customer and logs every
sword you made them. That's a relationship system with nothing attached.

Attach **standing**, raised by fulfilling a regular's *intent* (not just their trait ID). Standing buys:
better prices · story pages · and **rumours** — the direct link from demand back into supply, where a
regular tells you a ring-3 node exists before the Chart shows it.

Standing gates *rumours and commissions*. It never gates **materials** — a player must never be locked out
of a trait family behind a character they don't like.

### 5.3 Walk-ins: obliqueness as the default

Constraint grammar: `trait × intensity × shape × alloy × quality floor`, with difficulty set by how many
slots are live. Town 1: `trait` only. Town 3: all five.

**Make oblique requests the style, not the exception.** The game's two best-written moments are its only
two oblique requests — Bram's *"something that won't break so easy"* → Durable, and the ice-dragon's *"weak
to heat"* → Flame. Potion Shop Alchemy Sim tunes this per customer across 500+ orders.

And **remove the auto-disable on "I have something for you."** It greys out when nothing matches, so the
game answers the question before the player asks it.

### 5.4 Commissions

An accepted commission is **a promise you chose**, which is why it gets Potionomics' momentum without
Potionomics' resentment — their debt clock drove the first 20 hours *and* 50% of all negative reviews,
upvoted six-to-one over every other complaint. Opt-in pressure, no rent, no quota.

Commissions are also where **peak purity** gets demanded, which is what sends the player back down the
shaft by hand.

---

## 6. The day

| Ticks over | Doesn't |
|---|---|
| Claims produce (and bank toward capacity) | Gold, vault, essence, gear, claims — nothing is lost |
| Unclaimed nodes recharge | HP (refills at the forge, always) |
| Commission board refreshes; accepted ones tick down | |
| Regulars on schedule; walk-ins reset | |

Still no rent, no debt, no quota, and **no energy meter** — see `variation-a-the-mine.md` §2.4. Potion
Shop's mana gate is its #1 complaint at 21.9% of negatives, and a claim-capacity ceiling is not a disguised
version of it: you are never blocked from playing, you just stop earning *passively* and have to go dig.

---

## 7. What's already built

| Shipped | Becomes |
|---|---|
| Diary (`diaryGiven`, locked pages, per-customer sword log) | **the standing / relationship UI** |
| Bram / June / Roland + 7-portrait pool | the **Town 1 cast** — needs ~5 more named |
| Word-by-word dialogue, multi-beat `Continue ▶` sequences | unchanged; it's good |
| 24 trait-specific + 5 generic sale-feedback lines | unchanged |
| Post-sale response gate | the beat where standing is awarded |
| Two oblique requests (Bram D2, ice-dragon) | the **template** for all requests |
| 7 customers/day, End Day, day transition | the walk-in rhythm + the claim-collection beat |
| Quests panel | the **commission board** |
| Passive shop (5%/10s) | the model for claim output — same idle primitive, already built |
| Reputation | folds into per-customer standing |

**New:** claim state + upgrade tiers on nodes · per-customer standing · the walk-in constraint grammar ·
the commission board with multi-day timers · cross-town recipe requirements · rumours feeding the Chart.

---

## 8. What the artist builds next

1. **Town 1 cast → ~8 named regulars.** Bram, June, Roland exist; add ~5 with portraits and arcs. Named
   recurring characters are the highest-leverage art in the research corpus — Strange Horticulture's cat
   drew 58 review mentions against 53 for its marquee verb; Little Witch is praised for art at 47.0% and
   characters at 41.1% against brewing at **1.9%**.
2. **Trait skins.** `traitSkins` covers **3 of 24**. 21 traits have no visual identity. This is what makes
   *"I want to see a Celestial Claymore"* true, and it feeds the vanity monetisation seam.
3. **Claim/mine visual states** — an undeveloped node vs a working claim needs to read at a glance on the
   Chart. Small, high-value.
4. **Town 2 cast + region** — only once Town 1's full arc is proven.

---

## 9. MVP split

**In the MVP** (needed for the loop to be legible):
- Claim → passive trickle on ring-1 nodes; **one** upgrade axis (rate) only
- The purity rule: claims cap at grade 1, hand-digs reach grade 3
- Requests specify **trait + intensity**, not just trait ID
- Sale pays requested trait + capped 25% extras
- Remove the auto-disable on "I have something for you."

**After the loop holds:** capacity and purity upgrade axes · standing + Diary wiring · rumours ·
commission board · regulars on schedules · **Town 2 and cross-town recipes** (the anti-inflation mechanism
only matters once a second town exists).

---

## 10. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **Idle drift** — claims get so good nobody hand-digs, and the crafting game dies | **Highest** | §3.2 purity rule. Claims must *never* reach peak purity. Watch the ratio of hand-digs to collections in playtest; if it falls below ~1 expedition per session, the caps are wrong |
| **Inflation** — N towns producing passively | High | §4 — old-town output is *consumed* by new-town recipes, never converted to gold |
| Claim capacity reads as a disguised energy gate | Medium | You are never blocked from digging by hand. Watch this; it's the line between this design and Potion Shop's 21.9% |
| Town 1 becomes a chore to "max" before you're allowed to leave | Medium | Capacity gate should be reachable at ~60–70% of full build-out, with the last tiers optional and profitable |
| Three currencies (gold, metals, essence) + claim state is a lot of UI for a phone | Medium | Collapse metals to a single "alloy stock" readout; claims live on the Chart, not a separate screen |

---

## 11. Open questions

1. **Does the gate need a narrative beat as well as an economic one?** Recommendation: the *economic*
   milestone opens the road; a **cast member's signature commission** is the story scene that plays when it
   does. Both, with economy load-bearing.
2. **Do walk-ins and regulars share the 7/day slot budget?** Sharing squeezes the economy on busy regular
   days; not sharing removes the day's ceiling.
3. **How many nodes per town?** Enough that build-out is a real arc, few enough that the Chart stays
   readable. ~12–18 feels right for Town 1.
4. **Can you claim a node in a town you've left?** Presumably yes — but whether you can *upgrade* remotely
   or must travel back is a real pacing lever.
5. **Does the passive shop survive alongside claims?** Two idle systems may be one too many. Possibly the
   shop becomes the *output* idle layer and claims the *input* one — which is symmetrical and fine — or the
   shop gets folded into commissions.
