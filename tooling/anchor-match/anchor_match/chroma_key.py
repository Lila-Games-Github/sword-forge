"""Magenta chroma keyer for Sword Forge prop cuts.

Lineage: the session algorithm the RND consistency-gate copied, kept on MAGENTA.
consistency-gate locks GREEN #00B140; we use MAGENTA #FF00FF because green keys badly
on the grey/steel/orange subjects here (grinding wheel, cauldron, anvil). See README.

Key rule (per pixel): a pixel is background (-> alpha 0) when BOTH red and blue clearly
dominate green -- min(r,b) > 90 and r > g*1.25 and b > g*1.25. Kept pixels are despilled:
the magenta excess (min(r,b) - g, when positive) is halved off red and blue.
"""
from __future__ import annotations

from PIL import Image

CHROMA_MAGENTA = (255, 0, 255)   # #FF00FF -- LOCKED for this project
KEY_MIN = 90
KEY_RATIO = 1.25


def key_to_transparent(image: Image.Image) -> Image.Image:
    src = image.convert("RGB")
    out = Image.new("RGBA", src.size)
    src_px = list(src.get_flattened_data())
    dst_px = []
    for r, g, b in src_px:
        is_bg = (min(r, b) > KEY_MIN and r > g * KEY_RATIO and b > g * KEY_RATIO)
        if is_bg:
            dst_px.append((0, 0, 0, 0))
            continue
        excess = max(min(r, b) - g, 0) // 2   # despill the magenta cast on kept pixels
        dst_px.append((max(0, r - excess), g, max(0, b - excess), 255))
    out.putdata(dst_px)
    return out
