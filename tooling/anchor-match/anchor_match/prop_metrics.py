"""Single-subject cut fidelity. Silhouette + luminance + colour of one alpha-keyed
cutout vs a canonical crop, normalized bottom-center in a 256px box.

Math is consistency-gate's compute_metrics with the Rose-specific red-pixel carveout
removed (Sword Forge props have no canonical-red convention) -> plain rgb MAE over the
shared visible mask. Keep this math stable; the identity test guards drift.
"""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image


def normalized_actor(path: Path, size: int = 256, padding: int = 8) -> Image.Image:
    image = Image.open(path).convert("RGBA")
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value >= 16 else 0)
    bounds = mask.getbbox()
    if bounds is None:
        raise ValueError(f"{path} contains no visible pixels")
    actor = image.crop(bounds)
    scale = min((size - padding * 2) / actor.width, (size - padding * 2) / actor.height)
    resized = actor.resize(
        (max(1, round(actor.width * scale)), max(1, round(actor.height * scale))),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(resized, ((size - resized.width) // 2, size - padding - resized.height))
    return canvas


def correlation(left: list[float], right: list[float]) -> float:
    left_mean = sum(left) / len(left)
    right_mean = sum(right) / len(right)
    lc = [v - left_mean for v in left]
    rc = [v - right_mean for v in right]
    num = sum(a * b for a, b in zip(lc, rc, strict=True))
    den = math.sqrt(sum(v * v for v in lc) * sum(v * v for v in rc))
    return num / den if den else 0.0


def compute_prop_metrics(canonical_path: Path, subject_path: Path) -> dict[str, float]:
    canonical = normalized_actor(canonical_path)
    subject = normalized_actor(subject_path)
    cpx = list(canonical.get_flattened_data())
    spx = list(subject.get_flattened_data())
    width, height = canonical.size

    cmask = [p[3] >= 16 for p in cpx]
    smask = [p[3] >= 16 for p in spx]
    intersection = sum(1 for a, b in zip(cmask, smask, strict=True) if a and b)
    union = sum(1 for a, b in zip(cmask, smask, strict=True) if a or b)

    mae_sum, mae_n = 0.0, 0
    c_lum, s_lum = [], []
    for cp, sp, cv, sv in zip(cpx, spx, cmask, smask, strict=True):
        cr, cg, cb, ca = cp
        sr, sg, sb, sa = sp
        if cv and sv:
            mae_sum += (abs(cr - sr) + abs(cg - sg) + abs(cb - sb)) / (3 * 255)
            mae_n += 1
        c_lum.append(((cr + cg + cb) / (3 * 255)) * (ca / 255))
        s_lum.append(((sr + sg + sb) / (3 * 255)) * (sa / 255))

    c_rows = [sum(cpx[y * width + x][3] / 255 for x in range(width)) for y in range(height)]
    s_rows = [sum(spx[y * width + x][3] / 255 for x in range(width)) for y in range(height)]
    c_cols = [sum(cpx[y * width + x][3] / 255 for y in range(height)) for x in range(width)]
    s_cols = [sum(spx[y * width + x][3] / 255 for y in range(height)) for x in range(width)]

    return {
        "alpha_iou": round(intersection / union, 4) if union else 0.0,
        "alpha_row_correlation": round(correlation(c_rows, s_rows), 4),
        "alpha_column_correlation": round(correlation(c_cols, s_cols), 4),
        "luminance_correlation": round(correlation(c_lum, s_lum), 4),
        "rgb_mean_absolute_error": round(mae_sum / mae_n, 4) if mae_n else 0.0,
    }
