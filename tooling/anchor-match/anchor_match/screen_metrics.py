"""Region-localized composition diff for whole-screen anchor matching.

consistency-gate's metrics are single-subject (one alpha cutout, bottom-center); a game
screenshot has no single subject and no alpha, so they do not apply. This measures
COMPOSITION per declared region instead:

- hist_distance: L1 distance of normalized per-channel colour histograms (0 = same palette,
  1 = disjoint). Size-independent, so render and anchor resolutions need not match.
- luma_correlation: Pearson correlation of a downscaled luminance grid (1 = same light/dark
  structure). Tolerant to different art at the pixel level -- it tracks layout/where-things-are,
  not exact pixels. A flat region (no variance) scores 0 by convention.

Regions are fractional boxes {name, x, y, w, h} of each image's own size.
"""
from __future__ import annotations

import math

from PIL import Image

HIST_BINS = 8
LUMA_GRID = 12   # coarse on purpose: gross light/dark LAYOUT, tolerant to different art at the pixel level


def _crop_frac(img: Image.Image, x: float, y: float, w: float, h: float) -> Image.Image:
    W, H = img.size
    box = (round(x * W), round(y * H), round((x + w) * W), round((y + h) * H))
    box = (max(0, box[0]), max(0, box[1]), min(W, box[2]), min(H, box[3]))
    return img.crop(box)


def norm_hist(img: Image.Image, bins: int = HIST_BINS) -> list[float]:
    px = list(img.convert("RGB").get_flattened_data())
    n = len(px) or 1
    step = 256 / bins
    hist = [0.0] * (bins * 3)
    for r, g, b in px:
        hist[int(r / step)] += 1
        hist[bins + int(g / step)] += 1
        hist[bins * 2 + int(b / step)] += 1
    return [v / (n * 3) for v in hist]   # sums to 1 across all 3*bins


def hist_distance(a: list[float], b: list[float]) -> float:
    return round(0.5 * sum(abs(x - y) for x, y in zip(a, b, strict=True)), 4)


def luma_grid(img: Image.Image, n: int = LUMA_GRID) -> list[float]:
    small = img.convert("RGB").resize((n, n), Image.Resampling.LANCZOS)
    return [(r + g + b) / 3.0 for r, g, b in small.get_flattened_data()]


def _pearson(left: list[float], right: list[float]) -> float:
    lm = sum(left) / len(left)
    rm = sum(right) / len(right)
    lc = [v - lm for v in left]
    rc = [v - rm for v in right]
    num = sum(a * b for a, b in zip(lc, rc, strict=True))
    den = math.sqrt(sum(v * v for v in lc) * sum(v * v for v in rc))
    return num / den if den else 0.0


def region_scores(render: Image.Image, anchor: Image.Image, regions: list[dict]) -> dict:
    out = {}
    for reg in regions:
        rc = _crop_frac(render, reg["x"], reg["y"], reg["w"], reg["h"])
        ac = _crop_frac(anchor, reg["x"], reg["y"], reg["w"], reg["h"])
        out[reg["name"]] = {
            "hist_distance": hist_distance(norm_hist(rc), norm_hist(ac)),
            "luma_correlation": round(_pearson(luma_grid(rc), luma_grid(ac)), 4),
        }
    return out
