# FTUE v3: art needed

Status: **final for planning, parts 1-6** (2026-10-08). Parts 4-6 add no new art. Sent to the owner at
the end of planning. Tracker: `specs/2026-10-07-ftue-v3-rework.md`.

Formats follow the art already in the game: a `.png` source with a `.webp` beside it (512 wide, quality
0.86). Sword blades are drawn along the 45-degree diagonal of a square canvas, like
`balanced_katana_blade`. Until a file lands the game uses a fallback, so nothing here blocks the build.

## 1. Sword blades (`assets/sword-parts/blades/`), 32 files

The chart has 5 traits x 10 shapes. File name: `<skin>_<shape>_blade`, where the skin is `balanced`,
`flame` (fire), `swift`, `gale` or `durable` (new). Fallback today: the balanced blade of that shape.

| Trait | Have | Need |
| --- | --- | --- |
| Balanced | shortsword, longsword, broadsword, katana, cutlass, machete, saber, scimitar, claymore | **dagger** |
| Fire (`flame_`) | shortsword, longsword, broadsword | **dagger, katana, cutlass, machete, saber, scimitar, claymore** |
| Swift | shortsword, longsword, dagger | **rapier, katana, cutlass, machete, saber, scimitar, claymore** |
| Gale | shortsword, longsword, rapier | **dagger, katana, cutlass, machete, saber, scimitar, claymore** |
| Durable (`durable_`, new) | none | **shortsword, longsword, broadsword, dagger, katana, cutlass, machete, saber, scimitar, claymore** |

`balanced_rapier_blade` exists but the chart gives Balanced no Rapier, so it stays unused.

**Part 1 needs none of these.** Its swords are balanced Longsword, Broadsword and Katana, and
all three blades exist. The rest are for later parts and the market.

## 2. Hammer minigame mid-blades (`assets/hammer/`), 8 files

`balanced_<shape>_midblade`, on the same canvas as `balanced_longsword_midblade`. One per shape, used by
every trait. Have: shortsword, longsword, broadsword. Need:

- **katana** (part 1: GC3's Katana borrows the Longsword's until then)
- rapier, dagger (already on the old list), cutlass, machete, saber, scimitar, claymore

## 3. Icons (`assets/ui/`)

| Icon | Where | Fallback today |
| --- | --- | --- |
| **Tree** | the SKILL TREE button (replaces the words, owner 2026-10-07) | an emoji tree |
| **Market** | the MARKET button | the word MARKET, or an emoji |
| **11 shape icons**: shortsword, longsword, broadsword, rapier, dagger, katana, cutlass, machete, saber, scimitar, claymore | the market rows and the shape picker | emoji for 5 shapes; none for the 6 new ones |
| Coin | reward window, market prices (already on the old list) | the coin emoji |
| Lock | locked blueprints and the shape picker (already on the old list) | the lock emoji |

## 4. Durable design desk parts (`assets/sword-parts/grips|guards|pommels/`), 15 files

Only if Durable gets its own design desk skin, like fire, gale and swift: `durable_grip1-5`,
`durable_guard1-5`, `durable_pommel1-5`. Fallback: the balanced parts.

## 5. Illustrations (`assets/ui/`)

- **The map window for basic and elemental traits** (part 3, GC4; owner art to come). Fallback: `MAP_parts.webp`, which part 2 already shows after D67a.

## 6. Still open from earlier lists

- Reward icons for the reward window (decor, unlock, pages, parts).

## Count

| Group | Files |
| --- | --- |
| Blades | 32 |
| Mid-blades | 8 |
| Icons | 15 (tree, market, 11 shapes, coin, lock) |
| Illustrations | 1 (the basic and elemental map) |
| Durable parts (if needed) | 15 |
| **Total** | **71** |
