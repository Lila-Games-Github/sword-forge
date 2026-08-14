"""Spec-driven PASS/FAIL, in consistency-gate's shape: a `minimums` map (observed must
be >=) and a `maximums` map (observed must be <=). A missing observation is a failure.
Adding a metric/region to gate = a spec entry, never a code change.
"""
from __future__ import annotations


def validate(spec: dict, observed: dict) -> dict:
    failures: list[str] = []
    for metric, floor in spec.get("minimums", {}).items():
        if metric not in observed:
            failures.append(f"{metric}: missing (needs >= {floor})")
        elif observed[metric] < floor:
            failures.append(f"{metric}: {observed[metric]} < min {floor}")
    for metric, ceil in spec.get("maximums", {}).items():
        if metric not in observed:
            failures.append(f"{metric}: missing (needs <= {ceil})")
        elif observed[metric] > ceil:
            failures.append(f"{metric}: {observed[metric]} > max {ceil}")
    return {"passed": not failures, "failures": failures}
