#!/usr/bin/env python3
"""Single-prop cut fidelity gate (consistency-gate pattern, magenta key).

    python prop_gate.py --canonical <keyed.png> --subject <raw_or_keyed.png> [--key] --spec prop.spec.json

Use to gate a NEW generation of a prop against its approved canonical cutout: keys the
subject if it is still on magenta (--key), measures silhouette + luminance + colour, gates
against the spec's minimums/maximums. Both inputs must end up alpha-keyed (never score a raw
magenta render -- the metrics would measure the background). See README.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image

from anchor_match.chroma_key import key_to_transparent
from anchor_match.gate import validate
from anchor_match.prop_metrics import compute_prop_metrics


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--canonical", type=Path, required=True)
    ap.add_argument("--subject", type=Path, required=True)
    ap.add_argument("--spec", type=Path, required=True)
    ap.add_argument("--key", action="store_true", help="chroma-key the subject (raw on magenta) before scoring")
    ap.add_argument("--out", type=Path, default=Path("out"))
    a = ap.parse_args()
    spec = json.loads(a.spec.read_text())

    subject = a.subject
    a.out.mkdir(parents=True, exist_ok=True)
    if a.key:
        keyed = a.out / (a.subject.stem + "_keyed.png")
        key_to_transparent(Image.open(a.subject)).save(keyed)
        subject = keyed

    metrics = compute_prop_metrics(a.canonical, subject)
    verdict = validate(spec.get("thresholds", spec), metrics)
    result = {"canonical": str(a.canonical), "subject": str(a.subject), "metrics": metrics, **verdict}
    (a.out / "prop_result.json").write_text(json.dumps(result, indent=2))
    print(("PASS" if verdict["passed"] else "FAIL") + "  " + json.dumps(metrics))
    for f in verdict["failures"]:
        print("  - " + f)
    return 0 if verdict["passed"] else 2


if __name__ == "__main__":
    raise SystemExit(main())
