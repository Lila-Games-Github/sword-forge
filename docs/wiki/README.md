---
type: index
updated: 0000-00-00
tags: [wiki, code-repo]
status: active
---

# Code Wiki - Maintainer Schema

An LLM-maintained navigation layer over this code repo. Pages are ROUTERS into
the code (systems + where their code lives), never restatements of it. The spec
chain is the source of truth; a wiki page is a map, never the territory.

## Zones
- `docs/wiki/concepts/` - system/technique pages.
- `docs/wiki/entities/` - subsystems, tools, key types.
- `docs/wiki/syntheses/` - cross-cutting essays / filed-back answers.
- `docs/wiki/index.md` - navigation catalog (coexists with docs/INDEX.md; never merged).
- `docs/wiki/log.md` - append-only op log (log MUTATIONS only, never read-only queries).
- `docs/wiki/wiki.config.json` - what to scan and which spec chain is canonical.

## Page frontmatter
    ---
    type: concept | entity | synthesis
    updated: YYYY-MM-DD
    layer: derived            # ALWAYS - these pages are derived navigation, never canon
    status: current | suspect | stale
    verified_commit: <full-sha>   # commit at which anchors/specs were last verified
    specs: ["docs/some/governing-spec.md"]   # repo-relative canonical spec path(s)
    anchors:                  # structured, greppable - see below
      - {kind: gd-func, path: alpha/widget.gd, probe: "func _ready"}
    related: ["[[Other Page]]"]
    tags: [subsystem]
    ---

## Anchors (structured, greppable)
Each anchor is `{kind, path, probe}`:
- `kind` in gd-func | scene-node | json-key | gut-test | file.
- `path` is repo-relative.
- `probe` is the literal token that greps at the definition (e.g. `func _ready`,
  a node name in a `.tscn`, a JSON key, a test function). NOT a line number.
A page is CURRENT only if every anchor's probe still greps at its path.

## Subordinate-to-specs (load-bearing)
The dated spec chain WINS on any conflict. On a page/spec conflict, lint flags the
page stale; it NEVER edits the spec. Every page states this.

## Freshness
`verified_commit` records where the page was last checked. If any anchor path or
cited spec changed since `verified_commit` (`git log <verified_commit>..HEAD -- <paths>`),
the page is SUSPECT (re-verify before asserting). If an anchor path is gone or its
probe no longer greps, or a cited spec is missing, the page is STALE.

## Ops (code-mode /wiki)
- `adopt` - the installer (already run to create this wiki).
- `ingest` (codebase) - canon-first (docs/INDEX.md canon table + current SSOT/GDD +
  LATEST dated specs, not a blind read of all specs); verify against code + tests;
  ignore stale in-file doc-headers; concept/system-first, ~20-40 pages, cap per pass.
- `query` - read index.md, run search_wiki.py for ranked triage, drill top pages;
  BEFORE asserting behavior re-check verified_commit vs anchor/spec paths and grep the
  governing spec + cited probe; answer with citations; file durable answers back (log it).
- `lint` - run wiki_lint.py: broken [[links]], missing/invalid anchors, missing specs,
  orphans, minting-bar promotion (>=2 referrers, cap 5/pass), and the suspect pass.

## Consumption (the payoff)
BEFORE grepping the codebase to understand a system, consult docs/wiki/index.md and
run `python .claude/skills/wiki/scripts/search_wiki.py docs/wiki "<terms>"`. That routing
is the token saving this wiki exists for.
