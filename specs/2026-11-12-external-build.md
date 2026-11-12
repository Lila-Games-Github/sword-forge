# External tester copy (R115, 2026-11-12)

The game goes out for external feedback without the cheats and test aids; the owner keeps them for internal testing.
Build: `Swordforge_looptest_landscape.html` (the main build, internal) and `Swordforge_external.html` (generated, for
testers). Tracker: R115 in `specs/2026-10-23-ftue-smelter-rework-plan.md`.

Owner (2026-11-11): "i will be sending out the game for external feedback. so, for that, I want the console helper, skip
hammer, and all cheats removed. But i want them to remain for my internal testing." Choices: Option B (a generated copy);
"testers' copy stay the same until i ask for a new one"; built on "give me the external version for playtest" (2026-11-12).

## The switch

The main build's second script starts with `const DEV=true;`. Every cheat and test aid checks it:

| What | Internal (DEV true) | External (DEV false) |
| --- | --- | --- |
| The cheat bar (SKIP HAMMER, PART 1-6, GAME, the CUSTOMER dropdown) | shown | removed at start (`devStrip`) |
| SETTINGS "+1000 GOLD" (`#mnGold`) and its "Cheats, for testing." note | shown | removed, no note |
| The map's fog eye button (`#fogCheat`) | shown | removed |
| `ftuePart(n)`, `ftueCust(id)`, `cheatGold()`, `toggleFogCheat()`, `hmSkip()` | work | do nothing (`ftuePart` and `ftueCust` answer "Not available") |
| `window.SF`, `window.SFM` (debug handles) | set | not set |
| `?freeplay` (free play), `?nointro` (skip the intro) | work | ignored |

The tutorial, the game and every other control are the same in both.

## The copy

`node tooling/external/make-external.mjs` writes `Swordforge_external.html`: the main build with `const DEV=true;`
turned to `const DEV=false;` and a "generated, do not edit" comment with the date after the doctype. Nothing else
changes. It refuses to run unless the main build holds exactly one `const DEV=true;`.

The testers' copy is **frozen**: it is made only when the owner asks ("make the external version"), never on a push or in
CI. Both copies load the same `assets/`, so renaming or deleting art the frozen copy uses breaks it until a new copy is
made. On GitHub Pages it is served beside the main build at `/Swordforge_external.html`.

## Test

`node tooling/external/external.test.mjs`: the main build has the switch once and every gate above; the generator turns
only the switch (and adds the comment); the committed copy has `const DEV=false;` and no `const DEV=true;`.
