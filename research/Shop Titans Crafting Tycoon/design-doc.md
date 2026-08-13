# Shop Titans: Crafting Tycoon — Design Teardown

> Tagging rule: every factual claim ends with `[genuine source: <id>]` or `[assumed]`. Sources indexed at the bottom. Built Phase 2 of `/game-research`, depth: deep. Compiled 2026-08.

---

## Snapshot

- **Genre / lane:** Shopkeeping + crafting management sim with an idle/clicker rhythm and a light hero-collection RPG layer bolted on. [genuine source: yt-05, yt-01]
- **Platforms:** iOS, Android, plus Steam and Epic on PC (cross-progression via optional account link). [genuine source: yt-05, market-ratings]
- **Publisher / studio:** Kabam Games (built by the ex-Riposte team). [genuine source: market-ratings]
- **Launch date / age:** Live since 2019-06-18 — a mature, ~7-year-old title. [genuine source: market-ratings]
- **Scale signal:** ~105k downloads and ~$7.0M IAP revenue in the trailing 12 months, ~48k MAU — small audience, very high monetization. [genuine source: market-downloads-revenue, market-active-users]
- **One-line positioning:** "the whale-driven crafting-tycoon benchmark" — craft gear, sell to heroes, send heroes to farm materials to craft better gear. `[assumed]`

## Core loop

- **Primary actions:** craft an item at a station (tap Craft → short timer), then sell it to a customer NPC at the counter; repeat, upgrading shop/workers between. [genuine source: yt-01, yt-05]
- **Immediate feedback:** gold (and sometimes gems) rise on each sale; crit-crafts throw a "MASTERPIECE!" popup with the item's stats and an "Upgrade to EPIC" button. [genuine source: yt-01]
- **Loop length:** seconds early (craft timers observed at 2–3s at level 1), scaling to ~35 minutes per craft at T6 gear later. [genuine source: yt-01, yt-04]
- **What breaks the loop:** an **Energy** economy — selling/surcharging spends Energy; you regain it via customer interactions, discounts, decorations, and pets. Racks raise the Energy ceiling. [genuine source: yt-05, yt-03]
- **Why it's satisfying:** cozy click-craft-sell rhythm with numbers-go-up and crit "Masterpiece" juice; players describe it as "kind of like a fancy clicker… relaxing… cozy." [genuine source: yt-05]

The loop is explicitly repetitive: "you craft items, you sell them, then you do it all over again. The only real thing you do is manage your heroes and send them on quests." [genuine source: yt-05]

