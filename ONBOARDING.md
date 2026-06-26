# Sword Forge — Onboarding / Handoff

You're picking up **Sword Forge**, a 2D grid-based blacksmith crafting game. This gives you everything you need to be productive with zero prior context.

## 1. What it is
- A browser game: explore a fog-of-war grid to find magical traits, heat them onto your blade, forge custom swords, and sell them to customers.
- **The entire game is ONE file: `index.html`** — all HTML, CSS, and JavaScript. No build step, bundler, framework, or dependencies. Vanilla JS, global mutable state, direct DOM manipulation.
- Live build: https://lila-games-github.github.io/sword-forge/

## 2. Run & verify
- **Run:** open `index.html` in a browser — no server needed.
- **Verify changes:** use the Claude Preview tools. `.claude/launch.json` defines a Node static server (`.claude/serve.js`, port 5678) started via `preview_start`. Drive the game with `preview_eval` (call functions directly, read the DOM / `getBoundingClientRect` / computed styles / canvas pixels) and check `preview_console_logs` for errors.
- ⚠️ **The screenshot tool times out on this game** — a continuous ember/`requestAnimationFrame` loop keeps the page from ever going idle. Do not depend on screenshots; verify functionally via `preview_eval` and measurements.
- ⚠️ In the headless preview the viewport may report width 0 — `preview_resize` to mobile (375×812) before measuring horizontal layout.

## 3. Deploy
- Push to `main` → GitHub Pages auto-deploys via `.github/workflows/deploy.yml` (~1–2 min). Then hard-refresh (Ctrl+Shift+R) — Pages and the browser cache the old build.
- ⚠️ **Push auth quirk:** the remote is HTTPS with Git Credential Manager. `git push` sometimes hangs on a GUI credential prompt that headless shells can't answer; it usually succeeds on a retry (or once the owner completes the popup). Reads (`git fetch`/`ls-remote`) work fine.

## 4. Critical working rules
- **ASK BEFORE EXECUTING.** The owner's standing rule: confirm before any state-changing action (editing files, running commands, committing, pushing, deploying). Brainstorming / planning / read-only investigation is exempt. Commits — and especially pushes, which auto-deploy to the live site — need an explicit go-ahead.
- **Keep it single-file.** Don't split `index.html` or add tooling unless asked.
- **Match the existing style** — terse, semicolon-dense vanilla JS, many statements per line, globals. Don't refactor to a framework.
- **Update `specs/game-design.md` in the SAME change** as any mechanic/number/system change. It's the SSOT.
- **Proofread all player-facing copy** for grammar/spelling (standing owner preference).

## 5. Where things live
- `index.html` — the game. Always edit this.
- `specs/game-design.md` — single source of truth for mechanics. **Read this first** to understand the systems.
- `specs/README.md` — SSOT policy.
- `CLAUDE.md` — working conventions (overlaps with this doc).
- `plan.md` — done / next-up tracker.
- `archive/Sword_Grid_Game_GDD.md` — original design vision; **historical only**, superseded by `specs/`.
- `assets/` — `backgrounds/`, `ui/`, `forge/`, `sword-parts/` (`balanced_*` base + trait skins like `flame_*`), `map/` (tiles), `customer/` (portraits), `unused/`.

## 6. Architecture (all in `index.html`)
- **Grid & movement:** 50×50 fog-of-war grid (`domCells`, `boardData`, `exploredCells`), seeded RNG (seed `1337`). The 3×3 movement grid's direction buttons each map to a metal (e.g. steel = up, magnesium = left). Hold a direction button → **Purify-dash slider** (`startInlinePurify` / `updatePurifyLoop` / `resolvePurifyMinigame`): release zone → 1/2/3-block dash, costs 1 metal of that direction. A live `tile_move` path preview shows the dash; cancel via the centre button / right-click (`cancelInlinePurify`).
- **Traits & heating:** 24 traits hidden on the grid. Standing on one enables **Heat** → `initiateHeatSequence` → pulley (`handlePulleyClick`) → bellows (`handleBellowClick`) → stabilize → `resolveInteractiveHeatMinigame` fuses the trait. Glow + hand cues guide it.
- **Forging:** **Design Desk** (`openDesignModal`, `partsLibrary`) — blade/grip/guard/pommel. Trait skins via `traitSkins` + `partsFor` / `designPartSrc` (Flame has full art). 7 balanced blade shapes unlock for 50g each (`bladeUnlocked`). `forgeSword` → reveal → Vault.
- **Economy:** smelter (`startMetalGenerator`), customers (`setRandomRequest`, `sellSword`), Search Inventory (`searchInventory`), Craft & Sell (`btnAutoCraftSell`), passive shop (`startShopLoop`), blueprints / "Record Mixture" (`saveRecipe`, `quickCraft`), map reset.
- **Tutorial:** data-driven `tutorialFlow` array (`playTutorialStep`). Steps are dialogues (`text`/`title`/`frame`), `action`s, or `waitAction` gates; gates carry an optional `hand` spec for the on-screen pointer (`showHands`). First-craft is locked to 4 steel + 1 magnesium (`tutorialMetalLock`) until the first forge.
- **Screens:** 3 swipeable screens (`slideScreen`): Shop (0), Customers (1), Forge/Map (2). The counter screen rotates customer portrait images that slide in from the left, with a speech bubble and the action buttons beside it. The minimap (`renderMinimap`) is a live canvas with zoom/pan and tap-for-trait-name.

## 7. Current state & recent work
Core loop is complete with a full guided tutorial. Recent work: tutorial rework (hand pointers, first-craft lock), dash path preview + move-cancel, minimap zoom/pan/icons, heating cues, Flame trait part art + unlockable blades, the counter (screen 1) redesign with rotating customer portraits, Search Inventory, and a grammar pass.

## 8. Next up / known gaps (see `plan.md`)
- No **save/load** — nothing persists across reload.
- Only 3 customer portraits; no audio.
- Spec open questions (`specs/game-design.md §9`): heat quality is hardcoded **Epic-only**; map seed is fixed; the GDD's **Dagger** shape is absent.
- `assets/unused/` has stragglers; an empty top-level `Docs/` folder can be removed.

## First task suggestion
Read `specs/game-design.md` end-to-end, open `index.html` in the preview, and play the tutorial through once to map the code to behavior before changing anything.
