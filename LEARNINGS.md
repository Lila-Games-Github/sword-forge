# LEARNINGS

Lessons from building Sword Forge.

- **Browser screenshot tools are flaky on this game, not broken** *(revised 2026-09-18: they return fine when the app window is visible; they fail while it is minimised — retry once, then fall back)* — the continuous ember/`requestAnimationFrame` loop keeps the page from going idle. Verify via the preview tools (`javascript_tool`, `read_console_messages`) instead; resize to mobile (375px) before measuring layout or the headless viewport reports width 0.
- **The preview static server drops between turns** — a `navigate` fails or the tab reverts to `file://`; restart with `preview_start` and re-`navigate` (same port, 5678).
- **Data-driven tutorial beats scattered flags** — *(this describes `swordforgeV2.html`; the landscape loop-test uses a different system — a `DIALOGUE` id map + `SAY_SEQ` + `TUT_STAGE` — and has no `tutorialFlow`)* — dialogue steps, actions, and `waitAction` gates in one array; gameplay functions advance it by checking the current step's `waitAction`.
- **An SSOT must track the *live direction*, not a superseded build** — `specs/game-design.md` documented the V1 grid game long after the design pivoted to Path-Forge, so reviews were checked against the wrong game. Fixed 2026-08-12 by making the loop-test canon for the craft loop. Lesson: when the design pivots, reconcile the SSOT *in the same push* as the new build lands, or the spec silently rots.
- **Reconcile the SSOT with a dated decision record, not a silent in-place edit** — the loop-test-canon switch was an in-place edit of `game-design.md`; the *why/when* survives only in a commit message. A dated decision doc was even started (`2026-08-10-core-loop-potioncraft-mapping.md`) but stranded in a worktree. RuneSurge's append-only `docs/superpowers/specs/` decision log is the pattern to copy: new decision = new immutable dated doc, GDD/spec = synthesis that cites them.
- **Competitor FTUE teardown workflow (game-research + video-analysis)** — scope to the tutorial window, pull a no-commentary walkthrough (frames carry it, cadence 1 frame/2s) + a narrated guide (commentary carries intent), source-tag every claim, keep text deliverables in-repo and gitignore the heavy raw video/frames with a MANIFEST for re-fetch.

## Anchor-matching the landscape build (loop r8–r12, 2026-08-14)

- **Check CSS filters/washes before elaborate fixes** — the single biggest anchor-palette miss was a `saturate(1.4)` filter on the map (`screen_gate` region 0.325 FAIL). Neutralising it → 0.155 PASS in one edit. A tint/filter/overlay is the first thing to rule out when a region's palette is off, before re-cutting art.
- **Objective gates beat a drifting subjective score, but the owner's composition overrides the gate** — `screen_gate` (per-region palette hist) + `element_size` (pixel-% footprint) localised the real problems (rail 0.55, furnace 1.42× oversize). But when the owner then directed *bigger-than-anchor* hero props (furnace 1.5×, dragon 2×), the element_size gate stopped applying — a deliberate creative deviation is not drift. Gate guards accidental drift; it does not veto owner intent.
- **Cut art that must seat together as ONE piece** — cutting the smelter body and overlaying a separate cauldron left the pot *floating* above the rim (Opus audit 38/100). Re-cutting the smelter+pot as one tall unit (pot baked into the flared rim) fixed the seat and the silhouette in one move (→80/100). Separate-layer props that should look joined tend to float.
- **A zone-scoped overlay seams any prop that bleeds across the zone** — a faint line cut the furnace exactly at the map/bench boundary: `#bench::before` (a grey wash) + `#map-wrap` `border-bottom` + `#map-wrap::after` bottom inset band each only covered the bench/map *half* of the furnace, which bleeds across both zones. Fix = remove/behind them. Any translucent zone decoration will seam a cross-zone hero prop.
- **Same-z siblings paint in DOM order → a later prop occludes an earlier prop's overflow** — the bellows (child of the furnace station) had its ring handle eaten by the grinding-wheel station (same `z-index:2`, later in DOM). Lifting `#stSmelt` to `z-index:3` un-occluded it. When a prop bleeds toward a neighbour, its station needs the higher z.
- **Prefer re-crop over asking the image model to restructure a good cut** — asking NB to "make the tower ~18% taller" regressed the already-good pot seating (floated again). Revert and re-crop instead; and NB isolates often leave one adjacent object (a wooden box) in frame — paint that region magenta *before* chroma-keying.
- **`?clean` render mode** — a URL flag adds `#frame.clean` to hide loop-test/tutorial chrome (step badges, hint bar, heat gauge, station captions, zoom) so headless renders read like the marketing anchor; gameplay is untouched.
- **Drift-guard upkeep is easy to forget** — every `LAYOUT` y beyond `EPS` needs a per-prop exemption in `runLayoutSelfTest()`'s in-zone check, and any `bucket` y change must also update the hard-coded `resolveLayout` math assertion (a bucket-y move flipped the self-test RED until the `y*500` literal was updated).

