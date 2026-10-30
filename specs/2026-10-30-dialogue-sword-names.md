# Sword names in the dialogues (2026-10-30)

**Status:** canon. **Build:** `Swordforge_looptest_landscape.html`, step R61 of
`specs/2026-10-23-ftue-smelter-rework-plan.md`. **Test:** `tooling/ftue/ftue.test.mjs` reads `DLG_HL` and the rules between
the DLG-PURE markers out of the build and asserts them against this record.

## Source

Owner, 2026-10-30: "I want the sword names to be bold. Color code every trait and show that color for the text of the sword
and it's shape as well. 'Epic Balanced Shortsword', balanced shortsword will be bold and colored. Epic will also be bold, same
for fine and weak. use colors for those as well. Same for 'sharpened' and 'customized'. this is only for the dialogues."

## Scope

- **Where:** the lines that type in the dragon's bubbles (`sayType`: counter, bench, sharpening, design desk), the dragon's line
  in the market window (`sayOver`), and the customer's line (`typeLine`, and `typeDone` when a tap finishes it). Nothing else:
  windows, buttons, labels and the player's replies are unchanged.
- **What is marked** (bold, in its colour; the punctuation round a word stays plain):
  - **A sword's name:** one or more trait words straight before a shape word ("balanced Longsword", "Fire swords", "gale
    katana"). Each trait word takes its trait's colour, the shape the colour of the trait before it. Only quotes may stand
    between them ("a 'balanced' sword"). A shape alone ("pick the Longsword") and a trait alone ("the fire trait") stay plain.
  - **A tier word** (Weak, Fine, Epic, any case) before a trait, a shape, "tier" or "trait", or written in capitals ("EPIC!").
    So "Fine, I'll buy this one too" and "a fine blade" stay plain.
  - **"sharpened"** and **"customized"** (and "customised"), wherever they stand.
- Shape words: sword, shortsword, longsword, broadsword, rapier, dagger, katana, claymore, cutlass, machete, saber, scimitar,
  each also with a plural "s".

## Colours (`DLG_HL`)

- **Traits:** every trait (all 25) has one. The source is the trait's dark tag colour in the market (`MK_ROT.tags[id][1]`),
  darkened in 1% steps (each channel times 0.99, 0.98, ...) until it reads at 4.5:1 or better against the bubble's parchment
  (`#f3e7c6`). Swift's yellow and Gale's cyan did not read on the parchment at all (1.35:1 and 1.51:1).
- **Tiers:** the tier window's own colours (`tierColor`, r225): Epic `#8e44d9`, Fine `#2b7fd8`, Weak `#4d4d4d`. They are kept
  as the owner chose them, so a tier looks the same in a dialogue and in its window; Fine reads at 3.3:1, Epic at 4.3:1 (bold).
- **sharpened** `#2f5d7c` (steel), **customized** `#9a3f8a` (paint): new, 4.5:1 or better.

| Trait | Tag | Dialogue |
|---|---|---|
| balanced | #5f6670 | #5f6670 |
| fire | #e8452c | #bc3824 |
| swift | #f0c43a | #7a641e |
| gale | #4fd1c5 | #2b736c |
| durable | #8a6a45 | #806340 |
| flexible | #6fb04a | #487230 |
| heavy | #4c5560 | #4c5560 |
| celestial | #6b5bd6 | #6656cb |
| cloud | #9fb3c8 | #5c6874 |
| rainbow | #d94fa0 | #ab3e7e |
| luck | #2f9e48 | #237736 |
| lightning | #d9a400 | #826200 |
| noble | #8a3fc2 | #8a3fc2 |
| grace | #d97aa0 | #96546e |
| floral | #e05a94 | #aa4470 |
| fury | #d9531e | #b24419 |
| ice | #4aa8e0 | #306d92 |
| water | #2f7fd6 | #2769b2 |
| magma | #c4400f | #ba3d0e |
| mist | #8d969e | #63696f |
| poison | #5c9e1e | #437316 |
| savage | #a8642a | #965925 |
| blood | #a3162a | #a3162a |
| cursed | #5a3a6e | #5a3a6e |
| dark | #2c2533 | #2c2533 |

## What it marks in the scripted lines (asserted)

| Line | Marked |
|---|---|
| D28a | balanced sword |
| D28b | balanced Longsword |
| D42 | balanced sword |
| D62, D63 | fire sword |
| D92f | Durable sword |
| D92h | fire Longsword |
| D92i | fire Broadsword |
| D92j | fire Katana |
| D92k | durable sword, EPIC |
| D97 | epic |
| D107a | balanced sword, weak |
| D107b | weak |
| D107c | gale katana, fire claymore |
| D111 | swift dagger |
| D113a | gale Longsword |
| D128 | Balanced sword, Epic, customized, sharpened |

Built lines are marked by the same rule: the customer's order ("Do you have a Balanced Shortsword?", "I need 5 Swift swords"),
"I'm back. I wanted a Gale Longsword", and D28k's `{o}`.
