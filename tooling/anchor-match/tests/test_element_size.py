"""Slice 5: element SIZE match. Each element's footprint as a fraction of the frame
(game) vs the same element as a fraction of the anchor -- the pixel-% method. w_ratio > 1
means the game element is too BIG vs the anchor; < 1 too small."""
from anchor_match.element_size import size_deltas


def test_identical_sizes_are_neutral():
    anchor = {"furnace": {"w": 0.18, "h": 0.42}}
    game = {"furnace": {"w": 0.18, "h": 0.42}}
    d = size_deltas(anchor, game)["furnace"]
    assert d["w_ratio"] == 1.0
    assert d["dw"] == 0.0


def test_oversized_game_element_flags_ratio_over_one():
    anchor = {"furnace": {"w": 0.18, "h": 0.42}}
    game = {"furnace": {"w": 0.255, "h": 0.42}}
    d = size_deltas(anchor, game)["furnace"]
    assert d["w_ratio"] > 1.3          # 0.255 / 0.18 = 1.417 -> clearly too big
    assert round(d["dw"], 3) == 0.075


def test_only_common_elements_compared():
    d = size_deltas({"a": {"w": 0.1, "h": 0.1}}, {"a": {"w": 0.1, "h": 0.1}, "b": {"w": 0.2, "h": 0.2}})
    assert set(d.keys()) == {"a"}
