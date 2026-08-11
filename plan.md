# Sword Forge — Project Plan

A 2D grid-based blacksmith crafting game. Single-file build (`index.html`), auto-deployed to GitHub Pages on every push to `main`.

> Design SSOT is `specs/game-design.md`. The original GDD in `archive/` is historical only.

---

## ✅ Done

### Session 2026-08-11 — presentation pass: visual gauntlet vs Potion Craft (`swordforgeV2.html`)

Full write-up in `SESSION-2026-08-11-presentation-pass.md`. Commits `f14c6b6`, `d331b2e`, `4bf6272` (branch `sword-forge/core-loop-mapping`, not pushed).

- [x] **Route rendering rebuilt as authored ink** — dashed Catmull-Rom curve with a mid arrowhead and an X terminus for the plan, solid inked stroke for the travelled trail, both clipped to the map. Replaces the recycled grid tiles.
- [x] **Molten ingot marker** — temperature-tinted (ember glow hot, dark iron cold) so the hot-fast / cold-precise trade reads on the map. The V1 blue token is gone.
- [x] **Map is an illustration** — hand-inked parchment terrain (`map_parchment_v2.png`) over a seamless tile base, feather-masked; no hard edge or black void reachable at any pan.
- [x] **Trait sites are ink nodes** that light when the ingot stands on them; snapped to the cell lattice.
- [x] **Crush is a real choice** — crush 0/1/2 on steel reach Balanced → Grace → Noble instead of overshooting onto a dead cell.
- [x] **Feedback is inline**, not blocking modal alerts.
- [x] **Chrome in the parchment language** — `:root` token palette (flat-UI literals to zero), forge-scale temperature gauge, inked station medallions, ore picker with real route thumbnails, fixed status ribbon, inked manicule replacing all emoji guidance hands, 15 modals on one scorched sheet, "Record Composition" → "Note the Alloy".
- [x] **Art** — stamp mill, parchment map + seamless tile, 6 station icons (~$0.28 total).

**Next up:** see the Owed section of the session write-up — letterbox rebuild (~75% of a desktop window is dead grey), the counter/sell and mining screens still need the chrome pass, the emoji sweep, and `INDEX.md` cataloguing at merge.

### Session 2026-08-10 — presentation pass: station loop (`swordforgeV2.html`)
- [x] **Front half rebuilt as forge stations** (Potion Craft verb mapping, `specs/2026-08-10-core-loop-potioncraft-mapping.md` → as-built in `specs/game-design.md` §3A). Station row replaces the drag-dock: **Ore** (plots a route from the ingot's cell — one shape per metal, `orePathDefs`), **Crusher** (repeats the shape's last two steps, capped at 2× length), **Smelter** (commits, spends 1 metal; then morphs into **Bellows**), **Pour** (temp ≥ 40 → the ingot exists), **Anvil** (travel: 3/2/1 cells per strike by temperature), **Quench** (3 cells toward centre, −30°), **Fire** (the existing heating mini-game locks the trait in), **Forge the Blade** (unchanged pipeline).
- [x] **Temperature meter** — bellows +12/tap, decay 2/sec, ×2/×3 threshold ticks on the 🔥 gauge.
- [x] **Route rendering** — planned/committed-ahead cells drawn with `tile_movepath.png` above the fog, travelled trail with `tile_path.png`.
- [x] **Traits pinned to route ends** — 5 reachable with one ore, Flame/Ice/Water with a two-ore stack (the stacking loop).
- [x] **Boots straight into play** — both tutorials skipped by default (code untouched; cheat-panel Skip still works).

