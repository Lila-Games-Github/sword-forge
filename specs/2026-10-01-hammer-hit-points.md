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

## Heat on the marks (owner, 2026-10-06), r219

The hit points show the metal's heat. Owner chose the colours; Claude set the thresholds (`HM_HITS.heat`):

| Mark | Heat |
| --- | --- |
| white (hot) | 0.75 and up |
| yellow (medium) | 0.55 to 0.75 |
| orange (low; owner changed it from red, 2026-10-06) | `HM_FORGE.workMin` (0.35) to 0.55 |
| grey (cold) | below 0.35: a strike does not count (unchanged) |

The marks recolour every time the heat crosses a line (`hmPtsHeat()` from the heat tick). Note: the
aim ring keeps its own colours for the accuracy band (yellow / blue / red); with low heat in orange, red
only ever means a Crude strike.

### Revised (owner, 2026-10-06): a gradient, yellow to grey

Supersedes the bands above (white / yellow / orange / grey). The marks' colour is **blended smoothly**
from the exact heat, every heat change, between four stops (`HM_HITS.heat`, `hmHeatColor()`):

| Heat | Colour |
| --- | --- |
| 1.00 | yellow (255, 224, 58) |
| 0.70 | orange (255, 140, 26) |
| 0.45 | red (232, 50, 30) |
| 0.35 and below | grey (200, 205, 212): `HM_FORGE.workMin`, a strike does not count |

Grey sits at 0.35 so "grey" still means "too cold to strike" (Claude's choice; the owner gave the colour
order). The colour is one CSS variable (`--pt`) on `#hmPoints`. Red on a mark now means "almost too cold";
the aim ring's red still means a Crude strike.

## The accuracy popup (owner, 2026-10-06), r226

The "92%" shown on a counted strike is **bigger** (26 px, was 15), lasts **twice as long** (1.6 s, was 0.8)
and **rises almost to the top of the scene** before it fades: it ends with its foot at `HM_ACC_TOP` (10%)
from the top (the rise is set per strike, `--rise`), fully visible for the first 75% of the time. Measured:
45% → 11.5% (0.8 s) → 6.7% (1.2 s, still opaque) → gone at 1.6 s.

## Touch targets (owner, 2026-10-20), r277

Owner: the controls were hard to use. A tap on the hammer could make the dragon breathe on the blade, because the
touch areas were boxes, not the art. Measured on the build before the fix (Longsword, hammer over the metal):

- the hammer's pad (`#hmGrip`, 44% x 66% of the stage) caught 1,895 sample points, 1,762 of them (93%) off the hammer;
- the metal's pad (`#hmAimPad`, 30% x 28% around the anvil, over `#hmGrip` at the same z) caught 105 of 639 points on
  the hammer's own art (16%), so those taps aimed the dragon instead of moving or striking the hammer;
- at the orb stage, 939 of the metal pad's 1,512 sample points (62%) were off the metal.

The rule now: **a press goes to what is under the finger.** One handler on the scene reads each press:

1. on the hammer's own pixels (its art's alpha, through its live transform) -> the hammer (drag, or tap to strike);
2. else on the metal's own pixels -> the dragon aims and breathes: the orb (a circle) while it shows, then the
   mid-blade's and the finished blade's alpha, each while it is more than a third visible;
3. else the press is not taken, so the dragon's head, the mug and the buttons work as before.

The hammer wins a press on both, since it is drawn over the metal. The three pads no longer take presses.

Values (Claude's proposal, owner to confirm): `HM_HITS.touch = { hammer: 6, metal: 8 }`, the slack in screen pixels
around the art that still counts as a hit, so a thin handle or blade edge is not a pixel hunt.

Build (r277): `wireHmTouch` (a capture-phase `pointerdown` on `#hmScene`) asks `hmOnHammer` and `hmOnWork`, and
`hmPickTarget` (pure) chooses; the hammer's and the dragon's press handlers (`HM_DOWN`) then capture the pointer on the
scene. `hmLocalUV` maps a screen point into an element's own box through its computed transform and origin;
`hmMaskHit` (pure) looks for solid alpha within the slack, read with the existing `hmMask`. Until a mask has loaded,
the old box stands in. A mouse also gets the cursor the art asks for. Asserted by `tooling/hammer/hammer.test.mjs`
(47), written first. Checked in the browser (Longsword, hammer moved over the metal): all 639 sampled hammer pixels go
to the hammer, 352 of them over the old metal pad; a real press there moves the hammer and does not breathe; a tap on
the head strikes; a press on the orb breathes and releasing stops it; a press in the old pad's box but off the metal is
not taken; at the mid-blade, 385 of 385 blade pixels are taken and 0 of 6,096 points beyond the slack; the dragon's
head and the mug still take their own taps; no console errors.
