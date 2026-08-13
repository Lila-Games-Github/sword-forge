# /wiki (code-repo)

An LLM-maintained navigation layer over this code repo, under `docs/wiki/`.
Pages are ROUTERS into the code, never restatements. The spec chain is canon;
a page is a map. Full schema: `docs/wiki/README.md`. Config: `docs/wiki/wiki.config.json`.

## Setup
Target root = `git rev-parse --show-toplevel`. If `docs/wiki/` is absent, offer `adopt`.

## Verbs
- **adopt**: adopt is normally already run once to create this wiki (that is why
  this SKILL.md exists in the repo). To re-adopt, repair, or upgrade, run the
  installer from the code-repo PROFILE SOURCE (the template distributable this repo
  was adopted from), not from a script inside this adopted repo (the installer's
  `adopt.py` is not copied in; only `search_wiki.py` + `wiki_lint.py` are). From the
  target repo root: `python <path-to-profile>/profiles/code-repo/skill/scripts/adopt.py
  --target .`. It preflights every safety check, refuses (exit 2, repo unchanged) on
  any failure, else installs the skeleton + this skill + search engine + routing
  pointers + manifest. Then offer the seeding ingest.
- **ingest** (codebase): CANON-FIRST. Read `docs/INDEX.md`'s canon table + the current
  SSOT/GDD + the LATEST dated specs (per wiki.config.json spec_roots), NOT a blind read
  of every spec (superseded specs seeded as fact are wrong; read them only for rationale).
  Verify claims against the code + tests. IGNORE stale in-file doc-headers; trust the
  instruction files + specs. Concept/system-first, ~20-40 pages, cap per pass; merge by
  normalized topic before creating (no duplicate concept vs entity pages); ask before
  exceeding the budget. Each page gets structured anchors {kind, path, probe},
  `verified_commit: <HEAD sha>`, `status: current`, and repo-relative `specs`.
- **query**: read `docs/wiki/index.md`, then
  `python .claude/skills/wiki/scripts/search_wiki.py docs/wiki "<terms>"` for ranked
  triage; drill the top pages, follow [[links]]. BEFORE asserting behavior: (1) re-check
  the page's freshness - if any anchor path or cited spec changed since `verified_commit`
  (`git log <verified_commit>..HEAD -- <paths>`), treat the page as SUSPECT and re-verify;
  (2) grep the governing spec + the cited anchor probe (grep-before-assert). Answer with
  citations + anchors. Offer to file a durable answer back as a synthesis (a MUTATION - log it).
- **lint**: run `python .claude/skills/wiki/scripts/wiki_lint.py docs/wiki`. It reports
  broken [[links]], missing/invalid anchors (path gone OR probe no longer greps), pages
  citing a non-existent spec, orphans, minting-bar promotions (concept with >=2 referrers
  but no page; cap 5 new pages/pass), and the SUSPECT pass (pages whose anchors/specs moved
  since `verified_commit`). Fix structural findings; flag semantic ones for human/LLM follow-up.

## Rules
- No em-dashes (U+2014) in authored pages.
- `log.md` records MUTATIONS only; never dirty the repo for a read-only query.
- SUBORDINATE-TO-SPECS: on a page/spec conflict, the spec wins; flag the page stale, never
  edit the spec. Do NOT touch `docs/INDEX.md` (theirs); `docs/wiki/index.md` is ours.
- This skill is thin: operation detail lives in `docs/wiki/README.md`, which wins on conflict.
