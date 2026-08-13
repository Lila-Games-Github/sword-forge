#!/usr/bin/env python3
"""Keyword-search a code-repo wiki and return ranked pages with summaries.

Triage aid for the code-mode Query op: scans docs/wiki/*.md (recursive; skips
index/log/README), scores each page against the query terms, prints the top matches.
Stdlib only, cross-platform.

Scoring: +3 term in title, +2 term in summary, +1 per body occurrence
(body EXCLUDES the title and summary lines), +1 if all terms present (>1 term).

Usage: python search_wiki.py <wiki_dir> "query terms" [--top N] [--json]
<wiki_dir> may be a dir containing wiki/ or the wiki/docs-wiki folder itself.
"""
import argparse, glob, json, os, re, sys

SKIP = {"readme.md", "index.md", "log.md", "hot.md"}

def find_wiki_pages(wiki_dir):
    root = os.path.abspath(wiki_dir)
    candidates = [os.path.join(root, "wiki"), root]
    pages_dir = next((c for c in candidates if os.path.isdir(c)), root)
    files = []
    if not os.path.isdir(pages_dir):
        return files
    for path in glob.glob(os.path.join(pages_dir, "**", "*.md"), recursive=True):
        if os.path.basename(path).lower() in SKIP:
            continue
        files.append(path)
    return sorted(files)

def extract_title_and_summary(text, fallback_name):
    title, summary, summary_line = fallback_name, "", ""
    lines = text.splitlines()
    i = 0
    if lines and lines[0].strip() == "---":
        for j in range(1, len(lines)):
            if lines[j].strip() == "---":
                i = j + 1
                break
    seen_title = False
    title_line = ""
    for line in lines[i:]:
        s = line.strip()
        if not seen_title:
            if s.startswith("# "):
                title = s[2:].strip(); title_line = line; seen_title = True
            continue
        if not s or s.startswith("#"):
            continue
        summary = s; summary_line = line
        break
    return title, summary, title_line, summary_line

def score_page(text, title, summary, title_line, summary_line, terms):
    # body EXCLUDES the exact title and summary lines (codex: no double count)
    body_lines = []
    removed_title = removed_summary = False
    for line in text.splitlines():
        if not removed_title and line == title_line:
            removed_title = True; continue
        if not removed_summary and line == summary_line:
            removed_summary = True; continue
        body_lines.append(line)
    body = "\n".join(body_lines).lower()
    title_l, summary_l = title.lower(), summary.lower()
    score, hits, all_present = 0, [], True
    for term in terms:
        t = term.lower()
        in_title, in_summary = t in title_l, t in summary_l
        body_count = body.count(t)
        if in_title: score += 3
        if in_summary: score += 2
        score += body_count
        if body_count == 0 and not in_title and not in_summary:
            all_present = False
        else:
            where = []
            if in_title: where.append("title")
            if in_summary: where.append("summary")
            if body_count: where.append("body x%d" % body_count)
            hits.append("%s (%s)" % (term, ", ".join(where)))
    if all_present and len(terms) > 1:
        score += 1
    return score, hits

def main():
    ap = argparse.ArgumentParser(description="Search a code-repo wiki.")
    ap.add_argument("wiki_dir"); ap.add_argument("query")
    ap.add_argument("--top", type=int, default=8); ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    terms = [t for t in re.split(r"\s+", args.query.strip()) if t]
    if not terms:
        print("No query terms provided.", file=sys.stderr); return 1
    pages = find_wiki_pages(args.wiki_dir)
    results = []
    for path in pages:
        try:
            with open(path, "r", encoding="utf-8") as f: text = f.read()
        except OSError:
            continue
        name = os.path.splitext(os.path.basename(path))[0]
        title, summary, tl, sl = extract_title_and_summary(text, name)
        score, hits = score_page(text, title, summary, tl, sl, terms)
        if score > 0:
            results.append({"path": path, "page": name, "title": title,
                            "summary": summary, "score": score, "hits": hits})
    results.sort(key=lambda r: (-r["score"], r["page"]))
    results = results[:args.top]
    if args.json:
        print(json.dumps(results, indent=2)); return 0
    if not results:
        print("No matches for %r across %d wiki page(s)." % (terms, len(pages)))
        return 0
    print("Top %d of %d wiki page(s) for %r:\n" % (len(results), len(pages), terms))
    for r in results:
        print("  [%3d] [[%s]]  - %s" % (r["score"], r["page"], r["title"]))
        if r["summary"]: print("        %s" % r["summary"])
        print("        matched: %s" % "; ".join(r["hits"]))
        print("        path: %s\n" % r["path"])
    return 0

if __name__ == "__main__":
    sys.exit(main())
