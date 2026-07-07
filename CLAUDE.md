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
  - `assets/backgrounds/` — scene panels, shop/forge backgrounds (`forge_bg.png` = quench scene; `sharpen_bg.png` = stone-floor scene for the sharpening step)
  - `assets/ui/` — buttons and UI chrome
  - `assets/forge/` — forge props (bellow, bucket, pulley; `water_bucket.png` for the quench step; `Metal.png` = ore chunk flung into the bucket when a metal is spent; `grindstone.png` + `grindstone_spin.png` = still/motion frames for the sharpening step, both on the same 1701×1536 canvas so the motion frame overlays the still one 1:1)
  - `assets/sword-parts/blades|grips|guards|pommels/` — Design Desk part images (base `balanced_*` set + trait skins `flame_*`, `ice_*`, `water_*`)
  - `assets/sword-parts/overlays/` — quality overlays layered over the forged sword (`crack.png` = Weak, `sparkle.png` = Epic)
  - `assets/hammer/` — Hammering mini-game art (`ingot.png` + `balanced_<shape>_midblade.png` mid-forge stages; only Shortsword/Longsword/Broadsword have mid art so far)
  - `assets/map/` — grid tiles (`tile_normal/hazard/sword/move`; `tile_centre` = spawn cell, `tile_centre2` = the 8 cells around spawn, `tile_path` = trail of cells the active sword has landed on), minimap
  - `assets/customer/` — counter customer portraits (`man1`, `man2`, `woman1`), rotated per customer
  - `assets/unused/` — files present but not currently referenced (review before adding more)
- **`screenshots/`** — dev/marketing screenshots; not referenced by the game.
- After a gameplay change, verify the affected behavior before pushing.

## Verifying changes

- The browser **screenshot tool times out on this game** — a continuous ember/`requestAnimationFrame` loop keeps the page from ever going idle. Don't rely on screenshots.
- Instead verify with the Claude Preview tools via `.claude/launch.json` (`preview_start` → Node static server on port 5678) and `preview_eval`: drive functions directly, read `getBoundingClientRect`/computed styles/canvas pixels, and check `preview_console_logs` for errors. Resize to mobile (375px) before measuring layout, since the headless viewport otherwise reports width 0.
- The **tutorial is a data-driven `tutorialFlow` array**: each step is a dialogue (`text`/`title`/`frame`), an `action`, or a `waitAction` gate; gates also carry an optional `hand` spec for the on-screen pointer. Gameplay functions advance it by checking `tutorialFlow[tutorialStep].waitAction`.

## Project tracking

- `plan.md` — running list of done / next-up work. Keep it current.
