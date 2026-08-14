#!/usr/bin/env python3
"""Whole-screen anchor-match gate (region-localized, deterministic, no LLM).

    python screen_gate.py --render <png> --anchor <jpg> --spec spec.hori.json --out out/

Crops render + anchor to each spec region, scores palette (hist_distance) + structure
(luma_correlation), gates each region against the spec thresholds, and writes:
  out/screen_result.json   machine-readable per-region scores + pass/fail
  out/review.png           the render with region boxes coloured green(pass)/red(fail) + scores

The overall score is the mean structure-correlation across regions (0..100), reported so a
loop can watch it climb. This REPLACES the subjective Opus 0-100 as the loop's gate; keep an
LLM only as a subjective tie-breaker on top.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw

from anchor_match.gate import validate
from anchor_match.screen_metrics import region_scores


def run(render_path: Path, anchor_path: Path, spec: dict) -> dict:
    render = Image.open(render_path).convert("RGB")
    anchor = Image.open(anchor_path).convert("RGB")
    scores = region_scores(render, anchor, spec["regions"])
    thresholds = spec.get("thresholds", {})
    regions_out, corr_sum, pal_sum = [], 0.0, 0.0
    for reg in spec["regions"]:
        s = scores[reg["name"]]
        verdict = validate(thresholds, s)
        corr_sum += s["luma_correlation"]
        pal_sum += (1.0 - s["hist_distance"])
        regions_out.append({"name": reg["name"], **s, "passed": verdict["passed"], "failures": verdict["failures"]})
    n = len(spec["regions"])
    # headline = palette match (robust across differing art); structure = coarse layout (secondary hint)
    return {
        "overall_palette_score": round(pal_sum / n * 100, 1),
        "overall_structure_score": round(corr_sum / n * 100, 1),
        "regions": regions_out,
    }


def draw_review(render_path: Path, spec: dict, result: dict, out_png: Path) -> None:
    img = Image.open(render_path).convert("RGB")
    W, H = img.size
    d = ImageDraw.Draw(img, "RGBA")
    by_name = {r["name"]: r for r in result["regions"]}
    for reg in spec["regions"]:
        r = by_name[reg["name"]]
        box = (round(reg["x"] * W), round(reg["y"] * H), round((reg["x"] + reg["w"]) * W), round((reg["y"] + reg["h"]) * H))
        colour = (80, 220, 120, 255) if r["passed"] else (235, 80, 80, 255)
        d.rectangle(box, outline=colour, width=3)
        d.text((box[0] + 4, box[1] + 3), f"{reg['name']} L{r['luma_correlation']:.2f} H{r['hist_distance']:.2f}",
               fill=colour)
    out_png.parent.mkdir(parents=True, exist_ok=True)
    img.save(out_png)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--render", type=Path, required=True)
    ap.add_argument("--anchor", type=Path)
    ap.add_argument("--spec", type=Path, required=True)
    ap.add_argument("--out", type=Path, default=Path("out"))
    a = ap.parse_args()
    spec = json.loads(a.spec.read_text())
    anchor = a.anchor or (a.spec.parent.parent.parent / spec["anchor"])
    result = run(a.render, anchor, spec)
    a.out.mkdir(parents=True, exist_ok=True)
    (a.out / "screen_result.json").write_text(json.dumps(result, indent=2))
    draw_review(a.render, spec, result, a.out / "review.png")
    print(f"palette match {result['overall_palette_score']}/100   (structure hint {result['overall_structure_score']}/100)")
    for r in sorted(result["regions"], key=lambda r: -r["hist_distance"]):   # worst palette first
        flag = "ok " if r["passed"] else "FAIL"
        print(f"  {flag} {r['name']:<10} hist {r['hist_distance']:.3f}  (luma {r['luma_correlation']:+.3f})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
