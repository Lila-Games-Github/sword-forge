# LEARNINGS

Lessons from building Sword Forge.

- **Browser screenshot tools time out on this game** — the continuous ember/`requestAnimationFrame` loop keeps the page from going idle. Verify via the preview tools (`javascript_tool`, `read_console_messages`) instead; resize to mobile (375px) before measuring layout or the headless viewport reports width 0.
- **The preview static server drops between turns** — a `navigate` fails or the tab reverts to `file://`; restart with `preview_start` and re-`navigate` (same port, 5678).
- **Data-driven tutorial (`tutorialFlow` array) beats scattered flags** — dialogue steps, actions, and `waitAction` gates in one array; gameplay functions advance it by checking the current step's `waitAction`.
