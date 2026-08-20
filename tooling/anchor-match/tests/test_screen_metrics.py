"""Slice 3: region-localized composition diff (the piece consistency-gate lacks).
Per region: colour-histogram distance (palette match) + downscaled-luminance
correlation (structure match). Tolerant of the render using different art than the
anchor at the pixel level -- so it measures composition, not a naive whole-frame SSIM."""
from PIL import Image

from anchor_match.screen_metrics import region_scores

FULL = [{"name": "full", "x": 0.0, "y": 0.0, "w": 1.0, "h": 1.0}]


def _hgrad(w=64, h=64):
    img = Image.new("RGB", (w, h))
    img.putdata([(int(x / (w - 1) * 255),) * 3 for y in range(h) for x in range(w)])
    return img


def test_identical_region_is_perfect():
    g = _hgrad()
    s = region_scores(g, g, FULL)["full"]
    assert s["hist_distance"] == 0.0
    assert s["luma_correlation"] == 1.0


def test_flat_render_loses_structure_correlation():
    flat = Image.new("RGB", (64, 64), (128, 128, 128))
    s = region_scores(flat, _hgrad(), FULL)["full"]
    assert s["luma_correlation"] < 0.5      # no gradient -> no structural match
    assert s["hist_distance"] > 0.1


def test_palette_tint_shows_in_hist_not_structure():
    g = _hgrad()
    tint = Image.new("RGB", (64, 64))
    tint.putdata([(r, gg, min(255, b + 40)) for (r, gg, b) in g.get_flattened_data()])
    s = region_scores(tint, g, FULL)["full"]
    assert s["hist_distance"] > 0.05        # palette shifted...
    assert s["luma_correlation"] > 0.9      # ...but the left-right structure is intact
