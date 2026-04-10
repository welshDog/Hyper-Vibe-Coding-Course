# HeyGem Local Setup Guide

Free, unlimited AI avatar video generation — runs on your machine via Docker + ComfyUI.

Based on: https://github.com/billwuhao/Comfyui_HeyGem

---

## What you need

- **Windows 10/11** with WSL2 enabled
- **Docker Desktop** (AMD64) — downloads a 14GB image on first run
- **ComfyUI** installed locally
- **GPU recommended** — NVIDIA with CUDA. CPU works but is very slow.
- **Avatar video** — a 10–30 second MP4 of yourself speaking, 1080p, good lighting

---

## One-time setup (30–45 min, mostly waiting)

### 1. Install Docker Desktop

Download from https://www.docker.com/ (AMD64 version).
Start Docker Desktop. Leave it running whenever you generate videos.

### 2. Install ComfyUI

```bash
git clone https://github.com/comfyanonymous/ComfyUI.git
cd ComfyUI
pip install -r requirements.txt
```

### 3. Install the HeyGem node

```bash
cd ComfyUI/custom_nodes
git clone https://github.com/billwuhao/Comfyui_HeyGem.git
```

### 4. Install edge-tts (for natural British voice)

```bash
pip install edge-tts
```

### 5. Start ComfyUI

```bash
cd ComfyUI
python main.py --listen 0.0.0.0
```

ComfyUI runs at http://localhost:8188.
On first HeyGem node use, Docker pulls the 14GB image (~30 min).

---

## Record your avatar video

- 10–30 seconds of yourself speaking naturally
- 1080p, well lit, stable background
- Save as `avatar.mp4` in the repo root or any path you prefer
- You only need to record this **once** — it gets reused for all lessons

---

## Generate a lesson video

```powershell
# From repo root:
.\scripts\video\Start-VideoPipeline.ps1 `
    -LessonNumber 1 `
    -UseLocalHeyGem `
    -AvatarVideoPath ".\avatar.mp4" `
    -SkipUpload

# Output lands in: assets/videos/course1-lesson01-*.mp4
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `ComfyUI not reachable` | Start ComfyUI with `python main.py --listen 0.0.0.0` |
| Docker image not found | Open Docker Desktop, wait for HeyGem image to pull |
| TTS audio not created | Run `pip install edge-tts` and retry |
| Slow render (>20 min) | Normal on CPU — get CUDA GPU for 2–5 min renders |
| Bad lip sync | Re-record avatar video: steady head, clear speech, neutral background |

---

## Cost comparison

| Method | Cost | Speed | Quality |
|---|---|---|---|
| HeyGem local (this) | **Free** | 2–10 min/lesson | Excellent |
| HeyGen cloud API | ~£0.50–2/min | 5–15 min | Excellent |
| Record yourself (OBS) | Free | Real-time | Your call |
