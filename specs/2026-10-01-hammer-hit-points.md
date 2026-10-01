# Hammer hit points (2026-10-01), r209

Design record for the reworked hammering minigame in `Swordforge_looptest_landscape.html`.
`tooling/hammer/hammer.test.mjs` asserts the `HM_HITS` object (between the `HAMMER-HITS` markers)
and the pure functions (between the `HAMMER-PURE` markers) against this record.

## Owner decisions (2026-10-01)

- Strikes go on **circular hit points**, not anywhere on the anvil.
- **Orb stage:** 1 hit point, struck **3 times**.
- **Mid-blade stage:** **3 hit points**, 1 strike each, at **random** positions every craft.
- The hammer has its own **aim ring**, the same size as a hit point. The player **moves** the hammer
  (drag) to put the ring on a hit point, and **taps the hammer** to strike.
- **No timer.** Hit points stay until they are struck.
- A strike outside every hit point: **no penalty** (no heat cost, no progress, no grade).
- **Heat stays.** A strike on a hit point counts only when the metal is hot (`HM_FORGE.workMin`).
  A cold strike on a hit point does nothing; the point stays.
- **Quality changes the price only.** It never blocks a customer or the tutorial.
- **Sword quality** = the average accuracy of the 6 counted strikes, in bands:
  **85% and up = Masterwork, 60% and up = Good, below 60% = Crude.**
- **SKIP HAMMER** gives **Good**. (SKIP HAMMER stays public.)
- Hit point and aim ring diameter: **5% of the stage width**.
- **D15a** (after D15): "Line up the ring on the hammer with the glowing mark, then tap the hammer."

## Values not set by the owner (Claude's proposal, owner to confirm)

- **Price multipliers:** Masterwork **x1.3**, Good **x1.0**, Crude **x0.8**, applied to the base
  price (`swordBase`), before the sharpening and design bonuses.
- Swords made **without the minigame** (recipe crafts, old saves) count as **Good** (x1.0).
- **Accuracy of one strike** = `1 - d / D`, where `d` is the distance between the centres and `D` is
  the diameter: 100% when the centres meet, 0% when the circles only touch. A strike counts on a
  hit point while the circles overlap (`d < D`); with two in reach, the nearer one takes it.
- **Placement:** a mid-blade point is placed where the mid-blade image is solid at the point's centre
  and on a circle of **0.6 x the radius** around it (the shortsword mid-blade is too narrow for the
  whole ring). Mid-blade points are at least **1.6 diameters** apart. A set that does not fit starts
  again, up to **20 times** (each try stops after 400 picks on the metal); only then are the missing
  points placed without the spacing rule.
- The aim ring sits **below and clear of the hammer head**, at **(55%, 46.5%)** of the stage with the
  hammer at rest (owner, 2026-10-01, measured from their marked screenshot; it was (57.5%, 31%), right
  under the head). It moves with the hammer.
- **Ring colour** (owner, 2026-10-01): over a hit point the ring shows the band that strike would get:
  **yellow** Masterwork, **blue** Good, **red** Crude. Off every point it is a dashed white ring.
- Each counted strike shows its accuracy (for example "92%") at the point.
- The craft window gets a **Forging** row (for example "Masterwork, 92%"). The existing **Quality**
  row is the trait tier (Weak/Fine/Epic) and is not renamed.

## What it replaces

- The old strike rule: a strike whenever the dragged hammer head **entered** a 16%-wide zone around
  the anvil, about 7 hot strikes a stage, adding `HM_FORGE.strikeGain` (0.14) each.
- The r181 swing hint (`hmSwingOn`) now points from the aim ring to the next hit point.
