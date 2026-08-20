"""Slice 4: spec-driven gate (consistency-gate's minimums/maximums shape).
A new subject/region = a new spec entry, no code change."""
from anchor_match.gate import validate

SPEC = {"minimums": {"luma_correlation": 0.9}, "maximums": {"hist_distance": 0.2}}


def test_passes_when_within_thresholds():
    r = validate(SPEC, {"luma_correlation": 0.95, "hist_distance": 0.1})
    assert r["passed"] is True
    assert r["failures"] == []


def test_boundary_values_pass():
    r = validate(SPEC, {"luma_correlation": 0.9, "hist_distance": 0.2})
    assert r["passed"] is True


def test_minimum_violation_fails_and_names_it():
    r = validate(SPEC, {"luma_correlation": 0.5, "hist_distance": 0.1})
    assert r["passed"] is False
    assert any("luma_correlation" in f for f in r["failures"])


def test_maximum_violation_fails():
    r = validate(SPEC, {"luma_correlation": 0.95, "hist_distance": 0.4})
    assert r["passed"] is False
    assert any("hist_distance" in f for f in r["failures"])


def test_missing_observation_fails():
    r = validate(SPEC, {"luma_correlation": 0.95})
    assert r["passed"] is False
