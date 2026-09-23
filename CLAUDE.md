# CLAUDE.md

Guidance for working in the Sword Forge repo.

## What this is

Sword Forge is a 2D grid-based blacksmith crafting game. It is a **single, self-contained HTML file** — all markup, CSS, and JavaScript live in one file. There is no build step, bundler, or package manager.

## Session state — read these first

- **`HANDOFF.md`** — living state: what the active build has, what is next, gotchas, and the open
  questions only the owner can answer. Updated at every session close.
- **`INDEX.md`** — dated catalogue of every doc (`canon`/`superseded`). **`LEARNINGS.md`** — lessons.
- Where these disagree with `README.md`, `ONBOARDING.md`, `plan.md`, `specs/README.md`,
  `specs/game-design.md` or `docs/wiki/`, **`HANDOFF.md` and this file win** — several of those still
  describe the earlier builds and are listed in HANDOFF's "Documentation drift" section.

## Canonical files

- **`Swordforge_looptest_landscape.html`** — ⚠️ **the build actually under development** (as of 2026-09-18): the landscape loop-test, carrying the guided tutorial (D1–D43) and the current craft/economy systems. Edit this one unless told otherwise. Its companion `Swordforge_new_looptest.html` (portrait) is **deliberately never touched** — the two have diverged. Note PR #10 (`fm/sf-lazy-load`, open) also proposes naming this build canonical across the docs.
- **`swordforgeV2.html`** — the **previous** canonical build (V2: path-map furnace build + guided tutorial). Historical unless a task names it; the landscape loop-test above is what is under development.
- **`index.html`** — since 2026-09-22 a **redirect to the landscape build**, so the Pages root serves the game under development. It is 20 lines; do not put game code here.
- **`v1.html`** — V1, kept for historical reference only (it was `index.html` until 2026-09-22). Do not develop here.
- **`specs/`** — Single source of truth (SSOT) for game design. See `specs/game-design.md`. Keep it in sync whenever mechanics change.
- **`research/`** — experiments and design docs, not shipped (chalk-map prototype, potioncraft reference, `sword-forge-gdd.html`).
- **`story/`** — narrative pages (e.g. `bram-one-more-sunrise.html`), referenced by story content.
- **`ONBOARDING.md`** — zero-context handoff for a fresh contributor/agent; read first if new.
- **`archive/Sword_Grid_Game_GDD.md`** — The *original* design vision. Historical only; the build has drifted from it. Do not treat it as current — `specs/` supersedes it.

## How to run / deploy

- Run locally: use the `/run` skill, or `preview_start` (`.claude/launch.json`, name `sword-forge`, port **5679**). The root URL now redirects to the landscape build, but **navigating explicitly** to `http://localhost:5679/Swordforge_looptest_landscape.html` is still the honest way to test, since the redirect is one more thing that can be wrong.
- Deploy: pushing to `main` auto-deploys to GitHub Pages via `.github/workflows/deploy.yml`. Commit/push only when asked.

## Working conventions

- **Keep it single-file.** Do not split the build you are editing (`Swordforge_looptest_landscape.html`, or `swordforgeV2.html`) into separate JS/CSS files or add a toolchain unless explicitly asked.
- **Match the existing style.** The code uses terse, semicolon-dense vanilla JS with many statements per line, global mutable state, and direct DOM manipulation. Follow the surrounding idiom rather than refactoring to a framework.
- **Update the spec with the code.** Any change to a mechanic, number, or system must be reflected in `specs/game-design.md` in the same change.
- **Assets live in `assets/`** (PNGs/JPGs referenced by relative path from the HTML builds). When adding art, place it in the correct sub-folder and reference it as `assets/<folder>/<file>`:
  - `assets/backgrounds/` — scene panels, shop/forge backgrounds (`forge_bg.png` = quench scene; `sharpen_bg.png` = stone-floor scene for the sharpening step)
  - `assets/ui/` — buttons and UI chrome, **and standalone explainer art** (`weak/fine/epic.webp` for the Alignment for Tiers window, `MAP_parts.webp` for the five-parts window, `arrow.webp` = the white idle nudge)
  - `assets/Illustrations/` — full-window story art (`Bram_illustration.webp`)
  - `assets/forge/` — forge props (bellow, bucket, pulley; `water_bucket.png` for the quench step; `Metal.png` = ore chunk flung into the bucket when a metal is spent; `grindstone.png` + `grindstone_spin.png` = still/motion frames for the sharpening step, both on the same 1701×1536 canvas so the motion frame overlays the still one 1:1)
  - `assets/sword-parts/blades|grips|guards|pommels/` — Design Desk part images (base `balanced_*` set + trait skins `flame_*`, `ice_*`, `water_*`)
  - `assets/sword-parts/overlays/` — quality overlays layered over the forged sword (`crack.png` = Weak, `sparkle.png` = Epic)
  - `assets/hammer/` — Hammering mini-game art. `hammer_bg/_dragon/_hammer/_sword.png` are the landscape scene layers, all exported on the SAME 1877x1025 canvas — bg, hammer and sword are drawn in place, so stacking them at `inset:0` in a box of that aspect registers them 1:1 (the dragon is placed by `HM_RIG` instead). `ingot.png` + `balanced_<shape>_midblade.png` are the earlier blade stages; only Shortsword/Longsword/Broadsword have mid art so far
  - `assets/map/` — grid tiles (`tile_normal/hazard/sword/move`; `tile_movepath` = hover directional hint drawn as a ~50% overlay on the cells a metal button would move into; `tile_centre` = spawn cell, `tile_centre2` = the 8 cells around spawn, `tile_path` = trail of cells the active sword has landed on), minimap
  - `assets/customer/` — counter customer portraits. Scripted story customers: `Bram.png` (Day 1 opener) / `BramD2.png` (Day 2 opener, Bram returns); `June.png` (Day 1's final customer #7, wants Sharp); `Roland.png` (Day 2's 3rd customer, wants Noble). Every other customer draws a no-repeat random portrait from the human pool (`man1`–`man4`, `woman1`–`woman3`)
  - `assets/unused/` — files present but not currently referenced (review before adding more)
