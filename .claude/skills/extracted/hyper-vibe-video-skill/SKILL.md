---
name: hyper-vibe-video-gen
description: >
  Full AI video generation pipeline for the Hyper Vibe Coding Course. Use this skill
  whenever the user wants to turn course curriculum into publishable lesson videos —
  including script writing, AI avatar generation (HeyGen/Synthesia/RunwayML), and
  upload automation. Trigger on any mention of: "generate a video", "create a lesson video",
  "curriculum to video", "course video", "HeyGen", "Synthesia", "video pipeline",
  "record a lesson", or "auto-generate course content". Also trigger when the user
  references a specific lesson, module, or section of CURRICULUM.md and wants video output.
  Always use this skill even if the user just says "make a video for lesson X".
---

# Hyper Vibe Video Generation Pipeline

Converts `docs/course/CURRICULUM.md` lesson content into published AI-generated lesson
videos via a 4-stage pipeline.

---

## Pipeline Overview

```
CURRICULUM.md  ──►  Script  ──►  AI Video  ──►  Upload
   (Stage 1)       (Stage 2)    (Stage 3)      (Stage 4)
```

**Scripts location**: `scripts/video/` (see bundled resources)
**Config file**: `config/video-config.json` (API keys, defaults)
**Output folder**: `assets/videos/`

---

## Stage 1 — Parse Curriculum

Read the target lesson from `docs/course/CURRICULUM.md`.

Extract per lesson:
- **Title** — the H2 or H3 heading
- **Learning objectives** — bullet list under "Objectives" or "You will learn"
- **Key concepts** — main body content
- **Code examples** — any fenced code blocks
- **Estimated duration** — from curriculum metadata if present, default 8 min

> ⚠️ If no lesson is specified, ask the user: "Which lesson number or title do you want to generate a video for?"

---

## Stage 2 — Generate Video Script

Use the extracted content to produce a structured script in this format:

### Script Template

```
LESSON: <title>
DURATION: <estimated minutes>
AVATAR: <avatar-id from config>
VOICE: <voice-id from config>

[HOOK — 0:00–0:30]
<Attention-grabbing opening. Reference a real dev pain point this lesson solves.>

[INTRO — 0:30–1:00]
<State the 3 learning objectives clearly. Use "By the end of this video, you'll...">

[SECTION 1 — 1:00–X:XX]
VISUAL: <describe screen content or slide — e.g. "VS Code with index.ts open">
NARRATION: <what the avatar says>

[SECTION 2 — ...]
...

[CODE DEMO — X:XX–X:XX]
VISUAL: <code walkthrough description>
NARRATION: <step-by-step explanation>

[SUMMARY — last 60 sec]
<Recap the 3 objectives. Tease next lesson.>

[CTA — final 15 sec]
<"Drop a comment with your biggest takeaway. See you in Lesson X.">
```

### Script Writing Rules (ND-first)
- Max sentence length: 20 words
- One concept per section — no concept stacking
- Use "we" not "you" — collaborative tone
- Include a micro-pause marker `[PAUSE]` after every key concept
- Code sections: narrate line by line, never jump ahead
- No jargon without a one-sentence definition immediately after

---

## Stage 3 — AI Video Generation

### Primary: HeyGen API

See `scripts/video/Invoke-HeyGen.ps1` for the full PowerShell implementation.

**Key parameters:**
| Parameter | Value |
|---|---|
| `avatar_id` | Set in `config/video-config.json` |
| `voice_id` | Set in `config/video-config.json` |
| `background` | `"hyper_vibe_bg"` (custom branded background) |
| `resolution` | `"1080p"` |
| `aspect_ratio` | `"16:9"` |
| `caption` | `true` — always enable captions (accessibility) |

**Workflow:**
1. POST script to `/v2/video/generate`
2. Poll `/v1/video_status.get?video_id=<id>` every 30s
3. On `status: completed` → download MP4 to `assets/videos/<lesson-slug>.mp4`

### Fallback: Synthesia

