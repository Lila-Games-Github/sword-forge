# Potion Craft — FTUE research (manifest)

Competitor FTUE teardown of **Potion Craft: Alchemist Simulator** (Steam appid 1210320), scoped to the tutorial / first day only. Used to inform the Sword Forge Path-Forge FTUE flow (`research/swordforge-ftue-flow.md`).

## Committed (text deliverables)
- `ftue-analysis.md` — the combined, source-tagged FTUE breakdown (read this first).
- `_sources.json` — provenance manifest (2 YouTube sources).
- `_knowledge_index.md` — coverage/index.
- `Videos/efNO5kAilxU_analysis/ftue-beatsheet.md` — yt-01, 123-frame timestamped beat sheet (0:00–4:05).
- `Videos/efNO5kAilxU_analysis/*.en.vtt` — yt-01 captions (near-empty; no commentary).
- `Videos/ZkqzK_NzzQg_analysis/ftue-insights.md` — yt-02, narrated-guide creator insights.
- `Videos/ZkqzK_NzzQg_analysis/transcript.txt` + `.en.vtt` — yt-02 full commentary transcript.

## NOT committed (see `.gitignore`)
Raw media, ~79 MB, regenerable:
- `Videos/efNO5kAilxU_analysis/efNO5kAilxU.mp4` (67 MB, first 4:05 only)
- `Videos/efNO5kAilxU_analysis/frames/` (123 JPGs @ 1 frame/2s)
- `Videos/*/*.info.json` (yt-dlp metadata dumps)

## Re-fetch (video-analysis skill)
```bash
# yt-01 primary (first 4:05, frames at 1/2s)
yt-dlp -f "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]" \
  --download-sections "*0-245" --merge-output-format mp4 \
  -o "efNO5kAilxU.%(ext)s" "https://www.youtube.com/watch?v=efNO5kAilxU"
ffmpeg -i efNO5kAilxU.mp4 -vf "fps=1/2,scale=854:-1" -q:v 3 frames/f_%05d.jpg
```

Sources: yt-01 [efNO5kAilxU](https://www.youtube.com/watch?v=efNO5kAilxU) (no-commentary walkthrough) · yt-02 [ZkqzK_NzzQg](https://www.youtube.com/watch?v=ZkqzK_NzzQg) (Dr Incompetent beginner guide).
