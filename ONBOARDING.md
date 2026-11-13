# Sword Forge - Onboarding

Zero-context handoff for a new contributor or agent. Rewritten 2026-11-03 for the game as merged in PR #28 (R0-R62); brought to R115 (PR #31) on 2026-11-13. The
V1 / V2 version of this file is in git history.

## 1. What it is

- A mobile (landscape) blacksmith crafting game in **one self-contained HTML file**:
  **`Swordforge_looptest_landscape.html`** (~11,400 lines of markup, CSS and terse vanilla JS; no build step, no dependencies).
- Ores in the smelter draw a route on a fog-covered trait map; the bellows move the sword; the gate takes the trait; the ladle
  sets the tier; the anvil opens the hammering minigame; the blade is quenched in the bucket; swords sell at the counter or the
  shop. A six-part tutorial (FTUE), led by a small dragon, teaches it over three in-game days.
- **The whole game in one document: `GDD.md`.** Mechanics with values: `specs/game-design.md`.
- Live: https://lila-games-github.github.io/sword-forge/ (the root redirects to the game).

## 2. Read in this order

1. `CLAUDE.md` - conventions, the nine test suites, how to verify.
2. `HANDOFF.md` - current state, what is next, gotchas, open owner questions.
3. `GDD.md` - the game, end to end.
4. `INDEX.md` - which docs are canon; the dated records in `specs/` hold each system's values and the reasons.

## 3. Run, test, deploy

- **Run:** `preview_start` with the `.claude/launch.json` config `sword-forge` (Node static server, port **5679**), then
  navigate to `http://localhost:5679/Swordforge_looptest_landscape.html`. `?freeplay` skips the tutorial; `?nointro` skips the
  intro. The PART 1-6 and GAME buttons (bottom left, outside the frame) or `ftuePart(n)` start a new game at a part; the
  CUSTOMER dropdown or `ftueCust('GC5')` at any tutorial customer. These and every other cheat exist only in the internal build:
  the testers' copy, `Swordforge_external.html`, is generated with them off (`node tooling/external/make-external.mjs`, only
  when the owner asks).
- **Test:** `node tooling/<suite>/<suite>.test.mjs` for external, ftue, smelter, market, map, skills, hazard, hammer and mobile-fit. The
  current counts are in `CLAUDE.md` and `HANDOFF.md`. A recorded value changes in its spec and its test together, test first.
- **Verify in the browser** as a player would: drive taps through `document.elementFromPoint(x,y)`, and check visibility with
  `offsetParent` and a hit test, not `textContent`. A hidden preview pane freezes `requestAnimationFrame`; drive frames by hand.
- **Deploy:** a push to `main` deploys GitHub Pages (`.github/workflows/deploy.yml`). Work on a branch
  `sword-forge/<2-5-kebab-keywords>` and merge by PR; commit, push and merge only when the owner asks.

## 4. Working rules

- Keep it single-file; match the terse, semicolon-dense idiom; no frameworks.
- Commit each feature as soon as it is done; stage named files only (the owner drops art into the tree).
- Player-facing text says "tap", never "click"; dialogue uses straight quotes. No em-dashes anywhere.
- New dialogue ids go beside their neighbours (D28a, D99a ...), never at the end, except a new final line.
- Update the mechanic's dated record, `specs/game-design.md` and `GDD.md` with the code; doc-changing commits update `INDEX.md`.

## 5. Where things live in the build

| System | Where (names to search for) |
|---|---|
| Tutorial config, every recorded value | the `FTUE` object between `FTUE-CONFIG-BEGIN` / `-END` |
| Dialogue | `DIALOGUE` (D1-D140, 200 ids), `SAY_SEQ`, `say`, `sayQueue`, `sayTap`, `TUT_STAGE`, `FTUE_ST` |
| Customer lines and replies | `custLine`, `typeLine`, `typeAfter` / `typeAlso`, `custReply`, `FTUE.replies` |
| The crafting loop | `SMELT`, `addSegment`, `smGlide` (bellows), `smLadleTick`, `smGateSync`, `placeOnAnvil`, `smBladeQuench` |
| Map, traits, hazards | `TRAITS`, `TRAIT_POS`, `ORES`, `tierFromDist`, `HAZ`, `HAZARD_DPS` |
| Hammer minigame | `HM_HITS`, `openHammer`, `hmQualOf`, `finishBlade` |
| Price and selling | `swordValue`, `swordBase`, `swordPriceParts`, `sellCounter`, `orderMatches` |
| Market | `MARKET`, `marketPrice`, `MK_ROT` (the rotary window) |
| Skills, quests, xp | `SKILLS`, `gainExp`, `QUESTS`, `bumpQuest` |
| Screens | `SCREENS`, `goScreen`, `SCREEN_ART`, `SCREEN_PROPS`, `SCREEN_HOTS` |
| Effects | `SWING_FX` / `fxFor`, `ACQ_FX` / `acqBurst`, `furnaceLook` |
| Save | `saveBlob`, `applyState`, key `swordforge.save.v1` (manual SAVE in the gear menu) |
| Tutorial pointers | `tutArrow`, `tutExit`, `tutGlow`, `tutDark`, `tutHole`, `tutSpotOn` |

## 6. Other files

- `Swordforge_looptest_landscape_hammerloop.html` (the previous loop) and `Swordforge_looptest_landscape_pathtest.html`:
  reference only. `swordforgeV2.html`, `v1.html`, `Swordforge_new_looptest.html`: older builds, historical, never edited.
- `index.html`: a 20-line redirect to the game.
- `assets/`: art by folder (see `CLAUDE.md`); each `.png` has a `.webp` beside it that the game loads.
- `tooling/`: the test suites and helpers. `research/`, `archive/`, `story/`: experiments, the original vision, story pages.
- `docs/wiki/`: an older code wiki describing V1 / V2; treat it as stale for this build.

## 7. State and next steps

See `HANDOFF.md` ("Current state", "Next steps"). In short: the FTUE on the smelter loop is merged and live; nobody has yet
played Parts 2-6 straight through or played on a phone; stand-in art and a set of review items are listed there.
