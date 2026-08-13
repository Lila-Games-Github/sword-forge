# HANDOFF

Living session-to-session state for Sword Forge. Updated + pushed at each session close.
Durable narrative here; volatile per-PR state (PR URL, merged SHA, branch) goes in the
continuation prompt printed at close time.

## Current state (2026-08-10)

- **Status:** V2 (`swordforgeV2.html`, path-map furnace build + guided tutorial) is now the canonical build; `index.html` (V1) is historical but still the deployed GitHub Pages entry point. Promoting V2 to the site root is a pending decision.
- **Repo:** https://github.com/Lila-Games-Github/sword-forge (Pages: https://lila-games-github.github.io/sword-forge/)
- **In flight (branch `sword-forge/claude-setup-automation-audit`, uncommitted):** CLAUDE.md/README/ONBOARDING canon inversion to V2, `docs/agents/` skill config, code-wiki adoption (`docs/wiki/` + `.claude/skills/wiki/`), living-docs spine, guardrail hooks.

## Next steps

- Decide + execute V2 promotion to the Pages root (or keep dual-build).
- Write the V2 delta into `specs/game-design.md` (spec currently describes V1).
- Seed the code wiki's first ingest pass (`docs/wiki/README.md` procedure).
- LICENSE decision (skipped at scaffold time — company repo, default-MIT inappropriate).