- **`screenshots/`** — dev/marketing screenshots; not referenced by the game.
- After a gameplay change, verify the affected behavior before pushing.

## Verifying changes

- **Screenshots work, but flakily.** The continuous ember/`requestAnimationFrame` loop can keep the page from going idle, and a capture fails outright while the app window is minimised or hidden. Retry once on timeout; if it fails twice, fall back to `read_page`/`javascript_tool` measurements rather than burning turns.
- Verify with the Claude Preview tools via `.claude/launch.json` (`preview_start`, config name `sword-forge` → Node static server on port **5679** — `.claude/launch.json` is the source of truth; this line said 5678 until 2026-09-23). Exact tool names vary by environment; in the current one they are the `mcp__Claude_Browser__*` set: `javascript_tool` to drive functions directly and read `getBoundingClientRect`/computed styles/canvas pixels, `read_console_messages` for errors, `resize_window` for the viewport. Resize to mobile (375px) before measuring layout, since the headless viewport otherwise reports width 0.
- The preview server can drop between turns (a `navigate` fails or the tab reverts to `file://`) — restart with `preview_start` and re-`navigate`; it returns on the same port.
- **Drive controls the way a player does, and check what a player can see.** Click through `document.elementFromPoint(x,y).dispatchEvent(...)` rather than `el.click()` — an element's box hit-tests even where its art is transparent, so props routinely cover controls. For "is it on screen", `textContent` is not enough (it reads through `display:none`): also assert `offsetParent !== null`, a non-zero box, and that `elementFromPoint` at its centre returns that element.
- A **hidden preview pane freezes `requestAnimationFrame`** — drive `tick()`/`hmTick()` by hand when verifying anything time-based, and never gate game state on `animation.onfinish`. The console also retains errors from earlier loads; check the URL stamp before believing one.
- The **tutorial differs by build.** In `Swordforge_looptest_landscape.html` (the active one) there is **no `tutorialFlow`** — it is a `DIALOGUE` map of permanent ids (D1…), a `SAY_SEQ` run, and a `TUT_STAGE` string, with `lastLine()` returning the final key so the guide-to-pet switch needs no maintenance. Script SSOT: `specs/2026-09-15-looptest-landscape-tutorial-script.md`. The array below describes **`swordforgeV2.html`** only.
- In `swordforgeV2.html`, the **tutorial is a data-driven `tutorialFlow` array**: each step is a dialogue (`text`/`title`/`frame`), an `action`, or a `waitAction` gate; gates also carry an optional `hand` spec for the on-screen pointer. Gameplay functions advance it by checking `tutorialFlow[tutorialStep].waitAction`.

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

⚠️ Python is **not installed** on the current dev machine, so that command and the
`tooling/anchor-match` test suite cannot run here. The wiki pages also still describe
`index.html`/`swordforgeV2.html`, not the landscape build — treat them as stale for it.

Maintainer schema: `docs/wiki/README.md`. Pages are maps into the code, not canon;
the dated spec chain wins on any conflict.
<!-- wiki-profile:end -->
