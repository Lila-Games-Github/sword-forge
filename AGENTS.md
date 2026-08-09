<!-- wiki-profile:start -->
## Code wiki

An LLM-maintained navigation layer lives under `docs/wiki/`, SUBORDINATE to the
spec chain. BEFORE answering an architecture question, editing an unfamiliar
subsystem, or locating where behavior lives, consult `docs/wiki/index.md` and run:

    python .claude/skills/wiki/scripts/search_wiki.py docs/wiki "<terms>"

Maintainer schema: `docs/wiki/README.md`. Pages are maps into the code, not canon;
the dated spec chain wins on any conflict.
<!-- wiki-profile:end -->
