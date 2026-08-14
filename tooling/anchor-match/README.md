# anchor-match — objective anchor-matching tooling (Sword Forge)

Project-specific tooling + notes for matching the loop-test builds to the marketing
**anchor images** (`assets/Anchor-images/sword-forge-anchor-{hori,vert}.jpg`) with
**measurable, deterministic gates instead of a subjective LLM score**.

Status: seed (2026-08-14). Project-specific on purpose — do NOT generalize yet. If a
second project needs it, lift the generic parts into the shared R&D module (see "Build on it").

## Why this exists

The landscape composition loop used an Opus art-director scoring each render 0–100 vs the
anchor. Symptom that it was too weak: the scores drifted and plateaued (58 → 58 → 61 → 77)
and never converged — that is vibes, not measurement. Two sibling repos already solved the
"self-evaluating loop without humans" problem for art; this folder takes what transfers.

## What we studied (read-only) and what transfers

### A. `Lila-Games-Github/mother-clucker` — the camera gate
`.fm/art/camera-pipeline/` renders each 3D asset with **fiducials baked into the scene**
(a 2 m post + 1 m square + 4 colored markers), then `camera_gate.py` recovers the camera
elevation by **pixel geometry** (`atan((2/1)·square_px/post_px)`) and gates on 45°±5° with a
hard REJECT + SHA-256 provenance. No LLM, no human.

- **Transfers (principle):** engineer a measurable ground-truth INTO the artifact; verify with
  deterministic code + tight tolerance + hard gate + provenance/evidence artifact.
- **Does NOT transfer (code):** the 3D camera-angle recovery. Sword Forge is 2D screen
  composition; there is no "angle" to measure.

### B. `art-pipelines-RND/tooling/consistency-gate` — the productized fidelity gate
The generalized MC pattern: `chroma_key → metrics → validator`. `metrics.compute_metrics`
scores a **single alpha-keyed subject** vs a canonical sheet (`alpha_iou`, row/col alpha
correlation, `luminance_correlation`, `nonred_rgb_mean_absolute_error`, bottom-center 256px
normalize). `validator` is **spec-driven** (per-project JSON: SHA pins, `minimums`/`maximums`,
declarative `human_fields` with `eq|lte|gte`). Key step is a **mandatory preprocess** (the pixel
gate is invalid on raw non-alpha generations).

- **Transfers (architecture + one gate):** `key → measure → gate against a per-project spec`;
  mandatory preprocess; declarative thresholds; PIL-only; TDD with an identity test. Its
  single-subject metrics apply **directly to our prop cuts** (each anchor cut IS one keyed
  subject vs a canonical crop).
- **Does NOT transfer (metrics) to the whole screen:** `alpha_iou` + bottom-center normalize
  assume one alpha subject. A full game screenshot has no single subject and no meaningful
  alpha — those metrics break. The screen needs region-localized metrics they do not have.

### ⚠ Chroma divergence to know
consistency-gate **locks GREEN `#00B140`**. Our prop cuts are on **MAGENTA `#FF00FF`** — chosen
because green keys badly on the grey/steel/orange subjects here (wheel, cauldron, anvil). So we
do NOT reuse their green keyer; we keep the magenta keyer (`chroma_key.py` in this folder,
lineage: the same session algorithm they copied, kept on magenta). Flagged for the RND owner:
their green-only assumption fights metal/warm palettes.

## The two Sword Forge gates (this folder)

| Gate | Problem | Basis | Metrics |
|------|---------|-------|---------|
| `prop_gate.py` | Does an anchor-cut prop match its anchor crop? (single subject) | consistency-gate metrics, adapted to magenta | silhouette IoU + row/col profile + luminance corr + color MAE |
| `screen_gate.py` | Does a rendered screen match the anchor composition? (multi-region) | **new**, in their architecture | per-region: color-histogram distance + downscaled-luminance correlation; box coverage; diff heatmap |

Both: deterministic (PIL-only, no LLM), spec-driven (`spec.json` region boxes / thresholds),
emit a machine-readable `*_result.json` + an evidence image, gate PASS/FAIL. Keep a **small LLM
check only for the genuinely subjective "does the art style read the same"** — the numbers catch
layout/palette drift; the LLM catches taste. Belt and suspenders, not vibes alone.

## Why the landscape still "looks unfinished" (the real lever)

The map/props read well because they are **anchor pixels** (cut from the anchor). The HUD plates
and ore rail read worst because they are **CSS approximations**. Per MC's own "build the
ground-truth in" lesson: cut the HUD + rail from the anchor too. That is a bigger, objective jump
than more subjective loop rounds. `screen_gate.py` is what proves it moved the number.

