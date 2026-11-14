# Quick hammer for book crafts (R121, 2026-11-14)

Build: `Swordforge_looptest_landscape.html`. Tracker: R121 in `specs/2026-10-23-ftue-smelter-rework-plan.md`. Test:
`node tooling/hammer/hammer.test.mjs` (the `HM_QUICK_CFG` block and the wiring).

Owner (2026-11-14): "when crafting from the craft book, I want the hammering minigame to be there, But this direct craft
hammering minigame will be different. It will not have the circle marks on the metal or the hammer, the dragon will blow fire
automatically (with slight rotation) and the player will have to tap 6 times. they can tap anywhere on the screen, and we see
the hammer strike the metal."

Owner choices (2026-11-14): the sword keeps the page's recorded quality; both CRAFT 1 buttons; 3 taps on the orb, 3 on the
mid-blade.

## Where it runs

- **CRAFT 1 in the craft book** (`cbCraft`) and **CRAFT 1 on the trait card** (`tcCraft1`, which calls `cbCraft(1)`). Before
  R121 both made the sword at once, with no minigame.
- The order is: CRAFT 1, the shape window, **the quick hammer**, then the crafted window (`showCraft`) as before.
- The full minigame (the bench: the smelter, the anvil) is unchanged.
- The quick hammer opens over the craft book (z 1010, as the shape window), which stays open behind it.

## What the player sees

| Part | Quick hammer | Full minigame (unchanged) |
| --- | --- | --- |
| Hit points (the circle marks on the metal) | none | 1 on the orb, 3 on the mid-blade |
| Aim ring (the circle under the hammer) | none | yes |
| Swing arrow, mug | none | as before |
| The hammer | fixed, placed so its strike lands on the metal; it swings on every tap | dragged by the player |
| The dragon | breathes fire from the start, by himself, his head swaying a little either way | the player holds the metal to aim him |
| Heat | always full (no cold strikes) | rises under the flame, cools over time |
| A tap | anywhere on the screen (the dragon's head too); every tap counts, no more than one per `gap` ms | on the hammer, over a hit point |
| Strikes | 6: 3 shape the orb into the mid-blade, 3 the mid-blade into the finished blade | the same stages, graded |
| The line | "Tap anywhere to strike (n/6)", then "Blade shaped!" | as before |
| End | `endMs` after the 6th tap the window closes and the sword is made | the blade goes to the anvil, then the bucket |

## Values (`HM_QUICK_CFG`)

| Key | Value | Meaning |
| --- | --- | --- |
| `orbTaps` | 3 | taps that shape the orb into the mid-blade |
| `midTaps` | 3 | taps that shape the mid-blade into the blade |
| `sway` | 4 | degrees the dragon's head turns either way while he breathes |
| `swayMs` | 1800 | one full sway, ms |
| `gap` | 170 | ms between taps that count (the full minigame's `HM_FORGE.strikeGap`) |
| `endMs` | 700 | ms from the 6th tap to the crafted window (the full minigame's `SMELT.shapedHold`) |

Shape progress after `t` taps (`hmQuickProg`): `t/orbTaps` up to 1, then `1 + (t-orbTaps)/midTaps`, at most 2 (0 orb, 1
mid-blade, 2 blade; the same scale as the full minigame's `hmProg`).

## Rules

- **Quality:** the taps are not graded. The sword keeps the forging the page recorded (`r.forge`), or `HM_HITS.unforged`
  ("Good") for a page with none, exactly as before R121.
- **The blade picture** is the recipe's (its trait set and the chosen shape, `bladeFor`), not the bench's.
- **Ore** is spent when the sword is made, after the 6th tap. **Cancel** closes the window and spends nothing (a plain toast, "Crafting cancelled. Nothing was spent.").
- **SKIP HAMMER** (DEV only) ends it at once and makes the sword.
- The tutorial's minigame lines and guides (the heat lines, the swing arrow, the idle hint) do not run in the quick hammer.
