# FTUE customer list (2026-11-10)

Every customer in the tutorial, in play order: who, what they ask for, and what the player gets.
Build: `Swordforge_looptest_landscape.html` (after R96: GC8 comes right after TC4; the dragon gives blueprint gold, the player buys).

Sources: the `FTUE` object in the build (`parts`, `oreChain`, `garricRewards`), the build's `ftueReward(...)` calls and
`DIALOGUE` lines, and the part flows in `specs/2026-10-07-ftue-v3-rework.md`. Where those disagree, the build wins.

**Terms.** TC = tutorial customer (scripted, own portrait). GC = gameplay customer (random portrait, a real order). The GC
numbers follow the FTUE record. **Pay**: every customer pays the sword's sale price, except where the table says otherwise.
**Ores for this order** (R108, 2026-11-11): what the dragon gives in the "Ores Acquired!" window when his line for the
order closes (one of D18b-D18d at random), exactly that order's ores (`FTUE.oreChain`); "page:fire" = the ores of the fire
page in the craft book. Until R108 the ores came after the previous sale.

| Part | Customer | Request | Rewards | Ores for this order |
|---|---|---|---|---|
| 1 | **TC1 Bram** (`Bram`) | The first sword: balanced (Shortsword). | None. | None (the starting bag: 2 iron + 2 manganese) |
| 1 | **GC1** | Balanced Longsword. | The dragon gives the Longsword blueprint's price (his coins fly to the gold, D28c, D28ca); the player buys it (R96). | 2 iron + 2 manganese (after D28b) |
| 1 | **GC2** | Balanced Broadsword. | The dragon gives the Broadsword blueprint's price; the player buys it (D28e, D28f, R96). | 2 iron + 2 manganese (after D28e) |
| 1 | **GC3** | Balanced Katana. | None. The player buys the Katana blueprint (50g); if the player has less, the dragon tops the gold up to 50g (D28h). | 2 iron + 2 manganese (after D28g) |
| 2 | **TC2** (`man1`) | "Give me a good one. Any shape is fine.": balanced, any shape (D29, R118). | During the craft: **the grindstone** (D32b). At the sale: **+5 craft-book pages**. | 1 iron + 1 manganese (after D31, with D28j "I am running out of my ore stock") |
| 2 | **TC3 the adventurer** (`woman1`) | A fire Shortsword. | None. Day 1 ends after this sale. | None (the cave lesson) |
| 3 | **GC4** | Durable Shortsword (the map window, nickel from the cave). | None. | None (the Day 2 cave: 2 nickel) |
| 3 | **GC5** | Fire Longsword (guided from the fire icon on the map). | The dragon gives the fire Longsword blueprint's price; the player buys it (D92h, R96). | page:fire (after D92h and D92a) |
| 3 | **GC6** | Fire Broadsword (guided from the craft book). | The dragon gives the fire Broadsword blueprint's price; the player buys it (D92i, R96). | page:fire (after D92i) |
| 3 | **GC7** | Fire Katana. | None. The player buys the fire Katana blueprint (top-up if short). | page:fire (after D92j) |
| 4 | **TC4** (`woman2`) | "A durable sword. Make sure it is EPIC!" (D92k), any shape. | None. | 2 nickel (after D92l) |
| 4 | **GC8** (the servant; since R95 right after TC4) | A **Weak** balanced Longsword (D107a). | None. | 1 iron + 1 manganese (once the order has typed; no dragon line) |
| 4 | **TC5** (`man2`) | "Do you have a sword with the Gale trait?" (D93): a gale Shortsword. | None. On the way, the swift metal is stored (it gives **5 copper**). | 2 copper (after D93a); 5 more when the swift ingot is stored |
| 4 | **Waiting customer** | Gale Katana **and** fire Claymore (D107c). The dragon will not buy the blueprints (D107d); the player taps COME LATER and the order goes to the ledger. | None at the time. When the player has 750g or more, the dragon guides them back to the order (D107f) and gives its ores (D107g). The market walk (R83) has the player buy the gale Katana. | page:gale + page:fire (with D107g, when called on from the ledger) |
| 5 | **Bram returns** (`BramD2`) | A swift Dagger, sharper than the last (D111, D111a). | The dragon gives the swift Dagger blueprint's price; the player buys it (D111b, R96). Reward window: **the sharpening wheel** (D48). Bram's gift: **the diary** (D114-D117). | None (the stored swift ingot) |
| 5 | **GC9** | Gale Longsword. | The dragon gives the gale Longsword blueprint's price; the player buys it (D113a, R96). | page:gale (after D113a) |
| 6 | **TC6 Garric** (`man4`) | "Craft a Balanced sword and show me! Extra gold if it is good, and a reward if it is Epic tier, customized and sharpened!" (D128). Graded 1-3. | Before the craft: **the design desk** (D130b). By grade (`FTUE.garricRewards`), always with **the shop banner**: grade 1 (Weak, not customized, not sharpened): he pays **nothing**; grade 2: **10g tip**; grade 3 (Epic, customized and sharpened): **10g tip + his balanced parts** (grips, guards and pommels 5-6). D140 ends the tutorial. | 2 iron + 2 manganese (after D130, before D130b) |

## Notes

- **Numbering.** The build's ore keys call the gale customer `tc5` and Bram's return `bram2`; the build's `gc9` key is the
  **waiting customer**, not the record's GC9 (the gale Longsword, `p5g0`). This list follows the FTUE record's names.
- **Portraits** (from the build's `CUSTOMER={ portrait: ... }` lines): TC1 `Bram`, TC2 `man1`, TC3 `woman1`, TC4 `woman2`,
  TC5 `man2`, Bram's return `BramD2`, Garric `man4`. Every GC draws a random portrait from the pool (without `man1`).
- **Quests** pay 20g and 20 exp each when claimed; they are not tied to a customer.
- **Owner questions still open** (HANDOFF.md): D107d says the dragon will not buy the blueprints, but R83 then walks the player
  to buy the gale Katana.
