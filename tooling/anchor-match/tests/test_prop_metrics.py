"""Slice 2: single-subject cut fidelity (silhouette + luminance + colour), on
alpha-keyed cutouts. Math adapted from consistency-gate (no Rose red carveout)."""
from PIL import Image

from anchor_match.prop_metrics import compute_prop_metrics


def _square(path, size=120, colour=(140, 140, 140), notch=False):
    img = Image.new("RGBA", (200, 200), (0, 0, 0, 0))
    for y in range(40, 40 + size):
        for x in range(40, 40 + size):
            if notch and x < 40 + size // 2 and y < 40 + size // 2:
                continue   # cut the top-left quadrant -> a different silhouette
            img.putpixel((x, y), (*colour, 255))
    img.save(path)
    return path


def test_identical_cut_scores_perfect(tmp_path):
    p = _square(tmp_path / "a.png")
    m = compute_prop_metrics(p, p)
    assert m["alpha_iou"] == 1.0
    assert m["alpha_row_correlation"] == 1.0
    assert m["alpha_column_correlation"] == 1.0
    assert m["luminance_correlation"] == 1.0
    assert m["rgb_mean_absolute_error"] == 0.0


def test_different_silhouette_drops_iou(tmp_path):
    a = _square(tmp_path / "a.png")
    b = _square(tmp_path / "b.png", notch=True)
    m = compute_prop_metrics(a, b)
    assert m["alpha_iou"] < 0.9          # a quarter of the mass is missing


def test_colour_shift_raises_mae_but_not_silhouette(tmp_path):
    a = _square(tmp_path / "a.png", colour=(140, 140, 140))
    b = _square(tmp_path / "b.png", colour=(40, 40, 200))   # same shape, blue
    m = compute_prop_metrics(a, b)
    assert m["alpha_iou"] == 1.0
    assert m["rgb_mean_absolute_error"] > 0.1