## Verifying a UI you cannot see (tutorial build-out, 2026-09-18)

- **Content is not visibility.** `textContent` returns the text of a `display:none` element, so a check
  that asserts on it passes on a build where nothing is on screen. A customer's whole line was typed
  into a hidden box and the check went green. For "is it visible", also assert `offsetParent !== null`,
  a non-zero box, containment in the frame, and that `elementFromPoint` at its centre returns **that
  element** rather than something covering it.
- **A transparent box still takes the pointer.** Art is mostly empty canvas, and the element's box is
  what hit-tests — not the pixels. This bit three times: the pickaxe swallowed cave seams, sword-part
  images covered the craft window's title and close button, and the dragon (moved to the corner)
  swallowed the blade panel's buttons. Always probe with `elementFromPoint`; z-index alone tells you
  nothing about what the player can actually hit.
- **Never test an accumulated float for exact equality.** "Fully ground" was `grind >= 1`, but the
  grind is a running sum — 72 increments of 1/72 land on 0.9999999999999999, which `Math.min(1, x)`
  never rounds up, and the step waits forever. The previous round's test passed *on the same knife
  edge by luck*. Use a tolerance (`>= 0.999`).
- **Exercise the route the player will take.** A heat threshold was watched in the cooling path but not
  in the strike path, so a strike that carried heat across it was silent. The check cooled the metal by
  *sitting still* — the one branch that worked — and passed. A test that reaches the mechanism by a
  route the player won't take can pass on a broken build.
- **Measure art only after it has loaded.** An unsized `<img>` measured 17.5% of its scene before decode
  and 794px after, so a hit test built on the early number was hundreds of pixels off. Give props an
  explicit width and re-measure post-load.
- **A rebuild destroys anything mid-animation inside it.** Bell ripples parented to the prop layer
  vanished a frame later because the customer's arrival rebuilt that layer. Parent transient effects to
  a container that survives, and trigger them *after* the rebuild.
- **An overlay is clipped by its frame.** A guide arrow aimed at a target near the top edge started
  62px *above* it — outside `#frame`'s `overflow:hidden`, so it drew nothing. Check the whole arrow
  path lands inside the clip box, not just its target.

## Moving a trait rearranges the hazard field (2026-09-19, r111)

Hazard positions on the trait map are **derived from where the traits sit**. They are deterministic
across reloads (verified over three), but move a trait and the hazards move with it.

r104 measured a hazard, then moved Fire in the same round, then wrote the pre-move measurement into the
spec as justification for a design decision. Re-probed in r111 the hazard was not there: the route end
it claimed was "five units from the centre of an island" is clear, and the nearest island is 63 units
further out.

**Rule:** any measurement of hazards, fog or trait spacing must be taken **after** the last change to
`TRAIT_POS` in that round, not before. Re-run the probe after the patch lands, even when the patch
"only" moves one trait.

## Drive tutorial steps through the gameplay functions, not by assigning stages (2026-09-19, r112)

r111 verified a new craft by setting `TUT_STAGE` directly and calling the step functions. Every
assertion passed. In a real playthrough the beat could not run at all: `tutGateStep()` was a catch-all
that overwrote the very stage those steps waited on, and dragged the first craft's D5-D9 in with it.

Assigning the stage is assuming the answer to the question the test should be asking, which is *does the
game reach this stage on its own*.

**Rule:** verify a tutorial beat by calling the functions a player's actions call (`markGateReady`,
`openGate`, `placeOnAnvil`, `addPrep`, `advanceSword`, …) and letting `TUT_STAGE` fall where it falls.
Set a stage by hand only to reach a starting position, never across the step under test. Assert the
lines that did **not** fire as well as the ones that did.

## Measuring the map changes the map (2026-09-19, r114)

`addSegment()` calls `moveX()`, which calls `reveal()`. So sampling route ends to build a table of
distances **punches a fog hole at every sampled end**. A fog-coverage check run afterwards reported a
trait fully visible when a clean run leaves it two-thirds covered.

**Rule:** any fog or reveal measurement goes on a freshly loaded page, before any route is sampled. Keep
geometry probes (which perturb the fog) and fog probes (which must not be perturbed) in separate loads.