Use if HeyGen quota exceeded. See `scripts/video/Invoke-Synthesia.ps1`.
Key diff: Synthesia uses `scenes[]` array instead of a flat script — the PowerShell
script handles this conversion automatically.

### Fallback: RunwayML

Use for cinematic B-roll or intro/outro sequences only — not for full narrated lessons.
See `scripts/video/Invoke-RunwayML.ps1`.

---

## Stage 4 — Upload & Publish

See `scripts/video/Publish-CourseVideo.ps1`.

### Supported targets

| Target | When to use |
|---|---|
| **YouTube (unlisted)** | Default — embed in course platform |
| **Gumroad** | If lesson is a standalone paid preview |
| **Local `assets/videos/`** | Always — keep a local copy |

### YouTube upload (via `yt-dlp` + OAuth)

```powershell
# Handled by Publish-CourseVideo.ps1
# Uploads MP4, sets title/description from script metadata
# Sets privacy: unlisted (change to public on launch day)
```

### Metadata auto-generated from script:
- **Title**: `"Lesson X: <title> | Hyper Vibe Coding Course"`
- **Description**: First 3 sentences of HOOK + learning objectives list
- **Tags**: `["coding", "vibe coding", "AI dev", "neurodivergent", "lesson <N>"]`
- **Thumbnail**: Auto-generate via `scripts/video/New-Thumbnail.ps1`

---

## Best Practices

### Quality
- Always preview the first 30s before triggering full render
- Run captions through a spell-check pass — AI voices misread code terms
- Render a test with `test_mode: true` (free, watermarked) before paid render

### ND-First Video Design
- Captions: always on, large font, high contrast
- Max 6 words per caption line
- Avoid rapid cut edits — slow, deliberate transitions
- On-screen code: minimum 24pt font, use OpenDyslexic or JetBrains Mono
- Section headers as full-screen text cards between segments (reduce cognitive load)

### Cost Control
- HeyGen charges per minute of rendered video — keep lessons under 10 min
- Batch all lessons for a module before rendering to maximise quota
- Use `test_mode: true` for all script reviews

### File Naming Convention
```
assets/videos/
  course1-lesson01-intro-to-vibe-coding.mp4
  course1-lesson02-your-first-ai-agent.mp4
```

---

## Config File (`config/video-config.json`)

```json
{
  "heygen": {
    "api_key_env": "HEYGEN_API_KEY",
    "avatar_id": "YOUR_AVATAR_ID",
    "voice_id": "YOUR_VOICE_ID",
    "test_mode": true
  },
  "synthesia": {
    "api_key_env": "SYNTHESIA_API_KEY",
    "template_id": "YOUR_TEMPLATE_ID"
  },
  "youtube": {
    "client_secrets_env": "YOUTUBE_CLIENT_SECRETS_PATH",
    "default_privacy": "unlisted",
    "playlist_id": "YOUR_PLAYLIST_ID"
  },
  "defaults": {
    "resolution": "1080p",
    "captions": true,
    "font": "JetBrains Mono",
    "lesson_max_minutes": 10
  }
}
```

> 🔐 Never commit real API keys. All keys are loaded from environment variables.

---

## Bundled Scripts

| Script | Purpose |
|---|---|
| `scripts/video/Start-Videopipeline.ps1` | **Master runner** — full pipeline end to end |
| `scripts/video/Get-LessonScript.ps1` | Stage 1+2: parse curriculum → generate script |
| `scripts/video/Invoke-HeyGen.ps1` | Stage 3: submit to HeyGen, poll, download |
| `scripts/video/Invoke-Synthesia.ps1` | Stage 3 fallback: Synthesia |
| `scripts/video/Publish-CourseVideo.ps1` | Stage 4: upload to YouTube / Gumroad |
| `scripts/video/New-Thumbnail.ps1` | Generate branded thumbnail from lesson title |

---

## Quick Start (copy-paste)

```powershell
# Set your API key first
$env:HEYGEN_API_KEY = "your-key-here"

# Run full pipeline for Lesson 1
.\scripts\video\Start-VideoPipeline.ps1 -LessonNumber 1 -CurriculumPath "docs\course\CURRICULUM.md"
```
