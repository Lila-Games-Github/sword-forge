# Living-docs verifier - PowerShell FALLBACK for hosts without Git Bash on PATH.
# The Bash twin (verify-living-docs.sh) is the primary; keep the two in sync.
# Non-blocking (always exits 0). Policy: docs/superpowers/specs/2026-07-01-living-docs-sync-policy-design.md
#
# Modes:  --hook (reads PostToolUse JSON on stdin, acts only on `git commit`)
#         --audit (orphan scan across catalogued docs/, research excluded)
#         (bare) freshness check on HEAD
# Test:   set env HOOK_TEST_FILES to a newline-separated changed-file list.
param([string]$Mode = "")

$Self = @('CLAUDE.md','HANDOFF.md','README.md','docs/INDEX.md','LEARNINGS.md')

function Is-Doc([string]$f) {
  if ($f -match '^docs/.*\.md$') { return $true }
  if ($f -match '/') { return $false }
  return ($f -match '\.md$')
}

function Get-ChangedFiles {
  if ($null -ne $env:HOOK_TEST_FILES) { return $env:HOOK_TEST_FILES -split "`n" }
  return (git diff-tree --no-commit-id --name-only -r HEAD 2>$null) -split "`n"
}

function Check-Freshness {
  $content = 0; $indexTouched = $false
  # INDEX precedence must match Check-Audit: docs/INDEX.md is the catalog when it
  # exists; a root INDEX.md only counts when docs/INDEX.md is absent.
  $docsIndexExists = Test-Path 'docs/INDEX.md'
  foreach ($f in Get-ChangedFiles) {
    $f = $f.Trim(); if ([string]::IsNullOrEmpty($f)) { continue }
    if ($f -eq 'docs/INDEX.md') { $indexTouched = $true }
    if (($f -eq 'INDEX.md') -and (-not $docsIndexExists)) { $indexTouched = $true }
    if ((Is-Doc $f) -and ($Self -notcontains $f)) { $content++ }
  }
  if (($content -gt 0) -and (-not $indexTouched)) {
    Write-Output "[living-docs] WARN: this commit changed doc(s) but not docs/INDEX.md."
    Write-Output "[living-docs]   Reflect the add/change/supersede in docs/INDEX.md (+ LEARNINGS.md if a lesson was learned)."
    Write-Output "[living-docs]   Policy: docs/superpowers/specs/2026-07-01-living-docs-sync-policy-design.md"
  }
}

function Check-Audit {
  $index = if (Test-Path 'docs/INDEX.md') { 'docs/INDEX.md' } elseif (Test-Path 'INDEX.md') { 'INDEX.md' } else { $null }
  if ($null -eq $index) { Write-Output "[living-docs] WARN: no INDEX.md (root or docs/) found."; return }
  $idx = Get-Content $index -Raw
  $orphans = 0
  $selfDocs = @('README.md','CLAUDE.md','HANDOFF.md','LEARNINGS.md','INDEX.md')
  $docs = @(Get-ChildItem -Path docs -Recurse -Filter *.md -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '[\\/]research[\\/]' })
  # When the ROOT INDEX.md is the catalog, root-level docs are catalogued too.
  if ($index -eq 'INDEX.md') {
    $docs += @(Get-ChildItem -Path . -Filter *.md -File -ErrorAction SilentlyContinue)
  }
  $docs |
    ForEach-Object {
      if ($selfDocs -contains $_.Name) { return }
      if (-not $idx.Contains($_.Name)) {
        $tag = ""
        $head = Get-Content $_.FullName -TotalCount 8 -ErrorAction SilentlyContinue
        if ($head -match 'supersed|deprecat|stale') { $tag = "  [header self-declares superseded/deprecated]" }
        Write-Output ("[living-docs] ORPHAN: {0} not referenced in {1}.{2}" -f $_.FullName, $index, $tag)
        $orphans++
      }
    }
  Write-Output "[living-docs] audit: $orphans orphan(s) in catalogued trees (docs/research excluded by design)."
}

switch ($Mode) {
  '--audit' { Check-Audit }
  '--hook'  {
    $payload = [Console]::In.ReadToEnd()
    if ($payload -notmatch 'git commit') { exit 0 }
    Check-Freshness
  }
  default   { Check-Freshness }
}
exit 0