## Pipeline order (non-negotiable, from consistency-gate)

```
prop:   raw-on-magenta  ->  key_to_transparent  ->  compute_prop_metrics  ->  prop_gate(spec)
screen: headless render ->  screen_gate(anchor, spec-regions)  ->  per-region scores + heatmap + gate
```
Never score a raw (un-keyed) prop. Never trust a single whole-frame SSIM (art differs at the pixel level).

## Measured (2026-08-14) — the loop, proven

`screen_gate` on the landscape build vs the hori anchor. Evidence in `evidence/` (review
heatmaps + result JSON, MC-style).

| Region | baseline hist | after rail cut | note |
|--------|--------------:|---------------:|------|
| rail | **0.552 FAIL** | **0.197 ok** | was near-black; cut the anchor's warm wood board (`assets/ui/rail_wood.png`) as the rail bg |
| map | 0.324 FAIL | 0.324 FAIL | still the worst; partly region-box alignment vs the anchor map framing |
| skilltree | 0.345 FAIL | 0.292 ok | improved as the rail wood toned the adjacent box |
| hud_left | 0.254 ok | 0.254 ok | passing, but CSS plaques ≠ anchor's carved chrome — next cut |
| **overall palette** | **75.1/100** | **80.6/100** | +5.5 from one objectively-targeted cut |

This is the whole point: the gate localized the worst region (rail), an anchor-cut fixed it,
and the re-measure moved the number — no subjective scoring. `luma_correlation` stays low
across the board (~0.2): expected, because the render is different art than the anchor at the
pixel level; that is why palette distance, not luminance correlation, is the headline.

**Next objectively-targeted cuts (by current hist):** map framing (0.32), HUD plaque chrome
(hud_left 0.25 + skilltree). Same recipe: cut from the anchor, re-run `screen_gate`, watch the number.

## Element SIZE match — the pixel-% method (added 2026-08-14)

The owner's question: *"are we matching each element's pixel size as a % of the anchor vs the
same % of the game?"* Answer was **no** — LAYOUT widths were eyeballed via the Opus critic. Now:

- `SFM.frameBoxes()` (via `?bbox`) emits each game element's footprint as a fraction of `#frame`.
- `spec.hori.json > element_boxes` records each element's footprint as a fraction of the anchor.
- `element_size.py > size_deltas` reports `w_ratio = game_w / anchor_w` per element (>1 too big).

First run exposed the drift the eye had caught — and the earlier critic's overcorrection:

| element | before (ratio) | after r8 | fix |
|---|--:|--:|---|
| furnace | 1.42 too big | **0.99** | LAYOUT w 0.30 → 0.21 |
| anvil | 1.35 too big | **1.00** | LAYOUT w 0.27 → 0.20 |
| bellows | 0.77 too small | **1.01** | .bellowtop 33% → 62% (of the now-smaller furnace) |
| wheel | 1.06 | **0.99** | w 0.30 → 0.28 |
| mug | 1.86 | 1.39* | w 0.08 → 0.06 (*bbox inflated by the mug's rotate; visual size matches) |

The Opus critic had said "props too small, make them bigger" and I overshot; the pixel-% method
proved furnace/anvil were then 1.4x too big and corrected them objectively. This is the headline
reason the earlier match was "off on sizes."

Also this round (anchor overlaps + orientation, owner-directed): `#bench overflow: visible` so the
furnace **cauldron bleeds up into the map** and the **wheel bleeds into the rail** (cross-zone
overlap like the anchor); `.furnace` flipped `scaleX(-1)` to match the anchor smelter orientation.

## Build on it (future)

1. Wire `screen_gate` as the **loop metric** for anchor-match rounds (replaces the Opus 0–100 as
   the gate; keep Opus only as the subjective tie-breaker).
2. Annotate both anchors' region boxes once (`spec.hori.json`, `spec.vert.json`); reuse across rounds.
3. If a second game needs this, lift `screen_gate`'s region engine into
   `art-pipelines-RND/tooling/consistency-gate` as its missing multi-region mode, and push the
   magenta-key option back there too.

## Run

```bash
cd tooling/anchor-match
uv run --with pillow --with pytest python -m pytest -q      # tests
uv run --with pillow python screen_gate.py --render <png> --anchor <jpg> --spec spec.hori.json --out out/
```
PIL-only, no numpy (matches the RND module).
