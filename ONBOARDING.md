# Sword Forge — Onboarding / Handoff

You're picking up **Sword Forge**, a 2D grid-based blacksmith crafting game. This gives you everything you need to be productive with zero prior context.

## 1. What it is
- A browser game: explore a fog-of-war grid to find magical traits, heat them onto your blade, forge custom swords, and sell them to customers.
- **The entire game is ONE file: `index.html`** — all HTML, CSS, and JavaScript. No build step, bundler, framework, or dependencies. Vanilla JS, global mutable state, direct DOM manipulation.
- **No persistence yet** — nothing is saved; every reload restarts from the intro/tutorial.
- Live build: https://lila-games-github.github.io/sword-forge/

## 2. Run & verify
- **Run:** open `index.html` in a browser — no server needed.
- **Verify changes:** use the Claude Preview tools. `.claude/launch.json` defines a Node static server (`.claude/serve.js`, port 5678) started via `preview_start` (config name `sword-forge`). Drive the game with `preview_eval` (call functions directly, read the DOM / `getBoundingClientRect` / computed styles / canvas pixels) and check `preview_console_logs` for errors.
- ⚠️ **The screenshot tool times out on this game** — a continuous ember/`requestAnimationFrame` loop keeps the page from ever going idle. Do not depend on screenshots; verify functionally via `preview_eval` and measurements.
- ⚠️ In the headless preview the viewport may report width 0 — `preview_resize` to mobile (375×812) before measuring horizontal layout.
- ⚠️ **The game boots into a 4-scene intro, and `#mobile-wrapper` starts `display:none`.** To reach gameplay in a headless eval, run `launchCoreGame()` (hides the intro, shows the wrapper, calls `initializeMainGame`). To render the grid, call **both** (they're independent functions, not nested): `generateLayout()` populates `boardData` with traits + hazards, and `initDOMGrid()` builds the cell DOM — run `generateLayout()` first so the cells have data. To show a specific swipe screen, apply the transform `screens-container.style.transform = 'translateX(-66.667%)'` (screen-2 = Forge).
- ⚠️ `Date.now()`/`Math.random()` are fine in the game (unlike workflow scripts). `confirmDesign()` and the design-modal callback run on a **50ms `setTimeout`**, so split evals across two calls when testing forge/quick-craft results.

## 3. Deploy
- Push to `main` → GitHub Pages auto-deploys via `.github/workflows/deploy.yml` (~1–2 min). Then hard-refresh (Ctrl+Shift+R) — Pages and the browser cache the old build.
- ⚠️ **Push auth quirk:** the remote is HTTPS with Git Credential Manager. `git push` sometimes hangs on a GUI credential prompt that headless shells can't answer; it usually succeeds on a retry. Reads (`git fetch`/`ls-remote`) work fine.

## 4. Critical working rules
- **ASK BEFORE EXECUTING.** The owner's standing rule: confirm before any state-changing action (editing files, running commands, committing, pushing, deploying). Brainstorming / planning / read-only investigation is exempt. Commits — and especially pushes, which auto-deploy to the live site — need an explicit go-ahead.
- **Keep it single-file.** Don't split `index.html` or add tooling unless asked.
- **Match the existing style** — terse, semicolon-dense vanilla JS, many statements per line, globals. Don't refactor to a framework.
- **Update `specs/game-design.md` in the SAME change** as any mechanic/number/system change. It's the SSOT.
- **Proofread all player-facing copy** for grammar/spelling (standing owner preference).
- **Verify before pushing** — reload the preview, exercise the affected code with `preview_eval`, and confirm `preview_console_logs` is clean.

## 5. Where things live
- `index.html` — the game. Always edit this.
- `specs/game-design.md` — single source of truth for mechanics. **Read this first** to understand the systems.
- `specs/README.md` — SSOT policy.
- `README.md` — short public-facing overview.
- `CLAUDE.md` — working conventions (overlaps with this doc).
- `plan.md` — done / next-up / known-issues tracker.
- `archive/Sword_Grid_Game_GDD.md` — original design vision; **historical only**, superseded by `specs/`.
- `assets/` — `backgrounds/`, `ui/` (buttons + `dialogue-frame*.png` tutorial art), `forge/` (pulley/bucket/bellow), `sword-parts/` (`balanced_*` base + `flame_*` skins), `map/` (tiles incl. `tile_sword.png`), `customer/` (portraits), `unused/`.

## 6. Architecture (all in `index.html`)
Global mutable state near the top of the `<script>`; functions below. Key systems and their entry points:

- **Grid & movement:** 50×50 fog-of-war grid (`domCells`, `boardData`, `exploredCells`, `discoveredTraits`), seeded RNG (seed `1337`, `generateLayout`), DOM built by `initDOMGrid`, cells by `renderCell`. Player starts at centre (25,25). `move(dx,dy,consumeMetal)` is the single movement chokepoint (dashes loop it). Each cardinal = a metal (steel=up, iron=down, magnesium=left, bronze=right); 4 diagonals unlock for 50g. **Purify-dash slider** (`handleMovementClick`→`startInlinePurify`/`updatePurifyLoop`/`resolvePurifyMinigame`): hold a direction → release zone gives a 1/2/3-block dash for 1 metal; live `tile_move` path preview; cancel via centre button / slide-off / right-click. `purifyEnabled` gates it (off during the early tutorial).
- **Grid camera:** `centerCameraOnPlayer()` follows the player on each move — **unless** `cameraUnlocked` (the 📷 free-camera toggle, `toggleCameraLock`). Drag-to-pan and cursor-centred wheel zoom live on the `#viewport` (see the `wheel`/`mousedown` handlers). The viewport is wrapped in `.viewport-wrap` so the camera button stays fixed while the grid scrolls.
- **Traits & heating:** 24 traits at fixed coords (`traitCoordinates`). **Heat** button → `initiateHeatSequence` → `handlePulleyClick` → bellows (`handleBellowClick`, **tap +16 or hold** via `bellowHeld` + `BELLOW_HOLD_RATE`) → stabilize → `resolveInteractiveHeatMinigame` fuses the trait (quality hardcoded **Epic**). **Per-trait minigame variants** live in `heatConfigs` (applied over `DEFAULT_HEAT` in `initiateHeatSequence`; tutorial forces default). The loop `updateInteractiveHeatLoop` + helpers `updateHeatBands`/`heatGradient`/`clampBand`/`initHeatDynamics` handle moving/random/staged/hidden bands. First heat of a trait shows a **"New Trait Discovered!"** box (`knownTraitIds`, `showNewTraitModal`).
- **Forging:** **Design Desk** (`openDesignModal`, `partsLibrary`, `partsFor`/`designPartSrc`, `traitSkins`) → `confirmDesign` → `forgeSword` (or `quickCraft` from a composition) → `showForgeResult` → Vault. 10 shapes; 7 balanced blades unlock for 50g (`bladeUnlocked`). `forgeSword` records `lastForgedMixture` (for "Record Last Composition") and lifts the first-craft lock.
- **Recorded Compositions** (formerly "Saved Recipes"): `saveRecipe` (**Record Composition** / **Record Last Composition**) with a duplicate-composition guard; `renderBlueprints` draws the **5-per-row tile grid**; the functions `selectBlueprint`/`deleteBlueprint` toggle the open tile (via the `selectedBlueprintIndex` variable); `quickCraft` = Auto-Craft. `savedBlueprints` array; `findValidBlueprintIndex`.
- **Economy:** smelter (`startMetalGenerator`, gated by `tutorialMetalLock`), customers (`setRandomRequest` — scripted #1 any / #2 Flame / #3 ice-dragon, random #4+), `sellSword` (Give NPC), `searchInventory`, passive shop (`startShopLoop`), map reset. **Refuse disabled for `requestCount ≤ 3`.** Reputation multipliers on payout.
- **Tutorial:** data-driven `tutorialFlow` array (`playTutorialStep`). Steps are dialogues (`text`/`title`/`frame`), `action`s, or `waitAction` gates; gates carry a `hand` spec (`showHands`). Gameplay functions advance it by checking `tutorialFlow[tutorialStep].waitAction`. First-craft is locked to 4 steel + 1 magnesium (`tutorialMetalLock`) until the first forge. **Skip Tutorial** (`skipTutorial`) ends the flow and unlocks everything.
- **Screens & UI:** 3 swipeable screens (`slideScreen`): Shop (0), Customers (1), Forge/Map (2). Counter rotates customer portraits sliding in from the left. Forge status row shows **"Blade Traits:"** (the heated traits; the HP bar has no numeric text). **Minimap** (`renderMinimap`) is a live canvas with zoom/pan, trait emoji icons, the player drawn as `tile_sword.png` + glow, tap-a-trait name label, and a tutorial "Your location / Flame trait" pointer. All warnings use `gameAlert` (styled parchment popup), not native `alert()`.
- **Dev/cheat buttons** (fixed, window bottom-right, `.corner-btn`): **Skip Intro** (`launchCoreGame`, during the intro only), **Skip Tutorial** (`skipTutorial`, tutorial-only), **+100 Metals** (`addCheatMetals`, whole session) and **+100 Gold** (`addCheatGold`, whole session). ⚠️ Skip Intro and both cheats currently ship to players.

## 7. Current state & recent work
Core loop is complete with a full guided tutorial and a lot of polish. Recent work: per-trait heating minigames (Tier A static tweaks + Tier B dynamic bands + Tier C stages/hidden), bellow tap-and-hold, grid camera fixes (pan-lock, cursor-centred zoom, free-camera toggle), Recorded Compositions redesign (tiles + delete + duplicate guard + record-after-forge), styled `gameAlert` popups, "New Trait Discovered!" box, "Blade Traits" status bar, minimap sword-icon marker + readable labels, illustrated slider lesson, ice-dragon 3rd customer, and the Skip Tutorial + +100 Metals buttons.

## 8. Next up / known gaps (see `plan.md`)
- No **save/load** — nothing persists across reload (biggest functional gap).
- Only 3 customer portraits; no audio.
- Per-trait heat numbers are **first-pass** — needs a balance pass (Dark/Cursed/Lightning likeliest to be too hard).
- The **+100 Metals / +100 Gold cheats and the Skip Intro button are player-visible** — gate or remove before a real release.
- Spec open questions (`specs/game-design.md §9`): heat **quality** is Epic-only; map seed is fixed; the GDD's **Dagger** shape is absent.
- `assets/unused/` stragglers; `Chart_background.png` is committed but unreferenced.

## First task suggestion
Read `specs/game-design.md` end-to-end, open `index.html` in the preview (`preview_start` → `launchCoreGame()` → play a bit), and use the **Skip Intro** / **Skip Tutorial** + **+100 Metals** / **+100 Gold** buttons to jump straight into the sandbox and exercise the systems before changing anything.
