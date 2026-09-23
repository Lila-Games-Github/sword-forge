# LEARNINGS

Lessons from building Sword Forge.

- **Browser screenshot tools are flaky on this game, not broken** *(revised 2026-09-18: they return fine when the app window is visible; they fail while it is minimised — retry once, then fall back)* — the continuous ember/`requestAnimationFrame` loop keeps the page from going idle. Verify via the preview tools (`javascript_tool`, `read_console_messages`) instead; resize to mobile (375px) before measuring layout or the headless viewport reports width 0.
- **The preview static server drops between turns** — a `navigate` fails or the tab reverts to `file://`; restart with `preview_start` and re-`navigate` (same port, 5678).
- **Data-driven tutorial beats scattered flags** — *(this describes `swordforgeV2.html`; the landscape loop-test uses a different system — a `DIALOGUE` id map + `SAY_SEQ` + `TUT_STAGE` — and has no `tutorialFlow`)* — dialogue steps, actions, and `waitAction` gates in one array; gameplay functions advance it by checking the current step's `waitAction`.
- **An SSOT must track the *live direction*, not a superseded build** — `specs/game-design.md` documented the V1 grid game long after the design pivoted to Path-Forge, so reviews were checked against the wrong game. Fixed 2026-08-12 by making the loop-test canon for the craft loop. Lesson: when the design pivots, reconcile the SSOT *in the same push* as the new build lands, or the spec silently rots.
- **Reconcile the SSOT with a dated decision record, not a silent in-place edit** — the loop-test-canon switch was an in-place edit of `game-design.md`; the *why/when* survives only in a commit message. A dated decision doc was even started (`2026-08-10-core-loop-potioncraft-mapping.md`) but stranded in a worktree. RuneSurge's append-only `docs/superpowers/specs/` decision log is the pattern to copy: new decision = new immutable dated doc, GDD/spec = synthesis that cites them.
- **A phone cannot reach the preview server until two Windows settings change** *(2026-09-21)* — the server binds `0.0.0.0` and answers on the LAN address from the host itself, yet the phone times out. Two causes stack: the Wi-Fi is classified **Public**, and a past "Cancel" on a Windows firewall prompt left inbound rules named **"Node.js JavaScript Runtime" with Action: Block** on the Public profile. **Block rules beat allow rules**, so adding a port allow changes nothing while those exist. Fix: mark that Wi-Fi Private (the blocks are Public-scoped, so they stop applying and still protect you in a cafe) and add one inbound TCP allow for the preview port. Diagnose with `Get-NetConnectionProfile` and `netsh advfirewall firewall show rule name=all dir=in verbose`, not by re-checking the server.
- **Viewport meta sizes the width only** *(2026-09-21)* — a fixed-size game frame needs the width CHOSEN so the height fits: `max(frameW, ceil(frameH * innerW / innerH))`, written into the meta. `innerW / innerH` is the visible screen's aspect in any CSS space, so no device pixels are needed and it converges in one step. Prefer this to a `transform: scale()` wrapper whenever the code reads `getBoundingClientRect` or `clientX` in many places: the meta route keeps every coordinate in one space, a transform silently scales half of them.
- **A centred flex item that overflows hides its left edge** — `justify-content: center` gives no way to scroll to the overflow. Use `safe center` on any fixed-size box that can be wider than the window.
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

## A trait record has two shapes, and a hand-built fixture will agree with your bug

`Swordforge_looptest_landscape.html` stores a trait as `{t, tier, val}` on the bench (the whole trait
object) and as `{tid, tier, val}` on a finished sword, because `finishBlade()` flattens it. Code that
reads `.tier` alone works on both and never notices; code that reaches for the trait's **id** must
handle both, and r131 did not. The result was a grade that could never reach its top outcome.

The reason it shipped is worse than the bug: the round's verification built its test sword **by hand,
in the ingot shape**, so the fixture and the defect made the same wrong assumption and agreed. This is
the third time a hand-built record has hidden something (see the missing `sword` field in r128's first
pass). **Forge the object through the real path that makes it** — here `SFM`'s craft chain plus
`finishBlade()` — rather than writing an object literal that looks close enough.

## Some asset paths are built, not written, so grep cannot prove a rename is complete

Converting the landscape build's art to WebP meant rewriting every asset reference. A grep for
`assets/...png` found them all and came back clean, and the game loaded perfectly in the emulator.

It was wrong. Nine sites **construct** the path at runtime and keep the extension in the expression:

```js
const ddSrc = (k,f) => 'assets/sword-parts/'+DD_DIR[k]+'/'+f+'.png';
rough.src = 'assets/hammer/balanced_'+hmShape.toLowerCase()+'_midblade.png';
CUSTOMER   = { portrait:'assets/customer/'+who+'.png', ... };
```

None of those contain a literal path, so the grep missed them, and the files they reach (65 sword-part
skins, 11 portraits, 3 midblades) were never converted. Nothing broke on the screens a sweep visits;
it would have broken for the first player who reached a flame grip.

Two habits come out of it. **Grep for the suffix in an expression too** (`+ '...png'`), not just for
whole paths. And **build the work list from the directories the code can reach**, not from what a
render sweep happened to paint: a measurement pass only ever sees the assets that were on screen.

Related: the same round found two assets counted in the payload that live **only inside comments**, so
the "before" number was 1.84 MB too high until the scan learned to tell code from prose.

## Verifying the thing that runs, not the thing you called (tutorial polish, 2026-09-23)

The same mistake produced three separate bugs in one session, and each time the verification I ran
came back green.

- **Calling a branch proves the branch; it proves nothing about whether anything reaches it.** The
  idle-pointer logic runs from the frame loop, but only for a hardcoded list of stages. Two rounds
  added new branches without adding their stage to that list, so those pointers were set once and
  never revised — the bellows kept glowing after the gate opened. Both rounds had been "verified" by
  calling `tutNudge(true)` by hand. The check that would have caught it drives real `tick()` frames
  and nothing else.
- **A one-shot window hooked to the wrong exit never opens at all.** A line can leave the screen two
  ways — the player dismissing it, or the game retiring it — and D97 had gained a second exit (it
  hides itself when the dragon reaches the anvil, which is *exactly what the line tells the player to
  do*). The window was hooked to the dismissal, so on the natural path it never appeared. Verified by
  calling `sayNext()`, which is the one route a player following the instruction does not take. The
  fix is structural: hook `sayHide()`, the single place that catches both exits, and keep one table of
  what follows a line.
- **Two things can be "the arrow".** `#tutArrow` is the scripted pointer; `#hintArrow` is a separate
  white idle nudge. Asked to remove "the arrow", I cleared the one that was already empty and reported
  it done. Name the element, not the concept, before claiming a fix.

The habit that comes out of all three: **before claiming a fix, ask what actually invokes this code in
play, and make the test do that.** `elementFromPoint` has the same trap in a different costume —
ghosts are `pointer-events: none`, so it reads straight through them; to check paint order, probe with
an element that shares the parent and z-index.

Two smaller ones from the same rounds:

- **A pulse is not a blink.** An `ease-in-out` curve passes *through* its bright frame, so the lit
  state is an instant at the top of a swell and reads as "warm". Holding each state and crossing
  quickly on `linear` is what people mean by blinking. Measured across a cycle rather than argued.
- **Check what a "refund" helper actually does.** `refundOre()` is the Restore Ore *talent* — a per-ore
  roll at 10 % a rank — so unranked it returns nothing. Wiring a retry button to it would have quietly
  cost the player their ore.