Top-player framing of the loop is 5 concurrent activities kept always-running: **craft** ("craft slots should always be full and spinning"), **upgrade** (always have furniture upgrading), **rush** (spend energy to refill slots), **sell** (don't sit on a full counter), **quest** (keep hero quest slots filled). [genuine source: web-02]

**Selling has its own mini-systems:** a ~75% **Small Talk** roll refills energy [(Max−Current)×0.1 on success]; **Surcharge** sells above base price for a % of missing energy; and full customer throughput needs three interdependent caps aligned — shop size (max 12 customers across 9 expansions), counter level (5 customers L1–5 → 8 at L6–10 → 12 at L11+), and 90–105 display items. [genuine source: web-02]

## Progression & meta

- **Meta systems:** (1) shop expansion + furniture (racks = Energy/sell capacity, bins = crafting capacity); (2) blueprint/tier mastery (T1→T9+); (3) worker leveling; (4) hero roster (recruit, level, equip, send on quests/dungeons); (5) **Ascension** specialization (stars into item lines); (6) guilds with shared town buildings/bonuses; (7) seasons + season pass. [genuine source: yt-02, yt-03, yt-01, yt-05]
- **How systems interlock:** crafting needs materials → materials come from hero quests → heroes need your crafted gear equipped to clear quests → quest loot + gold fund more crafting and shop expansion. Gear also **breaks/wears** and must be repaired, a major gold sink at high tier. [genuine source: yt-05, web-10, yt-04]
- **Power curve:** fast early (shop level 1→3 within the first ~12 min); tiers 4–5 "quick, easy, enjoyable" to master; slows hard mid-game where a paywall is widely reported around level 20+ and again ~level 50 (repair costs outrun income). [genuine source: yt-01, yt-02, web-09, web-10]
- **Tier gating (the spine of pacing):** shop equipment tiers unlock by merchant level — T2 @ L7 climbing to T15 @ L65; hero gear tiers unlock by hero level — T2 @ L3 to T15 @ L38. [genuine source: web-02]
- **Crafting-quality RNG (directly parallel to Sword Forge's quality overlays):** per-craft odds ≈ Normal 95.041% / Superior 3.971% / Flawless 0.669% / Epic 0.269% / Legendary 0.05%, with value multipliers 1.25× / 2× / 3× / 5×. Multicraft (two items at once) is additive: +10% ascension, +5% at 21 stars, +25% events → up to 40%. Fusion upgrades quality (Superior/Flawless/Epic 100%, Legendary 50%) and is **gem-only to rush**. [genuine source: web-02]
- **Ascension specialization:** the recommended first goal is 15 stars in *every* line (≈165 shards/line) for a 10% surcharge-energy cut, before specializing lines to 51 (titan bonuses) or 21 (multicraft). [genuine source: web-02]
- **Endgame loop:** shifts from "craft to progress" to "optimize the shop as a selling machine" — a 3-way layout tradeoff (all-bins for max crafting/Legendary chance ~4,958 energy cap; hybrid one-of-each ~7,000 energy = what most top players run; all-racks ~8,000+ energy pure fast-sell). Endgame is really about heroes: building rosters that clear all content, then perfecting them. [genuine source: yt-03, market-similar]

## Monetization

- **Model:** F2P with IAP + a monthly subscription; negligible ads. [genuine source: market-iap, market-acquisition, yt-01]
- **IAP catalog (US, ranked):** gem packs $1.99 / $4.99 / $12.99 / $29.99; **"30 Day Boost" subscription $9.99/mo**; item bundles $3.99–$19.99. Community reports higher gem sacks up to ~$99. [genuine source: market-iap, yt-04]
- **The subscription is the fulcrum:** community-named "Royal Merchant" (~$10/mo) lets you repair gear with gold and grants extra event rewards; without it, post-~level-50 repair costs make the game "unfun and unrewarding." One player: a subbed account made "x30 the money" of a free one. [genuine source: web-10, market-iap]
- **Gem economy:** ~1 gem ≈ 10,000 gold (via market conversion). Best gem sinks = shop expansion (2,000 gems ≈ 20M gold value) and crafting slots; also gem-opening wood chests for guaranteed rares. $100 ≈ 18,000 gems. Starter packs called "really good value… totally worth buying." [genuine source: yt-04]
- **Currency sprawl:** gold, gems, spin tickets, champion coins, guild coins, renown, fortune tokens, ascension shards — critics call it deliberately confusing ("Confusion Coins"). [genuine source: yt-05]
- **Always-on store pressure:** a permanent gem "+" button top bar; an NPC king (Reinhold) delivers limited-time-offer pitches in-world; "every time you log in there's a new offer." [genuine source: yt-01, yt-05]
- **Revenue tier:** ~$7.0M/12mo unified, ~$0.5–0.65M/month, stable, iOS 51% / Android 49%, ARPD $66.96. [genuine source: market-downloads-revenue]

## Retention hooks

- **Daily hooks:** timed collection reward (a "10:23h" countdown surfaced in the FTUE), daily boss, daily quests, log-in-and-queue-8-crafts routine. [genuine source: yt-01, yt-02, yt-04]
- **Time-gated content:** craft timers (scale to ~35 min at T6), furniture upgrade timers (gated behind guild assists + gems), gear-repair economy. [genuine source: yt-04, yt-03]
- **Social/competitive:** guilds with shared town buildings (+25% craft speed, +50% resource, +51% worker speed in the shown high-level guild), guild bounties, plus global + national + guild **leaderboards** driving spend-to-rank competition. [genuine source: yt-02, web-10]
- **FOMO:** seasons + season pass, rotating limited-time offers, event dungeons. [genuine source: yt-05, web-10]
- **Named live-ops events:** **Tower of Titans** (solo, monthly 2nd–30th, 6 difficulty tiers, Titan's Soul reward), plus guild events **King's Caprice**, **Dragon Invasion**, **Lost City of Gold** (all merchant L25+), and real-world **Full Moon** fusion windows. [genuine source: web-02]
- **Notification triggers:** [UNKNOWN] — not directly observed.

## D1–D7 experience

- **D0 / first session:** deep avatar customization (body/hair/face/clothes, sliders, palette) *before* any gameplay; mentor NPC "Wallace" narrates atomic next-actions via in-world dialogue (no modal overlays); craft → sell → "Sell items to reach level 2" single persistent goal; first crit-craft teaches the "Upgrade to EPIC — Free" rarity button; a separate Hero Creation (name + class + star-stats) flow recruits a combat hero; shop level 1→3 in ~12 min. [genuine source: yt-01]
- **~level 4 (early D1–D2):** guilds + in-game chat unlock; creating your own guild costs 500 gems (~$5). [genuine source: yt-05]
- **D2–D3:** the craft→sell→quest triangle is fully open; quests direct the player to keep upgrading shop/workers/heroes. [genuine source: yt-05]
- **D4–D7:** loop is now familiar ("wash, rinse, repeat"); first monetization pressure reported building around level 20+. [genuine source: yt-05, web-09]
- **D1/D7 retention (iOS US):** D1 56.5%, D7 30.4%. [genuine source: market-retention]

## D30 / long-term

- **D30 retention (iOS US):** 16.0% — elite for the genre; D60 9.7%. Monthly cohort M1 48.6% / M2 36.7%. [genuine source: market-retention]
- **Content cadence:** runs in seasons with a season pass (live-service cadence); exact per-event calendar [UNKNOWN] (version_history not mined this pass). [genuine source: yt-05]
- **Late-game loop change:** from "build/progress" to "optimize the selling machine" (layout min-maxing, surcharge-sell throughput, hero roster perfection). [genuine source: yt-03]
- **Whale/spender path:** buy the subscription for gold-repairs + event rewards, gem-rush shop expansion and crafting slots, chase leaderboard rank. [genuine source: web-10, yt-04]
- **Churn signals:** the ~level-50 "money goes to zero from repair costs, pay or leave" wall; "after some time you cannot advance anymore." [genuine source: web-10]

## Why players return

- **Primary driver:** the **hero↔crafting interlock + guild acceleration** — you log in to queue 8 crafts, collect quest materials, and benefit from guild buildings; the systems feed each other so there's always a next upgrade. This, plus elite D30 (16%), is what sustains $7M/yr off only ~48k MAU. [genuine source: yt-02, market-retention, market-downloads-revenue]
- **Secondary:** (1) cozy low-stakes clicker feel; (2) collection/identity investment (avatar + hero roster); (3) social pull of an active guild. [genuine source: yt-05, yt-01, yt-02]
- **vs genre norms:** standard idle-tycoon + gacha-adjacent playbook, unusually **crafting-forward** and unusually monetization-aggressive for a cozy-looking game. [assumed]
- **Risk factors:** the same monetization pressure that prints money also caps the audience (bimodal reviews, low new-install volume) and drives the mid-game churn wall. [assumed]

## Unlock & pacing schedule

| Day / milestone | Unlock | Source |
|---|---|---|
| D0 | avatar creation, craft→sell loop, first hero recruit, level 1→3 | [genuine source: yt-01] |
| ~level 4 | guilds + chat (own guild = 500 gems) | [genuine source: yt-05] |
| First ~2 weeks | master tiers 4–5; ~1 day per building level; reach "decent" L7–8 baseline | [genuine source: yt-02] |
| merchant L7 | equipment Tier 2 unlocks (tiers then climb to T15 @ L65) | [genuine source: web-02] |
| merchant L20 | Tower of Titans (Alpha) becomes accessible; monetization pressure ramps | [genuine source: web-02, web-09] |
| merchant L25 | guild events unlock (King's Caprice, Dragon Invasion, Lost City of Gold) | [genuine source: web-02] |
| ~level 44–50 | higher hero tiers unlock (gold-buyable); repair-cost wall; subscription pressure peaks | [genuine source: yt-04, web-10] |
| Endgame | shop-layout optimization, hero roster perfection, leaderboard/season chase | [genuine source: yt-03] |
| Ongoing | seasons + season pass; rotating limited-time offers | [genuine source: yt-05] |

## Player sentiment

- **Praise:** cozy/relaxing clicker feel; deep systems ("complexity beyond casual"); genuinely playable F2P *with patience + a good guild*; long-tenured fans ("playing since… love… years"). [genuine source: yt-05, web-09, market-reviews]
- **Complaints:** aggressive monetization ("puts up as many obstacles as possible and sells you the solution"), repair-cost wall / pay-or-leave, too many currencies, paywalled friend-play, constant offer spam, weak story. [genuine source: web-09, web-10, yt-05]
- **Rating snapshot & the delta:** iOS 4.69 (160k) [genuine source: market-ratings]; Android **3.95** on the current Play listing with a heavily **bimodal** distribution (5★ 94,846 vs 1★ 25,314 of 169,100 rated) [genuine source: review-playstore] — note this diverges from Sensor Tower's modeled Android 4.20 [genuine source: market-ratings]. Sensor Tower iOS review corpus is likewise bimodal (1★=18 / 5★=20 of 48). [genuine source: market-reviews]
- **Critic reception:** Metacritic Metascore 42 / user 4.0 — "Generally Unfavorable"; scores 20–75, the low end calling it "slop… blatantly designed around micro-transactions." [genuine source: web-09]
- **Community size/health:** [UNKNOWN] — pending Reddit pull (Stage 1g).

## Open questions / [UNKNOWN]

- [ ] Live-ops / season event calendar and exact cadence — needs `version_history` patch-note mining.
- [ ] Notification triggers — needs device capture.
- [ ] Subreddit size + top community gripes — Reddit stage still running; fold in on patch pass.
- [ ] Full verbatim MiniReview (web-08) — JS-walled, WebFetch failed; needs a browser capture.
- [ ] Rating distribution over time — Sensor Tower `review_history_summary` returned no data.
- [ ] ARPDAU — no DAU exposed by Sensor Tower; only ARPMAU (~$11.7) derivable.

---

## Sources

| id | type | url / description |
|---|---|---|
| market-downloads-revenue | market | Sensor Tower download_revenue_estimates (12mo, WW) |
| market-active-users | market | Sensor Tower active_users (MAU) |
| market-retention | market | Sensor Tower retention_metrics (iOS US) |
| market-iap | market | Sensor Tower top_in_app_purchases (US) |
| market-ratings | market | Sensor Tower app_metadata (iOS/Android ratings) |
| market-reviews | market | Sensor Tower reviews (iOS US corpus, n=48) |
| market-acquisition | market | Sensor Tower ad_network_analysis (empty → negligible UA) |
| market-similar | market | genre/competitive set (web + session research) |
| review-playstore | review | Google Play listing metadata + reviews (com.ripostegames.shopr) |
| yt-01 | youtube | FTUE walkthrough (DjkiXuUllIM) — frames only, no transcript |
| yt-02 | youtube | progression guide (KHncTjjvprs) |
| yt-03 | youtube | endgame shop layout (UcyOqACm5gg) |
| yt-04 | youtube | gem spending guide (5THC_31srzk) |
| yt-05 | youtube | "worth playing 2025" review (P5D8MG92_Eo) |
| web-09 | web | Metacritic scores + critic lines |
| web-10 | web | Steam "pay 2 win" discussion thread (verbatim) |
| web-02 | web | ST Central — mechanics bible (main + 12 sub-pages: crafting odds, customer flow, ascensions, events, tier gating) |
| web-04 | web | playshoptitans.com — 25-blueprint economics table (resource cost / gold value / craft time) |
| web-06 | web | BlueStacks beginner tips |

Also on disk (not individually cited above): web-03 (ackadia monetization critique), web-07 (slashskill full guide), web-11 (Steam reviews), web-12 (Pocket Gamer). web-05 (gamezebo) and web-08 (MiniReview) failed to fetch (bot-block / JS-wall). The Fandom wiki tree (web-01) is a large item/blueprint/hero reference still being swept at report time.
