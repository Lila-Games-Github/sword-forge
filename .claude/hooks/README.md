# .claude/hooks

## verify-living-docs (living-docs sync verifier)

Non-blocking guard that keeps `docs/INDEX.md` + `LEARNINGS.md` synced with the doc set.
Policy + rationale: [`docs/superpowers/specs/2026-07-01-living-docs-sync-policy-design.md`](../../docs/superpowers/specs/2026-07-01-living-docs-sync-policy-design.md).

- **`verify-living-docs.sh`** - PRIMARY. Wired in [`../settings.json`](../settings.json) as a
  `PostToolUse` hook on `Bash|PowerShell`; it reads the hook payload, acts only on a `git commit`,
  and warns (never blocks) if the commit changed a doc without touching `docs/INDEX.md`.
- **`verify-living-docs.ps1`** - FALLBACK for hosts without Git Bash on PATH. Same behavior. If you
  switch to it, change the `settings.json` command to
  `powershell -NoProfile -File "$CLAUDE_PROJECT_DIR/.claude/hooks/verify-living-docs.ps1" --hook`.
- **`verify-living-docs.test.sh`** - Check-A test suite (9 cases). Run: `bash .claude/hooks/verify-living-docs.test.sh`.

### Modes
- (via hook) freshness on the just-made commit.
- `--audit` - orphan scan across catalogued `docs/` (research corpus excluded by design; override with
  `LIVING_DOCS_EXCLUDE`). Run on demand or at session-close: `bash .claude/hooks/verify-living-docs.sh --audit`.

### New repo
Copy this dir + `settings.json` hook block, create `INDEX.md` + `LEARNINGS.md`. See the global
`~/.claude/CLAUDE.md` living-docs rule.
