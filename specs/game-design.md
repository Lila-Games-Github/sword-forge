# Sword Forge — Game Design (SSOT)

**Single source of truth for game mechanics.** This describes the game *as actually implemented* in `index.html`. When code and this doc disagree, treat it as a bug in one of them and reconcile. Update this doc in the same change as any mechanic change.

> The original design vision is archived at `archive/Sword_Grid_Game_GDD.md`. The build has drifted from it; this spec reflects current reality, not original intent.

---

## 1. Overview

You play a blacksmith who explores a dark 50×50 grid to discover magical traits, forges custom weapons from those traits, and sells them to customers (actively) or through a passive shopfront.

## 2. Core loop

1. **Smelt** — passively generate metals over time.
2. **Explore** — spend metals to move/dash across a fog-of-war grid (Purify mini-game).
3. **Heat** — find hidden traits and play the Heating mini-game to fuse them onto your active blade.
4. **Forge** — pick a weapon shape, customize its look, and complete the sword into your Vault.
5. **Sell** — fulfill NPC requests for Gold + Reputation, or list swords in the passive Shop. Customers arrive **7 per day**; after the day's 7 are handled, tap **End Day** to advance to the next day (see §6 *Day system*).
6. **Reinvest** — upgrade the Smelter, unlock metals, unlock the Shop, save Blueprints, or reset the map.

## 3. Grid & movement

> ⚠️ **V1 only.** §3 describes the free 8-direction fog-grid of `index.html`. In the canonical build
> (`swordforgeV2.html`) the front half of the loop is the **station loop** in [§3A](#3a-station-loop-swordforgev2html--canonical);
> the code below (`move`, `startInlinePurify`, `renderCell`, the 3×3 pad) is retained but unreachable.

- **Grid:** 50×50 (2500 cells). Player starts at center **(25, 25)**.
- **Vision:** radius 3.5; fog clears in a circle around the player as they move.
- **Hazards:** 20% of cells are explosions (💥), placed by seeded RNG (seed `1337`), never on the center start. **Landing** on one costs **−25 HP** (max 100), a red flash on the cell, and a **warning dialogue box** (`gameAlert`) — *"Avoid the hazard zones! You don't want impurities in your alloy."* (`hitHazard`). It also adds a **−4 gold "impurity" penalty** to the blade being built — **not deducted immediately**, but tallied (`hazardGoldLost`, +4 per hit) and **subtracted from the sword's sale price**. The tally is stamped onto the forged sword (`hazardLoss`) and shown as a red **"−x hazard"** on the forge-result board and the Vault sword-detail view (alongside the green craftsmanship **"+x"**). Damage is only applied to the cell the sword **lands on** — **crossing over** a hazard mid-dash (a 2- or 3-block Purify dash) is harmless, even over multiple hazards in a row. Reaching 0 HP triggers death. A low HP total also **caps the forged sword's quality** (see §4): a battered blade forges a lower-quality sword.
- **Death:** shatters the active blade — clears active traits and used metals, restores HP to 100, and resets the player to center. Crafted swords, gold, etc. are kept.
- **8-direction movement**, each direction costs 1 unit of a specific metal:

  | Direction | Metal | Start state |
  |-----------|-------|-------------|
  | Up | steel | unlocked |
  | Down | iron | unlocked |
  | Left | magnesium | unlocked |
  | Right | bronze | unlocked |
  | Up-Left | titanium | **locked** (50g) |
  | Up-Right | aluminium | **locked** (50g) |
  | Down-Left | blackIron | **locked** (50g) |
  | Down-Right | redIron | **locked** (50g) |

  The 4 cardinal metals are available from the start; the 4 diagonal metals must each be unlocked for **50 Gold** (click the locked grid button).

  **First-craft tutorial lock:** the game starts with exactly **4 steel + 1 magnesium** and everything else gated — only Steel & Magnesium are usable, the other metal buttons, Record Composition, Chart, and passive metal generation are all disabled. This lock lifts the moment the **first sword is forged** (`tutorialMetalLock`), after which generation resumes and all buttons unlock normally.

### Purify mini-game (movement)

Holding a movement button charges a slider that bounces 0↔100 (speed `0.15`). Releasing resolves the dash distance by where the slider stops:

| Slider position | Dash distance |
|-----------------|---------------|
| 40–60 (center) | 3 blocks |
| 25–75 (mid)    | 2 blocks |
| else (edges)   | 1 block |

Cost: exactly **1 metal** of the direction's type (consumed once, regardless of dash distance). The dash stops early at the map edge. Hazards along the way are passed over harmlessly; only the **final landing cell** is checked for hazard damage (and can trigger death).

While the button is held, a **live path preview** (the green `tile_move.png`) highlights the cells the sword would travel into — 1, 2 or 3 tiles in the move direction — updating in sync with the slider's current zone, and clamped at the map edge. It clears on release, and the actual dash matches the previewed distance. The preview is a **~50% translucent overlay** (`tile_move.png` laid over the cell's real tile), so the tile underneath — hazard, home, path, or a trait glyph — still shows through.

**Hover directional hint (desktop):** on mouse-hover over any of the 8 direction buttons — *before* pressing — the cells the sword would move into light up with `tile_movepath.png` (a distinct tile from the green held-move preview). It shows **1 tile before the Purify dash is unlocked** (moves are single-block then) and **3 tiles (the max dash) after**, in that button's direction, clamped at the map edge. Like the held-move preview, it's a **~50% translucent overlay** over the cell's real tile, so the underlying tile (hazard, home, path, trait) shows through. It appears for **all 8 buttons including locked diagonals** (a "where would this go" hint), and clears on mouse-leave or the moment a move starts. Touch has no hover, so this is a mouse-only affordance; the held-move preview above covers touch.

**Cancel a held move** (no movement, no metal spent) by dragging the cursor onto the **cancel button** that appears in the centre of the 3×3 movement grid while holding, sliding a finger over it, or **right-clicking**.

The slider is **locked during the early guided tutorial** (moves are single-block) and unlocked when the tutorial reaches the chart/slider lesson (also unlocked on first craft as a fallback); once unlocked it stays available for the rest of the game.

## 3A. Station loop (`swordforgeV2.html` — canonical)

The presentation-pass front half. Implements the verb mapping in
[`2026-08-10-core-loop-potioncraft-mapping.md`](2026-08-10-core-loop-potioncraft-mapping.md) §2–3:
an ore **plots** a route, the crusher **lengthens** it, the smelter **commits** it, the anvil **travels** it,
water **pulls back to centre**, fire **locks a trait in**. Everything from the Forge button onward (§5) is unchanged.

- **World & cells.** The map is the SVG path board (1400 × 980 world units). The route lattice is
  **28-unit cells → 50 × 35**; the ingot starts on the cell under `V2_START` (25, 19) and "centre" is the cell
  under `V2_CENTER` (25, 17). Cell index = `cy * 50 + cx` (`orePathDefs`, `plannedPath`, `committedPath`, `pathPos`).
