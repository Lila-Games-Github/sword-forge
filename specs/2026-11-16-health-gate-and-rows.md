# Health after the hazard lesson; the crafted window's rows (R128, 2026-11-16)

Build: `Swordforge_looptest_landscape.html`. Tracker: R128 in `specs/2026-10-23-ftue-smelter-rework-plan.md`. Tests:
`node tooling/ftue/ftue.test.mjs` and `node tooling/hazard/hazard.test.mjs` (the R128 checks).

Owner (2026-11-16), on a picture of the "Sword crafted!" window's two rows (the heart and "No loss", the hammer and "No
change"): "Show the health tab with the heart and all only after the hazard zone tutorial for the fire sword. Disable health
before that part. Also, I want the icons for both heart and hammer slightly lowered, so it rests in the middle and place the
percentage on the right side. remove no loss and no change texts. Also, instead of showing the percentage in the icon, show it
in the entire background tab for health and the hammer instead, the icons stays intact."

Owner choices (2026-11-16): before the lesson hazards do nothing at all; keep the gold figure when it is not zero; remove the
small notes; fill colours by value.

## 1. Health starts with the hazard lesson

Health is **on** (`hpOn()`) once the fire sword's hazard lesson has started (D69a, the first hazard crossed on the fire run,
`tutHazardStep` sets `FTUE_ST.hpOn`, saved with the game), and always from part 3 (`FTUE_ST.part` becomes 3 when TC3's fire
sword is sold, the end of Day 1; so the PART 4+ jumps and older saves past it have health), after the tutorial and in free
play.

Before that, hazard zones do **nothing at all**:

- the blade loses no health and cannot shatter;
- the hazard does not light up and the sword marker does not show "hurt";
- the crossing is not counted, so it lowers no trait tier;
- the sword marker shows no health fill;
- the crafted window has no Health row.

The fire run's first crossing starts the lesson (D69a-D69c) and turns health on in the same moment, so that crossing already
costs health, as before.

## 2. The crafted window's rows

Each row (Health, then the hammer) is one tab:

| Part | Before R128 | R128 |
| --- | --- | --- |
| The icon | filled up to the percentage in colour over a grey copy; the % under it | whole and in colour, on the left, centred top to bottom |
| The percentage | under the icon | on the right of the tab, larger |
| The fill | in the icon | the whole tab's background fills from the left to the percentage |
| Fill colour, Health | - | green above 60%, amber above 30%, red below (the sword marker's: `#5fd35f`, `#e8b13a`, `#e2503c`) |
| Fill colour, hammer | - | the forging band's: Masterwork gold `#e8a317`, Good blue `#5aa8ff`, Crude red `#ff4a3a` (the aim ring's blue and red; its light gold `#ffd36a` vanished on the cream tab, so a deeper gold) |
| Fill strength | - | 32% (`.cw-bar` opacity .32), so the icon and text read over it |
| Gold figure | "-12g" in red, or "No loss"; "+5g" / "-3g", or "No change" | "-12g" / "+5g" / "-3g" when not zero, beside the percentage; nothing when zero |
| Small notes | the band ("Good") and "2 hazards: -1 tier" | none |

A sword never hammered by hand (a quick-hammer or old craft) shows "-" for the hammer and no fill.
