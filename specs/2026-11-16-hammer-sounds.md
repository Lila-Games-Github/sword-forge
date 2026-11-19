# Hammer sounds (R122, 2026-11-16)

Build: `Swordforge_looptest_landscape.html`. Tracker: R122 in `specs/2026-10-23-ftue-smelter-rework-plan.md`. Test:
`node tooling/hammer/hammer.test.mjs` (the `HM_SFX` block, the files, the wiring).

Owner (2026-11-16): "i want to add sound for hammering. tell me what are the three tiers for hammering", then "Make placeholder
sounds". These are the game's first sounds.

## The sounds

Every strike in the hammer minigame plays one sound, picked by what the strike did. The files are **placeholders**, made by
`node tooling/sfx/make-placeholder-sfx.mjs` (synthesised metal strikes, no recordings). To use real sounds, save them over
these files with the same names (or change `HM_SFX.files` and this table together, test first).

| Key | File (`assets/sfx/`) | Plays when | Placeholder |
| --- | --- | --- | --- |
| `Masterwork` | `hammer_masterwork.wav` | a strike graded Masterwork (85% or more) | a bright anvil ring, long (about 1.1 s) |
| `Good` | `hammer_good.wav` | a strike graded Good (60-84%); every quick-hammer tap (`HM_SFX.quick`) | a clear clang, medium (about 0.6 s) |
| `Crude` | `hammer_crude.wav` | a strike graded Crude (under 60%) | a flat, buzzing clank, short (about 0.35 s) |
| `dull` | `hammer_dull.wav` | a strike that counts for nothing: off every mark, on cold metal, or on a finished blade | a dull thud, no ring (about 0.15 s) |

## Values (`HM_SFX`)

| Key | Value | Meaning |
| --- | --- | --- |
| `dir` | `assets/sfx/` | the folder |
| `vol` | 0.8 | playback volume (0-1) |
| `quick` | `Good` | the sound of a quick-hammer tap (R121; its taps are not graded) |

## Rules

- A strike's sound follows its own grade (`hmBand(hmGrade(...))`), not the sword's average.
- Strikes may overlap (170 ms apart at the fastest), so each plays on its own copy of the sound; a new strike does not cut
  the last one off.
- A browser that blocks the sound (no tap yet, a muted tab) plays nothing and the game goes on; nothing waits on a sound.
- No volume or mute setting yet (open: the owner may want one in SETTINGS).
