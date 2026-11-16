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

**R123 (owner, 2026-11-16): the trait colours follow the map's five parts.** "each sword trait has a color that shows in the
text. I want to unify them based on the group. the groups are fire, air, light, water and dark. so, each trait in the fire
group will have shades of bright red-orange. gale traits will have green-cyan, light will have yellow, water will have indigo,
deep blue, dark will be dark, violet." Draft shown; "Yes, build them". This replaces the R61 rule below (a trait's market tag,
darkened) for the traits; the tiers, sharpened and customized are unchanged.

- **The parts** are the five regions of the map picture (`assets/ui/MAP_parts.webp`). The build had no list of them, so each
  trait was placed by its angle from the map centre (`TRAIT_POS` about `REF_C`, the sketch squared to the picture). This
  matches the FTUE v3 record's light part exactly (D27: Celestial, Luck, Noble, Floral, Durable, Grace). Two traits sit on a
  border and were placed by theme: **Blood** (water/dark) and **Cursed** (fire/dark), both dark. The basic traits fall in
  parts too (Balanced fire, Swift air, Durable light, Flexible water, Heavy dark). The build keeps the parts in `DLG_GROUP`.
- **Readability stays the rule:** every colour reads at 4.5:1 or better on the parchment (`#f3e7c6`). So light is gold to
  amber, not bright yellow (bright yellow on the parchment reads at about 1.4:1), and fire is as bright as the rule allows.
- **Hue bands** (asserted, degrees): fire 0-30, air 80-195, light 28-62, water 205-245, dark 255-335.

| Part | Trait | Colour | Contrast | Was (R61) |
|---|---|---|---|---|
| fire | fire | #c0301a | 4.64:1 | #bc3824 |
| fire | magma | #b0440a | 4.64:1 | #ba3d0e |
| fire | fury | #a8231a | 5.84:1 | #b24419 |
| fire | savage | #9c4f14 | 4.82:1 | #965925 |
| fire | balanced | #b23a26 | 4.84:1 | #5f6670 |
| air | gale | #127466 | 4.59:1 | #2b736c |
| air | swift | #2b7334 | 4.73:1 | #7a641e |
| air | cloud | #1f6b7c | 4.94:1 | #5c6874 |
| air | lightning | #4a7114 | 4.66:1 | #826200 |
| air | rainbow | #17704f | 4.92:1 | #ab3e7e |
| light | celestial | #7a6200 | 4.77:1 | #6656cb |
| light | durable | #7a5a10 | 5.17:1 | #806340 |
| light | luck | #6b6400 | 4.95:1 | #237736 |
| light | noble | #8a5300 | 5.14:1 | #8a3fc2 |
| light | grace | #836012 | 4.68:1 | #96546e |
| light | floral | #8c4e08 | 5.32:1 | #aa4470 |
| water | water | #1f4db0 | 6.21:1 | #2769b2 |
| water | ice | #245ea0 | 5.36:1 | #306d92 |
| water | mist | #47509a | 5.92:1 | #63696f |
| water | flexible | #3a3a9c | 7.53:1 | #487230 |
| dark | dark | #2c2238 | 12.24:1 | #2c2533 |
| dark | cursed | #5b2c7c | 8.14:1 | #5a3a6e |
| dark | poison | #4a2f6b | 8.93:1 | #437316 |
| dark | blood | #6a1f4c | 8.92:1 | #a3162a |
| dark | heavy | #3e3552 | 9.29:1 | #4c5560 |

**R61 (superseded for the traits by R123):**

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

## Trait icons (R124, 2026-11-16)

Owner (2026-11-16): "I also want to show the icon of the traits in the dialogues." Choices: sword names only; the icon
before the word.

- **Which words:** a trait word that is part of a sword's name (it is already bold and coloured: "a fire longsword", "gale
  katana", "Swift swords", "'balanced' sword"). A trait word alone ("the fire trait", "Gale?") stays plain, as for colour.
  Tier words, shapes, "sharpened" and "customized" get none.
- **The icon** is the trait's map symbol (`TRAIT_BY[id].symbol`: 🔥 fire, 🌪️ gale, ⚖️ balanced, and so on), the one the map,
  the craft book and the blade pips show. It sits before the word, and before any quote mark around it ("🔥 fire longsword",
  "⚖️ 'balanced' sword"), in normal weight, and never parts from its word at a line break.
- **Where:** every dialogue renderer (the customer's typed line, the dragon's bubble, a line shown at once), through
  `dlgIcons(words, marks, sym)` beside `dlgMarks`, and `dlgWordNodes`.

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
| D107cb | gale katana (R83) |
| D107cd | fire claymore (R83) |
| D111 | swift dagger |
| D113a | gale Longsword |
| D128 | Balanced sword, Epic, customized, sharpened |

Built lines are marked by the same rule: the customer's order ("Do you have a Balanced Shortsword?", "I need 5 Swift swords"),
"I'm back. I wanted a Gale Longsword", and D28k's `{o}`.
