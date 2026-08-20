"""Slice 1: the magenta keyer. Sword Forge prop cuts are on MAGENTA #FF00FF
(not consistency-gate's green — green keys badly on grey/steel/orange subjects)."""
from PIL import Image

from anchor_match.chroma_key import CHROMA_MAGENTA, key_to_transparent


def test_magenta_is_the_locked_constant():
    assert CHROMA_MAGENTA == (255, 0, 255)


def test_pure_magenta_becomes_transparent_and_subject_stays_opaque():
    img = Image.new("RGB", (3, 3), (255, 0, 255))   # all magenta...
    img.putpixel((1, 1), (128, 128, 128))            # ...except a neutral-grey subject centre
    out = key_to_transparent(img)
    assert out.mode == "RGBA"
    assert out.getpixel((0, 0))[3] == 0              # magenta -> fully transparent
    assert out.getpixel((1, 1))[3] == 255            # grey subject -> fully opaque


def test_despill_pulls_magenta_tint_off_kept_pixels():
    # (180,160,180): r,b do NOT exceed g*1.25 (=200) so it is KEPT, but it carries a
    # magenta tint (min(r,b)-g = 20). Despill halves that excess off r and b -> 170.
    img = Image.new("RGB", (1, 1), (180, 160, 180))
    r, g, b, a = key_to_transparent(img).getpixel((0, 0))
    assert a == 255
    assert (r, b) == (170, 170)
    assert g == 160
