"""Element SIZE match (the pixel-% method).

For each element present in BOTH maps, compare its footprint as a fraction of its own
image: game (fraction of the game #frame) vs anchor (fraction of the anchor image).

    w_ratio = game_w / anchor_w   (>1 = game element too big, <1 too small)
    dw      = game_w - anchor_w   (signed, in frame fractions)

This is what was missing: LAYOUT widths were eyeballed, never matched to the anchor's
own element percentages. Feed anchor boxes (spec `element_boxes`) + game boxes
(SFM.frameBoxes via `?bbox`) here to see, per element, how far off the size is and which
way to correct it.
"""
from __future__ import annotations


def size_deltas(anchor: dict, game: dict) -> dict:
    out = {}
    for name in anchor:
        if name not in game:
            continue
        a, g = anchor[name], game[name]
        out[name] = {
            "anchor_w": a["w"], "game_w": g["w"],
            "anchor_h": a["h"], "game_h": g["h"],
            "dw": round(g["w"] - a["w"], 4),
            "dh": round(g["h"] - a["h"], 4),
            "w_ratio": round(g["w"] / a["w"], 3) if a["w"] else 0.0,
            "h_ratio": round(g["h"] / a["h"], 3) if a["h"] else 0.0,
        }
    return out
