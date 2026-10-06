# Skill tree: trading and ore skills (2026-10-06), r218

Design record for four new skills in `Swordforge_looptest_landscape.html`. Every value is in the
`SKILLS` table and the helpers between the `SKILLS-BEGIN` / `SKILLS-END` markers;
`tooling/skills/skills.test.mjs` asserts them against this record.

## Before r218

The tree has 12 nodes (`ST_NODES`): 4 yellow (top-left arc, nodes 0-3), 4 green (top-right arc, nodes
4-7), 4 blue (bottom, nodes 8-11). Only the blue nodes held skills (Bulk Craft, Sword Master, Far
Vision, Restore Ore); the yellow and green nodes bought nothing. One talent point per level.

## Owner decisions (2026-10-06)

Left side (yellow), one skill; right side (green), three skills. Open questions were answered: the
extraction steps are 5/10/15/20/25%, the chance rolls **once per seam**, and Claude's defaults were
taken for the rest (speed per rank, bountifulness reading, tutorial caves, price base, cost, nodes).

| Skill | Node | Max | Cost a rank | Effect at rank r |
| --- | --- | --- | --- | --- |
| **Improved Trading Skills** | 0 (first yellow) | 20 | 1 | base price x (1 + 0.05 r): rank 20 = x2, doubles the base price |
| **Ore Extraction Upgrade** | 4 (first green) | 5 | 1 | each seam, on its first swing, has a 5 r % chance (5-25%) of holding 3-4 more ore |
| **Pickaxe Upgrade** | 5 | 5 | 1 | swings 10 r % faster: 340 ms x (1 - 0.1 r), rank 5 = 170 ms (twice as fast) |
| **Ore Bountifulness** | 6 | 10 | 1 | +r ore on every seam (7 becomes 7 + r; rank 10 = 17) |

- **Trading** multiplies the base price (`swordBase`), with popularity, the forging band and health;
  the sharpening and design bonuses stay as they are.
- **Bountifulness** applies when the seams are rolled for a day, and a rank bought mid-day adds +1 at
  once to every normal seam that still has ore.
- **The three ore skills never touch the tutorial's scripted caves** (`setTutorialCave`, the fire
  sword's exact 2 iron + 2 manganese; `ftueDay2Cave`, the stocked Day 2 cave). Those seams carry
  `script:true`.
- **Pickaxe speed** also speeds up the swing animation to match.
- Nodes 1-3 (yellow) and 7 (green) stay empty. RESET TALENT refunds the new skills like the old ones.
