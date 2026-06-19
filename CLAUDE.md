# CLAUDE.md

Guidance for working in the Sword Forge repo.

## What this is

Sword Forge is a 2D grid-based blacksmith crafting game. It is a **single, self-contained HTML file** (`index.html`) — all markup, CSS, and JavaScript live in that one file. There is no build step, bundler, or package manager.

## Canonical files

- **`index.html`** — THE game. The latest, canonical, playable build. Always edit this.
- **`specs/`** — Single source of truth (SSOT) for game design. See `specs/game-design.md`. Keep it in sync whenever mechanics change.
- **`archive/Sword_Grid_Game_GDD.md`** — The *original* design vision. Historical only; the build has drifted from it. Do not treat it as current — `specs/` supersedes it.

## How to run / deploy

- Run locally: open `index.html` in a browser (no server required), or use the `/run` skill.
- Deploy: pushing to `main` auto-deploys to GitHub Pages via `.github/workflows/deploy.yml`. Commit/push only when asked.

## Working conventions

- **Keep it single-file.** Do not split `index.html` into separate JS/CSS files or add a toolchain unless explicitly asked.
- **Match the existing style.** The code uses terse, semicolon-dense vanilla JS with many statements per line, global mutable state, and direct DOM manipulation. Follow the surrounding idiom rather than refactoring to a framework.
- **Update the spec with the code.** Any change to a mechanic, number, or system must be reflected in `specs/game-design.md` in the same change.
- **Assets live in `assets/`** (PNGs/JPGs referenced by relative path from `index.html`). When adding art, place it in the correct sub-folder and reference it as `assets/<folder>/<file>`:
  - `assets/backgrounds/` — scene panels, shop/forge backgrounds
  - `assets/ui/` — buttons and UI chrome
  - `assets/forge/` — forge props (bellow, bucket, pulley)
  - `assets/sword-parts/blades|grips|guards|pommels/` — Design Desk part images
  - `assets/map/` — grid tiles, minimap
  - `assets/unused/` — files present but not currently referenced (review before adding more)
- **`screenshots/`** — dev/marketing screenshots; not referenced by the game.
- After a gameplay change, verify the full loop in a browser before pushing.

## Project tracking

- `plan.md` — running list of done / next-up work. Keep it current.
