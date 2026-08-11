# Market Data — Monetization

App: Shop Titans (iOS 1361253233). Sensor Tower, US, pulled 2026-08.

## Model
F2P with IAP + a monthly subscription. Negligible ad monetization (see acquisition.md). [market-iap, market-downloads-revenue]

## IAP catalog (top SKUs, US)  [market-iap]

| SKU | Price | Type |
|---|---|---|
| Gem Offer 1 | $1.99 | gem pack |
| Gem Offer 2 | $4.99 | gem pack |
| Gem Offer 3 | $12.99 | gem pack |
| Gem Offer 5 | $29.99 | gem pack |
| 30 Day Boost | $9.99 | **subscription (P1M)** |
| Special Offer | $3.99 | offer |
| Light item bundle! | $4.99 | item bundle |
| Boosted item bundle! | $12.99 | item bundle |
| Marvelous item bundle! | $18.99 | item bundle |
| Plucky item bundle! | $19.99 | item bundle |

Ladder: $1.99 → $29.99 gems, plus a $9.99/mo subscription ("30 Day Boost" ≈ the community-named "Royal Merchant" tier) and rotating item bundles $3.99–$19.99. Higher tiers ($99 gem sacks) reported by community sources but not in the top-10 ranked SKUs here. [market-iap]

## Currency design (from web sources, to confirm in Phase 2)
Hard currency = **Gems** (bought or slowly earned); soft = Gold (from selling crafted items). Gems named "Confusion Coins" by critics — obscure real-money cost. [genuine source: web-08 pending verify]

## Revenue tier
~$7.0M/12mo unified, ~$0.5–0.65M/month, stable. iOS 51% / Android 49%. ARPD $66.96, ARPMAU ≈ $11.7. [market-downloads-revenue, market-active-users]

## Gem sinks & pricing psychology (from yt-04 spending guide)
- **Anchor rule:** community treats 1 gem ≈ 10,000 gold (market conversion), reframing every gem price as a "bargain." [genuine source: yt-04]
- **Shop expansion** = flagship sink: stacks player-level + gold-cost + multi-day real-time timer, all collapsed by gems. Confirmed tiers: 2,000 gems ≈ 100M gold / lvl50 / 1d23h; 3,000 gems ≈ 250M gold / lvl60 / 2d23h; 4,000 gems ≈ 500M gold / lvl75 / 4d23h. [genuine source: yt-04]
- **Crafting slots** = second sink (1,000 → 2,500 gems per additional slot). [genuine source: yt-04]
- **"Magic Unlock" wood chest** = flat 50-gem high-frequency sink (guarantees a rare); shown to beat the 150-gem "Superior" chest on EV — trains cheap-tier repeat spend. [genuine source: yt-04]
- **Countdown "Daily Offer"** (e.g. 90 gems, 3h15m timer) + Royal Merchant discount tease surface unprompted during ordinary market browsing. [genuine source: yt-04]
- $100 real money ≈ 18,000 gems. Starter bundles endorsed as "totally worth buying." [genuine source: yt-04]

## Notes / gaps
- Ranked top-selling SKU order = the list above (Sensor Tower `top_in_app_purchases` returns by rank). Exact per-SKU revenue share = [UNKNOWN].
- Offers/bundle cadence = infer from version_history in Phase 2 (see update-cadence.md if pulled). [market-iap]