### Sessions 2026-07-21 → 07-24 — story customers, economy depth, minigame reworks, counter tools
- [x] **Day metal restock** — each day rollover adds **+7 to every unlocked metal** (`DAY_METAL_BONUS`; locked diagonals skipped).
- [x] **Forge Close / pause-resume** — every forge-stage modal's button is **Close** (not Cancel); it pauses the pipeline (`closeForge` snapshots the stage — shape pick / hammer stage+point+misses / design draft / sharpen %) instead of discarding it. Clicking **Forge** again resumes at that stage (`resumeForge`); the forge only clears on completion.
- [x] **New customer portraits + no-repeat pool** — `man3/4`, `woman2/3` added; every non-scripted customer draws a random human portrait, never repeating back-to-back (`customerPool`/`randomCustomerImg`).
- [x] **Scripted story customers** — **Bram** (Day 1 opener; returns Day 2 as `BramD2` with a 3-beat **Continue ▶** dialogue, wants a **Durable** sword — trait inferred, never named); **June** (Day 1 final customer #7, wants **Sharp**); **Roland** (Day 2 #3, wants **Noble**, with an extra *"I don't make swords for cosplay"* response → retort). Multi-beat dialogue engine (`presentCustomerDialogueSequence`/`customerLineQueue`); customers tagged via `currentCustomerId`.
- [x] **Quests** — a 📋 collapsible panel (top-left of the counter) with 5 one-off quests (**+20g** each): craft 5 Epic swords, survive a day with no refusals, discover 3 traits, update 3 compositions, open the shop. (`quests`/`bumpQuest`/`renderQuests`.)
- [x] **Diary** — a 📖 collapsible panel (below Quests, mutually exclusive) — a paged book of the story customers (Bram/June/Roland) with portrait + storyline note + a running list of swords crafted for them. **Each page is locked (🔒, identity hidden) until you sell to that customer.** (`diaryCustomers`/`diaryGiven`/`renderDiary`.)
- [x] **Craftsmanship gold bonus** — **+1 per successful hammer hit** + a sharpen-accuracy bonus (**+3** at 95–105%, **+2** at 90–95%/105–110%). Baked onto the sword (`craftBonus`) and shown as a green **+x** on the forge board / Vault detail; added flat to the sale total.
- [x] **Hazard rework** — landing on a 💥 now costs **−25 HP** (was −20) **and −4 gold**, shows a **dialogue box** (`gameAlert`) warning, and the per-blade gold lost (`hazardGoldLost`) is stamped on the sword (`hazardLoss`) and shown as a red **−x**. Sale total = `value + craftBonus − hazardLoss` (min 1), shown as one number in the sale line.
- [x] **5-metal top-up after the first sale** (`topUpMetalsAfterFirstSale`).
- [x] **Hammer minigame harder** — targets **⅓ the size**, ring lasts **~0.65s** (`HAMMER_RING_MS`), a green **"Perfect!"** arcs off each hit (`spawnPerfectText`).
- [x] **Sharpen minigame** — replaced the ◀ ▶ buttons with a **joystick** (`#sharpen-knob`, analog, springs back); blade sweeps **near-full width** (`SHARP_TRAVEL`); the **95–105% "perfect" band is marked in gold** on the meter at 50% opacity (`.sharpen-goldzone`).
- [x] **Day-full counter clears** — once the day's 7 customers are done the counter shows **no portrait and no dialogue box** (was a persistent "rest up" bubble); re-shown for the next day (`onDayFull`).
- [x] **Passive shop polish (screen 0)** — a green **sale popup** shows the gold gained (`showShopSalePopup`); each shop card shows the **composited sword image laid flat** (−135°); a **📒 Ledger** logs passive sales by day with scrollable day tabs, keeping the **5 most recent days** (`shopLedger`/`recordLedgerSale`/`renderLedger`).
- [x] **Blade-unlock popup** — buying a locked blade shape pops a *"&lt;shape&gt; unlocked"* box (`showNewShapeModal`).
- [x] **Collapsible cheat box** — +100 Metals / +100 Gold / Skip Stage (and **Skip Tutorial** during the tutorial) now live behind a small **🛠 toggle** floating just **above** the game frame's top-right (`#cheatBox` in `#frame-shell`), collapsed by default; works on desktop **and mobile** (was a fixed corner stack that landed in the mobile letterbox / overlapped the health bar).
- [x] **Bram story page** — `story/bram-one-more-sunrise.html` (standalone narrative deck).

### Session 2026-07-17 — smelter tuning, map-preview polish, compositions, day system
- [x] **Metal generation reworked** — base rate **1 metal / 10s** post-tutorial (`METAL_TICK_MS`); **lowest-first priority** (feeds the lowest-count metal until all pooled metals are ≥5, then uniform random; `METAL_FLOOR`); **only unlocked metals are generated** (locked diagonals no longer accumulate). Smelter readout shows the true cadence.
- [x] **Hover directional hint** — hovering a movement button lights up the cells it would move the sword into with `assets/map/tile_movepath.png` (1 tile before the Purify dash unlocks, 3 after; all 8 buttons incl. locked diagonals; desktop mouse-only). `.move-hover-path` + `showHoverPreview`/`clearHoverPreview`.
- [x] **Translucent move previews** — the held-move (`tile_move`) and hover (`tile_movepath`) previews now render as ~50%-opacity `::after` overlays over the cell's real tile (hazard/home/path/trait glyph show through) instead of replacing the background.
- [x] **Recorded Compositions "Keep Both"** — the *Update Composition* box (existing trait set) now offers **Keep Both** (save the new mix as a separate entry) alongside **Update**; prompt reworded to "Replace the old record or keep both?"; Keep Both hidden when the recipes are identical. (`keepBothRecord`.)
- [x] **Post-tutorial record reminder** — the first heating minigame completed after the tutorial pops a one-off box ("Remember to record the composition of each new trait you discover, and keep updating the old ones as you improve.") + a hand pointer to Record Composition (once per session, `hasShownRecordReminder`; deferred behind the "New Trait" box). **Customer #4 never requests Flame.**
- [x] **Day system** — **7 customers/day** (sales *and* refusals count); after 7, no more arrive until the player taps **🌙 End Day** (button next to the Available Metals header on the Forge screen). Day 1 End Day unlocks only at 7 (+ a "Good work! Let's end the day here and go to bed!" box and a hand pointer); day 2+ unlocks at 3 with an "…end the day so soon?" confirm (a plain "End the day and go to bed?" once all 7 are served). Confirming runs a **black fade-out → "Day N" → fade-in** transition (`runDayTransition`) that advances the day, resets the count, and summons the new day's first customer. A **Day N** badge sits left of the gold/rep pill on both screens. (`currentDay`/`customersToday`; `maybeSummonNextCustomer`/`onDayFull`/`requestEndDay`/`confirmEndDay`.)

### Core gameplay
- [x] 50×50 grid, fog of war, seeded layout (seed `1337`); 8-direction movement with 8 metals
- [x] **Purify-dash slider** — hold a direction to charge; release in the red/yellow/green zone = 1/2/3-block dash (1 metal regardless of distance); live green `tile_move.png` path preview; cancel via centre button / slide-off / right-click
- [x] Hazards (~20% of map), health (−20 on **landing**; crossing over a hazard mid-dash is safe), death shatters the active blade
- [x] 24 traits hidden on the map; value scales with distance from centre; one fuse per trait per blade
- [x] **Heating minigame** — pulley → bellows → stabilize; glow + hand cues guide pulley-then-bellows
- [x] **Bellow tap *and* hold** — a tap adds +16; holding raises heat gradually (~+22/sec net)
- [x] **Per-trait heating variants** — every trait has a unique minigame via the `heatConfigs` table (band position/width, decay, stabilize, pump, hold, overheat; plus dynamic bands: oscillate/gust/jitter/multi-band/jump/stages/hidden). Tutorial heats stay on the default band. Fully reversible (delete a config → default).
- [x] **Heat timer → quality** — a per-trait countdown (`heatTimers`; ⏱ readout in the heat modal, safe 45s in the tutorial). Stabilize in time → `Epic`; timer runs out → the trait still fuses at `Fine`. Quality tiers **Weak +0 / Fine +10 / Epic +20** value bonus.
- [x] **Blade HP → quality** — at forge, low HP caps quality (≥80 Epic, 40–79 Fine, <40 Weak; `min(heat outcome, HP cap)`).
- [x] **Quality overlays** — forge result layers a **crack** overlay on Weak swords and **sparkling stars** on Epic (`assets/sword-parts/overlays/`).
- [x] **"New Trait Discovered!" box** on the first heat of each trait (icon + name), including during the tutorial
- [x] **Multi-step forge pipeline** — **shape select** (10 shapes, 3 free + 7 unlockable at 50g) → **hammering mini-game** (shrinking-ring targets over ingot→mid→final art in `assets/hammer/`; 6 targets/2 stages; misses cost quality) → **quench** (feel-only cooling beat: tap to dip the blade in water, 3s soak, steam/glow; `assets/forge/water_bucket.png` on `assets/backgrounds/forge_bg.png`; **skipped when the last-acquired trait is `flame`**) → **Design Desk** (fittings only; blade fixed from step 1, Blade tab removed) → **sharpen**. Manual forge + Auto-Craft both run it (Auto-Craft prepends a detached heat mini-game).
- [x] **Sharpening mini-game** — after the Design Desk, the fully-assembled sword (blade + fittings) lies horizontal on a front-facing **grindstone** (`assets/forge/grindstone.png` + jittered `grindstone_spin.png` on `assets/backgrounds/sharpen_bg.png`); the wheel starts spinning after 2s and runs until Finish. Slide the sword left↔right — drag, ◀ ▶ buttons (tap/hold), or ←/→ keys — to fill a **0→~120% sharpness bar** with contact sparks. Finish in the **90–110% "keen" window** = no penalty (player's discretion); grinding **>110% over-hones** → **−1 quality tier per 10% over**. The Design Desk button is now **Sharpen**; Finish opens the existing "Forging Complete!" board (Add to Vault). Runs for both manual forge and Auto-Craft. (`openSharpenModal`/`sharpenGrind`/`finishSharpen`; `#sharpenModal`.)
- [x] **Hammer → quality** — −1 quality tier per 2 misses, applied after heat + HP cap (`heat → HP cap → hammer penalty → sharpen over-hone`); Design Desk preview shows the projected pre-sharpen quality
- [x] **Design Desk** — grip/guard/pommel art; trait-specific part art (Flame/Ice/Water skins) via `traitSkins`; info-hint button
- [x] **Forge** — 10 shapes; forge-result reveal; resets player to centre

### Economy & progression
- [x] Smelter (passive metal gen, 50g upgrades); NPC customers (trait/shape requests, reputation multipliers)
- [x] Scripted customers #1 (any) → #2 (Flame) → #3 (ice-dragon, "weak to heat" = Flame); random from #4
- [x] **Refuse disabled for the first three (scripted) customers**
- [x] **Search Inventory** shortcut (finds + highlights the matching sword). *(The old one-tap "Craft & Sell" button was removed — craft from a recorded composition's Auto-Craft instead.)*
- [x] Passive shopfront (500g unlock; "Shop Available!" tip at 500g → hand-guides the player to the Shop screen then the Unlock Shop button; after unlocking, a "stock the shop" guide walks them through Auto-Crafting a flame sword, sending it To Shop, then explains the shop with two boxes); map reset (retains gold/metals/rep/vault/compositions/upgrades)

### Recorded Compositions (formerly "Saved Recipes" / "Blueprints")
- [x] **Record Composition** button (was "Record Mixture"); **Record Last Composition** records the last forged sword after forging (no active blade needed)
- [x] **Record confirmation box** (`#recordModal`) — recording opens a box first: a **new** trait set shows the trait + metals with a **Record** button; an **already-recorded** trait set shows a **before/after metal comparison** and an **Update** button (replaces the entry, so re-recording the same trait updates it rather than duplicating; notes "identical" when unchanged)
- [x] **Recorded Compositions modal** — a button opens a modal (own box, internal scroll) with a trait-icon tile grid; tap a tile → drill-in detail (Tier/Traits/Value/**Composition**) + **⚡ Craft** + **Delete** (delete hidden during the tutorial) + ← Back

### Tutorial (data-driven `tutorialFlow`)
- [x] Full guided flow, incl. a 3rd (ice-dragon) customer teaching Auto-Craft from a recorded composition
- [x] Guided hand pointers (👆/👇/👈/👉), auto-clearing on the action
- [x] **First-craft metal lock** — start with 4 steel + 1 magnesium; other metals, Record Composition, Chart, auto-gen locked until first forge
- [x] **Forge greyed out** from the Flame heat until the composition is recorded (guided step)
- [x] **Flame-reveal top banner** ("add some iron to go down to it") until the player reaches it
- [x] **Illustrated slider lesson** — two art frames (`dialogue-frame9/10.png`): tap-vs-hold, then avoid-impure-tiles
- [x] **Skip Tutorial button** (window bottom-right) — ends the flow and unlocks everything

### UI
- [x] **Minimap (Chart)** — live canvas, full reveal, trait emoji icons, **player shown with the grid sword icon** (`tile_sword.png`) + blue glow, zoom + pan, tap-a-trait name label (readable, scaled to display); tutorial pointer alternating "Your location" / "Flame trait"
- [x] **Grid viewport** — drag-to-pan (fixed edge-lock bug), **mouse-wheel zoom centred on the cursor**, **📷 free-camera toggle** (stop following the sword)
- [x] **Grid tiles** — `tile_centre` (spawn) + `tile_centre2` (8 around spawn) home tiles; `tile_path` trail of cells the active sword lands on (dashes mark only the endpoint; never overwrites hazard/trait/home; resets with the active blade on forge/death)
- [x] **Metal-toss juice** — spending a metal flings `Metal.png` from the pressed button into the bucket in an arc, wobbling the bucket on landing (`tossMetalToBucket`; on actual spend only)
- [x] **UI polish** — heat ⏱ timer moved to right below the heat slider; chart tutorial pointer is now a text label + pulsing glow (hand removed, amber glow on the Flame target); all metal-button counts white; all cancel/refuse/close buttons grey (was red/blue)
- [x] **Blade Traits status bar** — the forge status row shows the heated traits (removed the "100/100" health text; bar still shows HP)
- [x] **Styled `gameAlert` popups** — all warnings/errors use a parchment popup (no native `alert()`)
- [x] **Counter (screen 1)** — gold/rep pill; rotating customer portraits sliding in from the left; speech bubble; **Inventory** + **Recorded Compositions** open as their own scrollable modals (tile grid → drill-in detail), replacing the old inline expand-and-page-scroll panels; Inventory tiles show the composited sword image
- [x] **Word-by-word customer dialogue + response options** — the customer's request types out one word at a time (tap the bubble to skip); once the line finishes, the player's two responses fade in: **"I have something for you."** (Search Inventory) and **"I don't have what you need."** (Refuse, still disabled for the first three scripted customers). Tutorial boxes tied to a customer are gated to appear only after that customer's line fully types + a ~2s read pause, so they never overlap the speech
- [x] **Post-sale customer feedback + response gate** — on a sale the customer reacts with a short line before the gold (e.g. "Oh! Hot! Here's your 25 gold."), chosen by the trait the customer asked for → sword's first trait → random generic (per-trait line for all 24 traits plus 5 generic lines). The customer then **stays at the counter until the player taps a response button** ("Thank you" / "Glad you liked it" / "Take care"), which brings the next customer. Refuse still auto-advances
- [x] Heat/Forge glow cues; grammar pass; 3-screen swipe layout; GitHub Pages auto-deploy CI
- [x] **+100 Metals**, **+100 Gold**, and **Skip Stage** (skips the open forge minigame → next stage) cheat buttons (window bottom-right, whole session); **Skip Intro** button (bottom-right, during the intro → `launchCoreGame`)
- [x] **Tutorial dialogue review** — ℹ️ button (below the health bar, left of the gold/rep pill) re-opens past tutorial boxes in their own dialogue frames with ◀ Prev / Next ▶ / Close; stays available after the tutorial
- [x] **Screen 2 gold/rep pill** — the Forge screen mirrors screen 1's `💰 Gold | ⭐ Rep` pill above the Blade Traits line
- [x] **Shape select polish** — available-gold shown on top of the "Choose a Blade" window; blade **names shown below each shape tile**
- [x] **Record confirmation box** — recording opens a box (trait + metals for a new one; before/after metal comparison + Update for an existing trait set)

---

## 🔜 Next up

- [ ] **Save / load** game state across sessions (localStorage) — nothing persists on reload today (biggest gap). Must now cover a lot: gold/vault/metals/compositions/upgrades/tutorial progress **+ day state** (`currentDay`, `customersToday`, `refusalsToday`) **+ quests + diary (`diaryGiven`) + shop ledger (`shopLedger`) + per-sword `craftBonus`/`hazardLoss`**.
- [~] **Customer variety** — mostly done: named story customers **Bram / June / Roland** with branching dialogue + locked **Diary** pages, plus a 7-portrait no-repeat pool. Still open: **later-day story progression for June & Roland** (only their first appearance exists; Bram already returns on Day 2), and more archetypes/dialogue.
- [ ] **Audio** — anvil hits, trait-discovery ding, shop-sale chime
- [ ] **Balance pass on per-trait heating** — `heatConfigs` band difficulty is first-pass (Dark hidden, Cursed jumps, Lightning two-strike likeliest to need softening); `heatTimers` were recently halved — play-test the timer + quality feel
- [ ] **Hammer mini-game art polish** — only Shortsword/Longsword/Broadsword have mid-forge art; the other 7 shapes reuse the Longsword mid as a placeholder. Add per-shape mid art (and optionally top-down final art) when ready. Target positions in `HAMMER_POINTS` are approximate — tune to the real art.
- [ ] Clean up **committed-but-unreferenced** files (all safe to delete): `assets/unused/` folder, `assets/ui/Chart_background.png` (grep count 0), and `assets/sword-parts/pommels/sparkle.png` (stray duplicate — the real overlay is `overlays/sparkle.png`)

## ⚠️ Known / decisions to make
- [ ] **Cheats still ship to players** — now tucked into a collapsed **🛠 box** (top-right) plus **Skip Intro** (during the intro); still fully usable on the live site. Gate behind a key combo / `?cheats` flag, or remove, before a "real" release.
- [x] ~~Heat **quality** is hardcoded **Epic-only**~~ — **done:** Weak/Fine/Epic driven by the heat timer + blade-HP cap, with crack/sparkle overlays
- [ ] Map seed fixed (`1337`) — should reset randomize the layout?
- [ ] Original GDD's **Dagger** shape is absent (10 shapes vs 11)

## 🔬 Active exploration — chalk-map redesign (prototype only)
A redesign of the exploration half is being prototyped **outside** the shipped game. Instead of the
metal-fuelled grid, the smith **draws chalk lines on a chart** to discover traits; a **day/night reset**
(one chalk = daily distance budget, ended by an **End Day** button) paces it; **ores are gathered from
caves** and smelted (heating minigame) into ingots; **green dots = XP** (5% → a sword-part design); the
**3 purple dots around each trait** must be gathered to unlock it; **dark zones = hazard** (HP-depletion →
rest 10s in place, no reset). Planned: a **main chart of 24 traits** + **24 per-trait shape charts**, and an
**XP skill tree** (TBD).
- Prototype: [`research/map_test.html`](research/map_test.html) (canvas + pointer-draw, offscreen fog,
  pixel-mask hazards, colour-cluster marker detection), art `research/map_test.png` + `research/chalk.png`.
  ⚠️ **Must be run over http** (local server or the live URL) — it reads the map's pixels via `getImageData`, which a `file://` open blocks (tainted canvas). Opening the file directly now degrades to a draw-only mode + a "run via a server" toast instead of a blank screen (`try/catch` in `init()`), but traits/hazards need http.
- Full design notes + open questions: [`research/chalk-map-design.md`](research/chalk-map-design.md).
- **Not ported to `index.html`.** Next: decide the ore→ingot material system + skill-tree nodes, then plan the port.

## Open questions
- Target platform — web-only, or a mobile wrapper later?