- **Ore = route shape.** Each of the 8 metals owns a shape in `orePathDefs`: 10–11 `{dx,dy}` cell steps that
  curve toward that metal's quadrant (steel = long north-bending arc, iron = south hook, magnesium = west
  zigzag, bronze = east sweep, titanium/aluminium/blackIron/redIron = NW/NE/SW/SE curves). Picking an ore
  plots `plannedPath` **from the ingot's current cell**, clamped at the map edges. Re-picking replots freely;
  nothing is spent until the smelter commits.
  - **The ore picker shows the route, not a bearing.** Each tile in `#pc-picker` carries four things, all
    computed **live** on every render (`pcRenderOrePicker`): an **inked mineral silhouette** (`PC_ORE_GLYPH`,
    filled with the ore's own `PC_ORE_COLORS` tone), a **thumbnail of the actual plotted route**
    (`pcRouteThumb` — the same `pcPathFrom` cells and the same `pcSmoothD` Catmull-Rom the map draws, inked in
    the map's own halo + dashed-ink language, fit to a 42×30 box, with a start dot and either a trait-node
    disc or a destination ✕), a **destination line**, and a **stock badge**. Nothing here may be tabulated:
    the ore→trait mapping does not exist as a table (crush-1/crush-2 sites are dealt at runtime in
    `initV2Map`, and every route is plotted from the live `pcIngotCell`), so the destination is a live
    `pcTraitAtCell` lookup against `v2traits` by end cell. **The fog is respected**: an undiscovered site
    reads `? unknown` and is never named until `site.discovered` flips. Shape carries ore identity because
    colour cannot — six of the eight `PC_ORE_COLORS` tones are under 9% chroma and titanium/magnesium are
    0.8 percentage points apart in lightness, so the palette separates the ores by lightness alone.
  - **The picker's vertical offset is derived, never a constant.** `.pc-picker`'s `bottom` is
    `calc(var(--pc-status-h) + 98px)` at load and is re-derived from live geometry (`#pc-stations`'s
    `offsetTop` within its `offsetParent`, + 6px) every time `pcToggleOrePicker` opens it. Both produce
    140px and a 5.5px gap above the station row. **They must stay in step** or the panel jumps on first open.
- **Traits sit on route ends.** `PC_CENTRAL` pins Balanced/Durable/Sharp/Heavy/Flexible to the **uncrushed**
  end of the steel/iron/magnesium/bronze/blackIron routes (one ore reaches them); `PC_STACKED` pins Flame
  (steel → aluminium), Ice (titanium ×2) and Water (redIron ×2) to two-ore stacks, always on their
  **uncrushed** ends. Every trait site is **snapped to the route lattice**, so the cell the ingot lands on and
  the node it stands under are the same point (no visual offset between marker and site).
- **Crusher = reach, and every grind lands.** Each press repeats the shape's **last two steps**; the cap is
  **`PC_CRUSH_MAX` = 2 presses** (`pcCrushMax`), because each central ore also has a trait site pinned to its
  **crush-1 and crush-2 endpoints**, so all three grinds of an ore end on a trait and crushing is a real
  choice (Potion Craft: grind finer, travel further), never a way to overshoot the trait onto a dead cell.
  Those 10 extra sites are dealt from the remaining catalog **in catalog (tier) order to endpoints sorted by
  distance from the centre**, so the longer grind lands the later-tier trait, and trait value keeps its single
  formula (`v2traitValue` = distance from centre / 6, clamped 5-100), so a farther endpoint also pays more.
  Worked example (steel): crush ×0 → ⚖️ Balanced 26g, ×1 → ✨ Grace 35g, ×2 → 👑 Noble 45g. Iron is the one
  ore whose shape hooks back toward the centre, so its crushed ends pay slightly *less* (32 → 27 → 26) while
  still opening different traits. That follows from the distance formula and is intended, not a special case.
  Crushing is only available before the commit.
- **Smelter.** Commits: spends **1 unit** of the planned metal (`availableMetals` −1, `usedMetals` +1, so it
  lands in the forged sword's recipe), copies the plan into `committedPath`, resets `pathPos` to 0 and clears
  the plan. The slot **morphs**: it is the Smelter whenever a plan is on the map and **Bellows** the rest of
  the time, so a heat control is always reachable (including before anything is plotted). Each verb has its
  own painterly icon — `assets/ui/icon_smelter.png` as the Smelter, `assets/ui/icon_bellows.png` as the
  Bellows — swapped by `pcUpdateStations`. Both `<img>`s carry `onerror="this.remove()"`, so a missing PNG
  leaves the 🏭/💨 emoji fallback un-hidden **for that verb only**; the medallion is never empty. Crush and
  Quench now carry the same fallback pair (🪨 / 💧); Crush's `onerror` chains `stamp_mill` → `grindstone` →
  emoji. The emoji fallback keeps `position: relative; z-index: 1` so the medallion `::before` (an
  absolutely-positioned `z-index: 0` box) can never bury it — verified with every image request aborted.
- **Temperature (0–100).** Bellows tap = **+12**; decays **2/sec** (`pcTempTick`). Shown on the **forge scale**
  (the inked gauge above the map) and on the **ingot marker itself**, which reads ember + glow at ≥70, dull
  orange at 35–69 and cold iron below 35, so the fast/precise trade is legible on the map. Tapping the furnace
  bellows art does the same thing.
  - **The forge scale draws four numbers, and they are a hand-mirrored copy of the constants — not derived.**
    The `.pc-temp` track paints the three `pcStepSize` regimes as progressively darker ink washes split at
    **35%** and **70%**, labels their midpoints **×I / ×II / ×III** at 17.5% / 52.5% / 85%, and marks the
    `PC_POUR_TEMP` gate with an ink notch at **40%**. `pcSetTemp` (and `pcResetRun`, which bypasses it) write
    `data-zone = pcStepSize()` on the gauge to light the live band. **If `PC_POUR_TEMP` or the 35/70
    thresholds in `pcStepSize` are ever retuned, the CSS percentages in the `.pc-temp` block and the two
    `.pc-temp-mark` inline `left:` values must move in lockstep** — nothing computes them.
- **Pour.** Needs **temp ≥ 40** and a committed route. Flings `assets/forge/Metal.png` from the furnace mouth
  to the marker; the ingot now exists and the anvil is live. Pouring happens once per blade — later commits
  in the same run reuse the same ingot.
- **Anvil = travel.** Each strike advances along `committedPath` by a **temperature-scaled** number of cells:
  **≥70 → 3, 35–69 → 2, <35 → 1**. Cells are walked one at a time (150 ms apart) so travel reads; **every**
  cell is checked, so nothing is hopped over. Each landing reveals fog, marks the travelled trail, and runs
  the map's hazard / trait checks. At the end of the route the anvil reports **"path exhausted"** — quench,
  smelt another ore, or fire the trait you are standing on.
- **Quench.** Pulls the ingot **3 cells in a straight line toward the centre cell** (one cell at a time) and
  drops temperature by **30**. It takes the ingot off its route, so the remaining route is dropped — plot a
  fresh ore from wherever the water left you.
- **Fire.** Enabled only while the ingot stands on a trait it has not already fused. It runs the **existing
  heating mini-game** (`initiateHeatSequence`, §4) unchanged — the trait fuses on success, at the quality
  that mini-game decides. (In the pre-station V2 build the trait auto-fused on contact; that path is gated
  behind `pcStationMode`.)
  - **Arming is positional, not cached.** Both the Fire button's enabled state and the press itself resolve
    the trait from the ingot's **live cell** (`pcTraitHere` — nearest trait site within `V2_TRAIT_R` = 30 world
    units of the cell centre), then adopt it into `mapTraitOn` / `mapTraitValue` (`pcArmTrait`). The flag set
    during travel by `v2onSwordMoved` is only a fast path; it is never the authority. A route that ends on a
    trait therefore locks that trait **every** time, regardless of how the travel ticks landed.
  - `resolveInteractiveHeatMinigame` bails when there is no `pendingHeatTrait` (stray resolve / cheat-skip),
    instead of fusing a malformed trait.
- **Stacking loop.** After a trait fuses, pick another ore — the new plan starts from the ingot's current
  cell — and the next smelter commit replaces `committedPath`. Traits stack on the blade as before.
- **Forge = point of no return.** The full-width **Forge the Blade** button enters the existing pipeline (§5)
  and re-labels itself *Resume Forging* while a forge is paused. After `completeForge` the run resets
  (`pcResetRun` via `v2ResetSword`): route, trail, temperature and ingot cleared, marker back to the start cell.
- **Route rendering.** Both layers are authored SVG ink drawn **above the fog**, so a plotted route reads
  through unexplored ground, and both are **clipped to the padded sheet** (`#v2mapClip`) along with the marker.
  The plan (and the committed remainder) is a single **dashed Catmull-Rom curve** through the cell centres with
  an arrowhead at mid-length and an **✕ on the destination cell**; the travelled part is a **solid inked
  stroke** plus a low-opacity offset under-stroke, redrawn on every landing. Cell centres are control points
  only: the route never shows lattice squares or elbows. Every stroke carries a **pale halo under-stroke**
  (`PC_HALO`) so ink still reads over the darkest terrain in the illustrated map.
  - **The trail is the record, and it ends at the ingot.** `pcDrawTrail` redraws from the recorded landed-cell
    sequence `pcTrailCells` (quench hops included) and cuts it into **sub-paths wherever two landings are more
    than one lattice step apart**, so a hop can never be smoothed into a straight chord across the map. A
    **retrace** (quench dragging the ingot back down cells it just walked) *rewinds* the ink (`pcAddTrail`
    pops instead of pushing), so the trail never leaves a stub pointing past the marker to nowhere.
- **Map surface: parchment edge to edge.** The base is a **seamless parchment pattern** (`assets/map/parchment_tile.png`,
  falling back to flat `#d8c8a0`) on a rect that extends **700 world units past the world on every side**,
  further than the pan/zoom clamp can ever reach, so there is no reachable sheet edge and no black void. The
  illustrated sheet (`assets/map/map_parchment_v2.png`, falling back to `map_parchment.png`, then to the
  procedural mottling) is composited on top through a **radial feather mask**, dissolving into the base instead
  of ending on a hard alpha edge. Every art layer is load-probed; the board boots identically with none of the
  PNGs present.
  - **VALUE CONTRACT — the map is light parchment with dark ink on it, and these are the numbers.** The
    shipped `map_parchment_v2.png` is a **dark painting** (mean relative luminance Y **0.22**), not a parchment
    sheet; Potion Craft's alchemy map sits at Y **0.42–0.48**. Three knobs bring it to parity and they are
    tuned **together**:
    1. **`filter#v2artLift`** — an `feComponentTransfer` gamma (exponent **0.7**, offset 0.02) on
       `#v2groundArt`. **`color-interpolation-filters="sRGB"` is REQUIRED**; the SVG default (linearRGB) makes
       the same exponent read far too bright. A gamma is used instead of a heavier scrim because it raises the
       paper while leaving the painted ink dark — a flat scrim strong enough to hit the target costs tonal
       range.
    2. **`PC_ART_SCRIM` = 0.18** (was 0.34) over `#v2scrim`, now filled `--sf-parch` `#efe1bd` (was
       `--sf-card`). With the gamma doing the lifting, the scrim's only remaining job is a warm parchment tint.
    3. **`#v2fog` = `--sf-haze` `#7a4f26` @ 0.52** (was `#33240f` @ 0.90). The old wash kept ~10% of the
       terrain signal — about 97% of the illustration destroyed. At 0.52 it keeps ~48%. **Do not take the fog
       fill below Y 0.10**: an opaque dark marker (the cold-iron marker stroke `#20202a`) stops clearing 3:1
       unaided once a fogged cell drops under Y 0.145.
    - **`radialGradient#v2artFadeGrad` is `r=88%` with the plateau at `85%`** (was 52%/60%). At 52% the sheet
      was 90% dissolved at the mid-left/mid-right world edge and gone in the corners — inside pannable
      territory, so panning revealed a *brighter, emptier* ring than the middle. At 88% the whole 1400×980
      world carries the illustration and the dissolve lives only in the 700-unit padding, which `v2setView`'s
      clamp already makes unreachable.
    - **Reveal-frontier trade.** With the fog lifted, explored vs unexplored separate by only ~1.4:1 in
      luminance, so the frontier is now carried by **edge definition** — `filter#v2fogSoft` tightened from
      `stdDeviation` 17 → **11**. If exploration stops reading in playtest, **tighten the blur to 8 before
      raising the fog alpha**; every step of alpha buys separation at a fixed cost in terrain visibility.
  - **LEGIBILITY INVARIANT: every map marker must hold ≥ 3:1 against its own cell on at least one boundary.**
    Two structural rules make that unconditional rather than a function of how the ground is tuned:
    **(a) game objects draw ABOVE `#v2fog`** — the route layers already did; **`<g id="v2traits">` now does
    too** (an undiscovered `?` is a game object, not terrain; under a uniform wash a node and its background
    compress together and no achievable fog alpha keeps them apart). **(b) the trait node's pale rim is
    OPAQUE** (`PC_HALO`, `stroke-width` 2.8, opacity 1 — was 2.4 @ 0.6). The node has two boundaries against
    the ground: the ink ring `#4a3826` clears 3:1 whenever ground Y ≥ 0.233, and an opaque pale rim clears 3:1
    whenever ground Y ≤ 0.232. The two intervals cover the whole range, so best-of-boundary ≥ 3:1 for **any**
    ground luminance, forever.
  - **The old `#v2vignette` rect is deleted — it drew nothing.** Its gradient used objectBoundingBox units on
    a 2800 × 2380 rect, so its first non-zero stop sat past world x > 1902 / y > 1464, while `v2setView`
    clamps the viewBox inside the 1400 × 980 world. A world-anchored gradient cannot frame a pan/zoom
    viewport. The frame vignette is now **`#v2vig`, a CSS overlay in SCREEN space** (`z-index: 3` — above
    `#v2board`, below `#v2furnace` at 4), which is pan- and zoom-invariant and needs no JS. Its outer stop is
    capped at **0.20**: it sits over the whole board and dims markers and ground together, so raising it past
    ~0.24 eats the 3:1 budget above.
- **Trait sites speak the ink language.** Each site is a parchment-cored disc in a dark ink ring with a dashed
  hairline and an opaque pale rim (readable over any terrain): structurally unlike the two-stroke destination ✕.
  While the ingot is inside a site's snap radius the site is **armed**. Undiscovered sites carry `?`,
  discovered ones the trait symbol.
  - **The armed ring is GILD and sits OUTSIDE the marker's bloom — both are load-bearing.** `pcMarkGlow` is
    r19 `#ff7a2a` @ 0.6 under `feGaussianBlur` σ=9, i.e. ~37 world units of visible spread. The old armed ring
    was r24 in ember `#ff8f33`: inside that bloom, in the same hue, so at opacity 0.95 it still fused into
    "the ingot is glowing" and the armed state was not readable. It is now **r48, dashed, `--sf-gild`
    `#c8a84b`**, on a pale `PC_HALO` under-ring, and both breathe together. **Do not drop the radius below
    40** — that is where it re-enters the bloom and the bug returns. Gild is also the game's value colour,
    which is what armed means: *this site is worth N gold, Fire to lock it in*.
  - **An armed site also shows an offset trait cartouche** (`.pc-trait-badge`, ±34 world units, flipped inward
    near the world edge). `pcAdvance` snaps the marker exactly onto the site centre, and `pcMarkBody` is a
    34 × 26 rect, so the marker **completely covers** the node's r16.5 parchment core and its glyph — the ring
    says *a site is armed*, the cartouche says *which one*. It is created hidden and revealed only by
    `pcArmVisual`, the single arm/disarm point, so it can never desync from the ring.
- **Terrain marks: hazards are hatched ground, and the green dots are gone.**
  - **Hazards (18) are a drawn map symbol, not a filled disc.** They were two opaque circles (`#3a2b1b` with a
    `#211710` ring and a `#241a10` core) up to 56 screen px across — nearly twice a trait node — which read as
    holes punched through the sheet and looked like a rendering fault whenever the viewport bisected one. They
    are now built from the **same five-layer recipe as a trait node** (offset ink shadow, pale halo rim, core,
    inked outline, drawn glyph) but ragged instead of round and **hatched instead of filled**
    (`pattern#v2slagHatch` — parchment `--sf-parch-dk` under ink `--sf-ink` cross-hatching), so the
    illustration reads through them: the cartographer's fill for bad ground. Colour is `PC_INK` /
    `PC_INK_DARK` / `PC_HALO` only — three off-token literals left the file and none entered.
    **Placement and damage are byte-identical**: the jitter comes from a local LCG seeded on the hazard index,
    **never `v2rand`**, so the seeded stream is untouched and the same 18 positions/radii (and therefore the
    same iron / titanium / redIron route incidence) survive. Each hazard still costs **−25 HP and −4 gold**.
  - **The 12 green "skill" dots are DELETED** (behaviour change). They paid `v2Skill`, which has **no HUD
    readout** (`#v2-skill` does not exist in the document) and no gameplay effect, and they were sampled off
    the **retired** `V2_ORES` beziers rather than the `pcPathFrom` routes the player actually travels — 15 of
    the 24 reachable routes passed one only by accident. They also carried the file's only `#5c7d3a` and
    `#9be04f` (neon lime) literals. `v2Skill`, `V2_DOT_R`, `v2dots` and the empty `<g id="v2greenDots">` are
    left in place as inert scaffolding so every existing reader stays valid.
- **The furnace lives in the world.** It is a DOM sprite over the SVG board, so `v2setView` translates it
  against the camera (`v2syncFurnace`), anchored to `V2_START` (the same point the trail leaves from) against
  the baseline the initial view puts that anchor at. It pans and zooms with the map instead of floating over
  it; at the default view its transform is identity, so the chimney/trail alignment is unchanged. A
  `ResizeObserver` on the map box re-runs `v2setView`, so a stale aspect can never letterbox the board.
- **Feedback register.** Core-loop nudges — path exhausted, nothing plotted, too cold to pour, no trait under
  the ingot, out of a metal — go to the inline status line with a highlight pulse (`pcNotify`). `gameAlert`
  is reserved for genuinely blocking errors, and any open `gameAlert` is closed on a screen slide and when
  the forge pipeline starts, so a notice can never sit over a later scene.
  - **The ribbon is a FIXED two-line slab, and that is load-bearing.** `.pc-status` is an inked-parchment
    plaque of exactly **`--pc-status-h` = 42px** (2 × 13px × 1.3 + 6px padding + 2px border = 41.8), set in
    **Lora 13px** so the one place in the UI that writes whole sentences reads as prose rather than an eighth
    row of Cinzel station labels. It was previously auto-height (`min-height: 14px`): because `#v2map-wrap`
    is `flex: 1 1 0`, a message that wrapped to two lines stole 13.5px **from the map** and jerked the whole
    station row up under the player's thumb mid-loop. The fixed slab costs the map ~28px permanently
    (407.5 → 379.5px at the reference frame, still 179px above `#v2map-wrap`'s 200px floor) and buys a map
    height and station-row position that do not move for any message.
  - **COPY BUDGET — check this before adding a `pcStatus`/`pcNotify` string.** The box holds **two lines of
    ~318px**, i.e. roughly **85 characters** (~505px natural at these metrics). The current worst case is the
    82-character path-exhausted nudge in `pcAnvil`. A third line is eaten silently by `overflow: hidden`.
    If copy must grow, drop `.pc-status` to `font-size: 12px` before raising the token — and if the token or
    the font metrics change, **`--pc-status-h` must change with them**, because `.pc-picker`'s `bottom`
    derives from it (above) and the clip failure is invisible.
  - **The pulse never moves anything.** `pcStatusPulse` animates border-colour, wash and glow only. It used
    to animate `transform: scale(1.08)`, which blew the 340px block out to 367.2px — 3.6px past
    `#mobile-wrapper` on **both** sides, and the wrapper is `overflow: hidden`, so every notification visibly
    shaved both ends of the line. The ink also stays put: the old colour swap to `#ffd76a` measured 1.10:1
    against the sheet, i.e. the attention state was **less** legible than rest.
- **Metals.** The 8-metal economy of §3 is back in use: `availableMetals` with passive generation
  (`startMetalGenerator`). The presentation build boots with all 8 unlocked and 8 of each.
- **Boot.** The build opens straight on the forge screen with both tutorials skipped
  (`tutorialStep = tutorialFlow.length`, `v2tutSkip()`); the cheat panel's *Skip Tutorial* still works and no
  tutorial code was removed.
- **Not carried over from the drag-dock build:** charcoal/limestone fuel, the fuel gauge, hold-to-travel
  bellows, and drag-and-drop ore plotting. That dock is still in the DOM but hidden.

## 4. Traits & heating

- **24 base traits**, each at a fixed coordinate on the map (see `traitCoordinates` in code). Examples: Durable 🛡️, Cursed ☠️, Flame 🔥, Celestial ☄️, Dark 🌑.
- **Discovery:** stepping onto a trait cell reveals a `❓`; heating it reveals and fuses the trait.
- **Value scaling:** a trait's base value = `floor(distance_from_center / 35.355 × 100)` (0–100). Farther from center = more valuable.
- **One-per-blade:** a given trait ID can only be fused onto the active blade once.

### Heating mini-game

Triggered by the **Heat** button while standing on a discovered trait. Interactive forge sequence:

1. **Pulley** — tap to lower the bucket (2s animation).
2. **Bellows** — **tap or hold** to pump heat. Each tap adds `+16` heat; **holding** raises heat gradually (`+40`/sec while held). Heat decays at `18`/sec, so holding nets ~`+22`/sec.
3. **Stabilize** — keep heat in the **green zone** for a cumulative **stabilize time**. Above the zone = "Too Hot", below it shows "Use the bellow to heat the furnace." (both bleed stabilization progress). The green band's position/width and the timings **vary per trait** (see below); the default (and every tutorial heat) is zone **40–70**, **2.0s**, decay `18`, pump `+16`.

**Per-trait heating variants:** every trait has a unique heating minigame, all built on the same engine via `heatConfigs` (the coloured band(s) on the meter move to match). Tutorial heats always use the default band so onboarding stays easy.

- **Static tweaks (Tier A):** Flame high band (70–90); Ice low (8–28, gentle, harsh overheat); Floral low/delicate (24–44); Sharp very narrow (50–62); Balanced narrow centre (44–56); Fury fast decay + quick stabilize; Durable wide band + long hold (3.5s); Endurance slow decay + long hold (4.5s); Heavy sluggish; Cruel band hugging the overheat edge (60–72); Grace narrow + quick (1.0s); Blood decay grows with heat.
- **Dynamic / random (Tier B):** Water, Celestial, Flexible — the band **oscillates** (different centres/speeds); Storm — random **gusts** shove the heat; Savage — the band **jitters** to random spots; Luck — **two** random bands, stabilize in **either**; Accurate — narrow band that **repositions once**; Cursed — band **jumps** repeatedly + heat spikes.
- **Sequential / hidden (Tier C):** Noble — stabilize a **low then a high** band; Honor — stabilize the **same band twice**; Lightning — a **fast two-strike** (narrow, fast decay, twice); Dark — the marker **flickers hidden** (forge by feel). Between stages the heat is knocked down so each stage is re-earned.

**Guidance cues:** the part to act on pulses with a glow and a bouncing hand points to it — the pulley first, then (after the bucket lowers) the bellows.

On success the trait fuses onto the active blade and a **"`<symbol>` `<name>` trait acquired"** toast appears (game-wide, not tutorial-only). During the tutorial this toast shows first, then the post-heat dialogue follows after a short delay.

**Heat timer → quality.** A countdown runs during the heating (bellows) phase, its length **per trait** (`heatTimers`; e.g. Grace 7.5s, most static traits 9s, dynamic/staged ~11s, Durable 11.5s, Endurance 14s; **tutorial heats get a safe 45s**). **Stabilize before the timer ends → the trait fuses at `Epic`.** If the timer runs out first, the trait still fuses but at `Fine` (one tier down) — no hard failure. The remaining time is shown as a `⏱` readout **right below the heat slider**.

### Quality tiers

Three tiers, low→high: **`Weak` (+0) · `Fine` (+10) · `Epic` (+20)** value bonus (added to the trait's distance-based base value; each trait stores `baseValue` + `quality`). The final quality is the result of a **four-stage chain**:

1. **Heat outcome** (Epic/Fine above), then
2. **capped by the blade's HP** at forge time (see §3): HP ≥ 80 → Epic allowed, 40–79 → capped at Fine, < 40 → Weak (`min(heat outcome, HP cap)`), then
3. **dropped by the hammer penalty** from the Hammering mini-game (see §5): **−1 tier per 2 misses** (`⌊misses / 2⌋` tiers), then
4. **dropped by the over-honing penalty** from the Sharpening mini-game (see §5): finishing in the **90–110% "keen" window** costs nothing, but grinding past **110%** over-hones the blade for **−1 tier per 10% over** (`⌈(pct − 110) / 10⌉` tiers).

Weak is the floor. The hammer and sharpen drops are combined (`⌊misses / 2⌋ + over-hone tiers`) and applied together. For a **manual forge** the chain runs per trait (each trait keeps its own heated quality through the cap, then the shared hammer + sharpen drop). For an **Auto-Craft** there is no HP cap (no exploration) and a single heat + hammer + sharpen performance sets **one uniform quality across all the sword's traits**. The forged sword's overall quality = its highest-tier trait, which drives the quality overlay (see §5).

## 5. Forging & weapons

- **Requirement:** at least one **heated trait** on the active blade — the Forge button is disabled until a heating minigame has fused a trait. Also requires ≥1 metal spent (by moving).

Forging runs as a **pipeline of steps** — shape select → hammer → *quench (non-fire only)* → design → sharpen (`forgeSword` for a manual forge; Auto-Craft prepends a heat minigame — see §6):

- **Pause / resume (Close):** every stage's modal has a **Close** button (`closeForge`) that hides the pipeline **without discarding it** — the in-progress forge (`forgeCtx`) stays alive, paused at the current stage. Clicking **Forge** again (`resumeForge`) drops the player straight back into the stage they left, with all earlier stages and in-progress choices remembered: the tentative blade pick (shape), the visual stage + point + accumulated misses (hammer), the chosen fittings (design), and the grind % (sharpen). While a forge is paused the **Forge button stays enabled** so it can reopen the pipeline. A forge is only cleared by **completing** it. *(Auto-Craft's leading heat step is the exception — its "Cancel Forging" still aborts the whole pipeline.)*

**Part 1 — Shape select.** A modal (with the player's **available gold shown at the top**) shows the 10 blade **shapes** only (no fittings), each tile labelled with the **blade's name** below it. Pick one and hit **Continue**.
- **Shapes (10):** Shortsword, Longsword, Broadsword, Katana, Rapier, Cutlass, Claymore, Saber, Scimitar, Machete. *(Original GDD listed 11 incl. Dagger — Dagger is not in the build.)* For the base (balanced) set, only **Shortsword, Longsword, Broadsword are free**; the other **7 are locked and unlock for 50 gold each** (click the locked thumbnail). Unlocking one pops a celebratory **"&lt;shape&gt; unlocked"** box (e.g. *"Katana unlocked"*) with the blade's art — styled like the "New Trait Discovered!" popup (`showNewShapeModal`, `#newShapeModal`). Trait-skinned blade sets (e.g. Flame) are not locked, and a skinned trait limits the shape list to that skin's blades (Flame → 3 shapes; Ice/Water → Longsword only).

**Part 2 — Hammering mini-game.** A top-down **ingot** (`assets/hammer/ingot.png`) is shown; the player hammers it into the chosen shape by hitting **6 targets across 2 stages**. Each target appears one at a time as a small **shrinking ring** — click it within **~0.65 second** (`HAMMER_RING_MS`), before the ring fully shrinks, or it counts as a **miss** (the tutorial keeps a slower, gentler ring, `HAMMER_RING_MS_TUTORIAL`). A successful hit throws a green **"Perfect!"** that pops at the strike point and arcs out of the stage while fading (`spawnPerfectText`). Stage A: 3 targets on the ingot → the image changes to a **mid-forged blade** (`assets/hammer/balanced_<shape>_midblade.png`; only Shortsword/Longsword/Broadsword have mid art — the other 7 shapes reuse the Longsword mid as a placeholder). Stage B: 3 targets (tip + sides) → the image resolves to the finished blade, then the design step opens. The mini-game always completes (no fail/soft-lock); **misses only cost quality** (−1 tier per 2 misses — see §4). Every **successful hit also adds +1 gold** to the sword's craftsmanship bonus (`hammerHits`, paid on sale — see §6). Tutorial/Auto-Craft-in-tutorial heats keep an easy, slow ring.

**Part 2.5 — Quench (cooling).** For any blade **whose last-acquired trait is not `flame`**, a cooling beat runs after hammering (a fire blade skips it and goes straight to design). The finished blade is shown glowing warm above a **water bucket** (`assets/forge/water_bucket.png`) on the forge scene (`assets/backgrounds/forge_bg.png`); the player **taps to dip** it, the blade slides into the water (steam rises, the glow fades to steel), **soaks for 3 seconds**, rises back out, and the design step opens automatically. **Feel-only — it has no effect on quality or value.** During the tutorial a bouncing hand points to the blade. (`openCoolModal`/`dipBlade`/`finishQuench`; `#coolModal`.)

**Part 3 — Design Desk (fittings).** Customize the sword across 3 part categories — **Grip, Guard, Pommel** — each with selectable art. Purely cosmetic. The **blade is fixed** from Part 1 (shown in the preview, not editable — the Blade tab is gone). An **info (i) button** toggles a hint reminding the player that looks don't affect properties. The **Sharpen** button advances to the sharpening step (Part 4).

**Part 4 — Sharpen (grindstone).** The finished sword — **fully assembled** (blade + grip + guard + pommel as chosen in the Design Desk) — lies horizontal across a front-facing **grindstone** (`assets/forge/grindstone.png` in its wooden stand, on `assets/backgrounds/sharpen_bg.png`). **After a 2-second delay the wheel begins spinning** — a motion-blurred frame (`assets/forge/grindstone_spin.png`) fades in over the still stone and is jittered in place — and **keeps spinning until the player finishes**. The player **slides the sword left↔right across the stone** — with the **joystick** below the stage (drag the knob left/right; the further from centre, the faster it grinds; it springs back on release — `#sharpen-joystick`/`#sharpen-knob`), by dragging the sword directly, or with the ←/→ keys; the blade sweeps nearly the full width each way (`SHARP_TRAVEL`). Travel fills a **sharpness bar 0 → ~120%**, and sparks fly at the contact point while grinding. Zones: **0–90%** "keep sharpening" (Finish locked) · **90–110%** green "keen edge" window (Finish enabled, the player decides how sharp — **no quality penalty**) · **>110%** red "over-honed", which drops quality (**−1 tier per 10% over** — see §4). Sharpen accuracy also grants a **craftsmanship gold bonus** (`sharpenGoldBonus`, paid on sale — see §6): **+3** for finishing at **95–105%**, **+2** for **90–95%** or **105–110%**, **+0** past 110%. The **95–105% "perfect" band is marked in gold** on the meter (`.sharpen-goldzone`) so the player can aim for the +3 zone. **Finish Sharpening** locks in the result and completes the forge → the **"Forging Complete!" board** (with **Add to Vault**) appears. Closing here (like every stage) pauses the forge rather than aborting it (see the pause/resume note above). During the tutorial a bouncing hand slides over the blade. (`openSharpenModal`/`sharpenGrind`/`finishSharpen`; `#sharpenModal`.)

- **Trait-specific part art:** a sword carrying a trait with a defined skin shows that trait's part images in the shape select, Design Desk, and everywhere it's rendered (forge result, etc.). Defined in `traitSkins` and resolved via `partsFor`/`designPartSrc`. Currently the **Flame** trait has a full set: 3 blades (Shortsword/Longsword/Broadsword), 3 grips, 5 guards, 2 pommels (`assets/sword-parts/*/flame_*.png`). **Ice** and **Water** have lean skins: 1 Longsword blade + 1 grip + 1 guard + 1 pommel each (`ice_*` / `water_*`), so an Ice or Water sword forges as a Longsword with that trait's parts. Traits without a skin fall back to the base library.
- **Completion:** moves the finished sword (shape, design, traits, recipe of used metals, value) into the **Vault** (inventory), clears the active forge, and resets player to center with full HP.

### Sword value & tiers

- **Value** = sum of fused trait values (base distance value + quality bonus — see §4). A sword with **zero traits = 5g** base.
- **Tiers** by value: I Common (<30), II Uncommon (<60), III Rare (<90), IV Epic (<120), V Legendary (≥120). *(Value tier is distinct from trait **quality** Weak/Fine/Epic.)*
- **Quality overlay:** both the **Design Desk preview** and the **forge-result** render layer a transparent overlay over the sword based on its overall quality — **cracks** (`overlays/crack.png`, hugging the blade) on a **Weak** sword, **sparkling stars** (`overlays/sparkle.png`) on an **Epic** one; **Fine** gets neither. In the Design Desk the overlay reflects the *projected* quality — heat outcome → HP cap (manual only) → hammer penalty (see §4) — since by Part 3 the heat and hammer results are already known. It does **not** include the Part 4 sharpening penalty (which happens after design), so it is an optimistic projection that a later over-hone can still lower; the **forge-result** overlay reflects the final quality.

## 6. Economy

### Smelter
- Generates metals passively on a **10-second tick** (only after the tutorial; generation is locked during it). Base **1 metal per tick** (1 metal / 10 s).
- **Only unlocked metals are generated** — the 4 cardinals (steel/iron/magnesium/bronze) always, plus any diagonal metal that's been bought (50g). Locked diagonals do not accumulate until unlocked.
- **Lowest-first priority:** each metal generated is added to the **lowest-count metal** in the pool (ties broken randomly) as long as any pooled metal is **below 5**; once every pooled metal is at 5+, the metal is chosen uniformly at random. So a depleted metal is topped back up to 5 before generation spreads out.
- Upgrade for **50 Gold** per tier → **+1 metal per tick** each, infinitely.

### NPC customers (active selling)
- Requests are scripted then randomized:
  - **Request #1:** "any weapon" — any sword works; pays at least **15g**.
  - **Request #2:** scripted **Flame** 🔥 trait request. (During the tutorial, this customer is held back until the player dismisses the post-sale dialogue, then summoned manually.)
  - **Request #3:** scripted **ice-dragon** customer — asks indirectly for a sword "weak to heat" (resolves to the **Flame** 🔥 trait); the tutorial uses this customer to teach crafting from a recorded composition via the Recorded Compositions **Craft** button.
  - **Request #4+:** random trait (from the 8 closest-to-center traits while `requestCount ≤ 10`, then from all 24). **10% chance** to also demand a specific shape. **Customer #4 never requests Flame** (it's excluded from that one customer's pool) so the record-reminder box (below) points the player at a genuinely new trait.
  - **Record reminder (post-tutorial):** the **first time the player completes a heating minigame after the tutorial ends** (i.e. heating customer #4's fresh, non-Flame trait), a one-off box appears — *"Remember to record the composition of each new trait you discover, and keep updating the old ones as you improve."* — followed by a **hand pointer to the Record Composition button** (clears when they open the record box). Shown **once per session** (`hasShownRecordReminder`); if the heat surfaced a "New Trait Discovered!" box, the reminder waits until that box is dismissed. (`triggerRecordReminder`.)
  - **Day 2 opener (Bram returns):** the first customer of **Day 2** is **Bram** (portrait `BramD2.png`), back with a **three-beat story** told one line at a time — *"Thanks to your sword, I was able to defeat the bandits! I fought so hard, the sword broke."* → *"But my talent was spotted and I got recruited as a soldier!"* → *"Can you get me something that won't break so easy-eh?"* Each of the first two beats shows a **Continue ▶** button (after a short read gap) to advance; the **final beat** carries his request and the usual two response options. His request is a **Durable 🛡️ sword** — but his dialogue never names the trait, so the player must **infer** that *"something that won't break so easy"* means the **Durable** trait. (`presentCustomerDialogueSequence`; detected via `currentDay === 2 && customersToday === 0`; `requestedTrait` = the `durable` base trait.)

  **Scripted story customers** (portraits in `assets/customer/`; detected by `currentDay`/`customersToday`):
  - **June** — **Day 1's final customer (#7)** (portrait `June.png`): *"Give me the sharpest blade you have! I must END the monsters who took my husband away from me!"* Accepts a **Sharp 🔪 sword of any shape** (`requestedTrait` = `sharp`).
  - **Roland** — **Day 2's 3rd customer** (portrait `Roland.png`): *"Do you have something that looks Noble? I need it for a very important performance."* Accepts a **Noble 👑 sword of any shape** (`requestedTrait` = `noble`). Alongside the usual two responses he offers a **third option — *"I don't make swords for cosplay."*** (`#btnCosplay`, shown only for Roland via `showCosplayOption`); picking it makes Roland retort *"Ah, just give me one! A real sword is best suited for… extreme performances anyways."* and then re-shows the normal responses (the Noble request stands). (`onCosplayClick`.)
- **Dialogue reveal & responses:** the customer's request line is revealed **word by word** (typewriter, ~110ms/word; tapping the speech bubble skips to the full line). The line types out when the Counter screen first becomes visible for that customer (or immediately if a new customer arrives while you're already on the Counter). Only **after the full line has appeared** do the player's **two response options** fade in:
  - **"I have something for you."** → runs **Search Inventory** (below). Auto-disabled when nothing in the Vault matches the request, so it doubles as a "do I have it?" cue.
  - **"I don't have what you need."** → runs **Refuse** (below).
  The options are hidden while the line is still typing and while a customer is leaving (post-sale/refuse). **Multi-beat customers** (e.g. Bram on Day 2) reveal each leading beat with a **Continue ▶** button after a short read gap (`DIALOGUE_GAP_MS`); the response options appear only once the **final** beat has typed out (`customerLineQueue`/`advanceCustomerDialogue`).
- **Payout** = `max(1, reputation-adjusted value + craftsmanship bonus − hazard penalty)`:
  - **Base value** modified by Reputation: Rep < 0 → **×0.8** (min 1g); Rep > 10 → **×1.2**.
  - **+ craftsmanship bonus** (`sword.craftBonus`, flat, *after* the reputation multiplier): **+1 gold per successful hammer hit** (up to 6) **+ a sharpen-accuracy bonus** (**+3** for finishing at **95–105%**, **+2** for **90–95%** or **105–110%**, **+0** if over-honed past 110%).
  - **− hazard penalty** (`sword.hazardLoss`, flat): 4 gold per hazard tile landed on while building the blade (see §1).
  - Both are baked onto the sword at forge time (`completeForge`) and shown as a green **"+x craft"** / red **"−x hazard"** next to the value on the **forge-result board** and the **Vault sword-detail (sell) screen**. The **customer sale dialogue shows only the final net total** (e.g. value 31 + 9 craft − 4 hazard → *"Here's your 36 gold."*) — no per-component breakdown in the dialogue. The same net (value + craft − hazard, min 1g) is paid when a sword sells passively in the Shop.
  - **First-sale starter stock:** completing the sale to **customer #1** tops every *usable* metal (the 4 cardinals + any unlocked diagonal) up to **at least 5** (`topUpMetalsAfterFirstSale`), so the player isn't stranded at 0 after the tutorial forge.
- **Sale:** +1 Reputation. **Refuse:** −1 Reputation, new customer after ~1.2s. The **"I don't have what you need."** (Refuse) option is **disabled for the first three (scripted) customers** (`requestCount ≤ 3`) so the tutorial flow can't be broken; it enables from customer #4 on.
- **Post-sale feedback + response gate:** on a successful sale the customer reacts with a short line before the gold, e.g. *"Oh! Hot! Here's your 25 gold."* The line is chosen by **prioritizing the trait the customer asked for** (`requestedTrait`), then the sword's first trait, then a random **generic** line (also used for trait-less swords). Each of the 24 traits has its own line (`traitFeedback`), plus 5 generic lines (`genericFeedback`); the scripted **ice-dragon** (tutorial customer #3) keeps its bespoke "You can craft such a powerful sword?" line. **The sold customer then waits at the counter** — instead of auto-departing — until the player taps a single **response button** (rotating between *"Thank you" / "Glad you liked it" / "Take care"*, `saleResponses`). Tapping it summons the next customer (the tutorial advances to its next scripted step; otherwise a random request). **Refuse is unchanged** (no response button; the next customer auto-arrives after ~1.2s).
- **Search Inventory** (the **"I have something for you."** option) finds the sword in the Vault that matches the customer's request and **opens the Inventory modal straight to that sword's detail view** (highlighted), so the **Sell** button is right there to complete the sale. *(A separate one-tap "Craft & Sell" button was removed; craft from a recorded composition via the Recorded Compositions modal's **Craft** button instead, then Sell.)*

### Day system
- The counter runs in **days**. Exactly **7 customers visit per day** (`CUSTOMERS_PER_DAY`); each handled customer counts — **a sale or a refusal both count** (`customersToday`). Once 7 have been handled, **no more customers arrive** until the player ends the day (`maybeSummonNextCustomer` → `onDayFull`): the counter is **cleared completely** — no customer portrait and no dialogue box (both hidden until the next day's first customer, which un-hides them via `setCustomerImage`/`showCustomerLine`).
- **End Day button** (`#btnEndDay`, `requestEndDay`) sits next to the **📦 Available Metals** header on the Forge screen. It's **disabled on day 1 until all 7 are served**; from **day 2 on it's enabled after 3** customers (`EARLY_END_MIN`). Clicking it opens a Yes/No confirm (`#endDayModal`): **ending early** (fewer than 7 served) asks *"Are you sure you want to end the day so soon?"*; **after all 7** it asks *"End the day and go to bed?"*.
- **Day 1 guide:** the moment all 7 are served on day 1, a one-off box — *"Good work! Let's end the day here and go to bed!"* — appears, then a **hand pointer to the End Day button** (since it's on the Forge screen, the pointer first nudges the player there from the counter). Shown once (`shownDay1EndBox`).
- **Confirming Yes** runs a **black fade-out → fade-in transition** (`#dayTransition`, `runDayTransition`) that shows **"Day N"** for the new day at the midpoint, then advances the day, resets the per-day count, and summons the new day's first customer. At the day rollover, **every unlocked metal is restocked by `+DAY_METAL_BONUS` (7)** (`availableMetals[m] += 7`; locked diagonals are skipped, matching the smelter's unlocked-only rule). Otherwise ending a day only advances the day and resets the customer count — Gold, Vault, Reputation, Shop, Blueprints, and the smelter all persist.
- **Day counter:** a **"Day N"** badge (`#day-text` / `#day-text-2`) sits to the **left of the gold/reputation pill** on both the Counter and Forge screens.

### Quests
- A **quest tracker** lives in the **top-left corner of the Counter screen**, shown collapsed as a single **📋 emoji button** (`#questToggle`); tapping it expands a panel (`#questPanel`) listing each quest with its **progress** and its **reward** (🪙 **+20g**, `QUEST_REWARD`). Completing a quest awards the gold once, pops a *"✅ Quest complete …"* toast, and marks the row done (✅ + strike-through, "Reward claimed"). Each quest is **one-off** and does not re-award (`bumpQuest`/`renderQuests`; `quests[]`).
- **The five quests:**
  - **Craft 5 Epic swords** — counts each forged sword whose overall quality (`swordQuality`) is **Epic** (manual or Auto-Craft).
  - **Survive a day without turning any customer away** — completes when a day ends (`runDayTransition`) with **zero refusals that day** (`refusalsToday === 0`; a refusal via the Refuse button breaks it for the current day). The counter resets each day.
  - **Discover 3 new traits** — +1 each time a **never-before-heated** trait is fused (the same event that fires the "New Trait Discovered!" box).
  - **Update 3 recorded compositions** — +1 each time an **existing** recorded composition is **updated** via the record modal's *Update* (replace) action (not "Keep Both", which records a new entry).
  - **Open the shop front** — completes when the shop is unlocked (`unlockShop`).
- Quest state is **session-only** (no persistence yet — resets on reload, like other run state).

### Passive shopfront
- **Unlock:** 500 Gold. (A "Shop Available!" tip box appears once the player first reaches 500 gold; dismissing it starts a hand-pointer guide — pointing to the left arrow until they reach the Shop screen, then to the **Unlock Shop** button — which clears when the shop is unlocked. The guide only runs once the main tutorial is over, so its hands don't clash.)
- **Post-unlock "stock the shop" guide:** the moment the shop is unlocked, a one-off guide runs (`shopSellPhase`): a box — *"Craft a flame sword and add it to your shop for sale."* — then a hand points the player to the counter and the recorded flame composition's **Craft** button (metals are topped up so it's affordable), then to the crafted sword's **To Shop** button. Once a sword is sent to the shop it guides them to the Shop screen and shows two boxes — *"This is where you display your best swords and possibly earn even more gold!"* then *"Or if you have too many swords lying in your inventory, better send them to the shop for sale."* — after which the guide ends. Skipped entirely if no flame composition is recorded.
- Move swords from Vault into the Shop. Each shop card shows the **composited sword image laid flat/horizontal** (`vaultPartsHtml` rotated −135°, `.shop-sword-img`) above its tier/traits/price. Every **10 seconds**, each shop sword has an independent **5% chance** to sell for its full value (value + craft bonus − hazard loss, min 1). Does not affect Reputation. On a sale, a small green **popup on the Shop screen** announces it and the **gold gained** (`showShopSalePopup` / `#shop-sale-popup`), alongside the existing green pulse on the gold pill.
- **Ledger** (`📒 Ledger` button on the Shop screen → `#ledgerModal`): an expandable window with **scrollable day tabs** across the top (most-recent day first, labelled *Day N*); tapping a tab lists every sword sold **that day via the passive shop** — its image (laid flat), shape, traits, and the gold it fetched, plus a day total. Only the **5 most recent days** with sales are kept; older days are dropped (`shopLedger`, capped at `LEDGER_MAX_DAYS`; `recordLedgerSale`/`renderLedger`).

### Recorded Compositions (blueprints)

> **VOCABULARY (cycle 4b): the player-facing noun is now "alloy", not "composition".** "Composition" is
> chemistry-lab language in a smithy, and the build already said *"You have discovered a type of alloy!"*.
> All 20 user-facing strings were renamed in one pass so the button never disagrees with the modal it opens:
> **Record Composition → "Note the Alloy"** (`#btnSaveRecipe` and the `#recordModal` title),
> **Update Composition → "Update the Alloy"**, **📜 Recorded Compositions → "📜 Alloy Book"** (counter button,
> list-modal title, tutorial copy), **Composition Details → "Alloy Details"**,
> *"No compositions recorded yet." → "No alloys noted yet."*, *"… composition recorded/updated" →
> "… alloy noted/updated"*, and the quest label *"Update 3 recorded compositions" → "Update 3 noted alloys"*
> (quest progress is keyed by `id`, not label, so the rename is safe there).
> **Internal names are deliberately unchanged** — `btnSaveRecipe`, `openCompositionsModal`,
> `v2recordComposition`, `compositionsModal`, `savedBlueprints` and this section's own heading still say
> "composition". Renaming them would widen the diff for no player-visible gain. Read every "Record
> Composition"/"Recorded Compositions" below as the UI strings above.
- The **Record Composition** button saves the current active traits + used-metal composition as a named entry. If the active blade is empty (e.g. right after forging) but a sword was just forged, the button instead reads **Record Last Composition** and saves that last forged sword's traits + composition — so you can still record after forging without re-heating.
- **Confirmation box (`#recordModal`):** recording never saves silently — it opens a box first. A composition is **keyed by its trait set**:
  - **New trait set** → the box shows *what trait(s)* are being saved and *how many metals* were used, with a **Record** button (or Cancel).
  - **A trait set already recorded** → the box (titled *Update Composition*, prompting *"Replace the old record or keep both?"*) shows a **before/after comparison** of the metal counts (Recorded vs New) and offers two actions (plus Cancel): **Update** (replace the existing entry in place) or **Keep Both** (`keepBothRecord` — save the new one as a **separate** entry, so two compositions can share the same trait set with different metal recipes). If the metals are unchanged the box notes "These are identical" and **Keep Both is hidden** (nothing distinct to keep). (`saveRecipe` → `openRecordModal`/`confirmRecord`/`keepBothRecord`/`closeRecordModal`.)
- **Recorded Compositions** (Counter screen): a **📜 Recorded Compositions** button opens a **modal** (its own box with an internal scroll). The modal shows a grid of trait-icon tiles; **tapping a tile drills in** to a detail view (Tier, Traits, Value, **Composition**) with a **⚡ Craft** button (Auto-Craft — see below) and a **🗑️ Delete** button (delete is hidden during the tutorial to avoid breaking the guided craft step), plus a **← Back** to the grid. Craft closes the modal and runs the forge pipeline.
- **Auto-Craft** (the **⚡ Craft** button): if you hold enough raw metals, craft a recorded composition. It runs the **full forge pipeline**: a **heat mini-game** (using the composition's **last-acquired trait's** heat config/timer) → shape select → hammer → quench (skipped when that last-acquired trait is `flame`) → design → sharpen, then outputs to the Vault. Unlike a manual forge there is no HP cap, and the single heat + hammer + sharpen performance sets **one uniform quality across all the composition's traits** (see §4) — quality now comes from live performance, not a stored value. Cancelling the heat aborts the craft (no metals spent).

## 7. Map travel (reset)

- Reset the 50×50 grid at any time.
- **Retained:** Gold, available metals, Reputation, Vault, Shop contents, Blueprints, Smelter upgrades, metal unlocks.
- **Cleared/reset:** map layout, fog of war, active forge, player position (back to center).

> Note: the map seed is fixed (`1337`), so the layout is currently deterministic across resets. If reset is meant to produce *new* trait layouts (per original GDD), the seed needs to vary.

## 8. UI / UX

### Material language (cycle 4b — hand-inked parchment)
The whole UI is one material: **inked parchment, Cinzel for chrome labels and titles, Lora for prose.** The
`:root --sf-*` block is the single source of colour; flat-UI hexes stay banned. Recorded here because these
are cross-cutting constraints the next author will otherwise break by accident.

- **Type.** `body` is **Lora**, not Arial. Form controls do **not** inherit `font-family` from `body` — the UA
  sheet hard-sets `font: 400 13.333px Arial` on `button/input/select/textarea` — so a `button, input, select,
  textarea { font-family: 'Cinzel', serif }` rule is required and is what actually fixed the 24 elements that
  were still system sans. The two **customer responses** (`#btnAutoSell`, `#btnRefuse`, `#btnCosplay`,
  `#btnNextCustomer`, `#btnContinueDialogue`) are re-declared back to Lora: they are sentences, not labels.
- **Modal shell.** 15 of the 19 modals now share **one** hand-cut sheet (`.modal-content`,
  `.design-modal-content`, `.list-modal-content`): a 2px `--sf-rule` border, an **asymmetric** border-radius,
  laid-paper grain, and a scorch inset. It is appended as the **last block in the stylesheet on purpose** —
  source order at equal specificity is what lets it beat the earlier per-family rules with no `!important`.
  **Moving that block earlier silently half-converts the game.** Inline `style="background:…;border:…"` on
  the seven `.modal-content` consumers had to be stripped for it to apply at all. `#heatModal` opts out via
  `.modal-bare` (its shell is a transparent carrier around the forge box); `.dialogue-frame` ×3 and
  `.cave-content` are excluded by design (painted art / a cave interior, not sheets).
- **Type ramp.** Modal `<h3>` computed to **five** different sizes with no rule behind them (15 / 16 / 18.72
  / 20 / 22px) — and 18.72px was the UA default `1.17em` showing through, because the design-desk h3s carry
  an inline style with no `font-size`. Now three intentional steps: `--sf-t0` 21px (celebration),
  `--sf-t1` 19px (modal title), `--sf-t2` 15px (list header).
- **Buttons: three tiers, one press, one drained state.** Secondary = pressed-parchment key; primary =
  moss key with cream ink; tertiary = oxide. Press is `translateY(2px)` + an inset shadow (the key sinks)
  rather than the old global `scale(0.95)` + fade (which on parchment read as "the button went
  translucent"). `.dialogue-btn` and `.nav-btn` keep their own presses because both re-state a **centring
  transform** a bare `translateY` would destroy. Disabled is **drained, not erased** — the `opacity: 1` in
  each disabled rule is load-bearing, because the global `button:disabled { opacity: 0.4 }` must stay for
  `.pc-btn:disabled`/`.pc-forge-btn:disabled`, which document that they depend on it.
- **Inline styles beat stylesheets — that was the actual bug class here.** Three JS sites wrote inline
  styles that defeated the shared states and are now class toggles: the review-nav `prev/next.style.opacity`,
  `btnUnlockShop.style.background` (both branches), and the passive-sale gold flash.
- **Mini-game chrome.** `.forge-instructions` (shared by heat/quench/sharpen) is a **torn parchment strip**
  via `clip-path`; because `clip-path` also clips border and box-shadow away, its border is 0 and the lift is
  a `filter: drop-shadow`. Do not re-add a border ("outline the ribbon") — it is silently clipped — and do
  not tighten the padding; the polygon eats ~6% of the box at the notches. `.interactive-heat-meter` and
  `.sharpen-meter` are the same parchment card; **their label colours in the markup are atomic with the CSS**
  (on parchment the old `#8a9a52` label scores 2.4:1 and the `#ffd27f` timer 1.1:1 — invisible).
  `.forge-minigame-container` gains a **burnt-paper rim** as `::before`/`::after` at **z 8/9** — above the
  painted props (z 3–7), below the meters and ribbon (z 14). That ordering is load-bearing: higher greys out
  the ribbon, lower and it sits under the props. Because 8/9 is above them, `.cool-hand` and `.sharpen-hand`
  are raised to **z 12**.
- **`#heatModal .cancel-btn` is scoped ON PURPOSE.** `.cancel-btn` is shared by 12 call sites; on the eleven
  parchment cards the pale stone correctly reads as recessed. `#heatModal` is the outlier — its
  `.modal-content` is transparent, so the same slab landed on a near-black screen and held ~half the bright
  pixels on it in 8.6% of its area. The scoped rule sinks the **field** (mean L 0.176 → 0.035) while
  **raising** text contrast to 6.7–9.4:1. Those two numbers move in opposite directions deliberately —
  "restoring the old ratio" by lowering text contrast would re-break accessibility and leave the slab.
- **Tutorial pointers are an inked manicule**, not emoji. `--sf-hand` is a data-URI SVG drawn pointing right
  and rotated by `.sf-hand-{u,d,l,r}`; the rotation lives on `::before` so the element's own transform stays
  free for the bob/slide keyframes, and the box is a **28px square in all four directions**, which is why
  `placeHand`'s `const H = 28` offset maths is unchanged. Being a data URI, it survives with zero assets.
- **Gold/reputation pill is OPAQUE ink on both screens.** The old `rgba(0,0,0,0.55)` composited to near-black
  on screen 1 but to `rgb(105,99,86)` over screen 2's parchment, so the tier colour met two wildly different
  backdrops and scored **1.08–1.13:1** on the forge screen. One known backdrop → one set of tiers.
  **Reputation tiers (hand-mirrored from `:root` in `updateUI` — retune both):** `< 0` → `#d4744a`
  (`--sf-oxide-pale`, 4.74:1), `0–10` → `#93a3a8` (`--sf-iron-lt`, 5.96:1), `> 10` → `#8a9a52`
  (`--sf-moss-lt`, 5.05:1). The pill copy drops the word **"Gold:"** (icons carry it): it was wrapping to
  three lines on screen 2, and Cinzel is ~18% wider than the Arial it replaced in a header with **0.0px** of
  slack (`flex-wrap: nowrap; overflow: hidden`). After the change the header measures scrollWidth ===
  clientWidth === 318 at both 360px and 375px — **re-check that if the header copy or font ever changes.**
- **`#mobile-wrapper`'s background is `--sf-ink-dk`, not `#f0f0f0`.** On a fractional viewport offset
  (wrapper at x 7.5 on a 375px screen) the 33.333%-wide `.screen` rasterises ~0.04px short and this colour
  shows through as a 1-device-px column for the full 640px height; the old grey read as a bright cut straight
  through the painted burnt-paper border. It is a rasterisation artifact, so geometry cannot fix it —
  `.screen { flex: 1 0 0 }` was tried and shrank every screen to 353.3px.
- **`sharpenModal` has zero slack** and is the one modal that breaks under a heavier edge: its children
  needed 562px in a 550px budget, so the flex box was silently crushing `.sharpen-joystick` from its authored
  58px to 40px while the 48px `.sharpen-knob` overflowed the track. `border 3→2` (+2px), `gap 10→8` (+6px)
  and a tighter joystick margin (+12px) return the full 58px with `scrollHeight === clientHeight`;
  `flex-shrink: 0` then makes any future overflow **visible** instead of silently eating the joystick.

- **Three swipeable screens:** Shop (0) · Customers (1) · Forge/Map (2). Game opens on the Forge screen.
- **Counter (Customers) screen:** two stacked top-left corner tabs — a **📋 quest tracker** (see §6 *Quests*) and, below it, a **📖 Diary** (mutually exclusive panels). The Diary is a **paged book** (◀ ▶ arrows) of the named story customers — **Bram, June, Roland**. Each page is **locked (identity hidden behind a 🔒 placeholder) until the player sells a sword to that specific customer**; once unlocked it shows the customer's portrait, a short storyline note, and a running **list of swords crafted for them** (`diaryCustomers`/`diaryGiven`; sales tagged via `currentCustomerId`; a page unlocks when `diaryGiven[id]` is non-empty; `renderDiary`/`diaryFlip`). a slim gold/reputation pill at the top; the customer rendered as an **image** anchored bottom-left that **slides in from the left** on each new customer: **Bram** (`assets/customer/Bram.png`) is the tutorial's very first customer (Day 1 opener) and returns as `BramD2.png` for **Day 2's opener**; every other customer draws a **random portrait** from the human pool (`man1`–`man4`, `woman1`–`woman3`), never repeating the previous portrait back-to-back (`customerPool`/`setCustomerImage`); the request speech bubble (tail pointing to the customer) whose text is **revealed word by word** (see §6), with the player's two **response options** — **"I have something for you."** (Search Inventory) and **"I don't have what you need."** (Refuse) — stacked beside it, fading in only once the line has finished typing (Refuse is disabled for the first three customers — see §6); after a sale those two options are replaced by a single **response button** (*"Thank you" / "Glad you liked it" / "Take care"*) that the player taps to send the customer off and bring the next (see §6); and, at the bottom, two buttons — **🛡️ Inventory** and **📜 Recorded Compositions** — that each open their **own modal** (a fixed-height box with an internal scroll, so the screen itself no longer grows). Each modal is a **tile grid → tap a tile → drill-in detail view** (with a ← Back): the **Inventory** modal's tiles show the **composited sword image** (blade + fittings, with the quality overlay in the detail) and the detail carries **Sell** + **To Shop**; the **Recorded Compositions** modal's tiles show the trait icon(s) and the detail carries **⚡ Craft** + **🗑️ Delete**. Background: `Screen1bg.png`.
- **Forge screen:** status panel — health bar (no numeric text), then a row with an **ℹ️ tutorial-review button** (left) and the **gold/reputation pill** (mirrors screen 1's `💰 Gold | ⭐ Rep`), then a **"Blade Traits:"** line listing the heated traits (or "None"). The ℹ️ button re-opens past tutorial dialogue boxes (in their own frames) with ◀ Prev / Next ▶ / Close, and stays available after the tutorial. Then a draggable/zoomable 50×50 viewport (drag to pan; mouse-wheel zoom is centered on the cursor; a **📷 free-camera toggle** at the viewport's bottom-right (highlighted gold when active) — when active, moving the sword no longer recentres the view; turning it off snaps back to the sword), 3×3 movement grid, action buttons (Heat, Forge, Record Composition, 🗺️ Chart). ("Record Composition" saves a recorded composition — see §6.)
  - **Grid tiles:** the spawn cell (25,25) shows `tile_centre` and the 8 cells around it show `tile_centre2` (home base); cells the active sword **lands on** show a `tile_path` trail. Dashes only mark the endpoint, so jumped-over cells stay blank; the trail never overwrites hazard, trait, or the home tiles. The trail resets with the active blade — after a forge or on death (`pathCells`, `markPath`/`clearPath`).
- **Onboarding:** 4-scene animated intro (ember particles) → multi-step tutorial (select metals → reach a trait → heat → forge → go to counter → sell a sword → a 2nd Flame-trait customer arrives → back to the forge → open the chart (a text label + pulsing glow over the minimap alternates every 3s between the player marker — "Your location" — and the Flame icon — "Flame trait" — until the chart is closed, so the player sees where to head) → learn the Purify-dash slider (two illustrated dialogue boxes: a tap-vs-hold art frame, then an avoid-impure-tiles art frame) → head west toward the Flame trait (when its ❓ mark is revealed by the fog, a persistent top-of-screen banner — "See the trait mark ❓… add some iron to go down to it." — appears and stays until the player reaches it) → reach the Flame trait, where a bouncing arrow points to the Heat button → heat it → prompt to "Record Composition" (the **Forge button is greyed out from when the Flame is heated until the composition is recorded**, so the player can't accidentally forge first) → record it (a **confirmation box** shows the trait + metals being saved; confirm to record — see §6) → a bouncing arrow points to the now-enabled Forge button to craft the sword → forge it (choose the blade shape, hammer the ingot into form, quench it in water, design the fittings, then sharpen it on the grindstone — see §5) → prompt to go sell it at the counter → sell the flame sword to the 2nd customer → a 3rd customer (off to fight an ice dragon, "weak to heat") arrives, a tutorial box teaches opening **Recorded Compositions** and tapping **Craft** to forge a flame sword from the recorded composition (which re-runs the heat + hammer mini-games — see §6), then giving it to the customer, who is delighted, then a closing "help customers find the perfect sword" tip as the 4th (non-Flame) customer arrives; then, the first time the player finishes a heating minigame after the tutorial (heating that 4th customer's new trait), a one-off record-reminder box — "Remember to record the composition of each new trait you discover, and keep updating the old ones as you improve." — with a hand pointer to the Record Composition button (see §6)), plus a contextual "Shop Available!" tip the first time the player reaches 500 gold (enough to unlock the Shop), which then hand-guides them to the Shop screen and the Unlock Shop button (see §6). **Any tutorial box tied to a customer** (the sell-a-sword prompt, the "another customer" prompt, the Auto-Craft lesson, and the closing tip) is gated to appear **only after that customer's word-by-word line has fully typed out plus a ~2s read pause**, so a tutorial box never overlaps the customer's speech. During the intro, a **"Skip Intro" button** (fixed bottom-right) jumps straight into the game (`launchCoreGame`). A **"Skip Tutorial"** button (in the collapsible cheat box, shown only while the tutorial is running) ends the flow immediately and unlocks everything (metals, passive generation, Record Composition, Chart, the Purify slider). The three cheat buttons live in a **small collapsible box** floating **just above the game frame's top-right** (`#cheatBox` inside a `#frame-shell` wrapper, so it clears the game window / health bar and works on desktop and mobile): a **🛠 toggle** (`toggleCheats`) expands a **horizontal row** of **"+100 Metals"** (adds 100 of every metal), **"+100 Gold"**, **"Skip Stage"** (skips whichever forge minigame is open — heat/shape/hammer/quench/design/sharpen — and proceeds to the next stage), and — **while the tutorial is running** — **"Skip Tutorial"**. **The box is now OPT-IN: `launchCoreGame` only shows it when the URL contains `dev`** (e.g. `?dev`). It renders at y≈50 while the game frame starts at y≈86, i.e. in the page void *outside* the product, so shipping it visible put a 🛠 button carrying "Remove Fog" and "+100 Gold" in every player's view. Nothing becomes unskippable: `initializeMainGame` already calls `v2tutSkip()` unconditionally in this presentation build, and `cheatSkipStage`/`v2tutSkip` remain callable from the console. **Skip Intro now lives INSIDE the intro card** (absolute, top-right, in the card's own material — same scrim, hairline and gold Cinzel caps as `.story-box`); it was `position: fixed` on the *page*, rendering up to 325px outside the card in the grey body void in a material nothing else on screen used.
- **Feedback:** red flash on damage, orange flash on heat success, green gold-pulse on passive shop sales, "reached a trait" / "trait acquired" toasts. Spending a metal (a move/dash) **flings an ore chunk** (`assets/forge/Metal.png`) from the pressed metal button into the bucket in an arc, and the bucket wobbles as it lands (`tossMetalToBucket`; fires only on an actual spend, so a cancelled Purify hold throws nothing). The **first time** a given trait is heated (per session) shows a celebratory **"New Trait Discovered!"** box with the trait's icon and name — including during the tutorial (it layers above the tutorial dialogue); repeat heats of an already-known trait just show the "trait acquired" toast. Warnings/errors (not enough gold, duplicate composition, wrong sword for a customer, etc.) use a **styled parchment popup** (`gameAlert`, matching the dialogue-frame look) instead of the browser's native `alert()`. The **Heat** button pulses with a glow while standing on a trait; the **Forge** button is disabled until a trait is heated, then pulses with a glow (and during the guided flame step it is re-disabled from the heat until the composition is recorded, so the player records before forging).
- **Tutorial hand pointers:** at each guided step a bouncing 👆/👇/👈/👉 hand points to the element to use next — the Steel & Magnesium metal buttons (until the 4 steel + 1 magnesium recipe is added), Heat, Forge, the left/right screen arrows, Search Inventory, the Chart button, Magnesium again (until the Flame trait is revealed on the map), Record Composition, and — for the 3rd (ice-dragon) customer — the selected composition's **Auto-Craft** button then **Search Inventory**. Each hand clears once its action is taken. Data-driven via a `hand` field on the relevant `tutorialFlow` gate steps.
- **Minimap (Chart modal):** a live canvas minimap of the full 50×50 grid (fully revealed — no fog) — uniform tan ground (hazards are **not** shown), every trait drawn as its emoji icon at its location, and the player marked by the same sword icon used on the grid map (`assets/map/tile_sword.png`) with a pulsing blue glow. Supports **zoom** (scroll / pinch / on-screen +/− buttons, 1×–6×) and **pan** (drag), clamped to the map. **Tapping a trait icon** shows a small label with that trait's name below it. During the tutorial's chart step, a **text label + pulsing glow** (no hand pointer) highlights the target and alternates every 3 seconds between the player marker ("Your location", its own blue glow) and the Flame icon ("Flame trait", an amber glow ring), tracking zoom/pan, until the chart is closed. (Replaces the old static `Minimap.png`, now unused.)

## 9. Known discrepancies & open questions

- ~~Heat quality is Epic-only~~ — **resolved:** quality is now Weak/Fine/Epic, set by the heat timer and capped by blade HP (see §4).
- Map seed is fixed (see §7) — should reset randomize the layout?
- Dagger shape from original GDD is absent (see §5).
- Metals expanded 4 → 8 vs the original GDD.
