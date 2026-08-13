# Potion Craft: Alchemist Simulator — FTUE Analysis

Scope: first-time-user experience only — new game → first day → "End of Tutorial" screen. Build: v1.0 (live Steam). Every factual claim is tagged to a source id from `_sources.json`.

Sources:
- **yt-01** — [100% Walkthrough Part 1, no commentary](https://www.youtube.com/watch?v=efNO5kAilxU). Primary. Fine frame capture (1 frame/2s), 123 frames, 0:00–4:05. Frames are the only signal (no narration). → `Videos/efNO5kAilxU_analysis/ftue-beatsheet.md`
- **yt-02** — [Dr Incompetent "2023 Beginner Guide Ep.1"](https://www.youtube.com/watch?v=ZkqzK_NzzQg). Narrated run of the same tutorial; mined for the creator's intent/why + new-player friction. → `Videos/ZkqzK_NzzQg_analysis/ftue-insights.md`

---

## 1. FTUE at a glance

- **Length:** ~4:05 of continuous play, uninterrupted, to reach the explicit "End of Tutorial" scroll `[genuine source: yt-01]`.
- **Structure:** 3 story cards → fully-scripted first brew → repeat brew (grinding) → 3 customer sales interleaved with new mechanics → end day → tutorial-complete → open play `[genuine source: yt-01]`.
- **Emotional hook the design leans on:** *no pressure*. The "no time limit / the client will not leave" beat is placed deliberately mid-FTUE `[genuine source: yt-01]`; the narrator names this exact moment as when he "oohed and felt great about the game" `[genuine source: yt-02]`.
- **Skippable:** every story card carries a "Skip tutorial!" button `[genuine source: yt-01]`.

## 2. Teach order (mechanic introduction sequence)

| # | Mechanic | Time (yt-01) |
|---|----------|--------------|
| 1 | Story setup: novice alchemist → abandoned house → shop opening | 0:00–0:18 |
| 2 | Add ingredients to cauldron (drag-drop) | 0:20 |
| 3 | Stir with spoon → moves potion icon along Alchemy Map path; hit XP book nodes | 0:30 |
| 4 | Heat with bellows → reveals/applies the effect node | 0:36 |
| 5 | Finish potion (button) → Weak Potion of Healing | 0:50 |
| 6 | Grind with mortar & pestle → same potion, half ingredients (2+2 → 1+1) | 0:54 |
| 7 | Save recipe to recipe book | 1:30 |
| 8 | Move between rooms (nav arrows / WASD) | 1:42 |
| 9 | Offer potion on the scale at shop counter | 1:50 |
| 10 | Sell (price on the Sell button) | 2:04 |
| 11 | Haggle mini-game (topic tiles, price swing) | 2:18 |
| 12 | "Lack of Suitable Potions" — no timer, customer waits | 2:38 |
| 13 | Gather in Enchanted Garden | 2:44 |
| 14 | Brew a new effect *unassisted* (Poison) — combines all prior mechanics | 2:52 |
| 15 | End the day via bed in Bedroom | 3:44 |
| 16 | "End of Tutorial" → Day 2, open play | 4:00 |

`[genuine source: yt-01]` for the whole table. yt-02 confirms the same order narratively `[genuine source: yt-02]`.

**Design read:** the core brew loop (add → stir → heat → finish) is taught **twice back-to-back** on the same potion — first scripted with 2+2, then repeated with the ground-down 1+1 version. Repetition-for-reinforcement, at the cost of ~1 extra minute before the player leaves the lab `[genuine source: yt-01]`. Then mechanic #14 (solo poison brew) is a **graduation test** — same loop, no hand-holding, with a persistent "Try again" reset button as a safety net `[genuine source: yt-01]`.

## 3. The three FTUE customers (the sales spine)

| # | Customer | Request | Potion | Outcome |
|---|----------|---------|--------|---------|
| 1 | Woman, bonnet/pink | Sick husband, fever & sweats | Weak Potion of Healing | Sold straight, **10 gold** `[genuine source: yt-01]` |
| 2 | Hooded man | Flowerpot bonked his head | Weak Potion of Healing | **Haggled 10→14 gold** — teaches haggling `[genuine source: yt-01]` |
| 3 | Woman, green top | Mice infest her hut, wants rat poison | Weak Potion of Poisoning (brewed unassisted) | **Haggled 13→16 gold** `[genuine source: yt-01]` |

Customer 3 is the pivot: the game withholds the needed potion on purpose → forces the garden-gather → solo-brew → return-and-sell full loop `[genuine source: yt-01]`. Narrator confirms this is the intended "now do it yourself" moment `[genuine source: yt-02]`.

> Cross-source note: yt-02's run got different haggle outcomes (heal straight-sold at 10, poison at 13) because haggling is a skill mini-game with variable payout `[genuine source: yt-02]`. Treat exact gold as run-dependent; the *structure* (3 customers, 2 haggles taught) is stable.

## 4. Economy numbers (FTUE window)

- **Starting gold:** 100 `[genuine source: yt-01]`.
- Gold trajectory: 100 → 110 → 124 → **140** by tutorial end `[genuine source: yt-01]`.
- **Reputation:** 0/8 → 4/8 (the "/8" = progress to next reputation tier) `[genuine source: yt-01]`.
- Player reaches **level 2–3** with talent points to spend by/just after tutorial end `[genuine source: yt-01]` `[genuine source: yt-02]`.
- Recipe book: **12 pages**, 1 per saved recipe, erasable `[genuine source: yt-02]`.
- Ingredients used: Terraria, Waterbloom (healing); Terraria + Firebell (poison) `[genuine source: yt-01]`.

## 5. FTUE end marker (as you asked — "till first day ends / tutorial-complete screen")

Two simultaneous signals at **4:00–4:04** `[genuine source: yt-01]`:
1. Banner: **"The new day begins / Game saved."**
2. Full scroll titled **"End of Tutorial"**: *"…you have refreshed your alchemy knowledge and familiarized yourself with the alchemy equipment. In the attic next to the bed, you found a few ingredients and a ladle for water. This is your Potion Shop now, and you decide what to do next…"*

Mechanical trigger = clicking the bed to end Day 1; day counter flips 1→2 `[genuine source: yt-01]`. Narrator states plainly: **"this is the end of the tutorial… now the game just opens up"** `[genuine source: yt-02]`. Cutoff matches your 4:05 hard-stop exactly.

## 6. Friction & UX notes (design-relevant takeaways)

- **Longest dwell in the whole FTUE** is the *solo* poison brew (~22s, 2:56–3:16) — the one moment without step-by-step prompts visibly costs the player the most time, even though ingredients were pre-named. First real cognitive load lands right where hand-holding is removed `[genuine source: yt-01]`.
- **Anxiety pre-empted, not reacted to:** the "no time limit / client will not leave" message is shown *before* the player can panic about lacking a potion `[genuine source: yt-01]`.
- **Retention-tested, not re-taught:** haggling is tutorialized once (customer 2) then reused wordlessly (customer 3) `[genuine source: yt-01]`.
- **Tutorial under-teaches several systems** the narrator has to backfill — high-value list for anyone studying onboarding gaps `[genuine source: yt-02]`:
  - Elemental compass / auto-sort of ingredients by direction (he learned it from a viewer comment, not the game).
  - Haggling's hidden **−1 popularity** cost per haggle.
  - Garden nodes can yield **>1** ingredient (the tutorial's "+1" misleads).
  - Cauldron is **irreversible** — grind partially to control distance (repeated 3× → common beginner mistake).
- **Safety-net framing throughout:** generous drop physics, "Try again" reset button, no failure states in the FTUE `[genuine source: yt-01]` `[genuine source: yt-02]`.

## 7. What Sword Forge could borrow (assumed — my inference, not from sources)

`[assumed]` — transferable onboarding patterns, not claims about Potion Craft:
- Teach the core loop scripted, then immediately re-run it with one twist (efficiency), then a no-hands graduation attempt.
- Pre-empt player anxiety with an explicit "no timer / nothing is lost" beat before the first open-ended task.
- Put a persistent low-stakes "Try again" reset on the first unassisted challenge.
- End the FTUE on a clean day-boundary + explicit "you're on your own now" screen.

## 8. Open questions / gaps

- Exact meaning of the secondary top-right counter (renown vs XP currency) not textually labeled `[genuine source: yt-01]` — `[UNKNOWN]`.
- Whether un-gathered garden plants are truly lost after sleep — narrator guesses yes but is unsure `[genuine source: yt-02]` — `[UNKNOWN]`.
- Two end-of-day inventory ingredients unnamed in captured frames `[genuine source: yt-01]` — `[UNKNOWN]`.
