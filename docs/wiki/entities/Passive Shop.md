---
type: entity
updated: 2026-08-08
layer: derived
status: current
verified_commit: 0f30699
specs: ["specs/game-design.md"]
anchors:
  - {kind: file, path: index.html, probe: "function unlockShop"}
  - {kind: file, path: index.html, probe: "function startShopLoop"}
  - {kind: file, path: index.html, probe: "let shopLedger"}
  - {kind: file, path: index.html, probe: "function recordLedgerSale"}
  - {kind: file, path: index.html, probe: "function renderLedger"}
  - {kind: file, path: index.html, probe: "const LEDGER_MAX_DAYS"}
  - {kind: file, path: index.html, probe: "function showShopSalePopup"}
related: ["[[Customer Economy]]", "[[Day System]]"]
tags: [gameplay, economy]
---

SUBORDINATE TO `specs/game-design.md` - that spec wins on any conflict with this page.

## What it is

A second, passive income channel unlocked for 500 Gold (`unlockShop`). Once unlocked, any
sword moved from the Vault into the Shop gets an independent 5% chance every 10 seconds to
sell for its full net value (`startShopLoop`) - the same value/craft-bonus/hazard-loss
formula used by active sales (see [[Customer Economy]]), but a passive sale does not
affect Reputation. Sales are recorded per-day into `shopLedger` (capped at
`LEDGER_MAX_DAYS`, 5 most recent days), browsable via the Ledger modal (`renderLedger`);
a passive sale also pops a small on-screen notice (`showShopSalePopup`). Exact unlock cost,
sell odds/tick, and ledger retention are canon in `specs/game-design.md` §6 "Passive
shopfront".

## Where the code lives

- Unlock gate: `unlockShop` - `index.html`.
- Sell-tick loop: `startShopLoop`.
- Ledger state + rendering: `shopLedger`, `recordLedgerSale`, `renderLedger`,
  `LEDGER_MAX_DAYS`.
- Sale notification: `showShopSalePopup`.

## Not covered here

The one-time "stock the shop" guided tutorial that fires right after unlock
(`shopSellPhase` state machine) is UI/onboarding glue, not the shop mechanic itself - see
[[Tutorial Flow]].
