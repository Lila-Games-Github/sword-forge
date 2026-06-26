# Sword Forge

A 2D grid-based blacksmith crafting game, built as a **single self-contained `index.html`** (vanilla HTML/CSS/JS — no build step, bundler, or dependencies). Explore a fog-of-war grid to discover magical traits, heat and forge them into custom swords, and sell to customers at your counter.

**Play it:** auto-deployed to GitHub Pages on every push to `main` → https://lila-games-github.github.io/sword-forge/

## Run locally

Open `index.html` in any modern browser — no server or install required. (A zero-dependency static server config lives in `.claude/` for tooling that needs one.)

## Core loop

Select metals → move across the **50×50** fog-of-war grid (each move spends one metal; hold a direction for the Purify-dash slider to move 1–3 blocks) to land on a hidden **trait** → play the **heating** minigame to fuse the trait onto your active blade → **design & forge** the sword → **sell** it to a customer at the counter (or list it in the passive shop). Reinvest gold into the smelter, metal unlocks, the shop, and blueprints.

## Project layout

| Path | What |
|------|------|
| `index.html` | The entire game (markup + CSS + JS). **Always edit this.** |
| `specs/game-design.md` | Single source of truth for mechanics, kept in sync with the code. |
| `specs/README.md` | SSOT policy. |
| `CLAUDE.md` | Working conventions for contributors / agents. |
| `plan.md` | Done / next-up tracker. |
| `assets/` | Art: `backgrounds/`, `ui/`, `forge/`, `sword-parts/`, `map/`, `customer/`, `unused/`. |
| `archive/Sword_Grid_Game_GDD.md` | Original design vision (historical; superseded by `specs/`). |
| `.github/workflows/deploy.yml` | GitHub Pages deploy on push to `main`. |
| `screenshots/` | Dev/marketing screenshots (not referenced by the game). |

## Contributing

See `CLAUDE.md`. In short: keep it single-file, match the existing terse vanilla-JS idiom, and update `specs/game-design.md` in the **same change** as any mechanic change.
