#!/usr/bin/env bash
# Tests for verify-living-docs.sh freshness check (Check A).
# Injects a changed-file list via HOOK_TEST_FILES so no real git/commit is needed.
# A case "expects WARN" if the hook stdout contains WARN; else "expects OK".
set -u
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="$HERE/verify-living-docs.sh"
pass=0; fail=0

check() { # desc  expect(WARN|OK)  files(newline)
  local desc="$1" expect="$2" files="$3" out
  out="$(HOOK_TEST_FILES="$files" bash "$SCRIPT" 2>&1)"
  local got="OK"; echo "$out" | grep -q "WARN" && got="WARN"
  if [ "$got" = "$expect" ]; then pass=$((pass+1)); echo "ok   - $desc"; \
  else fail=$((fail+1)); echo "FAIL - $desc (expected $expect, got $got)"; echo "       out: $out"; fi
}

# Check A - freshness
check "new spec without INDEX -> WARN"            WARN "docs/superpowers/specs/2026-07-01-foo.md"
check "new spec WITH INDEX -> OK"                 OK   "docs/superpowers/specs/2026-07-01-foo.md
docs/INDEX.md"
check "HANDOFF-only (self doc) -> OK"             OK   "HANDOFF.md"
check "CLAUDE-only (self doc) -> OK"              OK   "CLAUDE.md"
check "code-only change -> OK"                    OK   "_paper-prototypes/RuneSurge-FTUE-v5.html"
check "spec + LEARNINGS but no INDEX -> WARN"     WARN "docs/diagrams/x.md
LEARNINGS.md"
check "INDEX-only curation -> OK"                 OK   "docs/INDEX.md"
check "GDD change without INDEX -> WARN"          WARN "docs/01_GDD.md"
check "empty commit -> OK"                        OK   ""
check "new spec WITH ROOT INDEX.md -> OK"         OK   "docs/superpowers/specs/2026-07-01-foo.md
INDEX.md"

# Check B - audit must resolve a ROOT INDEX.md (not only docs/INDEX.md)
AUDIT_TMP="$(mktemp -d)"
mkdir -p "$AUDIT_TMP/docs/superpowers/specs"
printf '# INDEX\n\n- 2026-07-01-foo.md\n' > "$AUDIT_TMP/INDEX.md"
printf '# foo\n' > "$AUDIT_TMP/docs/superpowers/specs/2026-07-01-foo.md"
aout="$(cd "$AUDIT_TMP" && bash "$SCRIPT" --audit 2>&1)"
rm -rf "$AUDIT_TMP"
if echo "$aout" | grep -qi 'no .*INDEX.md'; then
  fail=$((fail+1)); echo "FAIL - audit finds root INDEX.md (reported none)"; echo "       out: $aout"
elif echo "$aout" | grep -q '0 orphan'; then
  pass=$((pass+1)); echo "ok   - audit finds root INDEX.md (0 orphans)"
else
  fail=$((fail+1)); echo "FAIL - audit root INDEX.md unexpected output"; echo "       out: $aout"
fi

# Check B - when the ROOT INDEX.md is the catalog, audit must ALSO scan root-level
# *.md (a stray unreferenced root doc is an orphan), while self-docs are exempt.
ROOTAUD_TMP="$(mktemp -d)"
mkdir -p "$ROOTAUD_TMP/docs"
printf '# INDEX\n\n- README.md\n' > "$ROOTAUD_TMP/INDEX.md"
printf '# design\n' > "$ROOTAUD_TMP/DESIGN.md"          # stray, unreferenced -> orphan
printf '# readme\n' > "$ROOTAUD_TMP/README.md"          # self-doc -> exempt (not an orphan)
rout="$(cd "$ROOTAUD_TMP" && bash "$SCRIPT" --audit 2>&1)"
rm -rf "$ROOTAUD_TMP"
if echo "$rout" | grep -q 'ORPHAN: .*DESIGN.md' && ! echo "$rout" | grep -q 'ORPHAN: .*README.md'; then
  pass=$((pass+1)); echo "ok   - root-catalog audit flags stray root doc, exempts self-docs"
else
  fail=$((fail+1)); echo "FAIL - root-catalog audit missed DESIGN.md or wrongly flagged README.md"; echo "       out: $rout"
fi

# Check A precedence - when docs/INDEX.md EXISTS on disk it is the catalog, so a
# commit that touches only ROOT INDEX.md must still WARN (audit prefers docs/INDEX.md).
FRESH_TMP="$(mktemp -d)"
mkdir -p "$FRESH_TMP/docs"
printf '# INDEX\n' > "$FRESH_TMP/docs/INDEX.md"
fout="$(cd "$FRESH_TMP" && HOOK_TEST_FILES=$'docs/x.md\nINDEX.md' bash "$SCRIPT" 2>&1)"
rm -rf "$FRESH_TMP"
if echo "$fout" | grep -q 'WARN'; then
  pass=$((pass+1)); echo "ok   - root INDEX ignored when docs/INDEX.md is the catalog"
else
  fail=$((fail+1)); echo "FAIL - root INDEX wrongly satisfied freshness while docs/INDEX.md exists"; echo "       out: $fout"
fi

echo "----"
echo "pass=$pass fail=$fail"
[ "$fail" -eq 0 ]
