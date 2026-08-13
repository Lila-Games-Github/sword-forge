#!/usr/bin/env node
// PostToolUse hook (Edit|Write): warn when game code changes without a spec touch.
// - Edit to swordforgeV2.html while specs/game-design.md has no uncommitted change -> warn (exit 2, non-blocking).
// - Edit to index.html (V1, historical-only) -> warn (exit 2, non-blocking).
// Never blocks: PostToolUse exit 2 only feeds stderr back to the agent.
const { execSync } = require("child_process");
let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let file = "";
  try { file = (JSON.parse(raw).tool_input || {}).file_path || ""; } catch { process.exit(0); }
  const base = file.replace(/\\/g, "/").split("/").pop();
  if (base === "index.html" && /sword-forge/i.test(file)) {
    console.error("[spec-sync] index.html is V1, kept for HISTORICAL reference only. Canonical build = swordforgeV2.html. Confirm this V1 edit is intentional.");
    process.exit(2);
  }
  if (base === "swordforgeV2.html") {
    let dirty = "";
    try { dirty = execSync("git status --porcelain -- specs/game-design.md", { encoding: "utf8" }); } catch { process.exit(0); }
    if (!dirty.trim()) {
      console.error("[spec-sync] swordforgeV2.html changed but specs/game-design.md has no uncommitted change. If this touched a mechanic/number/system, update the spec in the SAME change (CLAUDE.md rule).");
      process.exit(2);
    }
  }
  process.exit(0);
});
