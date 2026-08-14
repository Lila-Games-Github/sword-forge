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
