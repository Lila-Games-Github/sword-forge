# Sword Forge

A 2D blacksmith crafting game for mobile (landscape), built as a **single self-contained HTML file** (vanilla
HTML/CSS/JS: no build step, bundler or dependencies). Smelt ores to move a sword across a fog-of-war trait map, take the
traits it lands on, hammer the blade into shape and sell it to customers.

**The game: `Swordforge_looptest_landscape.html`.** `index.html` redirects to it.

**Play it:** auto-deployed to GitHub Pages on every push to `main`: https://lila-games-github.github.io/sword-forge/

## Run locally

Serve the folder (the preview config `.claude/launch.json` starts `.claude/serve.js` on port 5679) and open
`http://localhost:5679/Swordforge_looptest_landscape.html`. Add `?freeplay` to skip the tutorial, `?nointro` to skip the
intro.

## Core loop

Ores (optionally ground on the grindstone) go into the **smelter** and draw a route on the map. Dragging the **bellows**
handle moves the sword along it; tilting the **ladle** beside the smelter pulls the sword toward the centre to line it up on a
trait (its tier: Weak, Fine, Epic). On a trait the **smelter gate** glows: a tap takes the trait and releases the hot metal.
The metal on the **anvil** opens the shape window (blueprints can be bought there), then the **hammering minigame**. The shaped
blade lies hot on the anvil; picked up by its handle it swings, and dipped into the **bucket** it is quenched and the sword is
made. Then sell it at the counter. A guided tutorial (the FTUE, six parts over three days) teaches all of it.
The whole design is in [`GDD.md`](GDD.md).

## Project layout

| Path | What |
|------|------|
| `Swordforge_looptest_landscape.html` | The game (markup + CSS + JS). **Always edit this.** |
| `Swordforge_looptest_landscape_hammerloop.html` | The previous main build (the hammer / mug / dragon-pull loop), reference only. |
| `swordforgeV2.html`, `v1.html`, `Swordforge_new_looptest.html` | Older builds, historical. |
| `index.html` | A redirect to the game. |
| `GDD.md` | The whole game in one document (design, systems, values, tutorial, UI). |
| `specs/` | Design records, dated; `INDEX.md` lists which are canon. The loop: `specs/2026-10-21-smelter-version-loop.md` (the crafting loop) and `specs/2026-10-23-ftue-smelter-rework-plan.md` (the tutorial's rework to it). |
| `tooling/*/` | Test suites (`node tooling/<name>/<name>.test.mjs`) asserting the recorded values. |
| `HANDOFF.md` | Current state and what is next. Read first. |
| `CLAUDE.md` | Working conventions for contributors / agents. |
| `INDEX.md`, `LEARNINGS.md`, `plan.md` | Doc catalogue, lessons, tracker. |
| `assets/` | Art: `backgrounds/`, `ui/`, `forge/`, `sword-parts/`, `hammer/`, `map/`, `customer/`, `Illustrations/`, `Decor/`. |
| `research/`, `archive/` | Experiments and the original design vision (historical). |
| `.github/workflows/deploy.yml` | GitHub Pages deploy on push to `main`. |

## Contributing

See `CLAUDE.md`. In short: keep it single-file, match the terse vanilla-JS idiom, record a design change in its spec and
test first, and commit one feature at a time.
