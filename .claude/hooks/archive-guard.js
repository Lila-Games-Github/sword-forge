#!/usr/bin/env node
// PreToolUse hook (Edit|Write): block edits under archive/ - historical-only content.
const path = require("path");
let raw = "";
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let file = "";
  try { file = (JSON.parse(raw).tool_input || {}).file_path || ""; } catch { process.exit(0); }
  const rel = path.relative(process.cwd(), path.resolve(file)).replace(/\\/g, "/");
  if (rel === "archive" || rel.startsWith("archive/")) {
    console.error("[archive-guard] BLOCKED: archive/ is historical-only (superseded by specs/). Do not edit it; record new decisions in specs/ or docs/.");
    process.exit(2);
  }
  process.exit(0);
});
