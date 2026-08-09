# CLAUDE.md

Guidance for working in the Sword Forge repo.

## What this is

Sword Forge is a 2D grid-based blacksmith crafting game. It is a **single, self-contained HTML file** — all markup, CSS, and JavaScript live in one file. There is no build step, bundler, or package manager.

## Canonical files

- **`swordforgeV2.html`** — THE game. The canonical build (V2: path-map furnace build + guided tutorial). Always edit this.
- **`index.html`** — V1, kept for historical reference only. Do not develop here. ⚠️ It is still the GitHub Pages entry point (the site root serves V1; V2 is reachable at `/swordforgeV2.html`) — promoting V2 to the root is a pending decision.
- **`specs/`** — Single source of truth (SSOT) for game design. See `specs/game-design.md`. Keep it in sync whenever mechanics change.
- **`research/`** — experiments and design docs, not shipped (chalk-map prototype, potioncraft reference, `sword-forge-gdd.html`).
- **`story/`** — narrative pages (e.g. `bram-one-more-sunrise.html`), referenced by story content.
- **`ONBOARDING.md`** — zero-context handoff for a fresh contributor/agent; read first if new.
- **`archive/Sword_Grid_Game_GDD.md`** — The *original* design vision. Historical only; the build has drifted from it. Do not treat it as current — `specs/` supersedes it.

## How to run / deploy

- Run locally: open `swordforgeV2.html` in a browser (no server required), or use the `/run` skill. (`index.html` = V1, historical.)
- Deploy: pushing to `main` auto-deploys to GitHub Pages via `.github/workflows/deploy.yml`. Commit/push only when asked.

## Working conventions

- **Keep it single-file.** Do not split `swordforgeV2.html` into separate JS/CSS files or add a toolchain unless explicitly asked.
- **Match the existing style.** The code uses terse, semicolon-dense vanilla JS with many statements per line, global mutable state, and direct DOM manipulation. Follow the surrounding idiom rather than refactoring to a framework.
- **Update the spec with the code.** Any change to a mechanic, number, or system must be reflected in `specs/game-design.md` in the same change.
- **Assets live in `assets/`** (PNGs/JPGs referenced by relative path from the HTML builds). When adding art, place it in the correct sub-folder and reference it as `assets/<folder>/<file>`:
  - `assets/backgrounds/` — scene panels, shop/forge backgrounds (`forge_bg.png` = quench scene; `sharpen_bg.png` = stone-floor scene for the sharpening step)
  - `assets/ui/` — buttons and UI chrome
  - `assets/forge/` — forge props (bellow, bucket, pulley; `water_bucket.png` for the quench step; `Metal.png` = ore chunk flung into the bucket when a metal is spent; `grindstone.png` + `grindstone_spin.png` = still/motion frames for the sharpening step, both on the same 1701×1536 canvas so the motion frame overlays the still one 1:1)
  - `assets/sword-parts/blades|grips|guards|pommels/` — Design Desk part images (base `balanced_*` set + trait skins `flame_*`, `ice_*`, `water_*`)
  - `assets/sword-parts/overlays/` — quality overlays layered over the forged sword (`crack.png` = Weak, `sparkle.png` = Epic)
  - `assets/hammer/` — Hammering mini-game art (`ingot.png` + `balanced_<shape>_midblade.png` mid-forge stages; only Shortsword/Longsword/Broadsword have mid art so far)
  - `assets/map/` — grid tiles (`tile_normal/hazard/sword/move`; `tile_movepath` = hover directional hint drawn as a ~50% overlay on the cells a metal button would move into; `tile_centre` = spawn cell, `tile_centre2` = the 8 cells around spawn, `tile_path` = trail of cells the active sword has landed on), minimap
  - `assets/customer/` — counter customer portraits. Scripted story customers: `Bram.png` (Day 1 opener) / `BramD2.png` (Day 2 opener, Bram returns); `June.png` (Day 1's final customer #7, wants Sharp); `Roland.png` (Day 2's 3rd customer, wants Noble). Every other customer draws a no-repeat random portrait from the human pool (`man1`–`man4`, `woman1`–`woman3`)
  - `assets/unused/` — files present but not currently referenced (review before adding more)
- **`screenshots/`** — dev/marketing screenshots; not referenced by the game.
- After a gameplay change, verify the affected behavior before pushing.

## Verifying changes

- The browser **screenshot tool times out on this game** — a continuous ember/`requestAnimationFrame` loop keeps the page from ever going idle. Don't rely on screenshots.
- Instead verify with the Claude Preview tools via `.claude/launch.json` (`preview_start`, config name `sword-forge` → Node static server on port 5678). Exact tool names vary by environment; in the current one they are the `mcp__Claude_Browser__*` set: `javascript_tool` to drive functions directly and read `getBoundingClientRect`/computed styles/canvas pixels, `read_console_messages` for errors, `resize_window` for the viewport. Resize to mobile (375px) before measuring layout, since the headless viewport otherwise reports width 0.
- The preview server can drop between turns (a `navigate` fails or the tab reverts to `file://`) — restart with `preview_start` and re-`navigate`; it returns on the same port.
- The **tutorial is a data-driven `tutorialFlow` array**: each step is a dialogue (`text`/`title`/`frame`), an `action`, or a `waitAction` gate; gates also carry an optional `hand` spec for the on-screen pointer. Gameplay functions advance it by checking `tutorialFlow[tutorialStep].waitAction`.

## Project tracking

- `plan.md` — running list of done / next-up work. Keep it current.

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`gh` CLI, repo `Lila-Games-Github/sword-forge`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: `CONTEXT.md` + `docs/adr/` at the repo root (created lazily by `/domain-modeling`). See `docs/agents/domain.md`.

<!-- wiki-profile:start -->
## Code wiki

An LLM-maintained navigation layer lives under `docs/wiki/`, SUBORDINATE to the
spec chain. BEFORE answering an architecture question, editing an unfamiliar
subsystem, or locating where behavior lives, consult `docs/wiki/index.md` and run:

    python .claude/skills/wiki/scripts/search_wiki.py docs/wiki "<terms>"

Maintainer schema: `docs/wiki/README.md`. Pages are maps into the code, not canon;
the dated spec chain wins on any conflict.
<!-- wiki-profile:end -->
