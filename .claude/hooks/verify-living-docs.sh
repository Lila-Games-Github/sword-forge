#!/usr/bin/env bash
# Living-docs verifier. Non-blocking (always exits 0). See
# docs/superpowers/specs/2026-07-01-living-docs-sync-policy-design.md
#
# Default mode  : Check A (freshness) on the just-made commit (HEAD).
#                 Wired as a Claude Code PostToolUse hook on `git commit`.
# --audit       : Check B (drift) - orphan + stale-banner scan across docs/.
#                 Run on demand or at session-close.
#
# Testable: set HOOK_TEST_FILES to a newline-separated changed-file list to
# bypass git (used by verify-living-docs.test.sh).
set -u

# Living docs that maintain themselves - changing them does NOT require an INDEX entry.
is_self() {
  case "$1" in
    CLAUDE.md|HANDOFF.md|README.md|docs/INDEX.md|LEARNINGS.md) return 0 ;;
    *) return 1 ;;
  esac
}
# A "doc" = a .md under docs/ or a root-level .md.
is_doc() {
  case "$1" in
    docs/*.md|docs/**/*.md) return 0 ;;
    */*) return 1 ;;          # any other nested path is not a root .md
    *.md) return 0 ;;         # root-level .md
    *) return 1 ;;
  esac
}

changed_files() {
  if [ "${HOOK_TEST_FILES+x}" = "x" ]; then
    printf '%s\n' "$HOOK_TEST_FILES"
  else
    git diff-tree --no-commit-id --name-only -r HEAD 2>/dev/null
  fi
}

check_freshness() {
  local content_docs=0 index_touched=0 f
  # INDEX precedence must match check_audit: docs/INDEX.md is the catalog when it
  # exists; a root INDEX.md only counts when docs/INDEX.md is absent. Otherwise a
  # commit touching only root INDEX.md would suppress the warning while audit reads
  # docs/INDEX.md (two competing catalogs).
  local docs_index_exists=0; [ -f "docs/INDEX.md" ] && docs_index_exists=1
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    if [ "$f" = "docs/INDEX.md" ]; then index_touched=1; fi
    if [ "$f" = "INDEX.md" ] && [ "$docs_index_exists" -eq 0 ]; then index_touched=1; fi
    if is_doc "$f" && ! is_self "$f"; then content_docs=$((content_docs+1)); fi
  done < <(changed_files)

  if [ "$content_docs" -gt 0 ] && [ "$index_touched" -eq 0 ]; then
    echo "[living-docs] WARN: this commit changed doc(s) but not docs/INDEX.md."
    echo "[living-docs]   Reflect the add/change/supersede in docs/INDEX.md (+ LEARNINGS.md if a lesson was learned)."
    echo "[living-docs]   Policy: docs/superpowers/specs/2026-07-01-living-docs-sync-policy-design.md"
  fi
  return 0
}


# Trees INDEX catalogues by hand. docs/research is indexed as a BLOCK by design
# (see docs/INDEX.md "The research corpus"), so it is excluded from the file-by-file scan.
# Override with LIVING_DOCS_EXCLUDE (an -path glob passed to find).
AUDIT_EXCLUDE="${LIVING_DOCS_EXCLUDE:-docs/research/*}"

check_audit() {
  local index orphans=0 f base
  if [ -f "docs/INDEX.md" ]; then index="docs/INDEX.md"; elif [ -f "INDEX.md" ]; then index="INDEX.md"; else echo "[living-docs] WARN: no INDEX.md (root or docs/) found."; return 0; fi
  # Orphans: every catalogued docs/**/*.md should be referenced by basename in INDEX.
  # Annotate any orphan that self-declares a SUPERSEDED/DEPRECATED banner in its header
  # (first 8 lines) - those most need an INDEX status line.
  # Self-docs maintain themselves and need no INDEX entry (mirror is_self, root form).
  local self_docs="README.md CLAUDE.md HANDOFF.md LEARNINGS.md INDEX.md"
  while IFS= read -r f; do
    base="$(basename "$f")"
    [ "$f" = "$index" ] && continue
    case " $self_docs " in *" $base "*) continue ;; esac
    if ! grep -qF "$base" "$index"; then
      local tag=""
      head -8 "$f" 2>/dev/null | grep -qiE "supersed|deprecat|\bstale\b" && tag="  [header self-declares superseded/deprecated]"
      echo "[living-docs] ORPHAN: $f not referenced in $index.$tag"; orphans=$((orphans+1))
    fi
  done < <(
    find docs -type f -name '*.md' -not -path "$AUDIT_EXCLUDE" 2>/dev/null
    # When the ROOT INDEX.md is the catalog, root-level docs are catalogued too.
    [ "$index" = "INDEX.md" ] && find . -maxdepth 1 -type f -name '*.md' 2>/dev/null | sed 's|^\./||'
  )
  echo "[living-docs] audit: $orphans orphan(s) in catalogued trees (docs/research excluded by design)."
  return 0
}

case "${1:-}" in
  --audit) check_audit ;;
  --hook)
    # PostToolUse payload arrives as JSON on stdin. Only act on a git commit.
    payload="$(cat 2>/dev/null)"
    printf '%s' "$payload" | grep -q "git commit" || exit 0
    check_freshness ;;
  *) check_freshness ;;   # bare call (also the test entry via HOOK_TEST_FILES)
esac
exit 0
