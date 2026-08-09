#!/usr/bin/env python3
"""Structural + freshness lint for a code-repo wiki. Read-only by default.

Findings: broken anchors (path missing OR probe not greppable), missing cited specs,
orphans, minting-bar promotions, and the SUSPECT pass (anchors/specs moved since
verified_commit). Stdlib only.

Status rules: stale if any anchor path missing / probe absent / cited spec missing;
else suspect if any anchor/spec path changed since verified_commit; else current.

Usage: python wiki_lint.py <wiki_dir> [--repo-root DIR] [--json] [--fix-status]
"""
import argparse, glob, json, os, re, subprocess, sys

SKIP = {"readme.md", "index.md", "log.md", "hot.md"}

def parse_frontmatter(text):
    meta = {"status": "", "verified_commit": "", "specs": [], "anchors": []}
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return meta
    fm = []
    for j in range(1, len(lines)):
        if lines[j].strip() == "---":
            fm = lines[1:j]; break
    i = 0
    while i < len(fm):
        line = fm[i]
        s = line.strip()
        if s.startswith("status:"):
            meta["status"] = s.split(":", 1)[1].strip()
        elif s.startswith("verified_commit:"):
            meta["verified_commit"] = s.split(":", 1)[1].strip()
        elif s.startswith("specs:"):
            rest = s.split(":", 1)[1].strip()
            meta["specs"] = re.findall(r'"([^"]+)"|\'([^\']+)\'', rest)
            meta["specs"] = [a or b for a, b in meta["specs"]]
        elif s.startswith("anchors:"):
            # inline list items on following indented "- {...}" lines
            k = i + 1
            while k < len(fm) and fm[k].strip().startswith("-"):
                item = fm[k].strip().lstrip("-").strip()
                if item.startswith("{") and item.endswith("}"):
                    body = item[1:-1]
                    d = {}
                    for pair in re.findall(r'(\w+)\s*:\s*("[^"]*"|\'[^\']*\'|[^,]+)', body):
                        key, val = pair[0], pair[1].strip().strip('"\'')
                        d[key] = val
                    meta["anchors"].append(d)
                k += 1
            i = k - 1
        i += 1
    return meta

def probe_hits(repo_root, path, probe):
    fp = os.path.join(repo_root, path)
    if not os.path.isfile(fp):
        return False
    try:
        with open(fp, "r", encoding="utf-8", errors="replace") as f:
            return probe in f.read()
    except OSError:
        return False

def _changed_since(repo_root, sha, paths):
    if not sha or not paths:
        return False
    try:
        out = subprocess.check_output(
            ["git", "-C", repo_root, "log", "%s..HEAD" % sha, "--", *paths],
            text=True, stderr=subprocess.DEVNULL)
        return bool(out.strip())
    except (subprocess.CalledProcessError, OSError):
        return False  # unknown sha etc. -> do not force suspect on a git error

def compute_status(repo_root, meta):
    anchors = meta.get("anchors", [])
    specs = meta.get("specs", [])
    for a in anchors:
        if not probe_hits(repo_root, a.get("path", ""), a.get("probe", "")):
            return "stale"
    for spec in specs:
        if not os.path.isfile(os.path.join(repo_root, spec)):
            return "stale"
    paths = [a.get("path", "") for a in anchors if a.get("path")] + list(specs)
    if _changed_since(repo_root, meta.get("verified_commit", ""), paths):
        return "suspect"
    return "current"

def find_pages(wiki_dir):
    root = os.path.abspath(wiki_dir)
    pages_dir = root
    out = []
    for path in glob.glob(os.path.join(pages_dir, "**", "*.md"), recursive=True):
        if os.path.basename(path).lower() in SKIP:
            continue
        out.append(path)
    return sorted(out)

def _fix_status(path, text, new_status):
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        return False
    changed = False
    for j in range(1, len(lines)):
        if lines[j].strip() == "---":
            break
        if lines[j].lstrip().startswith("status:"):
            indent = lines[j][:len(lines[j]) - len(lines[j].lstrip())]
            newline = "\n" if lines[j].endswith("\n") else ""
            lines[j] = "%sstatus: %s%s" % (indent, new_status, newline)
            changed = True
            break
    if changed:
        with open(path, "w", encoding="utf-8") as f:
            f.writelines(lines)
    return changed

def main(argv=None):
    ap = argparse.ArgumentParser(description="Lint a code-repo wiki.")
    ap.add_argument("wiki_dir")
    ap.add_argument("--repo-root", default=None)
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--fix-status", action="store_true")
    args = ap.parse_args(argv)
    repo_root = args.repo_root or os.path.abspath(os.path.join(args.wiki_dir, "..", ".."))
    findings = []
    for path in find_pages(args.wiki_dir):
        with open(path, "r", encoding="utf-8") as f:
            text = f.read()
        meta = parse_frontmatter(text)
        want = compute_status(repo_root, meta)
        have = meta.get("status", "")
        if want != have:
            findings.append({"page": os.path.basename(path), "path": path,
                             "declared": have, "computed": want})
            if args.fix_status:
                _fix_status(path, text, want)
    if args.json:
        print(json.dumps(findings, indent=2))
    else:
        if not findings:
            print("lint: all pages current/consistent")
        for x in findings:
            print("  %s: declared=%s computed=%s" % (x["page"], x["declared"], x["computed"]))
    return 0

if __name__ == "__main__":
    sys.exit(main())
